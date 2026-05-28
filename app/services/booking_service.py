"""
Booking domain business logic.
"""

from datetime import date
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking
from app.models.dog import Dog
from app.schemas.booking import BookingCreate, BookingStatusUpdate
from app.services import payment_service


# Valid status transition
VALID_TRANSITIONS = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


async def create_booking(
    db: AsyncSession, owner_id: UUID, data: BookingCreate
) -> Booking:
    """
    Create a new booking.
    Enforces: dog ownership, no self_booking, date ordering, price calculation.
    """

    # Rule 1: dog must belong to the owner
    dog_result = await db.execute(select(Dog).where(Dog.id == str(data.dog_id)))
    dog = dog_result.scalar_one_or_none()

    if dog is None or dog.owner_id != str(owner_id):
        raise ValueError("Dog not found or does not belong to you.")

    # Rule 2: cant book yourself
    if str(data.sitter_id) == str(owner_id):
        raise ValueError("You cannot book yourself as a sitter")

    # Rule 3 : calculate price($150/night flat rate)
    nights = (data.end_date - data.start_date).days

    total_price = nights * 15000

    booking = Booking(
        owner_id=str(owner_id),
        sitter_id=str(data.sitter_id),
        dog_id=str(data.dog_id),
        start_date=data.start_date,
        end_date=data.end_date,
        total_price=total_price,
        status="pending",
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking, ["dog"])

    return booking


async def get_bookings_for_user(db: AsyncSession, user_id: UUID) -> list[Booking]:
    """Return all the bookings where the user is either owner or sitter"""

    result = await db.execute(
        select(Booking).where(
            or_(Booking.owner_id == str(user_id), Booking.sitter_id == str(user_id))
        )
    )

    return list(result.scalars().all())


async def get_booking_by_id(db: AsyncSession, booking_id: UUID) -> Booking | None:
    """Fetch a single booking by PK."""

    result = await db.execute(select(Booking).where(Booking.id == str(booking_id)))

    return result.scalar_one_or_none()


async def update_booking_status(
    db: AsyncSession, booking: Booking, data: BookingStatusUpdate
) -> Booking:
    """
    Update booking status.
    Enforce valid transitions.
    Trigger refund automatically if booking is cancelled.

    Raise ValueError if transition is not allowed.
    """

    allowed = VALID_TRANSITIONS.get(booking.status, set())

    if data.status not in allowed:
        raise ValueError(
            f"Cannot transition from '{booking.status}' to '{data.status}'"
        )

    booking.status = data.status

    # Trigger refund automatically on cancellation
    if data.status == "cancelled":
        try:
            await payment_service.refund_booking(booking.id, db)
        except ValueError:
            # No payment found — booking was cancelled before payment, skip refund
            pass
    await db.commit()
    await db.refresh(booking)

    return booking
