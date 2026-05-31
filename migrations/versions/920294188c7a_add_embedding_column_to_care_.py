"""add embedding column to care_instruction_chunks

Revision ID: 920294188c7a
Revises: 35f2b2b89917
Create Date: 2026-05-26 15:01:59.164090

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "920294188c7a"
down_revision: Union[str, Sequence[str], None] = "35f2b2b89917"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    from pgvector.sqlalchemy import Vector

    op.add_column(
        "care_instruction_chunks", sa.Column("embedding", Vector(1536), nullable=False)
    )


def downgrade() -> None:
    op.drop_column("care_instruction_chunks", "embedding")
