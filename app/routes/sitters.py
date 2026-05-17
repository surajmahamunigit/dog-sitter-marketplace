"""
Sitter resource endpoints.
Public - no authentication required.
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.sitter import SitterListResponse, SitterResponse
from app.services import sitter_service

router = APIRouter(prefix="/sitters", tags=["Sitters"])


@router.get("/", response_model=list[SitterListResponse])
async def list_sitters(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(25.0),
    db: AsyncSession = Depends(get_db),
) -> list[SitterListResponse]:
    """
    Return sitters. If lat/lng provided, filter by radius (miles) and sort by distance.
    Otherwise return all sitters.
    Public endpoint - no auth required.
    """
    if lat is not None and lng is not None:
        sitters = await sitter_service.get_sitters_by_location(db, lat, lng, radius)
        return [SitterListResponse.model_validate(s) for s in sitters]

    sitters = await sitter_service.get_all_siters(db)
    return [SitterListResponse.model_validate(s) for s in sitters]


@router.get("/{sitter_id}", response_model=SitterResponse)
async def get_sitter(
    sitter_id: UUID, db: AsyncSession = Depends(get_db)
) -> SitterResponse:
    """
    Return a single sitter profile.
    Public endpoint - no auth required.
    404 if not found or if the user is not a sitter.
    """
    sitter = await sitter_service.get_sitter_by_id(db, sitter_id)

    if sitter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sitter not found",
        )

    return SitterResponse.model_validate(sitter)
