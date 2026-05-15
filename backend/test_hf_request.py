#!/usr/bin/env python3
"""Simple test script for Hugging Face inference and local ML proxy.

Usage:
  # Direct to Hugging Face (reads HUGGINGFACE_API_TOKEN and HUGGINGFACE_MODEL from env)
  python test_hf_request.py ./face.jpg

  # Send to local proxy (Flask route /api/ml/predict)
  python test_hf_request.py --proxy http://localhost:5000/api/ml/predict ./face.jpg

This script does NOT store tokens; it reads them from environment variables.
"""
import os
import sys
import argparse
import base64
import requests


def post_to_hf(image_path: str):
    token = os.getenv("HUGGINGFACE_API_TOKEN")
    model = os.getenv("HUGGINGFACE_MODEL")
    if not token or not model:
        print("ERROR: Set HUGGINGFACE_API_TOKEN and HUGGINGFACE_MODEL in your environment or .env file.")
        sys.exit(1)
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "image/jpeg"}
    with open(image_path, "rb") as fh:
        data = fh.read()
    try:
        r = requests.post(url, headers=headers, data=data, timeout=60)
    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return
    print("Status:", r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)


def post_to_proxy(image_path: str, proxy_url: str):
    with open(image_path, "rb") as fh:
        data = fh.read()
    b64 = base64.b64encode(data).decode()
    try:
        r = requests.post(proxy_url, json={"image": b64}, timeout=60)
    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return
    print("Status:", r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("image", help="Path to image file (jpg/png)")
    p.add_argument("--proxy", help="Proxy URL (e.g. http://localhost:5000/api/ml/predict)")
    args = p.parse_args()
    if args.proxy:
        post_to_proxy(args.image, args.proxy)
    else:
        post_to_hf(args.image)


if __name__ == '__main__':
    main()
