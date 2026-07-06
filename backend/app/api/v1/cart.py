from fastapi import APIRouter, Depends, HTTPException, Cookie, Request, Response
from typing import Optional
import uuid
from app.services.cart_service import CartService
from app.services.product_service import ProductService
from app.database.mongodb import get_mongo_db
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/cart", tags=["Cart"])

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1

class UpdateCartRequest(BaseModel):
    quantity: int = 1

def get_product_service(db=Depends(get_mongo_db)):
    return ProductService(db)

async def get_cart_identifier(
    request: Request,
    response: Response,
    current_user: Optional[dict] = Depends(get_current_user)
) -> str:
    if current_user:
        return str(current_user["id"])
    
    session_id = request.cookies.get("session_id")
    
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            max_age=30*24*3600,
            samesite="lax"
        )
    
    return session_id


@router.get("/")
async def get_cart(
    cart_id: str = Depends(get_cart_identifier)
):
    cart = await CartService.get_cart(cart_id)
    return cart


@router.get("/count")
async def get_cart_count(
    cart_id: str = Depends(get_cart_identifier)
):
    cart = await CartService.get_cart(cart_id)
    return {"count": cart["total_items"]}


@router.post("/add")
async def add_to_cart(
    request: AddToCartRequest,
    cart_id: str = Depends(get_cart_identifier),
    product_service: ProductService = Depends(get_product_service)
):
    product = await product_service.get_product(request.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.get("stock_quantity", 0) < request.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    cart = await CartService.add_item(
        identifier=cart_id,
        product_id=request.product_id,
        product_name=product["name"],
        price=product["final_price"],
        quantity=request.quantity,
        image=product.get("main_image"),
        specifications=product.get("specifications", {})
    )
    
    return {
        "message": "Item added to cart",
        "cart": cart
    }


@router.put("/item/{product_id}")
async def update_cart_item(
    product_id: str,
    request: UpdateCartRequest,
    cart_id: str = Depends(get_cart_identifier)
):
    if request.quantity <= 0:
        cart = await CartService.remove_item(cart_id, product_id)
    else:
        cart = await CartService.update_quantity(cart_id, product_id, request.quantity)
    
    return {
        "message": "Cart updated",
        "cart": cart
    }


@router.delete("/item/{product_id}")
async def remove_from_cart(
    product_id: str,
    cart_id: str = Depends(get_cart_identifier)
):
    cart = await CartService.remove_item(cart_id, product_id)
    return {
        "message": "Item removed from cart",
        "cart": cart
    }


@router.delete("/clear")
async def clear_cart(
    cart_id: str = Depends(get_cart_identifier)
):
    await CartService.clear_cart(cart_id)
    return {"message": "Cart cleared"}