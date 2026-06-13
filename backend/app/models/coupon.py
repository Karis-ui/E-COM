from sqlalchemy import Column,Integer,String,Boolean,DateTime,ForeignKey
from app.database.postgres import Base
from sqlalchemy.sql import func

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer,primary_key=True,index=True)
    code = Column(String(50),nullable=False)
    discount_type = Column(String(50),nullable=False)
    discount_value = Column(Integer,nullable=False)
    min_order_amount = Column(Integer,nullable=False)
    max_uses = Column(Integer,nullable=False)
    usage_limit = Column(Integer,nullable=False)
    limit_per_user = Column(Integer,nullable=False)
    is_active = Column(Boolean,nullable=False)
    valid_from = Column(DateTime(timezone=True),nullable=False)
    valid_until = Column(DateTime(timezone=True),nullable=False)
    created_at = Column(DateTime(timezone=True),server_default=func.now())
    times_used = Column(Integer,nullable=False,default=0)

class CouponUsage(Base):
    __tablename__ = "coupon_usage"
    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    order_id = Column(Integer,ForeignKey("orders.id"),nullable=False)
    discount_amount = Column(Integer,nullable=False)
    coupon_code = Column(String(50),nullable=False)
    coupon_id = Column(Integer,ForeignKey("coupons.id"),nullable=False)
    used_at = Column(DateTime(timezone=True),server_default=func.now())
