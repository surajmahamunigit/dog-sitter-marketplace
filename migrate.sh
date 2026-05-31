#!/bin/sh
echo "=== DIRECT DB TEST ==="
uv run python3 -c "
import psycopg2, os
url = os.environ.get('SYNC_DATABASE_URL')
conn = psycopg2.connect(url)
cur = conn.cursor()
cur.execute('CREATE TABLE IF NOT EXISTS _test (id int)')
conn.commit()
cur.execute('SELECT count(*) FROM _test')
print('Test table exists:', cur.fetchone())
cur.execute('DROP TABLE _test')
conn.commit()
print('Direct psycopg2: PASSED')
conn.close()
"

echo "=== STAMP BASE ==="
uv run alembic stamp base 2>&1
echo "Stamp exit code: $?"

echo "=== UPGRADE HEAD ==="
uv run alembic upgrade head 2>&1
echo "Upgrade exit code: $?"

echo "=== VERIFY TABLES ==="
uv run python3 -c "
import psycopg2, os
url = os.environ.get('SYNC_DATABASE_URL')
conn = psycopg2.connect(url)
cur = conn.cursor()
cur.execute(\"SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY schemaname, tablename\")
print('All tables:', cur.fetchall())
conn.close()
"