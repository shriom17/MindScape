# MindScape 🧠

MindScape is an AI-powered mental wellness application that provides users with an interactive space for emotional support, contextual conversations, and mood analysis. The application combines AI-based retrieval techniques and facial emotion recognition to deliver personalized experiences.

## 📸 Screenshots

### Chat Interface

![Chat Screenshot](./assets/chat.png)

### Dashboard

![Dashboard Screenshot](./assets/dashboard.png)


## ✨ Features

- AI-based conversational support
- Retrieval-Augmented Generation (RAG) for contextual responses
- Semantic search using FAISS vector database
- Mood and emotion analysis using DeepFace
- Facial analysis with OpenCV
- User authentication using Supabase
- Personalized dashboard experience
- Fallback retrieval mechanism for reliable responses
- Responsive and user-friendly interface


## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript

### Backend
- Flask
- Python
- REST API

### AI/ML
- LangChain
- HuggingFace Embeddings
- FAISS Vector Database
- DeepFace
- OpenCV

### Database & Services
- Supabase


## 🚀 Installation & Setup

### Clone Repository

```bash
git clone <repository-url>
cd MindScape
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```


## 🔐 Environment Variables

Create a `.env` file inside the frontend folder:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Create a `.env` file inside the backend folder:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note:** Never expose your Supabase service role key in frontend code.


## 🧠 AI Workflow

```
User Input
    ↓
Flask Backend API
    ↓
LangChain RAG Pipeline
    ↓
Text Retrieval using FAISS
    ↓
Relevant Context Generation
    ↓
AI Response

Camera/Image Input
    ↓
OpenCV Processing
    ↓
DeepFace Emotion Analysis
    ↓
Mood Detection
    ↓
Personalized Experience
```


## 📂 Folder Structure

```
MindScape/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── models/
│   └── requirements.txt
│
├── gita_data/
│   └── gita.txt
│
├── assets/
│   ├── chat.png
│   └── dashboard.png
│
└── README.md
```


## 🔮 Future Improvements

- Better personalization using user history
- Improved emotion recognition accuracy
- Mobile application support


## 👨‍💻 Author

**Shriom Pal**

GitHub:  
https://github.com/shriom17