from sqlalchemy import Column,Integer,String,DateTime,ForeignKey,Enum,Float
from sqlalchemy.sql import func
from app.database.postgres import Base
from datetime import datetime

class DeliveryStatus(Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer,primary_key=True,index=True)
    order_id = Column(Integer,ForeignKey("orders.id"))
    rider_id = Column(Integer,ForeignKey("riders.id"))
    status = Column(Enum("pending","assigned","picked_up","delivered","cancelled"),default="pending")
    created_at = Column(DateTime,default=func.now())
    assigned_at = Column(DateTime,nullable=True)
    out_for_delivery_at = Column(DateTime,nullable=True)
    picked_up_at = Column(DateTime,nullable=True)
    delivered_at = Column(DateTime,nullable=True)
    cancelled_at = Column(DateTime,nullable=True)
    customer_rating = Column(Integer)
    customer_feedback = Column(String)
    deliver_photo = Column(String)
    recipient_name = Column(String)
    recipient_signature = Column(String)
    delivery_otp = Column(String(6))