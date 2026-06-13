from sqlalchemy import Column, Integer, String, Boolean, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base

class ShopSettings(Base):
    __tablename__ = 'shop_settings'
    
    id = Column(Integer, primary_key=True)
    shop_name = Column(String(255), default='My Shop')
    shop_logo = Column(String(255), default='')
    shop_favicon = Column(String(255), default='')
    
    delivery_nairobi = Column(Integer, default=200)
    delivery_other = Column(Integer, default=400)
    free_delivery_threshold = Column(Integer, default=5000)

    shop_name = Column(String(200), default="K-TECH Electronics and Industries")
    shop_email = Column(String(255), default="info@ktech.co.ke")
    shop_phone = Column(String(50), default="+254 727 537 684")
    shop_address = Column(String(500), default="Nairobi, Kenya")
    shop_logo = Column(String(500), nullable=True)
    shop_favicon = Column(String(500), nullable=True)
    
    order_notifications = Column(Boolean, default=True)
    low_stock_notifications = Column(Boolean, default=True)
    customer_review_notifications = Column(Boolean, default=True)
    notification_email = Column(String(255), nullable=True)
    
    mpesa_enabled = Column(Boolean, default=True)
    card_payment_enabled = Column(Boolean, default=True)
    cash_on_delivery_enabled = Column(Boolean, default=True)
    
    two_factor_auth = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=60)  # minutes
    
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    meta_keywords = Column(Text, nullable=True)
    
    facebook_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    youtube_url = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def to_dict(self):
        return {
            'id': self.id,
            'shop_name': self.shop_name,
            'shop_logo': self.shop_logo,
            'shop_favicon': self.shop_favicon,
            'delivery_nairobi': self.delivery_nairobi,
            'delivery_other': self.delivery_other,
            'free_delivery_threshold': self.free_delivery_threshold,
            'mpesa_enabled': self.mpesa_enabled,
            'cash_on_delivery_enabled': self.cash_on_delivery_enabled,
            'two_factor_auth': self.two_factor_auth,
            'session_timeout': self.session_timeout,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'meta_keywords': self.meta_keywords,
            'facebook_url': self.facebook_url,
            'twitter_url': self.twitter_url,
            'instagram_url': self.instagram_url,
            'youtube_url': self.youtube_url,
            'notification_email': self.notification_email,
            'order_notifications': self.order_notifications,
            'shipping_notifications': self.shipping_notifications,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
