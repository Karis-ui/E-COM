from operator import or_
from fastapi import APIRouter,Depends,HTTPException,Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import get_db
from app.core.security   import get_current_user
from app.models.user import User
from app.models.orders import Order,OrderStatus,PaymentStatus
from app.services.order_service import OrderService
from app.api.v1.admin.analytic_service import AnalyticService
from typing import List,Optional
from sqlalchemy import select,func,and_,extract
from datetime import datetime,timedelta

router = APIRouter(prefix="/admin/orders",tags=["Admin - Orders"])

@router.get("/")
async def get_orders(
    status:Optional[str]=Query(None,description="Filter by status"),
    payment_status:Optional[str]=Query(None,description="Filter by payment status"),
    db:AsyncSession = Depends(get_db),
    page:int = Query(1,ge=1),
    search:Optional[str] = Query(None,description="Search by order ID or customer name"),
    limit:int=Query(20,ge=1,le=100),
    current_user:dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    query = select(Order)
    filters = []
    if status:
        filters.append(Order.status == status)
    if payment_status:
        filters.append(Order.payment_status == payment_status)
    if search:
        filters.append(or_(Order.order_number.ilike(f"%{search}%"),Order.customer_name.ilike(f"%{search}%"),Order.customer_phone.ilike(f"%{search}%")))
    if filters:
        query = query.where(and_(*filters))
    qcount_uery = select(func.count()).select_from(query.subquery())
    total_orders = await db.execute(qcount_uery)
    total_orders = total_orders.scalar()
    query = query.order_by(Order.created_at.desc()).offset((page-1)*limit).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()
    return {
        "orders":[
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "customer_phone": o.customer_phone,
                "total": o.total,
                "status": o.status,
                "payment_status": o.payment_status,
                "payment_method": o.payment_method,
                "created_at": o.created_at.isoformat()
            }
            for o in orders
        ],
        "total_orders":total_orders,
        "page":page,
        "limit":limit,
        "pages":(total_orders + limit -1)//limit
    }

@router.get("/{order_id}")
async def get_order(
    order_id:int,
    db:AsyncSession = Depends(get_db),
    current_user:dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    order = await OrderService.get_order(db,order_id)
    if not order:
        raise HTTPException(status_code=404,detail="Order not found")
    return {
        "order":order
    }

@router.put("{order_id}/status")
async def update_order_status(
    order_id:int,
    status:OrderStatus,
    note:Optional[str] = None,
    db:AsyncSession = Depends(get_db),
    current_user:dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    order = await OrderService.update_order_status(db,order_id,status,note)
    if not order:
        raise HTTPException(status_code=404,detail="Order not found")
    return {
        "message":"Order status updated successfully",
        "order":order
    }

@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id:int,
    reason:str,
    db:AsyncSession = Depends(get_db),
    current_user:dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    order = await OrderService.update_order_status(
        db=db,order_id=order_id,status=OrderStatus.CANCELLED,notes=f"Order cancelled by admin: {reason}"
    )
    if not order:
        raise HTTPException(status_code=404,detail="Order not found")
    return {
        "message":"Order cancelled successfully",
        "order":order
    }