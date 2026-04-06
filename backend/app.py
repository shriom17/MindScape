from flask import Flask
from flask_cors import CORS
from config import ALLOWED_ORIGINS
from db import init_db
from routes import register_routes

app = Flask(__name__)
CORS(app, origins=ALLOWED_ORIGINS)
init_db()
register_routes(app)

if __name__ == "__main__":
    print("MindScape backend starting...")
    app.run(debug=True, port=5000)