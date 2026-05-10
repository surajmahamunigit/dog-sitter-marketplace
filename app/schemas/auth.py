"""
Request and response schemas for authentication endpoints.
"""

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    """
    Client details to register a new user.
    """

    email: EmailStr
    password: str
    name: str
    role: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, password: str) -> str:
        """Validate password meets minimum requirements."""

        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(password) > 64:
            raise ValueError("Password must be 64 characters or less")

        return password

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, role: str) -> str:
        """Only owner and sitter can self-register. Admin is assigned mannually."""

        allowed = {"owner", "sitter"}

        if role not in allowed:
            raise ValueError(f"Role must be one of: {', '.join(allowed)}")

        return role


class LoginRequest(BaseModel):
    """Client data -  username, password"""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """ "Token response after successful login or registration."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Public represntation of the user - id, email, name, role"""

    id: str
    email: str
    name: str
    role: str
