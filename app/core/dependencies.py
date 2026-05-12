"""
FastAPI dependency functions for authentication and authorization.
- require_auth   → any authenticated user
- require_owner  → role == owner
- require_sitter → role == sitter
- require_admin  → role == admin
"""

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.jwt import TokenData, decode_access_token

http_bearer = HTTPBearer()


def require_auth(
    credentials: HTTPAuthorizationCredentials = Security(http_bearer),
) -> TokenData:
    """
    Verify JWT and return token data.
    Raises 401 if token is missing, expired, or invalid.
    Used as base for all protected routes.
    """
    token_data = decode_access_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data


def require_owner(current_user: TokenData = Depends(require_auth)) -> TokenData:
    """
    Verify the JWT and confirm the user is an owner.
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
    Verify the JWT and confirm the user is a sitter.
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
    Verify JWT and confirm the user is an admin.
    Raises 401 if token is invalid.
    Raises 403 if token is valid but role is not admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user
