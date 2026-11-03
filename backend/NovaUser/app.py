"""Flask application factory and integration hook for NovaUser."""

from __future__ import annotations

import logging

from flask import Flask, jsonify, request
from flask_cors import CORS

from .config import ConfigError, get_settings
from .database import DatabaseUnavailable, create_schema

logger = logging.getLogger(__name__)

_BLUEPRINT_NAME = "novauser_auth"


def _cors(app: Flask) -> None:
    settings = get_settings()
    CORS(
        app,
        resources={r"/api/novauser/*": {"origins": settings.cors_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Accept"],
        expose_headers=["Content-Type"],
        methods=["GET", "POST", "OPTIONS"],
        max_age=600,
    )


def _register_blueprint(app: Flask) -> None:
    if _BLUEPRINT_NAME in app.blueprints:
        return
    from .routes import bp

    app.register_blueprint(bp)


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(404)
    def not_found(error):  # pragma: no cover - trivial
        if request.path.startswith("/api/novauser"):
            return jsonify(
                {"error": {"code": "not_found", "message": "Endpoint not found."}}
            ), 404
        return error.get_response()

    @app.errorhandler(405)
    def method_not_allowed(error):  # pragma: no cover - trivial
        if request.path.startswith("/api/novauser"):
            return jsonify(
                {"error": {"code": "method_not_allowed", "message": "Method not allowed."}}
            ), 405
        return error.get_response()


def init_novauser(
    app: Flask, create_tables: bool = True, enable_cors: bool = True
) -> Flask:
    """Register NovaUser on an existing Flask app without altering other routes.

    If the database is temporarily unavailable the Flask app still starts; auth
    endpoints report a safe 503 response until PostgreSQL is reachable.  Pass
    ``enable_cors=False`` when the host application already configures CORS for
    the NovaUser routes (for example the combined NovaBase/NovaUser server).
    """

    if enable_cors:
        _cors(app)
    _register_blueprint(app)
    _register_error_handlers(app)

    if create_tables:
        try:
            create_schema()
        except (ConfigError, DatabaseUnavailable) as exc:
            logger.warning("NovaUser schema is not ready: %s", exc)

    return app


def create_app(create_tables: bool = True) -> Flask:
    """Create a standalone NovaUser Flask app (used by tests and tooling)."""

    app = Flask(__name__)
    app.config.update(
        JSON_SORT_KEYS=False,
        MAX_CONTENT_LENGTH=64 * 1024,
    )
    get_settings()  # fail fast with a clear message for a standalone deployment
    init_novauser(app, create_tables=create_tables)
    return app
