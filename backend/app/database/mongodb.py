from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

mongodb = MongoDB()
def get_mongo_db():
    return mongodb.db
    
async def connect_to_mongo():
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URI)
    mongodb.db = mongodb.client[settings.MONGODB_DB]
    print(f"Connected to MongoDB: {settings.MONGODB_DB}")

async def close_mongo():
    if mongodb.client:
        mongodb.client.close()
        print("MongoDB connection closed")