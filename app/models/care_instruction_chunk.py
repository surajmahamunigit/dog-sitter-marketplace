"""Care instruction chunks - split documents for pgvector similarity search"""

import uuid
from sqlalchemy import ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CareInstructionChunk(Base):
    __tablename__ = "care_instruction_chunks"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    care_instruction_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("care_instructions.id"), nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[str] = mapped_column(
        server_default=text("now()"), nullable=False
    )
