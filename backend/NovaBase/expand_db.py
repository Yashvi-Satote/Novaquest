"""Registry CLI for adding spacecraft without touching application code.

Examples (PowerShell, from the repository root):

    python -m backend.NovaBase.expand_db list
    python -m backend.NovaBase.expand_db show surveyor-1
    python -m backend.NovaBase.expand_db add --slug europa-clipper \
        --name "Europa Clipper" --wiki-title "Europa_Clipper" \
        --destination-category "Deep Space" --agency "NASA/JPL" \
        --object-type "Orbiter" --launch-date 2024-10-14 --apply
    python -m backend.NovaBase.expand_db remove europa-clipper --apply

``add`` only writes the curated registry entry.  ``--apply`` then runs the same
idempotent ingestion pipeline as ``init_db`` for that one entry, so adding
spacecraft #21 never requires a code change.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR.parent / ".env")
load_dotenv()

from NovaBase.ingest import REGISTRY_PATH, load_registry, rebuild_one, slugify  # noqa: E402


def save_registry(registry: dict[str, Any], path: Path | None = None) -> Path:
    target = Path(path) if path else REGISTRY_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(registry, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return target


def find_mission(registry: dict[str, Any], slug: str) -> dict[str, Any] | None:
    return next((m for m in registry["missions"] if m["slug"] == slug), None)


def cmd_list(args: argparse.Namespace) -> int:
    registry = load_registry()
    print(f"{'slug':<28} {'name':<34} {'category':<14} status")
    print("-" * 90)
    for mission in registry["missions"]:
        print(
            f"{mission['slug']:<28} {mission.get('name', ''):<34} "
            f"{mission.get('destination_category', ''):<14} {mission.get('status_label', '')}"
        )
    print("-" * 90)
    print(f"{len(registry['missions'])} spacecraft in {REGISTRY_PATH}")
    return 0


def cmd_show(args: argparse.Namespace) -> int:
    registry = load_registry()
    mission = find_mission(registry, args.slug)
    if mission is None:
        print(f"No registry entry for '{args.slug}'", file=sys.stderr)
        return 1
    print(json.dumps(mission, indent=2, ensure_ascii=False))
    return 0


def cmd_add(args: argparse.Namespace) -> int:
    registry = load_registry()
    slug = slugify(args.slug or args.name or "")
    if not slug or slug == "unknown":
        print("A --slug or --name is required.", file=sys.stderr)
        return 1
    if find_mission(registry, slug):
        print(f"'{slug}' already exists in the registry.", file=sys.stderr)
        return 1
    if not args.name or not args.wiki_title:
        print("--name and --wiki-title are required for a real-data entry.", file=sys.stderr)
        return 1

    people = []
    for entry in args.person or []:
        if "=" in entry:
            name, role = entry.split("=", 1)
        else:
            name, role = entry, ""
        if name.strip():
            people.append({"name": name.strip(), "role": role.strip()})

    sources = []
    for entry in args.source or []:
        if "=" in entry:
            label, url = entry.split("=", 1)
        else:
            label, url = entry, ""
        if url.strip():
            sources.append({"label": label.strip(), "url": url.strip(), "source_type": "reference"})

    nssdca_id = args.nssdca_id
    if nssdca_id and not any("nssdc.gsfc.nasa.gov" in s["url"] for s in sources):
        sources.insert(
            0,
            {
                "label": f"NASA NSSDCA - {args.name}",
                "url": f"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id={nssdca_id}",
                "source_type": "archive",
            },
        )
    wiki_url = "https://en.wikipedia.org/wiki/" + args.wiki_title.replace(" ", "_")
    if not any("wikipedia.org" in s["url"] for s in sources):
        sources.append(
            {
                "label": f"Wikipedia - {args.name}",
                "url": wiki_url,
                "source_type": "wikipedia",
            }
        )

    mission = {
        "slug": slug,
        "name": args.name,
        "display_name": args.display_name or args.name,
        "destination_category": args.destination_category,
        "destination": args.destination or args.destination_category,
        "mission_type": args.mission_type or args.object_type,
        "object_type": args.object_type,
        "agency": args.agency,
        "operator": args.operator or args.agency,
        "manufacturer": args.manufacturer or args.agency,
        "wiki_title": args.wiki_title,
        "secondary_wiki_titles": args.secondary_wiki_title or [],
        "nssdca_id": nssdca_id,
        "model_keywords": args.model_keyword or [],
        "model_include": [],
        "model_exclude": [],
        "model_overrides": [],
        "launch_date": args.launch_date,
        "landing_date": args.landing_date,
        "end_date": args.end_date,
        "status_label": args.status_label,
        "status_text": args.status_text or "",
        "mission_status": args.mission_status,
        "sources": sources,
        "people": people,
    }

    registry["missions"].append(mission)
    path = save_registry(registry)
    print(f"Added '{slug}' to {path} (now {len(registry['missions'])} entries).")
    if not people:
        print("Warning: no --person entries; section 10 will be incomplete.", file=sys.stderr)

    if not args.apply:
        print("Run again with --apply to ingest, or run: python -m backend.NovaBase.init_db --slug " + slug)
        return 0

    from Shared.database import SessionLocal
    from NovaBase.providers.nasa_3d import Nasa3DProvider
    from NovaBase.providers.wikipedia import WikipediaProvider

    with SessionLocal() as session:
        stats = rebuild_one(
            session,
            slug,
            WikipediaProvider(use_cache=not args.no_cache),
            Nasa3DProvider(use_cache=not args.no_cache),
            people_lookup=not args.skip_people_wiki,
        )
    print(json.dumps(stats, indent=2, ensure_ascii=False))
    return 0


def cmd_remove(args: argparse.Namespace) -> int:
    registry = load_registry()
    mission = find_mission(registry, args.slug)
    if mission is None:
        print(f"No registry entry for '{args.slug}'", file=sys.stderr)
        return 1
    registry["missions"] = [m for m in registry["missions"] if m["slug"] != args.slug]
    path = save_registry(registry)
    print(f"Removed '{args.slug}' from {path}. Existing database rows were left untouched.")
    if args.apply:
        print("Note: --apply does not delete database rows. Use init_db --reset for a rebuild.")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Add spacecraft to the NovaBase registry.")
    sub = parser.add_subparsers(dest="command", required=True)

    listing = sub.add_parser("list", help="List registry entries.")
    listing.set_defaults(func=cmd_list)

    show = sub.add_parser("show", help="Print one registry entry as JSON.")
    show.add_argument("slug")
    show.set_defaults(func=cmd_show)

    add = sub.add_parser("add", help="Add a spacecraft to the registry.")
    add.add_argument("--slug")
    add.add_argument("--name", required=True)
    add.add_argument("--display-name")
    add.add_argument("--wiki-title", required=True)
    add.add_argument("--secondary-wiki-title", action="append")
    add.add_argument("--destination-category", default="Deep Space")
    add.add_argument("--destination")
    add.add_argument("--object-type", default="Spacecraft")
    add.add_argument("--mission-type")
    add.add_argument("--agency", default="NASA")
    add.add_argument("--operator")
    add.add_argument("--manufacturer")
    add.add_argument("--nssdca-id")
    add.add_argument("--launch-date")
    add.add_argument("--landing-date")
    add.add_argument("--end-date")
    add.add_argument("--status-label", default="active")
    add.add_argument("--status-text", default="")
    add.add_argument("--mission-status", default="Active")
    add.add_argument("--model-keyword", action="append")
    add.add_argument("--person", action="append", metavar="NAME=ROLE")
    add.add_argument("--source", action="append", metavar="LABEL=URL")
    add.add_argument("--apply", action="store_true", help="Ingest immediately after writing the registry.")
    add.add_argument("--skip-people-wiki", action="store_true")
    add.add_argument("--no-cache", action="store_true")
    add.set_defaults(func=cmd_add)

    remove = sub.add_parser("remove", help="Remove a registry entry (database rows are kept).")
    remove.add_argument("slug")
    remove.add_argument("--apply", action="store_true")
    remove.set_defaults(func=cmd_remove)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
