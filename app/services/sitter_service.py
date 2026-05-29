"""
Sitter domain business logic.
Sitters are users with role = "sitter".
"""

from uuid import UUID

from sqlalchemy import select, func, text, Numeric
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.review import Review


async def get_all_siters(db: AsyncSession) -> list[dict]:
    """
    Return all users with role = "sitter" with avg rating and review count.
    Used for public sitter search listing.
    """
    query = (
        select(
            User,
            func.round(func.avg(Review.rating).cast(Numeric), 1).label(
                "average_rating"
            ),
            func.count(Review.id).label("review_count"),
        )
        .outerjoin(Review, Review.sitter_id == User.id)
        .where(User.role == "sitter")
        .group_by(User.id)
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "id": row.User.id,
            "email": row.User.email,
            "name": row.User.name,
            "phone": row.User.phone,
            "role": row.User.role,
            "bio": row.User.bio,
            "profile_photo_url": row.User.profile_photo_url,
            "location": row.User.location,
            "sitter_profile": row.User.sitter_profile,
            "ai_summary": row.User.ai_summary,
            "created_at": row.User.created_at,
            "updated_at": row.User.updated_at,
            "average_rating": float(row.average_rating)
            if row.average_rating is not None
            else None,
            "review_count": row.review_count,
        }
        for row in rows
    ]


async def get_sitter_by_id(db: AsyncSession, sitter_id: UUID) -> dict | None:
    """
    Fetch single sitter by PK with avg rating and review count.
    Returns None if not found or if the user exists but is not a sitter.
    """
    query = (
        select(
            User,
            func.round(func.avg(Review.rating).cast(Numeric), 1).label(
                "average_rating"
            ),
            func.count(Review.id).label("review_count"),
        )
        .outerjoin(Review, Review.sitter_id == User.id)
        .where(User.id == str(sitter_id), User.role == "sitter")
        .group_by(User.id)
    )

    result = await db.execute(query)
    row = result.one_or_none()

    if not row:
        return None

    return {
        "id": row.User.id,
        "email": row.User.email,
        "name": row.User.name,
        "phone": row.User.phone,
        "role": row.User.role,
        "bio": row.User.bio,
        "profile_photo_url": row.User.profile_photo_url,
        "location": row.User.location,
        "sitter_profile": row.User.sitter_profile,
        "ai_summary": row.User.ai_summary,
        "created_at": row.User.created_at,
        "updated_at": row.User.updated_at,
        "average_rating": float(row.average_rating)
        if row.average_rating is not None
        else None,
        "review_count": row.review_count,
    }


async def get_sitters_by_location(
    db: AsyncSession,
    owner_lat: float,
    owner_lng: float,
    radius_miles: float,
) -> list[dict]:
    """
    Return sitters within radius_miles of the owner's location with avg rating.
    Distance is computed using the Haversine formula in Postgres.
    Results are sorted nearest-first.
    """
    query = text("""
        SELECT u.*,
            ROUND(AVG(r.rating)::numeric, 1) AS average_rating,
            COUNT(r.id) AS review_count,
            3959 * acos(
                cos(radians(:lat)) * cos(radians((location->>'lat')::float)) *
                cos(radians((location->>'lng')::float) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians((location->>'lat')::float))
            ) AS distance_miles
        FROM users u
        LEFT JOIN reviews r ON r.sitter_id = u.id
        WHERE u.role = 'sitter'
            AND u.location->>'lat' IS NOT NULL
            AND 3959 * acos(
                cos(radians(:lat)) * cos(radians((location->>'lat')::float)) *
                cos(radians((location->>'lng')::float) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians((location->>'lat')::float))
            ) <= :radius
        GROUP BY u.id
        ORDER BY distance_miles ASC
    """)

    result = await db.execute(
        query,
        {"lat": owner_lat, "lng": owner_lng, "radius": radius_miles},
    )
    rows = result.mappings().all()

    return [
        {
            "id": row["id"],
            "email": row["email"],
            "name": row["name"],
            "phone": row["phone"],
            "role": row["role"],
            "bio": row["bio"],
            "profile_photo_url": row["profile_photo_url"],
            "location": row["location"],
            "sitter_profile": row["sitter_profile"],
            "ai_summary": row["ai_summary"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "distance_miles": float(row["distance_miles"])
            if row["distance_miles"] is not None
            else None,
            "average_rating": float(row["average_rating"])
            if row["average_rating"] is not None
            else None,
            "review_count": row["review_count"],
        }
        for row in rows
    ]
