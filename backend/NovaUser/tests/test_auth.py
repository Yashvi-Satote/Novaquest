"""End-to-end tests for the NovaUser Firebase + JWT authentication API.

The API tests use the real PostgreSQL database configured by
``NOVAUSER_DATABASE_URL`` (the ``users.db`` database).  Firebase token
verification is mocked in the API tests because a valid Firebase ID token is
issued by Google; the verifier itself is tested with locally generated RS256
keys so no network or Firebase account is required.

Run from the repository root:
    python -m unittest backend/NovaUser/tests/test_auth.py -v
"""

from __future__ import annotations

import os
import sys
import time
import unittest
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

MODULE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.dirname(MODULE_DIR)
for path in (BACKEND_DIR, MODULE_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

# Test-safe defaults for this workspace; .env values (if present) still win.
os.environ.setdefault(
    "NOVAUSER_DATABASE_URL",
    "postgresql://novauser:novauser_dev_password@127.0.0.1:55432/users.db",
)
os.environ.setdefault(
    "NOVAUSER_JWT_SECRET",
    "novauser-test-secret-that-is-long-enough-for-hs256",
)
os.environ.setdefault("NOVAUSER_COOKIE_SECURE", "false")
os.environ.setdefault("NOVAUSER_TOKEN_EXPIRE_MINUTES", "60")

import jwt  # noqa: E402
from cryptography import x509  # noqa: E402
from cryptography.hazmat.primitives import hashes, serialization  # noqa: E402
from cryptography.hazmat.primitives.asymmetric import rsa  # noqa: E402
from cryptography.x509.oid import NameOID  # noqa: E402
from sqlalchemy import delete, inspect, select  # noqa: E402

from NovaUser.app import create_app  # noqa: E402
from NovaUser.config import get_settings  # noqa: E402
from NovaUser.database import get_engine, get_session  # noqa: E402
from NovaUser.firebase_auth import (  # noqa: E402
    FirebaseTokenExpired,
    FirebaseTokenInvalid,
    FirebaseUnavailable,
    verify_firebase_id_token,
)
from NovaUser.models import User  # noqa: E402
from NovaUser.security import decode_access_token, hash_password, verify_password  # noqa: E402

PROJECT_ID = "novaquest29"
PASSWORD = "OrbitPass9"


def walk_keys(value):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from walk_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_keys(child)


def make_claims(*, uid=None, email=None, verified=True, name="Nova Firebase User", provider="password"):
    return {
        "uid": uid or f"firebase-{uuid.uuid4().hex[:16]}",
        "email": email or f"firebase.{uuid.uuid4().hex[:12]}@example.test",
        "email_verified": verified,
        "name": name,
        "picture": "",
        "provider": provider,
        "auth_time": int(time.time()),
        "claims": {},
    }


class FirebaseApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app(create_tables=True)
        cls.app.config.update(TESTING=True)
        cls.settings = get_settings()
        cls._cleanup()

    @classmethod
    def tearDownClass(cls):
        cls._cleanup()
        get_engine().dispose()

    @classmethod
    def _cleanup(cls):
        session = get_session()
        try:
            session.execute(delete(User).where(User.email.like("%@example.test")))
            session.execute(delete(User).where(User.firebase_uid.like("firebase-%")))
            session.commit()
        finally:
            session.close()

    def setUp(self):
        self.client = self.app.test_client()
        self.claims = make_claims()

    def exchange(self, claims=None, token="firebase-id-token"):
        with patch(
            "NovaUser.routes.verify_firebase_id_token",
            return_value=claims or self.claims,
        ):
            return self.client.post(
                "/api/novauser/auth/firebase", json={"id_token": token}
            )

    def register_legacy_user(self, email, full_name="Legacy Orbit User"):
        """Insert a pre-Firebase password account directly into PostgreSQL."""

        session = get_session()
        try:
            user = User(
                full_name=full_name,
                email=email.lower(),
                password_hash=hash_password(PASSWORD),
                auth_provider="password",
                email_verified=False,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
        finally:
            session.close()

    # ---------------------------------------------------------------- exchange
    def test_firebase_exchange_creates_user_and_http_only_session(self):
        response = self.exchange()
        self.assertEqual(response.status_code, 200, response.get_json())
        body = response.get_json()
        self.assertEqual(body["user"]["email"], self.claims["email"])
        self.assertEqual(body["user"]["full_name"], self.claims["name"])
        self.assertEqual(body["user"]["auth_provider"], "password")
        self.assertTrue(body["user"]["email_verified"])
        self.assertTrue(body["access_token"])
        self.assertEqual(body["token_type"], "Bearer")
        self.assertEqual(body["expires_in"], 3600)
        self.assertNotIn("password_hash", set(walk_keys(body)))
        self.assertNotIn("firebase_uid", set(walk_keys(body)))

        payload = decode_access_token(body["access_token"])
        self.assertEqual(payload["email"], self.claims["email"])
        self.assertEqual(payload["sub"], body["user"]["id"])

        set_cookie = "; ".join(response.headers.getlist("Set-Cookie"))
        self.assertIn("novauser_token=", set_cookie)
        self.assertIn("HttpOnly", set_cookie)
        self.assertIn("SameSite=Lax", set_cookie)

        session = get_session()
        try:
            user = session.execute(
                select(User).where(User.firebase_uid == self.claims["uid"])
            ).scalar_one()
            self.assertIsNone(user.password_hash)
            self.assertEqual(user.email_verified, True)
        finally:
            session.close()

    def test_second_exchange_reuses_the_same_account(self):
        first = self.exchange()
        self.assertEqual(first.status_code, 200)
        second = self.exchange({**self.claims, "name": "Updated Orbit Name"})
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.get_json()["user"]["id"], first.get_json()["user"]["id"])
        self.assertEqual(second.get_json()["user"]["full_name"], "Updated Orbit Name")

    def test_google_provider_is_recorded(self):
        claims = make_claims(provider="google.com", name="Google Orbit")
        response = self.exchange(claims)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["auth_provider"], "google.com")

    def test_verified_email_links_existing_legacy_account(self):
        legacy = self.register_legacy_user(self.claims["email"])
        response = self.exchange()
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["user"]["id"], str(legacy.id))

        session = get_session()
        try:
            user = session.get(User, legacy.id)
            self.assertEqual(user.firebase_uid, self.claims["uid"])
            self.assertTrue(user.email_verified)
            self.assertIsNotNone(user.password_hash)
            self.assertTrue(verify_password(PASSWORD, user.password_hash))
        finally:
            session.close()

    def test_unverified_email_cannot_link_existing_account(self):
        self.register_legacy_user(self.claims["email"])
        response = self.exchange({**self.claims, "email_verified": False})
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error"]["code"], "email_not_verified")

        session = get_session()
        try:
            user = session.execute(
                select(User).where(User.email == self.claims["email"])
            ).scalar_one()
            self.assertIsNone(user.firebase_uid)
        finally:
            session.close()

    def test_new_unverified_account_is_created(self):
        response = self.exchange({**self.claims, "email_verified": False})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.get_json()["user"]["email_verified"])

    def test_same_email_with_different_firebase_uid_is_rejected(self):
        self.assertEqual(self.exchange().status_code, 200)
        other_claims = make_claims(email=self.claims["email"])
        response = self.exchange(other_claims)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json()["error"]["code"], "account_conflict")

    def test_missing_email_is_rejected(self):
        response = self.exchange({**self.claims, "email": ""})
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.get_json()["error"]["code"], "email_required")

    def test_missing_token_is_rejected(self):
        response = self.client.post("/api/novauser/auth/firebase", json={})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"]["code"], "validation_error")

    def test_invalid_firebase_token_is_rejected(self):
        with patch(
            "NovaUser.routes.verify_firebase_id_token",
            side_effect=FirebaseTokenInvalid("The Firebase ID token is invalid."),
        ):
            response = self.client.post(
                "/api/novauser/auth/firebase", json={"id_token": "not-a-token"}
            )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"]["code"], "invalid_firebase_token")

    def test_expired_firebase_token_is_rejected(self):
        with patch(
            "NovaUser.routes.verify_firebase_id_token",
            side_effect=FirebaseTokenExpired("Expired."),
        ):
            response = self.client.post(
                "/api/novauser/auth/firebase", json={"id_token": "expired-token"}
            )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"]["code"], "firebase_token_expired")

    def test_firebase_verification_outage_returns_503(self):
        with patch(
            "NovaUser.routes.verify_firebase_id_token",
            side_effect=FirebaseUnavailable("Unavailable."),
        ):
            response = self.client.post(
                "/api/novauser/auth/firebase", json={"id_token": "token"}
            )
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json()["error"]["code"], "firebase_unavailable")

    def test_legacy_password_endpoints_are_retired(self):
        for path in ("/api/novauser/auth/register", "/api/novauser/auth/login"):
            response = self.client.post(
                path, json={"email": "legacy@example.test", "password": PASSWORD}
            )
            self.assertEqual(response.status_code, 410)
            self.assertEqual(response.get_json()["error"]["code"], "firebase_required")

    # ---------------------------------------------------------------- protected
    def test_me_requires_authentication(self):
        response = self.client.get("/api/novauser/auth/me")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"]["code"], "not_authenticated")

    def test_me_accepts_bearer_token(self):
        token = self.exchange().get_json()["access_token"]
        response = self.client.get(
            "/api/novauser/auth/me", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["email"], self.claims["email"])

    def test_me_accepts_http_only_cookie(self):
        self.assertEqual(self.exchange().status_code, 200)
        response = self.client.get("/api/novauser/auth/me")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["email"], self.claims["email"])

    def test_logout_clears_cookie_and_session(self):
        self.assertEqual(self.exchange().status_code, 200)
        logout = self.client.post("/api/novauser/auth/logout")
        self.assertEqual(logout.status_code, 200)
        self.assertIn(
            "Expires=Thu, 01 Jan 1970", "; ".join(logout.headers.getlist("Set-Cookie"))
        )
        self.assertEqual(self.client.get("/api/novauser/auth/me").status_code, 401)

    def test_expired_jwt_is_rejected(self):
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(uuid.uuid4()),
            "email": self.claims["email"],
            "iat": int((now - timedelta(hours=2)).timestamp()),
            "exp": int((now - timedelta(hours=1)).timestamp()),
            "iss": self.settings.jwt_issuer,
            "aud": self.settings.jwt_audience,
            "type": "access",
        }
        expired = jwt.encode(
            payload, self.settings.jwt_secret, algorithm=self.settings.jwt_algorithm
        )
        response = self.client.get(
            "/api/novauser/auth/me", headers={"Authorization": f"Bearer {expired}"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"]["code"], "token_expired")

    def test_invalid_and_wrongly_signed_jwts_are_rejected(self):
        response = self.client.get(
            "/api/novauser/auth/me", headers={"Authorization": "Bearer not-a-jwt"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"]["code"], "invalid_token")

        wrong = jwt.encode(
            {
                "sub": str(uuid.uuid4()),
                "email": self.claims["email"],
                "iat": int(datetime.now(timezone.utc).timestamp()),
                "exp": int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp()),
                "iss": self.settings.jwt_issuer,
                "aud": self.settings.jwt_audience,
                "type": "access",
            },
            "a-different-secret-that-is-also-long-enough",
            algorithm="HS256",
        )
        response = self.client.get(
            "/api/novauser/auth/me", headers={"Authorization": f"Bearer {wrong}"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"]["code"], "invalid_token")

    # -------------------------------------------------------------------- schema
    def test_postgresql_schema_and_constraints(self):
        inspector = inspect(get_engine())
        self.assertTrue(inspector.has_table("users"))
        columns = {column["name"]: column for column in inspector.get_columns("users")}
        self.assertEqual(
            set(columns),
            {
                "id",
                "full_name",
                "email",
                "password_hash",
                "firebase_uid",
                "auth_provider",
                "email_verified",
                "created_at",
                "updated_at",
            },
        )
        self.assertEqual(str(columns["id"]["type"]).upper(), "UUID")
        self.assertFalse(columns["email"]["nullable"])
        self.assertTrue(columns["password_hash"]["nullable"])
        self.assertTrue(columns["firebase_uid"]["nullable"])
        self.assertFalse(columns["auth_provider"]["nullable"])
        self.assertFalse(columns["email_verified"]["nullable"])

        unique_columns = {
            tuple(item["column_names"]) for item in inspector.get_unique_constraints("users")
        }
        unique_columns.update(
            tuple(index["column_names"])
            for index in inspector.get_indexes("users")
            if index.get("unique")
        )
        self.assertIn(("email",), unique_columns)
        self.assertIn(("firebase_uid",), unique_columns)

        check_names = {item["name"] for item in inspector.get_check_constraints("users")}
        self.assertIn("ck_users_email_lowercase", check_names)

    def test_health_endpoint_reports_postgresql_and_firebase(self):
        response = self.client.get("/api/novauser/health")
        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["database"]["engine"], "postgresql")
        self.assertTrue(body["database"]["connected"])
        self.assertEqual(body["database"]["database"], "users.db")
        self.assertEqual(body["auth"], "firebase+jwt")
        self.assertIn("configured", body["firebase"])


class FirebaseTokenVerifierTests(unittest.TestCase):
    """Verify RS256 validation without contacting Google."""

    @classmethod
    def setUpClass(cls):
        cls.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = issuer = x509.Name(
            [x509.NameAttribute(NameOID.COMMON_NAME, "test-firebase-cert")]
        )
        now = datetime.now(timezone.utc)
        certificate = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(cls.private_key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(now - timedelta(minutes=5))
            .not_valid_after(now + timedelta(hours=1))
            .sign(cls.private_key, hashes.SHA256())
        )
        cls.cert_pem = certificate.public_bytes(serialization.Encoding.PEM).decode("ascii")
        cls.certificates = {"test-kid": cls.cert_pem}

    def token(self, *, key=None, kid="test-kid", **overrides):
        now = int(time.time())
        payload = {
            "iss": f"https://securetoken.google.com/{PROJECT_ID}",
            "aud": PROJECT_ID,
            "auth_time": now,
            "user_id": "firebase-user-1",
            "sub": "firebase-user-1",
            "iat": now,
            "exp": now + 3600,
            "email": "verifier@example.test",
            "email_verified": True,
            "name": "Verifier User",
            "firebase": {"sign_in_provider": "password"},
        }
        payload.update(overrides)
        return jwt.encode(
            payload,
            key or self.private_key,
            algorithm="RS256",
            headers={"kid": kid},
        )

    def verify(self, token):
        return verify_firebase_id_token(
            token, project_id=PROJECT_ID, certificates=self.certificates
        )

    def test_valid_token_returns_normalised_identity(self):
        identity = self.verify(self.token())
        self.assertEqual(identity["uid"], "firebase-user-1")
        self.assertEqual(identity["email"], "verifier@example.test")
        self.assertTrue(identity["email_verified"])
        self.assertEqual(identity["provider"], "password")

    def test_wrong_audience_is_rejected(self):
        with self.assertRaises(FirebaseTokenInvalid):
            self.verify(self.token(aud="another-project"))

    def test_wrong_issuer_is_rejected(self):
        with self.assertRaises(FirebaseTokenInvalid):
            self.verify(self.token(iss="https://securetoken.google.com/other"))

    def test_expired_token_is_rejected(self):
        now = int(time.time())
        with self.assertRaises(FirebaseTokenExpired):
            self.verify(self.token(iat=now - 7200, exp=now - 3600))

    def test_bad_signature_is_rejected(self):
        other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        with self.assertRaises(FirebaseTokenInvalid):
            self.verify(self.token(key=other_key))

    def test_unknown_kid_is_rejected(self):
        with self.assertRaises(FirebaseTokenInvalid):
            self.verify(self.token(kid="missing-kid"))

    def test_missing_subject_is_rejected(self):
        with self.assertRaises(FirebaseTokenInvalid):
            self.verify(self.token(sub=""))

    def test_empty_token_is_rejected(self):
        with self.assertRaises(FirebaseTokenInvalid):
            verify_firebase_id_token("", project_id=PROJECT_ID, certificates=self.certificates)

    def test_missing_project_configuration_is_rejected(self):
        with patch.dict(os.environ, {"FIREBASE_PROJECT_ID": ""}, clear=False):
            from NovaUser.config import clear_settings_cache

            clear_settings_cache()
            try:
                with self.assertRaises(FirebaseUnavailable):
                    verify_firebase_id_token(
                        self.token(), certificates=self.certificates
                    )
            finally:
                clear_settings_cache()


if __name__ == "__main__":
    unittest.main()
