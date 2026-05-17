"""
User-resource endpoint.
Get /users/me - current users full profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_auth
from app.core.jwt import TokenData
from app.schemas.user import UserMeResponse
from app.services import user_service
from app.schemas.user import UserMeResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    token_data: TokenData = Depends(require_auth), db: AsyncSession = Depends(get_db)
) -> UserMeResponse:
    """
    Returns the full profile of the currently authenticated user.
    """

    user = await user_service.get_user_by_id(db, token_data.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exist"
        )

    return UserMeResponse.model_validate(user)


@router.patch("/me", response_model=UserMeResponse)
async def update_me(
    data: UserUpdate,
    token_data: TokenData = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
) -> UserMeResponse:
    """
    Partially updates the current user's profile.
    Only fields provided in the request body are updated.
    """
    user = await user_service.get_user_by_id(db, token_data.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists"
        )
    update_data = data.model_dump(exclude_unset=True)
    updated_user = await user_service.update_user(db, user, update_data)
    return UserMeResponse.model_validate(updated_user)
