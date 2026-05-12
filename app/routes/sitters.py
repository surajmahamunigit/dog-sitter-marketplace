"""
Sitter resource endpoints.
Public - no authentication required.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.sitter import SitterResponse

from app.services import sitter_service

router = APIRouter(prefix="/sitters", tags=["Sitters"])


@router.get("/", response_model=list[SitterResponse])
async def list_sitters(
    db: AsyncSession = Depends(get_db),
) -> list[SitterResponse]:
    """
    Return all the sitters.
    Public endpoint - no auth required.
    """

    sitters = await sitter_service.get_all_siters(db)

    return [SitterResponse.model_validate(s) for s in sitters]


@router.get("/{sitter_id}", response_model=SitterResponse)
async def get_sitter(
    sitter_id: UUID, db: AsyncSession = Depends(get_db)
) -> SitterResponse:
    """
    Retuen a single sitter profile.
    Public endpoint - no auth required.

    404 if not found or if the user us not a sitter.
    """

    sitter = await sitter_service.get_sitter_by_id(db, sitter_id)

    if sitter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sitter not found",
        )

    return SitterResponse.model_validate(sitter)
