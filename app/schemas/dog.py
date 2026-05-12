"""
Dog resource schemas.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DogCreate(BaseModel):
    """Payload for creating a new dog."""

    name: str
    breed: str
    age: int = Field(ge=0, le=30)
    weight: int = Field(ge=1, le=250)
    dog_profile: dict | None = None


class DogUpdate(BaseModel):
    """
    Payload for updating a dog.
    All fields optional- only provided fields are updated.
    """

    name: str
    breed: str
    age: int | None = Field(default=None, ge=0, le=30)
    weight: int | None = Field(default=None, ge=1, le=250)
    dog_profile: dict | None = None


class DogResponse(BaseModel):
    """Full dog record returned to the client."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    name: str
    breed: str
    age: int
    weight: int
    profile_photo_url: str | None = None
    dog_profile: dict | None = None
    created_at: datetime
