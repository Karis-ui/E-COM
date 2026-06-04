from sqlalchemy import Column,Integer,String,Boolean,DateTime,Enum,DECIMAL
from sqlalchemy.sql import func
from app.database.postgres import Base
import enum

class UserRole(str,enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    RIDER = "rider"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer,primary_key=True,index=True)
    email = Column(String(255),unique=True,index=True)
    phone = Column(String(15),unique=True,index=True)
    password_hash = Column(String(255))
    first_name = Column(String(100))
    last_name = Column(String(100))
    role = Column(Enum(UserRole),default=UserRole.CUSTOMER)

    is_active = Column(Boolean,default=True)
    is_staff = Column(Boolean,default=False)
    email_verified = Column(Boolean,default=False)
    phone_verified = Column(Boolean,default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime,default=func.now())
    updated_at = Column(DateTime,default=func.now(),onupdate=func.now())

    auth_method = Column(String(50),default="otp")
    last_checkout = Column(DateTime(timezone=True))
    total_orders = Column(Integer,default=0)
    total_spent = Column(DECIMAL(10,2),default=0)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,nullable=False,unique=True)
    address = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    postal_code = Column(String(10))
    county = Column(String(100))
    total_orders = Column(Integer,default=0)
    total_spent = Column(DECIMAL(10,2),default=0)
    loyalty_points = Column(Integer,default=0)