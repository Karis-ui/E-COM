import random
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy import select,update
import random
from datetime import datetime
import string
from app.models.rider import Rider
from app.models.delivery import Delivery,DeliveryStatus
from app.services.sms_service import send_sms

class RiderService:
    @staticmethod
    async def get_available_riders(db:AsyncSession,county:str,limit:int=10) -> list[dict]:
        query = select(Rider).where(Rider.county == county,Rider.is_active==True,Rider.is_available==True).limit(limit)
        result = await db.execute(query)
        riders = result.scalars().all()
        return riders
    
    @staticmethod
    async def assign_order_to_rider(db:AsyncSession,order_id:int,rider_id:int) -> dict:
        otp = ''.join(random.choices(string.digits,k=6))
        delivery = Delivery(
            order_id=order_id,
            rider_id=rider_id,
            status=DeliveryStatus.ASSIGNED,
            assigned_at=datetime.now(),
            delivery_otp=otp
        )
        db.add(delivery)
        await db.execute(
            update(Rider).where(Rider.id == rider_id).values(is_available=False)
        )
        await db.commit()
        await db.refresh(delivery)
        rider = await db.get(Rider,rider_id)
        await send_sms(
            phone=rider.phone,
            message=f"You have been assigned order {order_id}. OTP: {otp}. Do not share this OTP with anyone."
        )
        return delivery
    
    @staticmethod
    async def update_deliver_status(db:AsyncSession,deliver_id:int,status:DeliveryStatus,location:dict=None)->dict:
        update_data = {"status":status}

        if status == DeliveryStatus.PICKED_UP:
            update_data["picked_up_at"] = datetime.now()
        elif status == DeliveryStatus.IN_TRANSIT:
            update_data["out_for_delivery_at"] = datetime.now()
        elif status == DeliveryStatus.DELIVERED:
            update_data["delivered_at"] = datetime.now()
            update_data["is_available"] = True
        elif status == DeliveryStatus.CANCELLED:
            update_data["is_available"] = True
        
        if location:
            update_data["current_latitude"] = location.get("latitude")
            update_data["current_longitude"] = location.get("longitude")
            update_data["last_location_update"] = datetime.now()
        if status == DeliveryStatus.DELIVERED:
            delivery = await db.get(Delivery,deliver_id)
            await db.execute(
                update(Rider).where(Rider.id == delivery.rider_id).values(is_available=True,total_deliveries=Rider.total_deliveries+1)
            )
        
        await db.commit()
        return {"success":True,"message":"Delivery status updated successfully"}