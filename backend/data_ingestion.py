import pandas as pd
from sqlalchemy import create_engine, exists
from sqlalchemy.orm import sessionmaker
from models import Base, Counts, SystemHealth
from dotenv import load_dotenv
import os
import logging

load_dotenv()

# Set up logging
log_file_path = '/app/data_ingestion.log'
logging.basicConfig(filename=log_file_path, level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def ensure_log_file_exists():
    try:
        with open(log_file_path, 'a'):
            os.utime(log_file_path, None)
        logging.info("Log file created or already exists")
    except Exception as e:
        print(f"Error creating log file: {e}")

ensure_log_file_exists()

print("Starting data ingestion script")
logging.info("Starting data ingestion script")

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Database URL: {DATABASE_URL}")
logging.debug(f"Database URL: {DATABASE_URL}")

# Create the database engine
try:
    engine = create_engine(DATABASE_URL)
    print("Database engine created successfully")
    logging.info("Database engine created successfully")
except Exception as e:
    print(f"Error creating database engine: {e}")
    logging.error(f"Error creating database engine: {e}")
    raise

# Create the session
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

# Create tables if they don't exist
try:
    Base.metadata.create_all(engine)
    print("Database tables created successfully")
    logging.info("Database tables created successfully")
except Exception as e:
    print(f"Error creating database tables: {e}")
    logging.error(f"Error creating database tables: {e}")
    raise

def data_exists_for_date_and_sensor(date, sensor_id):
    """Check if data already exists for the given date and sensor_id."""
    return session.query(exists().where(Counts.sensor_id == sensor_id).where(func.date(Counts.time) == date)).scalar()

def load_counts_data(csv_file):
    logging.debug(f"Loading counts data from {csv_file}")
    if not os.path.exists(csv_file):
        logging.error(f"File not found: {csv_file}")
        return

    try:
        counts_df = pd.read_csv(csv_file)
        for index, row in counts_df.iterrows():
            date = row['time'].split(' ')[0]
            if data_exists_for_date_and_sensor(date, row['sensor_id']):
                logging.info(f"Data already exists for date: {date} and sensor_id: {row['sensor_id']}. Skipping row.")
                continue

            count_record = Counts(
                time=row['time'],
                class_=row['class'],
                sensor_id=row['sensor_id'],
                approach=row['approach']
            )
            session.add(count_record)
        session.commit()
        logging.info("Counts data loaded successfully")
    except Exception as e:
        session.rollback()
        logging.error(f"Error loading counts data: {e}")

def load_system_health_data(csv_file):
    logging.debug(f"Loading system health data from {csv_file}")
    if not os.path.exists(csv_file):
        logging.error(f"File not found: {csv_file}")
        return

    try:
        system_df = pd.read_csv(csv_file)
        for index, row in system_df.iterrows():
            date = row['time'].split('T')[0]
            if data_exists_for_date_and_sensor(date, row['sensorId']):
                logging.info(f"System health data already exists for date: {date} and sensor_id: {row['sensorId']}. Skipping row.")
                continue

            system_record = SystemHealth(
                time=row['time'],
                sensor_id=row['sensorId']
            )
            session.add(system_record)
        session.commit()
        logging.info("System health data loaded successfully")
    except Exception as e:
        session.rollback()
        logging.error(f"Error loading system health data: {e}")

if __name__ == "__main__":
    load_counts_data('/app/data_counts.csv')  # Ensure the correct path to your CSV file
    load_system_health_data('/app/data_system.csv')  # Ensure the correct path to your CSV file
    print("Data ingestion script completed")
    logging.info("Data ingestion script completed")
