"""Per-user NovaQuest game progress API routes.

These endpoints are only used by signed-in users. Guests keep their Continue
checkpoint in the browser's localStorage and never call this API.
"""

from __future__ import annotations

import logging
from uuid import UUID

from flask import Blueprint, g, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from ..database import get_session
from ..middleware import auth_required, error_payload
from .models import UserGameProgress

logger = logging.getLogger(__name__)

bp = Blueprint("novauser_progress", __name__, url_prefix="/api/novauser/progress")


def _error(code: str, message: str, status: int, fields: dict | None = None):
    response = jsonify(error_payload(code, message, fields))
    response.status_code = status
    if status == 401:
        response.headers["WWW-Authenticate"] = "Bearer"
    return response


def _user_id() -> UUID:
    return UUID(g.current_user["id"])


def _progress_response(progress: dict | None, updated_at=None, status: int = 200):
    body = {"progress": progress, "exists": progress is not None}
    if updated_at is not None:
        body["updated_at"] = updated_at.isoformat() if hasattr(updated_at, "isoformat") else updated_at
    response = jsonify(body)
    response.status_code = status
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.get("/game")
@auth_required
def get_game_progress():
    """Return the signed-in user's Continue checkpoint, if one exists."""

    session = get_session()
    try:
        row = session.get(UserGameProgress, _user_id())
        if row is None:
            return _progress_response(None)
        return _progress_response(row.progress, row.updated_at)
    except (ValueError, TypeError):
        return _error("invalid_token", "The authentication token is invalid.", 401)
    except SQLAlchemyError:
        logger.exception("Database error while reading game progress")
        return _error(
            "database_unavailable",
            "The progress service is temporarily unavailable. Please try again.",
            503,
        )
    finally:
        session.close()


@bp.put("/game")
@auth_required
def update_game_progress():
    """Validate and persist the signed-in user's Continue checkpoint."""

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or not isinstance(payload.get("progress"), dict):
        return _error(
            "validation_error",
            "Progress could not be saved.",
            422,
            {"progress": "Progress must be a JSON object."},
        )

    session = get_session()
    try:
        user_id = _user_id()
        row = session.get(UserGameProgress, user_id)
        if row is None:
            row = UserGameProgress(user_id=user_id, progress=payload["progress"])
            session.add(row)
        else:
            row.progress = payload["progress"]

        session.commit()
        session.refresh(row)
        return _progress_response(row.progress, row.updated_at)
    except (ValueError, TypeError):
        session.rollback()
        return _error("invalid_token", "The authentication token is invalid.", 401)
    except SQLAlchemyError:
        session.rollback()
        logger.exception("Database error while saving game progress")
        return _error(
            "database_unavailable",
            "The progress service is temporarily unavailable. Please try again.",
            503,
        )
    finally:
        session.close()


@bp.delete("/game")
@auth_required
def delete_game_progress():
    """Remove the signed-in user's saved Continue checkpoint."""

    session = get_session()
    try:
        row = session.get(UserGameProgress, _user_id())
        if row is not None:
            session.delete(row)
            session.commit()
        return jsonify({"message": "Game progress deleted."}), 200
    except (ValueError, TypeError):
        return _error("invalid_token", "The authentication token is invalid.", 401)
    except SQLAlchemyError:
        session.rollback()
        logger.exception("Database error while deleting game progress")
        return _error(
            "database_unavailable",
            "The progress service is temporarily unavailable. Please try again.",
            503,
        )
    finally:
        session.close()
