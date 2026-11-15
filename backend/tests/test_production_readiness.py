import os
import sys
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from Shared.database import is_production, create_db_engine


def test_production_environment_detection():
    """Verify is_production() correctly identifies Railway and production environments."""
    with patch.dict(os.environ, {"RAILWAY_ENVIRONMENT": "production"}):
        assert is_production() is True

    with patch.dict(os.environ, {"FLASK_ENV": "production"}):
        assert is_production() is True

    with patch.dict(os.environ, {"ENVIRONMENT": "production"}):
        assert is_production() is True

    with patch.dict(os.environ, {}, clear=True):
        assert is_production() is False


def test_production_blocks_silent_sqlite_fallback_when_db_missing():
    """Verify that in production, missing DATABASE_URL raises RuntimeError instead of falling back to SQLite."""
    with patch.dict(os.environ, {"RAILWAY_ENVIRONMENT": "production", "DATABASE_URL": ""}):
        with pytest.raises(RuntimeError) as exc_info:
            create_db_engine()
        assert "Silent SQLite fallback is strictly prohibited" in str(exc_info.value)


def test_production_blocks_silent_sqlite_fallback_on_postgres_failure():
    """Verify that in production, connection failure to PostgreSQL raises RuntimeError instead of falling back to SQLite."""
    with patch.dict(os.environ, {
        "RAILWAY_ENVIRONMENT": "production",
        "DATABASE_URL": "postgresql://invalid_user:invalid_pass@127.0.0.1:9999/testdb"
    }):
        with pytest.raises(RuntimeError) as exc_info:
            create_db_engine()
        assert "Failed to connect to production PostgreSQL database" in str(exc_info.value)


def test_local_dev_allows_sqlite_fallback():
    """Verify that in local dev (no production env), SQLite fallback works."""
    with patch.dict(os.environ, {"DATABASE_URL": ""}, clear=True):
        engine = create_db_engine()
        assert engine.url.drivername == "sqlite"


def test_gunicorn_entry_point_has_all_routes():
    """Verify that backend.app:app has both NovaBase and NovaUser routes registered."""
    from backend.app import app
    rules = [rule.rule for rule in app.url_map.iter_rules()]
    assert "/api/health" in rules
    assert "/api/novabase/health" in rules
    assert "/api/hardware" in rules
    assert "/api/missions" in rules
    assert "/api/novauser/auth/login" in rules
    assert "/api/novauser/health" in rules


def test_novauser_ensure_database_does_not_call_create_database_when_target_connects():
    """Verify ensure_database returns without CREATE DATABASE if target database is reachable."""
    with patch("psycopg2.connect") as mock_connect:
        mock_conn = MagicMock()
        mock_connect.return_value = mock_conn
        with patch.dict(os.environ, {
            "NOVAUSER_DATABASE_URL": "postgresql://user:pass@railway.internal:5432/railway",
            "NOVAUSER_JWT_SECRET": "a" * 32
        }):
            from NovaUser.config import clear_settings_cache
            clear_settings_cache()
            from NovaUser.database import ensure_database
            ensure_database()
            # Verify it connected to target db directly
            mock_connect.assert_called_once()
            args, kwargs = mock_connect.call_args
            assert kwargs["dbname"] == "railway"
            # Verify no cursor was opened or query was run on maintenance connection
            mock_conn.cursor.assert_not_called()
