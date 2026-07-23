import pytest
from app import app as flask_app

@pytest.fixture
def app():
    flask_app.config["TESTING"] = True
    return flask_app