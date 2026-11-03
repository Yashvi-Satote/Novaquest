"""Password hashing and JWT helpers for NovaUser."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from jwt import DecodeError, ExpiredSignatureError, InvalidAudienceError, InvalidIssuerError
from jwt.exceptions import InvalidTokenError

from .config import get_settings


class TokenError(Exception):
    """Base class for token failures."""


class TokenExpired(TokenError):
    """The JWT has expired."""


class InvalidToken(TokenError):
    """The JWT is malformed, unsigned or otherwise invalid."""


def hash_password(password: str) -> str:
    """Hash a password with bcrypt using a per-password salt."""

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12))
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against a bcrypt hash in constant time."""

    if not password or not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user_id, email: str) -> tuple[str, int]:
    """Create a signed JWT and return ``(token, expires_in_seconds)``."""

    settings = get_settings()
    expires_in = settings.access_token_expire_minutes * 60
    issued_at = _now()
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": int(issued_at.timestamp()),
        "nbf": int(issued_at.timestamp()),
        "exp": int((issued_at + timedelta(seconds=expires_in)).timestamp()),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "jti": str(uuid.uuid4()),
        "type": "access",
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, expires_in


def decode_access_token(token: str) -> dict:
    """Validate a JWT signature, claims and expiry."""

    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
            options={"require": ["exp", "iat", "sub", "iss", "aud"]},
        )
    except ExpiredSignatureError as exc:
        raise TokenExpired("Your session has expired. Please sign in again.") from exc
    except (InvalidAudienceError, InvalidIssuerError, DecodeError, InvalidTokenError) as exc:
        raise InvalidToken("The authentication token is invalid.") from exc

    if payload.get("type") != "access" or not payload.get("sub"):
        raise InvalidToken("The authentication token is invalid.")
    return payload
