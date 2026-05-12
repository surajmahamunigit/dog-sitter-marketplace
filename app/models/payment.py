"""Payment model - one payment per booking, stores Stripe IDs"""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, text, CheckConstraint, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    booking_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("bookings.id"), unique=True, nullable=False
    )
    amount: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(nullable=False, default="pending")
    stripe_payment_id: Mapped[str | None] = mapped_column(unique=True, nullable=True)
    stripe_transfer_id: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    __table_args__ = (CheckConstraint("amount > 0", name="payments_amount_positive"),)
