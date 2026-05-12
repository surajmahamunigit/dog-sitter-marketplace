"""
Sitter domain business logic.
Sitters are users with role = "sitter".
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_all_siters(db: AsyncSession) -> list[User]:
    """
    Retuen all the uers with role = "sitter".
    Used for public sitter search listing.
    """

    result = await db.execute(select(User).where(User.role == "sitter"))

    return list(result.scalars().all())


async def get_sitter_by_id(db: AsyncSession, sitter_id: UUID) -> User | None:
    """
    Fetch single user by PK.
    Returns None if not found or if the user exists but is not a sitter.
    """

    result = await db.execute(
        select(User).where(User.id == str(sitter_id), User.role == "sitter")
    )

    return result.scalar_one_or_none()
