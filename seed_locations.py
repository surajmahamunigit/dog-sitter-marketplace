import asyncio
from sqlalchemy import update
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.user import User

import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

SITTER_UPDATES = [
    {
        "old_name": "Test Sitter",
        "new_name": "Sarah Mitchell",
        "location": {"city": "Silver Lake", "lat": 34.0869, "lng": -118.2707},
    },
    {
        "old_name": "Test Sitter",
        "new_name": "James Carter",
        "location": {"city": "Venice Beach", "lat": 33.9850, "lng": -118.4695},
    },
    {
        "old_name": "New Sitter",
        "new_name": "Emily Rodriguez",
        "location": {"city": "Santa Monica", "lat": 34.0195, "lng": -118.4912},
    },
    {
        "old_name": "leroy",
        "new_name": "Leroy Johnson",
        "location": {"city": "Hollywood", "lat": 34.0928, "lng": -118.3287},
    },
    {
        "old_name": "speed",
        "new_name": "Priya Patel",
        "location": {"city": "Koreatown", "lat": 34.0586, "lng": -118.2986},
    },
    {
        "old_name": "betty",
        "new_name": "Betty Williams",
        "location": {"city": "Culver City", "lat": 34.0211, "lng": -118.3965},
    },
    {"name": "speed", "location": {"city": "Hackney", "lat": 51.5450, "lng": -0.0553}},
]


async def seed():
    url = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        for sitter in SITTER_UPDATES:
            await session.execute(
                update(User)
                .where(User.name == sitter["old_name"], User.role == "sitter")
                .values(name=sitter["new_name"], location=sitter["location"])
                .execution_options(synchronize_session=False)
            )
        await session.commit()
        print("✅ Sitter names and locations seeded")

    await engine.dispose()


asyncio.run(seed())
