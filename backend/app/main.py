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
from app.api.v1.auth import router as auth_router
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])

# Products
from app.api.v1.products import router as products_router
app.include_router(products_router, prefix="/api/v1/products", tags=["Products"])

# Cart
from app.api.v1.cart import router as cart_router
app.include_router(cart_router, prefix="/api/v1/cart", tags=["Cart"])

# Checkout
from app.api.v1.checkout import router as checkout_router
app.include_router(checkout_router, prefix="/api/v1/checkout", tags=["Checkout"])

# Orders
from app.api.v1.orders import router as orders_router
app.include_router(orders_router, prefix="/api/v1/orders", tags=["Orders"])

# Admin - Categories
from app.api.v1.admin.categories import router as admin_categories_router
app.include_router(admin_categories_router, prefix="/api/v1/admin/categories", tags=["Admin - Categories"])

# Admin - Brands
from app.api.v1.admin.brands import router as admin_brands_router
app.include_router(admin_brands_router, prefix="/api/v1/admin/brands", tags=["Admin - Brands"])

# Admin - Products
from app.api.v1.admin.products import router as admin_products_router
app.include_router(admin_products_router, prefix="/api/v1/admin/products", tags=["Admin - Products"])

# Admin - Dashboard
from app.api.v1.admin.dashboard import router as admin_dashboard_router
app.include_router(admin_dashboard_router, prefix="/api/v1/admin/dashboard", tags=["Admin - Dashboard"])

# Admin - Orders
from app.api.v1.admin.orders import router as admin_orders_router
app.include_router(admin_orders_router, prefix="/api/v1/admin/orders", tags=["Admin - Orders"])

# Admin - Coupons
from app.api.v1.admin.coupon import router as admin_coupon_router
app.include_router(admin_coupon_router, prefix="/api/v1/admin/coupon", tags=["Admin - Coupon"])

# Admin - Settings
from app.api.v1.admin.settings import router as admin_settings_router
app.include_router(admin_settings_router, prefix="/api/v1/admin/settings", tags=["Admin - Settings"])

# Customer - Addresses
from app.api.v1.customer.addresses import router as customer_addresses_router
app.include_router(customer_addresses_router, prefix="/api/v1/customer/addresses", tags=["Customer - Addresses"])

# Customer - Reviews
from app.api.v1.customer.reviews import router as customer_reviews_router
app.include_router(customer_reviews_router, prefix="/api/v1/customer/reviews", tags=["Customer - Reviews"])

# Customer - Dashboard
from app.api.v1.customer.dashboard import router as customer_dashboard_router
app.include_router(customer_dashboard_router, prefix="/api/v1/customer/dashboard", tags=["Customer - Dashboard"])

# Print registered routes
print("\n📋 Registered routes:")
for route in app.routes:
    if hasattr(route, 'path'):
        print(f"  {route.path}")