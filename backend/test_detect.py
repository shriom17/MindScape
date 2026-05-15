#!/usr/bin/env python3
import base64, cv2, numpy as np, requests, json, sys, traceback

try:
    img = np.full((224,224,3), 255, dtype=np.uint8)
    ok, buf = cv2.imencode('.jpg', img)
    if not ok:
        print('cv2 encoding failed', file=sys.stderr)
        sys.exit(1)
    b64 = base64.b64encode(buf.tobytes()).decode()
    r = requests.post('http://127.0.0.1:5000/api/detect-mood', json={'frame': b64}, timeout=15)
    print('STATUS:', r.status_code)
    try:
        print('JSON:', r.json())
    except Exception:
        print('TEXT:', r.text)
except Exception:
    traceback.print_exc()
    sys.exit(2)
