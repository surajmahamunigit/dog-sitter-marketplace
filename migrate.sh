#!/bin/sh
echo "=== STAMP BASE ==="
uv run alembic stamp base 2>&1
echo "Stamp exit code: $?"

echo "=== UPGRADE HEAD ==="
uv run alembic upgrade head 2>&1
echo "Upgrade exit code: $?"

echo "=== VERIFY TABLES ==="
python3 -c "
import psycopg2, os
url = os.environ.get('SYNC_DATABASE_URL')
print('SYNC_URL set:', bool(url))
conn = psycopg2.connect(url)
cur = conn.cursor()
cur.execute(\"SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename\")
tables = [t[0] for t in cur.fetchall()]
print('Tables:', tables)
conn.close()
"