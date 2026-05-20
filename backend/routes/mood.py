import base64
from datetime import datetime, timedelta

try:
    import cv2
    import numpy as np
    from deepface import DeepFace
except Exception as e:  # Optional vision stack; also handles NumPy/OpenCV ABI mismatches.
    import traceback
    print("Vision stack import failed:", e)
    traceback.print_exc()
    cv2 = None
    np = None
    DeepFace = None
from flask import Blueprint, request
from sqlalchemy import desc

from db import SessionLocal
from models import MoodLog

mood_bp = Blueprint("mood", __name__)

EMOTION_SCORES = {
    "happy": 9,
    "neutral": 6,
    "sad": 3,
    "angry": 2,
    "fear": 2,
    "disgust": 2,
    "surprise": 7,
    "calm": 8,
}


def _score_emotion(emotion):
    if not emotion:
        return 5
    return EMOTION_SCORES.get(str(emotion).lower(), 5)


def _confidence_score(confidence):
    try:
        conf = float(confidence)
    except Exception:
        conf = 50.0
    if conf < 0:
        conf = 0.0
    if conf > 100:
        conf = 100.0
    return round(1 + (conf / 100.0) * 9, 1)


def _log_to_dict(log, include_scores=False):
    payload = {
        "emotion": log.emotion,
        "confidence": log.confidence,
        "timestamp": log.timestamp.isoformat() if log.timestamp else None,
    }
    if include_scores:
        payload["mood_score"] = _score_emotion(log.emotion)
        payload["confidence_score"] = _confidence_score(log.confidence)
    return payload


@mood_bp.route("/api/detect-mood", methods=["POST"])
def detect_mood():
    data = request.get_json() or {}
    frame_b64 = data.get("frame", "")

    if not frame_b64:
        return {"error": "No frame provided"}, 400

    if cv2 is None or np is None or DeepFace is None:
        return {
            "error": "Mood detection is unavailable in lightweight mode",
            "emotion": "neutral",
            "confidence": 0.0,
            "all_emotions": {"neutral": 100.0},
        }, 503

    img_bytes = base64.b64decode(frame_b64)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "Could not decode image"}, 400

    result = DeepFace.analyze(
        img_path=frame,
        actions=["emotion"],
        enforce_detection=False,
        detector_backend="opencv",
        silent=True,
    )

    if isinstance(result, list):
        result = result[0]

    dominant_emotion = result.get("dominant_emotion", "neutral")
    emotions = result.get("emotion", {})
    confidence = emotions.get(dominant_emotion, 0)

    db = SessionLocal()
    log = MoodLog(emotion=dominant_emotion, confidence=round(confidence, 1))
    db.add(log)
    db.commit()
    db.close()

    return {
        "emotion": str(dominant_emotion),
        "confidence": float(round(float(confidence), 1)),
        "all_emotions": {k: float(round(float(v), 1)) for k, v in emotions.items()},
    }


@mood_bp.route("/api/moods/latest", methods=["GET"])
def latest_mood():
    db = SessionLocal()
    latest = db.query(MoodLog).order_by(desc(MoodLog.timestamp)).first()
    db.close()

    if not latest:
        return {"emotion": None}

    return {
        "emotion": latest.emotion,
        "confidence": latest.confidence,
        "timestamp": latest.timestamp.isoformat() if latest.timestamp else None,
    }


@mood_bp.route("/api/moods/insights", methods=["GET"])
def mood_insights():
    try:
        trend_limit = max(1, min(int(request.args.get("trend", 12)), 50))
    except Exception:
        trend_limit = 12
    try:
        recent_limit = max(1, min(int(request.args.get("recent", 5)), 20))
    except Exception:
        recent_limit = 5
    try:
        window_days = max(3, min(int(request.args.get("days", 14)), 60))
    except Exception:
        window_days = 14

    now = datetime.utcnow()
    window_start = now - timedelta(days=window_days)
    window_7_start = now - timedelta(days=7)

    db = SessionLocal()
    try:
        latest = db.query(MoodLog).order_by(desc(MoodLog.timestamp)).first()
        trend_logs = db.query(MoodLog).order_by(desc(MoodLog.timestamp)).limit(trend_limit).all()
        recent_logs = db.query(MoodLog).order_by(desc(MoodLog.timestamp)).limit(recent_limit).all()
        window_logs = db.query(MoodLog).filter(MoodLog.timestamp >= window_start).all()
        window_7_logs = db.query(MoodLog).filter(MoodLog.timestamp >= window_7_start).all()
    finally:
        db.close()

    trend_logs = list(reversed(trend_logs))

    mix_counts = {}
    for log in window_logs:
        label = (log.emotion or "Unknown").strip().title()
        mix_counts[label] = mix_counts.get(label, 0) + 1

    total_mix = sum(mix_counts.values()) or 0
    mix = [
        {
            "label": label,
            "count": count,
            "percent": round((count / total_mix) * 100) if total_mix else 0,
        }
        for label, count in sorted(mix_counts.items(), key=lambda item: item[1], reverse=True)
    ]

    streak_days = 0
    date_set = {log.timestamp.date() for log in window_logs if log.timestamp}
    day_cursor = now.date()
    while day_cursor in date_set:
        streak_days += 1
        day_cursor = day_cursor - timedelta(days=1)

    scores_7 = [_score_emotion(log.emotion) for log in window_7_logs]
    avg_mood_score_7d = round(sum(scores_7) / len(scores_7), 1) if scores_7 else None
    confidence_scores_7 = [_confidence_score(log.confidence) for log in window_7_logs]
    avg_confidence_score_7d = round(sum(confidence_scores_7) / len(confidence_scores_7), 1) if confidence_scores_7 else None

    consistency = round((len(date_set) / window_days) * 100) if window_days else 0

    return {
        "latest": _log_to_dict(latest) if latest else None,
        "stats": {
            "streak_days": streak_days,
            "avg_mood_score_7d": avg_mood_score_7d,
            "avg_confidence_score_7d": avg_confidence_score_7d,
            "consistency_14d": consistency,
            "window_days": window_days,
        },
        "trend": [_log_to_dict(log, include_scores=True) for log in trend_logs],
        "recent": [_log_to_dict(log) for log in recent_logs],
        "mix": mix,
    }


