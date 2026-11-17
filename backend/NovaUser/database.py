"""PostgreSQL-only database setup for NovaUser.

NovaUser deliberately does not fall back to SQLite: authentication data must
live in the configured PostgreSQL ``users.db`` database.  The engine is created
lazily so importing the module does not connect until a request or CLI command
actually needs the database.
"""

from __future__ import annotations

import logging
import os
from contextlib import contextmanager

import psycopg2
from psycopg2 import sql
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import get_settings

logger = logging.getLogger(__name__)

Base = declarative_base()

_engine = None
_SessionFactory = sessionmaker(expire_on_commit=False, autoflush=False)


class DatabaseUnavailable(RuntimeError):
    """Raised when PostgreSQL cannot be reached or prepared."""


def _driver_url(raw_url: str) -> str:
    """Return a SQLAlchemy URL that uses the installed psycopg2 driver.

    SQLAlchemy 2.1 resolves a plain ``postgresql://`` URL to the psycopg 3
    dialect, while this project installs ``psycopg2-binary``.  Pinning the
    driver keeps the environment template portable across SQLAlchemy versions.
    """

    url = raw_url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


def get_engine():
    """Create (once) and return the PostgreSQL SQLAlchemy engine."""

    global _engine
    if _engine is None:
        settings = get_settings()
        url = _driver_url(settings.database_url)
        _engine = create_engine(
            url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_recycle=1800,
            future=True,
        )
        _SessionFactory.configure(bind=_engine)
    return _engine


def get_session():
    """Return a new SQLAlchemy session bound to the NovaUser database."""

    if _engine is None:
        get_engine()
    return _SessionFactory()


@contextmanager
def session_scope():
    """Provide a transactional session with automatic rollback/close."""

    session = get_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def reset_engine() -> None:
    """Dispose the engine (used by tests when the connection URL changes)."""

    global _engine
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _SessionFactory.configure(bind=None)


def _maintenance_connection(url):
    """Connect to the maintenance database using psycopg2."""

    return psycopg2.connect(
        host=url.host or "localhost",
        port=url.port or 5432,
        user=url.username,
        password=url.password,
        dbname="postgres",
        connect_timeout=10,
        application_name="novauser-init",
    )


def ensure_database() -> None:
    """Create the configured database if it does not exist yet.

    PostgreSQL database names are identifiers, so the configured name (for
    example ``users.db``) is quoted safely with psycopg2's Identifier helper.
    """

    settings = get_settings()
    url = make_url(_driver_url(settings.database_url))
    database_name = url.database
    if not database_name:
        raise DatabaseUnavailable("The NovaUser database URL has no database name.")

    try:
        connection = _maintenance_connection(url)
    except psycopg2.Error as exc:
        raise DatabaseUnavailable(
            "Cannot connect to PostgreSQL. Start the database server and verify "
            "NOVAUSER_DATABASE_URL."
        ) from exc

    try:
        connection.autocommit = True
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (database_name,),
            )
            exists = cursor.fetchone() is not None
            if not exists:
                cursor.execute(
                    sql.SQL("CREATE DATABASE {}").format(sql.Identifier(database_name))
                )
                logger.info("Created PostgreSQL database %s", database_name)
    except psycopg2.Error as exc:
        raise DatabaseUnavailable(
            f"Could not create the PostgreSQL database {database_name!r}: {exc}"
        ) from exc
    finally:
        connection.close()


def create_schema() -> None:
    """Create the database (if needed), all tables, and incremental migrations."""

    from . import models  # noqa: F401  (register metadata)
    from .settings import models as settings_models  # noqa: F401  (register metadata)
    from .progress import models as progress_models  # noqa: F401  (register metadata)

    ensure_database()
    try:
        engine = get_engine()
        Base.metadata.create_all(engine)
        _migrate_schema(engine)
    except DatabaseUnavailable:
        raise
    except Exception as exc:
        logger.exception("Could not create the NovaUser schema")
        raise DatabaseUnavailable(
            "Connected to PostgreSQL but could not create the NovaUser schema."
        ) from exc


def _migrate_schema(engine) -> None:
    """Apply idempotent NovaUser schema migrations.

    NovaUser originally stored only password accounts.  Firebase is now the
    primary identity provider, so existing deployments need nullable password
    hashes and Firebase identity columns.  All statements are safe to run on a
    fresh schema and on an already-migrated database.
    """

    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN",
        "UPDATE users SET auth_provider = 'password' WHERE auth_provider IS NULL",
        "ALTER TABLE users ALTER COLUMN auth_provider SET DEFAULT 'password'",
        "ALTER TABLE users ALTER COLUMN auth_provider SET NOT NULL",
        "UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL",
        "ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE",
        "ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL",
        "ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL",
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))

    # A unique index allows many legacy/NULL values but only one account per
    # Firebase UID.  Avoid creating a duplicate constraint on fresh databases
    # where SQLAlchemy already created ``users_firebase_uid_key``.
    inspector = inspect(engine)
    unique_columns = {
        tuple(constraint.get("column_names") or ())
        for constraint in inspector.get_unique_constraints("users")
    }
    unique_columns.update(
        tuple(index.get("column_names") or ())
        for index in inspector.get_indexes("users")
        if index.get("unique")
    )
    if ("firebase_uid",) not in unique_columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "CREATE UNIQUE INDEX IF NOT EXISTS ux_users_firebase_uid "
                    "ON users (firebase_uid) WHERE firebase_uid IS NOT NULL"
                )
            )


def check_database() -> dict:
    """Return a safe status dictionary without leaking connection secrets."""

    try:
        with get_engine().connect() as connection:
            version = connection.execute(text("SELECT version()")).scalar_one()
            database = connection.execute(text("SELECT current_database()")).scalar_one()
        return {
            "connected": True,
            "engine": "postgresql",
            "database": database,
            "server_version": str(version).split(",")[0],
        }
    except Exception as exc:  # pragma: no cover - depends on environment
        logger.warning("NovaUser database check failed: %s", exc)
        return {
            "connected": False,
            "engine": "postgresql",
            "database": get_settings().database_name if _config_available() else "users.db",
            "error": "PostgreSQL is unavailable.",
        }


def _config_available() -> bool:
    try:
        get_settings()
        return True
    except Exception:
        return False


def database_info() -> dict:
    """Return non-secret details about the configured database."""

    settings = get_settings()
    url = make_url(_driver_url(settings.database_url))
    return {
        "host": url.host,
        "port": url.port or 5432,
        "database": url.database,
        "user": url.username,
        "driver": url.drivername,
        "pid": os.getpid(),
    }
