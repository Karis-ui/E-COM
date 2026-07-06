from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.product import Product
from typing import Optional,List,Dict,Any
from bson import ObjectId
from datetime import datetime

class ProductService:
    def __init__(self,db:AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.products
    
    async def create_product(self,product_data: Product,admin_id:int) -> dict:
        product_data['created_by'] = admin_id
        product = Product(*product_data)
        product_dict = product.model_dump(by_alias=True)

        if not product_dict.get('sku'):
            import random
            name_part = product_dict['name'][:3].upper()
            random_part = random.randint(1000,9999)
            product_dict['sku'] = f"{name_part}-{random_part}"
        
        result = await self.collection.insert_one(product_dict)
        product_dict['id'] = str(result.inserted_id)
        return product_dict
    
    async def get_all_products(self):
        cursor = self.collection.find({"is_active":True}).sort('name',1)
        products = []
        async for product in cursor:
            product['id'] = str(product['_id'])
            products.append(product)
        return products
    
    async def delete_product(self,product_id:str):
        result = await self.collection.update_one({"_id":ObjectId(product_id)},{"$set":{"is_active":False}})
        return result.modified_count > 0
    
    async def get_product_by_id(self,product_id:str,slug:str) -> Optional[dict]:
        try:
            product = await self.collection.find_one({"slug":slug,"is_active":True})
            if product:
                product['id'] = str(product['_id'])
                return product
            return None
        except Exception as e:
            print(f"Error fetching product: {e}")
            return None
    
    async def get_products_by_slug(self,slug:str) -> Optional[dict]:
        product = await self.collection.find_one({"slug":slug,"is_active":True})
        if product:
            product['id'] = str(product['_id'])
            return product
        
    async def list_products(
        self,
        category_id:Optional[str] = None,
        brand_id:Optional[str] = None,
        search:Optional[str] = None,
        is_featured:Optional[bool] = None,
        is_new:Optional[bool] = None,
        page:int = 1,
        limit:int = 10,
        min_price:Optional[float] = None,
        max_price:Optional[float] = None,
        sort_by:str = 'created_at',
        sort_order:str = 'desc'
    ) -> Dict:
        filter_query = {"is_active":True}
        if category_id:
            filter_query['category_id'] = ObjectId(category_id)
        if brand_id:
            filter_query['brand_id'] = ObjectId(brand_id)
        if search:
            filter_query['$text'] = {'$search':search}
        if is_featured:
            filter_query['is_featured'] = True
        if is_new:
            filter_query['is_new'] = True
        if min_price or max_price:
            price_filter = {}
            if min_price:
                price_filter['$gte'] = min_price
            if max_price:
                price_filter['$lte'] = max_price
            filter_query['$or'] = [
                {"price":price_filter} if price_filter else {},
                {"regular_price":price_filter}
            ]
        if sort_by:
            filter_query['sort_by'] = sort_by
        if sort_order:
            filter_query['sort_order'] = sort_order
        
        sort_direction = -1 if sort_order == 'desc' else 1
        sort_field = sort_by
        total = await self.collection.count_documents(filter_query)
        cursor = self.collection.find(filter_query).sort(sort_field,sort_direction).skip((page-1)*limit).limit(limit)
        products = []
        async for product in cursor:
            product['id'] = str(product['_id'])
            products.append(product)
        return {
            "products":products,
            "total":total,
            "page":page,
            "limit":limit,
            "total_pages":(total + limit - 1) // limit
        }
    
    async def update_product(self,product_id:str,update_data:dict) -> Optional[dict]:
        update_data['updated_at'] = datetime.utcnow()
        await self.collection.update_one(
            {"_id":ObjectId(product_id)},
            {"$set":update_data}
        )
        return await self.get_product_by_id(product_id)
    
    async def update_stock(self,product_id:str,quantity:int) -> bool:
        result = await self.collection.update_one(
            {"_id":ObjectId(product_id)},
            {"$inc":{"stock":quantity,"updated_at":datetime.utcnow()}}
        )
        return result.modified_count > 0