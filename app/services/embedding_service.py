from openai import OpenAI
import asyncio
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, text
from app.core import config
from app.models.care_instruction import CareInstruction
from app.models.care_instruction_chunk import CareInstructionChunk
import uuid
from datetime import datetime, timezone

openai_client = OpenAI(api_key=config.OPENAI_API_KEY)

CHUNK_SIZE = 200  # target tokens (~150 words)
CHUNK_OVERLAP = 20  # overlap tokens (~15 words)
EMBED_MODEL = "text-embedding-3-small"


def chunk_text(text: str) -> list[str]:
    """Recursive sentence-aware chunker. Splits on paragraphs → sentences → words → chars."""
    separators = ["\n\n", ". ", " ", ""]

    def _split(text: str, separators: list[str]) -> list[str]:
        if not separators:
            # base case: split by character
            return [
                text[i : i + CHUNK_SIZE]
                for i in range(0, len(text), CHUNK_SIZE - CHUNK_OVERLAP)
            ]

        separator = separators[0]
        parts = text.split(separator) if separator else list(text)
        chunks = []
        current = ""

        for part in parts:
            candidate = current + (separator if current else "") + part
            # rough token estimate: 1 token ≈ 4 chars
            if len(candidate) // 4 <= CHUNK_SIZE:
                current = candidate
            else:
                if current:
                    chunks.append(current)
                # if single part is too big, recurse with finer separator
                if len(part) // 4 > CHUNK_SIZE:
                    chunks.extend(_split(part, separators[1:]))
                    current = ""
                else:
                    current = part

        if current:
            chunks.append(current)

        return chunks

    raw_chunks = _split(text, separators)

    # apply overlap: each chunk gets a tail of the previous chunk prepended
    overlapped = []
    for i, chunk in enumerate(raw_chunks):
        if i == 0:
            overlapped.append(chunk)
        else:
            prev_tail = raw_chunks[i - 1][
                -(CHUNK_OVERLAP * 4) :
            ]  # ~20 tokens of previous chunk
            overlapped.append(prev_tail + " " + chunk)

    return overlapped


def embed_chunks(chunks: list[str]) -> list[list[float]]:
    """Call OpenAI text-embedding-3-small. Returns one vector per chunk."""
    response = openai_client.embeddings.create(
        model=EMBED_MODEL,
        input=chunks,
    )
    # response.data is a list ordered the same as input
    return [item.embedding for item in response.data]


async def index_care_instructions(db: AsyncSession, care_instruction_id: str) -> None:
    """Full indexing pipeline: delete stale chunks → chunk → embed → insert → flip status."""

    # 1. fetch the care instruction record
    result = await db.execute(
        select(CareInstruction).where(CareInstruction.id == care_instruction_id)
    )
    record = result.scalar_one()

    # 2. delete old chunks (Option B — chunk lifecycle lives here, not in POST)
    await db.execute(
        delete(CareInstructionChunk).where(
            CareInstructionChunk.care_instruction_id == care_instruction_id
        )
    )

    # 3. chunk the text
    chunks = chunk_text(record.content)

    # 4. embed all chunks in one API call
    vectors = embed_chunks(chunks)

    # 5. bulk insert into care_instruction_chunks
    for i, (chunk_text_val, vector) in enumerate(zip(chunks, vectors)):
        chunk = CareInstructionChunk(
            id=str(uuid.uuid4()),
            care_instruction_id=care_instruction_id,
            chunk_index=i,
            content=chunk_text_val,
            embedding=vector,
            created_at=datetime.now(timezone.utc),
        )
        db.add(chunk)

    # 6. flip status to completed
    record.embedding_status = "completed"
    record.updated_at = datetime.now(timezone.utc)

    await db.commit()


async def search_similar_chunks(
    db: AsyncSession,
    dog_id: UUID,
    question: str,
    top_k: int = 3,
) -> list[str]:
    """
    Embed the sitter's question and return the top_k most similar
    chunk contents from this dog's care instructions.
    """
    # 1. Embed the question — same model as indexing (mandatory)
    question_embedding = await asyncio.to_thread(
        lambda: (
            openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=question,
            )
            .data[0]
            .embedding
        )
    )

    # 2. Find this dog's care_instruction record
    care_instruction_result = await db.execute(
        select(CareInstruction).where(CareInstruction.dog_id == dog_id)
    )
    care_instruction = care_instruction_result.scalar_one_or_none()
    if not care_instruction:
        return []

    # 3. Cosine similarity search scoped to this dog's chunks only
    result = await db.execute(
        text("""
            SELECT content
            FROM care_instruction_chunks
            WHERE care_instruction_id = :care_instruction_id
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """),
        {
            "care_instruction_id": str(care_instruction.id),
            "embedding": str(question_embedding),
            "top_k": top_k,
        },
    )

    return [row.content for row in result.fetchall()]
