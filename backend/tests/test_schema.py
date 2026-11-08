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
        "map_objects",
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

    inspector = inspect(engine)
    sc_cols = {col["name"] for col in inspector.get_columns("spacecraft")}
    assert {"mission_type", "status_label", "wiki_title", "nssdca_id", "end_date", "primary_mission_id"}.issubset(sc_cols)

    mission_cols = {col["name"] for col in inspector.get_columns("missions")}
    assert {"name", "mission_name", "slug", "destination_category", "destination", "end_date", "mission_end_date"}.issubset(mission_cols)

    ms_cols = {col["name"] for col in inspector.get_columns("mission_spacecraft")}
    assert {"mission_id", "spacecraft_id", "role", "mission_role"}.issubset(ms_cols)

    map_cols = {col["name"] for col in inspector.get_columns("map_objects")}
    assert {"object_name", "object_type", "spacecraft_id", "mission_id", "parent_body"}.issubset(map_cols)


def test_map_objects_crud_and_relationships():
    from Shared.database import SessionLocal
    from NovaBase.models import MapObject, Mission, Spacecraft

    with SessionLocal() as session:
        # Create a test mission and spacecraft
        mission = Mission(
            name="Map Test Mission",
            slug="map-test-mission",
            destination="Mars",
            mission_status="Active"
        )
        session.add(mission)
        session.flush()

        spacecraft = Spacecraft(
            name="Map Test Rover",
            slug="map-test-rover",
            primary_mission_id=mission.id,
            object_type="Rover",
            destination="Mars"
        )
        session.add(spacecraft)
        session.flush()

        # Create MapObject referencing both
        map_obj = MapObject(
            object_name="Map Test Rover",
            object_type="rover",
            spacecraft_id=spacecraft.id,
            mission_id=mission.id,
            parent_body="Mars",
            position_source="Mars Surface Coordinate System",
            position_data='{"latitude": -4.5895, "longitude": 137.4417}',
            visibility_status="visible"
        )
        session.add(map_obj)
        session.commit()

        # Verify retrieval and relationships
        queried = session.query(MapObject).filter(MapObject.object_name == "Map Test Rover").first()
        assert queried is not None
        assert queried.spacecraft.name == "Map Test Rover"
        assert queried.mission.name == "Map Test Mission"
        assert queried.parent_body == "Mars"

        # Verify serialization
        data = queried.to_dict()
        assert data["object_name"] == "Map Test Rover"
        assert data["object_type"] == "rover"
        assert data["spacecraft"]["name"] == "Map Test Rover"
        assert data["mission"]["name"] == "Map Test Mission"
        assert data["position_data"]["latitude"] == -4.5895

        # Clean up
        session.delete(queried)
        session.delete(spacecraft)
        session.delete(mission)
        session.commit()


def test_map_objects_api_endpoints():
    from NovaBase.app import app

    app.config.update(TESTING=True)
    with app.test_client() as client:
        res = client.get("/api/map/objects")
        assert res.status_code == 200
        data = res.get_json()
        assert "objects" in data
        assert "count" in data
        assert isinstance(data["objects"], list)

        res_filters = client.get("/api/map/filters")
        assert res_filters.status_code == 200
        filter_data = res_filters.get_json()
        assert "object_types" in filter_data
        assert "destinations" in filter_data
        assert "missions" in filter_data
        assert "statuses" in filter_data


def test_mission_name_sync():
    from NovaBase.models import Mission

    # Test initialization with name
    m1 = Mission(name="Voyager Program", slug="voyager-test-1")
    assert m1.mission_name == "Voyager Program"
    assert m1.name == "Voyager Program"

    # Test initialization with mission_name
    m2 = Mission(mission_name="Galileo Mission", slug="galileo-test-1")
    assert m2.name == "Galileo Mission"
    assert m2.mission_name == "Galileo Mission"

    # Test to_dict produces both fields
    d1 = m1.to_dict()
    assert d1["name"] == "Voyager Program"
    assert d1["mission_name"] == "Voyager Program"


def test_spacecraft_mission_interchangeability():
    from NovaBase.models import MissionSpacecraft, SpacecraftMission

    # Verify class alias
    assert SpacecraftMission is MissionSpacecraft

    # Verify role / mission_role auto-sync
    assoc1 = MissionSpacecraft(mission_id=1, spacecraft_id=1, role="Orbiter")
    assert assoc1.mission_role == "Orbiter"
    assert assoc1.role == "Orbiter"

    assoc2 = SpacecraftMission(mission_id=1, spacecraft_id=2, mission_role="Lander")
    assert assoc2.role == "Lander"
    assert assoc2.mission_role == "Lander"

    # Verify notes / relationship_description auto-sync
    assoc3 = MissionSpacecraft(mission_id=1, spacecraft_id=3, notes="Primary scientific explorer")
    assert assoc3.relationship_description == "Primary scientific explorer"
    assert assoc3.notes == "Primary scientific explorer"


def test_schema_migration_from_legacy_db(tmp_path):
    """Test non-destructive migration from a legacy database schema."""
    import sqlite3
    from sqlalchemy import create_engine
    from NovaBase.schema_tools import bootstrap_schema

    db_path = tmp_path / "legacy.db"
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    # Create a legacy-style missions table with ONLY name (no mission_name)
    cursor.execute("""
        CREATE TABLE missions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            destination_category VARCHAR(100) DEFAULT 'Deep Space',
            launch_date VARCHAR(50),
            mission_status VARCHAR(100) DEFAULT 'Active',
            description TEXT
        )
    """)
    cursor.execute("INSERT INTO missions (name, slug, description) VALUES ('Apollo 11', 'apollo-11', 'First lunar landing')")

    # Create a legacy physical spacecraft_missions table
    cursor.execute("""
        CREATE TABLE spacecraft_missions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mission_id INTEGER NOT NULL,
            spacecraft_id INTEGER NOT NULL,
            mission_role VARCHAR(100),
            relationship_description TEXT
        )
    """)
    cursor.execute("""
        INSERT INTO spacecraft_missions (mission_id, spacecraft_id, mission_role, relationship_description)
        VALUES (1, 101, 'Lunar Module', 'Eagle landed at Tranquility Base')
    """)

    conn.commit()
    conn.close()

    # Now run bootstrap_schema on this legacy database
    legacy_engine = create_engine(f"sqlite:///{db_path}")
    res = bootstrap_schema(legacy_engine)
    assert res["schema_version"] == 2

    legacy_inspector = inspect(legacy_engine)
    tables = set(legacy_inspector.get_table_names())

    # Verify map_objects was created
    assert "map_objects" in tables
    assert "mission_spacecraft" in tables

    # Verify missions has mission_name added and data synced
    with legacy_engine.connect() as check_conn:
        m_row = check_conn.execute(text("SELECT name, mission_name FROM missions WHERE slug = 'apollo-11'")).first()
        assert m_row is not None
        assert m_row[0] == "Apollo 11"
        assert m_row[1] == "Apollo 11"  # Auto-synced!

        # Verify records from legacy spacecraft_missions were migrated to mission_spacecraft
        ms_row = check_conn.execute(text("SELECT mission_id, spacecraft_id, role, mission_role, relationship_description FROM mission_spacecraft WHERE mission_id = 1")).first()
        assert ms_row is not None
        assert ms_row[0] == 1
        assert ms_row[1] == 101
        assert ms_row[2] == "Lunar Module"
        assert ms_row[3] == "Lunar Module"
        assert ms_row[4] == "Eagle landed at Tranquility Base"

