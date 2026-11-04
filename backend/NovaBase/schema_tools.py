"""Schema application and additive migrations for NovaBase.

The canonical DDL lives in ``schema.sql``.  This module:

* creates the PostgreSQL database named in ``DATABASE_URL`` if it is missing;
* applies ``schema.sql`` idempotently (no DROP TABLE on the default path);
* rewrites the few PostgreSQL-only constructs for SQLite;
* adds the NovaBase columns to an older ``spacecraft`` table;
* records a row in ``schema_version``.

Run via ``python -m backend.NovaBase.init_db``.
"""
from __future__ import annotations

import logging
import os
import re
from pathlib import Path
from typing import Iterable

from sqlalchemy import inspect, text

logger = logging.getLogger(__name__)

SCHEMA_PATH = Path(__file__).with_name("schema.sql")
SCHEMA_VERSION = 1

# Columns added by the NovaBase rebuild.  ``ALTER TABLE ADD COLUMN`` works on
# both SQLite and PostgreSQL and is safe to run against an existing database.
ADDITIVE_COLUMNS: dict[str, dict[str, str]] = {
    "spacecraft": {
        "mission_type": "VARCHAR(50)",
        "primary_agency": "VARCHAR(255)",
        "summary": "TEXT",
        "wiki_title": "VARCHAR(255)",
        "nssdca_id": "VARCHAR(50)",
        "arrival_or_landing_date": "VARCHAR(50)",
        "end_date": "VARCHAR(50)",
        "status_label": "VARCHAR(50)",
        "status_text": "TEXT",
        "status_as_of": "VARCHAR(20)",
        "is_active_flag": "BOOLEAN DEFAULT FALSE",
        "extra": "TEXT",
        "updated_at": "TIMESTAMP",
    },
    "spacecraft_images": {
        "thumbnail_url": "VARCHAR(1000)",
        "kind": "VARCHAR(50)",
        "credit": "VARCHAR(255)",
        "license": "VARCHAR(255)",
        "source_id": "INTEGER",
        "width": "INTEGER",
        "height": "INTEGER",
        "sort_order": "INTEGER DEFAULT 0",
    },
    "spacecraft_sources": {
        "label": "VARCHAR(255)",
        "url": "VARCHAR(1000)",
        "verified": "BOOLEAN DEFAULT FALSE",
        "http_status": "INTEGER",
        "last_checked": "TIMESTAMP",
        "source_id": "INTEGER",
    },
}

# Reverse dependency order for the explicit --reset path only.
RESET_ORDER = [
    "v_spacecraft_completeness",
    "spacecraft_people",
    "people",
    "spacecraft_models",
    "spacecraft_stakeholders",
    "timeline_events",
    "spacecraft_parts",
    "spacecraft_content",
    "spacecraft_sources",
    "spacecraft_images",
    "spacecraft_keywords",
    "spacecraft_aliases",
    "mission_spacecraft",
    "models_3d",
    "spacecraft",
    "missions",
    "organizations",
    "ingestion_runs",
    "data_sources",
    "schema_version",
]


def create_database_if_missing(database_url: str) -> bool:
    """Create the PostgreSQL database if it does not exist.

    Returns True when a database was created.  No-op for SQLite.
    """
    if not database_url or not database_url.lower().startswith(
        ("postgresql://", "postgres://", "postgresql+psycopg://", "postgresql+psycopg2://")
    ):
        return False

    from sqlalchemy.engine import make_url

    raw = database_url.replace("postgres://", "postgresql://", 1)
    raw = raw.replace("postgresql+psycopg://", "postgresql://", 1)
    raw = raw.replace("postgresql+psycopg2://", "postgresql://", 1)
    url = make_url(raw)
    database = url.database
    if not database:
        return False

    try:
        import psycopg2
    except ImportError:  # pragma: no cover - requirements include psycopg2-binary
        logger.warning("psycopg2 is not installed; skipping CREATE DATABASE.")
        return False

    try:
        conn = psycopg2.connect(
            host=url.host or "localhost",
            port=url.port or 5432,
            user=url.username,
            password=url.password,
            dbname="postgres",
            connect_timeout=8,
        )
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database,))
            exists = cur.fetchone() is not None
            if not exists:
                safe_name = database.replace('"', '""')
                cur.execute(f'CREATE DATABASE "{safe_name}"')
                logger.info("Created PostgreSQL database %s", database)
        conn.close()
        return not exists
    except Exception as exc:  # pragma: no cover - depends on server state
        logger.warning("Could not create PostgreSQL database %s: %s", database, exc)
        return False


def _split_statements(sql: str) -> list[tuple[str, bool]]:
    """Split SQL into (statement, postgres_only) tuples.

    Handles the ``-- @postgres-only`` marker and ignores semicolons inside
    quoted strings.  The DDL in schema.sql intentionally contains no dollar
    quoting or procedural bodies.
    """
    sql = re.sub(r"--\s*@postgres-only\s*\n", "@@PGONLY@@", sql)
    sql = re.sub(r"--[^\n]*", "", sql)

    statements: list[tuple[str, bool]] = []
    buffer: list[str] = []
    quote: str | None = None
    i = 0
    while i < len(sql):
        ch = sql[i]
        if quote:
            buffer.append(ch)
            if ch == quote:
                # Handle escaped single quotes ('')
                if i + 1 < len(sql) and sql[i + 1] == quote:
                    buffer.append(sql[i + 1])
                    i += 1
                else:
                    quote = None
        elif ch in ("'", '"'):
            quote = ch
            buffer.append(ch)
        elif ch == ";":
            statement = "".join(buffer).strip()
            if statement:
                pg_only = statement.startswith("@@PGONLY@@")
                statement = statement.replace("@@PGONLY@@", "", 1).strip()
                if statement:
                    statements.append((statement, pg_only))
            buffer = []
        else:
            buffer.append(ch)
        i += 1

    tail = "".join(buffer).strip()
    if tail:
        pg_only = tail.startswith("@@PGONLY@@")
        statements.append((tail.replace("@@PGONLY@@", "", 1).strip(), pg_only))
    return statements


def _sqlite_variant(statement: str) -> str:
    statement = re.sub(r"\bBIGSERIAL\b", "INTEGER", statement, flags=re.IGNORECASE)
    statement = re.sub(r"\bSERIAL\b", "INTEGER", statement, flags=re.IGNORECASE)
    statement = re.sub(r"TIMESTAMP\s+WITH\s+TIME\s+ZONE", "TIMESTAMP", statement, flags=re.IGNORECASE)
    statement = re.sub(r"\bDOUBLE\s+PRECISION\b", "REAL", statement, flags=re.IGNORECASE)
    statement = re.sub(r"\bJSONB\b", "TEXT", statement, flags=re.IGNORECASE)
    statement = re.sub(r"\bNOW\(\)", "CURRENT_TIMESTAMP", statement, flags=re.IGNORECASE)
    # SQLite needs INTEGER PRIMARY KEY AUTOINCREMENT to autoincrement.
    statement = re.sub(
        r"\b(\w+)\s+INTEGER\s+PRIMARY\s+KEY\b",
        r"\1 INTEGER PRIMARY KEY AUTOINCREMENT",
        statement,
        flags=re.IGNORECASE,
    )
    return statement


def _postgres_variant(statement: str) -> str:
    # PostgreSQL has CREATE OR REPLACE VIEW, not CREATE VIEW IF NOT EXISTS.
    statement = re.sub(
        r"CREATE\s+VIEW\s+IF\s+NOT\s+EXISTS",
        "CREATE OR REPLACE VIEW",
        statement,
        flags=re.IGNORECASE,
    )
    return statement


def apply_schema(engine) -> list[str]:
    """Apply schema.sql to the given engine.  Returns the statements executed."""
    sql = SCHEMA_PATH.read_text(encoding="utf-8")
    is_sqlite = engine.dialect.name == "sqlite"
    executed: list[str] = []

    with engine.begin() as conn:
        for statement, pg_only in _split_statements(sql):
            if is_sqlite and pg_only:
                continue
            prepared = _sqlite_variant(statement) if is_sqlite else _postgres_variant(statement)
            try:
                conn.execute(text(prepared))
                executed.append(prepared)
            except Exception as exc:
                # CREATE INDEX IF NOT EXISTS is supported everywhere we target,
                # but a partial failure must not abort the whole bootstrap.
                logger.warning("Schema statement skipped (%s): %s", exc, prepared.splitlines()[0][:120])
    return executed


def ensure_additive_columns(engine) -> list[str]:
    """Add NovaBase columns to an existing legacy database."""
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    added: list[str] = []

    with engine.begin() as conn:
        for table, columns in ADDITIVE_COLUMNS.items():
            if table not in existing_tables:
                continue
            present = {col["name"] for col in inspector.get_columns(table)}
            for name, coltype in columns.items():
                if name in present:
                    continue
                sql = f"ALTER TABLE {table} ADD COLUMN {name} {coltype}"
                conn.execute(text(sql))
                added.append(sql)
                logger.info("Added column %s.%s", table, name)
    return added


def record_schema_version(engine) -> None:
    with engine.begin() as conn:
        try:
            row = conn.execute(text("SELECT version FROM schema_version WHERE version = :v"), {"v": SCHEMA_VERSION}).first()
            if row is None:
                conn.execute(
                    text(
                        "INSERT INTO schema_version (version, description) "
                        "VALUES (:v, :d)"
                    ),
                    {"v": SCHEMA_VERSION, "d": "NovaBase 10-section schema"},
                )
        except Exception as exc:
            logger.warning("Could not record schema_version: %s", exc)


def reset_database(engine) -> None:
    """Destructive reset.  Only called after an explicit confirmation."""
    is_sqlite = engine.dialect.name == "sqlite"
    with engine.begin() as conn:
        if is_sqlite:
            conn.execute(text("PRAGMA foreign_keys=OFF"))
        for table in RESET_ORDER:
            conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE' if not is_sqlite else f'DROP TABLE IF EXISTS "{table}"'))
        if is_sqlite:
            conn.execute(text("PRAGMA foreign_keys=ON"))


def bootstrap_schema(engine, reset: bool = False) -> dict:
    """Create DB objects, apply DDL, run additive migrations, record version."""
    from Shared.database import DATABASE_URL

    created_database = False
    if not reset:
        created_database = create_database_if_missing(DATABASE_URL)

    if reset:
        reset_database(engine)

    executed = apply_schema(engine)

    # SQLAlchemy models are the source of truth for tables added after the
    # original schema; create_all is a no-op for tables that already exist.
    from Shared.database import Base
    import NovaBase.models  # noqa: F401  (registers all models on Base.metadata)

    Base.metadata.create_all(bind=engine)

    added_columns = ensure_additive_columns(engine)
    record_schema_version(engine)

    return {
        "database_created": created_database,
        "statements_executed": len(executed),
        "columns_added": len(added_columns),
        "schema_version": SCHEMA_VERSION,
    }
