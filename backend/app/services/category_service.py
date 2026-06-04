from app.models import Category
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from app.database.mongodb import get_mongo_db
from app.models.category import Category

class CategoryService:
    def __init__(self,db:AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.categories
    
    async def create_category(self,category_data:dict,admin_id:int)-> dict:
        category_data['created_by   '] = admin_id
        category = Category(**category_data)
        category_dict = category.model_dump(by_alias=True)
        result = await self.collection.insert_one(category_dict)
        category_dict['id'] = str(result.inserted_id)
        return category_dict
    
    async def get_all_active_categories(self):
        cursor = self.collection.find({"is_active":True}).sort('display_order',1)
        categories = []
        async for cat in cursor:
            cat['id'] = str(cat['_id'])
            categories.append(cat)
        return categories
    
    async def get_update_category(self,category_id:str,update_data:dict) -> Optional[dict]:
        update_data['updated_at'] = datetime.utcnow()
        await self.collection.update_one(
            {"_id":ObjectId(category_id)},{"$set":update_data}
        )
        return await self.get_category_by_id(category_id)
    
    async def delete_category(self,category_id:str):
        result = await self.collection.delete_one({"_id":ObjectId(category_id)})
        return result.deleted_count > 0
