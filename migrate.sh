#!/bin/sh
echo "=== STAMP BASE ==="
uv run alembic --raiseerr stamp base 2>&1
echo "Stamp exit code: $?"

echo "=== UPGRADE HEAD ==="
uv run alembic --raiseerr upgrade head 2>&1
echo "Upgrade exit code: $?"

echo "=== CURRENT REVISION ==="
uv run alembic current 2>&1

echo "=== VERIFY TABLES ==="
uv run python3 -c "
import psycopg2, os
url = os.environ.get('SYNC_DATABASE_URL')
print('SYNC_URL set:', bool(url))
conn = psycopg2.connect(url)
cur = conn.cursor()
cur.execute(\"SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY schemaname, tablename\")
tables = cur.fetchall()
print('All tables:', tables)
conn.close()
"
echo "Verify exit code: $?"