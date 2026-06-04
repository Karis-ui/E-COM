import re
from pydantic import BaseModel,EmailStr,Field,validator
from typing import Optional
from app.models.user import UserRole
from datetime import datetime

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    first_name: str = Field(...,min_length=1,max_length=100)
    last_name: str = Field(...,min_length=1,max_length=100)

class UserCreate(UserBase):
    password: str = Field(...,min_length=8,max_length=128)
    confirm_password: str = Field(...,min_length=8,max_length=128)

    @validator("confirm_password")
    def password_validator(cls,v,values):
        if not re.search(r'[A-Z]',v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]',v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'[0-9]',v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_]',v):
            raise ValueError("Password must contain at least one special character")
        if v != values.get("password"):
            raise ValueError("Passwords do not match")
        return v
    @validator("email")
    def email_validator(cls,v):
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",v):
            raise ValueError("Invalid email address")
        return v
    @validator("phone")
    def phone_validator(cls,v):
        if not re.match(r"^[0-9]{10}$",v):
            raise ValueError("Invalid phone number")
        return v

class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    password: str = Field(...,min_length=8,max_length=128)
    
class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    is_staff: bool
    email_verified: bool
    phone_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse