import os
import base64
import requests
from flask import Blueprint, request
from dotenv import load_dotenv, dotenv_values
from pathlib import Path

ml_bp = Blueprint("ml", __name__)
ENV_PATH = Path(__file__).resolve().parents[1] / '.env'

# Try to explicitly load backend/.env so route has access to HF vars
try:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH, override=True)
        print(f"ML proxy: loaded .env from {ENV_PATH}")
    else:
        load_dotenv(override=True)
        print("ML proxy: no backend .env found, used default load_dotenv()")
except Exception:
    # don't crash on dotenv problems
    pass


@ml_bp.route('/api/ml/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    image_b64 = data.get('image') or ''
    if not image_b64:
        return {"error": "No image provided"}, 400

    try:
        image_bytes = base64.b64decode(image_b64)
    except Exception:
        return {"error": "Invalid base64 image"}, 400

    hf_token = os.environ.get('HUGGINGFACE_API_TOKEN') or os.environ.get('HF_API_TOKEN')
    hf_model = os.environ.get('HUGGINGFACE_MODEL') or os.environ.get('HF_MODEL')

    # Re-load env at request time in case server started before .env was created
    if not hf_token or not hf_model:
        try:
            if ENV_PATH.exists():
                load_dotenv(ENV_PATH, override=True)
            else:
                load_dotenv(override=True)
        except Exception:
            pass
        hf_token = os.environ.get('HUGGINGFACE_API_TOKEN') or os.environ.get('HF_API_TOKEN')
        hf_model = os.environ.get('HUGGINGFACE_MODEL') or os.environ.get('HF_MODEL')

    # If still missing, fall back to reading .env directly
    if (not hf_token or not hf_model) and ENV_PATH.exists():
        try:
            env_values = dotenv_values(ENV_PATH)
        except Exception:
            env_values = {}
        hf_token = hf_token or env_values.get('HUGGINGFACE_API_TOKEN') or env_values.get('HF_API_TOKEN')
        hf_model = hf_model or env_values.get('HUGGINGFACE_MODEL') or env_values.get('HF_MODEL')

    if not hf_token or not hf_model:
        print(
            "ML proxy: missing env vars "+
            f"(token_set={bool(hf_token)}, model_set={bool(hf_model)}), "
            f"env_path={ENV_PATH}, cwd={os.getcwd()}"
        )
        return {
            "error": "Hugging Face token or model not configured (set HUGGINGFACE_API_TOKEN and HUGGINGFACE_MODEL)",
            "hint": f"Expected env at {ENV_PATH}. Restart backend after editing."
        }, 500

    url = f'https://api-inference.huggingface.co/models/{hf_model}'
    headers = {"Authorization": f"Bearer {hf_token}", "Content-Type": "image/jpeg"}

    # debug log
    print(f"ML proxy: forwarding image to HF model {hf_model} (bytes={len(image_bytes)})")
    try:
        resp = requests.post(url, headers=headers, data=image_bytes, timeout=30)
    except requests.exceptions.RequestException as e:
        print("ML proxy: request to HF failed:", e)
        return {"error": f"Request to Hugging Face failed: {str(e)}"}, 502

    print(f"ML proxy: HF responded status={resp.status_code}")
    if not resp.ok:
        return {"error": f"Hugging Face responded with status {resp.status_code}", "detail": resp.text}, resp.status_code

    try:
        payload = resp.json()
    except Exception:
        # non-json response
        return {"result": resp.text}

    # typical HF image-classification returns list of {label, score}
    if isinstance(payload, list) and payload:
        top = max(payload, key=lambda x: x.get('score', 0))
        confidence = float(top.get('score', 0)) * 100  # Convert to percentage
        return {
            "emotion": top.get('label'), 
            "confidence": confidence, 
            "raw": payload
        }

    # some models return dicts
    return {"raw": payload}
