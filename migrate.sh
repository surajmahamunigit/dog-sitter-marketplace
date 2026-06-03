#!/bin/sh
echo "=== ENABLE PGVECTOR ==="
uv run python3 -c "
import psycopg2, os
conn = psycopg2.connect(os.environ['SYNC_DATABASE_URL'])
cur = conn.cursor()
cur.execute('CREATE EXTENSION IF NOT EXISTS vector')
conn.commit()
conn.close()
print('pgvector: OK')
"

echo "=== CREATE ALL TABLES ==="
uv run python3 -c "
import os
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from app.core.database import Base
import app.models

engine = create_engine(os.environ['SYNC_DATABASE_URL'], poolclass=NullPool)
Base.metadata.create_all(engine)
engine.dispose()
print('create_all: DONE')
"

echo "=== STAMP ALEMBIC HEAD ==="
uv run alembic stamp head 2>&1
echo "Stamp exit code: $?"

echo "=== VERIFY TABLES ==="
uv run python3 -c "
import psycopg2, os
conn = psycopg2.connect(os.environ['SYNC_DATABASE_URL'])
cur = conn.cursor()
cur.execute(\"SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename\")
print('Tables:', [t[0] for t in cur.fetchall()])
conn.close()
"