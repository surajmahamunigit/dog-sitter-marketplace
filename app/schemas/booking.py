"""
Booking resource schemas.
"""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class BookingCreate(BaseModel):
    """Payload for creating a new booking."""

    sitter_id: UUID
    dog_id: UUID
    start_date: date
    end_date: date

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, end_date, info):

        start = info.data.get("start_date")

        if start and end_date <= start:
            raise ValueError("end_date must be after start_date")

        return end_date


class BookingStatusUpdate(BaseModel):
    """Payload for updating a booking status."""

    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v):
        allowed = {"confirmed", "completed", "cancelled"}

        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")

        return v


class BookingResponse(BaseModel):
    """Full booking record."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    sitter_id: UUID
    dog_id: UUID
    owner_name: str
    dog_name: str
    status: str
    start_date: date
    end_date: date
    total_price: int
    created_at: datetime
    updated_at: datetime
