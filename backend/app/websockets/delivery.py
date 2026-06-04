from pymongo.ssl_support import exc
from fastapi import WebSocket,WebSocketDisconnect
from app.database.redis import get_redis
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}
    
    async def connect(self,user_id:int,websocket:WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"User {user_id} connected")
    
    def disconnect(self,user_id:int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"User {user_id} disconnected")
    
    async def send_location_update(self,user_id:int,location:dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json({
                    "type":"location_update",
                    "location":location
                })
            except WebSocketDisconnect:
                self.disconnect(user_id)
    
    async def broadcast_to_all(self,message:dict):
        for user_id,websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except WebSocketDisconnect:
                self.disconnect(user_id)

manager = ConnectionManager()

async def handle_rider_location(websocket:WebSocket,rider_id:int,order_id:str):
    await manager.connect(order_id,websocket)
    redis = get_redis()
    try:
        while True:
            data = await websocket.receive_json()
            location_key = f"Rider_location:{rider_id}"
            await redis.setex(location_key,3600,json.dumps({
                "order_id":order_id,
                "latitude":data["latitude"],
                "longitude":data["longitude"],
                "timestamp":datetime.utcnow().isoformat()
            }))
            eta_mins = data.get("eta_mins",15)
            await manager.send_location_update(order_id,{
                "type":"location_update",
                "rider_id":rider_id,
                "order_id":order_id,
                "latitude":data["latitude"],
                "longitude":data["longitude"],
                "timestamp":datetime.utcnow().isoformat(),
                "eta_minutes":eta_mins
            })
    except WebSocketDisconnect:
        manager.disconnect(order_id)
        await redis.delete(f'Rider_location:{rider_id}')