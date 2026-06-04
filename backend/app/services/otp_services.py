from sqlalchemy import select
from sqlalchemy import update
import hashlib
import random
from datetime import datetime,timedelta
from fastapi import HTTPException,status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.otp import OTP
from app.config import settings
from app.services.sms_service import send_sms

class OTPService:
    @staticmethod
    def generate_otp():
        return f"{random.randint(100000, 999999)}"
        
    @staticmethod
    async def send_otp(phone: str, purpose: str = "checkout",db:AsyncSession = None):
        otp = OTPService.generate_otp()
        hashed_otp = OTPService.hash_otp(otp)
        if db:
            await db.execute(update(OTP).where(OTP.phone == phone, OTP.purpose == purpose,OTP.used == False).values(used=True))
            otp = OTP(phone=phone,code_hash=hashed_otp,expires_at=datetime.now() + timedelta(minutes=5),is_verified=False,used=False,attempts=0)
            db.add(otp)
            await db.commit()
        
        message = f"ElectroShop: Your {purpose} OTP is {otp}. Valid for 5 minutes"
        await send_sms(phone=phone,message=message,sender_id=settings.AT_SENDER_ID)
        return otp

    @staticmethod
    async def hash_otp(otp: str):
        return hashlib.sha256(otp.encode()).hexdigest()
        
    @staticmethod
    async def verify_otp(phone: str, otp: str, purpose: str = "checkout",db:AsyncSession=None) -> bool:
        hashed_otp = OTPService.hash_otp(otp)
        result = await db.execute(
            select(OTP).where(
                OTP.phone == phone,
                OTP.purpose == purpose,
                OTP.used == False,
                OTP.expires_at > datetime.now(),
                OTP.code_hash == hashed_otp
            )
        )
        otp_record = result.scalar_one_or_none()
        if not otp_record:
            return HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,detail="Invalid OTP"
            )
        if otp_record.is_verified:
            return HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,detail="OTP already verified"
            )
        if otp_record.expires_at < datetime.now():
            return HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,detail="OTP expired"
            )
        if otp.code_hash != hash(otp):
            return HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,detail="Invalid OTP"
            )
        otp.is_verified = True
        await db.commit()
        return True