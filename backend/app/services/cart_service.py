from app.api.v1 import products
import json
from typing import Optional,Dict,Any
from app.database.redis import get_redis
from datetime import datetime

class CartService:
    CART_TTL = 7 * 24 * 60 * 60
    def __init__(self,redis_client):
        self.redis = redis_client
    
    @staticmethod
    def get_cart_key(identifier:str) -> str:
        return f"cart:{identifier}"
    
    @staticmethod
    async def add_to_cart(self,identifier:str,product_id:str,product_name:str,price:float,quantity:int = 1,image:str = None,specifications: Dict=None) -> Dict[str,Any]:
        redis = await get_redis()
        cart_key = CartService._get_cart_key(identifier)
        cart = await CartService.get_cart(identifier)
        existing_item = None
        for item in cart["items"]:
            if item["product_id"] == product_id:
                existing_item = item
                break
        if cart:
            cart = json.loads(cart)
        else:
            cart = {
                "user_id":identifier,
                "items":[],
                "total_items":0,
                "total_price":0.0
            }
        
        if existing_item:
            existing_item["quantity"] += quantity
            existing_item["total_price"] = existing_item["quantity"] * existing_item["price"]
        else:
            cart["items"].append({
                "product_id":product_id,
                "name":product_name,
                "price":price,
                "quantity":quantity,
                "total_price":price * quantity,
                "image":image,
                "specifications":specifications,
                "added_at":datetime.utcnow().isoformat()
            })
        
        cart["subtotal"] = sum(item["total_price"] for item in cart["items"])
        cart["total_items"] = sum(item["quantity"] for item in cart["items"])
        cart["total_price"] = sum(item["total_price"] for item in cart["items"])
        
        await redis.setex(cart_key,CartService.CART_TTL,json.dumps(cart))
        return cart
    
    @staticmethod
    async def get_cart(self,identifier:str) -> Dict[str,Any]:
        redis = await get_redis()
        cart = await redis.get(self.get_cart_key(identifier))
        if cart:
            return json.loads(cart)
        return {
            "user_id":identifier,
            "items":[],
            "total_items":0,
            "total_price":0.0,
            "created_at":datetime.utcnow(),
            "updated_at":datetime.utcnow()
        }
    @staticmethod
    async def remove_from_cart(self,user_id:int,product_id:str) -> bool:
        cart_key = self.get_cart_key(user_id)
        cart = await self.redis.get(cart_key)
        if cart:
            cart = json.loads(cart)
            cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]
            cart["total_items"] = sum(item["quantity"] for item in cart["items"])
            cart["total_price"] = sum(item["total_price"] for item in cart["items"])
            await self.redis.set(cart_key,json.dumps(cart))
            return True
        return False
    
    @staticmethod
    async def update_cart_item(self,user_id:int,product_id:str,quantity:int) -> bool:
        cart_key = self.get_cart_key(user_id)
        cart = await self.redis.get(cart_key)
        if cart:
            cart = json.loads(cart)
            for item in cart["items"]:
                if item["product_id"] == product_id:
                    item["quantity"] = quantity
                    item["total_price"] = item["quantity"] * item["price"]
                    break
            cart["total_items"] = sum(item["quantity"] for item in cart["items"])
            cart["total_price"] = sum(item["total_price"] for item in cart["items"])
            await self.redis.set(cart_key,json.dumps(cart))
            return True
        return False
    
    @staticmethod
    async def remove_item(self,identifier:str,product_id:str) -> Dict[str,Any]:
        redis = await get_redis()
        cart_key = CartService._get_cart_key(identifier)
        cart = await CartService.get_cart(identifier)
        cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]

        cart["subtotal"] = sum(item["total_price"] for item in cart["items"])
        cart["total_items"] = sum(item["quantity"] for item in cart["items"])
        cart["total_price"] = sum(item["total_price"] for item in cart["items"])

        if cart["total_items"] == 0:
            await redis.delete(cart_key)
            return {"message":"Cart cleared successfully"}
        return cart
    
    @staticmethod
    async def clear_cart(self,identifier:str) -> Dict[str,Any]:
        redis = await get_redis()
        cart_key = CartService._get_cart_key(identifier)
        await redis.delete(cart_key)
        return {"message":"Cart cleared successfully"}
    
    @staticmethod
    async def merge_carts(user_id:int,session_id:str) -> Dict[str,Any]:
        guest_cart = await CartService.get_cart(session_id)
        user_cart = await CartService.get_cart(user_id)

        if not guest_cart["items"]:
            return user_cart
        if not user_cart["items"]:
            return guest_cart
        
        for guest_item in guest_cart["items"]:
            existing = None
            for user_items in user_cart["items"]:
                if user_items["product_id"] == guest_item["product_id"]:
                    existing = user_items
                    break
            if existing:
                existing["quantity"] += guest_item["quantity"]
                existing["total_price"] = existing["quantity"] * existing["price"]
            else:
                user_cart["items"].append(guest_item)
        user_cart["total_items"] = sum(item["quantity"] for item in user_cart["items"])
        user_cart["total_price"] = sum(item["total_price"] for item in user_cart["items"])
        user_cart["updated_at"] = datetime.utcnow().isoformat()
        redis = await get_redis()
        cart_key = CartService._get_cart_key(user_id)
        await redis.setex(cart_key,CartService.CART_TTL,json.dumps(user_cart))
        await redis.delete(CartService._get_cart_key(session_id))
        return user_cart