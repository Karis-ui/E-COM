from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.brand import Brand
from typing import Optional
from bson import ObjectId
from datetime import datetime

class BrandService:
    def __init__(self,db:AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.brands
    
    async def create_brand(self,brand_data:dict,admin_id:int) -> dict:
        brand_data['created_by'] = admin_id
        brand = Brand(**brand_data)
        brand_dict = brand.model_dump(by_alias=True)
        result = await self.collection.insert_one(brand_dict)
        brand_dict['id'] = str(result.inserted_id)
        return brand_dict
    
    async def get_all_brands(self):
        cursor = self.collection.find({"is_active":True}).sort('name',1)
        brands = []
        async for brand in cursor:
            brand['id'] = str(brand['_id'])
            brands.append(brand)
        return brands
    
    async def update_brand(self,brand_id:str,update_data:dict) -> Optional[dict]:
        update_data['updated_at'] = datetime.utcnow()
        await self.collection.update_one(
            {"_id":ObjectId(brand_id)},
            {"$set":update_data}
        )
        return await self.get_brand_by_id(brand_id)
    
    async def delete_brand(self,brand_id:str):
        result = await self.collection.update_one({"_id":ObjectId(brand_id)},{"$set":{"is_active":False}})
        return result.modified_count > 0
    
    async def get_brand_by_id(self,brand_id:str) -> Optional[dict]:
        brand = await self.collection.find_one({"_id":ObjectId(brand_id)})
        if brand:
            brand['id'] = str(brand['_id'])
        return brand