from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String

from db import Base


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True)
    emotion = Column(String)
    confidence = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True)
    user_message = Column(String)
    krishna_response = Column(String)
    mood = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
