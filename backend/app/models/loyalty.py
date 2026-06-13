from sqlalchemy import Column,Integer,String,Boolean,DateTime,ForeignKey
from app.database.postgres import Base
from sqlalchemy.sql import func

class LoyaltyProgram(Base):
    __tablename__ = "loyalty_programs"
    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    name = Column(String(100),nullable=False)
    description = Column(String(255),nullable=False)
    points = Column(Integer,nullable=False)
    balance_before = Column(Integer,nullable=False)
    balance_after = Column(Integer,nullable=False)
    source_type = Column(String(50),nullable=False)
    source_id = Column(String(50),nullable=False)
    created_at = Column(DateTime(timezone=True),server_default=func.now())
    updated_at = Column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())
