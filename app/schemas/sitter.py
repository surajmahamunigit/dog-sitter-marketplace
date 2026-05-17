"""
Sitter response schema.
Sitters are the users with role = "sitter"
These schemas represent the public-facing view of sitter profile.
"""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class SitterResponse(BaseModel):
    """
    Public sitter profile.
    Returned from GET /sitters/{id}.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: EmailStr
    bio: str | None = None
    profile_photo_url: str | None = None
    location: dict | None = None
    sitter_profile: dict | None = None
    ai_summary: str | None = None


class SitterListResponse(BaseModel):
    """
    Sitter profile returned from GET /sitters/.
    Includes optional distance_miles when lat/lng filter is used.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: EmailStr
    bio: str | None = None
    profile_photo_url: str | None = None
    location: dict | None = None
    sitter_profile: dict | None = None
    ai_summary: str | None = None
    distance_miles: float | None = None
