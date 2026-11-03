"""Tests for the per-user NovaQuest game-settings API.

Run from the repository root:
    python -m unittest backend/NovaUser/tests/test_settings.py -v
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
from NovaUser.settings.defaults import DEFAULT_GAME_SETTINGS  # noqa: E402


class GameSettingsApiTests(unittest.TestCase):
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
            session.execute(delete(User).where(User.email.like("settings.test.%@example.test")))
            session.commit()
        finally:
            session.close()

    def setUp(self):
        self.client = self.app.test_client()

    def _make_user(self):
        email = f"settings.test.{uuid.uuid4().hex}@example.test"
        session = get_session()
        try:
            user = User(
                full_name="Settings Tester",
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

    def test_settings_endpoints_require_authentication(self):
        self.assertEqual(self.client.get("/api/novauser/settings/game").status_code, 401)
        self.assertEqual(
            self.client.put("/api/novauser/settings/game", json={"settings": {}}).status_code,
            401,
        )

    def test_get_returns_defaults_when_nothing_is_stored(self):
        _, token = self._make_user()
        response = self.client.get(
            "/api/novauser/settings/game", headers=self._headers(token)
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["settings"], DEFAULT_GAME_SETTINGS)

    def test_put_validates_and_persists_settings(self):
        _, token = self._make_user()
        payload = {
            "settings": {
                "audio": {
                    "masterVolume": 42,
                    "musicVolume": 10,
                    "sfxVolume": 99,
                    "ambienceEnabled": False,
                    "uiSoundsEnabled": False,
                    "muted": True,
                },
                "graphics": {
                    "qualityPreset": "Ultra",
                    "particleDensity": "Off",
                    "cosmicGlow": False,
                    "lensShimmer": False,
                    "targetFps": 120,
                },
                "controls": {
                    "invertY": True,
                    "sensitivity": 9,
                    "flightModel": "Realistic",
                    "subtitles": False,
                },
            }
        }
        response = self.client.put(
            "/api/novauser/settings/game", json=payload, headers=self._headers(token)
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        saved = response.get_json()["settings"]
        self.assertEqual(saved["audio"]["masterVolume"], 42)
        self.assertTrue(saved["audio"]["muted"])
        self.assertEqual(saved["graphics"]["targetFps"], "120")
        self.assertEqual(saved["controls"]["flightModel"], "Realistic")

        fetched = self.client.get(
            "/api/novauser/settings/game", headers=self._headers(token)
        )
        self.assertEqual(fetched.get_json()["settings"], saved)

    def test_put_merges_partial_settings_with_defaults(self):
        _, token = self._make_user()
        response = self.client.put(
            "/api/novauser/settings/game",
            json={"settings": {"audio": {"muted": True}}},
            headers=self._headers(token),
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        settings = response.get_json()["settings"]
        self.assertTrue(settings["audio"]["muted"])
        self.assertEqual(settings["audio"]["masterVolume"], DEFAULT_GAME_SETTINGS["audio"]["masterVolume"])

    def test_put_rejects_invalid_values_and_unknown_keys(self):
        _, token = self._make_user()
        response = self.client.put(
            "/api/novauser/settings/game",
            json={
                "settings": {
                    "audio": {"masterVolume": 150, "muted": "yes", "bass": 4},
                    "graphics": {"qualityPreset": "Cinematic"},
                    "controls": {"sensitivity": 0},
                    "unknown": {},
                }
            },
            headers=self._headers(token),
        )
        self.assertEqual(response.status_code, 422, response.get_json())
        fields = response.get_json()["error"]["fields"]
        for field in (
            "audio.masterVolume",
            "audio.muted",
            "audio.bass",
            "graphics.qualityPreset",
            "controls.sensitivity",
            "unknown",
        ):
            self.assertIn(field, fields)

    def test_put_rejects_missing_settings_object(self):
        _, token = self._make_user()
        response = self.client.put(
            "/api/novauser/settings/game", json={"settings": []}, headers=self._headers(token)
        )
        self.assertEqual(response.status_code, 422)
        self.assertIn("settings", response.get_json()["error"]["fields"])

    def test_settings_are_isolated_per_user(self):
        _, first_token = self._make_user()
        _, second_token = self._make_user()
        self.client.put(
            "/api/novauser/settings/game",
            json={"settings": {"audio": {"muted": True}}},
            headers=self._headers(first_token),
        )
        second = self.client.get(
            "/api/novauser/settings/game", headers=self._headers(second_token)
        )
        self.assertFalse(second.get_json()["settings"]["audio"]["muted"])
        first = self.client.get(
            "/api/novauser/settings/game", headers=self._headers(first_token)
        )
        self.assertTrue(first.get_json()["settings"]["audio"]["muted"])

    def test_schema_has_user_game_settings_table(self):
        inspector = inspect(get_engine())
        self.assertTrue(inspector.has_table("user_game_settings"))
        columns = {column["name"]: column for column in inspector.get_columns("user_game_settings")}
        self.assertEqual(set(columns), {"user_id", "settings", "created_at", "updated_at"})
        primary_key = inspector.get_pk_constraint("user_game_settings")["constrained_columns"]
        self.assertEqual(primary_key, ["user_id"])
        self.assertFalse(columns["settings"]["nullable"])


if __name__ == "__main__":
    unittest.main()
