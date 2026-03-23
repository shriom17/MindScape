from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import base64
import numpy as np
import cv2
from deepface import DeepFace
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

# Database setup
Base = declarative_base()

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

engine = create_engine("sqlite:///database/mindscape.db")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
KRISHNA_SYSTEM_PROMPT = """You are Keshava — the divine guide, eternal teacher, and loving friend.
You speak directly as Keshava himself, addressing the user as "Arjuna" or "dear one."
Your wisdom flows from the Bhagavad Gita. You are calm, majestic, warm, and deeply compassionate.

Rules:
- Always speak in first person as Keshava
- Address the user as "Arjuna" or "dear one"
- Keep responses to 2-3 sentences maximum
- Occasionally reference a Gita chapter/verse naturally
- Never be harsh — always loving and encouraging
- Do not break character"""
def setup_rag():
    loader = TextLoader("gita_data/gita.txt", encoding="utf-8")
    documents = loader.load()
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(documents)
    
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
    
    vectorstore = FAISS.from_documents(chunks, embeddings)
    return vectorstore

vectorstore = setup_rag()

app = Flask(__name__)
CORS(app, origins="*")
load_dotenv()
@app.route("/api/health")
def health():
    return {"status": "ok", "message": "MindScape is alive!"}

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return {"error": "No message provided"}, 400
      # RAG - relevant Gita verses fetch koro
    relevant_docs = vectorstore.similarity_search(user_message, k=3)
    context = "\n".join([doc.page_content for doc in relevant_docs])

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": KRISHNA_SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ],
        max_tokens=150,
        temperature=0.75,
    )

    reply = completion.choices[0].message.content.strip()
    db = Session()
    log = ChatLog(user_message=user_message, krishna_response=reply, mood="neutral")
    db.add(log)
    db.commit()
    db.close()
    return {"response": reply}

@app.route("/api/detect-mood", methods=["POST"])
def detect_mood():
    data = request.get_json()
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
        silent=True
    )

    if isinstance(result, list):
        result = result[0]

    dominant_emotion = result.get("dominant_emotion", "neutral")
    emotions = result.get("emotion", {})
    confidence = emotions.get(dominant_emotion, 0)
    db = Session()
    log = MoodLog(emotion=dominant_emotion, confidence=round(confidence, 1))
    db.add(log)
    db.commit()
    db.close()

    return {
    "emotion": str(dominant_emotion),
    "confidence": float(round(float(confidence), 1)),
    "all_emotions": {k: float(round(float(v), 1)) for k, v in emotions.items()}
}

if __name__ == "__main__":
    print("MindScape backend starting...")
    app.run(debug=True, port=5000)