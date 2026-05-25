from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import require_owner
from app.core.jwt import TokenData
from app.schemas.care_instruction import CareInstructionUpsert, CareInstructionResponse
from app.services.care_instruction_service import (
    upsert_care_instructions,
    get_care_instructions,
)
from app.services.dog_service import get_dog_by_id

router = APIRouter(prefix="/care-instructions", tags=["care-instructions"])


@router.post("/{dog_id}", response_model=CareInstructionResponse, status_code=201)
async def save_care_instructions(
    dog_id: str,
    data: CareInstructionUpsert,
    token: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    dog = await get_dog_by_id(db, dog_id)
    if not dog or dog.owner_id != token.user_id:
        raise HTTPException(status_code=403, detail="Not your dog")

    return await upsert_care_instructions(db, dog_id, data.content)


@router.get("/{dog_id}", response_model=CareInstructionResponse)
async def read_care_instructions(
    dog_id: str,
    token: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    dog = await get_dog_by_id(db, dog_id)
    if not dog or dog.owner_id != token.user_id:
        raise HTTPException(status_code=403, detail="Not your dog")

    record = await get_care_instructions(db, dog_id)
    if not record:
        raise HTTPException(
            status_code=404, detail="No care instructions found for this dog"
        )

    return record
