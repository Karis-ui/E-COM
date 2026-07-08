from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.database.postgres import get_db
from app.services.settings_service import SettingsService
from app.core.security import get_current_user


router = APIRouter(prefix="/admin/settings", tags=["Admin - Settings"])

class DeliverySettings(BaseModel):
    nairobi: Optional[float] = None
    other: Optional[float] = None
    free_threshold: Optional[float] = None

class ShopSettings(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    logo: Optional[str] = None
    favicon: Optional[str] = None

class NotificationSettings(BaseModel):
    order_notifications: Optional[bool] = None
    low_stock_notifications: Optional[bool] = None
    customer_review_notifications: Optional[bool] = None
    notification_email: Optional[str] = None

class PaymentSettings(BaseModel):
    mpesa_enabled: Optional[bool] = None
    card_enabled: Optional[bool] = None
    cash_enabled: Optional[bool] = None

class SecuritySettings(BaseModel):
    two_factor_auth: Optional[bool] = None
    session_timeout: Optional[int] = None

class SEOSettings(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None

class SocialSettings(BaseModel):
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    delivery: Optional[DeliverySettings] = None
    shop: Optional[ShopSettings] = None
    notifications: Optional[NotificationSettings] = None
    payment: Optional[PaymentSettings] = None
    security: Optional[SecuritySettings] = None
    seo: Optional[SEOSettings] = None
    social: Optional[SocialSettings] = None

@router.get("/")
async def get_settings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = await SettingsService.get_settings(db)
    return settings

@router.put("/")
async def update_settings(
    request: SettingsUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = request.model_dump(exclude_none=True)
    
    settings = await SettingsService.update_settings(db, update_data)
    return {"message": "Settings updated successfully", "settings": settings}

@router.get("/public")
async def get_public_settings(
    db: AsyncSession = Depends(get_db)
):
    settings = await SettingsService.get_settings(db)
    
    return {
        "shop": settings["shop"],
        "delivery": settings["delivery"],
        "social": settings["social"],
        "seo": settings["seo"]
    }