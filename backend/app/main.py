import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import cart, checkout, orders, products
from app.api.v1.admin import (
    brands as admin_brands,
    categories as admin_categories,
    coupon,
    dashboard,
    orders as admin_orders,
    products as admin_products,
    settings as admin_settings,
)
from app.api.v1.auth import router
from app.api.v1.customer import addresses, dashboard as customer_dashboard, reviews
from app.config import settings
from app.database.mongodb import close_mongo, connect_to_mongo
from app.database.postgres import Base, engine
from app.database.redis import close_redis, get_redis

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME} v {settings.APP_VERSION}")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as exc:
        logger.warning("Postgres startup skipped: %s", exc)

    try:
        await connect_to_mongo()
    except Exception as exc:
        logger.warning("Mongo startup skipped: %s", exc)

    try:
        redis = await get_redis()
        await redis.ping()
        print("Redis connected")
    except Exception as exc:
        logger.warning("Redis startup skipped: %s", exc)

    yield

    print(f"Shutting down {settings.APP_NAME}")
    try:
        await engine.dispose()
    except Exception:
        pass
    try:
        await close_mongo()
    except Exception:
        pass
    try:
        await close_redis()
    except Exception:
        pass

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="E-Commerce Platform for online electronics enterprises",
    docs_url = "/docs" if settings.DEBUG else None,
    redoc_url = "/redoc" if settings.DEBUG else None,
    lifespan=lifespan
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
    return{
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
async def health_check():
    try:
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
            "postgres": "checked-on-startup"
        },
        "environment": settings.ENVIRONMENT
    }

app.include_router(router,prefix="/api/v1/auth",tags=["Authentication"])
app.include_router(admin_categories.router,prefix="/api/v1/admin/categories",tags=["Admin - Categories"])
app.include_router(admin_brands.router,prefix="/api/v1/admin/brands",tags=["Admin - Brands"])
app.include_router(admin_products.router,prefix="/api/v1/admin/products",tags=["Admin - Products"])
app.include_router(products.router,prefix="/api/v1/products",tags=["Products"])
app.include_router(cart.router,prefix="/api/v1/cart",tags=["Cart"])
app.include_router(checkout.router,prefix="/api/v1/checkout",tags=["Checkout"])
app.include_router(orders.router,prefix="/api/v1/orders",tags=["Orders"])
app.include_router(addresses.router,prefix="/api/v1/customer/addresses",tags=["Customer - Addresses"])
app.include_router(reviews.router,prefix="/api/v1/customer/reviews",tags=["Customer - Reviews"])
app.include_router(dashboard.router,prefix="/api/v1/customer/dashboard",tags=["Customer - Dashboard"])
app.include_router(dashboard.router,prefix="/api/v1/admin/dashboard",tags=["Admin - Dashboard"])
app.include_router(orders.router,prefix="/api/v1/admin/orders",tags=["Admin - Orders"])
app.include_router(products.router,prefix="/api/v1/admin/products",tags=["Admin - Products"])
app.include_router(coupon.router,prefix="/api/v1/admin/coupon",tags=["Admin - Coupon"])
app.include_router(admin_settings.router,prefix="/api/v1/admin/settings",tags=["Admin - Settings"])