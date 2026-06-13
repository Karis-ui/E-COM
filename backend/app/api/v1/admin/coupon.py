from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import get_db
from app.core.security import get_current_user,get_coupon_service
from app.models.coupon import Coupon
from app.services.coupon_service import CouponService
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from sqlalchemy import select,update

router = APIRouter(prefix="/admin/coupons",tags=["Admin - Coupons"])

class CouponCreate(BaseModel):
    code:str
    discount_type:str
    discount_value:int
    min_order_amount:int
    max_discount_amount:int
    usage_limit:Optional[int] = None
    limit_per_user:Optional[int] = None
    valid_from:datetime
    valid_until:datetime
    is_active:bool

class CouponUpdate(BaseModel):
    code:Optional[str]=None
    discount_type:Optional[str]=None
    discount_value:Optional[int]=None
    min_order_amount:Optional[int]=None
    max_discount_amount:Optional[int]=None
    usage_limit:Optional[int]=None
    limit_per_user:Optional[int]=None
    valid_from:Optional[datetime]=None
    valid_until:Optional[datetime]=None
    is_active:Optional[bool]=None

@router.post("/",response_model=dict,status_code=status.HTTP_201_CREATED)
async def create_coupon(coupon_data:dict,current_user = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to create a coupon")
    
    result = await db.execute(select(Coupon.code).where(Coupon.code == coupon_data["code"]))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Coupon code already exists")
    
    coupon = Coupon(
        code = coupon_data["code"],
        discount_type = coupon_data["discount_type"],
        discount_value = coupon_data["discount_value"],
        min_order_amount = coupon_data["min_order_amount"],
        max_discount_amount = coupon_data["max_discount_amount"],
        usage_limit = coupon_data["usage_limit"],
        limit_per_user = coupon_data["limit_per_user"],
        valid_from = coupon_data["valid_from"],
        valid_until = coupon_data["valid_until"],
        is_active = coupon_data["is_active"]
    )
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon
    return coupon

@router.get("/{coupon_id}",response_model=dict)
async def get_coupon_by_id(coupon_id:str,service:CouponService = Depends(get_coupon_service)):
    coupon = await service.get_coupon_by_id(coupon_id)
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Coupon not found")
    return coupon

@router.get("/",response_model=list[dict])
async def get_all_coupons(is_active:Optional[bool]=None,db:AsyncSession = Depends(get_db),current_user:dict=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to get all coupons")
    if is_active is not None:
        result = await db.execute(select(Coupon).where(Coupon.is_active == is_active))
    else:
        result = await db.execute(select(Coupon).order_by(Coupon.created_at.desc()))
    coupons = result.scalars().all()
    return[
        {
            "id":coupon.id,
            "code":coupon.code,
            "discount_type":coupon.discount_type,
            "discount_value":coupon.discount_value,
            "min_order_amount":coupon.min_order_amount,
            "max_discount_amount":coupon.max_discount_amount,
            "usage_limit":coupon.usage_limit,
            "limit_per_user":coupon.limit_per_user,
            "valid_from":coupon.valid_from,
            "valid_until":coupon.valid_until,
            "is_active":coupon.is_active,
            "created_at":coupon.created_at,
            "updated_at":coupon.updated_at
        }
        for coupon in coupons
    ]

@router.get("/{coupon_id}/toggle")
async def togggle_common_status(
    coupon_id:str,
    coupon_data:CouponUpdate,
    current_user = Depends(get_current_user),
    db:AsyncSession = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to toggle a coupon")
    
    coupon = await db.execute(select(Coupon).where(Coupon.id == coupon_id).values(is_active = not Coupon.is_active))
    coupon = coupon.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Coupon not found")
    await db.commit()
    await db.refresh(coupon)
    return {"message":f"Coupon {'activated' if coupon.is_active else 'deactivated'} successfully"}

@router.put("/{coupon_id}",response_model=dict)
async def update_coupon(coupon_id:str,update_data:dict,current_user = Depends(get_current_user),service:CouponService = Depends(get_coupon_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to update a coupon")
    
    coupon = await service.update_coupon(coupon_id,update_data)
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Coupon not found")
    return coupon

@router.delete("/{coupon_id}",response_model=dict)
async def delete_coupon(coupon_id:str,current_user = Depends(get_current_user),service:CouponService = Depends(get_coupon_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to delete a coupon")
    
    result = await service.delete_coupon(coupon_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Coupon not found")
    return {"message":"Coupon deleted successfully"}