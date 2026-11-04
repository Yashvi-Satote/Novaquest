"""Extract the 20 NASA Space Apps focus missions from the committed PDF.

The output (backend/data/missions_extracted.json) is the seed file used by
seed_missions.py.  It is intentionally checked in so teammates do not need the
PDF or network access to rebuild the hardware database.

Usage:
    python backend/extract_missions_pdf.py
"""

from __future__ import annotations

import bisect
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

import pdfplumber

BACKEND_DIR = Path(__file__).resolve().parent
PDF_PATH = BACKEND_DIR.parent / "docs" / "NASA_Space_Apps_20_Focus_Missions.pdf"
OUT_PATH = BACKEND_DIR / "data" / "missions_extracted.json"

FACT_LABELS = [
    "Entered interstellar space",
    "Separated from Rosetta",
    "Arrival at 67P",
    "Closest approach",
    "Orbit insertion",
    "End of mission",
    "Pluto flyby",
    "Arrokoth flyby",
    "Saturn orbit",
    "Huygens on Titan",
    "Jupiter arrival",
    "Extended mission",
    "Surface life",
    "Neptune flyby",
    "First landing",
    "Total distance",
    "Crew size",
    "Follow-up",
    "Touchdown",
    "Last contact",
    "Distance",
    "Flights",
    "Launched",
    "Landed",
    "Target",
    "Status",
    "Type",
    "Used on",
    "Mass",
    "Impact",
    "Top speed",
]
FACT_LABELS.sort(key=len, reverse=True)

CATEGORY_BY_NAME = {
    "Surveyor 1": "Moon",
    "Surveyor 3": "Moon",
    "Apollo Lunar Module (LM) Components": "Moon",
    "Apollo Lunar Roving Vehicle (LRV)": "Moon",
    "Luna 17 / Lunokhod 1": "Moon",
    "Opportunity (Mars Exploration Rover B)": "Mars",
    "Perseverance / Ingenuity": "Mars",
    "Mars Pathfinder / Sojourner": "Mars",
    "Parker Solar Probe": "Deep Space",
    "MESSENGER": "Deep Space",
    "New Horizons": "Deep Space",
    "Cassini-Huygens": "Deep Space",
    "Galileo": "Deep Space",
    "Juno": "Deep Space",
    "Venera 13": "Deep Space",
    "Voyager 2": "Deep Space",
    "Rosetta (Comet 67P Orbiter)": "Deep Space",
    "DART (Double Asteroid Redirection Test)": "Deep Space",
    "Voyager 1": "Deep Space",
    "Philae (Comet 67P Lander)": "Deep Space",
}

SLUG_BY_NAME = {
    "Surveyor 1": "surveyor-1",
    "Surveyor 3": "surveyor-3",
    "Apollo Lunar Module (LM) Components": "apollo-lunar-module",
    "Apollo Lunar Roving Vehicle (LRV)": "apollo-lunar-roving-vehicle",
    "Luna 17 / Lunokhod 1": "luna-17-lunokhod-1",
    "Opportunity (Mars Exploration Rover B)": "opportunity",
    "Perseverance / Ingenuity": "perseverance-ingenuity",
    "Mars Pathfinder / Sojourner": "mars-pathfinder-sojourner",
    "Parker Solar Probe": "parker-solar-probe",
    "MESSENGER": "messenger",
    "New Horizons": "new-horizons",
    "Cassini-Huygens": "cassini-huygens",
    "Galileo": "galileo",
    "Juno": "juno",
    "Venera 13": "venera-13",
    "Voyager 2": "voyager-2",
    "Rosetta (Comet 67P Orbiter)": "rosetta",
    "DART (Double Asteroid Redirection Test)": "dart",
    "Voyager 1": "voyager-1",
    "Philae (Comet 67P Lander)": "philae",
}

NON_NASA_NAMES = {
    "Luna 17 / Lunokhod 1",
    "Venera 13",
    "Rosetta (Comet 67P Orbiter)",
    "Philae (Comet 67P Lander)",
}


def clean(text: str) -> str:
    return " ".join((text or "").replace("\u00ad", "").split())


def parse_fact(text: str) -> tuple[str, str]:
    """Split a key-fact row into (label, value), preserving PDF wording."""
    text = clean(text.replace("\n", " "))
    if not text:
        return "", ""

    # Two rows in the PDF put the final word of the label after the date.
    m = re.match(r"^Entered interstellar\s+(.+?)\s+space$", text)
    if m:
        return "Entered interstellar space", m.group(1).strip()
    m = re.match(r"^Separated from\s+(.+?)\s+Rosetta$", text)
    if m:
        return "Separated from Rosetta", m.group(1).strip()

    for label in FACT_LABELS:
        if text == label:
            return label, ""
        if text.startswith(label + " "):
            return label, text[len(label):].strip()

    parts = text.split(" ", 1)
    return parts[0], parts[1] if len(parts) > 1 else ""


def words_by_line(page, y_min: float = 0, y_max: float = 10_000):
    """Group pdfplumber words into visual lines (top coordinate)."""
    groups: dict[float, list] = {}
    for word in page.extract_words(use_text_flow=False):
        if word["top"] < y_min or word["top"] > y_max:
            continue
        key = round(word["top"] / 2.0) * 2.0
        groups.setdefault(key, []).append(word)
    for key in sorted(groups):
        yield key, sorted(groups[key], key=lambda w: w["x0"])


def line_text(words) -> str:
    return clean(" ".join(w["text"] for w in words))


def extract_header_facts(page):
    tables = page.extract_tables() or []
    for table in tables:
        rows = [clean(r[0]) for r in table if r and r[0] and clean(r[0])]
        if rows and any(r.startswith("Target") for r in rows):
            facts = []
            for row in rows:
                # Stop if table detection wandered into the diagram.
                if row.upper() == row and len(row.split()) <= 3:
                    break
                label, value = parse_fact(row)
                if label:
                    facts.append({"label": label, "value": value})
            return facts
    return []


def extract_diagram_labels(page, mission_name: str):
    heading = mission_name.upper()
    all_lines = list(words_by_line(page))
    title_top = None
    simplified_top = None
    for top, words in all_lines:
        text = line_text(words)
        if text.upper() == heading:
            title_top = top
        if text.startswith("Simplified schematic"):
            simplified_top = top
            break
    if title_top is None or simplified_top is None or simplified_top <= title_top:
        return []

    labels = []
    for top, words in all_lines:
        if top <= title_top or top >= simplified_top:
            continue
        # Cluster words separated by a large horizontal gap into separate labels.
        clusters = []
        current = [words[0]]
        for word in words[1:]:
            if word["x0"] - current[-1]["x1"] > 18:
                clusters.append(current)
                current = [word]
            else:
                current.append(word)
        clusters.append(current)
        for cluster in clusters:
            text = line_text(cluster)
            if text:
                labels.append(text)
    return labels


def extract_section_text(page, start_marker: str, end_marker: str | None):
    text = page.extract_text() or ""
    start = text.find(start_marker)
    if start < 0:
        return ""
    start += len(start_marker)
    end = len(text)
    if end_marker:
        pos = text.find(end_marker, start)
        if pos >= 0:
            end = pos
    else:
        footer = text.find("NASA Space Apps - Focus Missions Guide Page", start)
        if footer >= 0:
            end = footer
    return text[start:end].strip()


def extract_bullets(block: str):
    bullets = []
    for raw in block.splitlines():
        line = raw.strip()
        if not line or line.startswith("NASA Space Apps - Focus Missions Guide"):
            continue
        if line.startswith("(cid:127)"):
            bullets.append(clean(line[len("(cid:127)"):]))
        elif bullets:
            bullets[-1] = clean(bullets[-1] + " " + line)
    return bullets


def extract_parts(page):
    text = page.extract_text() or ""
    start = text.find("3. PART NAMES AND THEIR PURPOSE")
    end = text.find("4. TOP 10 PEOPLE WHO DEVELOPED IT")
    if start < 0 or end < 0:
        return []
    # Use word coordinates: left column is the part name, right column the purpose.
    all_lines = list(words_by_line(page))
    start_top = end_top = None
    for top, words in all_lines:
        t = line_text(words)
        if t.startswith("3. PART NAMES"):
            start_top = top
        if t.startswith("4. TOP 10 PEOPLE"):
            end_top = top
            break
    if start_top is None or end_top is None:
        return []

    # Horizontal rules delimit table rows.  A part name can wrap onto a second
    # line; both lines belong to the same rule-bounded band and must be joined.
    row_edges = sorted(
        {
            round(shape["top"], 1)
            for shape in page.lines
            if abs(shape["top"] - shape["bottom"]) < 1.0
            and start_top - 1 <= shape["top"] <= end_top + 1
        }
    )

    def band_for(top: float) -> int:
        return bisect.bisect_right(row_edges, top) - 1

    parts = []
    current = None
    current_band = None
    for top, words in all_lines:
        if top <= start_top + 8 or top >= end_top - 2:
            continue
        left = [w for w in words if w["x0"] < 200]
        right = [w for w in words if w["x0"] >= 200]
        if not left and not right:
            continue
        left_text = line_text(left)
        right_text = line_text(right)
        if left_text.lower().startswith("part / instrument"):
            continue
        band = band_for(top)
        if left_text:
            if current is None or band != current_band:
                current = {"part": left_text, "purpose": right_text}
                parts.append(current)
                current_band = band
            else:
                current["part"] = clean(current["part"] + " " + left_text)
                if right_text:
                    current["purpose"] = clean(current["purpose"] + " " + right_text)
        elif right_text and current is not None:
            current["purpose"] = clean(current["purpose"] + " " + right_text)
    return [p for p in parts if p["part"]]


def extract_people(page):
    block = extract_section_text(page, "4. TOP 10 PEOPLE WHO DEVELOPED IT", None)
    entries = extract_bullets(block)
    people = []
    for rank, entry in enumerate(entries, start=1):
        if " - " in entry:
            name, role = entry.split(" - ", 1)
        else:
            name, role = entry, ""
        people.append(
            {
                "rank": rank,
                "name": clean(name),
                "role_affiliation": clean(role),
            }
        )
    return people


def extract_links(page):
    tables = page.extract_tables() or []
    rows = []
    for table in tables:
        for row in table:
            if not row or not row[0]:
                continue
            left = clean(str(row[0]).replace("\n", " "))
            right = "\n".join(str(c) for c in row[1:] if c)
            if left.startswith("Official site") or left.startswith("NASA archive record") or left.startswith("API "):
                rows.append((left, right))

    links = []
    wiki_title = None
    model_keyword = None
    api1_url = None
    api2_url = None

    for left, right in rows:
        lines = [line.strip() for line in right.splitlines() if line.strip()]
        url = None
        before_url = ""
        for index, line in enumerate(lines):
            match = re.search(r"https?://\S+", line)
            if not match:
                continue
            before_url = clean(" ".join(lines[:index]))
            url = match.group(0)
            # A URL wrapped by the PDF continues on the next line with no spaces.
            for continuation in lines[index + 1:]:
                if continuation and " " not in continuation and not continuation.startswith("."):
                    url += continuation
                else:
                    break
            break
        if not url:
            continue
        url = url.rstrip(".,;")

        if left.startswith("API 1"):
            label = "API 1 - mission details"
            source_type = "api"
            api1_url = url
            query = parse_qs(urlparse(url).query)
            if query.get("titles"):
                wiki_title = unquote(query["titles"][0])
        elif left.startswith("API 2"):
            label = "API 2 - 3D model files"
            source_type = "api"
            api2_url = url
            kw = re.search(r'contains\s+"([^"]+)"', right, re.IGNORECASE)
            if kw:
                model_keyword = kw.group(1)
        elif left.startswith("NASA archive record"):
            label = "NASA archive record"
            source_type = "archive"
        else:
            label = before_url or "Official site"
            source_type = "archive" if "nssdca" in label.lower() else "official"

        links.append({"label": label, "url": url, "source_type": source_type})

    return links, wiki_title, model_keyword, api1_url, api2_url


def extract_mission(first_page, second_page, number: int, destination_marker: str):
    text = first_page.extract_text() or ""
    lines = [clean(line) for line in text.splitlines() if clean(line)]
    marker = f"MISSION {number} OF 20"
    marker_index = next(i for i, line in enumerate(lines) if line.startswith(marker))
    name = lines[marker_index + 1]
    agency = lines[marker_index + 2]

    facts = extract_header_facts(first_page)
    purpose = clean(
        extract_section_text(
            first_page,
            "1. MISSION PURPOSE",
            "2. MISSION RESULTS AND DISCOVERIES",
        )
    )
    results_block = extract_section_text(
        first_page, "2. MISSION RESULTS AND DISCOVERIES", None
    )
    results = extract_bullets(results_block)
    parts = extract_parts(second_page)
    people = extract_people(second_page)
    links, wiki_title, model_keyword, api1_url, api2_url = extract_links(first_page)
    diagram_labels = extract_diagram_labels(first_page, name)

    destination = destination_marker.title().replace(" And ", " and ")
    return {
        "number": number,
        "name": name,
        "destination": destination,
        "agency": agency,
        "slug": SLUG_BY_NAME.get(name, re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")),
        "category": CATEGORY_BY_NAME.get(name, "Deep Space"),
        "is_nasa_mission": name not in NON_NASA_NAMES,
        "header_facts": facts,
        "purpose": purpose,
        "results": results,
        "parts": parts,
        "people": people,
        "links": links,
        "diagram_labels": diagram_labels,
        "model_keyword": model_keyword,
        "wiki_title": wiki_title,
        "api1_url": api1_url,
        "api2_url": api2_url,
    }


def main():
    if not PDF_PATH.exists():
        raise SystemExit(f"PDF not found: {PDF_PATH}")

    missions = []
    with pdfplumber.open(PDF_PATH) as pdf:
        for number in range(1, 21):
            first_page = pdf.pages[2 * number]      # page 3 is index 2 for mission 1
            second_page = pdf.pages[2 * number + 1]
            text = first_page.extract_text() or ""
            header = next(
                line for line in text.splitlines() if line.startswith(f"MISSION {number} OF 20")
            )
            destination_marker = header.split("|", 1)[1].strip()
            missions.append(extract_mission(first_page, second_page, number, destination_marker))

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(missions, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {len(missions)} missions to {OUT_PATH}")
    print(f"{'#':>2} {'Mission':38} {'Parts':>5} {'Results':>7} {'People':>6} {'Links':>5} {'Diag':>4} {'Keyword':<22}")
    warnings = []
    for m in missions:
        print(
            f"{m['number']:>2} {m['name'][:38]:38} {len(m['parts']):>5} {len(m['results']):>7} "
            f"{len(m['people']):>6} {len(m['links']):>5} {len(m['diagram_labels']):>4} {str(m['model_keyword']):<22}"
        )
        if len(m["people"]) != 10:
            warnings.append(f"{m['name']}: {len(m['people'])} people")
        if len(m["parts"]) < 3:
            warnings.append(f"{m['name']}: only {len(m['parts'])} parts")
        if not m["results"]:
            warnings.append(f"{m['name']}: no results")
        if not m["purpose"]:
            warnings.append(f"{m['name']}: no purpose")
        if not m["links"]:
            warnings.append(f"{m['name']}: no links")
        if not m["model_keyword"]:
            warnings.append(f"{m['name']}: no model keyword")
        if not m["wiki_title"]:
            warnings.append(f"{m['name']}: no wiki title")
    if warnings:
        print("\nWARNINGS:")
        for warning in warnings:
            print(" -", warning)
    else:
        print("\nNo structural warnings.")


if __name__ == "__main__":
    main()
