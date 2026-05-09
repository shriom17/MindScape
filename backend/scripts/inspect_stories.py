import sqlite3
import sys

DB = 'database/mindscape.db'
try:
    conn = sqlite3.connect(DB)
except Exception as e:
    print('ERR CONNECT', e)
    sys.exit(1)
cur = conn.cursor()
try:
    rows = cur.execute("SELECT id,title,summary,views FROM stories ORDER BY id").fetchall()
except Exception as e:
    print('ERR QUERY', e)
    sys.exit(1)

for r in rows:
    id, title, summary, views = r
    print(f"ID:{id} | Title:{title} | Views:{views}")
    print('---- summary start ----')
    print(summary or '')
    print('---- summary end ----\n')

conn.close()
