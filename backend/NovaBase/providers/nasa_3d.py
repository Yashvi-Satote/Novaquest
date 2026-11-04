"""NASA 3D Resources provider (GitHub Git Trees API)."""
from __future__ import annotations

import logging
import os
import re
from typing import Any
from urllib.parse import quote

from .base import BaseProvider, ProviderError

logger = logging.getLogger(__name__)

NASA_3D_TREE = "https://api.github.com/repos/nasa/NASA-3D-Resources/git/trees/master?recursive=1"
NASA_3D_CONTENTS = "https://api.github.com/repos/nasa/NASA-3D-Resources/contents/3D%20Models"
NASA_3D_RAW = "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/"
NASA_3D_LICENSE = "NASA 3D resources are free to use without copyright"
VIEWER_FALLBACK = "https://eyes.nasa.gov/apps/solar-system/"

SUPPORTED_FORMATS = (".glb", ".gltf", ".stl", ".blend", ".obj", ".3mf")


def _word_pattern(keyword: str) -> re.Pattern[str]:
    escaped = re.escape(keyword.strip())
    return re.compile(rf"(?<![A-Za-z0-9]){escaped}(?![A-Za-z0-9])", re.IGNORECASE)


class Nasa3DProvider(BaseProvider):
    name = "nasa_3d"

    def _headers(self) -> dict[str, str]:
        token = os.getenv("GITHUB_TOKEN", "").strip()
        if token:
            return {"Authorization": f"Bearer {token}"}
        return {}

    def fetch_tree(self, force: bool = False) -> dict[str, Any]:
        cache_key = "tree:master"
        try:
            return self.get_json(
                NASA_3D_TREE,
                cache_key=cache_key,
                force=force,
                headers=self._headers(),
            )
        except ProviderError as exc:
            logger.warning("NASA 3D tree fetch failed: %s", exc)
            # A stale cache is still better than no models at all.
            cached = self.read_cache(cache_key)
            if cached:
                return cached
            raise

    def _contents_fallback(self) -> list[dict[str, Any]]:
        """Walk the Contents API when the Git Trees response is truncated."""
        blobs: list[dict[str, Any]] = []
        try:
            top = self.get_json(
                NASA_3D_CONTENTS,
                cache_key="contents:3D Models",
                headers=self._headers(),
            )
        except ProviderError as exc:
            logger.warning("NASA 3D contents fallback failed: %s", exc)
            return blobs

        directories = [item for item in top if item.get("type") == "dir"]
        for directory in directories[:80]:
            try:
                children = self.get_json(
                    directory["url"],
                    cache_key=f"contents:{directory['path']}",
                    headers=self._headers(),
                )
            except ProviderError:
                continue
            for child in children:
                if child.get("type") == "file":
                    blobs.append(
                        {
                            "path": child.get("path"),
                            "type": "blob",
                            "size": child.get("size"),
                        }
                    )
        return blobs

    def _all_blobs(self, force: bool = False) -> list[dict[str, Any]]:
        payload = self.fetch_tree(force=force)
        if payload.get("truncated"):
            logger.warning("GitHub tree response is truncated; using Contents API fallback")
            return self._contents_fallback()
        return [item for item in payload.get("tree") or [] if item.get("type") == "blob"]

    def find_models(
        self,
        keywords: list[str],
        include: list[str] | None = None,
        exclude: list[str] | None = None,
        overrides: list[str] | None = None,
        limit: int = 6,
    ) -> list[dict[str, Any]]:
        include = [p for p in (include or []) if p]
        exclude = [p for p in (exclude or []) if p]
        overrides = [p for p in (overrides or []) if p]
        keyword_patterns = [_word_pattern(k) for k in keywords if k and k.strip()]
        include_patterns = [_word_pattern(p) for p in include]
        exclude_patterns = [_word_pattern(p) for p in exclude]

        if not keyword_patterns and not overrides:
            return []

        blobs = self._all_blobs()
        by_path = {blob["path"]: blob for blob in blobs if blob.get("path")}
        candidates: list[dict[str, Any]] = []
        seen: set[str] = set()

        def add(path: str) -> None:
            if not path or path in seen:
                return
            lowered = path.lower()
            if not lowered.endswith(SUPPORTED_FORMATS):
                return
            blob = by_path.get(path, {"path": path, "size": None})
            download = NASA_3D_RAW + quote(path)
            extension = os.path.splitext(path)[1].lower().lstrip(".")
            web_ready = extension in ("glb", "gltf")
            in_model_dir = path.startswith("3D Models/")
            rank = (
                0 if (in_model_dir and web_ready) else
                1 if web_ready else
                2 if extension == "stl" else
                3
            )
            candidates.append(
                {
                    "file_path": path,
                    "download_url": download,
                    "format": extension,
                    "size_bytes": blob.get("size"),
                    "web_ready": web_ready,
                    "provider": "NASA 3D Resources (GitHub)",
                    "license": NASA_3D_LICENSE,
                    "viewer_url": VIEWER_FALLBACK,
                    "status": "ok",
                    "_rank": rank,
                }
            )
            seen.add(path)

        for path in overrides:
            add(path)

        for blob in blobs:
            path = blob.get("path") or ""
            if not path or path in seen:
                continue
            lowered = path.lower()
            if not lowered.endswith(SUPPORTED_FORMATS):
                continue
            if exclude_patterns and any(p.search(path) for p in exclude_patterns):
                continue
            if include_patterns and not any(p.search(path) for p in include_patterns):
                continue
            if keyword_patterns and not any(p.search(path) for p in keyword_patterns):
                continue
            add(path)

        candidates.sort(key=lambda item: (item["_rank"], item["file_path"].lower()))
        for item in candidates:
            item.pop("_rank", None)
        return candidates[:limit]

    def no_model_entry(self, reason: str = "no NASA 3D Resources match") -> dict[str, Any]:
        return {
            "file_path": None,
            "download_url": None,
            "format": None,
            "size_bytes": None,
            "web_ready": False,
            "provider": "NASA 3D Resources (GitHub)",
            "license": NASA_3D_LICENSE,
            "viewer_url": VIEWER_FALLBACK,
            "status": "no_model",
            "reason": reason,
        }
