"""Tests for the per-user NovaQuest game-progress API.

Run from the repository root:
    python -m unittest backend/NovaUser/tests/test_progress.py -v
"""

from __future__ import annotations

import os
import sys
import unittest
import uuid

MODULE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.dirname(MODULE_DIR)
for path in (BACKEND_DIR, MODULE_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

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

from sqlalchemy import delete, inspect  # noqa: E402

from NovaUser.app import create_app  # noqa: E402
from NovaUser.database import get_engine, get_session  # noqa: E402
from NovaUser.models import User  # noqa: E402
from NovaUser.security import create_access_token  # noqa: E402


class GameProgressApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app(create_tables=True)
        cls.app.config.update(TESTING=True)
        cls._cleanup()

    @classmethod
    def tearDownClass(cls):
        cls._cleanup()
        get_engine().dispose()

    @classmethod
    def _cleanup(cls):
        session = get_session()
        try:
            session.execute(delete(User).where(User.email.like("progress.test.%@example.test")))
            session.commit()
        finally:
            session.close()

    def setUp(self):
        self.client = self.app.test_client()

    def _make_user(self):
        email = f"progress.test.{uuid.uuid4().hex}@example.test"
        session = get_session()
        try:
            user = User(
                full_name="Progress Tester",
                email=email,
                password_hash=None,
                auth_provider="password",
                email_verified=True,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            token, _ = create_access_token(user.id, user.email)
            return str(user.id), token
        finally:
            session.close()

    @staticmethod
    def _headers(token):
        return {"Authorization": f"Bearer {token}"}

    def test_progress_endpoints_require_authentication(self):
        self.assertEqual(self.client.get("/api/novauser/progress/game").status_code, 401)
        self.assertEqual(
            self.client.put(
                "/api/novauser/progress/game", json={"progress": {}}
            ).status_code,
            401,
        )
        self.assertEqual(self.client.delete("/api/novauser/progress/game").status_code, 401)

    def test_get_returns_no_progress_when_nothing_is_stored(self):
        _, token = self._make_user()
        response = self.client.get(
            "/api/novauser/progress/game", headers=self._headers(token)
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        body = response.get_json()
        self.assertIsNone(body["progress"])
        self.assertFalse(body["exists"])

    def test_put_persists_and_get_returns_progress(self):
        _, token = self._make_user()
        progress = {"chapter": 2, "score": 1200, "timestamp": 1700000000000}
        response = self.client.put(
            "/api/novauser/progress/game",
            json={"progress": progress},
            headers=self._headers(token),
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["progress"], progress)
        self.assertTrue(response.get_json()["exists"])
        self.assertIn("updated_at", response.get_json())

        fetched = self.client.get(
            "/api/novauser/progress/game", headers=self._headers(token)
        )
        self.assertEqual(fetched.status_code, 200, fetched.get_json())
        self.assertEqual(fetched.get_json()["progress"], progress)

    def test_put_replaces_an_existing_checkpoint(self):
        _, token = self._make_user()
        self.client.put(
            "/api/novauser/progress/game",
            json={"progress": {"chapter": 1}},
            headers=self._headers(token),
        )
        response = self.client.put(
            "/api/novauser/progress/game",
            json={"progress": {"chapter": 4}},
            headers=self._headers(token),
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["progress"], {"chapter": 4})

    def test_put_rejects_missing_or_non_object_progress(self):
        _, token = self._make_user()
        for payload in ({}, {"progress": []}, {"progress": "chapter one"}, []):
            response = self.client.put(
                "/api/novauser/progress/game",
                json=payload,
                headers=self._headers(token),
            )
            self.assertEqual(response.status_code, 422, payload)
            self.assertIn("progress", response.get_json()["error"]["fields"])

    def test_delete_removes_progress_and_is_idempotent(self):
        _, token = self._make_user()
        self.client.put(
            "/api/novauser/progress/game",
            json={"progress": {"chapter": 3}},
            headers=self._headers(token),
        )
        first = self.client.delete(
            "/api/novauser/progress/game", headers=self._headers(token)
        )
        self.assertEqual(first.status_code, 200, first.get_json())
        self.assertIsNone(
            self.client.get(
                "/api/novauser/progress/game", headers=self._headers(token)
            ).get_json()["progress"]
        )

        second = self.client.delete(
            "/api/novauser/progress/game", headers=self._headers(token)
        )
        self.assertEqual(second.status_code, 200, second.get_json())

    def test_progress_is_isolated_per_user(self):
        _, first_token = self._make_user()
        _, second_token = self._make_user()
        self.client.put(
            "/api/novauser/progress/game",
            json={"progress": {"chapter": 5}},
            headers=self._headers(first_token),
        )
        second = self.client.get(
            "/api/novauser/progress/game", headers=self._headers(second_token)
        )
        self.assertFalse(second.get_json()["exists"])
        first = self.client.get(
            "/api/novauser/progress/game", headers=self._headers(first_token)
        )
        self.assertEqual(first.get_json()["progress"], {"chapter": 5})

    def test_invalid_token_is_rejected(self):
        response = self.client.get(
            "/api/novauser/progress/game",
            headers={"Authorization": "Bearer not-a-real-token"},
        )
        self.assertEqual(response.status_code, 401)

    def test_schema_has_user_game_progress_table(self):
        inspector = inspect(get_engine())
        self.assertTrue(inspector.has_table("user_game_progress"))
        columns = {column["name"]: column for column in inspector.get_columns("user_game_progress")}
        self.assertEqual(set(columns), {"user_id", "progress", "created_at", "updated_at"})
        primary_key = inspector.get_pk_constraint("user_game_progress")["constrained_columns"]
        self.assertEqual(primary_key, ["user_id"])
        self.assertFalse(columns["progress"]["nullable"])


if __name__ == "__main__":
    unittest.main()
