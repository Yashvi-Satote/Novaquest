"""NovaBase database bootstrap.

Examples (PowerShell, from the repository root):

    .venv\\Scripts\\python.exe -m backend.NovaBase.init_db --bootstrap
    .venv\\Scripts\\python.exe -m backend.NovaBase.init_db --schema-only
    .venv\\Scripts\\python.exe -m backend.NovaBase.init_db --ingest-only
    .venv\\Scripts\\python.exe -m backend.NovaBase.init_db --reset

The default path never drops tables.  ``--reset`` asks for confirmation.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

# Allow both `python -m backend.NovaBase.init_db` and
# `python backend/NovaBase/init_db.py` from the repository root.
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR.parent / ".env")
load_dotenv()

from Shared.database import IS_POSTGRES, SessionLocal, engine, get_db_status  # noqa: E402
from NovaBase.completeness import health_payload  # noqa: E402
from NovaBase.ingest import ingest_registry, load_registry, rebuild_one, registry_slugs  # noqa: E402
from NovaBase.providers.nasa_3d import Nasa3DProvider  # noqa: E402
from NovaBase.providers.wikipedia import WikipediaProvider  # noqa: E402
from NovaBase.schema_tools import bootstrap_schema  # noqa: E402

LINE = "=" * 74


def _print_header() -> None:
    status = get_db_status()
    print(LINE)
    print("NovaBase - space hardware database bootstrap")
    print(LINE)
    print(f"Engine            : {status['engine']}")
    print(f"PostgreSQL primary: {status['is_postgres']}")
    print(f"Connection        : {status['status']}")
    print(f"Note              : {status['message']}")
    print("-" * 74)


def _confirm_reset(assume_yes: bool) -> bool:
    if assume_yes:
        return True
    print("!! --reset will DROP every NovaBase table and re-ingest from the registry.")
    answer = input("Type RESET to continue: ").strip()
    return answer == "RESET"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Bootstrap the NovaBase database.")
    parser.add_argument("--bootstrap", action="store_true", help="Create/apply schema and ingest (default).")
    parser.add_argument("--schema-only", action="store_true", help="Apply schema but do not fetch APIs.")
    parser.add_argument("--ingest-only", action="store_true", help="Skip schema application and only ingest.")
    parser.add_argument("--reset", action="store_true", help="Drop all NovaBase tables first (destructive).")
    parser.add_argument("--yes", action="store_true", help="Skip the --reset confirmation prompt.")
    parser.add_argument("--slug", help="Re-ingest one registry slug instead of all 20.")
    parser.add_argument("--skip-people-wiki", action="store_true", help="Do not look up Wikipedia pages for people.")
    parser.add_argument("--no-cache", action="store_true", help="Ignore the provider disk cache.")
    parser.add_argument("--quiet", action="store_true", help="Only print the final summary.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if not args.quiet:
        _print_header()

    if args.reset and not _confirm_reset(args.yes):
        print("Reset cancelled.")
        return 1

    if not args.ingest_only:
        try:
            info = bootstrap_schema(engine, reset=args.reset)
        except Exception as exc:
            print(f"Schema bootstrap failed: {exc}")
            return 2
        if not args.quiet:
            print(
                f"Schema applied: {info['statements_executed']} statements, "
                f"{info['columns_added']} columns added, version {info['schema_version']}"
            )

    registry = load_registry()
    expected = registry_slugs(registry)

    if args.schema_only:
        print("\nSchema ready. Ingestion skipped (--schema-only).")
        return 0

    wikipedia = WikipediaProvider(use_cache=not args.no_cache)
    nasa3d = Nasa3DProvider(use_cache=not args.no_cache)

    def progress(index: int, total: int, slug: str) -> None:
        if not args.quiet:
            print(f"[{index:02d}/{total:02d}] ingesting {slug} ...", flush=True)

    with SessionLocal() as session:
        try:
            if args.slug:
                stats = rebuild_one(session, args.slug, wikipedia, nasa3d, not args.skip_people_wiki)
                totals = {"missions_processed": 1, "errors": stats.get("errors", [])}
            else:
                totals = ingest_registry(
                    session,
                    registry=registry,
                    wikipedia=wikipedia,
                    nasa3d=nasa3d,
                    people_lookup=not args.skip_people_wiki,
                    progress=progress,
                )
        except Exception as exc:
            print(f"Ingestion failed: {exc}")
            return 3

        health = health_payload(session, expected_slugs=expected)

    print("\n" + LINE)
    print("INGESTION SUMMARY")
    print(LINE)
    print(f"Missions processed : {totals.get('missions_processed', 0)}")
    print(f"Missions failed    : {totals.get('missions_failed', 0)}")
    for key in ("content", "parts", "images", "sources", "timeline", "stakeholders", "models", "people"):
        print(f"{key.title():<19}: {totals.get(key, 0)}")
    print(f"Spacecraft in DB   : {health['total_spacecraft']}")
    print(f"Fully complete     : {health['complete_spacecraft']}/{health['total_spacecraft']}")
    print(f"Missing seed slugs : {', '.join(health['missing_seed_missions']) or 'none'}")
    if totals.get("errors"):
        print("\nWarnings:")
        for error in totals["errors"][:20]:
            print(f"  - {error}")
    print(LINE)
    print("Next: python -m backend.NovaBase.verify_db")
    return 0 if not totals.get("missions_failed") else 4


if __name__ == "__main__":
    raise SystemExit(main())
