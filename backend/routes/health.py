from flask import Blueprint

health_bp = Blueprint("health", __name__)


@health_bp.route("/api/health")
def health():
    return {"status": "ok", "message": "MindScape is alive!"}
