"""Deterministic parsing of Wikipedia data into the NovaBase 10 sections.

Only text that exists in the provider payload (or the curated registry) is
used.  Missing data is reported as ``missing`` rather than invented.
"""
from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlsplit, urlunsplit

from .providers.wikipedia import strip_wiki_markup

SECTION_KEYS = ["what_is_it", "how_it_works", "why_important", "status"]
SECTION_LABELS = {
    "what_is_it": "What is it?",
    "how_it_works": "How does it work?",
    "why_important": "Why is it important?",
    "status": "Current or last known status",
}

DESIGN_PATTERNS = re.compile(
    r"(design|spacecraft|instrument|payload|construction|hardware|configuration|"
    r"components|mission architecture|engineering|science instruments|operation)",
    re.IGNORECASE,
)
RESULT_PATTERNS = re.compile(
    r"(result|discover|science|legacy|impact|significance|achievement|finding|"
    r"exploration|scientific|observation|accomplish)",
    re.IGNORECASE,
)
STATUS_PATTERNS = re.compile(
    r"(status|end of mission|fate|current|retire|decommission|mission end|"
    r"loss of contact|final)",
    re.IGNORECASE,
)

EVENT_KEYWORDS = re.compile(
    r"(launch|landed|landing|impact|flyby|flew by|arriv|entered orbit|orbit insertion|"
    r"discover|detected|found|ended|end of mission|lost contact|retired|"
    r"deploy|separat|touchdown|closest approach|interstellar|encounter)",
    re.IGNORECASE,
)

MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7, "aug": 8,
    "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
}

_MONTH_ALT = "|".join(sorted(MONTHS, key=len, reverse=True))


def _clean(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def clean_media_url(url: str | None) -> str | None:
    """Drop tracking query strings from Wikimedia URLs.

    The Action API appends ``?utm_source=...`` to image URLs; those parameters
    are not part of the asset identity and some CDN configurations reject them.
    """
    if not url:
        return url
    if "wikimedia.org" in url or "wikipedia.org" in url:
        parts = urlsplit(url)
        return urlunsplit((parts.scheme, parts.netloc, parts.path, "", parts.fragment))
    return url


def _truncate(text: str, limit: int = 7000) -> str:
    text = _clean(text)
    if len(text) <= limit:
        return text
    cut = text[:limit]
    last_period = cut.rfind(". ")
    return (cut[: last_period + 1] if last_period > limit * 0.6 else cut).strip()


def _first_paragraphs(text: str, count: int = 3) -> str:
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text or "") if p.strip()]
    return "\n\n".join(paragraphs[:count])


def normalize_date(text: str | None) -> tuple[str | None, str]:
    """Find the first date in *text* and normalise it to ISO-like form."""
    if not text:
        return None, "unknown"

    iso = re.search(r"\b(1[89]\d{2}|20\d{2})-(\d{2})-(\d{2})\b", text)
    if iso:
        return iso.group(0), "day"

    iso_month = re.search(r"\b(1[89]\d{2}|20\d{2})-(\d{2})\b", text)
    if iso_month and 1 <= int(iso_month.group(2)) <= 12:
        return iso_month.group(0), "month"

    day_month_year = re.search(
        rf"\b(\d{{1,2}})\s+({_MONTH_ALT})\.?\s+(\d{{4}})\b", text, re.IGNORECASE
    )
    if day_month_year:
        day = int(day_month_year.group(1))
        month = MONTHS[day_month_year.group(2).lower()]
        year = int(day_month_year.group(3))
        return f"{year:04d}-{month:02d}-{day:02d}", "day"

    month_day_year = re.search(
        rf"\b({_MONTH_ALT})\.?\s+(\d{{1,2}}),?\s+(\d{{4}})\b", text, re.IGNORECASE
    )
    if month_day_year:
        month = MONTHS[month_day_year.group(1).lower()]
        day = int(month_day_year.group(2))
        year = int(month_day_year.group(3))
        return f"{year:04d}-{month:02d}-{day:02d}", "day"

    month_year = re.search(rf"\b({_MONTH_ALT})\.?\s+(\d{{4}})\b", text, re.IGNORECASE)
    if month_year:
        month = MONTHS[month_year.group(1).lower()]
        year = int(month_year.group(2))
        return f"{year:04d}-{month:02d}", "month"

    year_only = re.search(r"\b(1[89]\d{2}|20\d{2})\b", text)
    if year_only:
        return year_only.group(0), "year"

    return None, "unknown"


def _join_sections(sections: list[dict[str, Any]], matcher: re.Pattern[str], limit: int = 3) -> str:
    chosen = [s for s in sections if s.get("title") and matcher.search(s["title"])]
    return _truncate("\n\n".join(f"{s['title']}\n{s['text']}" for s in chosen[:limit]))


def _matching_paragraphs(
    sections: list[dict[str, Any]], matcher: re.Pattern[str], limit: int = 3
) -> str:
    """Fallback: pick paragraphs (not headings) that discuss the topic."""
    matches: list[str] = []
    for section in sections:
        for paragraph in re.split(r"\n\s*\n", section.get("text") or ""):
            paragraph = _clean(paragraph)
            if len(paragraph) < 80:
                continue
            if matcher.search(paragraph):
                matches.append(paragraph)
            if len(matches) >= limit:
                return _truncate("\n\n".join(matches))
    return _truncate("\n\n".join(matches))


def build_content_sections(mission: dict[str, Any], wiki: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Map Wikipedia sections to the four narrative NovaBase sections."""
    sections = wiki.get("sections") or []
    intro_sections = [s for s in sections if not s.get("title")]
    intro = _clean("\n\n".join(s.get("text", "") for s in intro_sections))
    infobox = wiki.get("infobox") or {}

    what_is_it = _first_paragraphs(intro, 3)
    if not what_is_it and wiki.get("page", {}).get("extract"):
        what_is_it = _first_paragraphs(wiki["page"]["extract"], 3)
    extra_facts = []
    for key in ("mission type", "operator", "manufacturer", "launch mass", "dry mass", "launch date"):
        value = infobox.get(key)
        if value:
            extra_facts.append(f"{key.title()}: {value}")
    if extra_facts:
        what_is_it = (what_is_it + "\n\nKey facts: " + "; ".join(extra_facts)).strip()

    how_it_works = _join_sections(sections, DESIGN_PATTERNS, limit=3)
    if not how_it_works:
        how_it_works = _matching_paragraphs(sections, DESIGN_PATTERNS, limit=3)
    why_important = _join_sections(sections, RESULT_PATTERNS, limit=3)
    if not why_important:
        why_important = _matching_paragraphs(sections, RESULT_PATTERNS, limit=3)
    status_text = _join_sections(sections, STATUS_PATTERNS, limit=2)
    if not status_text:
        status_text = _matching_paragraphs(sections, STATUS_PATTERNS, limit=2)

    status_parts = []
    if infobox.get("status"):
        status_parts.append(f"Infobox status: {infobox['status']}.")
    if mission.get("status_text"):
        status_parts.append(mission["status_text"])
    if status_text:
        status_parts.append(status_text)
    status_combined = _truncate(" ".join(status_parts))

    result: dict[str, dict[str, Any]] = {}
    for key, text in (
        ("what_is_it", what_is_it),
        ("how_it_works", how_it_works),
        ("why_important", why_important),
        ("status", status_combined),
    ):
        cleaned = _truncate(text)
        if len(cleaned) >= 120:
            completeness = "ok"
        elif cleaned:
            completeness = "partial"
        else:
            completeness = "missing"
        result[key] = {"body_text": cleaned or None, "completeness": completeness}
    return result


def extract_parts(wikitext: str, limit: int = 14) -> list[dict[str, Any]]:
    if not wikitext:
        return []

    blocks: list[tuple[str, str]] = []
    current_title = ""
    current_lines: list[str] = []
    for line in wikitext.splitlines():
        heading = re.match(r"^(={2,6})\s*(.+?)\s*\1\s*$", line.strip())
        if heading:
            if current_lines:
                blocks.append((current_title, "\n".join(current_lines)))
            current_title = heading.group(2).strip()
            current_lines = []
        else:
            current_lines.append(line)
    if current_lines:
        blocks.append((current_title, "\n".join(current_lines)))

    parts: list[dict[str, Any]] = []
    seen: set[str] = set()
    for title, block in blocks:
        if not DESIGN_PATTERNS.search(title):
            continue
        for raw_line in block.splitlines():
            line = raw_line.strip()
            if not line.startswith(("*", "#")):
                continue
            line = line.lstrip("*#").strip()
            if not line or len(line) < 4:
                continue
            # [[Link|Label]] / '''Bold''' / plain text, optionally followed by
            # an en dash, hyphen or colon and a purpose.
            purpose = ""
            split = re.split(r"\s+[–—-]\s+|:\s+", line, maxsplit=1)
            head = split[0]
            if len(split) > 1:
                purpose = split[1]
            link = re.search(r"\[\[([^|\]]+)(?:\|([^\]]+))?\]\]", head)
            if link:
                name = link.group(2) or link.group(1)
            else:
                name = re.sub(r"'''?", "", head)
            name = strip_wiki_markup(name).strip(" ,;")
            purpose = strip_wiki_markup(purpose).strip()
            if not name or len(name) > 120:
                continue
            key = name.lower()
            if key in seen:
                continue
            seen.add(key)
            parts.append(
                {
                    "part_name": name,
                    "purpose": purpose or None,
                    "sort_order": len(parts) + 1,
                }
            )
            if len(parts) >= limit:
                return parts
    return parts


INFOBOX_PART_KEYS = (
    "instruments",
    "instrument",
    "payload",
    "power",
    "batteries",
    "solar array",
    "mass",
    "launch mass",
    "dry mass",
    "dimensions",
    "design life",
    "telescope",
    "wavelengths",
    "transponders",
    "camera",
)


def parts_from_infobox(infobox: dict[str, str], limit: int = 10) -> list[dict[str, Any]]:
    """Use real infobox fields as a fallback for section 2 (no invention)."""
    parts: list[dict[str, Any]] = []
    for key in INFOBOX_PART_KEYS:
        value = (infobox.get(key) or "").strip()
        if not value or len(value) < 3:
            continue
        parts.append(
            {
                "part_name": key.title(),
                "purpose": value[:1000],
                "sort_order": len(parts) + 1,
            }
        )
        if len(parts) >= limit:
            break
    return parts


def _infer_event_type(text: str) -> str:
    lowered = text.lower()
    if "launch" in lowered:
        return "launch"
    if "land" in lowered or "touchdown" in lowered:
        return "landing"
    if "impact" in lowered:
        return "impact"
    if "flyby" in lowered or "flew by" in lowered or "encounter" in lowered:
        return "flyby"
    if "orbit" in lowered:
        return "orbit_insertion"
    if "interstellar" in lowered:
        return "interstellar_space"
    if "lost contact" in lowered or "loss of contact" in lowered:
        return "lost_contact"
    if "retire" in lowered or "decommission" in lowered:
        return "retirement"
    if "end" in lowered:
        return "end_of_mission"
    if "discover" in lowered or "detected" in lowered or "found" in lowered:
        return "discovery"
    return "event"


def build_timeline(mission: dict[str, Any], wiki: dict[str, Any], limit: int = 24) -> list[dict[str, Any]]:
    """Merge registry key dates with dated events found in the Wikipedia text."""
    events: list[dict[str, Any]] = []

    def add(date_value: str | None, title: str, description: str, event_type: str) -> None:
        if not date_value or not title:
            return
        normalized, precision = normalize_date(date_value)
        if not normalized:
            return
        events.append(
            {
                "event_date": normalized,
                "event_date_precision": precision,
                "title": title[:255],
                "description": description or None,
                "event_type": event_type,
            }
        )

    add(mission.get("launch_date"), "Launch", mission.get("status_text", ""), "launch")
    if mission.get("landing_date"):
        add(
            mission["landing_date"],
            "Landing / arrival / key date",
            mission.get("status_text", ""),
            "landing",
        )
    if mission.get("end_date"):
        add(mission["end_date"], "End of mission", mission.get("status_text", ""), "end_of_mission")

    extract = wiki.get("page", {}).get("extract") or ""
    for secondary in wiki.get("secondary_pages") or []:
        extract += "\n" + (secondary.get("extract") or "")

    sentences = re.split(r"(?<=[.!?])\s+", extract)
    for sentence in sentences:
        sentence = _clean(sentence)
        if len(sentence) < 30 or len(sentence) > 320:
            continue
        if not EVENT_KEYWORDS.search(sentence):
            continue
        # Prefer the clause that actually contains both the date and the
        # event verb, so long sentences do not mis-date unrelated events.
        clauses = [c.strip() for c in re.split(r"(?<=[;,])\s+", sentence) if c.strip()]
        candidate = next(
            (
                clause
                for clause in clauses
                if normalize_date(clause)[0] and EVENT_KEYWORDS.search(clause)
            ),
            sentence,
        )
        date_value, _ = normalize_date(candidate)
        if not date_value:
            date_value, _ = normalize_date(sentence)
        if not date_value:
            continue
        title = candidate
        if len(title) > 120:
            title = title[:117].rsplit(" ", 1)[0] + "..."
        add(date_value, title, candidate, _infer_event_type(candidate))
        if len(events) >= limit * 2:
            break

    # Deduplicate on date + normalised title prefix.
    deduped: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for event in events:
        key = (event["event_date"], re.sub(r"\W+", "", event["title"].lower())[:60])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(event)

    deduped.sort(key=lambda item: (item["event_date"], item["title"]))
    for index, event in enumerate(deduped[:limit], start=1):
        event["sort_order"] = index
    return deduped[:limit]


def build_stakeholders(mission: dict[str, Any], wiki: dict[str, Any]) -> list[dict[str, str]]:
    infobox = wiki.get("infobox") or {}
    stakeholders: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    def add(name: str | None, role: str) -> None:
        name = _clean(name)
        if not name:
            return
        key = (name.lower(), role.lower())
        if key in seen:
            return
        seen.add(key)
        stakeholders.append({"name": name, "role": role})

    add(mission.get("operator") or mission.get("agency"), "Operator")
    add(mission.get("manufacturer"), "Manufacturer")
    add(mission.get("agency"), "Mission agency")
    add(infobox.get("operator"), "Operator (Wikipedia infobox)")
    add(infobox.get("manufacturer"), "Manufacturer (Wikipedia infobox)")
    add(infobox.get("launch contractor"), "Launch provider (Wikipedia infobox)")
    add(infobox.get("contractor"), "Contractor (Wikipedia infobox)")
    return stakeholders


def build_sources(mission: dict[str, Any], wiki: dict[str, Any]) -> list[dict[str, Any]]:
    sources: list[dict[str, Any]] = []
    seen: set[str] = set()

    def add(label: str, url: str, source_type: str) -> None:
        if not url or url in seen:
            return
        seen.add(url)
        sources.append({"label": label, "url": url, "source_type": source_type})

    for source in mission.get("sources") or []:
        add(source.get("label"), source.get("url"), source.get("source_type", "reference"))

    page = wiki.get("page") or {}
    if page.get("page_url"):
        add(f"Wikipedia - {page.get('title')}", page["page_url"], "wikipedia")

    nssdca_id = mission.get("nssdca_id")
    if nssdca_id:
        add(
            f"NASA NSSDCA - {mission.get('name')}",
            f"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id={nssdca_id}",
            "archive",
        )
    return sources


def build_images(mission: dict[str, Any], wiki: dict[str, Any], limit: int = 10) -> list[dict[str, Any]]:
    images: list[dict[str, Any]] = []
    seen: set[str] = set()
    for image in wiki.get("images") or []:
        url = clean_media_url(image.get("url"))
        if not url or url in seen:
            continue
        seen.add(url)
        thumb = clean_media_url(image.get("thumb_url")) or url
        kind = image.get("kind") or "photo"
        images.append(
            {
                "title": image.get("name") or f"{mission.get('name')} image",
                "description": image.get("artist") or None,
                "image_url": thumb,
                "thumbnail_url": thumb,
                "source_url": image.get("description_url") or url,
                "attribution": image.get("artist") or "Wikipedia / Wikimedia Commons",
                "credit": image.get("artist") or "Wikipedia / Wikimedia Commons",
                "license": image.get("license"),
                "kind": kind,
                "item_type": kind.replace("_", " ").title(),
                "width": image.get("width"),
                "height": image.get("height"),
                "sort_order": len(images) + 1,
            }
        )
        if len(images) >= limit:
            break
    return images
