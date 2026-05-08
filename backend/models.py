from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String, Text

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


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    summary = Column(Text)
    mood_tags = Column(String)
    image_url = Column(String)
    read_time_minutes = Column(Integer, default=4)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class SavedStory(Base):
    __tablename__ = "saved_stories"

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    story_id = Column(Integer)
    saved_at = Column(DateTime, default=datetime.utcnow)
