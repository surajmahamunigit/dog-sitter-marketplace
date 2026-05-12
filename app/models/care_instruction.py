"""Care instructions - one document per dog, feeds the RAG pipeline"""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CareInstruction(Base):
    __tablename__ = "care_instructions"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    dog_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("dogs.id"), unique=True, nullable=False
    )
    content: Mapped[str] = mapped_column(nullable=False)
    embedding_status: Mapped[str] = mapped_column(nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
