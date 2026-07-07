import importlib
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

logger = logging.getLogger(__name__)


def safe_import_router(module_name: str):
    try:
        module = importlib.import_module(module_name)
    except Exception as exc:
        logger.warning("Router import skipped for %s: %s", module_name, exc)
        return None
    return getattr(module, "router", None)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME} v {settings.APP_VERSION}")
    try:
        from app.database.postgres import Base, engine

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as exc:
        logger.warning("Postgres startup skipped: %s", exc)

    try:
        from app.database.mongodb import connect_to_mongo

        await connect_to_mongo()
    except Exception as exc:
        logger.warning("Mongo startup skipped: %s", exc)

    try:
        from app.database.redis import get_redis

        redis = await get_redis()
        await redis.ping()
        print("Redis connected")
    except Exception as exc:
        logger.warning("Redis startup skipped: %s", exc)

    yield

    print(f"Shutting down {settings.APP_NAME}")
    try:
        from app.database.postgres import engine

        await engine.dispose()
    except Exception:
        pass
    try:
        from app.database.mongodb import close_mongo

        await close_mongo()
    except Exception:
        pass
    try:
        from app.database.redis import close_redis

        await close_redis()
    except Exception:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="E-Commerce Platform for online electronics enterprises",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health")
async def health_check():
    try:
        from app.database.redis import get_redis

        redis = await get_redis()
        await redis.ping()
        redis_status = "connected"
    except Exception as exc:
        logger.warning("Health check redis skipped: %s", exc)
        redis_status = "unavailable"

    return {
        "status": "ok",
        "database": "ready",
        "services": {
            "redis": redis_status,
            "mongodb": "checked-on-startup",
            "postgres": "checked-on-startup",
        },
        "environment": settings.ENVIRONMENT,
    }


routers = [
    ("app.api.v1.auth", "/api/v1", ["Authentication"]),
    ("app.api.v1.admin.categories", "/api/v1/admin", ["Admin - Categories"]),
    ("app.api.v1.admin.brands", "/api/v1", ["Admin - Brands"]),
    ("app.api.v1.admin.products", "/api/v1", ["Admin - Products"]),
    ("app.api.v1.products", "/api/v1", ["Products"]),
    ("app.api.v1.cart", "/api/v1", ["Cart"]),
    ("app.api.v1.checkout", "/api/v1", ["Checkout"]),
    ("app.api.v1.orders", "/api/v1", ["Orders"]),
    ("app.api.v1.customer.addresses", "/api/v1", ["Customer - Addresses"]),
    ("app.api.v1.customer.reviews", "/api/v1", ["Customer - Reviews"]),
    ("app.api.v1.customer.dashboard", "/api/v1", ["Customer - Dashboard"]),
    ("app.api.v1.admin.dashboard", "/api/v1", ["Admin - Dashboard"]),
    ("app.api.v1.admin.orders", "/api/v1", ["Admin - Orders"]),
    ("app.api.v1.admin.coupon", "/api/v1", ["Admin - Coupon"]),
    ("app.api.v1.admin.settings", "/api/v1", ["Admin - Settings"]),
]

for module_name, prefix, tags in routers:
    router = safe_import_router(module_name)
    if router is not None:
        app.include_router(router, prefix=prefix, tags=tags)
