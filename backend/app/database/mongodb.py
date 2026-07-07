from app.config import settings

try:
    from motor.motor_asyncio import AsyncIOMotorClient
except Exception as exc: 
    AsyncIOMotorClient = None
    _MOTOR_IMPORT_ERROR = exc
else:
    _MOTOR_IMPORT_ERROR = None


class MongoDB:
    client = None
    db = None


mongodb = MongoDB()


def get_mongo_db():
    return mongodb.db


async def connect_to_mongo():
    if AsyncIOMotorClient is None:
        raise RuntimeError(f"MongoDB unavailable: {_MOTOR_IMPORT_ERROR}")

    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URI)
    mongodb.db = mongodb.client[settings.MONGODB_DB]
    print(f"Connected to MongoDB: {settings.MONGODB_DB}")


async def close_mongo():
    if mongodb.client:
        mongodb.client.close()
        print("MongoDB connection closed")