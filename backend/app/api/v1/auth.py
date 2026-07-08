from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from pydantic import BaseModel, Field, validator
import re
from typing import Optional
from app.database.postgres import get_db
from app.models.user import User
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    get_current_user,
    decode_token
)
from app.services.otp_services import OTPService
from app.schemas.user import UserCreate, LoginRequest, TokenResponse
from app.core.validators import validate_password_strength
from app.schemas.user import UserResponse

router = APIRouter(prefix='/auth', tags=['Authentication'])

async def get_user_by_identifier(identifier: str, db: AsyncSession) -> Optional[User]:
    if '@' in identifier:
        result = await db.execute(select(User).where(User.email == identifier))
    else:
        clean_phone = re.sub(r'\D', '', identifier)
        if clean_phone.startswith('0'):
            clean_phone = clean_phone[1:]
        result = await db.execute(select(User).where(User.phone == clean_phone))
    return result.scalar_one_or_none()

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('new_password')
    def password_strength(cls, v):
        if not validate_password_strength(v):
            raise ValueError('Password must contain at least 8 characters, one uppercase, one number, and one special character.')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class ForgotPasswordRequest(BaseModel):
    identifier: str

class VerifyResetOTPRequest(BaseModel):
    identifier: str
    otp: str = Field(..., min_length=6, max_length=6)

class ResetPasswordRequest(BaseModel):
    identifier: str
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('new_password')
    def password_strength(cls, v):
        if not validate_password_strength(v):
            raise ValueError('Password must contain at least 8 characters, one uppercase, one number, and one special character.')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_identifier(user.email, db) or await get_user_by_identifier(user.phone, db)
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

@router.post("/login", response_model=TokenResponse)
async def login(user: LoginRequest, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_identifier(user.email, db)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(user.password, existing_user.password_hash):
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
    
    access_token = create_access_token({"sub": str(existing_user.id), "role": existing_user.role})
    refresh_token = create_refresh_token({"sub": str(existing_user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.from_orm(existing_user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.id == current_user["id"])
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse.from_orm(user)

@router.put('/profile')
async def update_profile(request: UpdateProfileRequest, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user['id']))
    user = result.scalar_one()
    
    if request.first_name is not None:
        user.first_name = request.first_name
    if request.last_name is not None:
        user.last_name = request.last_name
    if request.email is not None:
        existing = await get_user_by_identifier(request.email, db)
        if existing and existing.id != user.id:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = request.email
    
    await db.commit()
    await db.refresh(user)
    return {"message": "Profile updated successfully", "user": UserResponse.from_orm(user)}

@router.post('/change-password')
async def change_password(request: ChangePasswordRequest, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user['id']))
    user = result.scalar_one()
    
    if not verify_password(request.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail='Incorrect old password')
    
    user.password_hash = get_password_hash(request.new_password)
    user.auth_method = 'password'
    await db.commit()
    return {"message": "Password changed successfully."}

@router.post('/forgot-password')
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_identifier(request.identifier, db)
    if not user:
        return {"message": "If your account exists, you will receive an OTP"}
    
    await OTPService.send_otp(phone=user.phone, purpose='password_reset', db=db)
    
    return {"message": "OTP sent successfully."}

@router.post('/verify-reset-otp')
async def verify_reset_otp(request: VerifyResetOTPRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_identifier(request.identifier, db)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    await OTPService.verify_otp(
        phone=user.phone, 
        otp=request.otp, 
        purpose='password_reset', 
        db=db
    )
    return {'message': 'OTP verified successfully.'}

@router.post('/reset-password')
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_identifier(request.identifier, db)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    await OTPService.verify_otp(
        phone=user.phone, 
        otp=request.otp, 
        purpose='password_reset', 
        db=db
    )
    
    user.password_hash = get_password_hash(request.new_password)
    user.auth_method = 'password'
    await db.commit()
    return {'message': 'Password reset successfully.'}

@router.post('/token/refresh')
async def refresh_access_token(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(request.refresh_token, token_type='refresh')
        user_id = int(payload.get('sub'))
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail='Invalid refresh token')
        
        new_access_token = create_access_token(data={'sub': str(user.id), 'role': user.role})
        return {'access_token': new_access_token, 'token_type': 'bearer'}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")