"""Ingestion idempotency and completeness tests (fake providers, no network)."""
from __future__ import annotations

from sqlalchemy import func

from NovaBase.models import (
    Mission,
    Organization,
    Person,
    Spacecraft,
    SpacecraftAlias,
    SpacecraftContent,
    SpacecraftImage,
    SpacecraftKeyword,
    SpacecraftModel,
    SpacecraftPart,
    SpacecraftPerson,
    SpacecraftSource,
    SpacecraftStakeholder,
    TimelineEvent,
)


def _counts(session):
    models = SpacecraftModel
    return {
        "missions": session.query(func.count(Mission.id)).scalar(),
        "organizations": session.query(func.count(Organization.id)).scalar(),
        "spacecraft": session.query(func.count(Spacecraft.id)).scalar(),
        "content": session.query(func.count(SpacecraftContent.id)).scalar(),
        "parts": session.query(func.count(SpacecraftPart.id)).scalar(),
        "images": session.query(func.count(SpacecraftImage.id)).scalar(),
        "sources": session.query(func.count(SpacecraftSource.id)).scalar(),
        "timeline": session.query(func.count(TimelineEvent.id)).scalar(),
        "stakeholders": session.query(func.count(SpacecraftStakeholder.id)).scalar(),
        "models": session.query(func.count(models.id)).scalar(),
        "people": session.query(func.count(Person.id)).scalar(),
        "people_links": session.query(func.count(SpacecraftPerson.id)).scalar(),
        "keywords": session.query(func.count(SpacecraftKeyword.id)).scalar(),
        "aliases": session.query(func.count(SpacecraftAlias.id)).scalar(),
    }


def test_ingest_populates_all_ten_sections(seeded):
    from Shared.database import SessionLocal
    from NovaBase.completeness import SECTION_KEYS, spacecraft_completeness

    assert seeded["people"] == 10
    with SessionLocal() as session:
        sc = session.query(Spacecraft).filter(Spacecraft.slug == "surveyor-1").one()
        statuses = spacecraft_completeness(sc)
    assert set(statuses) == set(SECTION_KEYS)
    assert all(item["populated"] for item in statuses.values())


def test_reingest_is_idempotent(seeded, fake_wiki):
    from Shared.database import SessionLocal
    from NovaBase.ingest import ingest_mission, load_registry

    registry = load_registry()
    mission = next(m for m in registry["missions"] if m["slug"] == "surveyor-1")

    with SessionLocal() as session:
        before = _counts(session)

    # Import the fixtures lazily so this file can also run standalone.
    from backend.tests.fakes import FakeNasa3D, FakeWikipedia

    with SessionLocal() as session:
        ingest_mission(session, mission, FakeWikipedia(fake_wiki), FakeNasa3D(), people_lookup=False)
        session.commit()

    with SessionLocal() as session:
        after = _counts(session)

    assert after == before


def test_people_ranked_one_to_ten(seeded):
    from Shared.database import SessionLocal

    with SessionLocal() as session:
        sc = session.query(Spacecraft).filter(Spacecraft.slug == "surveyor-1").one()
        ranks = sorted(link.rank_order for link in sc.people_links)
    assert ranks == list(range(1, 11))
