import os
import sys
from datetime import datetime

# Ensure backend path
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from db import SessionLocal, init_db
from routes import stories
from models import Story


def main():
    init_db()
    db = SessionLocal()
    # delete existing
    db.query(Story).delete()
    db.commit()

    demo = []
    for item in stories._demo_stories():
        demo.append(
            Story(
                title=item["title"],
                summary=item["summary"],
                mood_tags=item["mood_tags"],
                image_url=item["image_url"],
                read_time_minutes=item["read_time_minutes"],
                views=0,
                likes=0,
                created_at=datetime.utcnow(),
            )
        )

    db.add_all(demo)
    db.commit()
    print('inserted', len(demo))
    db.close()


if __name__ == '__main__':
    main()
