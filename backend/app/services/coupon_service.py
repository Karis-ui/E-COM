from sqlalchemy import delete
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,and_,or_
from app.models.coupon import Coupon,CouponUsage
from datetime import datetime
import json

class CouponService:
    def __init__(self,db:AsyncSession):
        self.db = db
        self.coupons = db["coupons"]
        self.coupon_usage = db["coupon_usage"]

    async def get_coupon(self,code:str):
        result = await self.db.execute(
            select(Coupon).where(Coupon.code == code)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def validate_coupon(db:AsyncSession,code:str,user_id:str,cart_total:float,cart_items:list)->dict:
        resullt = await db.execute(
            select(Coupon).where(Coupon.code == code.upper(),Coupon.is_active==True,Coupon.valid_from <= datetime.utcnow(),Coupon.valid_until >= datetime.utcnow())
        )
        coupon = resullt.scalar_one_or_none()
        if not coupon:
            raise ValueError("Coupon not found.Maybe it is invalid or expired")
        
        if cart_total<coupon.min_order_amount:
            return{
                "valid":False,
                "message":f"Minimum order of KSh {coupon.min_order_amount:,.0f} required"
            }
        
        if coupon.max_discount_amount and coupon.max_discount_amount<coupon.discount_value:
            return{
                "valid":False,
                "message":f"Maximum discount of KSh {coupon.max_discount_amount:,.0f} applies"
            }
        
        if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
            return{"valid":False,"message":"Coupon has reached its usage limit"}
            usage_result = await db.execute(
                select(CouponUsage).where(and_(CouponUsage.user_id == user_id,CouponUsage.coupon_id == coupon.id))
            )
            count = usage_result.scalars().all()
            if len(count) >= coupon.per_user_limit:
                return{
                    "valid":False,
                    "message":f"You have already used this coupon {coupon.per_user_limit} times"
                }
            if coupon.discount_type == "percentage":
                discount = cart_total * (coupon.discount_value / 100)
                if coupon.max_discount_amount:
                    discount = min(discount,coupon.max_discount_amount)
            else:
                discount = min(coupon.discount_value,cart_total)
            
            return {"valid":True,"message":"Coupon is valid","discount":discount}
    
    @staticmethod
    async def apply_coupon(db:AsyncSession,coupon_id:int,user_id:int,order_total:float,discount:float):
        result = await db.execute(
            update(Coupon).where(Coupon.id == coupon_id).values(times_used=Coupon.times_used+1)
        )
        coupon = CouponUsage(
            user_id=user_id,
            coupon_id=coupon_id,
            discount_amount=discount,
            coupon_code=coupon.code,
            used_at=datetime.utcnow()
        )
        await db.add(coupon)
        await db.commit()
        return discount
    
    async def remove_coupon(self,coupon:Coupon,user_id:int):
        coupon.times_used -= 1
        await self.db.execute(
            update(Coupon).where(Coupon.id == coupon.id).values(
                times_used=coupon.times_used
            )
        )
        await self.db.execute(
            delete(CouponUsage).where(CouponUsage.user_id == user_id,CouponUsage.coupon_id == coupon.id)
        )
        await self.db.commit()
        return True