from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.settings import ShopSettings

class SettingsService:
    
    @staticmethod
    async def get_settings(db: AsyncSession) -> dict:
        result = await db.execute(select(ShopSettings).order_by(ShopSettings.id.desc()).limit(1))
        settings = result.scalar_one_or_none()
        
        if not settings:
            settings = ShopSettings()
            db.add(settings)
            await db.commit()
            await db.refresh(settings)
        
        return {
            "delivery": {
                "nairobi": settings.delivery_fee_nairobi,
                "other": settings.delivery_fee_other,
                "free_threshold": settings.free_delivery_threshold
            },
            "shop": {
                "name": settings.shop_name,
                "email": settings.shop_email,
                "phone": settings.shop_phone,
                "address": settings.shop_address,
                "logo": settings.shop_logo,
                "favicon": settings.shop_favicon
            },
            "notifications": {
                "order_notifications": settings.order_notifications,
                "low_stock_notifications": settings.low_stock_notifications,
                "customer_review_notifications": settings.customer_review_notifications,
                "notification_email": settings.notification_email
            },
            "payment": {
                "mpesa_enabled": settings.mpesa_enabled,
                "card_enabled": settings.card_payment_enabled,
                "cash_enabled": settings.cash_on_delivery_enabled
            },
            "security": {
                "two_factor_auth": settings.two_factor_auth,
                "session_timeout": settings.session_timeout
            },
            "seo": {
                "meta_title": settings.meta_title,
                "meta_description": settings.meta_description,
                "meta_keywords": settings.meta_keywords
            },
            "social": {
                "facebook": settings.facebook_url,
                "twitter": settings.twitter_url,
                "instagram": settings.instagram_url,
                "youtube": settings.youtube_url
            },
            "updated_at": settings.updated_at.isoformat() if settings.updated_at else None
        }
    
    @staticmethod
    async def update_settings(db: AsyncSession, settings_data: dict) -> dict:
        result = await db.execute(select(ShopSettings).order_by(ShopSettings.id.desc()).limit(1))
        settings = result.scalar_one_or_none()
        
        if not settings:
            settings = ShopSettings()
            db.add(settings)
        
        if "delivery" in settings_data:
            delivery = settings_data["delivery"]
            if "nairobi" in delivery:
                settings.delivery_fee_nairobi = delivery["nairobi"]
            if "other" in delivery:
                settings.delivery_fee_other = delivery["other"]
            if "free_threshold" in delivery:
                settings.free_delivery_threshold = delivery["free_threshold"]
        
        if "shop" in settings_data:
            shop = settings_data["shop"]
            if "name" in shop:
                settings.shop_name = shop["name"]
            if "email" in shop:
                settings.shop_email = shop["email"]
            if "phone" in shop:
                settings.shop_phone = shop["phone"]
            if "address" in shop:
                settings.shop_address = shop["address"]
            if "logo" in shop:
                settings.shop_logo = shop["logo"]
            if "favicon" in shop:
                settings.shop_favicon = shop["favicon"]
        
        if "notifications" in settings_data:
            notif = settings_data["notifications"]
            if "order_notifications" in notif:
                settings.order_notifications = notif["order_notifications"]
            if "low_stock_notifications" in notif:
                settings.low_stock_notifications = notif["low_stock_notifications"]
            if "customer_review_notifications" in notif:
                settings.customer_review_notifications = notif["customer_review_notifications"]
            if "notification_email" in notif:
                settings.notification_email = notif["notification_email"]
        
        if "payment" in settings_data:
            payment = settings_data["payment"]
            if "mpesa_enabled" in payment:
                settings.mpesa_enabled = payment["mpesa_enabled"]
            if "card_enabled" in payment:
                settings.card_payment_enabled = payment["card_enabled"]
            if "cash_enabled" in payment:
                settings.cash_on_delivery_enabled = payment["cash_enabled"]
        
        if "security" in settings_data:
            security = settings_data["security"]
            if "two_factor_auth" in security:
                settings.two_factor_auth = security["two_factor_auth"]
            if "session_timeout" in security:
                settings.session_timeout = security["session_timeout"]
        
        if "seo" in settings_data:
            seo = settings_data["seo"]
            if "meta_title" in seo:
                settings.meta_title = seo["meta_title"]
            if "meta_description" in seo:
                settings.meta_description = seo["meta_description"]
            if "meta_keywords" in seo:
                settings.meta_keywords = seo["meta_keywords"]
        \
        if "social" in settings_data:
            social = settings_data["social"]
            if "facebook" in social:
                settings.facebook_url = social["facebook"]
            if "twitter" in social:
                settings.twitter_url = social["twitter"]
            if "instagram" in social:
                settings.instagram_url = social["instagram"]
            if "youtube" in social:
                settings.youtube_url = social["youtube"]
        
        await db.commit()
        await db.refresh(settings)
        
        return await SettingsService.get_settings(db)