import base64

import cv2
import numpy as np
from deepface import DeepFace
from flask import Blueprint, request

from db import SessionLocal
from models import MoodLog

mood_bp = Blueprint("mood", __name__)


@mood_bp.route("/api/detect-mood", methods=["POST"])
def detect_mood():
    data = request.get_json() or {}
    frame_b64 = data.get("frame", "")

    if not frame_b64:
        return {"error": "No frame provided"}, 400

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
