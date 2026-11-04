"""Schema and idempotency tests."""
from __future__ import annotations

from sqlalchemy import inspect, text


def test_schema_tables_and_view(schema):
    from Shared.database import engine

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    expected = {
        "organizations",
        "missions",
        "spacecraft",
        "models_3d",
        "mission_spacecraft",
        "spacecraft_aliases",
        "spacecraft_keywords",
        "spacecraft_images",
        "spacecraft_sources",
        "spacecraft_content",
        "spacecraft_parts",
        "timeline_events",
        "spacecraft_stakeholders",
        "spacecraft_models",
        "people",
        "spacecraft_people",
        "data_sources",
        "ingestion_runs",
        "schema_version",
    }
    assert expected.issubset(tables)
    with engine.connect() as conn:
        view = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='view' AND name='v_spacecraft_completeness'")
        ).first()
    assert view is not None


def test_schema_is_idempotent(schema):
    from Shared.database import engine
    from NovaBase.schema_tools import bootstrap_schema

    before = schema["statements_executed"]
    again = bootstrap_schema(engine)
    assert again["schema_version"] >= 1
    assert again["database_created"] is False
    assert again["statements_executed"] == before


def test_schema_version_recorded(schema):
    from Shared.database import engine

    with engine.connect() as conn:
        row = conn.execute(text("SELECT version, description FROM schema_version")).first()
    assert row is not None
    assert row[0] >= 1


def test_additive_columns_present():
    from Shared.database import engine

    columns = {col["name"] for col in inspect(engine).get_columns("spacecraft")}
    assert {"mission_type", "status_label", "wiki_title", "nssdca_id", "end_date"}.issubset(columns)
