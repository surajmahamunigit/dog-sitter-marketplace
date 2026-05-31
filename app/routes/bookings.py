"""Booking resource endpoint."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_auth, require_owner, require_sitter
from app.core.jwt import TokenData
from app.schemas.booking import BookingCreate, BookingResponse, BookingStatusUpdate
from app.services import booking_service
from app.models.review import Review
from app.models.booking import Booking


async def _to_response(booking: Booking, db: AsyncSession) -> BookingResponse:
    """Map a Booking ORM object → BookingResponse, stitching in related fields."""
    result = await db.execute(select(Review).where(Review.booking_id == booking.id))
    has_review = result.scalar_one_or_none() is not None

    return BookingResponse(
        id=booking.id,
        owner_id=booking.owner_id,
        sitter_id=booking.sitter_id,
        dog_id=booking.dog_id,
        dog_name=booking.dog.name,
        owner_name=booking.owner.name,
        status=booking.status,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_price=booking.total_price,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
        has_review=has_review,
    )


router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: BookingCreate,
    token_data: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> BookingResponse:
    """Create a booking - owner only."""
    try:
        booking = await booking_service.create_booking(db, token_data.user_id, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return await _to_response(booking, db)


@router.get("/", response_model=list[BookingResponse])
async def list_bookings(
    token_data: TokenData = Depends(require_auth), db: AsyncSession = Depends(get_db)
) -> list[BookingResponse]:
    """List all the bookings for the authenticated user (owner or sitter)."""
    bookings = await booking_service.get_bookings_for_user(db, token_data.user_id)

    return [await _to_response(b, db) for b in bookings]


@router.patch("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: UUID,
    body: BookingStatusUpdate,
    token_data: TokenData = Depends(require_sitter),
    db: AsyncSession = Depends(get_db),
) -> BookingResponse:
    """Update booking status. Sitter only."""
    booking = await booking_service.get_booking_by_id(db, booking_id)
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )
    if booking.sitter_id != token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking"
        )
    try:
        booking = await booking_service.update_booking_status(db, booking, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return await _to_response(booking, db)


@router.delete("/{booking_id}", status_code=204)
async def delete_booking(
    booking_id: UUID,
    token_data: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    """Delete a booking in awaiting_payment status. Owner only."""
    booking = await booking_service.get_booking_by_id(db, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if str(booking.owner_id) != str(token_data.user_id):
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "awaiting_payment":
        raise HTTPException(
            status_code=400, detail="Only unpaid bookings can be deleted"
        )
    await db.delete(booking)
    await db.commit()
