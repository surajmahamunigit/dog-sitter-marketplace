"""Booking model — the hub table connecting owner, sitter, and dog"""

import uuid
from sqlalchemy import CheckConstraint, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    owner_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False
    )
    sitter_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False
    )
    dog_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("dogs.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(nullable=False, default="pending")
    start_date: Mapped[str] = mapped_column(nullable=False)
    end_date: Mapped[str] = mapped_column(nullable=False)
    total_price: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[str] = mapped_column(
        server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[str] = mapped_column(
        server_default=text("now()"), nullable=False
    )

    __table_args__ = (
        CheckConstraint("total_price > 0", name="bookings_total_price_positive"),
    )
