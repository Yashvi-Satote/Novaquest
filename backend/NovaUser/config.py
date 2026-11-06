"""Configuration for the NovaUser authentication module.

All secrets are read from environment variables.  There are no hard-coded
JWT secrets or database passwords in this module.
"""

from __future__ import annotations

import os
from functools import lru_cache
from urllib.parse import urlparse

from dotenv import load_dotenv

MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(MODULE_DIR)
PROJECT_DIR = os.path.dirname(BACKEND_DIR)

# Load the project .env first, then allow a module-local .env to override it.
load_dotenv(os.path.join(PROJECT_DIR, ".env"), override=False)
load_dotenv(os.path.join(MODULE_DIR, ".env"), override=True)

DEFAULT_TOKEN_MINUTES = 60
MIN_JWT_SECRET_LENGTH = 32
_MIN_PASSWORD_LENGTH = 8
_MAX_PASSWORD_LENGTH = 72


class ConfigError(RuntimeError):
    """Raised when required NovaUser configuration is missing or unsafe."""


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _as_int(value: str | None, default: int, name: str) -> int:
    if value is None or not value.strip():
        return default
    try:
        return int(value)
    except ValueError as exc:
        raise ConfigError(f"{name} must be an integer.") from exc


class Settings:
    """Validated runtime settings for NovaUser."""

    def __init__(self) -> None:
        database_url = (os.getenv("NOVAUSER_DATABASE_URL") or "").strip()
        if not database_url:
            raise ConfigError(
                "NOVAUSER_DATABASE_URL is not set. Add the PostgreSQL connection "
                "string for the users.db database to .env."
            )
        if not database_url.startswith(("postgresql://", "postgres://")):
            raise ConfigError(
                "NOVAUSER_DATABASE_URL must be a PostgreSQL connection string. "
                "NovaUser does not use SQLite."
            )
        self.database_url = database_url

        jwt_secret = (os.getenv("NOVAUSER_JWT_SECRET") or "").strip()
        if not jwt_secret:
            raise ConfigError(
                "NOVAUSER_JWT_SECRET is not set. Generate a long random value and "
                "add it to .env (see .env.example)."
            )
        if len(jwt_secret) < MIN_JWT_SECRET_LENGTH:
            raise ConfigError(
                f"NOVAUSER_JWT_SECRET must be at least {MIN_JWT_SECRET_LENGTH} characters."
            )
        if jwt_secret.lower() in {
            "replace-with-a-long-random-string",
            "change-me",
            "secret",
            "development-secret",
        }:
            raise ConfigError("NOVAUSER_JWT_SECRET is still set to a placeholder value.")
        self.jwt_secret = jwt_secret
        self.jwt_algorithm = "HS256"
        self.jwt_issuer = (os.getenv("NOVAUSER_JWT_ISSUER") or "novauser").strip()
        self.jwt_audience = (os.getenv("NOVAUSER_JWT_AUDIENCE") or "novauser-web").strip()
        self.access_token_expire_minutes = _as_int(
            os.getenv("NOVAUSER_TOKEN_EXPIRE_MINUTES"),
            DEFAULT_TOKEN_MINUTES,
            "NOVAUSER_TOKEN_EXPIRE_MINUTES",
        )
        if not 1 <= self.access_token_expire_minutes <= 60 * 24 * 30:
            raise ConfigError("NOVAUSER_TOKEN_EXPIRE_MINUTES must be between 1 and 43200.")

        self.cookie_name = (os.getenv("NOVAUSER_COOKIE_NAME") or "novauser_token").strip()
        self.cookie_secure = _as_bool(os.getenv("NOVAUSER_COOKIE_SECURE"), False)
        self.cookie_samesite = (os.getenv("NOVAUSER_COOKIE_SAMESITE") or "Lax").strip()
        if self.cookie_samesite not in {"Lax", "Strict", "None"}:
            raise ConfigError("NOVAUSER_COOKIE_SAMESITE must be Lax, Strict or None.")
        if self.cookie_samesite == "None" and not self.cookie_secure:
            raise ConfigError(
                "NOVAUSER_COOKIE_SAMESITE=None requires NOVAUSER_COOKIE_SECURE=true."
            )

        raw_origins = os.getenv(
            "NOVAUSER_CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
        self.cors_origins = [
            origin.strip()
            for origin in raw_origins.split(",")
            if origin.strip() and origin.strip() != "*"
        ]
        if not self.cors_origins:
            self.cors_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

        self.min_password_length = _MIN_PASSWORD_LENGTH
        self.max_password_length = _MAX_PASSWORD_LENGTH

        # Firebase Authentication (primary identity provider).  The public web
        # config is enough for the server to verify ID tokens against Google's
        # published certificates; no service-account private key is needed.
        self.firebase_project_id = (
            os.getenv("NOVAUSER_FIREBASE_PROJECT_ID")
            or os.getenv("FIREBASE_PROJECT_ID")
            or ""
        ).strip()
        if self.firebase_project_id and any(
            character.isspace() or character in "/\\"
            for character in self.firebase_project_id
        ):
            raise ConfigError("FIREBASE_PROJECT_ID contains unsupported characters.")
        self.firebase_api_key = (
            os.getenv("NOVAUSER_FIREBASE_API_KEY")
            or os.getenv("FIREBASE_API_KEY")
            or ""
        ).strip()
        self.firebase_auth_domain = (
            os.getenv("NOVAUSER_FIREBASE_AUTH_DOMAIN")
            or os.getenv("FIREBASE_AUTH_DOMAIN")
            or ""
        ).strip()

    @property
    def firebase_configured(self) -> bool:
        """Whether the server can verify Firebase ID tokens."""

        return bool(self.firebase_project_id)

    @property
    def database_name(self) -> str:
        return urlparse(self.database_url).path.lstrip("/") or "users"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return validated settings, cached for the lifetime of the process."""

    return Settings()


def clear_settings_cache() -> None:
    """Clear the settings cache (used by tests that patch the environment)."""

    get_settings.cache_clear()
