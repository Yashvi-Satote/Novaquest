#!/usr/bin/env python3
"""Fill NovaBase gaps from a curated, provenance-checked facts file.

Design goals
------------
* Never invent facts: every written value must carry a source URL, a retrieval
  date, and a confidence level.
* Never copy source prose verbatim: the facts file is hand-written summaries.
* Be idempotent: repeated runs update the same rows instead of duplicating them.
* Be reviewable: dry-run by default, one transaction per apply, and every write
  is recorded in ``fill_provenance`` with its source and confidence.

Facts file shape (JSON)::

    {
      "retrieved_at": "2026-11-06",
      "entries": {
        "chandra": {
          "confidence": "high",
          "sections": {
            "how_it_works": {
              "text": "...",
              "source_url": "https://...",
              "confidence": "high",
              "attribution": "NASA/MSFC",
              "license": "Public domain (NASA)"
            }
          },
          "timeline": [
            {"event_date": "1999-07-23", "event_date_precision": "day",
             "title": "...", "description": "...", "event_type": "launch",
             "source_url": "https://..."}
          ],
          "imagery": [
            {"title": "...", "image_url": "https://...",
             "thumbnail_url": "https://...", "source_url": "https://...",
             "attribution": "NASA", "kind": "photo", "item_type": "Photo",
             "license": "Public domain (NASA)", "description": "..."}
          ],
          "stakeholders": [
            {"name": "NASA Marshall Space Flight Center",
             "organization_type": "Government Agency", "country": "United States",
             "official_url": "https://...", "role": "Operator",
             "source_url": "https://..."}
          ],
          "people": [
            {"full_name": "...", "role_on_mission": "...", "affiliation": "...",
             "wiki_url": "https://...", "source_url": "https://...",
             "rank_order": 1}
          ]
        }
      }
    }

Usage::

    python backend/scripts/fill_novabase.py --facts facts.json          # dry run
    python backend/scripts/fill_novabase.py --facts facts.json --apply
    python backend/scripts/fill_novabase.py --build-queue queue.json
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]
DEFAULT_DB = REPO_ROOT / "backend" / "space_hardware.db"
DEFAULT_FACTS = REPO_ROOT / "backend" / "NovaBase" / "data" / "fill_facts.json"
DEFAULT_QUEUE = SCRIPT_DIR / "fill_queue.json"
DEFAULT_AUDIT = SCRIPT_DIR / "audit_report.json"

sys.path.insert(0, str(SCRIPT_DIR))
from audit_novabase import placeholder_name  # noqa: E402  (local sibling module)

SECTION_KEYS = (
    "what_is_it",
    "how_it_works",
    "why_important",
    "status",
    "imagery",
    "sources",
    "timeline",
    "stakeholders",
    "model",
    "people",
)

# Sections that also have legacy denormalised columns on ``spacecraft``.
LEGACY_COLUMNS = {
    "how_it_works": "how_it_works",
    "why_important": "why_it_is_important",
    "status": "current_or_last_known_status",
}

CONFIDENCE_LEVELS = {"high", "medium", "low"}

TRUSTED_SUFFIXES = (
    ".nasa.gov",
    "nasa.gov",
    ".esa.int",
    "esa.int",
    ".jaxa.jp",
    "jaxa.jp",
    ".isro.gov.in",
    "isro.gov.in",
    ".noaa.gov",
    "noaa.gov",
    ".gov.uk",
    ".esa.int",
    "wikipedia.org",
)

# Official mission / institution sites that are not on the generic suffixes.
EXTRA_TRUSTED_HOSTS = {
    "chandra.harvard.edu",
    "cxc.harvard.edu",
    "solarsystem.nasa.gov",
    "science.nasa.gov",
    "nssdc.gsfc.nasa.gov",
    "ssd.jpl.nasa.gov",
    "jpl.nasa.gov",
    "moon.nasa.gov",
    "mars.nasa.gov",
    "esa.int",
    "explorersweb.com",
    "planetary.org",
    "aiaa.org",
    "kari.re.kr",
    "www.kari.re.kr",
    "umich.edu",
    "commons.wikimedia.org",
    "cloudsat.atmos.colostate.edu",
    "nationalacademies.org",
    "nrl.navy.mil",
    "wikimedia.org",
}

PROVENANCE_DDL = """
CREATE TABLE IF NOT EXISTS fill_provenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL,
    spacecraft_slug TEXT NOT NULL,
    section_key TEXT NOT NULL,
    record_table TEXT NOT NULL,
    record_id INTEGER,
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    confidence TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
)
"""

PROVENANCE_INDEX = """
CREATE INDEX IF NOT EXISTS ix_fill_provenance_run
    ON fill_provenance (run_id, spacecraft_slug)
"""


class ValidationError(Exception):
    pass


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def _host(url: str) -> str:
    try:
        return (urlparse(url).hostname or "").lower()
    except ValueError:
        return ""


def is_trusted_source(url: str) -> bool:
    host = _host(url)
    if not host:
        return False
    if host in EXTRA_TRUSTED_HOSTS:
        return True
    return any(host == suffix or host.endswith("." + suffix) for suffix in TRUSTED_SUFFIXES)


def require_source(url: Any, label: str, allow_any: bool) -> str:
    if not isinstance(url, str) or not url.strip():
        raise ValidationError(f"{label}: missing source_url")
    url = url.strip()
    if urlparse(url).scheme not in ("http", "https"):
        raise ValidationError(f"{label}: source_url must be http(s): {url}")
    if not allow_any and not is_trusted_source(url):
        raise ValidationError(f"{label}: untrusted source host '{_host(url)}' ({url})")
    return url


def require_date(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{label}: missing retrieved_at date")
    try:
        date.fromisoformat(value.strip()[:10])
    except ValueError as exc:
        raise ValidationError(f"{label}: retrieved_at must be ISO YYYY-MM-DD: {value!r}") from exc
    return value.strip()[:10]


def require_confidence(value: Any, label: str) -> str:
    if value not in CONFIDENCE_LEVELS:
        raise ValidationError(f"{label}: confidence must be one of {sorted(CONFIDENCE_LEVELS)}")
    return value


def require_text(value: Any, label: str, minimum: int = 80) -> str:
    if not isinstance(value, str) or len(value.strip()) < minimum:
        raise ValidationError(f"{label}: text is missing or shorter than {minimum} characters")
    text = value.strip()
    template = placeholder_name(text)
    if template:
        raise ValidationError(f"{label}: text matches ingestion template '{template}'")
    return text


def validate_facts(payload: dict[str, Any], allow_any: bool) -> dict[str, Any]:
    if not isinstance(payload, dict) or not isinstance(payload.get("entries"), dict):
        raise ValidationError("facts file must contain an 'entries' object")

    top_retrieved = payload.get("retrieved_at")
    cleaned: dict[str, Any] = {"retrieved_at": None, "entries": {}}
    if top_retrieved is not None:
        cleaned["retrieved_at"] = require_date(top_retrieved, "top-level")

    for slug, entry in payload["entries"].items():
        label = f"entry '{slug}'"
        if not isinstance(entry, dict):
            raise ValidationError(f"{label}: must be an object")
        retrieved = require_date(
            entry.get("retrieved_at", cleaned["retrieved_at"]), f"{label} retrieved_at"
        )
        entry_confidence = require_confidence(entry.get("confidence", "high"), label)

        out: dict[str, Any] = {
            "retrieved_at": retrieved,
            "confidence": entry_confidence,
            "sections": {},
            "timeline": [],
            "imagery": [],
            "stakeholders": [],
            "people": [],
        }

        for section_key, section in (entry.get("sections") or {}).items():
            if section_key not in SECTION_KEYS:
                raise ValidationError(f"{label}: unknown section '{section_key}'")
            if section_key in ("imagery", "timeline", "stakeholders", "people", "sources"):
                raise ValidationError(
                    f"{label}: section '{section_key}' must use its structured list, not 'sections'"
                )
            if not isinstance(section, dict):
                raise ValidationError(f"{label}/{section_key}: must be an object")
            source_url = require_source(
                section.get("source_url"), f"{label}/{section_key}", allow_any
            )
            out["sections"][section_key] = {
                "text": require_text(section.get("text"), f"{label}/{section_key}"),
                "source_url": source_url,
                "confidence": require_confidence(
                    section.get("confidence", entry_confidence), f"{label}/{section_key}"
                ),
                "attribution": (section.get("attribution") or "").strip() or None,
                "license": (section.get("license") or "").strip() or None,
            }

        for index, event in enumerate(entry.get("timeline") or []):
            elabel = f"{label}/timeline[{index}]"
            if not isinstance(event, dict):
                raise ValidationError(f"{elabel}: must be an object")
            out["timeline"].append(
                {
                    "event_date": (event.get("event_date") or "").strip() or None,
                    "event_date_precision": (event.get("event_date_precision") or "day").strip(),
                    "title": require_text(event.get("title"), f"{elabel}.title", minimum=3),
                    "description": (event.get("description") or "").strip() or None,
                    "event_type": (event.get("event_type") or "event").strip(),
                    "source_url": require_source(event.get("source_url"), elabel, allow_any),
                    "confidence": require_confidence(
                        event.get("confidence", entry_confidence), elabel
                    ),
                }
            )

        for index, image in enumerate(entry.get("imagery") or []):
            ilabel = f"{label}/imagery[{index}]"
            if not isinstance(image, dict):
                raise ValidationError(f"{ilabel}: must be an object")
            out["imagery"].append(
                {
                    "title": require_text(image.get("title"), f"{ilabel}.title", minimum=3),
                    "image_url": require_source(image.get("image_url"), f"{ilabel}.image_url", True),
                    "thumbnail_url": (image.get("thumbnail_url") or "").strip() or None,
                    "source_url": require_source(
                        image.get("source_url"), ilabel, allow_any
                    ),
                    "attribution": (image.get("attribution") or "").strip() or "NASA",
                    "description": (image.get("description") or "").strip() or None,
                    "kind": (image.get("kind") or "photo").strip(),
                    "item_type": (image.get("item_type") or "Photo").strip(),
                    "license": (image.get("license") or "").strip() or None,
                    "confidence": require_confidence(
                        image.get("confidence", entry_confidence), ilabel
                    ),
                }
            )

        for index, stakeholder in enumerate(entry.get("stakeholders") or []):
            slabel = f"{label}/stakeholders[{index}]"
            if not isinstance(stakeholder, dict):
                raise ValidationError(f"{slabel}: must be an object")
            out["stakeholders"].append(
                {
                    "name": require_text(stakeholder.get("name"), f"{slabel}.name", minimum=2),
                    "organization_type": (stakeholder.get("organization_type") or "Organization").strip(),
                    "country": (stakeholder.get("country") or "").strip() or None,
                    "official_url": (stakeholder.get("official_url") or "").strip() or None,
                    "role": require_text(stakeholder.get("role"), f"{slabel}.role", minimum=2),
                    "source_url": require_source(stakeholder.get("source_url"), slabel, allow_any),
                    "confidence": require_confidence(
                        stakeholder.get("confidence", entry_confidence), slabel
                    ),
                }
            )

        for index, person in enumerate(entry.get("people") or []):
            plabel = f"{label}/people[{index}]"
            if not isinstance(person, dict):
                raise ValidationError(f"{plabel}: must be an object")
            out["people"].append(
                {
                    "full_name": require_text(person.get("full_name"), f"{plabel}.full_name", minimum=2),
                    "role_on_mission": (person.get("role_on_mission") or "").strip() or None,
                    "affiliation": (person.get("affiliation") or "").strip() or None,
                    "wiki_url": (person.get("wiki_url") or "").strip() or None,
                    "source_url": require_source(person.get("source_url"), plabel, allow_any),
                    "confidence": require_confidence(
                        person.get("confidence", entry_confidence), plabel
                    ),
                    "rank_order": int(person.get("rank_order") or (index + 1)),
                }
            )

        if not any(
            [
                out["sections"],
                out["timeline"],
                out["imagery"],
                out["stakeholders"],
                out["people"],
            ]
        ):
            raise ValidationError(f"{label}: no facts supplied")
        cleaned["entries"][slug] = out

    if not cleaned["entries"]:
        raise ValidationError("facts file contains no entries")
    return cleaned


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def get_spacecraft(conn: sqlite3.Connection, slug: str) -> sqlite3.Row | None:
    conn.row_factory = sqlite3.Row
    return conn.execute("select * from spacecraft where slug = ?", (slug,)).fetchone()


def get_or_create_source(
    conn: sqlite3.Connection,
    spacecraft_id: int,
    source_url: str,
    source_name: str | None,
    retrieved_at: str,
) -> int:
    row = conn.execute(
        "select id from spacecraft_sources where spacecraft_id = ? and source_url = ?",
        (spacecraft_id, source_url),
    ).fetchone()
    if row:
        conn.execute(
            "update spacecraft_sources set verified = 1, last_checked_at = ?, "
            "url = coalesce(url, source_url), label = coalesce(label, source_name) "
            "where id = ?",
            (retrieved_at, row["id"]),
        )
        return int(row["id"])

    name = source_name or _source_name_from_url(source_url)
    source_type = "official" if is_trusted_source(source_url) else "reference"
    cursor = conn.execute(
        "insert into spacecraft_sources "
        "(spacecraft_id, source_name, source_url, source_type, last_checked_at, "
        " label, url, verified, last_checked) "
        "values (?, ?, ?, ?, ?, ?, ?, 1, ?)",
        (spacecraft_id, name, source_url, source_type, retrieved_at, name, source_url, now_iso()),
    )
    return int(cursor.lastrowid)


def _source_name_from_url(url: str) -> str:
    host = _host(url) or "source"
    path = urlparse(url).path.rstrip("/")
    tail = path.rsplit("/", 1)[-1] if path else ""
    return f"{host}{' / ' + tail if tail else ''}"[:255]


def record_provenance(
    conn: sqlite3.Connection,
    run_id: str,
    slug: str,
    section_key: str,
    table: str,
    record_id: int | None,
    source_url: str,
    retrieved_at: str,
    confidence: str,
    notes: str | None = None,
) -> None:
    conn.execute(
        "insert into fill_provenance "
        "(run_id, spacecraft_slug, section_key, record_table, record_id, source_url, "
        " retrieved_at, confidence, notes, created_at) "
        "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (run_id, slug, section_key, table, record_id, source_url, retrieved_at, confidence, notes, now_iso()),
    )


def apply_entry(
    conn: sqlite3.Connection,
    run_id: str,
    slug: str,
    sc: sqlite3.Row,
    entry: dict[str, Any],
) -> dict[str, int]:
    counts = {"content": 0, "timeline": 0, "imagery": 0, "stakeholders": 0, "people": 0}
    sc_id = int(sc["id"])

    for section_key, section in entry["sections"].items():
        source_id = get_or_create_source(
            conn, sc_id, section["source_url"], section.get("attribution"), entry["retrieved_at"]
        )
        existing = conn.execute(
            "select id from spacecraft_content where spacecraft_id = ? and section_key = ?",
            (sc_id, section_key),
        ).fetchone()
        if existing:
            conn.execute(
                "update spacecraft_content set body_text = ?, source_id = ?, "
                "attribution = coalesce(?, attribution), license = coalesce(?, license), "
                "page_url = ?, fetched_at = ?, completeness = 'ok', updated_at = ? "
                "where id = ?",
                (
                    section["text"], source_id, section.get("attribution"),
                    section.get("license"), section["source_url"], now_iso(), now_iso(),
                    existing["id"],
                ),
            )
            record_id = int(existing["id"])
        else:
            cursor = conn.execute(
                "insert into spacecraft_content "
                "(spacecraft_id, section_key, body_text, source_id, license, attribution, "
                " page_url, fetched_at, completeness, created_at, updated_at) "
                "values (?, ?, ?, ?, ?, ?, ?, ?, 'ok', ?, ?)",
                (
                    sc_id, section_key, section["text"], source_id, section.get("license"),
                    section.get("attribution"), section["source_url"], now_iso(), now_iso(), now_iso(),
                ),
            )
            record_id = int(cursor.lastrowid)
        legacy = LEGACY_COLUMNS.get(section_key)
        if legacy:
            conn.execute(f"update spacecraft set {legacy} = ? where id = ?", (section["text"], sc_id))
        record_provenance(
            conn, run_id, slug, section_key, "spacecraft_content", record_id,
            section["source_url"], entry["retrieved_at"], section["confidence"],
        )
        counts["content"] += 1

    for event in entry["timeline"]:
        source_id = get_or_create_source(
            conn, sc_id, event["source_url"], None, entry["retrieved_at"]
        )
        existing = conn.execute(
            "select id from timeline_events where spacecraft_id = ? "
            "and coalesce(event_date, '') = coalesce(?, '') and title = ?",
            (sc_id, event["event_date"], event["title"]),
        ).fetchone()
        if existing:
            conn.execute(
                "update timeline_events set description = coalesce(?, description), "
                "event_type = ?, event_date_precision = ?, source_id = ? where id = ?",
                (
                    event["description"], event["event_type"], event["event_date_precision"],
                    source_id, existing["id"],
                ),
            )
            record_id = int(existing["id"])
        else:
            cursor = conn.execute(
                "insert into timeline_events "
                "(spacecraft_id, event_date, event_date_precision, title, description, "
                " event_type, source_id, sort_order) values (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    sc_id, event["event_date"], event["event_date_precision"], event["title"],
                    event["description"], event["event_type"], source_id,
                    _next_sort_order(conn, "timeline_events", sc_id),
                ),
            )
            record_id = int(cursor.lastrowid)
        record_provenance(
            conn, run_id, slug, "timeline", "timeline_events", record_id,
            event["source_url"], entry["retrieved_at"], event["confidence"],
        )
        counts["timeline"] += 1

    for image in entry["imagery"]:
        source_id = get_or_create_source(
            conn, sc_id, image["source_url"], image.get("attribution"), entry["retrieved_at"]
        )
        existing = conn.execute(
            "select id from spacecraft_images where spacecraft_id = ? and image_url = ?",
            (sc_id, image["image_url"]),
        ).fetchone()
        if existing:
            conn.execute(
                "update spacecraft_images set title = ?, description = coalesce(?, description), "
                "thumbnail_url = coalesce(?, thumbnail_url), attribution = ?, kind = ?, "
                "item_type = ?, license = coalesce(?, license), source_id = ? where id = ?",
                (
                    image["title"], image["description"], image["thumbnail_url"],
                    image["attribution"], image["kind"], image["item_type"],
                    image["license"], source_id, existing["id"],
                ),
            )
            record_id = int(existing["id"])
        else:
            cursor = conn.execute(
                "insert into spacecraft_images "
                "(spacecraft_id, item_type, title, description, image_url, source_url, "
                " attribution, thumbnail_url, kind, license, source_id, sort_order) "
                "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    sc_id, image["item_type"], image["title"], image["description"],
                    image["image_url"], image["source_url"], image["attribution"],
                    image["thumbnail_url"], image["kind"], image["license"], source_id,
                    _next_sort_order(conn, "spacecraft_images", sc_id),
                ),
            )
            record_id = int(cursor.lastrowid)
        record_provenance(
            conn, run_id, slug, "imagery", "spacecraft_images", record_id,
            image["source_url"], entry["retrieved_at"], image["confidence"],
        )
        counts["imagery"] += 1

    for stakeholder in entry["stakeholders"]:
        org_id = get_or_create_org(conn, stakeholder)
        existing = conn.execute(
            "select id from spacecraft_stakeholders "
            "where spacecraft_id = ? and organization_id = ? and role = ?",
            (sc_id, org_id, stakeholder["role"]),
        ).fetchone()
        if existing:
            record_id = int(existing["id"])
        else:
            cursor = conn.execute(
                "insert into spacecraft_stakeholders (spacecraft_id, organization_id, role) "
                "values (?, ?, ?)",
                (sc_id, org_id, stakeholder["role"]),
            )
            record_id = int(cursor.lastrowid)
        record_provenance(
            conn, run_id, slug, "stakeholders", "spacecraft_stakeholders", record_id,
            stakeholder["source_url"], entry["retrieved_at"], stakeholder["confidence"],
        )
        counts["stakeholders"] += 1

    for person in entry["people"]:
        person_id = get_or_create_person(conn, person)
        source_id = get_or_create_source(
            conn, sc_id, person["source_url"], None, entry["retrieved_at"]
        )
        existing = conn.execute(
            "select id from spacecraft_people where spacecraft_id = ? and person_id = ?",
            (sc_id, person_id),
        ).fetchone()
        if existing:
            conn.execute(
                "update spacecraft_people set role_on_mission = ?, rank_order = ?, source_id = ? "
                "where id = ?",
                (person["role_on_mission"], person["rank_order"], source_id, existing["id"]),
            )
            record_id = int(existing["id"])
        else:
            cursor = conn.execute(
                "insert into spacecraft_people "
                "(spacecraft_id, person_id, role_on_mission, rank_order, source_id) "
                "values (?, ?, ?, ?, ?)",
                (sc_id, person_id, person["role_on_mission"], person["rank_order"], source_id),
            )
            record_id = int(cursor.lastrowid)
        record_provenance(
            conn, run_id, slug, "people", "spacecraft_people", record_id,
            person["source_url"], entry["retrieved_at"], person["confidence"],
        )
        counts["people"] += 1

    return counts


def _next_sort_order(conn: sqlite3.Connection, table: str, spacecraft_id: int) -> int:
    row = conn.execute(
        f"select coalesce(max(sort_order), 0) + 1 from {table} where spacecraft_id = ?",
        (spacecraft_id,),
    ).fetchone()
    return int(row[0])


def get_or_create_org(conn: sqlite3.Connection, stakeholder: dict[str, Any]) -> int:
    row = conn.execute(
        "select id from organizations where lower(name) = lower(?)", (stakeholder["name"],)
    ).fetchone()
    if row:
        return int(row["id"])
    slug = re.sub(r"[^a-z0-9]+", "-", stakeholder["name"].lower()).strip("-")[:80]
    cursor = conn.execute(
        "insert into organizations (name, slug, organization_type, country, official_url) "
        "values (?, ?, ?, ?, ?)",
        (
            stakeholder["name"], slug, stakeholder["organization_type"],
            stakeholder["country"], stakeholder["official_url"],
        ),
    )
    return int(cursor.lastrowid)


def get_or_create_person(conn: sqlite3.Connection, person: dict[str, Any]) -> int:
    row = conn.execute(
        "select id from people where lower(full_name) = lower(?)", (person["full_name"],)
    ).fetchone()
    if row:
        return int(row["id"])
    cursor = conn.execute(
        "insert into people (full_name, affiliation, wiki_url) values (?, ?, ?)",
        (person["full_name"], person["affiliation"], person["wiki_url"]),
    )
    return int(cursor.lastrowid)


# ---------------------------------------------------------------------------
# Queue builder
# ---------------------------------------------------------------------------


def build_queue(audit_path: Path, output_path: Path) -> dict[str, Any]:
    audit = json.loads(audit_path.read_text(encoding="utf-8"))
    rows = audit.get("entries", [])
    grouped: dict[str, dict[str, Any]] = {}
    for row in rows:
        slug = row.get("slug")
        if not slug:
            continue
        entry = grouped.setdefault(slug, {"slug": slug, "name": row.get("name"), "sections": {}})
        entry["sections"][row["section"]] = {
            "status": row["status"],
            "reason": row.get("reason"),
        }

    queue = []
    for slug, entry in grouped.items():
        gaps = [k for k, v in entry["sections"].items() if v["status"] != "COMPLETE"]
        entry["gap_count"] = len(gaps)
        entry["gaps"] = [f"{k}: {entry['sections'][k]['status']}" for k in gaps]
        entry["priority"] = 1 if len(gaps) >= 7 else 2
        queue.append(entry)

    queue.sort(key=lambda item: (item["priority"], -item["gap_count"], item["slug"]))
    payload = {
        "generated_at": now_iso(),
        "source_audit": str(audit_path),
        "total_entries": len(queue),
        "priority_1_entries": sum(1 for item in queue if item["priority"] == 1),
        "entries": queue,
    }
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return payload


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Fill NovaBase gaps from curated facts")
    parser.add_argument("--facts", type=Path, default=DEFAULT_FACTS)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--apply", action="store_true", help="Write changes (default: dry run)")
    parser.add_argument("--only", default=None, help="Comma-separated slugs to apply")
    parser.add_argument("--allow-any-source", action="store_true", help="Skip the trusted-host check")
    parser.add_argument("--build-queue", type=Path, nargs="?", const=DEFAULT_QUEUE, default=None)
    parser.add_argument("--audit", type=Path, default=DEFAULT_AUDIT)
    args = parser.parse_args(argv)

    if args.build_queue:
        payload = build_queue(args.audit, args.build_queue)
        print(f"Wrote queue: {args.build_queue}")
        print(f"  entries: {payload['total_entries']} (priority 1: {payload['priority_1_entries']})")
        return 0

    if not args.facts.exists():
        print(f"Facts file not found: {args.facts}", file=sys.stderr)
        return 2

    raw = json.loads(args.facts.read_text(encoding="utf-8"))
    try:
        facts = validate_facts(raw, args.allow_any_source)
    except ValidationError as exc:
        print(f"VALIDATION FAILED: {exc}", file=sys.stderr)
        return 1

    only = {s.strip() for s in args.only.split(",") if s.strip()} if args.only else None
    selected = [s for s in facts["entries"] if not only or s in only]
    missing = (only or set()) - set(facts["entries"])
    if missing:
        print(f"Slugs not present in facts file: {', '.join(sorted(missing))}", file=sys.stderr)
        return 1

    conn = sqlite3.connect(args.db)
    conn.row_factory = sqlite3.Row
    conn.execute("pragma foreign_keys = on")
    conn.executescript(PROVENANCE_DDL)
    conn.executescript(PROVENANCE_INDEX)

    run_id = f"{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}-{_facts_hash(raw)}"
    totals = {"content": 0, "timeline": 0, "imagery": 0, "stakeholders": 0, "people": 0}
    unknown: list[str] = []

    try:
        for slug in selected:
            sc = get_spacecraft(conn, slug)
            if not sc:
                unknown.append(slug)
                continue
            counts = apply_entry(conn, run_id, slug, sc, facts["entries"][slug])
            for key, value in counts.items():
                totals[key] += value
            print(f"  {slug}: " + ", ".join(f"{k}={v}" for k, v in counts.items() if v))
    except Exception:
        conn.rollback()
        print("Write failed; transaction rolled back.", file=sys.stderr)
        raise

    if unknown:
        print(f"Unknown slugs (skipped): {', '.join(unknown)}", file=sys.stderr)

    if args.apply:
        conn.commit()
        print(f"APPLIED run {run_id}")
        print("  " + ", ".join(f"{k}={v}" for k, v in totals.items()))
    else:
        conn.rollback()
        print("DRY RUN — no changes written. Re-run with --apply to commit.")
        print("  " + ", ".join(f"{k}={v}" for k, v in totals.items()))
    conn.close()
    return 0


def _facts_hash(raw: dict[str, Any]) -> str:
    blob = json.dumps(raw, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()[:8]


if __name__ == "__main__":
    raise SystemExit(main())
