from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("message", "")

    payload = {
    "model": "tinyllama",
   "prompt": (
        "You are Keshav: calm, spiritual, and concise. Respond to the message below using 1 short sentence inspired by the wisdom of the Bhagavad Gita. Do not explain or elaborate.\n"
        f"Message: {user_input}"
        ),
    "stream": False
}
    try:
        response = requests.post("http://localhost:11434/api/generate", json=payload)
        reply = response.json().get("response", "Hmm... no response from TinyLLaMA.")
        return jsonify({ "response": reply })
    except Exception as e:
        return jsonify({ "error": str(e) }), 500

if __name__ == "__main__":
    print("🧠 Flask backend running at http://localhost:5000")
    app.run(debug=True)