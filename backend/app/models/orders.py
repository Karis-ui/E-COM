from cryptography.utils import Enum
from dns import enum
from sqlalchemy import Column,Integer,String,DateTime,Float,JSON,ForeignKey
from sqlalchemy.orm import relationship
from app.database.postgres import Base
from datetime import datetime

class OrderStatus(str,enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PACKED = "packed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PAID = "paid"

class PaymentStatus(str,Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str,enum.Enum):
    CASH = "cash"
    MPESA = "mpesa"
    VISA = "visa"
    MASTERCARD = "mastercard"

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer,primary_key=True,index=True)
    order_number = Column(String,unique=True,index=True)
    user_id = Column(Integer,ForeignKey("users.id"))

    customer_name = Column(String)
    customer_email = Column(String)
    customer_phone = Column(String)

    county = Column(String)
    city = Column(String)
    address = Column(String)
    delivery_instructions = Column(String)

    items = Column(JSON)
    subtotal = Column(Float)
    delivery_fee = Column(Float)
    discount = Column(Float,default=0.0)
    total = Column(Float)

    payment_method = Column(String)
    payment_status = Column(String)
    reference = Column(String)
    receipt_url = Column(String)
    status = Column(String)
    created_at = Column(DateTime,default=datetime.utcnow)
    updated_at = Column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)
    paid_at = Column(DateTime)
    delivered_at = Column(DateTime)
    cancelled_at = Column(DateTime)
    user = relationship("User",back_populates="orders")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    id = Column(Integer,primary_key=True,index=True)
    order_id = Column(Integer,ForeignKey("orders.id"))
    status = Column(String)
    note = Column(String(500))
    created_at = Column(DateTime,default=datetime.utcnow)
    user = relationship("Order",back_populates="status_history")