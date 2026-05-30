from datetime import datetime
import requests
from flask import Blueprint, request

from config import SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

onboarding_bp = Blueprint("onboarding", __name__)

TABLE_NAME = "mindscape_onboarding"
SUPABASE_BASE_URL = (SUPABASE_URL or "").rstrip("/")


def _extract_bearer_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        return ""
    if auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return ""


def _validate_supabase_config():
    if not SUPABASE_BASE_URL:
        return "SUPABASE_URL is not configured"
    if not SUPABASE_ANON_KEY:
        return "SUPABASE_ANON_KEY is not configured"
    if not SUPABASE_SERVICE_ROLE_KEY:
        return "SUPABASE_SERVICE_ROLE_KEY is not configured"
    return ""


def _get_user_id(token):
    if not token:
        return None, "Missing authorization token"
    auth_url = f"{SUPABASE_BASE_URL}/auth/v1/user"
    headers = {"Authorization": f"Bearer {token}", "apikey": SUPABASE_ANON_KEY}
    try:
        resp = requests.get(auth_url, headers=headers, timeout=10)
    except requests.exceptions.RequestException as exc:
        return None, f"Supabase auth request failed: {exc}"

    if not resp.ok:
        return None, "Invalid or expired session"

    payload = resp.json() or {}
    return payload.get("id"), ""


def _service_headers():
    return {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation, resolution=merge-duplicates",
    }


def _clean_str(value):
    if value is None:
        return None
    text = str(value).strip()
    return text if text else None


def _clean_list(value):
    if not isinstance(value, list):
        return None
    cleaned = [str(item).strip() for item in value if str(item).strip()]
    return cleaned or None


@onboarding_bp.route("/api/onboarding", methods=["GET"])
def get_onboarding():
    config_error = _validate_supabase_config()
    if config_error:
        return {"error": config_error}, 500

    token = _extract_bearer_token()
    user_id, auth_error = _get_user_id(token)
    if auth_error:
        return {"error": auth_error}, 401

    rest_url = f"{SUPABASE_BASE_URL}/rest/v1/{TABLE_NAME}"
    params = {"select": "*", "user_id": f"eq.{user_id}", "limit": 1}

    try:
        resp = requests.get(rest_url, headers=_service_headers(), params=params, timeout=10)
    except requests.exceptions.RequestException as exc:
        return {"error": f"Supabase request failed: {exc}"}, 502

    if not resp.ok:
        return {"error": "Failed to load onboarding"}, 502

    rows = resp.json() or []
    record = rows[0] if rows else None
    return {"onboarding": record}


@onboarding_bp.route("/api/onboarding", methods=["POST"])
def upsert_onboarding():
    config_error = _validate_supabase_config()
    if config_error:
        return {"error": config_error}, 500

    token = _extract_bearer_token()
    user_id, auth_error = _get_user_id(token)
    if auth_error:
        return {"error": auth_error}, 401

    data = request.get_json() or {}

    payload = {
        "user_id": user_id,
        "first_name": _clean_str(data.get("first_name")),
        "age_range": _clean_str(data.get("age_range")),
        "profession": _clean_str(data.get("profession")),
        "relationship_status": _clean_str(data.get("relationship_status")),
        "stress_support": _clean_str(data.get("stress_support")),
        "difficulties": _clean_list(data.get("difficulties")),
        "goals": _clean_list(data.get("goals")),
        "emergency_contact_name": _clean_str(data.get("emergency_contact_name")),
        "emergency_contact_phone": _clean_str(data.get("emergency_contact_phone")),
        "emergency_contact_relation": _clean_str(data.get("emergency_contact_relation")),
        "consent_notify": bool(data.get("consent_notify")),
        "completed": bool(data.get("completed", True)),
        "updated_at": datetime.utcnow().isoformat(),
    }

    rest_url = f"{SUPABASE_BASE_URL}/rest/v1/{TABLE_NAME}"
    params = {"on_conflict": "user_id"}

    try:
        resp = requests.post(rest_url, headers=_service_headers(), params=params, json=payload, timeout=10)
    except requests.exceptions.RequestException as exc:
        return {"error": f"Supabase request failed: {exc}"}, 502

    if not resp.ok:
        return {"error": "Failed to save onboarding"}, 502

    rows = resp.json() or []
    record = rows[0] if rows else payload
    return {"onboarding": record}
