from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import config

DATABASE_URL = config.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = async_sessionmaker(engine, class=AsyncSession, expire_on_commit=False)


# Base class for all SQLALchemy models
class Base(DeclarativeBase):
    pass



async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
