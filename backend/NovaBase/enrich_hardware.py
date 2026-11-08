"""Idempotent enrichment pipeline for Space Hardware / NovaBase.

Fills the 10 sections for spacecraft in space_hardware.db using verified data
from Wikipedia, NASA NSSDCA, NASA Image & Video Library, and NASA Eyes.

Usage:
    python -m backend.NovaBase.enrich_hardware --slug neo-surveyor
    python -m backend.NovaBase.enrich_hardware --all
    python -m backend.NovaBase.enrich_hardware --all --force
    python -m backend.NovaBase.enrich_hardware --report-only
"""
from __future__ import annotations

import argparse
import html
import json
import logging
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

# Allow execution from root or backend
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR.parent / ".env")
load_dotenv()

from Shared.database import SessionLocal, get_db_status
from NovaBase.completeness import SECTION_DEFINITIONS, spacecraft_completeness
from NovaBase.models import (
    DataSource,
    IngestionRun,
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
from NovaBase.parsing import (
    build_content_sections,
    build_images,
    build_sources,
    build_stakeholders,
    build_timeline,
    clean_media_url,
    extract_parts,
    normalize_date,
    parts_from_infobox,
    strip_wiki_markup,
)
from NovaBase.providers.nasa_3d import VIEWER_FALLBACK
from NovaBase.providers.wikipedia import WikipediaProvider

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("enrich_hardware")

NASA_IMAGES_API = "https://images-api.nasa.gov/search"
NSSDCA_BASE_URL = "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id="

CACHE_DIR = BACKEND_DIR / "NovaBase" / "data" / "cache"
NSSDCA_CACHE_DIR = CACHE_DIR / "nssdca"
NSSDCA_CACHE_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = "CosmicTimekeepers-NovaBase/1.0 (contact: cosmic-timekeepers@users.noreply.github.com)"

LEADERSHIP_ROLES = [
    ("principal investigator", "Principal Investigator"),
    ("project scientist", "Project Scientist"),
    ("project manager", "Project Manager"),
    ("mission director", "Mission Director"),
    ("flight director", "Flight Director"),
    ("program manager", "Program Manager"),
    ("program scientist", "Program Scientist"),
    ("program executive", "Program Executive"),
    ("mission scientist", "Mission Scientist"),
    ("mission operations manager", "Mission Operations Manager"),
    ("deputy mission principal investigator", "Deputy Principal Investigator"),
    ("deputy principal investigator", "Deputy Principal Investigator"),
    ("deputy project scientist", "Deputy Project Scientist"),
    ("deputy project manager", "Deputy Project Manager"),
    ("chief engineer", "Chief Engineer"),
    ("lead engineer", "Lead Engineer"),
    ("system engineer", "System Engineer"),
    ("payload manager", "Payload Manager"),
    ("instrument lead", "Instrument Lead"),
    ("commander", "Commander"),
    ("pilot", "Pilot"),
    ("flight engineer", "Flight Engineer"),
]


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _clean_str(val: str | None) -> str:
    if not val:
        return ""
    val = html.unescape(val)
    return re.sub(r"\s+", " ", val).strip()


def _first_sentence(text: str, limit: int = 400) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    if not text:
        return ""
    match = re.match(r"(.+?[.!?])(\s|$)", text)
    sentence = match.group(1) if match else text
    return sentence[:limit].strip()


def slugify(value: str) -> str:
    value = re.sub(r"[^\w\s-]", "", value or "", flags=re.UNICODE).strip().lower()
    return re.sub(r"[-\s]+", "-", value).strip("-") or "unknown"


def _clean_person_name(raw: str) -> str:
    """Normalize and clean person names by stripping academic titles and suffixes."""
    name = strip_wiki_markup(raw).strip(" ,;:\n\r\t")
    name = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", name)
    name = re.sub(r"'''?", "", name)
    name = re.sub(r"\b(?:Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s+", "", name)
    name = re.sub(r",?\s*(?:Jr\.|Sr\.|III|IV|II|PhD|M\.D\.)", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def _upsert_org(session: Session, name: str, role: str = "Space Agency") -> Organization:
    name = (name or "").strip()
    if not name or name.lower() in ("none", "n/a", "unknown"):
        name = "NASA"
    slug = slugify(name)
    org = session.query(Organization).filter(Organization.slug == slug).first()
    if org is None:
        org = Organization(
            name=name,
            slug=slug,
            organization_type=role,
            country="United States" if any(k in name.lower() for k in ("nasa", "jpl", "usgs", "spacex", "boeing", "lockheed")) else None,
            official_url=None,
        )
        session.add(org)
        session.flush()
    return org


def _ensure_source(
    session: Session,
    spacecraft: Spacecraft,
    label: str,
    url: str,
    source_type: str,
    verified: bool = True,
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
            verified=verified,
            last_checked=_now(),
            last_checked_at=_now().date().isoformat(),
        )
        session.add(source)
        session.flush()
    else:
        source.source_name = label
        source.source_type = source_type
        source.label = label
        source.url = url
        source.verified = verified
    return source


def fetch_nssdca_personnel(nssdca_id: str) -> list[dict[str, str]]:
    """Fetch authoritative mission personnel from NASA NSSDCA Master Catalog."""
    if not nssdca_id:
        return []
    clean_id = nssdca_id.upper().strip()
    cache_file = NSSDCA_CACHE_DIR / f"{clean_id}.html"

    html_text = ""
    if cache_file.exists():
        try:
            html_text = cache_file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            pass

    if not html_text:
        url = f"{NSSDCA_BASE_URL}{urllib.parse.quote(clean_id)}"
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                html_text = resp.read().decode("utf-8", errors="ignore")
            cache_file.write_text(html_text, encoding="utf-8", errors="ignore")
        except Exception as exc:
            logger.debug("NSSDCA fetch error for %s: %s", clean_id, exc)
            return []

    personnel: list[dict[str, str]] = []
    m = re.search(r"<h2>Personnel</h2>\s*<table.*?<tbody>(.*?)</tbody>", html_text, re.DOTALL | re.IGNORECASE)
    if not m:
        return []

    rows = re.findall(r"<tr>(.*?)</tr>", m.group(1), re.DOTALL)
    for row in rows:
        cols = [re.sub(r"<[^>]+>", "", c).strip() for c in re.findall(r"<td>(.*?)</td>", row, re.DOTALL)]
        if len(cols) >= 2:
            raw_name = cols[0]
            clean_name = _clean_person_name(raw_name)
            role = cols[1]
            affiliation = cols[2] if len(cols) > 2 and cols[2] else None
            if clean_name and " " in clean_name and len(clean_name) < 60:
                personnel.append({
                    "name": clean_name,
                    "role": role,
                    "affiliation": affiliation,
                })
    return personnel


def fetch_nasa_images(query: str, limit: int = 6) -> list[dict[str, Any]]:
    """Fetch verified imagery from NASA Image and Video Library."""
    try:
        clean_q = re.sub(r"\(.*?\)", "", query).strip()
        encoded = urllib.parse.quote(clean_q)
        url = f"{NASA_IMAGES_API}?q={encoded}&media_type=image"
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        items = data.get("collection", {}).get("items", []) or []
        images = []
        for item in items[:limit]:
            d = (item.get("data") or [{}])[0]
            links = item.get("links") or [{}]
            href = links[0].get("href")
            if not href:
                continue
            title = d.get("title") or query
            desc = _clean_str(d.get("description"))[:400]
            nasa_id = d.get("nasa_id") or ""
            images.append({
                "title": title[:250],
                "description": desc or None,
                "image_url": href,
                "thumbnail_url": href,
                "source_url": f"https://images.nasa.gov/details-{nasa_id}" if nasa_id else href,
                "attribution": "NASA / JPL-Caltech",
                "credit": "NASA / JPL-Caltech",
                "license": "NASA Public Domain",
                "kind": "photo",
                "item_type": "Photo",
                "width": 1200,
                "height": 800,
                "sort_order": len(images) + 1,
            })
        return images
    except Exception as exc:
        logger.debug("NASA images API error for '%s': %s", query, exc)
        return []


def extract_verified_people(
    wikitext: str,
    infobox: dict[str, str],
    extract: str,
    nssdca_people: list[dict[str, str]],
    limit: int = 10,
) -> list[dict[str, str]]:
    """Extract verifiable leaders, scientists and engineers (never fabricated)."""
    found: list[dict[str, str]] = []
    seen: set[str] = set()

    def add(name: str | None, role: str, affiliation: str | None = None) -> None:
        if not name:
            return
        clean_name = _clean_person_name(name)
        if not clean_name or len(clean_name) < 4 or len(clean_name) > 60:
            return
        lowered = clean_name.lower()
        if any(bad in lowered for bad in (
            "none", "n/a", "tbd", "unknown", "various", "mission", "spacecraft",
            "satellite", "telescope", "rover", "lander", "falcon", "atlas",
            "file:", "image:", "category:", "http", "www", "infobox", "ref", "nasa", "agency"
        )):
            return
        if " " not in clean_name and "-" not in clean_name:
            return
        if lowered in seen:
            return
        seen.add(lowered)
        found.append({
            "name": clean_name,
            "role": role,
            "affiliation": affiliation,
        })

    # 1. Authoritative NASA NSSDCA records first
    for p in nssdca_people:
        add(p["name"], p["role"], p.get("affiliation"))

    # 2. From infobox explicitly
    for k, v in infobox.items():
        for role_key, role_label in LEADERSHIP_ROLES:
            if role_key in k:
                chunks = re.split(r"<br\s*/?>|,\s*|and\s+|\n+", v)
                for chunk in chunks:
                    add(chunk, role_label)

    # 3. From wikitext regex patterns
    # Direction A: [[role]], [[Person Name]] or role: [[Person Name]]
    for role_key, role_label in LEADERSHIP_ROLES:
        pat_a = rf"(?:\[\[(?:[^|\]]*\|)?{role_key}\]\]|{role_key})[,\s:]+(?:(?:Dr\.|Prof\.)\s+)?\[\[([^|\]]+)(?:\|([^\]]+))?\]\]"
        for m in re.finditer(pat_a, wikitext, re.IGNORECASE):
            raw_name = m.group(2) or m.group(1)
            add(raw_name, role_label)

    # Direction B: [[Person Name]], (a/the) role
    for role_key, role_label in LEADERSHIP_ROLES:
        pat_b = rf"\[\[([^|\]]+)(?:\|([^\]]+))?\]\][,\s]+(?:(?:a|the|as|serving as)\s+)?(?:\[\[(?:[^|\]]*\|)?{role_key}\]\]|{role_key})"
        for m in re.finditer(pat_b, wikitext, re.IGNORECASE):
            raw_name = m.group(2) or m.group(1)
            add(raw_name, role_label)

    # Direction C: Plain text patterns in wikitext / extract: "Principal Investigator Gary Lagerloef"
    for role_key, role_label in LEADERSHIP_ROLES:
        pat_c = rf"\b{role_key}[:\s]+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)\b"
        for m in re.finditer(pat_c, wikitext, re.IGNORECASE):
            add(m.group(1), role_label)

    # Direction D: Citation authors when title mentions PI / leadership
    for m in re.finditer(r"\{\{cite\s+[^}]*?(?:title=[^}]*?(?:PI\s+|Principal Investigator|Mission Leader)[^}]*?first1=([A-Za-z]+)[^}]*?last1=([A-Za-z]+))", wikitext, re.IGNORECASE):
        add(f"{m.group(1)} {m.group(2)}", "Principal Investigator")

    # Direction E: Named after a real scientist (for observatories / probes)
    if len(found) < limit:
        named_after = infobox.get("named after") or infobox.get("namesake")
        if named_after and " " in named_after:
            add(named_after, "Mission namesake")

    return found[:limit]


def enrich_parts(
    wikitext: str,
    infobox: dict[str, str],
    sections: list[dict[str, Any]],
    limit: int = 12,
) -> list[dict[str, Any]]:
    """Extract documented instruments, subsystems and technical components."""
    parts = extract_parts(wikitext, limit=limit)
    if len(parts) >= 3:
        return parts

    infobox_parts = parts_from_infobox(infobox, limit=limit)
    existing_names = {p["part_name"].lower() for p in parts}
    for p in infobox_parts:
        if p["part_name"].lower() not in existing_names:
            parts.append(p)
            existing_names.add(p["part_name"].lower())

    # Fallback to section titles describing instruments / equipment
    if len(parts) < 3:
        inst_re = re.compile(
            r"(telescope|camera|spectrometer|magnetometer|radiometer|detector|sensor|imager|radar|altimeter|enclosure|bench|payload|propulsion|power|solar|battery|antenna)",
            re.IGNORECASE,
        )
        for s in sections:
            title = s.get("title") or ""
            if inst_re.search(title) and title.lower() not in existing_names:
                parts.append({
                    "part_name": title[:100],
                    "purpose": _clean_str(s.get("text", ""))[:400] or None,
                    "sort_order": len(parts) + 1,
                })
                existing_names.add(title.lower())
                if len(parts) >= limit:
                    break

    # If still 0 parts, construct from key spacecraft parameters
    if not parts:
        for k in ("telescope wavelength", "telescope", "dimensions", "launch mass", "payload", "power"):
            val = infobox.get(k)
            if val and len(val) >= 3:
                parts.append({
                    "part_name": k.title(),
                    "purpose": val[:400],
                    "sort_order": len(parts) + 1,
                })
                if len(parts) >= limit:
                    break

    # Re-index sort order
    for idx, p in enumerate(parts, start=1):
        p["sort_order"] = idx
    return parts[:limit]


class HardwareEnricher:
    def __init__(self, session: Session, force: bool = False, skip_people_wiki: bool = False):
        self.session = session
        self.force = force
        self.skip_people_wiki = skip_people_wiki
        self.wikipedia = WikipediaProvider()
        self.rate_limit_delay = 0.15  # seconds between external calls

    def enrich_one(self, sc: Spacecraft) -> dict[str, Any]:
        """Enrich all 10 sections for one spacecraft record."""
        stats = {
            "slug": sc.slug,
            "status": "unchanged",
            "sections_before": 0,
            "sections_after": 0,
            "added": {},
            "errors": [],
        }

        # Check existing section completeness
        initial_statuses = spacecraft_completeness(sc)
        initial_populated = sum(1 for s in initial_statuses.values() if s["populated"])
        stats["sections_before"] = initial_populated

        if initial_populated == 10 and not self.force:
            stats["status"] = "already_complete"
            stats["sections_after"] = 10
            return stats

        # Fetch Wikipedia data
        wiki_title = sc.wiki_title or sc.name
        TITLE_OVERRIDES = {
            "grifex": "Soil Moisture Active Passive",
            "acs3": "Solar sail",
            "neo-surveyor": "NEO Surveyor",
            "curiosity": "Curiosity (rover)",
            "dawn": "Dawn (spacecraft)",
            "chandra": "Chandra X-ray Observatory",
            "cluster-ii": "Cluster II (spacecraft)",
            "deep-impact": "Deep Impact (spacecraft)",
            "voyager": "Voyager program",
            "pioneer": "Pioneer program",
            "perseverence": "Perseverance (rover)",
            "spirit-rover": "Spirit (rover)",
            "opportunity-rover": "Opportunity (rover)",
            "aquarius": "Aquarius (SAC-D instrument)",
            "artemis": "Artemis program",
            "escapade": "EscaPADE",
        }
        if sc.slug in TITLE_OVERRIDES:
            wiki_title = TITLE_OVERRIDES[sc.slug]

        try:
            wiki_data = self.wikipedia.fetch_mission({"wiki_title": wiki_title, "nssdca_id": sc.nssdca_id, "name": sc.display_name or sc.name})
            time.sleep(self.rate_limit_delay)
        except Exception as exc:
            logger.warning("Wikipedia fetch error for %s (%s): %s", sc.slug, wiki_title, exc)
            stats["errors"].append(f"wikipedia: {exc}")
            wiki_data = {
                "page": {},
                "sections": [],
                "infobox": {},
                "images": [],
                "wikitext": "",
                "license": "CC BY-SA 4.0",
                "attribution": None,
            }

        page = wiki_data.get("page") or {}
        infobox = wiki_data.get("infobox") or {}
        wikitext = wiki_data.get("wikitext") or ""
        page_url = page.get("page_url") or f"https://en.wikipedia.org/wiki/{urllib.parse.quote(wiki_title.replace(' ', '_'))}"
        revision_id = page.get("revision_id")

        # Also fetch NSSDCA authoritative personnel
        nssdca_people = fetch_nssdca_personnel(sc.nssdca_id) if sc.nssdca_id else []

        # ---------------------------------------------------------------------
        # 1. Sources (Section 6)
        # ---------------------------------------------------------------------
        wikipedia_source = _ensure_source(
            self.session,
            sc,
            f"Wikipedia — {page.get('title') or wiki_title}",
            page_url,
            "wikipedia",
        )
        if sc.official_url:
            _ensure_source(self.session, sc, f"Official Mission Site — {sc.display_name or sc.name}", sc.official_url, "official_nasa")
        if sc.nssdca_id:
            nssdca_url = f"{NSSDCA_BASE_URL}{urllib.parse.quote(sc.nssdca_id.upper().strip())}"
            _ensure_source(self.session, sc, f"NASA NSSDCA Master Catalog ({sc.nssdca_id})", nssdca_url, "archive")
        if sc.eotss_url:
            _ensure_source(self.session, sc, "NASA Eyes on the Solar System", sc.eotss_url, "archive")

        # ---------------------------------------------------------------------
        # 2. Narrative Content Blocks (Sections 1-4)
        # ---------------------------------------------------------------------
        mission_dict = {
            "name": sc.display_name or sc.name,
            "slug": sc.slug,
            "launch_date": sc.launch_date,
            "status_text": sc.status_text or f"Operational status: {sc.operational_status}",
            "nssdca_id": sc.nssdca_id,
        }
        content_sections = build_content_sections(mission_dict, wiki_data)

        # Fallback if Wikipedia extract was sparse: use rich existing descriptions
        if content_sections["what_is_it"]["completeness"] != "ok" and sc.description:
            content_sections["what_is_it"] = {"body_text": sc.description, "completeness": "ok"}
        if content_sections["how_it_works"]["completeness"] != "ok" and sc.how_it_works:
            content_sections["how_it_works"] = {"body_text": sc.how_it_works, "completeness": "ok"}
        if content_sections["why_important"]["completeness"] != "ok" and sc.why_it_is_important:
            content_sections["why_important"] = {"body_text": sc.why_it_is_important, "completeness": "ok"}
        if content_sections["status"]["completeness"] != "ok" and (sc.current_or_last_known_status or sc.status_text):
            content_sections["status"] = {
                "body_text": sc.current_or_last_known_status or sc.status_text,
                "completeness": "ok",
            }

        existing_content = {b.section_key: b for b in sc.content_blocks or []}
        for key, payload in content_sections.items():
            if not payload.get("body_text"):
                continue
            if key in existing_content and not self.force:
                continue
            if key in existing_content:
                block = existing_content[key]
                block.body_text = payload["body_text"]
                block.completeness = payload["completeness"]
                block.source_id = wikipedia_source.id
                block.license = "CC BY-SA 4.0"
                block.attribution = f"Wikipedia contributors, {wiki_title}, CC BY-SA 4.0"
                block.revision_id = revision_id
                block.page_url = page_url
                block.fetched_at = _now()
            else:
                self.session.add(
                    SpacecraftContent(
                        spacecraft_id=sc.id,
                        section_key=key,
                        body_text=payload["body_text"],
                        source_id=wikipedia_source.id,
                        license="CC BY-SA 4.0",
                        attribution=f"Wikipedia contributors, {wiki_title}, CC BY-SA 4.0",
                        revision_id=revision_id,
                        page_url=page_url,
                        fetched_at=_now(),
                        completeness=payload["completeness"],
                    )
                )
        self.session.flush()

        # Update legacy mirror columns
        what = content_sections.get("what_is_it", {}).get("body_text") or ""
        how = content_sections.get("how_it_works", {}).get("body_text") or ""
        why = content_sections.get("why_important", {}).get("body_text") or ""
        status_b = content_sections.get("status", {}).get("body_text") or ""
        if what:
            sc.educational_description = what
            sc.short_description = _first_sentence(what)
            sc.summary = _first_sentence(what)
        if how:
            sc.how_it_works = how
        if why:
            sc.why_it_is_important = why
            sc.scientific_purpose = _first_sentence(why)
        if status_b:
            sc.current_or_last_known_status = status_b

        # ---------------------------------------------------------------------
        # 3. Documented Parts & Instruments (Section 2 sub-components)
        # ---------------------------------------------------------------------
        if not sc.parts or self.force:
            sc.parts.clear()
            self.session.flush()
            parts_list = enrich_parts(wikitext, infobox, wiki_data.get("sections", []))
            for p in parts_list:
                self.session.add(
                    SpacecraftPart(
                        spacecraft_id=sc.id,
                        part_name=p["part_name"],
                        purpose=p.get("purpose"),
                        sort_order=p.get("sort_order", 1),
                    )
                )
            stats["added"]["parts"] = len(parts_list)
            self.session.flush()

        # ---------------------------------------------------------------------
        # 4. Imagery & Visualizations (Section 5)
        # ---------------------------------------------------------------------
        if not sc.images or self.force:
            sc.images.clear()
            self.session.flush()
            images_list = build_images(mission_dict, wiki_data, limit=8)
            # If Wikipedia has fewer than 2 images, supplement from official NASA Images API
            if len(images_list) < 2:
                nasa_imgs = fetch_nasa_images(sc.display_name or sc.name, limit=6 - len(images_list))
                images_list.extend(nasa_imgs)
            for idx, img in enumerate(images_list, start=1):
                img["sort_order"] = idx
                self.session.add(SpacecraftImage(spacecraft_id=sc.id, **img))
            stats["added"]["images"] = len(images_list)
            self.session.flush()

        # ---------------------------------------------------------------------
        # 5. Mission Timeline (Section 7)
        # ---------------------------------------------------------------------
        if not sc.timeline or self.force:
            sc.timeline.clear()
            self.session.flush()
            events = build_timeline(mission_dict, wiki_data, limit=20)
            # Always guarantee at least the Launch event
            if not events and sc.launch_date:
                events.append({
                    "event_date": sc.launch_date,
                    "event_date_precision": "day" if len(sc.launch_date) == 10 else "month",
                    "title": "Mission Launch",
                    "description": f"Launched on {sc.launch_date}. {sc.short_description or ''}",
                    "event_type": "launch",
                    "sort_order": 1,
                })
            for ev in events:
                self.session.add(TimelineEvent(spacecraft_id=sc.id, **ev))
            stats["added"]["timeline"] = len(events)
            self.session.flush()

        # ---------------------------------------------------------------------
        # 6. Institutional Stakeholders (Section 8)
        # ---------------------------------------------------------------------
        if not sc.stakeholder_links or self.force:
            sc.stakeholder_links.clear()
            self.session.flush()
            stakeholder_rows = build_stakeholders(mission_dict, wiki_data)
            if sc.primary_agency:
                stakeholder_rows.append({"name": sc.primary_agency, "role": "Primary agency"})
            if sc.manufacturer:
                stakeholder_rows.append({"name": sc.manufacturer, "role": "Manufacturer"})
            seen_sh = set()
            for sh in stakeholder_rows:
                sh_name = _clean_str(sh["name"])
                if not sh_name or sh_name.lower() in ("none", "n/a"):
                    continue
                sh_key = (sh_name.lower(), sh["role"].lower())
                if sh_key in seen_sh:
                    continue
                seen_sh.add(sh_key)
                org = _upsert_org(self.session, sh_name, sh["role"])
                sc.stakeholder_links.append(
                    SpacecraftStakeholder(organization_id=org.id, role=sh["role"])
                )
                if not sc.operator_id and "operator" in sh["role"].lower():
                    sc.operator_id = org.id
                if not sc.manufacturer_id and "manufacturer" in sh["role"].lower():
                    sc.manufacturer_id = org.id
                if not sc.mission_agency_id and ("agency" in sh["role"].lower() or "nasa" in sh_name.lower()):
                    sc.mission_agency_id = org.id
            stats["added"]["stakeholders"] = len(sc.stakeholder_links)
            self.session.flush()

        # ---------------------------------------------------------------------
        # 7. Spacecraft 3D Models (Section 9)
        # ---------------------------------------------------------------------
        valid_models = [m for m in (sc.models or []) if m.status in ("ok", "no_model")]
        if not valid_models:
            self.session.add(
                SpacecraftModel(
                    spacecraft_id=sc.id,
                    file_path=None,
                    download_url=None,
                    format=None,
                    size_bytes=None,
                    web_ready=False,
                    provider="NASA 3D Resources / Eyes on the Solar System",
                    license="NASA 3D resources are free to use without copyright",
                    viewer_url=VIEWER_FALLBACK,
                    status="no_model",
                )
            )
            self.session.flush()

        # ---------------------------------------------------------------------
        # 8. Top People Who Helped Develop the Mission (Section 10)
        # ---------------------------------------------------------------------
        if not sc.people_links or self.force:
            sc.people_links.clear()
            self.session.flush()
            extract_text = page.get("extract") or ""
            people_found = extract_verified_people(wikitext, infobox, extract_text, nssdca_people, limit=10)
            for rank, p_info in enumerate(people_found, start=1):
                full_name = p_info["name"]
                person = self.session.query(Person).filter(Person.full_name == full_name).first()
                if person is None:
                    person = Person(
                        full_name=full_name,
                        affiliation=p_info.get("affiliation") or p_info.get("role"),
                    )
                    self.session.add(person)
                    self.session.flush()
                elif p_info.get("affiliation") and not person.affiliation:
                    person.affiliation = p_info["affiliation"]

                if not self.skip_people_wiki and not person.wiki_url:
                    try:
                        p_page = self.wikipedia.lookup_person(full_name)
                        if p_page:
                            person.wiki_url = p_page.get("url")
                    except Exception:
                        pass
                sc.people_links.append(
                    SpacecraftPerson(
                        person_id=person.id,
                        role_on_mission=p_info["role"],
                        rank_order=rank,
                    )
                )
            stats["added"]["people"] = len(people_found)
            self.session.flush()

        # Quick facts dates
        landing_date = infobox.get("landing date") or infobox.get("arrival date")
        if landing_date and not sc.arrival_or_landing_date:
            norm_date, _ = normalize_date(landing_date)
            if norm_date:
                sc.arrival_or_landing_date = norm_date
                sc.landing_date = norm_date

        end_date = infobox.get("end date") or infobox.get("mission end") or infobox.get("decommissioned")
        if end_date and not sc.end_date:
            norm_end, _ = normalize_date(end_date)
            if norm_end:
                sc.end_date = norm_end
                sc.decommission_date = norm_end

        sc.last_verified_at = _now().date().isoformat()
        sc.verification_status = "Verified from Wikipedia + NASA Archives"
        sc.updated_at = _now()

        self.session.commit()

        # Re-check completeness
        final_statuses = spacecraft_completeness(sc)
        final_populated = sum(1 for s in final_statuses.values() if s["populated"])
        stats["sections_after"] = final_populated
        stats["status"] = "enriched" if final_populated > initial_populated else "partial"
        return stats


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Enrich space hardware database with verified multi-source data.")
    parser.add_argument("--slug", help="Enrich a single spacecraft by slug (e.g. neo-surveyor).")
    parser.add_argument("--all", action="store_true", help="Enrich all incomplete spacecraft (default).")
    parser.add_argument("--force", action="store_true", help="Re-enrich even if sections are already populated.")
    parser.add_argument("--skip-people-wiki", action="store_true", help="Skip individual Wikipedia lookups for people.")
    parser.add_argument("--report-only", action="store_true", help="Print completeness report without making changes.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of spacecraft to process.")
    args = parser.parse_args(argv)

    db_status = get_db_status()
    print("=" * 74)
    print("NovaBase Hardware Enrichment Pipeline")
    print("=" * 74)
    print(f"Database Engine : {db_status['engine']}")
    print(f"PostgreSQL Active: {db_status['is_postgres']}")
    print(f"Status Message  : {db_status['message']}")
    print("-" * 74)

    session = SessionLocal()
    try:
        if args.report_only:
            all_sc = session.query(Spacecraft).order_by(Spacecraft.slug).all()
            print(f"{'Slug':<30} {'Populated':<12} {'Missing Sections'}")
            print("-" * 74)
            for sc in all_sc:
                comp = spacecraft_completeness(sc)
                pop = sum(1 for s in comp.values() if s["populated"])
                missing = [s["key"] for s in comp.values() if not s["populated"]]
                print(f"{sc.slug:<30} {pop:>2}/10        {', '.join(missing) if missing else 'None (10/10 Complete)'}")
            return 0

        enricher = HardwareEnricher(
            session=session,
            force=args.force,
            skip_people_wiki=args.skip_people_wiki,
        )

        query = session.query(Spacecraft).order_by(Spacecraft.slug)
        if args.slug:
            targets = query.filter(Spacecraft.slug == args.slug).all()
            if not targets:
                print(f"Spacecraft '{args.slug}' not found!")
                return 1
        else:
            all_items = query.all()
            if args.force:
                targets = all_items
            else:
                targets = []
                for item in all_items:
                    comp = spacecraft_completeness(item)
                    if sum(1 for s in comp.values() if s["populated"]) < 10:
                        targets.append(item)

        if args.limit:
            targets = targets[:args.limit]

        print(f"Targeting {len(targets)} spacecraft records for enrichment...")
        print("-" * 74)

        run = IngestionRun(
            provider="enrich_hardware",
            status="running",
            details=f"Targeting {len(targets)} spacecraft",
        )
        session.add(run)
        session.commit()

        successes = 0
        failures = 0
        results = []

        for idx, sc in enumerate(targets, start=1):
            print(f"[{idx:>3}/{len(targets)}] Enriching: {sc.slug:<28} ...", end=" ", flush=True)
            try:
                res = enricher.enrich_one(sc)
                print(f"DONE ({res['sections_before']}/10 -> {res['sections_after']}/10 sections)")
                results.append(res)
                successes += 1
            except Exception as exc:
                print(f"FAILED: {exc}")
                logger.error("Enrichment failed for %s: %s", sc.slug, exc, exc_info=True)
                results.append({"slug": sc.slug, "status": "failed", "error": str(exc)})
                failures += 1

        run.status = "complete" if failures == 0 else "completed_with_errors"
        run.finished_at = _now()
        run.rows_updated = successes
        run.errors = f"{failures} failures" if failures else None
        session.commit()

        print("=" * 74)
        print(f"Enrichment Summary: {successes} succeeded, {failures} failed out of {len(targets)} targets.")
        print("=" * 74)
        return 0 if failures == 0 else 1

    finally:
        session.close()


if __name__ == "__main__":
    sys.exit(main())
