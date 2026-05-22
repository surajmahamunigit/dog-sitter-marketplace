# app/routes/matches.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_owner
from app.core.jwt import TokenData
from app.schemas.match import MatchRequest, MatchResponse
from app.services import matching_service
from app.services.user_service import get_user_by_id

router = APIRouter(prefix="/matches", tags=["matches"])


@router.post("/find", response_model=MatchResponse)
async def find_matches(
    data: MatchRequest,
    token: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    owner = await get_user_by_id(db, token.user_id)
    if not owner:
        raise HTTPException(status_code=401, detail="User not found")

    if not owner.location:
        raise HTTPException(
            status_code=400,
            detail="Please add your location to your profile before using AI matching",
        )

    try:
        result = await matching_service.find_matches(db, owner, data.dog_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
