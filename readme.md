MindScape
=========

MindScape is a mental wellness web app that blends mood tracking, calming stories, and a gentle AI companion inspired by the Bhagavad Gita. It is built for everyday users who want quick, private check-ins and small supportive actions.

How MindScape helps people
--------------------------
- Daily mood check-ins help users understand how they are feeling.
- Calming stories and music help reduce stress.
- Keshava chat offers gentle guidance and small positive steps.
- The helpline page points users toward professional support.
- Trends, streaks, and consistency help build healthy habits.

Pages and Functions
-------------------
- / and /register: Sign up/login (email/password or Google), basic onboarding.
- /home: Camera-based mood scan, countdown, mood result, Keshava chat.
- /dashboard: Mood insights, streak/average/consistency, recent scans, trend view, quick actions.
- /tracker: Daily mood selection + note saving, short self-assessment, mood score, low-score prompt to chat.
- /stories: Mood-based stories, trending, save/read/like, demo stories seed.
- /music: Curated tracks + Jamendo, play/pause/stop, mini player.
- /profile: Avatar upload, name/birthdate update, daily mood badge.
- /helpline: Psychologists/counselors list with guidance notes.

Core Features
-------------
- Mood scan with optional computer vision.
- Daily tracker with quick self-assessment.
- AI companion chat (Keshava).
- Story and music libraries for calming breaks.
- Helpline directory for real-world support.

Quick Start (Local)
-------------------
1) Install dependencies

```bash
cd frontend
npm install

cd ../backend
pip install -r requirements.txt
```

2) Run the backend

```bash
cd backend
python app.py
```

3) Run the frontend

```bash
cd frontend
npm run dev
```

Optional: Enable Full ML Features
---------------------------------
```bash
cd backend
pip install -r requirements-ml.txt
```

Tech Stack
----------
- Frontend: React 19, Vite, React Router, Tailwind CSS
- Backend: Flask, SQLAlchemy, SQLite (default)
- Optional ML/LLM: Groq, LangChain, FAISS, DeepFace, Hugging Face inference

License
-------
Add your preferred license here.
