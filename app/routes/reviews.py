from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_owner
from app.core.jwt import TokenData
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services import review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/", response_model=ReviewResponse, status_code=201)
async def create_review(
    booking_id: UUID,
    data: ReviewCreate,
    token: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    try:
        review = await review_service.create_review(
            db=db,
            booking_id=booking_id,
            reviewer_id=token.user_id,
            data=data,
        )
        return review
    except ValueError as e:
        msg = str(e)
        if "only review your own" in msg:
            raise HTTPException(status_code=403, detail=msg)
        raise HTTPException(status_code=400, detail=msg)


@router.get("/sitter/{sitter_id}", response_model=list[ReviewResponse])
async def get_sitter_reviews(
    sitter_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    reviews = await review_service.get_reviews_for_sitter(db, sitter_id)
    return reviews
