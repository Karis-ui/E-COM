import redis.asyncio as redis
from app.config import settings
import os

REDIS_URL = os.environ.get("REDIS_URL", settings.REDIS_URL)
redis_client = None

async def get_redis():
    global redis_client
    if redis_client is None:
        try:
            redis_client = await redis.from_url(REDIS_URL, decode_responses=True)
            await redis_client.ping()
            print("✅ Redis connection established")
        except Exception as exc:
            print(f"⚠️ Redis connection error: {exc}")
            raise exc
    return redis_client

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
        print("Redis connection closed")
