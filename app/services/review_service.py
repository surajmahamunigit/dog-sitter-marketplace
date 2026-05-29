from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import anthropic

from app.models.user import User
from app.models.booking import Booking
from app.models.review import Review
from app.schemas.review import ReviewCreate
from app.core import config


async def create_review(
    db: AsyncSession,
    booking_id: UUID,
    reviewer_id: UUID,
    data: ReviewCreate,
) -> Review:
    # 1. Load booking + verify ownership
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise ValueError("Booking not found")
    if str(booking.owner_id) != str(reviewer_id):
        raise ValueError("You can only review your own bookings")
    if booking.status != "completed":
        raise ValueError("You can only review completed bookings")

    # 2. Check no review exists yet
    existing = await db.execute(select(Review).where(Review.booking_id == booking_id))
    if existing.scalar_one_or_none():
        raise ValueError("You have already reviewed this booking")

    # 3. Insert review
    review = Review(
        booking_id=booking_id,
        reviewer_id=reviewer_id,
        sitter_id=booking.sitter_id,
        rating=data.rating,
        body=data.body,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    # 4. Regenerate AI summary for the sitter
    await _regenerate_ai_summary(db, booking.sitter_id)

    return review


async def get_reviews_for_sitter(
    db: AsyncSession,
    sitter_id: UUID,
) -> list[Review]:
    result = await db.execute(
        select(Review)
        .where(Review.sitter_id == sitter_id)
        .order_by(Review.created_at.desc())
    )
    return list(result.scalars().all())


async def _regenerate_ai_summary(db: AsyncSession, sitter_id: UUID) -> None:
    # Fetch all reviews for this sitter
    reviews = await get_reviews_for_sitter(db, sitter_id)

    if not reviews:
        return

    # Build review list for the prompt
    review_text = "\n".join(f'- Rating: {r.rating}/5. "{r.body}"' for r in reviews)

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        temperature=0.7,
        messages=[
            {
                "role": "user",
                "content": (
                    f"You are summarising reviews for a pet sitter on a marketplace platform.\n\n"
                    f"Here are all the reviews this sitter has received:\n{review_text}\n\n"
                    f"Write a 2-3 sentence summary of what owners consistently say about this sitter. "
                    f"Be specific — mention concrete things owners praised or noted. "
                    f"Write in third person (e.g. 'Owners consistently mention...'). "
                    f"Do not include a rating number. Keep it warm and honest."
                ),
            }
        ],
    )

    summary = message.content[0].text

    # Write to users.ai_summary
    result = await db.execute(select(User).where(User.id == sitter_id))
    sitter = result.scalar_one_or_none()
    if sitter:
        sitter.ai_summary = summary
        await db.commit()
