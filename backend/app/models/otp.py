from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.database.postgres import Base
from sqlalchemy.sql import func

class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), index=True, nullable=False)
    code_hash = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    purpose = Column(String(50), nullable=False,default="checkout")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)