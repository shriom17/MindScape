from datetime import datetime

from flask import Blueprint, request
from sqlalchemy import desc

from db import SessionLocal
from models import SavedStory, Story
import hashlib
import feedparser
import re

stories_bp = Blueprint("stories", __name__)

HIDDEN_STORY_TITLES = {
    "Golden Morning",
}

DEMO_STORY_TITLES = {
    "Echoes of Kurukshetra",
    "Sita's Lantern",
    "Arrow at Dusk",
    "The Hidden Quill",
    "Train of Letters",
    "Garden of Red Hibiscus",
    "Calm Waters",
    "Light After Rain",
    "The Brave Step",
    "Soft Echoes",
}


def _is_hidden_story_title(title):
    return (title or "").strip() in HIDDEN_STORY_TITLES


def _story_summary(*lines):
    return "\n".join(line.strip() for line in lines if line and line.strip())


def _demo_story_map():
    return {item["title"]: item for item in _demo_stories()}


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


def _html_to_text(html):
    try:
        from bs4 import BeautifulSoup

        return BeautifulSoup(html or "", "html.parser").get_text().strip()
    except Exception:
        # Fallback: strip tags naively
        return re.sub(r"<[^>]+>", "", str(html or "")).strip()


def _extract_image_from_entry(entry):
    # Try common feed image locations
    try:
        if hasattr(entry, "media_content") and entry.media_content:
            first = entry.media_content[0]
            if isinstance(first, dict) and first.get("url"):
                return first.get("url")
    except Exception:
        pass

    try:
        if hasattr(entry, "links") and entry.links:
            for l in entry.links:
                # enclosure images
                if l.get("rel") == "enclosure" and l.get("type", "").startswith("image"):
                    return l.get("href") or l.get("url")
                if l.get("type", "").startswith("image"):
                    return l.get("href") or l.get("url")
    except Exception:
        pass

    # Parse HTML summary for first <img>
    try:
        from bs4 import BeautifulSoup

        html = getattr(entry, "summary", "") or getattr(entry, "description", "") or ""
        soup = BeautifulSoup(html, "html.parser")
        img = soup.find("img")
        if img and img.get("src"):
            return img.get("src")
    except Exception:
        pass

    return None


def _demo_stories():
    return [
        {
            "title": "Arjuna's Doubt",
            "summary": _story_summary(
                "At the edge of Kurukshetra, Arjuna's hesitation becomes a lesson in duty, clarity, and the courage to act.",
                "The silence before battle is heavier than the clash of weapons, because it asks a person to decide what kind of life is worth defending.",
                "He sees that fear does not always mean weakness; sometimes it means the heart is awake enough to understand the cost.",
                "Krishna's presence steadies him, not by removing doubt, but by giving meaning to responsibility.",
                "In that moment, courage is no longer loud or theatrical.",
                "It is simply the choice to stand, breathe, and move forward with purpose.",
            ),
            "mood_tags": "mahabharata,reflective,brave",
            "image_url": "",
            "read_time_minutes": 4,
        },
        {
            "title": "Krishna's Counsel",
            "summary": _story_summary(
                "A measured voice in a storm of conflict shows how wisdom can steady the heart before a difficult choice.",
                "Krishna's words do not erase doubt, but they turn confusion into purpose and help Arjuna see beyond fear.",
                "He speaks of duty, of consequence, and of acting without becoming trapped by the result.",
                "The lesson is gentle, but it changes everything.",
                "A mind that was split between grief and obligation begins to align with a higher sense of service.",
                "Wisdom here is not abstract; it is a hand on the shoulder in the middle of chaos.",
            ),
            "mood_tags": "mahabharata,wisdom,calm",
            "image_url": "",
            "read_time_minutes": 4,
        },
        {
            "title": "Hanuman's Leap",
            "summary": _story_summary(
                "A single leap across the sea turns devotion into action and proves that faith can become force.",
                "With every step toward Lanka, Hanuman carries not just courage, but complete trust in the cause he serves.",
                "The distance is immense, yet the task feels smaller than the devotion driving him forward.",
                "He does not move for recognition or reward.",
                "He moves because service itself has become his strength.",
                "That is why the leap feels impossible to onlookers, but natural to the one who believes completely.",
            ),
            "mood_tags": "ramayan,devotion,brave",
            "image_url": "",
            "read_time_minutes": 3,
        },
        {
            "title": "Sita in Exile",
            "summary": _story_summary(
                "A steadfast journey through uncertainty reveals resilience, dignity, and the strength hidden in patience.",
                "Even when the road grows harsh, her calm becomes a kind of power that keeps hope alive for everyone watching.",
                "Exile is not only a place; it is also a test of how much grace can remain when comfort is taken away.",
                "She answers hardship with composure and keeps her identity intact even under pressure.",
                "That quiet strength becomes its own kind of victory.",
                "It shows that dignity can survive even when the world becomes unkind.",
            ),
            "mood_tags": "ramayan,devotion,resilience",
            "image_url": "",
            "read_time_minutes": 5,
        },
        {
            "title": "Bhagat Singh's Resolve",
            "summary": _story_summary(
                "A young revolutionary turns conviction into sacrifice and leaves behind a reminder that ideas can outlive fear.",
                "His voice carries through prisons and protests alike, showing that freedom is often paid for with a life lived without surrender.",
                "He understands that a movement needs more than anger; it needs clarity, discipline, and a purpose larger than the self.",
                "The world may try to silence a person, but it cannot easily silence an idea that has already taken root.",
                "His courage becomes a message for the future.",
                "It says that sacrifice has meaning when it protects the freedom of others.",
            ),
            "mood_tags": "freedom,fearless,history",
            "image_url": "",
            "read_time_minutes": 4,
        },
        {
            "title": "Rani Lakshmibai's Stand",
            "summary": _story_summary(
                "At the gates of Jhansi, resolve hardens into resistance as leadership becomes a shield for the people.",
                "Her stand is not only about defending a fort; it is about proving that dignity can rise even when the world tries to break it.",
                "In her presence, fear has less room to grow because her example gives others a reason to endure.",
                "She becomes a symbol of resistance, but also of responsibility.",
                "A ruler protects more than land; she protects courage in the hearts of her people.",
                "That is why the story still feels alive.",
            ),
            "mood_tags": "freedom,brave,history",
            "image_url": "",
            "read_time_minutes": 4,
        },
        {
            "title": "Ashoka After Kalinga",
            "summary": _story_summary(
                "After conquest, remorse opens the door to change and shows how power can be redirected toward peace.",
                "The emperor's grief becomes the beginning of a larger transformation, where rule is measured not by fear, but by compassion.",
                "Victory that leaves only sorrow can force a deeper kind of reflection.",
                "Ashoka's heart changes because he finally sees the human cost of power.",
                "From that pain comes a different vision of leadership.",
                "He begins to rule not just with authority, but with conscience.",
            ),
            "mood_tags": "history,reflection,peace",
            "image_url": "",
            "read_time_minutes": 4,
        },
        {
            "title": "Gandhi's Salt March",
            "summary": _story_summary(
                "A simple walk becomes a mass movement, proving that disciplined nonviolence can challenge an empire.",
                "Step by step, ordinary people turn restraint into rebellion and show that patience can be louder than force.",
                "What begins as a march for salt becomes a larger statement about dignity and self-rule.",
                "The power of the movement lies in its simplicity.",
                "People do not need weapons to insist on justice when they move together with conviction.",
                "That is why the march remains unforgettable.",
            ),
            "mood_tags": "freedom,nonviolence,hope",
            "image_url": "",
            "read_time_minutes": 5,
        },
        {
            "title": "Netaji's Call",
            "summary": _story_summary(
                "A voice from exile gathers determination into action and gives freedom a sharper, urgent horizon.",
                "Netaji's message is urgent, direct, and unafraid, reminding people that waiting can be its own form of defeat.",
                "He speaks as if time itself is an enemy of hesitation.",
                "The call reaches people not as comfort, but as a challenge to rise with discipline and courage.",
                "His strength is in the clarity of his belief.",
                "Freedom, for him, is something that must be pursued with purpose.",
            ),
            "mood_tags": "freedom,leadership,history",
            "image_url": "",
            "read_time_minutes": 6,
        },
        {
            "title": "Sardar Patel's Unity",
            "summary": _story_summary(
                "A nation comes together when patience, firmness, and trust are used to stitch many paths into one.",
                "His steady work shows that unity is not accidental; it is built through difficult choices, quiet persistence, and a clear sense of purpose.",
                "He understands that independence is fragile unless people learn how to stand together.",
                "The work is often unseen, but the impact is lasting.",
                "A scattered nation begins to feel whole because someone had the patience to hold it together.",
                "Unity, in this story, is an act of strength.",
            ),
            "mood_tags": "freedom,unity,history",
            "image_url": "",
            "read_time_minutes": 3,
        },
    ]


@stories_bp.route("/api/stories", methods=["GET"])
def list_stories():
    mood = (request.args.get("mood") or "").strip()
    limit = int(request.args.get("limit", 12))
    offset = int(request.args.get("offset", 0))

    db = SessionLocal()
    query = db.query(Story)
    query = query.filter(~Story.title.in_(HIDDEN_STORY_TITLES))
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
        .filter(~Story.title.in_(HIDDEN_STORY_TITLES))
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


@stories_bp.route("/api/stories/<int:story_id>", methods=["GET"])
def get_story(story_id):
    db = SessionLocal()
    story = db.query(Story).filter(Story.id == story_id).first()
    db.close()

    if not story or _is_hidden_story_title(story.title):
        return {"error": "Story not found"}, 404

    return {"story": _story_to_dict(story)}


@stories_bp.route("/api/stories/seed-demo", methods=["POST"])
def seed_demo_stories():
    # Optional query param: ?force=1 will remove existing stories and insert demo set
    force = (request.args.get("force") or "").lower() in ("1", "true", "yes")

    db = SessionLocal()
    db.query(Story).filter(Story.title.in_(HIDDEN_STORY_TITLES)).delete(synchronize_session=False)
    db.commit()

    existing = db.query(Story).count()
    existing_titles = {title for (title,) in db.query(Story.title).all()}
    demo_map = _demo_story_map()
    demo_titles = set(demo_map.keys())
    demo_only = bool(existing_titles) and existing_titles.issubset(demo_titles)

    if existing > 0 and not force and not demo_only:
        existing_demo_stories = db.query(Story).filter(Story.title.in_(demo_titles)).all()
        existing_demo_titles = set()

        for story in existing_demo_stories:
            demo_item = demo_map.get(story.title)
            if not demo_item:
                continue
            story.summary = demo_item["summary"]
            story.mood_tags = demo_item["mood_tags"]
            story.image_url = demo_item["image_url"]
            story.read_time_minutes = demo_item["read_time_minutes"]
            story.created_at = story.created_at or datetime.utcnow()
            existing_demo_titles.add(story.title)

        missing_demo_titles = demo_titles - existing_demo_titles
        for title in missing_demo_titles:
            demo_item = demo_map[title]
            db.add(
                Story(
                    title=demo_item["title"],
                    summary=demo_item["summary"],
                    mood_tags=demo_item["mood_tags"],
                    image_url=demo_item["image_url"],
                    read_time_minutes=demo_item["read_time_minutes"],
                    views=0,
                    likes=0,
                    created_at=datetime.utcnow(),
                )
            )

        db.commit()
        db.close()
        return {"inserted": len(missing_demo_titles), "updated": len(existing_demo_titles)}

    if force or demo_only:
        # remove existing stories to ensure demo set is clean
        try:
            db.query(Story).delete()
            db.commit()
        except Exception:
            db.rollback()

    demo = []
    for item in _demo_story_map().values():
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


@stories_bp.route("/api/stories/from-rss", methods=["GET"])
def stories_from_rss():
    url = (request.args.get("url") or "").strip()
    if not url:
        return {"error": "url is required"}, 400

    limit = int(request.args.get("limit", 8))

    feed = feedparser.parse(url)
    items = []
    for entry in (feed.entries or [])[:limit]:
        title = getattr(entry, "title", "") or ""
        summary_html = getattr(entry, "summary", "") or getattr(entry, "description", "") or ""
        summary_text = _html_to_text(summary_html)[:1000]

        image_url = _extract_image_from_entry(entry)

        # estimate read time (words per 200 wpm)
        words = len(summary_text.split())
        read_time = max(1, (words + 199) // 200)

        created_at = getattr(entry, "published", None) or getattr(entry, "updated", None)

        entry_unique = getattr(entry, "id", None) or getattr(entry, "link", None) or title
        uid = hashlib.md5((url + str(entry_unique)).encode("utf-8", errors="ignore")).hexdigest()[:12]

        items.append(
            {
                "id": f"rss_{uid}",
                "title": title[:300],
                "summary": summary_text,
                "mood_tags": ["rss"],
                "image_url": image_url,
                "read_time_minutes": read_time,
                "views": 0,
                "likes": 0,
                "created_at": created_at,
            }
        )

    return {"stories": items}


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
        .filter(~Story.title.in_(HIDDEN_STORY_TITLES))
        .filter(SavedStory.user_id == user_id)
        .order_by(desc(SavedStory.saved_at))
        .all()
    )
    db.close()

    return {"stories": [_story_to_dict(story) for story in stories]}
