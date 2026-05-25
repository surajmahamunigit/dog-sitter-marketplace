from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.care_instruction import CareInstruction
import uuid
from datetime import datetime, timezone


async def upsert_care_instructions(
    db: AsyncSession,
    dog_id: str,
    content: str,
) -> CareInstruction:
    result = await db.execute(
        select(CareInstruction).where(CareInstruction.dog_id == dog_id)
    )
    record = result.scalar_one_or_none()

    if record:
        record.content = content
        record.embedding_status = "pending"
        record.updated_at = datetime.now(timezone.utc)
    else:
        record = CareInstruction(
            id=str(uuid.uuid4()),
            dog_id=dog_id,
            content=content,
            embedding_status="pending",
            updated_at=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
        )
        db.add(record)

    await db.commit()
    await db.refresh(record)
    return record


async def get_care_instructions(
    db: AsyncSession,
    dog_id: str,
) -> CareInstruction | None:
    result = await db.execute(
        select(CareInstruction).where(CareInstruction.dog_id == dog_id)
    )
    return result.scalar_one_or_none()
