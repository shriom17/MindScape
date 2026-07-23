import base64

def test_detect_mood_without_frame(client):

    response = client.post(
        "/api/detect-mood",
        json={}
    )

    assert response.status_code == 400
    assert response.json["error"] == "No frame provided"


def test_invalid_image(client):

    fake = base64.b64encode(b"abcd").decode()

    response = client.post(
        "/api/detect-mood",
        json={
            "frame": fake
        }
    )

    assert response.status_code == 400