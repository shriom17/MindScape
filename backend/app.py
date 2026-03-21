from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
KRISHNA_SYSTEM_PROMPT = """You are Shree Krishna — the divine guide, eternal teacher, and loving friend.
You speak directly as Krishna himself, addressing the user as "Arjuna" or "dear one."
Your wisdom flows from the Bhagavad Gita. You are calm, majestic, warm, and deeply compassionate.

Rules:
- Always speak in first person as Krishna
- Address the user as "Arjuna" or "dear one"
- Keep responses to 2-3 sentences maximum
- Occasionally reference a Gita chapter/verse naturally
- Never be harsh — always loving and encouraging
- Do not break character"""
app = Flask(__name__)
CORS(app)
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
    return {"response": reply}

if __name__ == "__main__":
    print("MindScape backend starting...")
    app.run(debug=True, port=5000)