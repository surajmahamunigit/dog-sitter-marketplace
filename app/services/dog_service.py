"""
Dog domain business logic.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dog import Dog
from app.schemas.dog import DogCreate, DogUpdate


async def create_dog(db: AsyncSession, owner_id: UUID, data: DogCreate) -> Dog:
    """Create a new dog owned by owner_id."""
    dog = Dog(
        owner_id=str(owner_id),
        name=data.name,
        breed=data.breed,
        age=data.age,
        weight=data.weight,
        dog_profile=data.dog_profile,
    )
    db.add(dog)
    await db.commit()
    await db.refresh(dog)
    return dog


async def get_dogs_by_owner(db: AsyncSession, owner_id: UUID) -> list[Dog]:
    """Return all dogs belonging to owner_id."""
    result = await db.execute(select(Dog).where(Dog.owner_id == str(owner_id)))
    return list(result.scalars().all())


async def get_dog_by_id(db: AsyncSession, dog_id: UUID) -> Dog | None:
    """Fetch a single dog by PK. Returns None if not found."""
    result = await db.execute(select(Dog).where(Dog.id == str(dog_id)))
    return result.scalar_one_or_none()


async def update_dog(db: AsyncSession, dog: Dog, data: DogUpdate) -> Dog:
    """Apply partial update to dog."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(dog, field, value)
    await db.commit()
    await db.refresh(dog)
    return dog


async def delete_dog(db: AsyncSession, dog: Dog) -> None:
    """Delete a dog record."""
    await db.delete(dog)
    await db.commit()
