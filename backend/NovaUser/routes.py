"""NovaUser authentication API routes.

Firebase is the primary identity provider.  The browser authenticates with the
Firebase JS SDK and sends the resulting ID token to ``/auth/firebase``.  The
backend verifies that token with Google's published signing certificates before
linking/creating the PostgreSQL account and issuing the NovaUser JWT cookie.
"""

from __future__ import annotations

import logging

from flask import Blueprint, g, jsonify, make_response, request
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from .config import get_settings
from .database import check_database, get_session
from .firebase_auth import (
    FirebaseAuthError,
    FirebaseTokenExpired,
    FirebaseTokenInvalid,
    FirebaseUnavailable,
    verify_firebase_id_token,
)
from .middleware import auth_required, error_payload
from .models import User
from .security import create_access_token
from .validation import (
    EMAIL_RE,
    ValidationProblem,
    normalise_email,
    validate_firebase_exchange,
)

logger = logging.getLogger(__name__)

bp = Blueprint("novauser_auth", __name__, url_prefix="/api/novauser")


def _error(code: str, message: str, status: int, fields: dict | None = None):
    response = jsonify(error_payload(code, message, fields))
    response.status_code = status
    if status == 401:
        response.headers["WWW-Authenticate"] = "Bearer"
    return response


def _payload():
    payload = request.get_json(silent=True)
    if payload is None:
        raise ValidationProblem({}, "Request body must be valid JSON.")
    return payload


def _set_auth_cookie(response, token: str, expires_in: int):
    settings = get_settings()
    response.set_cookie(
        settings.cookie_name,
        token,
        max_age=expires_in,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
    response.headers["Cache-Control"] = "no-store"
    return response


def _auth_response(user: User, token: str, expires_in: int, message: str, status: int = 200):
    body = {
        "message": message,
        "user": user.to_public_dict(),
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": expires_in,
    }
    response = make_response(jsonify(body), status)
    return _set_auth_cookie(response, token, expires_in)


def _clean_name(identity: dict, email: str) -> str:
    raw = identity.get("name") or ""
    if not isinstance(raw, str) or not raw.strip():
        raw = email.split("@", 1)[0].replace(".", " ").replace("_", " ")
    name = " ".join(raw.split())[:120]
    return name if len(name) >= 2 else "Nova User"


def _provider(value, fallback: str = "firebase") -> str:
    provider = str(value or fallback).strip()[:32]
    return provider or fallback


@bp.get("/health")
def health():
    """Report NovaUser API, PostgreSQL and Firebase configuration status."""

    settings = get_settings()
    database = check_database()
    response = jsonify(
        {
            "status": "ok" if database["connected"] else "degraded",
            "service": "NovaUser Authentication API",
            "database": database,
            "auth": "firebase+jwt",
            "firebase": {
                "configured": settings.firebase_configured,
                "project_id": settings.firebase_project_id or None,
            },
        }
    )
    response.status_code = 200 if database["connected"] else 503
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.post("/auth/firebase")
def firebase_sign_in():
    """Verify a Firebase ID token and establish a NovaUser JWT session."""

    try:
        id_token = validate_firebase_exchange(_payload())
    except ValidationProblem as exc:
        return _error("validation_error", exc.message, 400, exc.fields)

    try:
        identity = verify_firebase_id_token(id_token)
    except FirebaseTokenExpired as exc:
        return _error(exc.code, exc.message, 401)
    except FirebaseTokenInvalid as exc:
        logger.info("Rejected invalid Firebase ID token")
        return _error(exc.code, exc.message, 401)
    except FirebaseUnavailable as exc:
        logger.warning("Firebase verification unavailable: %s", exc.message)
        return _error(exc.code, exc.message, 503)
    except FirebaseAuthError as exc:  # pragma: no cover - defensive
        return _error(exc.code, exc.message, exc.status)

    email = normalise_email(identity.get("email"))
    if not email or not EMAIL_RE.match(email):
        return _error(
            "email_required",
            "Your Firebase account must have a valid email address.",
            422,
            {"email": "A verified email address is required."},
        )

    uid = identity["uid"]
    verified = bool(identity.get("email_verified"))
    provider = _provider(identity.get("provider"))
    full_name = _clean_name(identity, email)

    session = get_session()
    try:
        user = session.execute(
            select(User).where(User.firebase_uid == uid)
        ).scalar_one_or_none()

        if user is None:
            existing = session.execute(
                select(User).where(User.email == email)
            ).scalar_one_or_none()
            if existing is not None:
                if existing.firebase_uid and existing.firebase_uid != uid:
                    return _error(
                        "account_conflict",
                        "This email address is already linked to another sign-in method.",
                        409,
                    )
                if not verified:
                    return _error(
                        "email_not_verified",
                        "Verify your email address before linking it to an existing account.",
                        403,
                        {"email": "Verify your email address and try again."},
                    )
                user = existing

        if user is None:
            user = User(
                full_name=full_name,
                email=email,
                password_hash=None,
                firebase_uid=uid,
                auth_provider=provider,
                email_verified=verified,
            )
            session.add(user)
            logger.info("Created NovaUser account from Firebase UID %s", uid)
        else:
            user.firebase_uid = uid
            user.auth_provider = provider
            user.email_verified = verified
            if full_name and full_name != user.full_name:
                user.full_name = full_name
            # Only accept an email change that Firebase has verified.
            if verified and email != user.email:
                conflicting = session.execute(
                    select(User.id).where(User.email == email, User.id != user.id)
                ).scalar_one_or_none()
                if conflicting is not None:
                    return _error(
                        "account_conflict",
                        "This email address is already linked to another account.",
                        409,
                    )
                user.email = email

        session.commit()
        session.refresh(user)

        token, expires_in = create_access_token(user.id, user.email)
        logger.info("Firebase sign-in for NovaUser %s (%s)", user.id, provider)
        return _auth_response(user, token, expires_in, "Signed in successfully.")

    except IntegrityError:
        session.rollback()
        return _error(
            "account_conflict",
            "This Firebase account conflicts with an existing NovaUser account.",
            409,
        )
    except SQLAlchemyError:
        session.rollback()
        logger.exception("Database error during Firebase sign-in")
        return _error(
            "database_unavailable",
            "The account service is temporarily unavailable. Please try again.",
            503,
        )
    finally:
        session.close()


@bp.post("/auth/register")
@bp.post("/auth/login")
def legacy_password_auth():
    """Retired password endpoints (Firebase owns registration and sign-in)."""

    return _error(
        "firebase_required",
        "Password authentication is handled by Firebase. Use the Firebase sign-in flow.",
        410,
    )


@bp.post("/auth/logout")
def logout():
    """Clear the HTTP-only authentication cookie."""

    settings = get_settings()
    response = make_response(jsonify({"message": "Signed out successfully."}), 200)
    response.delete_cookie(
        settings.cookie_name,
        path="/",
        secure=settings.cookie_secure,
        httponly=True,
        samesite=settings.cookie_samesite,
    )
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.get("/auth/me")
@auth_required
def me():
    """Return the account associated with the current JWT (protected route)."""

    response = jsonify({"user": g.current_user})
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.get("/auth/count")
def user_count():
    """Small operational endpoint used by tests and health checks."""

    session = get_session()
    try:
        total = session.execute(select(func.count()).select_from(User)).scalar_one()
        return jsonify({"users": int(total)}), 200
    except SQLAlchemyError:
        logger.exception("Database error while counting NovaUser accounts")
        return _error("database_unavailable", "The account service is unavailable.", 503)
    finally:
        session.close()
