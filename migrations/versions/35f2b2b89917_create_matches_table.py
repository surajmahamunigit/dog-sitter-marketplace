"""create matches table

Revision ID: 35f2b2b89917
Revises: 4b4b2cae9cff
Create Date: 2026-05-17 13:27:14.397469

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "35f2b2b89917"
down_revision: Union[str, Sequence[str], None] = "4b4b2cae9cff"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use raw SQL for everything — avoids SQLAlchemy's automatic enum
    # creation which can't be suppressed reliably in async mode
    op.execute("CREATE TYPE match_status AS ENUM ('success', 'failed')")

    op.execute("""
        CREATE TABLE matches (
            id UUID NOT NULL,
            requester_id UUID NOT NULL,
            dog_id UUID NOT NULL,
            request_payload JSON NOT NULL,
            response_payload JSON,
            model VARCHAR(100) NOT NULL,
            input_tokens INTEGER,
            output_tokens INTEGER,
            latency_ms INTEGER,
            status match_status NOT NULL,
            error_message TEXT,
            created_at TIMESTAMPTZ,
            PRIMARY KEY (id),
            FOREIGN KEY (requester_id) REFERENCES users(id),
            FOREIGN KEY (dog_id) REFERENCES dogs(id)
        )
    """)

    op.execute("CREATE INDEX ix_matches_requester_id ON matches (requester_id)")
    op.execute("CREATE INDEX ix_matches_dog_id ON matches (dog_id)")
    op.execute("CREATE INDEX ix_matches_created_at ON matches (created_at)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_matches_created_at")
    op.execute("DROP INDEX IF EXISTS ix_matches_dog_id")
    op.execute("DROP INDEX IF EXISTS ix_matches_requester_id")
    op.execute("DROP TABLE IF EXISTS matches")
    op.execute("DROP TYPE IF EXISTS match_status")
