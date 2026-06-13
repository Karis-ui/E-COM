from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,update
from app.models.loyalty import LoyaltyProgram
from app.models.user import UserProfile
from datetime import datetime

class LoyaltyService:
    POINTS_PER_ORDER = 1
    POINTS_PER_REVIEW = 10
    POINTS_PER_REFERRAL = 100
    
    def __init__(self,db:AsyncSession):
        self.db = db
        self.loyalty_programs = db["loyalty_programs"]
        self.user_profiles = db["user_profiles"]

    @staticmethod
    async def get_user_points(db:AsyncSession,user_id:int)->int:
        result = await db.execute(
            select(UserProfile.points).where(UserProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()
        return profile.points if profile else 0

    @staticmethod
    async def add_points(user_id:int,points:int,source_type:str,source_id:str,description:str,db:AsyncSession)->int:
        current_balance = await LoyaltyService.get_user_points(db,user_id)
        transaction = LoyaltyProgram(
            user_id=user_id,
            points=points,
            balance_after=current_balance + points,
            balance_before=current_balance,
            source_type=source_type,
            source_id=source_id,
            description=description,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        await db.add(transaction)
        await db.execute(
            update(UserProfile).where(UserProfile.user_id == user_id).values(
                points=current_balance + points
            )
        )
        await db.commit()
        await db.refresh(transaction)
        return transaction.points

    @staticmethod
    async def redeem_points(user_id:int,points:int,order_id:int,db:AsyncSession)->bool:
        current_balance = await LoyaltyService.get_user_points(db,user_id)
        new_balance = current_balance - points
        if new_balance < 0:
            raise ValueError("Insufficient points")
        transaction = LoyaltyProgram(
            user_id=user_id,
            points=-points,
            balance_after=new_balance,
            balance_before=current_balance,
            source_type="order",
            source_id=order_id,
            description=f"Redeemed {points} points for order {order_id}",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        await db.add(transaction)
        await db.execute(
            update(UserProfile).where(UserProfile.user_id == user_id).values(
                points=new_balance
            )
        )
        await db.commit()
        await db.refresh(transaction)
        return True
    
    @staticmethod
    async def add_order_points(user_id:int,order_id:int,db:AsyncSession,order_total:float):
        points = int(order_total/100)*2
        if points < 0:
            await LoyaltyService.add_points(
                user_id=user_id,
                points=points,
                source_type="order",
                source_id=order_id,
                description=f"Order {order_id} completed",
                db=db
            )
        return await LoyaltyService.add_points(
            user_id=user_id,
            points=points,
            source_type="order",
            source_id=order_id,
            description=f"Order {order_id} completed",
            db=db
        )