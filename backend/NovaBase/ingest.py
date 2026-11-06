"""Registry-driven, idempotent NovaBase ingestion pipeline.

Adding spacecraft #21 means adding one entry to
``backend/NovaBase/data/missions_registry.json`` (or using
``python -m backend.NovaBase.expand_db add``).  No spacecraft is hard-coded in
this module.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from sqlalchemy.orm import Session

from .completeness import detail_payload
from .models import (
    DataSource,
    IngestionRun,
    Mission,
    MissionSpacecraft,
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
from .parsing import (
    build_content_sections,
    build_images,
    build_sources,
    build_stakeholders,
    build_timeline,
    extract_parts,
    parts_from_infobox,
)
from .providers.nasa_3d import Nasa3DProvider, VIEWER_FALLBACK
from .providers.wikipedia import WikipediaProvider

logger = logging.getLogger(__name__)

REGISTRY_PATH = Path(__file__).resolve().parent / "data" / "missions_registry.json"

STATUS_TO_OPERATIONAL = {
    "active": "Active / operational",
    "ended": "Inactive / completed",
    "completed": "Inactive / completed",
    "lost_contact": "Inactive / lost contact",
    "retired": "Inactive / retired",
    "missing": "Unknown / missing",
}


def load_registry(path: str | Path | None = None) -> dict[str, Any]:
    registry_path = Path(path) if path else REGISTRY_PATH
    with registry_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if "missions" not in payload or not isinstance(payload["missions"], list):
        raise ValueError(f"Registry {registry_path} has no 'missions' list")
    return payload


def registry_slugs(registry: dict[str, Any]) -> list[str]:
    return [mission["slug"] for mission in registry["missions"]]


def slugify(value: str) -> str:
    value = re.sub(r"[^\w\s-]", "", value or "", flags=re.UNICODE).strip().lower()
    return re.sub(r"[-\s]+", "-", value).strip("-") or "unknown"


def _first_sentence(text: str, limit: int = 400) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    if not text:
        return ""
    match = re.match(r"(.+?[.!?])(\s|$)", text)
    sentence = match.group(1) if match else text
    return sentence[:limit].strip()


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _upsert_organization(session: Session, name: str, role: str = "Space Agency") -> Organization:
    name = (name or "").strip()
    if not name:
        name = "Unknown"
    slug = slugify(name)
    org = session.query(Organization).filter(Organization.slug == slug).first()
    if org is None:
        org = Organization(
            name=name,
            slug=slug,
            organization_type=role,
            country=None,
            official_url=None,
        )
        session.add(org)
        session.flush()
    return org


def _upsert_mission(session: Session, mission: dict[str, Any]) -> Mission:
    slug = mission["slug"]
    row = session.query(Mission).filter(Mission.slug == slug).first()
    official_url = None
    for source in mission.get("sources") or []:
        if source.get("source_type") in ("official_nasa", "mission_site", "esa"):
            official_url = source.get("url")
            break
    mission_name = mission.get("display_name") or mission.get("name")
    end_date = mission.get("end_date")
    values = {
        "name": mission_name,
        "mission_name": mission_name,
        "slug": slug,
        "destination_category": mission.get("destination_category", "Deep Space"),
        "destination": mission.get("destination") or mission.get("destination_category", "Deep Space"),
        "launch_date": mission.get("launch_date"),
        "end_date": end_date,
        "mission_end_date": end_date,
        "mission_status": mission.get("mission_status", "Active"),
        "description": mission.get("status_text"),
        "official_url": official_url,
        "source_url": official_url,
    }
    if row is None:
        row = Mission(**values)
        session.add(row)
        session.flush()
    else:
        for key, value in values.items():
            setattr(row, key, value)
    return row


def _upsert_spacecraft(
    session: Session,
    mission: dict[str, Any],
    mission_row: Mission,
    organizations: dict[str, Organization],
) -> Spacecraft:
    slug = mission["slug"]
    sc = session.query(Spacecraft).filter(Spacecraft.slug == slug).first()
    status_label = (mission.get("status_label") or "ended").lower()
    operational = STATUS_TO_OPERATIONAL.get(status_label, "Unknown / missing")
    values = {
        "name": mission.get("name") or mission["display_name"],
        "slug": slug,
        "display_name": mission.get("display_name") or mission.get("name"),
        "full_name": mission.get("display_name") or mission.get("name"),
        "object_type": mission.get("object_type", "Spacecraft"),
        "destination_category": mission.get("destination_category", "Deep Space"),
        "destination": mission.get("destination", "Deep Space"),
        "operational_status": operational,
        "launch_date": mission.get("launch_date"),
        "decommission_date": mission.get("end_date"),
        "landing_date": mission.get("landing_date"),
        "short_description": mission.get("status_text") or "Information pending ingestion.",
        "educational_description": mission.get("status_text") or "Information pending ingestion.",
        "how_it_works": mission.get("status_text") or "Information pending ingestion.",
        "why_it_is_important": mission.get("status_text") or "Information pending ingestion.",
        "scientific_purpose": mission.get("status_text") or "Information pending ingestion.",
        "current_or_last_known_status": mission.get("status_text") or "Information pending ingestion.",
        "official_url": (mission.get("sources") or [{}])[0].get("url") or "https://science.nasa.gov/",
        "verification_status": "Wikipedia + NASA sources; run verify_db to check links",
        "last_verified_at": datetime.now(timezone.utc).date().isoformat(),
        "primary_mission_id": mission_row.id,
        "mission_agency_id": organizations.get("agency").id if organizations.get("agency") else None,
        "operator_id": organizations.get("operator").id if organizations.get("operator") else None,
        "manufacturer_id": organizations.get("manufacturer").id if organizations.get("manufacturer") else None,
        "mission_type": mission.get("mission_type"),
        "primary_agency": mission.get("agency"),
        "summary": mission.get("status_text"),
        "wiki_title": mission.get("wiki_title"),
        "nssdca_id": mission.get("nssdca_id"),
        "arrival_or_landing_date": mission.get("landing_date"),
        "end_date": mission.get("end_date"),
        "status_label": status_label,
        "status_text": mission.get("status_text"),
        "status_as_of": datetime.now(timezone.utc).date().isoformat(),
        "is_active_flag": status_label == "active",
        "updated_at": _now(),
    }
    if sc is None:
        sc = Spacecraft(**values)
        session.add(sc)
        session.flush()
    else:
        for key, value in values.items():
            setattr(sc, key, value)
    return sc


def _ensure_source(
    session: Session, spacecraft: Spacecraft, label: str, url: str, source_type: str
) -> SpacecraftSource:
    source = (
        session.query(SpacecraftSource)
        .filter(SpacecraftSource.spacecraft_id == spacecraft.id, SpacecraftSource.source_url == url)
        .first()
    )
    if source is None:
        source = SpacecraftSource(
            spacecraft_id=spacecraft.id,
            source_name=label,
            source_url=url,
            source_type=source_type,
            label=label,
            url=url,
            verified=False,
            last_checked_at=None,
        )
        session.add(source)
        session.flush()
    else:
        source.source_name = label
        source.source_type = source_type
        source.label = label
        source.url = url
    return source


def _register_data_sources(session: Session, registry: dict[str, Any]) -> None:
    defaults = registry.get("defaults") or {}
    entries = [
        {
            "api_name": "wikipedia",
            "base_url": defaults.get("wikipedia_api", "https://en.wikipedia.org/w/api.php"),
            "license": "CC BY-SA 4.0",
            "attribution": "Wikipedia contributors",
        },
        {
            "api_name": "nasa_3d",
            "base_url": defaults.get("nasa_3d_tree", "https://api.github.com/repos/nasa/NASA-3D-Resources/git/trees/master?recursive=1"),
            "license": "NASA 3D resources are free to use without copyright",
            "attribution": "NASA 3D Resources",
        },
        {
            "api_name": "nssdca",
            "base_url": defaults.get("nssdca_pattern", "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id={id}"),
            "license": "NASA public domain",
            "attribution": "NASA NSSDCA",
        },
    ]
    for entry in entries:
        row = session.query(DataSource).filter(DataSource.api_name == entry["api_name"]).first()
        if row is None:
            session.add(DataSource(**entry))
        else:
            row.base_url = entry["base_url"]
            row.license = entry["license"]
            row.attribution = entry["attribution"]
            row.last_checked = _now()


def ingest_mission(
    session: Session,
    mission: dict[str, Any],
    wikipedia: WikipediaProvider,
    nasa3d: Nasa3DProvider,
    people_lookup: bool = True,
) -> dict[str, Any]:
    """Ingest one registry entry.  Child rows are replaced deterministically."""
    stats = {
        "slug": mission["slug"],
        "content": 0,
        "parts": 0,
        "images": 0,
        "sources": 0,
        "timeline": 0,
        "stakeholders": 0,
        "models": 0,
        "people": 0,
        "errors": [],
    }

    organizations = {
        "agency": _upsert_organization(session, mission.get("agency") or "Unknown", "Space Agency"),
        "operator": _upsert_organization(session, mission.get("operator") or mission.get("agency") or "Unknown", "Operator"),
        "manufacturer": _upsert_organization(session, mission.get("manufacturer") or "Unknown", "Manufacturer"),
    }
    mission_row = _upsert_mission(session, mission)
    spacecraft = _upsert_spacecraft(session, mission, mission_row, organizations)

    # Keep the existing mission_spacecraft contract populated too.
    link = (
        session.query(MissionSpacecraft)
        .filter(
            MissionSpacecraft.mission_id == mission_row.id,
            MissionSpacecraft.spacecraft_id == spacecraft.id,
        )
        .first()
    )
    if link is None:
        session.add(
            MissionSpacecraft(
                mission_id=mission_row.id,
                spacecraft_id=spacecraft.id,
                role=mission.get("mission_type") or "Primary Spacecraft",
            )
        )

    try:
        wiki = wikipedia.fetch_mission(mission)
    except Exception as exc:
        stats["errors"].append(f"wikipedia: {exc}")
        logger.warning("Wikipedia ingestion failed for %s: %s", mission["slug"], exc)
        wiki = {
            "page": {},
            "sections": [],
            "infobox": {},
            "images": [],
            "secondary_pages": [],
            "license": "CC BY-SA 4.0",
            "attribution": None,
        }

    content_sections = build_content_sections(mission, wiki)
    parts = extract_parts(wiki.get("wikitext") or "")
    if not parts:
        parts = parts_from_infobox(wiki.get("infobox") or {})
    timeline = build_timeline(mission, wiki)
    stakeholder_rows = build_stakeholders(mission, wiki)
    source_rows = build_sources(mission, wiki)
    image_rows = build_images(mission, wiki)

    # --- Sources (needed before content blocks can reference them) ---------
    spacecraft.sources.clear()
    session.flush()
    source_objects: dict[str, SpacecraftSource] = {}
    for source in source_rows:
        obj = _ensure_source(session, spacecraft, source["label"], source["url"], source["source_type"])
        source_objects[source["url"]] = obj
    stats["sources"] = len(source_objects)
    wikipedia_source = source_objects.get((wiki.get("page") or {}).get("page_url"))

    # --- Narrative sections 1-4 -------------------------------------------
    spacecraft.content_blocks.clear()
    session.flush()
    page = wiki.get("page") or {}
    for key, payload in content_sections.items():
        session.add(
            SpacecraftContent(
                spacecraft_id=spacecraft.id,
                section_key=key,
                body_text=payload["body_text"],
                source_id=wikipedia_source.id if wikipedia_source else None,
                license=wiki.get("license") or "CC BY-SA 4.0",
                attribution=wiki.get("attribution"),
                revision_id=page.get("revision_id"),
                page_url=page.get("page_url"),
                fetched_at=_now(),
                completeness=payload["completeness"],
            )
        )
        stats["content"] += 1

    # Mirror the narrative into the legacy columns the existing UI reads.
    what = content_sections.get("what_is_it", {}).get("body_text") or ""
    how = content_sections.get("how_it_works", {}).get("body_text") or ""
    why = content_sections.get("why_important", {}).get("body_text") or ""
    status_text = content_sections.get("status", {}).get("body_text") or mission.get("status_text") or ""
    if what:
        spacecraft.educational_description = what
        spacecraft.short_description = _first_sentence(what)
        mission_row.description = _first_sentence(what)
        spacecraft.summary = _first_sentence(what)
    if how:
        spacecraft.how_it_works = how
    elif parts:
        spacecraft.how_it_works = "; ".join(
            f"{p['part_name']}: {p['purpose']}" if p.get("purpose") else p["part_name"] for p in parts
        )
    if why:
        spacecraft.why_it_is_important = why
        spacecraft.scientific_purpose = _first_sentence(why)
    if status_text:
        spacecraft.current_or_last_known_status = status_text

    # --- Parts -------------------------------------------------------------
    spacecraft.parts.clear()
    session.flush()
    for part in parts:
        session.add(SpacecraftPart(spacecraft_id=spacecraft.id, **part))
    stats["parts"] = len(parts)

    # --- Timeline ----------------------------------------------------------
    spacecraft.timeline.clear()
    session.flush()
    for event in timeline:
        session.add(TimelineEvent(spacecraft_id=spacecraft.id, **event))
    stats["timeline"] = len(timeline)

    # --- Stakeholders ------------------------------------------------------
    spacecraft.stakeholder_links.clear()
    session.flush()
    for stakeholder in stakeholder_rows:
        org = _upsert_organization(session, stakeholder["name"], stakeholder["role"])
        spacecraft.stakeholder_links.append(
            SpacecraftStakeholder(organization_id=org.id, role=stakeholder["role"])
        )
    stats["stakeholders"] = len(stakeholder_rows)

    # --- Images ------------------------------------------------------------
    spacecraft.images.clear()
    session.flush()
    for image in image_rows:
        session.add(SpacecraftImage(spacecraft_id=spacecraft.id, **image))
    stats["images"] = len(image_rows)

    # --- 3D models ---------------------------------------------------------
    spacecraft.models.clear()
    session.flush()
    try:
        models = nasa3d.find_models(
            mission.get("model_keywords") or [],
            include=mission.get("model_include") or [],
            exclude=mission.get("model_exclude") or [],
            overrides=mission.get("model_overrides") or [],
        )
    except Exception as exc:
        stats["errors"].append(f"nasa_3d: {exc}")
        models = []
    if models:
        for model in models:
            session.add(SpacecraftModel(spacecraft_id=spacecraft.id, **model))
    else:
        session.add(
            SpacecraftModel(
                spacecraft_id=spacecraft.id,
                file_path=None,
                download_url=None,
                format=None,
                size_bytes=None,
                web_ready=False,
                provider="NASA 3D Resources (GitHub)",
                license="NASA 3D resources are free to use without copyright",
                viewer_url=VIEWER_FALLBACK,
                status="no_model",
            )
        )
    stats["models"] = max(len(models), 1)

    # --- Top 10 people -----------------------------------------------------
    spacecraft.people_links.clear()
    session.flush()
    people = (mission.get("people") or [])[:10]
    for rank, person_entry in enumerate(people, start=1):
        full_name = person_entry["name"].strip()
        person = session.query(Person).filter(Person.full_name == full_name).first()
        if person is None:
            person = Person(full_name=full_name, affiliation=_affiliation(person_entry.get("role")))
            session.add(person)
            session.flush()
        elif not person.affiliation:
            person.affiliation = _affiliation(person_entry.get("role"))
        if people_lookup and not person.wiki_url:
            found = wikipedia.lookup_person(full_name)
            if found:
                person.wiki_url = found["url"]
        spacecraft.people_links.append(
            SpacecraftPerson(
                person_id=person.id,
                role_on_mission=person_entry.get("role"),
                rank_order=rank,
            )
        )
    stats["people"] = len(people)

    # --- Keywords / aliases ------------------------------------------------
    spacecraft.keywords.clear()
    spacecraft.aliases.clear()
    session.flush()
    keywords = set(mission.get("model_keywords") or [])
    keywords.add(mission.get("destination_category") or "")
    keywords.add(mission.get("agency") or "")
    for keyword in sorted(k for k in keywords if k):
        session.add(SpacecraftKeyword(spacecraft_id=spacecraft.id, keyword=keyword[:100]))

    session.add(
        SpacecraftAlias(
            spacecraft_id=spacecraft.id,
            alias=mission.get("display_name") or mission["name"],
            alias_type="Display name",
        )
    )

    return stats


def _affiliation(role: str | None) -> str | None:
    if not role:
        return None
    head = role.split(",")[0].strip()
    return head[:255] if head else None


def ingest_registry(
    session: Session,
    registry: dict[str, Any] | None = None,
    wikipedia: WikipediaProvider | None = None,
    nasa3d: Nasa3DProvider | None = None,
    people_lookup: bool = True,
    progress: Callable[[int, int, str], None] | None = None,
) -> dict[str, Any]:
    registry = registry or load_registry()
    wikipedia = wikipedia or WikipediaProvider()
    nasa3d = nasa3d or Nasa3DProvider()
    missions = registry["missions"]

    run = IngestionRun(provider="registry", status="running")
    session.add(run)
    session.flush()

    total = {
        "missions_processed": 0,
        "missions_failed": 0,
        "content": 0,
        "parts": 0,
        "images": 0,
        "sources": 0,
        "timeline": 0,
        "stakeholders": 0,
        "models": 0,
        "people": 0,
        "errors": [],
    }

    try:
        _register_data_sources(session, registry)
        session.flush()
        for index, mission in enumerate(missions, start=1):
            if progress:
                progress(index, len(missions), mission["slug"])
            try:
                stats = ingest_mission(session, mission, wikipedia, nasa3d, people_lookup)
                total["missions_processed"] += 1
                for key in ("content", "parts", "images", "sources", "timeline", "stakeholders", "models", "people"):
                    total[key] += stats[key]
                total["errors"].extend(f"{mission['slug']}: {err}" for err in stats["errors"])
                session.commit()
            except Exception as exc:
                session.rollback()
                total["missions_failed"] += 1
                total["errors"].append(f"{mission['slug']}: {exc}")
                logger.exception("Ingestion failed for %s", mission["slug"])

        run.finished_at = _now()
        run.status = "ok" if not total["errors"] else "partial"
        run.rows_inserted = total["missions_processed"]
        run.errors = "\n".join(total["errors"]) or None
        run.details = json.dumps(total)
        session.commit()
    except Exception as exc:
        session.rollback()
        run = session.query(IngestionRun).filter(IngestionRun.id == run.id).first()
        if run:
            run.status = "failed"
            run.finished_at = _now()
            run.errors = str(exc)
            session.commit()
        raise

    return total


def rebuild_one(
    session: Session,
    slug: str,
    wikipedia: WikipediaProvider | None = None,
    nasa3d: Nasa3DProvider | None = None,
    people_lookup: bool = False,
) -> dict[str, Any]:
    registry = load_registry()
    match = next((m for m in registry["missions"] if m["slug"] == slug), None)
    if match is None:
        raise KeyError(f"Slug '{slug}' is not in the registry")
    _register_data_sources(session, registry)
    stats = ingest_mission(
        session, match, wikipedia or WikipediaProvider(), nasa3d or Nasa3DProvider(), people_lookup
    )
    session.commit()
    return stats
