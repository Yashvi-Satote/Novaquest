"""Per-user NovaQuest game-settings API routes."""

from __future__ import annotations

import logging
from uuid import UUID

from flask import Blueprint, g, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from ..database import get_session
from ..middleware import auth_required, error_payload
from .defaults import (
    SettingsValidationProblem,
    create_default_settings,
    normalise_settings,
    validate_settings,
)
from .models import UserGameSettings

logger = logging.getLogger(__name__)

bp = Blueprint("novauser_settings", __name__, url_prefix="/api/novauser/settings")


def _error(code: str, message: str, status: int, fields: dict | None = None):
    response = jsonify(error_payload(code, message, fields))
    response.status_code = status
    if status == 401:
        response.headers["WWW-Authenticate"] = "Bearer"
    return response


def _user_id() -> UUID:
    return UUID(g.current_user["id"])


def _settings_response(settings: dict, updated_at=None, status: int = 200):
    body = {"settings": normalise_settings(settings)}
    if updated_at is not None:
        body["updated_at"] = updated_at.isoformat() if hasattr(updated_at, "isoformat") else updated_at
    response = jsonify(body)
    response.status_code = status
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.get("/game")
@auth_required
def get_game_settings():
    """Return the signed-in user's game settings, falling back to defaults."""

    session = get_session()
    try:
        row = session.get(UserGameSettings, _user_id())
        if row is None:
            return _settings_response(create_default_settings())
        return _settings_response(row.settings, row.updated_at)
    except (ValueError, TypeError):
        return _error("invalid_token", "The authentication token is invalid.", 401)
    except SQLAlchemyError:
        logger.exception("Database error while reading game settings")
        return _error(
            "database_unavailable",
            "The settings service is temporarily unavailable. Please try again.",
            503,
        )
    finally:
        session.close()


@bp.put("/game")
@auth_required
def update_game_settings():
    """Validate and persist the signed-in user's game settings."""

    try:
        settings = validate_settings(request.get_json(silent=True))
    except SettingsValidationProblem as exc:
        return _error("validation_error", exc.message, 422, exc.fields)

    session = get_session()
    try:
        user_id = _user_id()
        row = session.get(UserGameSettings, user_id)
        if row is None:
            row = UserGameSettings(user_id=user_id, settings=settings)
            session.add(row)
        else:
            row.settings = settings

        session.commit()
        session.refresh(row)
        return _settings_response(row.settings, row.updated_at)
    except (ValueError, TypeError):
        session.rollback()
        return _error("invalid_token", "The authentication token is invalid.", 401)
    except SQLAlchemyError:
        session.rollback()
        logger.exception("Database error while saving game settings")
        return _error(
            "database_unavailable",
            "The settings service is temporarily unavailable. Please try again.",
            503,
        )
    finally:
        session.close()
