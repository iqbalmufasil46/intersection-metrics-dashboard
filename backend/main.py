from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi_socketio import SocketManager
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine, func
from models import Base, Counts, SystemHealth, Configuration
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
import logging
import json

# Load environment variables
load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# FastAPI app
app = FastAPI()

# WebSocket manager
sio = SocketManager(app=app, mount_location='/ws')

# CORS middleware
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database engine and session
engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models
class CountsResponse(BaseModel):
    time: datetime
    class_: str
    sensor_id: int
    approach: str

class SystemHealthResponse(BaseModel):
    time: datetime
    sensor_id: int

class ConfigurationResponse(BaseModel):
    counts_rate: float
    vehicle_probability: float
    pedestrian_probability: float
    downtime_probability: float
    traffic_pattern: str

class DataGapsResponse(BaseModel):
    start_time: datetime
    end_time: datetime
    duration: str

class HourlyDataResponse(BaseModel):
    hour: str  # Changed to string
    car_nb: int
    car_sb: int
    car_eb: int
    car_wb: int
    truck_nb: int
    truck_sb: int
    truck_eb: int
    truck_wb: int
    ped_nb: int
    ped_sb: int
    ped_eb: int
    ped_wb: int

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post('/api/ingest/counts')
async def ingest_counts(data: list[CountsResponse], db: Session = Depends(get_db)):
    try:
        db.bulk_insert_mappings(Counts, [record.dict() for record in data])
        db.commit()
        for record in data:
            await sio.emit('counts_update', json.loads(record.json()))
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error ingesting counts: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post('/api/ingest/system_health')
async def ingest_system_health(data: list[SystemHealthResponse], db: Session = Depends(get_db)):
    try:
        db.bulk_insert_mappings(SystemHealth, [record.dict() for record in data])
        db.commit()
        for record in data:
            await sio.emit('system_health_update', json.loads(record.json()))
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error ingesting system health: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post('/api/ingest/configure')
async def ingest_configure(data: ConfigurationResponse, db: Session = Depends(get_db)):
    try:
        config = Configuration(
            counts_rate=data.counts_rate,
            vehicle_probability=data.vehicle_probability,
            pedestrian_probability=data.pedestrian_probability,
            downtime_probability=data.downtime_probability,
            traffic_pattern=data.traffic_pattern,
            timestamp=datetime.utcnow()
        )
        db.add(config)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error ingesting configuration: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get('/api/counts', response_model=list[CountsResponse])
def get_counts(date: str, sensor: int, approach: str = Query('All'), limit: int = Query(20), offset: int = Query(0), db: Session = Depends(get_db)):
    query = db.query(Counts).filter(
        func.date(Counts.time) == date,
        Counts.sensor_id == sensor
    )
    if approach != 'All':
        query = query.filter(Counts.approach == approach)

    counts = query.offset(offset).limit(limit).all()
    return [CountsResponse(time=c.time, class_=c.class_, sensor_id=c.sensor_id, approach=c.approach) for c in counts]

@app.get('/api/pedestrian_counts', response_model=list[CountsResponse])
def get_pedestrian_counts(date: str, sensor: int, approach: str = Query('All'), limit: int = Query(20), offset: int = Query(0), db: Session = Depends(get_db)):
    query = db.query(Counts).filter(
        func.date(Counts.time) == date,
        Counts.sensor_id == sensor,
        Counts.class_ == 'pedestrian'
    )
    if approach != 'All':
        query = query.filter(Counts.approach == approach)

    pedestrian_counts = query.offset(offset).limit(limit).all()
    return [CountsResponse(time=c.time, class_=c.class_, sensor_id=c.sensor_id, approach=c.approach) for c in pedestrian_counts]

@app.get('/api/data_gaps', response_model=list[DataGapsResponse])
def get_data_gaps(date: str, sensor: int, db: Session = Depends(get_db)):
    system_health = db.query(SystemHealth).filter(
        func.date(SystemHealth.time) == date,
        SystemHealth.sensor_id == sensor
    ).order_by(SystemHealth.time).all()

    gaps = []
    for i in range(1, len(system_health)):
        previous_time = system_health[i-1].time
        current_time = system_health[i].time
        duration = current_time - previous_time

        if duration > timedelta(minutes=5):
            gaps.append({
                "start_time": previous_time,
                "end_time": current_time,
                "duration": str(duration)
            })
    return gaps

@app.get('/api/hourly_data', response_model=dict)
def get_hourly_data(date: str, sensor: int, approach: str = Query('All'), class_: str = Query('All'), limit: int = Query(20), offset: int = Query(0), db: Session = Depends(get_db)):
    try:
        hourly_data = []
        total = 24  # Since we're dealing with hourly data for a single day, we always have 24 hours.
        for hour in range(offset, offset + limit):
            start_time = datetime.strptime(date, "%Y-%m-%d") + timedelta(hours=hour)
            end_time = start_time + timedelta(hours=1)

            query = db.query(
                Counts.class_,
                Counts.approach,
                func.count(Counts.id).label('count')
            ).filter(
                Counts.time >= start_time,
                Counts.time < end_time,
                Counts.sensor_id == sensor
            )

            if approach != 'All':
                query = query.filter(Counts.approach == approach)
            if class_ != 'All':
                query = query.filter(Counts.class_ == class_)

            data = query.group_by(Counts.class_, Counts.approach).all()

            hourly_record = {
                "hour": start_time.strftime('%d-%m-%Y %I:%M %p'),  # Format to string
                "car_nb": 0,
                "car_sb": 0,
                "car_eb": 0,
                "car_wb": 0,
                "truck_nb": 0,
                "truck_sb": 0,
                "truck_eb": 0,
                "truck_wb": 0,
                "ped_nb": 0,
                "ped_sb": 0,
                "ped_eb": 0,
                "ped_wb": 0
            }

            logger.info(f"Data for hour {hour}: {data}")

            for record in data:
                key = f"{record.class_}_{record.approach.lower()}"
                if key in hourly_record:
                    hourly_record[key] = record.count
                else:
                    logger.warning(f"Unexpected key '{key}' encountered.")

            hourly_data.append(hourly_record)
        return {"data": hourly_data, "total": total}
    except Exception as e:
        logger.error(f"Error fetching hourly data: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post('/api/ingest')
def ingest_data(data: list[CountsResponse], db: Session = Depends(get_db)):
    try:
        db.bulk_insert_mappings(Counts, [record.dict() for record in data])
        db.commit()
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error ingesting data: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

