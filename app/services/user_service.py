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
