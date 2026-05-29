from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    body: str = Field(..., min_length=1)


class ReviewResponse(BaseModel):
    id: UUID
    booking_id: UUID
    reviewer_id: UUID
    sitter_id: UUID
    rating: int
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}
