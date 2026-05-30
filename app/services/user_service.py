"""User domain business logic"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
    """
    Fetch a single user by primary key.
    Returns None if not found.
    """

    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def update_user(db: AsyncSession, user: User, data: dict) -> User:
    """
    Apply partial update to the users record.
    Only fields present in data will be updated.
    JSONB fields (location, sitter_profile) are merged, not replaced.
    """
    for field, value in data.items():
        if field in ("location", "sitter_profile") and value is not None:
            existing = getattr(user, field) or {}
            setattr(user, field, {**existing, **value})
        else:
            setattr(user, field, value)

    await db.commit()
    await db.refresh(user)

    return user
