import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database/mindscape.db")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
# Spotify config removed per user request
