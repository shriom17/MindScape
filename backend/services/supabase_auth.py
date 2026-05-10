import os
import requests
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY


def get_user_from_token(token: str):
    """Return user info dict if token is valid, otherwise None."""
    if not token or not SUPABASE_URL:
        return None

    headers = {"Authorization": f"Bearer {token}"}
    if SUPABASE_SERVICE_ROLE_KEY:
        headers["apikey"] = SUPABASE_SERVICE_ROLE_KEY
    elif SUPABASE_ANON_KEY:
        headers["apikey"] = SUPABASE_ANON_KEY

    try:
        url = SUPABASE_URL.rstrip("/") + "/auth/v1/user"
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return None


def require_auth(func):
    from functools import wraps
    from flask import request, g

    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization") or ""
        token = None
        if auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1]

        user = get_user_from_token(token)
        if not user:
            return {"error": "Unauthorized"}, 401

        g.user = user
        return func(*args, **kwargs)

    return wrapper
