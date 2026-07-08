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
        router = getattr(module, "router", None)
        if router is None:
            print(f"❌ Module {module_name} has no 'router' attribute")
        else:
            print(f"✅ Imported router from {module_name}")
        return router
    except Exception as exc:
        print(f"❌❌❌ FAILED to import {module_name}: {exc}")
        logger.warning("Router import skipped for %s: %s", module_name, exc)
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    try:
        from app.database.postgres import Base, engine
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ PostgreSQL ready")
    except Exception as exc:
        print(f"⚠️ PostgreSQL: {exc}")

    try:
        from app.database.mongodb import connect_to_mongo
        await connect_to_mongo()
        print("✅ MongoDB ready")
    except Exception as exc:
        print(f"⚠️ MongoDB: {exc}")

    try:
        from app.database.redis import get_redis
        redis = await get_redis()
        await redis.ping()
        print("✅ Redis ready")
    except Exception as exc:
        print(f"⚠️ Redis: {exc}")

    yield

    print(f"🛑 Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="E-Commerce Platform for online electronics enterprises",
    docs_url="/docs",
    redoc_url="/redoc",
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
    return {"status": "ok", "environment": settings.ENVIRONMENT}

print("\n" + "="*50)
print("📦 IMPORTING ROUTERS...")
print("="*50)

routers = [
    ("app.api.v1.auth", "/api", ["Authentication"]),
    ("app.api.v1.products", "/api", ["Products"]),
    ("app.api.v1.cart", "/api", ["Cart"]),
    ("app.api.v1.checkout", "/api", ["Checkout"]),
    ("app.api.v1.orders", "/api", ["Orders"]),
    ("app.api.v1.customer.addresses", "/api", ["Customer - Addresses"]),
    ("app.api.v1.customer.reviews", "/api", ["Customer - Reviews"]),
    ("app.api.v1.customer.dashboard", "/api", ["Customer - Dashboard"]),
    ("app.api.v1.admin.categories", "/api", ["Admin - Categories"]),
    ("app.api.v1.admin.brands", "/api", ["Admin - Brands"]),
    ("app.api.v1.admin.products", "/api", ["Admin - Products"]),
    ("app.api.v1.admin.dashboard", "/api", ["Admin - Dashboard"]),
    ("app.api.v1.admin.orders", "/api", ["Admin - Orders"]),
    ("app.api.v1.admin.coupon", "/api", ["Admin - Coupon"]),
    ("app.api.v1.admin.settings", "/api", ["Admin - Settings"]),
]

for module_name, prefix, tags in routers:
    router = safe_import_router(module_name)
    if router is not None:
        app.include_router(router, prefix=prefix, tags=tags)
        print(f"✅ Registered: {prefix}")

print("\n" + "="*50)
print("📋 ALL REGISTERED ROUTES:")
print("="*50)
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"  {route.methods} {route.path}")
print("="*50 + "\n")
