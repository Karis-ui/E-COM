from fastapi import APIRouter,Depends
from app.services.loyalty_service import LoyaltyService
from app.api.v1.auth import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import get_db
from app.services.order_service import OrderService

router = APIRouter("/customer/dashboard",tags=["Customer Dashboard"])

@router.get("/",response_model=dict)
async def get_customer_summary(db = Depends(get_db),current_user:dict = Depends(get_current_user)):
    orders = await OrderService.get_orders(db,current_user["id"],limit=10)
    points = await LoyaltyService.get_user_points(db,current_user["id"])
    total_orders = len(orders)
    total_spent = sum(o["total"] for o in orders)
    pending_orders = [o for o in orders if o["status"] not in ["delivered","cancelled"]]
    return {
        "user_id":current_user["id"],
        "stats":{
            "total_orders":total_orders,
            "total_spent":total_spent,
            "pending_orders":pending_orders,
        },
        "loyalty":{
            "points":points,
            "recent_transactions":orders[:5]
        }
    }