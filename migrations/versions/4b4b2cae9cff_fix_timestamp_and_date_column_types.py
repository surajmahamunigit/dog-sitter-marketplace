"""fix timestamp and date column types

Revision ID: 4b4b2cae9cff
Revises: 1a26a881024a
Create Date: 2026-05-11 17:09:14.114726

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4b4b2cae9cff"
down_revision: Union[str, Sequence[str], None] = "1a26a881024a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "bookings",
        "start_date",
        existing_type=sa.VARCHAR(),
        type_=sa.Date(),
        existing_nullable=False,
        postgresql_using="start_date::date",
    )
    op.alter_column(
        "bookings",
        "end_date",
        existing_type=sa.VARCHAR(),
        type_=sa.Date(),
        existing_nullable=False,
        postgresql_using="end_date::date",
    )
    op.alter_column(
        "bookings",
        "created_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "bookings",
        "updated_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="updated_at::timestamptz",
    )
    op.alter_column(
        "care_instruction_chunks",
        "created_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "care_instructions",
        "created_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "care_instructions",
        "updated_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="updated_at::timestamptz",
    )
    op.alter_column(
        "dogs",
        "created_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "payments",
        "created_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "reviews",
        "created_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "users",
        "created_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "users",
        "updated_at",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="updated_at::timestamptz",
    )
