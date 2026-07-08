from sqlalchemy.ext.asyncio import create_async_engine,AsyncSession
from app.config import settings
import os
from sqlalchemy.orm import declarative_base,sessionmaker
from sqlalchemy import Column,Integer,String,DateTime,Numeric,ForeignKey,Text,Boolean,JSON,Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

DATABASE_URL = os.environ.get("DATABASE_URL", settings.DATABASE_URL)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")
print(f"Connecting to PostgreSQL...........")

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
    future=True
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()