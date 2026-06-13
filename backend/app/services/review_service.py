from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import Optional,List,Dict
from app.database.mongodb import mongodb

class ReviewService:
    def __init__(self,db:AsyncIOMotorDatabase):
        self.db = db
        self.reviews = db["reviews"]
        self.products = db["products"]

    async def add_review(
        self,
        rating:int,
        product_id:str,
        user_id:int,
        user_name:str,
        title:str,
        order_id:str,
        comment:str,
        images: List[str] = None,
        ):
        review = {
            "product_id": product_id,
            "user_id": user_id,
            "user_name": user_name,
            "order_id": order_id,
            "rating": rating,
            "title": title,
            "comment": comment,
            "images": images or [],
            "verified_purchase": True,
            "helpful_count": 0,
            "helpful_users": [],
            "is_approved": True,  # Auto-approve, admin can hide
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await self.reviews.insert_one(review)
        review["_id"] = str(result.inserted_id)
        await self.update_product_rating(
            product_id,
            rating,
            review["_id"]
        )
        return review

    async def get_review(self,review_id:str):
        return await self.reviews.find_one({"_id":ObjectId(review_id)})

    async def get_reviews(self,product_id:str):
        return await self.reviews.find({"product_id":product_id}).to_list(length=None)

    async def update_review(self,product_id:str):
        pipeline =[
            {"$match":{"product_id":product_id}},
            {"$group":{"_id":"$product_id","average":{"$avg":"$rating"},"total_reviews":{"$sum":1},"rating_distribution":{"$push":{"$cond":[{"rating":{"$eq":1}},1,0]}},"rating_distribution":{"$push":{"$cond":[{"rating":{"$eq":2}},1,0]}},"rating_distribution":{"$push":{"$cond":[{"rating":{"$eq":3}},1,0]}},"rating_distribution":{"$push":{"$cond":[{"rating":{"$eq":4}},1,0]}},"rating_distribution":{"$push":{"$cond":[{"rating":{"$eq":5}},1,0]}}}}
        ]
        review = await self.reviews.aggregate(pipeline).to_list(length=1)

        if review:
            ratings = review[0]
            rating_distribution = {
                "1": ratings.get("1", 0),
                "2": ratings.get("2", 0),
                "3": ratings.get("3", 0),
                "4": ratings.get("4", 0),
                "5": ratings.get("5", 0),
            }
            for r in ratings.get("rating_distribution", []):
                rating_distribution[str(r)] = ratings.get(r + 1)
            await mongodb.db.products.update_one(
                {"_id":ObjectId(product_id)},
                {
                    "$set":{
                        "average_rating":ratings.get("average"),
                        "total_reviews":ratings.get("total_reviews"),
                        "rating_distribution":rating_distribution
                    }
                }
            )
        return await self.products.update_one({"_id":ObjectId(product_id)},{"$set":review})

    async def delete_review(self,review_id:str):
        return await self.reviews.delete_one({"_id":ObjectId(review_id)})

    async def get_product_reviews(self,product_id:str,page:int=1,limit:int=10):
        skip = (page -1)* limit
        total = await self.reviews.count_documents({
            "product_id":ObjectId(product_id),
            "is_approved":True
        })
        reviews = await self.reviews.find({
            "product_id":ObjectId(product_id),
            "is_approved":True
        }).sort("created_at",-1).skip(skip).limit(limit).to_list(length=None)
        cursor = []
        async for cursor in reviews:
            cursor["_id"] = str(cursor["_id"])
            cursor["product_id"] = str(cursor["product_id"])
            cursor["order_id"] = str(cursor["order_id"])
            cursor["user_id"] = str(cursor["user_id"])
            cursor["created_at"] = str(cursor["created_at"])
            cursor["updated_at"] = str(cursor["updated_at"])
            cursor.append(cursor)
        return {
            "total":total,
            "page":page,
            "limit":limit,
            "reviews":reviews
        }
    
    async def mark_helpful(self,review_id:str,user_id:int) -> bool:
        result = await self.reviews.update_one(
            {"_id":ObjectId(review_id)},
            {
                "$addToSet":{"helpful_users":user_id},
                "$inc":{"helpful_count":1}
            }
        )
        return result.modified_count > 0