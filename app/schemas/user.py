"""
User resource schemas.
Auth-flow schemas (RegisterRequest, LoginRequest, TokenResponse) live in /schemas/auth.py
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserMeResponse(BaseModel):
    """
    Full profile of currently logged-in user.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    name: str
    role: str
    phone: str | None = None
    bio: str | None = None
    profile_photo_url: str | None = None
    location: dict | None = None
    sitter_profile: dict | None = None
    ai_summary: str | None = None
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """
    payload for updating the users profile.
    All fields optional - only provided fields are updated.
    """

    name: str | None = None
    email: str | None = None
    bio: str | None = None
    location: dict | None = None
    sitter_profile: dict | None = None
