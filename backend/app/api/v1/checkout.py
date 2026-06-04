from pydantic import BaseModel,Field
from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import get_current_user
from app.database.postgres import get_db
from app.database.mongodb import get_mongo_db
from app.models.user import User
from app.models.user import User
from app.services.sms_service import send_sms
from app.services.otp_services import OTPService
from app.services.cart_service import CartService
from app.core.security import create_access_token
from datetime import datetime,timedelta
from app.models.user import UserProfile
from app.api.v1.cart import get_cart_id
from app.models.user import User
import random

router = APIRouter()

class PhoneRequest(BaseModel):
    phone:str = Field(...,pattern=r'^07[0-9]{8}$',description="Kenyan Phone Number")

class OTPRequest(BaseModel):
    phone:str = Field(...,pattern=r'^07[0-9]{8}$',description="Kenyan Phone Number")
    otp:str = Field(...,pattern=r'^[0-9]{6}$',description="6 Digit OTP")

class DeliveryDetailsRequest(BaseModel):
    full_name:str = Field(...,min_length=2,max_length=50)
    email:str = Field(...,pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",description="Email Address")
    address:str = Field(...,min_length=5,max_length=255)
    county: str = Field(...,min_length=2,max_length=50)
    city:str = Field(...,min_length=2,max_length=50)
    delivery_instructions:str = Field(...,min_length=20,max_length=255)
    
class CheckoutResponse(BaseModel):
    success:bool
    message:str
    access_token: str=None
    user_id:int=True
    is_new_user: bool=None
    
class CheckoutConfirmRequest(BaseModel):
    phone:str = Field(...,pattern=r'^07[0-9]{8}$',description="Kenyan Phone Number")
    otp:str = Field(...,pattern=r'^[0-9]{6}$',description="6 Digit OTP")
    delivery_details:DeliveryDetailsRequest
    payment_method:str = Field(...,pattern="^cash|mpesa|visa|mastercard$",description="Payment Method")
    
@router.post("/initiate")
async def initiate_checkout(request:PhoneRequest,db:AsyncSession=Depends(get_db)):
    result = await db.execute(select(User).where(User.phone == request.phone))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            phone = request.phone,
            auth_method = "otp",
            is_active = True,
            is_verified = False,
            role = "customer",
            created_at = datetime.now(),
            updated_at = datetime.now()
        )
        db.ass(user)
        await db.commit()
        await db.refresh(user)
        is_new_user = True
    else:
        is_new_user = False
    
    await OTPService.send_otp(phone=request.phone,purpose="checkout",db=db)
    return CheckoutResponse(
        success=True,
        message="OTP sent successfully",
        user_id=user.id,
        is_new_user=is_new_user
    )

@router.post("/verify")
async def verify_checkout_otp(request:OTPRequest,db:AsyncSession=Depends(get_db)):
    await OTPService.verify_otp(
        phone=request.phone,
        otp=request.otp,
        purpose="checkout",
        db=db
    )

    result = await db.execute(
        select(User).where(User.phone == request.phone)
    )
    user = result.scalar_one_or_none()
    if not user.phone_verified:
        user.phone_verified = True
        user.is_active = True
        await db.commit()
        await db.refresh(user)
    access_token = create_access_token(
        data={"sub":str(user.id),"phone":request.phone},
        expires_delta=timedelta(hours=2)
        )
    return CheckoutResponse(
        success=True,
        message="OTP verified successfully",
        access_token=access_token,
        user_id=user.id,
        is_new_user=False
    )
    return {
        "success": True,
        "message": "OTP verified successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "needs_details": not user.first_name  # New users need to fill details
    }

@router.post("/confirm")
async def confirm_checkout(request:CheckoutConfirmRequest,current_user:dict=Depends(get_current_user),cart_id:str=Depends(get_cart_id),db=Depends(get_db),mongo_db=Depends(get_mongo_db)):
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalar_one()

    if not user.first_name:
        name_parts = request.full_name.strip().split(' ',1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ""
        user.email = request.email
        profile = await db.execute(select(UserProfile).where(UserProfile.user_id == user.id))
        profile = profile.scalar_one_or_none()
        if not profile:
            profile = UserProfile(
                user_id=user.id,
            )
            db.add(profile)
        profile.address = request.address
        profile.city = request.city
        profile.county = request.county
        await db.commit()
        await db.refresh(user)
    
    cart = await CartService.get_cart(cart_id)
    if not cart["items"]:
        raise HTTPException(status_code=400,detail="Cart is empty")
    delivery_fee = 150 if request.delivery_details.county == "Nairobi" else 250
    sub_total = cart["total_price"]
    total_amount = sub_total + delivery_fee
    
    order_data = {
        "user_id": user.id,
        "order_number": f"ES-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
        "customer_name": request.delivery_details.full_name,
        "customer_email": request.delivery_details.email,
        "customer_phone": user.phone,
        "county": request.delivery_details.county,
        "city": request.delivery_details.city,
        "address": request.delivery_details.address,
        "delivery_instructions": request.delivery_details.delivery_instructions,
        "items": cart["items"],
        "subtotal": sub_total,
        "delivery_fee": delivery_fee,
        "total": total_amount,
        "payment_method": request.payment_method,
        "status": "pending",
        "payment_status": "pending"
    }
    return {
        "success": True,
        "message": "Order ready for payment",
        "order_data": order_data,
        "payment":{
            "method":request.payment_method,
            "amount":total_amount,
            "currency":"KES",
            "instructions":"Proceed to payment"
        }
    }

@router.post("/details")
async def save_delivery_details(request:DeliveryDetailsRequest,current_user:dict=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalar_one()
    name_parts = request.full_name.strip().split(' ',1)
    user.first_name = name_parts[0]
    user.last_name = name_parts[1] if len(name_parts) > 1 else ""
    user.email = request.email
    profile = await db.execute(select(UserProfile).where(UserProfile.user_id == user.id))
    profile = profile.scalar_one_or_none()
    if not profile:
        profile = UserProfile(
            user_id=user.id,
        )
        db.add(profile)
    profile.address = request.address
    profile.city = request.city
    profile.county = request.county
    await db.commit()
    return {
        "success": True,
        "message": "Delivery details saved successfully",
        "user_id": user.id,
        "is_new_user": False
    }
    