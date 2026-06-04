from sqlalchemy.ext.asyncio import create_async_engine,AsyncSession
from app.config import settings
from sqlalchemy.orm import declarative_base,sessionmaker
from sqlalchemy import Column,Integer,String,DateTime,Enum,Numeric,ForeignKey,Text,Boolean,JSON,Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

engine = create_async_engine(
    settings.DATABASE_URL,
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

class BaseModel(Base):
    __abstract__=True
    id = Column(Integer,primary_key=True,index=True)
    created_at = Column(DateTime(timezone=True),server_default=func.now())
    updated_at = Column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())
    is_active = Column(Boolean,default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "is_active": self.is_active
        }