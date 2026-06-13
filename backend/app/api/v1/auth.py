from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, validator
import re
from app.database.postgres import get_db
from app.models.user import User
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    get_current_user
)
from app.core.security import decode_token,create_access_token
from app.services.otp_services import OTPService
from app.services.sms_service import send_sms
from app.models.user import UserProfile
from app.schemas.user import UserCreate,LoginRequest,TokenResponse,UserResponse

router = APIRouter(prefix='/auth',tags=['Authentication'])

@router.post("/register",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
async def register(user:UserCreate,db:AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email) | (User.phone == user.phone))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    new_user = User(
        email=user.email,
        phone=user.phone,
        password_hash=get_password_hash(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login",response_model=TokenResponse)
async def login(user:LoginRequest,db:AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email) | (User.phone == user.phone))
    existing_user = result.scalar_one_or_none()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(user.password,existing_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not existing_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    existing_user.last_login = datetime.utcnow()
    await db.commit()
    access_token = create_access_token({"sub":str(existing_user.id)})
    refresh_token = create_refresh_token({"sub":str(existing_user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.from_orm(existing_user)
    )

@router.get("/me",response_model=UserResponse)
async def get_current_user(current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    profile_result = await db.execute(select(UserProfile).where(UserProfile.user_id == user.id))
    profile = profile_result.scalar_one_or_none()
    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_active": user.is_active,
        "email_verified": user.email_verified,
        "phone_verified": user.phone_verified,
        "created_at": user.created_at,
        "profile": {
            "county": profile.county if profile else None,
            "city": profile.city if profile else None,
            "address": profile.address if profile else None,
            "loyalty_points": profile.loyalty_points if profile else 0
        } if profile else None
    }

class ChangePasswordRequest(BaseModel):
    old_password:str
    new_password:str = Field(...,min_length=8)
    confirm_password:str
    
    @validator('new_password')
    def password_strength(cls,v):
        if not re.search(r'[A-Z]',v):
            raise ValueError('Password must contain at least one uppercase letter.')
        if not re.search(r'[0-9]',v):
            raise ValueError('Password must contain at least one number.')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]',v):
            raise ValueError('Password must contain at least one special character.')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls,v,values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class ForgotPasswordRequest(BaseModel):
    identifier:str

class VerifyResetOTPRequest(BaseModel):
    identifier:str
    otp : str=Field(...,min_length=6,max_length=6)

class ResetPasswordRequest(BaseModel):
    identifier:str
    otp: str=Field(...,min_length=6,max_length=6)
    new_password :str=Field(...,min_length=8)
    confirm_password:str
    
    @validator('new_password')
    def password_strength(cls,v):
        if not re.search(r'[A-Z]',v):
            raise ValueError('Password must contain at least one uppercase letter.')
        if not re.search(r'[0-9]',v):
            raise ValueError('Password must contain at least one number.')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]',v):
            raise ValueError('Password must contain at least one special character.')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls,v,values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class UpdateProfileRequest(BaseModel):
    first_name:str=None
    last_name:str=None
    email:str=None
    
@router.put('/profile')
async def update_profile(request:UpdateProfileRequest,current_user: dict=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user['id']))
    user = result.scalar_one()
    
    if request.first_name is not None:
        user.first_name = request.first_name
    if request.last_name is not None:
        user.last_name = request.last_name
    if request.email is not None:
        user.email = request.email
    
    await db.commit()
    await db.refresh(User)
    return {"message": "Profile updated successfully", "user": {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "first_name": user.first_name,
        "last_name": user.last_name
    }}

@router.post('/change-password')
async def change_password(request: ChangePasswordRequest,current_user: dict=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user['id']))
    user = result.scalar_one()
    if not verify_password(request.old_password,user.password_hash):
        raise HTTPException(status_code=400,detail='Incorrect old password')
    
    user.password_hash = get_password_hash(request.new_password)
    user.auth_method = 'password'
    await db.commit()
    return {"message":'Password changed successfully.'}

@router.post('/forgot-password')
async def forgot_password(request: ForgotPasswordRequest,background_tasks:BackgroundTasks,db:AsyncSession=Depends(get_db)):
    identifier = request.identifier
    
    if '@' in identifier:
        result = await db.execute(select(User).where(User.email == identifier))
    else:
        clean_phone = re.sub(r'\D','',identifier)
        if clean_phone.startswith('0'):
            clean_phone = clean_phone
        result = await db.execute(select(User).where(User.phone == clean_phone))
    user = result.scalar_one_or_none()
    if not user:
        return {'message':"If your account exists,you will receive an OTP"}
    otp_code = await OTPService.send_otp(phone=user.phone,purpose='password_reset',db=db)
    
    return {"message":'OTP sent successfully.'}

@router.post
async def verify_reset_otp(request:VerifyResetOTPRequest,db:AsyncSession=Depends(get_db)):
    identifier = request.identifier
    if '@' in identifier:
        result = await db.execute(select(User).where(User.email == identifier))
    else:
        clean_phone = re.sub(r'\D','',identifier)
        if clean_phone.startswith('0'):
            clean_phone = clean_phone
        result = await db.execute(select(User).where(User.phone == clean_phone))
    
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404,detail='User not found')
    await OTPService.verify_otp(
        phone=user.phone,otp=request.otp,purpose='password_reset',db=db
    )
    return {'message':'OTP verified successfully.'}

@router.post
async def reset_password(request:ResetPasswordRequest,db:AsyncSession=Depends(get_db)):
    identifier = request.identifier
    if '@' in identifier:
        result = await db.execute(select(User).where(User.email == identifier))
    else:
        clean_phone = re.sub(r'\D','',identifier)
        if clean_phone.startswith('0'):
            clean_phone = clean_phone
        result = await db.execute(select(User).where(User.phone == clean_phone))
    
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404,detail='User not found')
    await OTPService.verify_otp(
        phone=user.phone,otp=request.otp,purpose='password_reset',db=db
    )
    
    user.password_hash = get_password_hash(request.new_password)
    user.auth_method = 'password'
    await db.commit()
    return {'message':'OTP verified successfully.'}

@router.post('/token/refresh')
async def refresh_access_token(refresh_token:str,db:AsyncSession=Depends(get_db)):
    try:
        payload = decode_token(refresh_token,token_type='refresh')
        user_id = int(payload.get('sub'))
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(status_code=401,detail='Invalid refresh token')
        new_access_token = create_access_token(data={'sub':str(user.id),'role':user.role})
        return {'access-token':new_access_token,'token_type':'bearer'}
    except Exception as e:
        raise HTTPException(status_code=401,detail="Invalid refresh token")