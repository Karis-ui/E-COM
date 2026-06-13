# scripts/seed_data.py

import asyncio
from app.database.postgres import AsyncSessionLocal
from app.database.mongodb import mongodb, connect_to_mongo
from app.models.user import User
from app.core.security import get_password_hash

async def seed_admin():
    """Create admin user"""
    async with AsyncSessionLocal() as db:
        # Check if admin exists
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == "admin@ktech.co.ke"))
        admin = result.scalar_one_or_none()
        
        if not admin:
            admin = User(
                email="admin@ktech.co.ke",
                phone="0712345678",
                password_hash=get_password_hash("Admin123!"),
                first_name="Admin",
                last_name="K-TECH",
                role="admin",
                is_active=True,
                is_staff=True,
                auth_method="password"
            )
            db.add(admin)
            await db.commit()
            print("✅ Admin user created: admin@ktech.co.ke / Admin123!")
        else:
            print("⏭️ Admin user already exists")

async def seed_categories():
    """Seed product categories in MongoDB"""
    await connect_to_mongo()
    
    categories = [
        {"name": "Smartphones", "slug": "smartphones", "icon": "smartphone", "is_active": True},
        {"name": "Laptops", "slug": "laptops", "icon": "laptop", "is_active": True},
        {"name": "Networking", "slug": "networking", "icon": "router", "is_active": True},
        {"name": "Power & Chargers", "slug": "power", "icon": "zap", "is_active": True},
        {"name": "Cables & Storage", "slug": "cables", "icon": "hard-drive", "is_active": True},
        {"name": "Smart Home", "slug": "smart-home", "icon": "wifi", "is_active": True},
        {"name": "Audio", "slug": "audio", "icon": "headphones", "is_active": True},
        {"name": "Gaming", "slug": "gaming", "icon": "gamepad-2", "is_active": True},
        {"name": "PC Components", "slug": "components", "icon": "server", "is_active": True},
    ]
    
    for cat in categories:
        existing = await mongodb.db.categories.find_one({"slug": cat["slug"]})
        if not existing:
            await mongodb.db.categories.insert_one(cat)
            print(f"✅ Category created: {cat['name']}")
        else:
            print(f"⏭️ Category exists: {cat['name']}")

async def main():
    print("🌱 Seeding initial data...")
    await seed_admin()
    await seed_categories()
    print("✅ Seeding complete!")

if __name__ == "__main__":
    asyncio.run(main())