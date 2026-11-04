"""Shared pytest fixtures for the NovaBase rebuild.

The SQLite path is set before any project module is imported, because
``Shared.database`` creates the engine at import time.
"""
from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
for entry in (str(ROOT), str(BACKEND)):
    if entry not in sys.path:
        sys.path.insert(0, entry)

_TMP_DIR = tempfile.mkdtemp(prefix="novabase-tests-")
os.environ["NOVABASE_SQLITE_PATH"] = os.path.join(_TMP_DIR, "test_novabase.db")
os.environ.pop("DATABASE_URL", None)

import pytest  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def schema():
    from Shared.database import engine
    from NovaBase.schema_tools import bootstrap_schema

    info = bootstrap_schema(engine)
    assert info["schema_version"] >= 1
    return info


@pytest.fixture(scope="session")
def fake_wiki():
    return {
        "page": {
            "title": "Surveyor 1",
            "pageid": 98556,
            "extract": (
                "Surveyor 1 was the first lunar soft-lander of the United States. "
                "It was launched on 30 May 1966 and landed on 2 June 1966."
            ),
            "original_image": "https://upload.wikimedia.org/surveyor1.jpg",
            "revision_id": "123456789",
            "page_url": "https://en.wikipedia.org/wiki/Surveyor_1",
            "license": "CC BY-SA 4.0",
            "attribution": "Wikipedia contributors, Surveyor 1, CC BY-SA 4.0",
        },
        "secondary_pages": [],
        "sections": [
            {
                "title": "",
                "text": (
                    "Surveyor 1 was the first lunar soft-lander of the United States. "
                    "It was launched on 30 May 1966 and landed on 2 June 1966."
                ),
            },
            {
                "title": "Design and instruments",
                "text": (
                    "The spacecraft design used a retrorocket, three landing legs and "
                    "a television camera to study the lunar surface."
                ),
            },
            {
                "title": "Science results",
                "text": (
                    "The mission returned the first close-up photographs of the Moon "
                    "and proved that a soft landing was possible."
                ),
            },
            {
                "title": "Legacy and status",
                "text": "Contact ended in January 1967 after a successful mission.",
            },
        ],
        "infobox": {
            "operator": "NASA",
            "manufacturer": "Hughes Aircraft",
            "launch date": "30 May 1966",
            "power": "Solar panels and batteries",
        },
        "images": [
            {
                "file_title": "File:Surveyor 1 launch.jpg",
                "name": "Surveyor 1 launch.jpg",
                "url": "https://upload.wikimedia.org/surveyor1-launch.jpg",
                "thumb_url": "https://upload.wikimedia.org/surveyor1-launch-thumb.jpg",
                "width": 1200,
                "height": 1500,
                "license": "Public domain",
                "artist": "NASA",
                "description_url": "https://commons.wikimedia.org/wiki/File:Surveyor_1_launch.jpg",
                "kind": "photo",
            },
            {
                "file_title": "File:Surveyor 1 diagram.jpg",
                "name": "Surveyor 1 diagram.jpg",
                "url": "https://upload.wikimedia.org/surveyor1-diagram.jpg",
                "thumb_url": "https://upload.wikimedia.org/surveyor1-diagram-thumb.jpg",
                "width": 1000,
                "height": 800,
                "license": "Public domain",
                "artist": "NASA",
                "description_url": "https://commons.wikimedia.org/wiki/File:Surveyor_1_diagram.jpg",
                "kind": "diagram",
            },
        ],
        "wikitext_sections": [],
        "wikitext": (
            "== Design and instruments ==\n"
            "* Television camera – returned lunar surface images\n"
            "* Retrorocket – slowed the lander for touchdown\n"
        ),
        "license": "CC BY-SA 4.0",
        "attribution": "Wikipedia contributors, Surveyor 1, CC BY-SA 4.0",
    }


class FakeWikipedia:
    def __init__(self, wiki):
        self.wiki = wiki

    def fetch_mission(self, mission):
        return self.wiki

    def lookup_person(self, full_name):
        return None


class FakeNasa3D:
    def find_models(self, *args, **kwargs):
        return []


@pytest.fixture(scope="session")
def seeded(fake_wiki):
    from backend.tests.fakes import FakeNasa3D, FakeWikipedia
    from Shared.database import SessionLocal
    from NovaBase.ingest import ingest_mission, load_registry

    registry = load_registry()
    mission = next(m for m in registry["missions"] if m["slug"] == "surveyor-1")
    with SessionLocal() as session:
        stats = ingest_mission(
            session,
            mission,
            FakeWikipedia(fake_wiki),
            FakeNasa3D(),
            people_lookup=False,
        )
        session.commit()
    return stats
