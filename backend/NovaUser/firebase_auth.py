"""Secure server-side verification of Firebase ID tokens.

Firebase is the primary identity provider for NovaUser.  The browser sends the
ID token it received from Firebase and the backend verifies the token's
signature and claims before issuing a NovaUser session cookie.  A UID or email
supplied directly by the browser is never trusted.

Verification uses Google's published public certificates for Firebase Auth:

    https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com

No service-account private key is required because NovaUser only verifies
tokens; it does not call privileged Firebase Admin APIs.
"""

from __future__ import annotations

import json
import logging
import threading
import time
import urllib.error
import urllib.request
from functools import lru_cache
from typing import Any

import jwt
from cryptography import x509
from cryptography.hazmat.primitives import serialization

from .config import get_settings

logger = logging.getLogger(__name__)

FIREBASE_CERTS_URL = (
    "https://www.googleapis.com/robot/v1/metadata/x509/"
    "securetoken@system.gserviceaccount.com"
)
FIREBASE_ISSUER_PREFIX = "https://securetoken.google.com/"
DEFAULT_CERT_TTL_SECONDS = 3600
MIN_CERT_TTL_SECONDS = 60
MAX_TOKEN_LENGTH = 10_000
CLOCK_SKEW_SECONDS = 300


class FirebaseAuthError(Exception):
    """Base class for Firebase identity failures."""

    code = "firebase_auth_error"
    status = 401

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class FirebaseTokenInvalid(FirebaseAuthError):
    """The supplied Firebase ID token could not be verified."""

    code = "invalid_firebase_token"
    status = 401


class FirebaseTokenExpired(FirebaseAuthError):
    """The supplied Firebase ID token has expired."""

    code = "firebase_token_expired"
    status = 401


class FirebaseUnavailable(FirebaseAuthError):
    """Google's public certificates could not be fetched."""

    code = "firebase_unavailable"
    status = 503


class _CertificateCache:
    """Thread-safe cache for Google's Firebase signing certificates."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._certificates: dict[str, str] = {}
        self._expires_at = 0.0

    def get(self, *, force: bool = False) -> dict[str, str]:
        now = time.time()
        with self._lock:
            if not force and self._certificates and now < self._expires_at:
                return self._certificates

            certificates, ttl = _download_certificates()
            self._certificates = certificates
            self._expires_at = now + ttl
            return certificates

    def clear(self) -> None:
        with self._lock:
            self._certificates = {}
            self._expires_at = 0.0


_cache = _CertificateCache()


def _download_certificates() -> tuple[dict[str, str], int]:
    """Fetch Google's X.509 certificates and return ``(certs, ttl_seconds)``."""

    request = urllib.request.Request(
        FIREBASE_CERTS_URL,
        headers={"Accept": "application/json", "User-Agent": "NovaUser/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            raw = response.read()
            cache_control = response.headers.get("Cache-Control", "")
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        logger.warning("Could not download Firebase certificates: %s", exc)
        raise FirebaseUnavailable(
            "Firebase sign-in is temporarily unavailable. Please try again."
        ) from exc

    try:
        certificates = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        logger.warning("Firebase certificate response was not valid JSON")
        raise FirebaseUnavailable(
            "Firebase sign-in is temporarily unavailable. Please try again."
        ) from exc

    if not isinstance(certificates, dict) or not certificates:
        raise FirebaseUnavailable(
            "Firebase sign-in is temporarily unavailable. Please try again."
        )

    ttl = DEFAULT_CERT_TTL_SECONDS
    for directive in cache_control.split(","):
        directive = directive.strip()
        if directive.startswith("max-age="):
            try:
                ttl = max(MIN_CERT_TTL_SECONDS, int(directive.split("=", 1)[1]))
            except (ValueError, IndexError):
                pass
            break

    cleaned = {
        str(kid): str(certificate)
        for kid, certificate in certificates.items()
        if isinstance(kid, str) and isinstance(certificate, str)
    }
    if not cleaned:
        raise FirebaseUnavailable(
            "Firebase sign-in is temporarily unavailable. Please try again."
        )
    return cleaned, ttl


def _clock() -> float:
    """Indirection used by tests to control token expiry validation."""

    return time.time()


def _certificates(*, force: bool = False) -> dict[str, str]:
    return _cache.get(force=force)


@lru_cache(maxsize=32)
def _verification_key(certificate_or_key: str) -> str:
    """Return a public-key PEM suitable for PyJWT signature verification.

    Google publishes X.509 certificates.  Some PyJWT/cryptography combinations
    only handle public-key PEMs reliably, so certificates are converted once
    and cached by their original value.
    """

    if "BEGIN CERTIFICATE" not in certificate_or_key:
        return certificate_or_key
    certificate = x509.load_pem_x509_certificate(certificate_or_key.encode("ascii"))
    return (
        certificate.public_key()
        .public_bytes(
            serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        .decode("ascii")
    )


def clear_certificate_cache() -> None:
    """Clear cached Firebase certificates (used by tests and operations)."""

    _cache.clear()


def _project_id(project_id: str | None) -> str:
    resolved = (project_id or get_settings().firebase_project_id or "").strip()
    if not resolved:
        raise FirebaseUnavailable(
            "Firebase authentication is not configured on the server."
        )
    return resolved


def verify_firebase_id_token(
    id_token: str,
    *,
    project_id: str | None = None,
    certificates: dict[str, str] | None = None,
    now: float | None = None,
) -> dict[str, Any]:
    """Verify a Firebase ID token and return its trusted claims.

    The function validates the RS256 signature against Google's certificate for
    the token's ``kid`` header, then validates issuer, audience, expiry and the
    Firebase subject claim.  ``certificates`` and ``now`` are injectable so the
    verifier can be tested without network access.
    """

    if not isinstance(id_token, str) or not id_token.strip():
        raise FirebaseTokenInvalid("A Firebase ID token is required.")
    token = id_token.strip()
    if len(token) > MAX_TOKEN_LENGTH:
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.")

    project = _project_id(project_id)
    current_time = _clock() if now is None else float(now)

    try:
        header = jwt.get_unverified_header(token)
    except jwt.PyJWTError as exc:
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.") from exc

    if header.get("alg") != "RS256":
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.")
    kid = header.get("kid")
    if not isinstance(kid, str) or not kid:
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.")

    certs = certificates if certificates is not None else _certificates()
    key = certs.get(kid)
    if key is None and certificates is None:
        # Key rotation: refresh Google's certificates once before giving up.
        certs = _certificates(force=True)
        key = certs.get(kid)
    if key is None:
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.")

    try:
        key = _verification_key(key)
    except (ValueError, TypeError) as exc:
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.") from exc

    leeway = CLOCK_SKEW_SECONDS
    try:
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=project,
            issuer=f"{FIREBASE_ISSUER_PREFIX}{project}",
            leeway=leeway,
            options={
                "require": ["exp", "iat", "aud", "iss", "sub"],
                "verify_exp": True,
                "verify_iat": True,
                "verify_aud": True,
                "verify_iss": True,
            },
        )
    except jwt.ExpiredSignatureError as exc:
        raise FirebaseTokenExpired(
            "Your Firebase session has expired. Please sign in again."
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.") from exc

    subject = claims.get("sub")
    if not isinstance(subject, str) or not subject.strip() or len(subject.strip()) > 128:
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.")

    issued_at = claims.get("iat")
    if not isinstance(issued_at, (int, float)) or issued_at > current_time + leeway:
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.")

    email = claims.get("email")
    if email is not None and not isinstance(email, str):
        raise FirebaseTokenInvalid("The Firebase ID token is invalid.")

    firebase_claims = claims.get("firebase")
    firebase_claims = firebase_claims if isinstance(firebase_claims, dict) else {}

    return {
        "uid": subject.strip(),
        "email": (email or "").strip().lower(),
        "email_verified": bool(claims.get("email_verified", False)),
        "name": claims.get("name") if isinstance(claims.get("name"), str) else "",
        "picture": claims.get("picture") if isinstance(claims.get("picture"), str) else "",
        "provider": str(firebase_claims.get("sign_in_provider") or "firebase"),
        "auth_time": claims.get("auth_time"),
        "claims": claims,
    }
