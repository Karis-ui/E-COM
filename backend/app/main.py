from fastapi import FastAPI
from app.api.v1.auth import router 
from app.database.postgres import engine,Base
from app.config import settings
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import connect_to_mongo,close_mongo
from app.database.redis import get_redis,close_redis
from app.api.v1.admin import categories as admin_categories,brands as admin_brands,products as admin_products
from app.api.v1 import products,cart,checkout,orders
from app.api.v1.customer import addresses,reviews,dashboard
from app.api.v1.admin import dashboard,orders,products,coupon,settings as admin_settings

@asynccontextmanager
async def lifespan(app:FastAPI):
    print(f"Starting {settings.APP_NAME} v {settings.APP_VERSION}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await connect_to_mongo()
    redis = await get_redis()
    await redis.ping()
    print("Redis connected")
    yield

    print(f"Shutting down {settings.APP_NAME}")
    await engine.dispose()
    await close_mongo()
    await close_redis()

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

app.get("/")
async def root():
    return{
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT
    }

app.get("/health")
async def health_check():
    redis = await get_redis()
    await redis.ping()
    return {
        "status": "healthy",
        "database": "connected",
        "services": {
            "redis": "connected",
            "mongodb": "connected",
            "postgres": "connected"
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