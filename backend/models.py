from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Counts(Base):
    __tablename__ = 'counts'
    id = Column(Integer, primary_key=True, index=True)
    time = Column(DateTime, index=True)
    class_ = Column(String, index=True)
    sensor_id = Column(Integer, index=True)
    approach = Column(String, index=True)

class SystemHealth(Base):
    __tablename__ = 'system_health'
    id = Column(Integer, primary_key=True, index=True)
    time = Column(DateTime, index=True)
    sensor_id = Column(Integer, index=True)

class Configuration(Base):
    __tablename__ = 'configuration'
    id = Column(Integer, primary_key=True, index=True)
    counts_rate = Column(Float)
    vehicle_probability = Column(Float)
    pedestrian_probability = Column(Float)
    downtime_probability = Column(Float)
    traffic_pattern = Column(String)
    timestamp = Column(DateTime, index=True)
