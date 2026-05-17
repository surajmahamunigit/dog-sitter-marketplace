"""
Sitter domain business logic.
Sitters are users with role = "sitter".
"""

from uuid import UUID

from sqlalchemy import select, text
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


async def get_sitters_by_location(
    db: AsyncSession,
    owner_lat: float,
    owner_lng: float,
    radius_miles: float,
) -> list[dict]:
    """
    Return sitters within radius_miles of the owner's location.
    Distance is computed using the Haversine formula in Postgres.
    Results are sorted nearest-first.
    """
    query = text("""
        SELECT *,
            3959 * acos(
                cos(radians(:lat)) * cos(radians((location->>'lat')::float)) *
                cos(radians((location->>'lng')::float) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians((location->>'lat')::float))
            ) AS distance_miles
        FROM users
        WHERE role = 'sitter'
            AND location->>'lat' IS NOT NULL
            AND 3959 * acos(
                cos(radians(:lat)) * cos(radians((location->>'lat')::float)) *
                cos(radians((location->>'lng')::float) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians((location->>'lat')::float))
            ) <= :radius
        ORDER BY distance_miles ASC
    """)

    result = await db.execute(
        query,
        {"lat": owner_lat, "lng": owner_lng, "radius": radius_miles},
    )
    rows = result.mappings().all()
    return [dict(row) for row in rows]
