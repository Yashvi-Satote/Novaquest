#!/usr/bin/env python3
"""Audit the NovaBase 10-section hardware database.

For every spacecraft row (the entity behind ``/hardware/<slug>``) this script
classifies each of the ten NovaBase sections as:

    COMPLETE    substantive content/records are present and a source URL is stored
    MISSING     no content/records are present
    PLACEHOLDER only generic template text is present (no real mission facts)
    UNVERIFIED  substantive content is present but no per-section source URL exists

It also checks every model URL (GLB/GLTF) and every image URL for HTTP status,
content type, content length, Git-LFS pointer files, sub-1 KB files, TIFF images
and non-resolving domains.  Local ``/assets/...`` paths are checked on disk.

Outputs (next to this script by default):

    audit_report.json
    audit_report.csv

Usage::

    python backend/scripts/audit_novabase.py
    python backend/scripts/audit_novabase.py --no-url-check
    python backend/scripts/audit_novabase.py --db backend/space_hardware.db \
        --output-dir backend/scripts --workers 16 --timeout 20

The script uses only the Python standard library.
"""
from __future__ import annotations

import argparse
import csv
import json
import mimetypes
import os
import re
import socket
import sqlite3
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]
DEFAULT_DB = REPO_ROOT / "backend" / "space_hardware.db"
PUBLIC_DIR = REPO_ROOT / "frontend" / "public"

SECTION_DEFINITIONS: list[dict[str, Any]] = [
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

# ---------------------------------------------------------------------------
# Placeholder signatures.  These strings are produced by the ingestion scripts
# (backend/NovaBase/ingest_novabase.py and enrich_hardware.py) when no real
# mission narrative was available.  They are deliberately kept narrow so that
# genuine text is never downgraded.
# ---------------------------------------------------------------------------
PLACEHOLDER_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (
        "generic_eyes_model_sentence",
        re.compile(
            r"^.+?\s+is\s+an?\s+.{0,80}?\s+represented by an authentic NASA Eyes 3D model "
            r"and operated in the .{0,80}? environment\.?$",
            re.IGNORECASE | re.DOTALL,
        ),
    ),
    (
        "generic_operates_sentence",
        re.compile(
            r"^.+?\s+operates as an?\s+.{0,80}?\s+exploring\s+.{0,80}?\.?$",
            re.IGNORECASE | re.DOTALL,
        ),
    ),
    (
        "generic_advances_sentence",
        re.compile(
            r"^.+?\s+advances space exploration and planetary science\.?$",
            re.IGNORECASE | re.DOTALL,
        ),
    ),
    (
        "generic_contributes_sentence",
        re.compile(
            r"^.+?\s+contributes scientific observations and mission data that support "
            r"our understanding of\s+.{0,100}?\.?$",
            re.IGNORECASE | re.DOTALL,
        ),
    ),
    (
        "generic_status_sentence",
        re.compile(
            r"^Operational status:\s*.{0,80}?\.\s*Source:\s*NASA Eyes on the Solar System "
            r"3D model catalogue\.?$",
            re.IGNORECASE | re.DOTALL,
        ),
    ),
    (
        "generic_scientific_purpose",
        re.compile(r"^Scientific exploration with\s+.{0,120}?\.?$", re.IGNORECASE | re.DOTALL),
    ),
    (
        "missing_purpose_note",
        re.compile(r"^Purpose not documented in the current source\.?$", re.IGNORECASE),
    ),
    (
        "generic_satellite_sentence",
        re.compile(
            r"^.+?\s+is an?\s+(?:satellite|spacecraft|space telescope|rover|lander)\s+"
            r"operated by .{0,120}?\.?$",
            re.IGNORECASE | re.DOTALL,
        ),
    ),
]

STATUS_TEMPLATE = re.compile(
    r"^Operational status:\s*.{0,80}?\.\s*Source:\s*NASA Eyes on the Solar System "
    r"3D model catalogue\.\s*",
    re.IGNORECASE | re.DOTALL,
)

MODEL_EXTENSIONS = (".glb", ".gltf")
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff", ".bmp", ".svg")


# ---------------------------------------------------------------------------
# Database loading
# ---------------------------------------------------------------------------
def connect(db_path: Path) -> sqlite3.Connection:
    if not db_path.exists():
        raise SystemExit(f"Database not found: {db_path}")
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def _rows(conn: sqlite3.Connection, sql: str, params: Iterable[Any] = ()) -> list[sqlite3.Row]:
    try:
        return list(conn.execute(sql, tuple(params)))
    except sqlite3.Error as exc:
        print(f"  ! query failed ({exc}): {sql[:90]}", file=sys.stderr)
        return []


def load_snapshot(conn: sqlite3.Connection) -> dict[str, Any]:
    spacecraft = _rows(
        conn,
        """
        SELECT id, slug, name, display_name, full_name, educational_description,
               short_description, how_it_works, why_it_is_important,
               current_or_last_known_status, status_text, official_url, source_url,
               operational_status, destination, last_verified_at
        FROM spacecraft ORDER BY slug
        """,
    )
    by_id = {row["id"]: row for row in spacecraft}

    def group(table: str, order: str = "id") -> dict[int, list[sqlite3.Row]]:
        out: dict[int, list[sqlite3.Row]] = {}
        for row in _rows(conn, f"SELECT * FROM {table} ORDER BY {order}"):
            out.setdefault(row["spacecraft_id"], []).append(row)
        return out

    content: dict[int, dict[str, sqlite3.Row]] = {}
    for row in _rows(conn, "SELECT * FROM spacecraft_content ORDER BY id"):
        content.setdefault(row["spacecraft_id"], {})[row["section_key"]] = row

    stakeholders: dict[int, list[sqlite3.Row]] = {}
    for row in _rows(
        conn,
        """
        SELECT ss.*, o.name AS organization_name, o.official_url AS organization_url,
               o.country AS organization_country
        FROM spacecraft_stakeholders ss
        LEFT JOIN organizations o ON o.id = ss.organization_id
        ORDER BY ss.id
        """,
    ):
        stakeholders.setdefault(row["spacecraft_id"], []).append(row)

    people: dict[int, list[sqlite3.Row]] = {}
    for row in _rows(
        conn,
        """
        SELECT sp.*, p.full_name, p.wiki_url, p.affiliation
        FROM spacecraft_people sp
        LEFT JOIN people p ON p.id = sp.person_id
        ORDER BY sp.spacecraft_id, sp.rank_order
        """,
    ):
        people.setdefault(row["spacecraft_id"], []).append(row)

    return {
        "spacecraft": spacecraft,
        "by_id": by_id,
        "content": content,
        "images": group("spacecraft_images"),
        "sources": group("spacecraft_sources"),
        "timeline": group("timeline_events"),
        "stakeholders": stakeholders,
        "models": group("spacecraft_models"),
        "people": people,
        "parts": group("spacecraft_parts", "sort_order, id"),
    }


# ---------------------------------------------------------------------------
# Classification helpers
# ---------------------------------------------------------------------------
def normalize(text: str | None) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def placeholder_name(text: str | None) -> str | None:
    """Return the template name when *text* is only generic boilerplate."""
    value = normalize(text)
    if not value:
        return None

    for name, pattern in PLACEHOLDER_PATTERNS:
        if pattern.match(value):
            return name

    # A generic status prefix followed by real prose is not a placeholder, but a
    # status prefix followed by nothing/another template is.
    if STATUS_TEMPLATE.match(value):
        remainder = STATUS_TEMPLATE.sub("", value, count=1).strip()
        if len(remainder) < 80:
            return "generic_status_prefix"

    return None


def source_url_for_block(row: sqlite3.Row | None, sources: list[sqlite3.Row]) -> str | None:
    if row is not None:
        page_url = row["page_url"] if "page_url" in row.keys() else None
        if page_url:
            return page_url
        source_id = row["source_id"] if "source_id" in row.keys() else None
        if source_id:
            for source in sources:
                if source["id"] == source_id and source["source_url"]:
                    return source["source_url"]
    return None


def content_status(
    *,
    text: str | None,
    source_url: str | None,
    fallback_note: str = "",
) -> tuple[str, str, str | None]:
    value = normalize(text)
    if not value:
        return "MISSING", fallback_note or "no body text stored", None

    template = placeholder_name(value)
    if template:
        return "PLACEHOLDER", f"generic template ({template}); no mission-specific facts", source_url

    if not source_url:
        return "UNVERIFIED", f"{len(value)} chars of narrative, but no source URL", None

    host = urlparse(source_url).netloc or source_url
    return "COMPLETE", f"{len(value)} chars; source: {host}", source_url


def classify_sections(sc: sqlite3.Row, data: dict[str, Any]) -> list[dict[str, Any]]:
    sid = sc["id"]
    content = data["content"].get(sid, {})
    sources = [s for s in data["sources"].get(sid, []) if s["source_url"]]
    images = data["images"].get(sid, [])
    timeline = data["timeline"].get(sid, [])
    stakeholders = data["stakeholders"].get(sid, [])
    models = data["models"].get(sid, [])
    people = data["people"].get(sid, [])
    parts = data["parts"].get(sid, [])

    official = sc["official_url"] or sc["source_url"]
    rows: list[dict[str, Any]] = []

    # --- Section 1: What is it? -------------------------------------------------
    block = content.get("what_is_it")
    text = block["body_text"] if block and block["body_text"] else (
        sc["educational_description"] or sc["short_description"]
    )
    src = source_url_for_block(block, sources) or official
    status, reason, used_src = content_status(text=text, source_url=src)
    rows.append(_row(sc, 1, "what_is_it", status, reason, used_src))

    # --- Section 2: How does it work? -------------------------------------------
    block = content.get("how_it_works")
    text = block["body_text"] if block and block["body_text"] else sc["how_it_works"]
    src = source_url_for_block(block, sources) or official
    status, reason, used_src = content_status(text=text, source_url=src)
    if status == "MISSING" and parts:
        status, reason = "COMPLETE", f"{len(parts)} documented parts/instruments (no narrative)"
        used_src = next((s["source_url"] for s in sources if s["source_url"]), official)
    elif status == "COMPLETE" and parts:
        reason += f"; {len(parts)} documented parts/instruments"
    rows.append(_row(sc, 2, "how_it_works", status, reason, used_src))

    # --- Section 3: Why is it important? ----------------------------------------
    block = content.get("why_important")
    text = block["body_text"] if block and block["body_text"] else sc["why_it_is_important"]
    src = source_url_for_block(block, sources) or official
    status, reason, used_src = content_status(text=text, source_url=src)
    rows.append(_row(sc, 3, "why_important", status, reason, used_src))

    # --- Section 4: Current or last known status --------------------------------
    block = content.get("status")
    text = block["body_text"] if block and block["body_text"] else (
        sc["current_or_last_known_status"] or sc["status_text"]
    )
    src = source_url_for_block(block, sources) or official
    status, reason, used_src = content_status(text=text, source_url=src)
    rows.append(_row(sc, 4, "status", status, reason, used_src))

    # --- Section 5: Imagery ------------------------------------------------------
    sourced_images = [img for img in images if img["image_url"] and img["source_url"]]
    if not images:
        rows.append(_row(sc, 5, "imagery", "MISSING", "no image records", None))
    elif not sourced_images:
        rows.append(_row(sc, 5, "imagery", "UNVERIFIED", f"{len(images)} images, none with a source URL", None))
    else:
        rows.append(
            _row(
                sc, 5, "imagery", "COMPLETE",
                f"{len(images)} images ({len(sourced_images)} source-linked)",
                sourced_images[0]["source_url"],
            )
        )

    # --- Section 6: Sources -------------------------------------------------------
    if not sources:
        rows.append(_row(sc, 6, "sources", "MISSING", "no source records with URLs", None))
    else:
        verified = sum(1 for s in sources if s["verified"])
        first_image_source = next((img["source_url"] for img in images if img["source_url"]), None)
        rows.append(
            _row(
                sc, 6, "sources", "COMPLETE",
                f"{len(sources)} source URLs ({verified} marked verified)",
                sources[0]["source_url"] or first_image_source,
            )
        )

    # --- Section 7: Timeline ------------------------------------------------------
    if not timeline:
        rows.append(_row(sc, 7, "timeline", "MISSING", "no dated timeline events", None))
    else:
        source_by_id = {s["id"]: s["source_url"] for s in data["sources"].get(sid, [])}
        linked = [event for event in timeline if event["source_id"] in source_by_id]
        if linked:
            rows.append(
                _row(
                    sc, 7, "timeline", "COMPLETE",
                    f"{len(timeline)} events ({len(linked)} source-linked)",
                    source_by_id[linked[0]["source_id"]],
                )
            )
        else:
            rows.append(
                _row(
                    sc, 7, "timeline", "UNVERIFIED",
                    f"{len(timeline)} events, none linked to a source record", None,
                )
            )

    # --- Section 8: Stakeholders --------------------------------------------------
    if not stakeholders:
        rows.append(_row(sc, 8, "stakeholders", "MISSING", "no stakeholder organizations", None))
    else:
        with_url = [s for s in stakeholders if s["organization_url"]]
        if with_url:
            rows.append(
                _row(
                    sc, 8, "stakeholders", "COMPLETE",
                    f"{len(stakeholders)} organizations ({len(with_url)} with official URLs)",
                    with_url[0]["organization_url"],
                )
            )
        else:
            rows.append(
                _row(
                    sc, 8, "stakeholders", "UNVERIFIED",
                    f"{len(stakeholders)} organizations, none with an official URL", None,
                )
            )

    # --- Section 9: 3D model ------------------------------------------------------
    model_rows = [m for m in models if m["status"] == "ok"]
    if not model_rows:
        rows.append(
            _row(sc, 9, "model", "MISSING", "no web-ready model (all rows are no_model)", None)
        )
    else:
        model = next((m for m in model_rows if m["format"] == "glb" and m["download_url"]), model_rows[0])
        url = model["download_url"] or model["file_path"]
        if not url:
            rows.append(_row(sc, 9, "model", "MISSING", "model row has no URL/path", None))
        else:
            detail = model["format"] or "model"
            rows.append(
                _row(sc, 9, "model", "COMPLETE", f"{detail} model reference stored", url)
            )

    # --- Section 10: People -------------------------------------------------------
    if not people:
        rows.append(_row(sc, 10, "people", "MISSING", "no individual contributors", None))
    else:
        sourced = [p for p in people if p["wiki_url"] or p["source_id"]]
        if sourced:
            rows.append(
                _row(
                    sc, 10, "people", "COMPLETE",
                    f"{len(people)} people ({len(sourced)} with a source link)",
                    sourced[0]["wiki_url"],
                )
            )
        else:
            rows.append(
                _row(
                    sc, 10, "people", "UNVERIFIED",
                    f"{len(people)} people, none with a source link", None,
                )
            )

    return rows


def _row(
    sc: sqlite3.Row,
    number: int,
    section: str,
    status: str,
    reason: str,
    source_url: str | None,
) -> dict[str, Any]:
    definition = next(item for item in SECTION_DEFINITIONS if item["key"] == section)
    return {
        "slug": sc["slug"],
        "name": sc["display_name"] or sc["name"],
        "section": section,
        "section_number": number,
        "section_label": definition["label"],
        "status": status,
        "reason": reason,
        "source_url": source_url,
    }


# ---------------------------------------------------------------------------
# URL checks
# ---------------------------------------------------------------------------
_DNS_CACHE: dict[str, bool] = {}
_DNS_LOCK = threading.Lock()


def domain_resolves(host: str) -> bool:
    if not host:
        return False
    with _DNS_LOCK:
        if host in _DNS_CACHE:
            return _DNS_CACHE[host]
    try:
        socket.getaddrinfo(host, None)
        ok = True
    except OSError:
        ok = False
    with _DNS_LOCK:
        _DNS_CACHE[host] = ok
    return ok


def _local_path(url: str) -> Path | None:
    if not url.startswith("/"):
        return None
    candidate = (PUBLIC_DIR / url.lstrip("/")).resolve()
    try:
        candidate.relative_to(PUBLIC_DIR.resolve())
    except ValueError:
        return None
    return candidate


_HOST_LOCKS: dict[str, threading.Lock] = {}
_HOST_LAST_REQUEST: dict[str, float] = {}
_HOST_GUARD = threading.Lock()
HOST_INTERVAL_SECONDS = 1.0


def _throttle_host(host: str) -> None:
    """Space out requests to the same host so CDNs do not rate-limit the audit."""
    with _HOST_GUARD:
        host_lock = _HOST_LOCKS.setdefault(host, threading.Lock())
    with host_lock:
        last = _HOST_LAST_REQUEST.get(host, 0.0)
        wait = last + HOST_INTERVAL_SECONDS - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        _HOST_LAST_REQUEST[host] = time.monotonic()


def check_url(url: str, kind: str, timeout: float) -> dict[str, Any]:
    result: dict[str, Any] = {
        "url": url,
        "kind": kind,
        "status_code": None,
        "content_type": None,
        "content_length": None,
        "domain_resolves": None,
        "flags": [],
        "error": None,
    }
    if not url:
        result["flags"].append("empty_url")
        return result

    local = _local_path(url)
    if local is not None:
        result["status_code"] = "LOCAL"
        result["content_type"] = mimetypes.guess_type(local.name)[0]
        result["domain_resolves"] = True
        if not local.exists():
            result["flags"].append("local_file_missing")
            return result
        size = local.stat().st_size
        result["content_length"] = size
        if size < 1024:
            result["flags"].append("under_1kb")
        try:
            with local.open("rb") as handle:
                head = handle.read(256)
            if head.startswith(b"version https://git-lfs"):
                result["flags"].append("git_lfs_pointer")
        except OSError as exc:
            result["error"] = str(exc)
        return result

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        result["flags"].append("unsupported_scheme")
        return result

    host = parsed.netloc
    resolves = domain_resolves(host)
    result["domain_resolves"] = resolves
    if not resolves:
        result["flags"].append("domain_unresolved")
        return result

    attempts = 3
    for attempt in range(attempts):
        _throttle_host(host)
        request = Request(
            url,
            headers={
                "User-Agent": "NovaBase-Audit/1.0 (+https://github.com/)",
                "Range": "bytes=0-511",
                "Accept": "*/*",
            },
            method="GET",
        )
        try:
            with urlopen(request, timeout=timeout) as response:
                result["status_code"] = response.status
                result["content_type"] = response.headers.get("Content-Type")
                content_range = response.headers.get("Content-Range") or ""
                content_length = response.headers.get("Content-Length")
                head = response.read(512)
                total = None
                match = re.search(r"/(\d+)\s*$", content_range)
                if match:
                    total = int(match.group(1))
                elif content_length is not None and not content_range:
                    total = int(content_length)
                elif len(head) < 512:
                    total = len(head)
                result["content_length"] = total

                if total is not None and total < 1024:
                    result["flags"].append("under_1kb")
                if head.startswith(b"version https://git-lfs"):
                    result["flags"].append("git_lfs_pointer")
                content_type = (result["content_type"] or "").lower()
                if kind == "model" and ("text/html" in content_type or head.lstrip().startswith(b"<")):
                    result["flags"].append("html_instead_of_model")
                if kind == "image" and "text/html" in content_type:
                    result["flags"].append("html_instead_of_image")
                if kind == "image" and (
                    urlparse(url).path.lower().endswith((".tif", ".tiff"))
                    or "image/tiff" in content_type
                ):
                    result["flags"].append("tiff_image")
                if kind == "model" and not any(
                    urlparse(url).path.lower().split("?")[0].endswith(ext) for ext in MODEL_EXTENSIONS
                ):
                    result["flags"].append("non_glb_gltf_extension")
            return result
        except HTTPError as exc:
            # Wikimedia and other CDNs throttle bursts with 429; retry before
            # declaring the asset broken.
            if exc.code in (429, 503) and attempt < attempts - 1:
                result["flags"].clear()
                time.sleep(3 * (attempt + 1))
                continue
            result["status_code"] = exc.code
            result["content_type"] = exc.headers.get("Content-Type") if exc.headers else None
            result["error"] = f"HTTP {exc.code}"
            result["flags"].append("rate_limited" if exc.code == 429 else "http_error")
            return result
        except (URLError, TimeoutError, OSError) as exc:
            if attempt < attempts - 1:
                result["flags"].clear()
                time.sleep(2 * (attempt + 1))
                continue
            result["error"] = str(exc)
            result["flags"].append("request_failed")
            return result
    return result


def collect_url_targets(data: dict[str, Any]) -> list[dict[str, Any]]:
    targets: dict[tuple[str, str], dict[str, Any]] = {}

    def add(url: str | None, kind: str, slug: str, field: str) -> None:
        if not url:
            return
        key = (url, kind)
        target = targets.setdefault(
            key, {"url": url, "kind": kind, "owners": [], "fields": []}
        )
        if slug not in target["owners"]:
            target["owners"].append(slug)
        if field not in target["fields"]:
            target["fields"].append(field)

    for sc in data["spacecraft"]:
        slug = sc["slug"]
        for model in data["models"].get(sc["id"], []):
            if model["status"] != "ok":
                continue
            fmt = (model["format"] or "").lower()
            if fmt in ("glb", "gltf"):
                add(model["download_url"], "model", slug, "spacecraft_models.download_url")
                add(model["file_path"], "model", slug, "spacecraft_models.file_path")
        for image in data["images"].get(sc["id"], []):
            add(image["image_url"], "image", slug, "spacecraft_images.image_url")
            add(image["thumbnail_url"], "image", slug, "spacecraft_images.thumbnail_url")

    return list(targets.values())


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------
def build_summary(
    rows: list[dict[str, Any]],
    data: dict[str, Any],
    url_results: list[dict[str, Any]] | None,
    db_path: Path,
) -> dict[str, Any]:
    by_status: dict[str, int] = {}
    per_section: dict[str, dict[str, Any]] = {
        item["key"]: {"number": item["number"], "label": item["label"], **{s: 0 for s in (
            "COMPLETE", "MISSING", "PLACEHOLDER", "UNVERIFIED")}}
        for item in SECTION_DEFINITIONS
    }
    for row in rows:
        by_status[row["status"]] = by_status.get(row["status"], 0) + 1
        per_section[row["section"]][row["status"]] += 1

    per_entry: dict[str, dict[str, Any]] = {}
    for row in rows:
        entry = per_entry.setdefault(
            row["slug"],
            {
                "slug": row["slug"],
                "name": row["name"],
                "COMPLETE": 0,
                "MISSING": 0,
                "PLACEHOLDER": 0,
                "UNVERIFIED": 0,
                "gap_sections": [],
            },
        )
        entry[row["status"]] += 1
        if row["status"] != "COMPLETE":
            entry["gap_sections"].append(f"{row['section_number']}. {row['section_label']}")

    for entry in per_entry.values():
        entry["gaps"] = entry["MISSING"] + entry["PLACEHOLDER"] + entry["UNVERIFIED"]
        entry["complete_sections"] = entry["COMPLETE"]

    top_gaps = sorted(
        per_entry.values(),
        key=lambda item: (-item["gaps"], -item["PLACEHOLDER"], -item["MISSING"], item["slug"]),
    )[:20]

    summary: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "database": {
            "path": str(db_path),
            "spacecraft": len(data["spacecraft"]),
            "section_checks": len(rows),
        },
        "totals_by_status": by_status,
        "per_section": per_section,
        "top_20_entries_with_most_gaps": top_gaps,
        "complete_entries": sum(1 for e in per_entry.values() if e["gaps"] == 0),
        "entries_with_gaps": sum(1 for e in per_entry.values() if e["gaps"] > 0),
    }

    if url_results is not None:
        def url_summary(kind: str) -> dict[str, Any]:
            subset = [r for r in url_results if r["kind"] == kind]
            flag_counts: dict[str, int] = {}
            for item in subset:
                for flag in item["flags"]:
                    flag_counts[flag] = flag_counts.get(flag, 0) + 1
            return {
                "checked": len(subset),
                "with_flags": sum(1 for item in subset if item["flags"]),
                "flag_counts": dict(sorted(flag_counts.items())),
            }

        summary["url_checks"] = {
            "models": url_summary("model"),
            "images": url_summary("image"),
        }
    return summary


def write_outputs(
    output_dir: Path,
    rows: list[dict[str, Any]],
    summary: dict[str, Any],
    url_results: list[dict[str, Any]] | None,
) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    csv_path = output_dir / "audit_report.csv"
    json_path = output_dir / "audit_report.json"

    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=["slug", "section", "status", "reason", "source_url"]
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "slug": row["slug"],
                    "section": row["section"],
                    "status": row["status"],
                    "reason": row["reason"],
                    "source_url": row["source_url"] or "",
                }
            )

    payload = {
        "summary": summary,
        "entries": rows,
    }
    if url_results is not None:
        payload["url_checks"] = url_results
    with json_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
    return json_path, csv_path


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB, help="SQLite database path")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=SCRIPT_DIR,
        help="Directory for audit_report.json / audit_report.csv",
    )
    parser.add_argument(
        "--no-url-check",
        action="store_true",
        help="Skip HTTP checks for model and image URLs",
    )
    parser.add_argument("--timeout", type=float, default=20.0, help="Per-URL timeout in seconds")
    parser.add_argument("--workers", type=int, default=16, help="Concurrent URL workers")
    parser.add_argument(
        "--apply-model-url-health",
        action="store_true",
        help="Mark a section-9 model MISSING when its URL is a Git-LFS pointer or otherwise unusable",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    conn = connect(args.db)
    try:
        data = load_snapshot(conn)
    finally:
        conn.close()

    rows: list[dict[str, Any]] = []
    for sc in data["spacecraft"]:
        rows.extend(classify_sections(sc, data))

    url_results: list[dict[str, Any]] | None = None
    if not args.no_url_check:
        targets = collect_url_targets(data)
        print(f"Checking {len(targets)} unique model/image URLs...", file=sys.stderr)
        completed = 0
        url_results = []
        with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
            futures = {
                pool.submit(check_url, target["url"], target["kind"], args.timeout): target
                for target in targets
            }
            for future in as_completed(futures):
                target = futures[future]
                result = future.result()
                result["owners"] = target["owners"]
                result["fields"] = target["fields"]
                url_results.append(result)
                completed += 1
                if completed % 50 == 0 or completed == len(futures):
                    print(f"  {completed}/{len(futures)} URLs checked", file=sys.stderr)
        url_results.sort(key=lambda item: (item["kind"], item["url"]))

        if args.apply_model_url_health:
            bad = {
                result["url"]
                for result in url_results
                if result["kind"] == "model"
                and {"git_lfs_pointer", "under_1kb", "http_error", "local_file_missing"} & set(result["flags"])
            }
            for row in rows:
                if row["section"] == "model" and row["source_url"] in bad:
                    row["status"] = "MISSING"
                    row["reason"] = "stored model URL is not a usable GLB/GLTF asset"

    summary = build_summary(rows, data, url_results, args.db.resolve())
    json_path, csv_path = write_outputs(args.output_dir.resolve(), rows, summary, url_results)

    print("\nNovaBase audit complete", file=sys.stderr)
    print(f"  spacecraft: {summary['database']['spacecraft']}", file=sys.stderr)
    print(f"  section checks: {summary['database']['section_checks']}", file=sys.stderr)
    for status, count in sorted(summary["totals_by_status"].items()):
        print(f"  {status}: {count}", file=sys.stderr)
    if summary.get("url_checks"):
        print(
            "  model URLs flagged: "
            f"{summary['url_checks']['models']['with_flags']}/"
            f"{summary['url_checks']['models']['checked']}",
            file=sys.stderr,
        )
        print(
            "  image URLs flagged: "
            f"{summary['url_checks']['images']['with_flags']}/"
            f"{summary['url_checks']['images']['checked']}",
            file=sys.stderr,
        )
    print(f"  wrote {json_path}", file=sys.stderr)
    print(f"  wrote {csv_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
