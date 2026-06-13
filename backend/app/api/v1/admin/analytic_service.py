from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,func,and_,extract
from app.models.orders import Order,OrderStatus,PaymentStatus
from datetime import datetime,timedelta
from app.models.product import Product
from app.database.mongodb import mongodb

class AnalyticService:

    @staticmethod
    async def get_dashboard_stats(db:AsyncSession,mongo_db:mongodb) -> dict:
        today_strt = datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)
        today_end = today_strt + timedelta(days=1)
        month_start = today_strt.replace(day=1)
        revenue_result = await db.execute(
            select(func.sum(Order.total_amount))
            .where(
                and_(
                    Order.paid_at >= month_start,
                    Order.status == OrderStatus.COMPLETED,
                    Order.payment_status == PaymentStatus.PAID
                )
            )
        )
        total_revemue = revenue_result.scalar() or 0
        today_revenue_result = await db.execute(
            select(func.sum(Order.total_amount))
            .where(
                and_(
                    Order.paid_at >= today_strt,
                    Order.paid_at < today_end,
                    Order.status == OrderStatus.COMPLETED,
                    Order.payment_status == PaymentStatus.PAID
                )
            )
        )
        today_revenue = today_revenue_result.scalar() or 0
        month_revenue_result = await db.execute(
            select(func.sum(Order.total_amount))
            .where(
                and_(
                    Order.paid_at >= month_start,
                    Order.status == OrderStatus.COMPLETED,
                    Order.payment_status == PaymentStatus.PAID
                )
            )
        )
        month_revenue = month_revenue_result.scalar() or 0
        total_orders_result = await db.execute(select(func.count(Order.id)))
        total_orders = total_orders_result.scalar() or 0
        today_orders_result = await db.execute(
            select(func.count(Order.id))
            .where(
                and_(
                    Order.created_at >= today_strt,
                    Order.created_at < today_end
                )
            )
        )
        today_orders = today_orders_result.scalar() or 0
        month_revenue_result = await db.execute(
            select(func.count(Order.id))
            .where(
                and_(
                    Order.created_at >= month_start
                )
            )
        )
        month_revenue = month_revenue_result.scalar() or 0
        total_customers_result = await db.execute(select(func.count(User.id)))
        total_customers = total_customers_result.scalar() or 0
        new_customers_result = await db.execute(
            select(func.count(User.id))
            .where(
                and_(
                    User.role == "customer",
                    User.created_at >= month_start,
                )
            )
        )
        new_customers = new_customers_result.scalar() or 0
        pending_orders_result = await db.execute(
            select(func.count(Order.id))
            .where(
                and_(
                    Order.status == OrderStatus.PENDING,
                )
            )
        )
        pending_orders = pending_orders_result.scalar() or 0
        shipped_orders_result = await db.execute(
            select(func.count(Order.id))
            .where(
                and_(
                    Order.status == OrderStatus.SHIPPED,
                )
            )
        )
        shipped_orders = shipped_orders_result.scalar() or 0
        delivered_orders_result = await db.execute(
            select(func.count(Order.id))
            .where(
                and_(
                    Order.status == OrderStatus.DELIVERED,
                )
            )
        )
        delivered_orders = delivered_orders_result.scalar() or 0
        cancelled_orders_result = await db.execute(
            select(func.count(Order.id))
            .where(
                and_(
                    Order.status == OrderStatus.CANCELLED,
                )
            )
        )
        cancelled_orders = cancelled_orders_result.scalar() or 0
        total_products_result = await db.execute(select(func.count(Product.id)))
        total_products = total_products_result.scalar() or 0
        today_products_result = await db.execute(
            select(func.count(Product.id))
            .where(
                and_(
                    Product.created_at >= today_strt,
                    Product.created_at < today_end
                )
            )
        )
        today_products = today_products_result.scalar() or 0
        month_products_result = await db.execute(
            select(func.count(Product.id))
            .where(
                and_(
                    Product.created_at >= month_start
                )
            )
        )
        month_products = month_products_result.scalar() or 0

        product_count = await mongo_db.products.count_documents({"is_active":True})
        low_stock_count = await mongo_db.products.count_documents({"is_active":True,"stock":{"$lt":10}})
        out_of_stock_count = await mongo_db.products.count_documents({"is_active":True,"stock":0})
        return {
            "revenue":{
                "total":total_revemue,
                "today":today_revenue,
                "month":month_revenue
            },
            "orders":{
                "total":total_orders,
                "pending":pending_orders,
                "shipped":shipped_orders,
                "delivered":delivered_orders,
                "cancelled":cancelled_orders
            },
            "customers":{
                "total":total_customers,
                "new":new_customers
            },
            "products":{
                "total":total_products,
                "today":today_products,
                "month":month_products,
                "low_stock":low_stock_count,
                "out_of_stock":out_of_stock_count
            },
            "order_status":{
                "pending":pending_orders,
                "shipped":shipped_orders,
                "delivered":delivered_orders,
                "cancelled":cancelled_orders
            }
        }

    @staticmethod
    async def get_sales_charts(db:AsyncSession,days:int=30) -> list:
        start_date = datetime.now() - timedelta(days=days)
        end_date = datetime.now()
        result = await db.execute(
            select(
                func.count(Order.id).label("orders"),
                func.sum(Order.total_amount).label("revenue"),
                func.date(Order.paid_at).label("date")
            ).where(
                and_(
                    Order.paid_at >= start_date,
                    Order.status == OrderStatus.COMPLETED,
                    Order.payment_status == PaymentStatus.PAID
                )
            ).group_by("date").order_by("date")
        )
        sales_data = []
        for row in result.all():
            sales_data.append({
                "date": row.date.strftime("%Y-%m-%d"),
                "orders": row.orders,
                "revenue": float(row.revenue)
            })
        return sales_data
    
    @staticmethod
    async def get_recent_orders(db:AsyncSession,limit:int=10) -> list:
        result = await db.execute(
            select(Order.id,Order.user_id,Order.total_amount,Order.status,Order.payment_status,Order.created_at)
            .order_by(Order.created_at.desc()).limit(limit)
        )
        orders = result.scalars().all()
        products = []
        for row in orders:
            products.append({
                "id": row.id,
                "order_number": row.order_number, 
                "customer_name":row.customer_name,
                "total_amount": float(row.total_amount),
                "status": row.status,
                "payment_status": row.payment_status,
                "created_at": row.created_at.strftime("%Y-%m-%d")
            })
        return products

    @staticmethod
    async def get_top_products(mongo_db,limit:int=10)->list:
        pipeline=[
            {
                "$match":{
                    "is_active":True
                }
            },
            {
                "$sort":{
                    "sales_count":-1
                }
            },
            {
                "$limit":limit
            },
            {
                "$project":{
                    "_id":0,
                    "product_id":"$_id",
                    "name":1,
                    "sales_count":1,
                    "price":1,
                    "stock":1,
                    "image_url":1
                }
            }
        ]
        cursor = mongo_db.products.aggregate(pipeline)
        products = await cursor.to_list(length=limit)

        if not products:
            cursor = mongo_db.products.find(
                {"is_active":True,"is_featured":True}
            ).limit(limit)
            products = await cursor.to_list(length=limit)
            for p in products:
                p["product_id"] = str(p["_id"])
                del p["_id"]
                p["price"] = float(p["price"])
                p["stock"] = int(p["stock"])
                p["sales_count"] = int(p["sales_count"])
        return products

    @staticmethod
    async def get_low_stock_products(mongo_db,threshold:int=10,limit:int=10)->list:
        cursor = mongo_db.products.find(
            {"is_active":True,"stock":{"$lt":threshold}}
        ).sort("stock",1).limit(limit)
        products = await cursor.to_list(length=limit)
        for p in products:
            p["product_id"] = str(p["_id"])
            del p["_id"]
            p["price"] = float(p["price"])
            p["stock"] = int(p["stock"])
            p["sales_count"] = int(p["sales_count"])
        return products