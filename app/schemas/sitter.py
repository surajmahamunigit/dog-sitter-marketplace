"""
Sitter response schema.
Sitters are the users with role = "sitter"
These schams represent the public-facing view of siter profile.
"""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class SitterResponse(BaseModel):
    """
    Public sitter profile.
    Returned from GET /sitters and GET /sitters/{id}.
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
