"""The 10 NovaBase sections: completeness rules, detail payload, health data."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import desc

from .models import IngestionRun, Spacecraft

SECTION_DEFINITIONS: list[dict[str, str]] = [
    {"key": "what_is_it", "number": 1, "label": "What is it?"},
    {"key": "how_it_works", "number": 2, "label": "How does it work?"},
    {"key": "why_important", "number": 3, "label": "Why is it important?"},
    {"key": "status", "number": 4, "label": "Current or last known status"},
    {"key": "imagery", "number": 5, "label": "Imagery and scientific visualizations"},
    {"key": "sources", "number": 6, "label": "Official archives and verified sources"},
    {"key": "timeline", "number": 7, "label": "Mission timeline"},
    {"key": "stakeholders", "number": 8, "label": "Institutional stakeholders"},
    {"key": "model", "number": 9, "label": "Spacecraft 3D model"},
    {"key": "people", "number": 10, "label": "Top 10 people who helped develop the mission"},
]

SECTION_KEYS = [item["key"] for item in SECTION_DEFINITIONS]


def _content_map(spacecraft: Spacecraft) -> dict[str, Any]:
    return {block.section_key: block for block in (spacecraft.content_blocks or [])}


def spacecraft_completeness(spacecraft: Spacecraft) -> dict[str, dict[str, Any]]:
    """Return a per-section status for one spacecraft."""
    content = _content_map(spacecraft)
    parts = list(spacecraft.parts or [])
    images = list(spacecraft.images or [])
    sources = [s for s in (spacecraft.sources or []) if s.source_url]
    timeline = list(spacecraft.timeline or [])
    stakeholders = list(spacecraft.stakeholder_links or [])
    models = [m for m in (spacecraft.models or []) if m.status in ("ok", "no_model")]
    people = list(spacecraft.people_links or [])

    def content_ok(key: str) -> bool:
        block = content.get(key)
        return bool(block and (block.body_text or "").strip())

    counts = {
        "what_is_it": 1 if content_ok("what_is_it") else 0,
        "how_it_works": 1 if (content_ok("how_it_works") or parts) else 0,
        "why_important": 1 if content_ok("why_important") else 0,
        "status": 1 if (content_ok("status") or (spacecraft.status_text or "").strip()) else 0,
        "imagery": len(images),
        "sources": len(sources),
        "timeline": len(timeline),
        "stakeholders": len(stakeholders),
        "model": len(models),
        "people": len(people),
    }

    statuses: dict[str, dict[str, Any]] = {}
    for definition in SECTION_DEFINITIONS:
        key = definition["key"]
        count = counts[key]
        statuses[key] = {
            "key": key,
            "number": definition["number"],
            "label": definition["label"],
            "count": count,
            "populated": count > 0,
            "status": "ok" if count > 0 else "missing",
        }
    return statuses


def spacecraft_summary(spacecraft: Spacecraft) -> dict[str, Any]:
    statuses = spacecraft_completeness(spacecraft)
    populated = sum(1 for value in statuses.values() if value["populated"])
    return {
        "spacecraft_id": spacecraft.id,
        "slug": spacecraft.slug,
        "name": spacecraft.display_name or spacecraft.name,
        "sections": statuses,
        "populated_sections": populated,
        "total_sections": len(statuses),
        "complete": populated == len(statuses),
    }


def detail_payload(spacecraft: Spacecraft) -> dict[str, Any]:
    """Build the 10-section detail payload returned by /api/hardware/<slug>."""
    content = _content_map(spacecraft)
    statuses = spacecraft_completeness(spacecraft)

    content_dict = {
        key: (block.to_dict() if block else {
            "section_key": key,
            "body_text": None,
            "completeness": "missing",
        })
        for key, block in ((key, content.get(key)) for key in
                           ("what_is_it", "how_it_works", "why_important", "status"))
    }

    models = [m.to_dict() for m in (spacecraft.models or [])]
    images = [img.to_dict() for img in (spacecraft.images or [])]
    sources = [s.to_dict() for s in (spacecraft.sources or [])]
    timeline = [event.to_dict() for event in (spacecraft.timeline or [])]
    stakeholders = [link.to_dict() for link in (spacecraft.stakeholder_links or [])]
    people = [link.to_dict() for link in (spacecraft.people_links or [])]
    parts = [part.to_dict() for part in (spacecraft.parts or [])]

    populated = sum(1 for value in statuses.values() if value["populated"])
    return {
        "sections": statuses,
        "section_order": SECTION_DEFINITIONS,
        "completeness": {
            "populated_sections": populated,
            "total_sections": len(statuses),
            "complete": populated == len(statuses),
        },
        "content": content_dict,
        "parts": parts,
        "images": images,
        "sources": sources,
        "timeline": timeline,
        "stakeholders": stakeholders,
        "models": models,
        "people": people,
        "license": {
            "text": "Wikipedia text is licensed CC BY-SA 4.0",
            "images": "Wikimedia Commons images retain the license stored per image",
            "models": "NASA 3D resources are free to use without copyright",
        },
    }


def health_payload(session, expected_slugs: list[str] | None = None) -> dict[str, Any]:
    spacecraft = session.query(Spacecraft).order_by(Spacecraft.slug).all()
    per_spacecraft = [spacecraft_summary(item) for item in spacecraft]
    complete_count = sum(1 for item in per_spacecraft if item["complete"])

    last_run = session.query(IngestionRun).order_by(desc(IngestionRun.id)).first()
    errors: list[str] = []
    if last_run and last_run.errors:
        errors.append(last_run.errors)

    present_slugs = {item["slug"] for item in per_spacecraft}
    missing_seed = [slug for slug in (expected_slugs or []) if slug not in present_slugs]

    return {
        "status": "ok" if spacecraft and not missing_seed else "degraded",
        "total_spacecraft": len(spacecraft),
        "complete_spacecraft": complete_count,
        "all_sections_populated": bool(spacecraft) and complete_count == len(spacecraft),
        "expected_seed_missions": len(expected_slugs or []),
        "missing_seed_missions": missing_seed,
        "per_spacecraft": per_spacecraft,
        "last_ingestion_run": last_run.to_dict() if last_run else None,
        "errors": errors,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "sections": SECTION_DEFINITIONS,
    }
