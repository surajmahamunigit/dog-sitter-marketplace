"""Booking resource endpoint."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_auth, require_owner, require_sitter
from app.core.jwt import TokenData
from app.schemas.booking import BookingCreate, BookingResponse, BookingStatusUpdate
from app.services import booking_service

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

    return BookingResponse.model_validate(booking)


@router.get("/", response_model=list[BookingResponse])
async def list_bookings(
    token_data: TokenData = Depends(require_auth), db: AsyncSession = Depends(get_db)
) -> list[BookingResponse]:
    """List all the bookings for the authenticated user (owner or sitter)."""

    bookings = await booking_service.get_bookings_for_user(db, token_data.user_id)

    return [BookingResponse.model_validate(b) for b in bookings]


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
    return BookingResponse.model_validate(booking)
