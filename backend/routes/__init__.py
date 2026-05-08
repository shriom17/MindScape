from routes.chat import chat_bp
from routes.health import health_bp
from routes.mood import mood_bp
from routes.stories import stories_bp


def register_routes(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(mood_bp)
    app.register_blueprint(stories_bp)
