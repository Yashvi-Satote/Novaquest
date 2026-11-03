"""Reusable JWT authentication middleware for NovaUser-protected routes."""

from __future__ import annotations

from functools import wraps
from uuid import UUID

from flask import g, jsonify, request

from .config import get_settings
from .database import get_session
from .models import User
from .security import InvalidToken, TokenError, TokenExpired, decode_access_token


def error_payload(code: str, message: str, fields: dict | None = None) -> dict:
    payload = {"error": {"code": code, "message": message}}
    if fields:
        payload["error"]["fields"] = fields
    return payload


def extract_token() -> str | None:
    """Read the JWT from the Authorization header, then the HTTP-only cookie."""

    header = request.headers.get("Authorization", "")
    if header.lower().startswith("bearer "):
        token = header[7:].strip()
        if token:
            return token

    settings = get_settings()
    cookie_token = request.cookies.get(settings.cookie_name)
    return cookie_token.strip() if cookie_token else None


def resolve_user(token: str) -> dict:
    """Validate a token and return public user data.

    Raises ``TokenExpired`` or ``InvalidToken`` when authentication fails.
    """

    payload = decode_access_token(token)
    try:
        user_id = UUID(payload["sub"])
    except (ValueError, TypeError, AttributeError) as exc:
        raise InvalidToken("The authentication token is invalid.") from exc

    session = get_session()
    try:
        user = session.get(User, user_id)
        if user is None:
            raise InvalidToken("The account for this token no longer exists.")
        return user.to_public_dict()
    finally:
        session.close()


def auth_required(view):
    """Decorator for routes that require a valid NovaUser JWT."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        token = extract_token()
        if not token:
            response = jsonify(
                error_payload("not_authenticated", "Sign in to access this resource.")
            )
            response.status_code = 401
            response.headers["WWW-Authenticate"] = "Bearer"
            return response

        try:
            g.jwt_payload = decode_access_token(token)
            g.current_user = resolve_user(token)
        except TokenExpired as exc:
            response = jsonify(error_payload("token_expired", str(exc)))
            response.status_code = 401
            response.headers["WWW-Authenticate"] = 'Bearer error="invalid_token"'
            return response
        except (TokenError, InvalidToken) as exc:
            response = jsonify(error_payload("invalid_token", str(exc)))
            response.status_code = 401
            response.headers["WWW-Authenticate"] = 'Bearer error="invalid_token"'
            return response

        return view(*args, **kwargs)

    return wrapped
