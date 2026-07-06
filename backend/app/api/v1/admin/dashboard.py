from app.models.user import User
from sqlalchemy import case
from app.models.orders import Order,OrderStatus
from app.database.mongodb import get_mongo_db
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import get_db
from app.core.security import get_current_user
from app.api.v1.admin.analytic_service import AnalyticService
from datetime import datetime,timedelta
from sqlalchemy import func,select

router = APIRouter(prefix="/admin/dashboard",tags=["Admin - Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(
    db= Depends(get_db),
    current_user:dict = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    today_start = datetime.utcnow().replace(hour=0,minute=0,second=0,microsecond=0)
    today_end = (today_start + timedelta(days=1))
    month_start = today_start.replace(day=1)
    
    revenue_result = await db.execute(select(
        func.sum(Order.total).label("total_revenue"),
        func.sum(case((Order.paid_at >= today_start,Order.total),else_=0)).label('today_revenue'),
        func.sum(case((Order.paid_at >= month_start,Order.total),else_=0)).label('month_revenue')
    ).where(
        Order.status == OrderStatus.PAID
    ))
    revenue = revenue_result.one()
    order_result = await db.execute(select(
        func.count(Order.id).label("total_orders"),
        func.count(case((Order.status == OrderStatus.PENDING),else_=0)).label('pending_orders'),
        func.count(case((Order.status == OrderStatus.PROCESSING),else_=0)).label('processing_orders'),
        func.count(case((Order.status == OrderStatus.SHIPPED),else_=0)).label('shipped_orders'),
        func.count(case((Order.status == OrderStatus.DELIVERED),else_=0)).label('delivered_orders'),
        func.count(case((Order.status == OrderStatus.CANCELLED),else_=0)).label('cancelled_orders')
    ))
    orders = order_result.one()
    customer_result = await db.execute(select(
        func.count(User.id).label("total_customers"),
        func.count(case((User.created_at >= month_start,User.id),else_=0)).label('new_customers'),
    ).where(
        User.role == "customer"
    ))
    customers = customer_result.one()
    product_count = await mongo_db.products.count_documents({"is_active":True})
    low_stock_count = await mongo_db.products.count_documents({"is_active":True,"stock":{"$lte":["stock_quantity","$low_stock_threshold"]}})
    out_of_stock_count = await mongo_db.products.count_documents({"is_active":True,"stock.stock_quantity":0})
    recent_orders_result = await db.execute(select(Order).order_by(Order.created_at.desc()).limit(10))
    recent_orders = recent_orders_result.scalars().all()
    return {
        "revenue": {
            "total": float(revenue.total_revenue or 0),
            "today": float(revenue.today_revenue or 0),
            "this_month": float(revenue.month_revenue or 0)
        },
        "orders": {
            "total": orders.total_orders or 0,
            "pending": orders.pending_orders or 0,
            "processing": orders.processing_orders or 0,
            "shipped": orders.shipped_orders or 0
        },
        "customers": {
            "total": customers.total_customers or 0,
            "new_this_month": customers.new_customers or 0
        },
        "products": {
            "total": product_count,
            "low_stock": low_stock_count,
            "out_of_stock": out_of_stock_count
        },
        "recent_orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "total": float(o.total),
                "status": o.status,
                "created_at": o.created_at.isoformat()
            }
            for o in recent_orders
        ]
    }

@router.get("/sales-by-chart")
async def get_sales_by_chart(
    db:AsyncSession = Depends(get_db),
    current_user:dict = Depends(get_current_user),
    days:int=30
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    return await AnalyticService.get_sales_by_chart(db,days)

@router.get("/top-products")
async def get_top_products(
    mongo_db = Depends(get_mongo_db),
    current_user:dict = Depends(get_current_user),
    limit:int=10
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    return await AnalyticService.get_top_products(mongo_db,limit)

@router.get("/recent-orders")
async def get_recent_orders(
    db= Depends(get_db),
    current_user:dict = Depends(get_current_user),
    limit:int=10
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")

    return await AnalyticService.get_recent_orders(db,limit)

@router.get("/low-stock-products")
async def get_low_stock_products(
    mongo_db = Depends(get_mongo_db),
    current_user:dict = Depends(get_current_user),
    limit:int=10
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    return await AnalyticService.get_low_stock_products(mongo_db,limit)