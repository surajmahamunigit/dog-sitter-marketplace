"""
Authentication endpoints.

POST /auth/register - create a new user account
POST /auth/login - authenticate and receive JWT
"""

import uuid

from fastapi import APIRouter, HTTPException, status

from app.core.jwt import create_access_token
from app.core.security import hash_password, verify_password
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])


_users: dict[str, dict] = {}


def _find_user_by_email(email: str) -> dict | None:
    """Look up the user by email"""
    for user in _users.values():
        if user["email"] == email:
            return user
    return None


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(body: RegisterRequest):
    """
    Register a new user.

    Returns created user.
    Returns 409 if the email is already registered.
    """

    # Check for the duplicate email
    if _find_user_by_email(body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Build the user record

    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "name": body.name,
        "role": body.role,
    }

    _users[user_id] = user

    return UserResponse(**user)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    """
    Authenticate the user and return the JWT.

    Returns 401 if invalid credentials.
    """

    user = _find_user_by_email(body.email)

    DUMMY_HASH = "$2b$12$KIZPEjQSBOBGmVK6pCDPUOgL5BPCqJTGsEzMnPWVHFyQrb9XyxFOu"

    if not user:
        verify_password(body.password, DUMMY_HASH)  # to prevent timing attacks

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(
        access_token=create_access_token(user_id=user["id"], role=user["role"])
    )
