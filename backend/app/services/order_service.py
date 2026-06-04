from sqlalchemy import select,update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from datetime import datetime
from app.models.orders import Order,OrderStatus,PaymentStatus,PaymentMethod,OrderStatusHistory
from app.services.cart_service  import CartService
from app.services.sms_service import send_order_confirmation
from app.services.product_service import ProductService

class OrderService:
    @staticmethod
    async def create_order(db:AsyncSession,user_id:int,order_data:dict,cart_id:str,delivery_details:dict,payment_method:str,product_service:ProductService)-> dict:

        cart = await CartService.get_cart_by_id(db,cart_id)
        if not cart["items"]:
            raise HTTPException(status_code=404,detail="Cart is empty")
        
        for item in cart["items"]:
            product = await product_service.get_product_by_id(item["product_id"])
            if not product:
                raise HTTPException(status_code=404,detail="Product not found")
            if product["stock"] < item["quantity"]:
                raise HTTPException(status_code=400,detail="Product out of stock")
            await product_service.update_stock(item["product_id"],-item["quantity"])
        
        delivery_fee = 150 if delivery_details["county"] == "Nairobi" else 250
        subtotal = cart["total_price"]
        total = subtotal + delivery_fee
        
        order = Order(
            user_id=user_id,
            order_number=OrderService.generate_order_number(),
            customer_name=delivery_details["full_name"],
            customer_email=delivery_details["email"],
            customer_phone=delivery_details["phone"],
            county=delivery_details["county"],
            city=delivery_details["city"],
            address=delivery_details["address"],
            delivery_instructions=delivery_details["delivery_instructions"],
            items=cart["items"],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount=0,
            total=total,
            payment_method=PaymentMethod(payment_method),
            payment_status=PaymentStatus.PENDING,
            status=OrderStatus.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            paid_at=None,
            delivered_at=None,
            cancelled_at=None,
            status_history=[OrderStatusHistory(
                status=OrderStatus.PENDING,
                timestamp=datetime.now().isoformat(),
                notes="Order created"
            )]
        )
        db.add(order)
        await db.commit()
        await db.refresh(order)

        for item in cart["items"]:
            product = await product_service.get_product_by_id(item["product_id"])
            new_stock = product["stock"] - item["quantity"]
            await product_service.update_stock(item["product_id"],new_stock)
        await send_order_confirmation(
            phone=delivery_details["phone"],
            order_number=order.order_number,
            total=total,
        )
        await CartService.clear_cart(cart_id)
        return order

    @staticmethod
    async def get_order_by_id(db:AsyncSession,order_id:int,user_id:int=None) -> dict:
        query = select(Order).where(Order.id == order_id)
        if user_id:
            query = query.where(Order.user_id == user_id)
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404,detail="Order not found")
        return{
            "id":order.id,
            "order_number":order.order_number,
            "user_id":order.user_id,
            "customer_name":order.customer_name,
            "customer_email":order.customer_email,
            "customer_phone":order.customer_phone,
            "county":order.county,
            "city":order.city,
            "address":order.address,
            "delivery_instructions":order.delivery_instructions,
            "items":order.items,
            "subtotal":order.subtotal,
            "delivery_fee":order.delivery_fee,
            "discount":order.discount,
            "total":order.total,
            "payment_method":order.payment_method,
            "payment_status":order.payment_status,
            "reference":order.reference,
            "receipt_url":order.receipt_url,
            "status":order.status,
            "created_at":order.created_at,
            "updated_at":order.updated_at,
            "paid_at":order.paid_at,
            "delivered_at":order.delivered_at,
            "cancelled_at":order.cancelled_at,
            "status_history":order.status_history,
            "user":order.user
        }

    @staticmethod
    async def get_user_orders(db:AsyncSession,user_id:int,status:str=None,limit:int=50,offset:int=0) -> list[dict]:
        query = select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc()).limit(limit).offset(offset)
        if status:
            query = query.where(Order.status == status)
        result = await db.execute(query)
        orders = result.scalars().all()
        return [
            {
                "id":order.id,
                "order_number":order.order_number,
                "user_id":order.user_id,
                "total":order.total,
                "status":order.status,
                "created_at":order.created_at
            }
            for order in orders
        ]
    
    @staticmethod
    async def update_order_status(db:AsyncSession,order_id:int,status:str,user_id:int=None,new_status:OrderStatus=None,notes:str=None) -> dict:
        await db.execute(update(Order).where(Order.id == order_id).values(status=status,updated_at=datetime.now()))
        history = OrderStatusHistory(
            order_id=order_id,
            status=status,
            note=notes or "Order status updated"
        )
        db.add(history)
        if new_status ==OrderStatus.PAID:
            await db.execute(update(Order).where(Order.id == order_id).values(paid_at=datetime.now()))
        elif new_status ==OrderStatus.DELIVERED:
            await db.execute(update(Order).where(Order.id == order_id).values(delivered_at=datetime.now()))
        elif new_status ==OrderStatus.CANCELLED:
            await db.execute(update(Order).where(Order.id == order_id).values(cancelled_at=datetime.now()))
        await db.commit()
        return {"order_id":order_id,"status":new_status}