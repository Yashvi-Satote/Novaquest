"""NovaBase completeness + link verification.

    python -m backend.NovaBase.verify_db
    python -m backend.NovaBase.verify_db --skip-network
    python -m backend.NovaBase.verify_db --json

Exit code is 0 when every spacecraft has all 10 sections, all 20 registry
slugs are present, and (unless --skip-network) every checked URL responds.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import requests

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR.parent / ".env")
load_dotenv()

from Shared.database import SessionLocal, get_db_status  # noqa: E402
from NovaBase.completeness import SECTION_DEFINITIONS, spacecraft_completeness  # noqa: E402
from NovaBase.ingest import load_registry, registry_slugs  # noqa: E402
from NovaBase.models import Spacecraft  # noqa: E402
from NovaBase.providers.base import _user_agent  # noqa: E402

URL_CHECK_UA = _user_agent()
URL_TIMEOUT = 30
URL_RETRIES = 3
RETRYABLE_STATUS = {408, 425, 429, 500, 502, 503, 504}


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _check_url(url: str, attempts: int = URL_RETRIES, timeout: int = URL_TIMEOUT) -> tuple[bool, int | None, str | None]:
    """Check a URL, retrying transient network errors and 429/5xx responses."""
    last_status: int | None = None
    last_error: str | None = None

    for attempt in range(attempts):
        try:
            # Wikimedia's CDN rejects HEAD requests from some clients with 403, so
            # use a streamed GET (the range header keeps the transfer tiny).
            response = requests.get(
                url,
                allow_redirects=True,
                timeout=timeout,
                stream=True,
                headers={
                    "User-Agent": URL_CHECK_UA,
                    "Range": "bytes=0-2047",
                    "Accept": "image/*,application/pdf,text/html;q=0.9,*/*;q=0.8",
                },
            )
            last_status = response.status_code
            response.close()
            if last_status in RETRYABLE_STATUS and attempt < attempts - 1:
                time.sleep(min(2 ** attempt, 8))
                continue
            return last_status < 400, last_status, None
        except requests.RequestException as exc:
            last_error = str(exc)[:160]
            if attempt < attempts - 1:
                time.sleep(min(2 ** attempt, 8))
                continue
            return False, None, last_error

    return False, last_status, last_error


def _verify_links(session, spacecraft: list[Spacecraft], per_type_limit: int = 3, max_workers: int = 8) -> list[dict]:
    jobs: list[tuple[str, Spacecraft, object, str]] = []
    for sc in spacecraft:
        for source in sc.sources or []:
            jobs.append(("source", sc, source, source.source_url))
        for image in list(sc.images or [])[:per_type_limit]:
            jobs.append(("image", sc, image, image.image_url))
        for model in [m for m in (sc.models or []) if m.status == "ok" and m.download_url][:per_type_limit]:
            jobs.append(("model", sc, model, model.download_url))

    def run(job):
        kind, sc, obj, url = job
        ok, status, error = _check_url(url)
        return kind, sc, obj, url, ok, status, error

    results: list[dict] = []
    # Network checks are independent, so run them concurrently; DB updates stay
    # on this thread to keep the SQLAlchemy session single-threaded.
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = [pool.submit(run, job) for job in jobs]
        for future in futures:
            kind, sc, obj, url, ok, status, error = future.result()
            if kind == "source":
                obj.verified = ok
                obj.http_status = status
                obj.last_checked = _utcnow()
                obj.last_checked_at = _utcnow().date().isoformat()
            results.append(
                {
                    "slug": sc.slug,
                    "kind": kind,
                    "url": url,
                    "ok": ok,
                    "http_status": status,
                    "error": error,
                }
            )
    session.commit()
    return results


def build_report(session, skip_network: bool, url_limit: int = 3) -> dict:
    registry = load_registry()
    expected = registry_slugs(registry)
    spacecraft = session.query(Spacecraft).order_by(Spacecraft.slug).all()
    by_slug = {sc.slug: sc for sc in spacecraft}

    per_spacecraft = []
    for sc in spacecraft:
        statuses = spacecraft_completeness(sc)
        people_count = statuses["people"]["count"]
        per_spacecraft.append(
            {
                "slug": sc.slug,
                "name": sc.display_name or sc.name,
                "sections": statuses,
                "populated_sections": sum(1 for s in statuses.values() if s["populated"]),
                "people_count": people_count,
                "people_complete": people_count >= 10,
            }
        )

    missing_seed = [slug for slug in expected if slug not in by_slug]
    incomplete = [item["slug"] for item in per_spacecraft if item["populated_sections"] < len(SECTION_DEFINITIONS)]
    people_short = [item["slug"] for item in per_spacecraft if not item["people_complete"]]

    link_results: list[dict] = []
    if not skip_network:
        link_results = _verify_links(session, spacecraft, per_type_limit=url_limit)

    broken_links = [item for item in link_results if not item["ok"]]

    passed = (
        not missing_seed
        and not incomplete
        and all(item["populated_sections"] == len(SECTION_DEFINITIONS) for item in per_spacecraft)
        and bool(spacecraft)
        and not broken_links
    )

    return {
        "passed": passed,
        "database": get_db_status(),
        "total_spacecraft": len(spacecraft),
        "expected_seed_missions": len(expected),
        "missing_seed_missions": missing_seed,
        "incomplete_spacecraft": incomplete,
        "people_under_10": people_short,
        "per_spacecraft": per_spacecraft,
        "url_checks": link_results,
        "broken_urls": broken_links,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


def print_table(report: dict) -> None:
    keys = [item["key"] for item in SECTION_DEFINITIONS]
    short = {
        "what_is_it": "1",
        "how_it_works": "2",
        "why_important": "3",
        "status": "4",
        "imagery": "5",
        "sources": "6",
        "timeline": "7",
        "stakeholders": "8",
        "model": "9",
        "people": "10",
    }
    header = f"{'slug':<28} " + " ".join(f"{short[k]:>2}" for k in keys) + "  people  result"
    print("=" * len(header))
    print(header)
    print("=" * len(header))
    for item in report["per_spacecraft"]:
        marks = []
        for key in keys:
            marks.append("ok" if item["sections"][key]["populated"] else "--")
        result = "PASS" if item["populated_sections"] == len(keys) else "FAIL"
        print(f"{item['slug']:<28} " + " ".join(f"{mark:>2}" for mark in marks) + f"  {item['people_count']:>6}  {result}")

    print("=" * len(header))
    print(f"Spacecraft: {report['total_spacecraft']}   Seed slugs expected: {report['expected_seed_missions']}")
    if report["missing_seed_missions"]:
        print(f"MISSING SEED SLUGS: {', '.join(report['missing_seed_missions'])}")
    if report["people_under_10"]:
        print(f"NOTE (not fatal): fewer than 10 people for: {', '.join(report['people_under_10'])}")
    if report["url_checks"]:
        checked = len(report["url_checks"])
        broken = len(report["broken_urls"])
        print(f"URL checks: {checked} checked, {broken} broken")
        for item in report["broken_urls"][:25]:
            print(f"  BROKEN {item['kind']:<6} {item['http_status']} {item['url']} {item['error'] or ''}")
    else:
        print("URL checks: skipped (--skip-network)")
    print("=" * len(header))
    print("RESULT:", "PASS" if report["passed"] else "FAIL")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify NovaBase completeness.")
    parser.add_argument("--skip-network", action="store_true", help="Do not check external URLs.")
    parser.add_argument("--json", action="store_true", help="Print the full report as JSON.")
    parser.add_argument("--url-limit", type=int, default=3, help="Image/model URLs checked per spacecraft.")
    args = parser.parse_args(argv)

    with SessionLocal() as session:
        report = build_report(session, skip_network=args.skip_network, url_limit=args.url_limit)

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print_table(report)

    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
