"""Deterministic parsing tests (no network)."""
from __future__ import annotations

from NovaBase.parsing import (
    build_content_sections,
    build_stakeholders,
    build_timeline,
    extract_parts,
    normalize_date,
    parts_from_infobox,
    strip_wiki_markup,
)


def test_strip_wiki_markup():
    assert strip_wiki_markup("[[Moon|the Moon]] '''landed'''") == "the Moon landed"


def test_normalize_date_variants():
    assert normalize_date("30 May 1966")[0] == "1966-05-30"
    assert normalize_date("May 30, 1966")[0] == "1966-05-30"
    assert normalize_date("1966-05-30")[0] == "1966-05-30"
    assert normalize_date("January 1967")[0] == "1967-01"
    assert normalize_date("no date here")[0] is None


def test_extract_parts_from_wikitext():
    wikitext = (
        "== Design and instruments ==\n"
        "* Television camera – returned lunar surface images\n"
        "* Retrorocket – slowed the lander for touchdown\n"
    )
    parts = extract_parts(wikitext)
    assert [p["part_name"] for p in parts] == ["Television camera", "Retrorocket"]
    assert parts[0]["purpose"] == "returned lunar surface images"


def test_parts_from_infobox_fallback_uses_real_values():
    parts = parts_from_infobox({"power": "Solar panels and batteries", "mass": "995 kg"})
    names = {p["part_name"] for p in parts}
    assert "Power" in names
    assert "Mass" in names


def test_content_sections_map_wikipedia_text():
    mission = {"status_text": "Contact ended in January 1967."}
    wiki = {
        "page": {"extract": "Surveyor 1 was a lunar lander."},
        "sections": [
            {"title": "", "text": "Surveyor 1 was a lunar lander."},
            {
                "title": "Design and instruments",
                "text": "The spacecraft design used a retrorocket and a television camera.",
            },
            {
                "title": "Science results",
                "text": "The mission returned the first close-up photographs of the Moon.",
            },
            {
                "title": "Legacy and status",
                "text": "Contact ended in January 1967 after a successful mission.",
            },
        ],
        "infobox": {},
    }
    sections = build_content_sections(mission, wiki)
    assert sections["what_is_it"]["body_text"]
    assert sections["how_it_works"]["completeness"] in ("ok", "partial")
    assert sections["why_important"]["completeness"] in ("ok", "partial")
    assert sections["status"]["body_text"]


def test_build_timeline_uses_registry_dates():
    mission = {
        "launch_date": "1966-05-30",
        "landing_date": "1966-06-02",
        "end_date": "1967-01",
        "status_text": "Contact ended January 1967.",
    }
    wiki = {"page": {"extract": ""}, "secondary_pages": []}
    events = build_timeline(mission, wiki)
    dates = {event["event_date"] for event in events}
    assert {"1966-05-30", "1966-06-02", "1967-01"}.issubset(dates)


def test_build_stakeholders_deduplicates():
    mission = {"operator": "NASA", "manufacturer": "Hughes Aircraft", "agency": "NASA"}
    wiki = {"infobox": {"operator": "NASA"}}
    stakeholders = build_stakeholders(mission, wiki)
    pairs = {(s["name"], s["role"]) for s in stakeholders}
    assert ("NASA", "Operator") in pairs
    assert ("Hughes Aircraft", "Manufacturer") in pairs
