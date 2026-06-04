from pydantic import json
from fastapi import APIRouter,WebSocket,WebSocketDisconnect,Depends,HTTPException
from app.models.delivery import Delivery
from app.websockets.delivery import manager,handle_rider_location
from app.database.redis import get_redis
from app.models.orders import Order,OrderStatus
from app.models.rider import Rider
from app.services.rider_service import RiderService
from app.services.order_service import OrderService
from app.core.security import get_current_user
from app.database.postgres import get_db
from app.database.mongodb import get_mongo_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

router = APIRouter(prefix="/delivery",tags=["Delivery"])
@router.post("/assign/{order_id}")
async def assign_delivery(order_id:int,rider_id:int,current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    order = await db.execute(select(Order).where(Order.id == order_id))
    order = order.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404,detail="Order not found")
    if order.status != OrderStatus.PROCESSING:
        raise HTTPException(status_code=400,detail="Order is not ready for delivery")
    
    delivery = await RiderService.assign_order_to_rider(db,order_id,rider_id)
    await OrderService.update_order_status(db,order_id,OrderStatus.OUT_FOR_DELIVERY)
    return {"message":"Order assigned to rider","delivery":delivery}

@router.get("/available-riders")
async def get_available_riders(current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    riders = await RiderService.get_available_riders(db)
    return {"riders":riders}

@router.get("/track/{order_id}")
async def track_order(order_id:int,current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    delivery = await db.execute(select(Delivery).where(Delivery.order_id == order_id))
    delivery = delivery.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404,detail="Delivery not found")
    
    redis = get_redis()
    location_key = f"Rider_location:{Rider.id}"
    location_data = await redis.get(location_key)
    current_location = json.loads(location_data) if location_data else None
    
    return {
        "order_id":order_id,
        "status":delivery.status,
        "current_location":current_location,
        "delivery":delivery,
        "rider":{
            "id":delivery.rider_id,
            "name":delivery.rider.name,
            "phone":delivery.rider.phone,
            "vehicle":Rider.vehicle_registration
        },
        "current_location":current_location,
        "timeline":{
            "siigned":delivery.assigned_at,
            "picked_up":delivery.picked_up_at,
            "delivered":delivery.delivered_at,
            "status":delivery.status,
            "arrived_at":delivery.arrived_at,
        }
    }

@router.post("/assign/{order_id}")
async def assign_delivery(order_id:int,rider_id:int,current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    order = await db.execute(select(Order).where(Order.id == order_id))
    order = order.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404,detail="Order not found")
    if order.status != OrderStatus.PROCESSING:
        raise HTTPException(status_code=400,detail="Order is not ready for delivery")
    
    delivery = await RiderService.assign_order_to_rider(db,order_id,rider_id)
    await OrderService.update_order_status(db,order_id,OrderStatus.OUT_FOR_DELIVERY)
    return {"message":"Order assigned to rider","delivery":delivery}

@router.post("/available-riders")
async def get_available_riders(current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    riders = await RiderService.get_available_riders(db)
    return {"riders":riders}

@router.get("/my-deliveries")
async def get_my_deliveries(current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    if current_user.get("role") != "rider":
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    result = await db.execute(select(Rider).where(Rider.id == current_user.get("id")))
    rider = result.scalar_one_or_none()
    if not rider:
        raise HTTPException(status_code=404,detail="Rider not found")
    
    result = await db.execute(select(Delivery).where(Delivery.rider_id == rider.id))
    deliveries = result.scalars().all()
    return {"deliveries":deliveries}

@router.post("/update-status/{delivery_id}")
async def update_delivery_status(delivery_id:int,status:str,current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    if current_user.get("role") != "rider":
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    delivery = await db.execute(select(Delivery).where(Delivery.id == delivery_id))
    delivery = delivery.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404,detail="Delivery not found")
    
    if delivery.rider_id != current_user.get("id"):
        raise HTTPException(status_code=403,detail="Unauthorized")
    
    rider = await db.get(Rider,delivery.rider_id)
    if  rider != current_user.get("id"):
        raise HTTPException(status_code=403,detail="Not your delivery")
    
    await RiderService.update_delivery_status(db,delivery_id,status)
    if status == "picked_up":
        order_status = OrderStatus.OUT_FOR_DELIVERY
    elif status == "delivered":
        order_status = OrderStatus.DELIVERED
    else:
        order_status = OrderStatus.PROCESSING
    await OrderService.update_order_status(db,delivery_id,order_status)
    return {"message":"Delivery status updated","delivery":delivery}

@router.websocket("/ws/rider/{rider_id}/{order_id}")
async def rider_location_websocket(websocket: WebSocket,rider_id:int,order_id:int, db: AsyncSession = Depends(get_db)):
    await manager.connect(websocket,rider_id,order_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                location_data = json.loads(data)
                latitude = location_data.get("latitude")
                longitude = location_data.get("longitude")
                if latitude is None or longitude is None:
                    raise HTTPException(status_code=400,detail="Invalid location data")
                await handle_rider_location(rider_id,order_id,latitude,longitude,db)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400,detail="Invalid JSON")
    except WebSocketDisconnect:
        await manager.disconnect(websocket,rider_id,order_id)
    except Exception as e:
        await manager.disconnect(websocket,rider_id,order_id)
        raise HTTPException(status_code=500,detail=str(e))

@router.websocket("/ws/customer/{order_id}")
async def customer_tracking__websocket(websocket: WebSocket,order_id:int, db: AsyncSession = Depends(get_db)):
    await manager.connect(websocket,order_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                location_data = json.loads(data)
                latitude = location_data.get("latitude")
                longitude = location_data.get("longitude")
                if latitude is None or longitude is None:
                    raise HTTPException(status_code=400,detail="Invalid location data")
                await handle_rider_location(order_id,latitude,longitude,db)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400,detail="Invalid JSON")
    except WebSocketDisconnect:
        await manager.disconnect(websocket,order_id)
    except Exception as e:
        await manager.disconnect(websocket,order_id)
        raise HTTPException(status_code=500,detail=str(e))
    
