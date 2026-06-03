#!/bin/sh
echo "=== ENABLE PGVECTOR ==="
uv run python3 -c "
import psycopg2, os
conn = psycopg2.connect(os.environ['SYNC_DATABASE_URL'])
cur = conn.cursor()
try:
    cur.execute('CREATE EXTENSION IF NOT EXISTS vector')
    conn.commit()
    print('pgvector: ENABLED')
except Exception as e:
    print('pgvector: NOT AVAILABLE -', e)
    conn.rollback()
finally:
    conn.close()
"

echo "=== CREATE MAIN TABLES ==="
uv run python3 -c "
import os
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from app.core.database import Base
import app.models

engine = create_engine(os.environ['SYNC_DATABASE_URL'], poolclass=NullPool)
main_tables = [t for t in Base.metadata.sorted_tables if t.name != 'care_instruction_chunks']
with engine.begin() as conn:
    Base.metadata.create_all(conn, tables=main_tables)
print('Main tables: OK')
engine.dispose()
"

echo "=== CREATE CARE_INSTRUCTION_CHUNKS (needs pgvector) ==="
uv run python3 -c "
import os
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from app.core.database import Base
import app.models

engine = create_engine(os.environ['SYNC_DATABASE_URL'], poolclass=NullPool)
try:
    with engine.begin() as conn:
        Base.metadata.create_all(conn, tables=[Base.metadata.tables['care_instruction_chunks']])
    print('care_instruction_chunks: OK')
except Exception as e:
    print('care_instruction_chunks: SKIPPED -', type(e).__name__)
engine.dispose()
"

echo "=== STAMP ALEMBIC HEAD ==="
uv run alembic stamp head 2>&1

echo "=== VERIFY TABLES ==="
uv run python3 -c "
import psycopg2, os
conn = psycopg2.connect(os.environ['SYNC_DATABASE_URL'])
cur = conn.cursor()
cur.execute(\"SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename\")
print('Tables:', [t[0] for t in cur.fetchall()])
conn.close()
"