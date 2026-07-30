from flask import Blueprint, request

from db import SessionLocal
from models import ChatLog
from services.llm_service import generate_response
from services.rag_service import get_context

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    user_message = data.get("message", "")
    mood = data.get("mood", "neutral")

    if not user_message:
        return {"error": "No message provided"}, 400

    context = get_context(user_message, k=3)
    reply = generate_response(user_message, context, mood)

    db = SessionLocal()
    log = ChatLog(user_message=user_message, krishna_response=reply, mood=mood)
    db.add(log)
    db.commit()
    db.close()

    return {"response": reply}
