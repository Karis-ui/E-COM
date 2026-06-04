from fastapi import APIRouter,Depends,HTTPException,Request,Cookie,Response
from app.services.cart_service import CartService
from app.services.product_service import ProductService
from app.database.redis import get_redis
from app.models.user import User
from app.core.security import get_current_user
from app.database.mongodb import get_mongo_db
from typing import Optional
from pydantic import BaseModel,Field
import uuid

router = APIRouter(prefix="/cart",tags=["cart"])

class AddToCartRequest(BaseModel):
    product_id:str
    quantity:int = Field(1,ge=1,le=99)

class UpdateCartItemRequest(BaseModel):
    product_id:str
    quantity:int = Field(1,ge=1,le=99)

def get_product_service(request:Request,db=Depends(get_mongo_db)) -> ProductService:
    return ProductService(db)

def get_cart_id(request:Request,response:Response,session_id:Optional[dict] = Cookie(None),current_user:Optional[dict] = Depends(get_current_user)) -> str:
    if current_user:
        return f"user_{current_user.id}"
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(key="session_id",value=session_id,httponly=True,secure=True,samesite="lax",max_age=30*24*60*60)
    return f"session_{session_id}"

@router.get("/")
async def get_cart(cart_id=Depends(get_cart_id)):
    redis = await get_redis()
    cart = CartService.get_cart(cart_id)
    return cart

@router.post("/add")
async def add_to_cart(request:AddToCartRequest,cart_id:str=Depends(get_cart_id),product_service:ProductService=Depends(get_product_service)):
    product =await product_service.get_product_by_id(request.product_id)
    if not product:
        raise HTTPException(status_code=404,detail="Product not found")
    cart = await CartService.add_to_cart(
        identifier = cart_id,
        product_id = product.id,
        product_name = product["name"],
        price = product["price"],
        quantity = request.quantity,
        image = product["image"],
        specifications = product.get("specifications",{})
        )
    return {
        "message":"Item added to cart successfully",
        "cart":cart
    }

@router.delete("/item/{product_id}")
async def remove_from_cart(request:Request,product_id:str,cart_id:str=Depends(get_cart_id)):
    cart = await CartService.remove_item(cart_id,product_id)
    return {
        "message":"Item removed successfully",
        "cart":cart
    }

@router.put("/{product_id}")
async def update_cart_item(product_id:str,request:UpdateCartItemRequest,cart_id: str=Depends(get_cart_id)):
    cart = await CartService.update_cart_item(cart_id,product_id,request.quantity)
    return {
        "message":"Item updated successfully",
        "cart":cart
    }

@router.delete("/")
async def clear_cart(cart_id:str=Depends(get_cart_id)):
    cart = await CartService.clear_cart(cart_id)
    return {
        "message":"Cart cleared successfully",
        "cart":cart
    }

@router.post("/merge")
async def get_cart_count(cart_id:str=Depends(get_cart_id)):
    cart = await CartService.get_cart(cart_id)
    return {
        "count":cart["total_items"]
    }