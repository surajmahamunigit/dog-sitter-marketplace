"""
FastAPI dependency functions for authentication and authorization.
- reuire_auth
- require_owner
- require_sitter
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.jwt import TokenData, decode_access_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def require_auth(token: str = Depends(oauth2_scheme)) -> TokenData:
    """
    Verify JWT and return token data.

    Raises 401 if token is missing, expired, or invalid.
    Used as base for all protected routes.
    """

    token_data = decode_access_token(token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inavlid or expired token",
            headers={
                "WWW-Authenticate": "Bearer"
            },  # Tells client this end point needs a Bearer token.
        )
        return token_data


def require_owner(current_user: TokenData = Depends(require_auth)) -> TokenData:
    """
    Verify the JWT and confirm the user is owner.

    Raises 401 if token is invalid.
    Raises 403 if token is valid but role is not owner.
    """

    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Owner access required"
        )

    return current_user


def require_sitter(current_user: TokenData = Depends(require_auth)) -> TokenData:
    """
    Verify the JWT and confirm the user is sitter.

    Raises 401 if token is invalid.
    Raises 403 if token is valid but role is not sitter.
    """

    if current_user.role != "sitter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Sitter access required"
        )

    return current_user


def require_admin(current_user: TokenData = Depends(require_auth)) -> TokenData:
    """
    Verify JWT token and confirm the user is admin.

    Raies 401 if token is invalid.
    Raises 403 if token is valid but tole is not admin.
    """

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    return current_user
