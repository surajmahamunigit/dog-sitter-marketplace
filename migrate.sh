#!/bin/sh
set -e

echo "Enabling pgvector..."
uv run python3 -c "
import psycopg2, os
conn = psycopg2.connect(os.environ['SYNC_DATABASE_URL'])
cur = conn.cursor()
cur.execute('CREATE EXTENSION IF NOT EXISTS vector')
conn.commit()
conn.close()
"

echo "Creating tables..."
uv run python3 -c "
import os
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from app.core.database import Base
import app.models

engine = create_engine(os.environ['SYNC_DATABASE_URL'], poolclass=NullPool)
with engine.begin() as conn:
    Base.metadata.create_all(conn)
engine.dispose()
"

uv run alembic stamp head 2>&1
echo "Migration complete."