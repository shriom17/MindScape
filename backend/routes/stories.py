from datetime import datetime

from flask import Blueprint, request
from sqlalchemy import desc

from db import SessionLocal
from models import SavedStory, Story

stories_bp = Blueprint("stories", __name__)


def _story_to_dict(story):
    tags = [tag.strip() for tag in (story.mood_tags or "").split(",") if tag.strip()]
    return {
        "id": story.id,
        "title": story.title,
        "summary": story.summary,
        "mood_tags": tags,
        "image_url": story.image_url,
        "read_time_minutes": story.read_time_minutes,
        "views": story.views,
        "likes": story.likes,
        "created_at": story.created_at.isoformat() if story.created_at else None,
    }


def _parse_mood_tags(value):
    if isinstance(value, list):
        return ",".join([str(tag).strip() for tag in value if str(tag).strip()])
    return str(value or "").strip()


def _demo_stories():
    return [
        {
            "title": "Calm Waters",
            "summary": "A short reflection on patience and quiet courage.",
            "mood_tags": "calm,neutral,relief",
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            "read_time_minutes": 4,
        },
        {
            "title": "Light After Rain",
            "summary": "Finding hope after a heavy day.",
            "mood_tags": "sad,hope,comfort",
            "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
            "read_time_minutes": 5,
        },
        {
            "title": "The Brave Step",
            "summary": "A small story about courage when fear feels loud.",
            "mood_tags": "fear,brave,focus",
            "image_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
            "read_time_minutes": 6,
        },
        {
            "title": "Golden Morning",
            "summary": "A bright reminder that new beginnings are real.",
            "mood_tags": "happy,joy,energy",
            "image_url": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
            "read_time_minutes": 3,
        },
        {
            "title": "Soft Echoes",
            "summary": "Listening to yourself without judgment.",
            "mood_tags": "anxious,calm,grounded",
            "image_url": "https://images.unsplash.com/photo-1482192505345-5655af888cc4",
            "read_time_minutes": 5,
        },
    ]


@stories_bp.route("/api/stories", methods=["GET"])
def list_stories():
    mood = (request.args.get("mood") or "").strip()
    limit = int(request.args.get("limit", 12))
    offset = int(request.args.get("offset", 0))

    db = SessionLocal()
    query = db.query(Story)
    if mood:
        query = query.filter(Story.mood_tags.ilike(f"%{mood}%"))
    stories = (
        query.order_by(desc(Story.created_at)).offset(offset).limit(limit).all()
    )
    db.close()

    return {"stories": [_story_to_dict(story) for story in stories]}


@stories_bp.route("/api/stories/trending", methods=["GET"])
def trending_stories():
    limit = int(request.args.get("limit", 8))

    db = SessionLocal()
    stories = (
        db.query(Story)
        .order_by(desc(Story.likes), desc(Story.views), desc(Story.created_at))
        .limit(limit)
        .all()
    )
    db.close()

    return {"stories": [_story_to_dict(story) for story in stories]}


@stories_bp.route("/api/stories", methods=["POST"])
def create_story():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    summary = (data.get("summary") or "").strip()

    if not title or not summary:
        return {"error": "title and summary are required"}, 400

    story = Story(
        title=title,
        summary=summary,
        mood_tags=_parse_mood_tags(data.get("mood_tags", "")),
        image_url=(data.get("image_url") or "").strip(),
        read_time_minutes=int(data.get("read_time_minutes") or 4),
        views=0,
        likes=0,
        created_at=datetime.utcnow(),
    )

    db = SessionLocal()
    db.add(story)
    db.commit()
    db.refresh(story)
    db.close()

    return {"story": _story_to_dict(story)}


@stories_bp.route("/api/stories/seed-demo", methods=["POST"])
def seed_demo_stories():
    db = SessionLocal()
    existing = db.query(Story).count()
    if existing > 0:
        db.close()
        return {"inserted": 0}

    demo = []
    for item in _demo_stories():
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
    inserted = len(demo)
    db.close()

    return {"inserted": inserted}


@stories_bp.route("/api/stories/<int:story_id>/view", methods=["POST"])
def add_view(story_id):
    db = SessionLocal()
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        db.close()
        return {"error": "Story not found"}, 404

    story.views = (story.views or 0) + 1
    db.commit()
    views = story.views
    db.close()

    return {"views": views}


@stories_bp.route("/api/stories/<int:story_id>/like", methods=["POST"])
def add_like(story_id):
    db = SessionLocal()
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        db.close()
        return {"error": "Story not found"}, 404

    story.likes = (story.likes or 0) + 1
    db.commit()
    likes = story.likes
    db.close()

    return {"likes": likes}


@stories_bp.route("/api/stories/<int:story_id>/save", methods=["POST"])
def save_story(story_id):
    data = request.get_json() or {}
    user_id = (data.get("user_id") or "").strip()

    if not user_id:
        return {"error": "user_id is required"}, 400

    db = SessionLocal()
    existing = (
        db.query(SavedStory)
        .filter(SavedStory.user_id == user_id, SavedStory.story_id == story_id)
        .first()
    )
    if existing:
        db.close()
        return {"saved": True}

    saved = SavedStory(user_id=user_id, story_id=story_id, saved_at=datetime.utcnow())
    db.add(saved)
    db.commit()
    db.close()

    return {"saved": True}


@stories_bp.route("/api/stories/<int:story_id>/save", methods=["DELETE"])
def unsave_story(story_id):
    data = request.get_json() or {}
    user_id = (data.get("user_id") or "").strip()

    if not user_id:
        return {"error": "user_id is required"}, 400

    db = SessionLocal()
    existing = (
        db.query(SavedStory)
        .filter(SavedStory.user_id == user_id, SavedStory.story_id == story_id)
        .first()
    )
    if not existing:
        db.close()
        return {"saved": False}

    db.delete(existing)
    db.commit()
    db.close()

    return {"saved": False}


@stories_bp.route("/api/users/<user_id>/saved-stories", methods=["GET"])
def list_saved_stories(user_id):
    db = SessionLocal()
    stories = (
        db.query(Story)
        .join(SavedStory, SavedStory.story_id == Story.id)
        .filter(SavedStory.user_id == user_id)
        .order_by(desc(SavedStory.saved_at))
        .all()
    )
    db.close()

    return {"stories": [_story_to_dict(story) for story in stories]}
