from fastapi import APIRouter,Depends,HTTPException,status
from app.services.review_service import ReviewService
from app.database.mongodb import get_mongo_db
from app.api.v1.auth import get_current_user
from typing import Optional,List
from pydantic import BaseModel,Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import get_db
from app.services.order_service import OrderService

router = APIRouter(prefix="/customer/reviews",tags=["Customer Reviews"])

class ReviewCreate(BaseModel):
    rating:int = Field(...,ge=1,le=5)
    product_id:str
    title:str = Field(...,min_length=1,max_length=100)
    order_id:str
    comment:str = Field(...,min_length=10,max_length=1000)
    images:Optional[List[str]] = []

@router.get("/",response_model=dict)
async def get_reviews(db = Depends(get_current_user)):
    return ReviewService(db)

@router.post("/",response_model=dict)
async def create_review(review:ReviewCreate,current_user:dict = Depends(get_current_user),db:AsyncSession=Depends(get_db),review_service:ReviewService=Depends(get_reviews)):
    order = await OrderService(db).get_order(review.order_id,current_user["id"])
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Order not found")
    if order["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to review this order")
    if order["status"] != "delivered":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="You can only review delivered orders")
    return await review_service.add_review(
        review["rating"],
        review["product_id"],
        current_user["id"],
        current_user["name"],
        review["title"],
        review["order_id"],
        review["comment"],
        review["images"]
    )

@router.get("/product/{product_id}")
async def get_product_reviews(product_id:str,page:int=1,limit:int=10,review_service:ReviewService=Depends(get_reviews)):
    return await review_service.get_product_reviews(product_id,page,limit)

@router.post("/{review_id}/helpful",response_model=dict)
async def mark_helpful(review_id:str,current_user:dict = Depends(get_current_user),db:AsyncSession=Depends(get_db),review_service:ReviewService=Depends(get_reviews)):
    result = await review_service.mark_helpful(review_id,current_user["id"])
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Review not found")
    return {"message":"Review marked as helpful successfully"}