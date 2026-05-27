import anthropic
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core import config
from app.models.care_instruction import CareInstruction
from app.models.booking import Booking
from app.services.embedding_service import search_similar_chunks


anthropic_client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)


async def ask_rag(
    db: AsyncSession,
    sitter_id: UUID,
    dog_id: UUID,
    question: str,
) -> str:
    # Guard 1 — sitter must have an active booking for this dog
    booking_result = await db.execute(
        select(Booking).where(
            Booking.sitter_id == sitter_id,
            Booking.dog_id == dog_id,
            Booking.status.in_(["pending", "confirmed"]),
        )
    )
    booking = booking_result.scalar_one_or_none()
    if not booking:
        raise ValueError("No active booking found for this sitter and dog.")

    # Guard 2 — care instructions must be fully embedded
    ci_result = await db.execute(
        select(CareInstruction).where(CareInstruction.dog_id == dog_id)
    )
    care_instruction = ci_result.scalar_one_or_none()
    if not care_instruction:
        raise ValueError("Owner has not set up care instructions for this dog.")
    if care_instruction.embedding_status != "completed":
        raise ValueError(
            "Care instructions are still being processed. Try again shortly."
        )

    # Retrieve — top 3 relevant chunks
    chunks = await search_similar_chunks(db, dog_id, question)
    if not chunks:
        return "I don't know — no care instructions found for this dog."

    # Assemble grounded prompt
    context = "\n\n".join(chunks)
    prompt = f"""You are a helpful assistant for a dog sitter. 
Answer the sitter's question using ONLY the care instructions provided below.
If the answer is not in the instructions, say exactly: "I don't know — the owner didn't include that in their care instructions."
Do not use any outside knowledge about dogs.

CARE INSTRUCTIONS:
{context}

SITTER'S QUESTION:
{question}"""

    # Generate — call Claude
    import asyncio

    response = await asyncio.to_thread(
        lambda: anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            temperature=0.1,
            messages=[{"role": "user", "content": prompt}],
        )
    )

    return response.content[0].text
