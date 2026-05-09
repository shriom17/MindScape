import os
import sys
from sqlalchemy import create_engine, text

# Ensure project root (backend/) is on sys.path for local imports
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from config import DATABASE_URL

def main():
    print('DATABASE_URL=', DATABASE_URL)
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        try:
            r = conn.execute(text('SELECT count(*) FROM stories'))
            print('stories count:', r.scalar())
            rows = conn.execute(text('SELECT id, title FROM stories ORDER BY id DESC LIMIT 10')).fetchall()
            print('latest rows:')
            for row in rows:
                print(row)
        except Exception as e:
            print('error reading stories table:', e)

if __name__ == '__main__':
    main()
