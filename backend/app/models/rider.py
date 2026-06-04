from sqlalchemy import Column,Integer,String,Boolean,DateTime,ForeignKey
from app.database.postgres import Base
from sqlalchemy.sql import func

class Rider(Base):
    __tablename__ = "riders"
    id = Column(Integer,primary_key=True,index=True)
    full_name = Column(String,index=True)
    phone = Column(String,unique=True,index=True)
    email = Column(String,unique=True,index=True)

    total_deliveries = Column(Integer,default=0)
    rating = Column(Float,default=0.0)
    total_earnings = Column(Float,default=0.0)
    
    vehicle_type = Column(String)
    vehicle_registration = Column(String)
    license_number = Column(String)
    is_available = Column(Boolean,default=True)
    is_active = Column(Boolean,default=True)

    current_latitude = Column(Float)
    current_longitude = Column(Float)
    last_location_update = Column(DateTime,default=func.now())
    hired_at = Column(DateTime,default=func.now())
    created_at = Column(DateTime,default=func.now())
    updated_at = Column(DateTime,default=func.now(),onupdate=func.now())
    orders = relationship("Order",back_populates="rider")