"""
Dog resource endpoint.
All routes are owner only.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_owner
from app.core.jwt import TokenData
from app.schemas.dog import DogCreate, DogResponse, DogUpdate
from app.services import dog_service

router = APIRouter(prefix="/dogs", tags=["Dogs"])


@router.post("/", response_model=DogResponse, status_code=status.HTTP_201_CREATED)
async def create_dog(
    body: DogCreate,
    token_data: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> DogResponse:
    """Create a new dog for authenticated owner."""

    dog = await dog_service.create_dog(db, token_data.user_id, body)

    return DogResponse.model_validate(dog)


@router.get("/", response_model=list[DogResponse])
async def list_dogs(
    token_data: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> list[DogResponse]:
    """Return all the dogs belonging to the authenticated owner."""

    dogs = await dog_service.get_dogs_by_owner(db, token_data.user_id)

    return [DogResponse.model_validate(d) for d in dogs]


@router.get("/{dog_id}", response_model=DogResponse)
async def get_dog(
    dog_id: UUID,
    token_data: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> DogResponse:
    """
    Return a single dog.
    if not found 404.
    if not yours 403.
    """

    dog = await dog_service.get_dog_by_id(db, dog_id)

    if dog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found"
        )

    if dog.owner_id != token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your dog."
        )

    return DogResponse.model_validate(dog)


@router.patch("/{dog_id}", response_model=DogResponse)
async def update_dog(
    dog_id: UUID,
    body: DogUpdate,
    token_data: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> DogResponse:
    """
    Partially update a dog.
    404 if not found.
    403 if not yours.
    """

    dog = await dog_service.get_dog_by_id(db, dog_id)

    if dog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found"
        )

    if dog.owner_id != token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your dog"
        )

    dog = await dog_service.update_dog(db, dog, body)

    return DogResponse.model_validate(dog)


@router.delete("/{dog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dog(
    dog_id: UUID,
    token_data: TokenData = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a dog with dog_id.
    404 if not found.
    403 if not yours.
    """

    dog = await dog_service.get_dog_by_id(db, dog_id)

    if dog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found"
        )

    if dog.owner_id != token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your dog"
        )

    await dog_service.delete_dog(db, dog)
