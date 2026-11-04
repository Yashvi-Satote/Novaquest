"""Shared HTTP provider plumbing: retries, backoff, disk cache, User-Agent."""
from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from pathlib import Path
from typing import Any

import requests

logger = logging.getLogger(__name__)

DEFAULT_CACHE_DIR = Path(__file__).resolve().parent.parent / "data" / "cache"
DEFAULT_CONTACT = "cosmic-timekeepers@users.noreply.github.com"
DEFAULT_USER_AGENT = "CosmicTimekeepers-NovaBase/1.0 (contact: {email})"


class ProviderError(RuntimeError):
    """Raised when a provider cannot return usable data."""


def _user_agent() -> str:
    email = os.getenv("NOVABASE_CONTACT_EMAIL", "").strip() or DEFAULT_CONTACT
    template = os.getenv("NOVABASE_USER_AGENT", DEFAULT_USER_AGENT)
    return template.format(email=email)


class BaseProvider:
    """Base class for API providers.

    Subclasses only need to implement their public ``fetch_*`` methods and use
    ``self.get_json`` for transport so retries, caching and rate-limit handling
    are consistent.
    """

    name = "base"
    timeout = 25
    max_retries = 4

    def __init__(self, cache_dir: str | os.PathLike | None = None, use_cache: bool = True):
        self.cache_dir = Path(cache_dir) if cache_dir else DEFAULT_CACHE_DIR / self.name
        self.use_cache = use_cache
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": _user_agent(),
                "Accept": "application/json",
            }
        )

    # ------------------------------------------------------------------
    # Cache helpers
    # ------------------------------------------------------------------
    def cache_path(self, key: str) -> Path:
        digest = hashlib.sha256(key.encode("utf-8")).hexdigest()[:24]
        return self.cache_dir / f"{digest}.json"

    def read_cache(self, key: str) -> Any | None:
        if not self.use_cache:
            return None
        path = self.cache_path(key)
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.debug("Ignoring unreadable cache %s: %s", path, exc)
            return None

    def write_cache(self, key: str, payload: Any) -> None:
        if not self.use_cache:
            return
        try:
            self.cache_path(key).write_text(
                json.dumps(payload, ensure_ascii=False), encoding="utf-8"
            )
        except Exception as exc:  # pragma: no cover - disk issues
            logger.debug("Could not write cache %s: %s", key, exc)

    # ------------------------------------------------------------------
    # HTTP
    # ------------------------------------------------------------------
    def get_json(
        self,
        url: str,
        params: dict[str, Any] | None = None,
        *,
        cache_key: str | None = None,
        force: bool = False,
        headers: dict[str, str] | None = None,
    ) -> Any:
        if cache_key and not force:
            cached = self.read_cache(cache_key)
            if cached is not None:
                return cached

        last_error: Exception | None = None
        for attempt in range(self.max_retries + 1):
            try:
                response = self.session.get(
                    url, params=params, headers=headers, timeout=self.timeout
                )

                if response.status_code in (403, 429) or response.status_code >= 500:
                    retry_after = response.headers.get("Retry-After")
                    if retry_after:
                        try:
                            delay = max(1.0, float(retry_after))
                        except ValueError:
                            delay = 2.0 ** attempt
                    else:
                        delay = 2.0 ** attempt
                    logger.warning(
                        "%s returned HTTP %s; retrying in %.1fs (attempt %s/%s)",
                        url,
                        response.status_code,
                        delay,
                        attempt + 1,
                        self.max_retries + 1,
                    )
                    last_error = ProviderError(f"HTTP {response.status_code} for {url}")
                    if attempt < self.max_retries:
                        time.sleep(min(delay, 30))
                        continue
                    raise last_error

                response.raise_for_status()
                payload = response.json()
                if cache_key:
                    self.write_cache(cache_key, payload)
                return payload

            except (requests.Timeout, requests.ConnectionError) as exc:
                last_error = exc
                if attempt < self.max_retries:
                    delay = min(2.0 ** attempt, 30)
                    logger.warning("Network error for %s; retrying in %.1fs: %s", url, delay, exc)
                    time.sleep(delay)
                    continue
                raise ProviderError(f"Network error for {url}: {exc}") from exc
            except ValueError as exc:
                raise ProviderError(f"Invalid JSON from {url}: {exc}") from exc

        raise ProviderError(str(last_error) if last_error else f"Request failed: {url}")
