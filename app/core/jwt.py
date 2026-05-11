"""JWT creation and verification"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import ACCESS_TOKEN_EXPIRE_DAYS, ALGORITHM, SECRET_KEY


class TokenData(BaseModel):
    """Typed container for claims extracted from JWT"""

    user_id: str
    role: str


def create_access_token(user_id: str, role: str) -> str:
    """
    Build and sign JWT token for given user

    Args:
        user_id: Users UUID
        role: Users role - owner / sitter/ admin.

    Returns:
        Signed JWT token.
    """

    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    """
    Verify JWT signature and extract claims (sub and role)

    Args:
        token: Raw JWT string from authorization header

    Returns:
        TokenData id valid, None if invalid.
    """

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")

        if not user_id:
            return None

        return TokenData(user_id=user_id, role=role)
    except JWTError:
        return None
