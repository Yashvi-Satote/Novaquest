"""Wikipedia (MediaWiki Action API) provider.

Builds the narrative sections, infobox facts, imagery and source links for a
mission.  Every text block carries the page URL, revision id and CC BY-SA
attribution so the frontend can display it.
"""
from __future__ import annotations

import html
import logging
import re
from typing import Any
from urllib.parse import quote

from .base import BaseProvider, ProviderError

logger = logging.getLogger(__name__)

WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
WIKIPEDIA_REST_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/"
WIKIPEDIA_LICENSE = "CC BY-SA 4.0"

# Files that are never useful as section-5 imagery.
_SKIP_FILE_RE = re.compile(
    r"(icon|logo|symbol|flag|commons-|wiki|ambox|question_book|edit-|disambig|"
    r"padlock|semi-protection|sound|audio|\.ogg$|\.oga$|\.webm$|\.svg$)",
    re.IGNORECASE,
)


def strip_wiki_markup(value: str) -> str:
    if not value:
        return ""
    value = re.sub(r"<ref[^>]*>.*?</ref>", "", value, flags=re.DOTALL | re.IGNORECASE)
    value = re.sub(r"<ref[^>]*/>", "", value, flags=re.IGNORECASE)
    value = re.sub(r"\{\{[^{}]*\}\}", "", value)
    value = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", value)
    value = re.sub(r"\[https?://[^\s\]]+\s*([^\]]*)\]", r"\1", value)
    value = re.sub(r"''+", "", value)
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def split_extract_sections(extract: str) -> list[dict[str, Any]]:
    """Split a plaintext Wikipedia extract on ``== Heading ==`` lines."""
    if not extract:
        return []
    sections: list[dict[str, Any]] = []
    current_title = ""
    current_lines: list[str] = []

    def flush() -> None:
        text = "\n".join(current_lines).strip()
        if text:
            sections.append({"title": current_title, "text": text})

    for line in extract.splitlines():
        match = re.match(r"^(={2,6})\s*(.+?)\s*\1\s*$", line.strip())
        if match:
            flush()
            current_title = match.group(2).strip()
            current_lines = []
        else:
            current_lines.append(line)
    flush()
    return sections


class WikipediaProvider(BaseProvider):
    name = "wikipedia"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    # ------------------------------------------------------------------
    def _api(self, params: dict[str, Any], cache_key: str) -> dict[str, Any]:
        payload = self.get_json(
            WIKIPEDIA_API,
            params={"format": "json", "formatversion": 2, **params},
            cache_key=cache_key,
        )
        if not isinstance(payload, dict):
            raise ProviderError("Unexpected Wikipedia payload")
        return payload

    @staticmethod
    def _pages(payload: dict[str, Any]) -> list[dict[str, Any]]:
        pages = (payload.get("query") or {}).get("pages") or []
        if isinstance(pages, dict):  # formatversion=1 fallback
            pages = list(pages.values())
        return pages

    def fetch_page(self, wiki_title: str) -> dict[str, Any]:
        """Fetch extract, lead image, revision, external links and file list."""
        cache_key = f"page:{wiki_title}"
        payload = self._api(
            {
                "action": "query",
                "prop": "extracts|pageimages|revisions|info|extlinks|images",
                "explaintext": 1,
                "piprop": "original",
                "rvprop": "ids|timestamp",
                "ellimit": "max",
                "imlimit": "max",
                "redirects": 1,
                "titles": wiki_title,
            },
            cache_key,
        )
        pages = self._pages(payload)
        if not pages:
            raise ProviderError(f"Wikipedia returned no page for {wiki_title}")
        page = pages[0]
        if page.get("missing") or page.get("invalid"):
            raise ProviderError(f"Wikipedia page missing: {wiki_title}")

        revision_id = None
        revision_timestamp = None
        revisions = page.get("revisions") or []
        if revisions:
            revision_id = str(revisions[0].get("revid"))
            revision_timestamp = revisions[0].get("timestamp")

        extlinks: list[str] = []
        for item in page.get("extlinks") or []:
            if isinstance(item, dict):
                url = item.get("url") or item.get("*")
            else:
                url = str(item)
            if url:
                extlinks.append(url)

        images = []
        for item in page.get("images") or []:
            title = item.get("title") if isinstance(item, dict) else str(item)
            if title:
                images.append(title)

        return {
            "title": page.get("title") or wiki_title,
            "pageid": page.get("pageid"),
            "extract": page.get("extract") or "",
            "original_image": (page.get("original") or {}).get("source"),
            "original_width": (page.get("original") or {}).get("width"),
            "original_height": (page.get("original") or {}).get("height"),
            "revision_id": revision_id,
            "revision_timestamp": revision_timestamp,
            "page_url": "https://en.wikipedia.org/wiki/" + quote((page.get("title") or wiki_title).replace(" ", "_")),
            "extlinks": extlinks,
            "image_titles": images,
            "license": WIKIPEDIA_LICENSE,
            "attribution": f"Wikipedia contributors, {page.get('title') or wiki_title}, {WIKIPEDIA_LICENSE}",
        }

    def fetch_parse(self, wiki_title: str) -> dict[str, Any]:
        cache_key = f"parse:{wiki_title}"
        payload = self._api(
            {
                "action": "parse",
                "prop": "wikitext|sections",
                "redirects": 1,
                "page": wiki_title,
            },
            cache_key,
        )
        parse = payload.get("parse") or {}
        wikitext = parse.get("wikitext") or ""
        if isinstance(wikitext, dict):  # formatversion=1 shape
            wikitext = wikitext.get("*") or ""
        return {
            "title": parse.get("title") or wiki_title,
            "wikitext": wikitext,
            "sections": parse.get("sections") or [],
        }

    def _fetch_single_imageinfo(self, file_title: str) -> list[dict[str, Any]]:
        """Per-file imageinfo fallback (so a thin batch response is never fatal)."""
        if not file_title:
            return []
        try:
            payload = self._api(
                {
                    "action": "query",
                    "prop": "imageinfo",
                    "iiprop": "url|size|extmetadata",
                    "iiurlwidth": 1200,
                    "titles": file_title,
                },
                "imageinfo:" + file_title,
            )
        except ProviderError as exc:
            logger.warning("Per-file imageinfo lookup failed for %s: %s", file_title, exc)
            return []
        for page in self._pages(payload):
            info_list = page.get("imageinfo") or []
            if info_list:
                return info_list
        return []

    def fetch_images(self, file_titles: list[str]) -> list[dict[str, Any]]:
        """Resolve File: titles to URLs, dimensions and Commons metadata."""
        results: list[dict[str, Any]] = []
        # Keep the payload small and avoid obvious chrome.
        wanted = [t for t in file_titles if not _SKIP_FILE_RE.search(t)][:40]
        for start in range(0, len(wanted), 40):
            batch = wanted[start : start + 40]
            if not batch:
                continue
            cache_key = "images:" + "|".join(batch)
            try:
                payload = self._api(
                    {
                        "action": "query",
                        "prop": "imageinfo",
                        "iiprop": "url|size|extmetadata",
                        "iiurlwidth": 1200,
                        "titles": "|".join(batch),
                    },
                    cache_key,
                )
            except ProviderError as exc:
                logger.warning("Image metadata lookup failed: %s", exc)
                continue

            for page in self._pages(payload):
                info_list = page.get("imageinfo") or []
                if not info_list:
                    # "missing" is normal for files hosted on Commons: the
                    # page is missing locally but imageinfo is still returned.
                    # If the batch response omitted imageinfo, retry per file.
                    info_list = self._fetch_single_imageinfo(page.get("title") or "")
                    if not info_list:
                        continue
                info = info_list[0]
                meta = info.get("extmetadata") or {}

                def meta_value(key: str) -> str:
                    entry = meta.get(key) or {}
                    raw = entry.get("value") if isinstance(entry, dict) else entry
                    return strip_wiki_markup(str(raw)) if raw else ""

                title = page.get("title") or ""
                name = re.sub(r"^File:", "", title)
                license_name = meta_value("LicenseShortName") or meta_value("License")
                artist = meta_value("Artist") or meta_value("Credit")

                results.append(
                    {
                        "file_title": title,
                        "name": name,
                        "url": info.get("url"),
                        "thumb_url": info.get("thumburl") or info.get("url"),
                        "width": info.get("width"),
                        "height": info.get("height"),
                        "license": license_name,
                        "artist": artist,
                        "description_url": info.get("descriptionurl"),
                        "kind": self._classify_image(name),
                    }
                )
        return results

    @staticmethod
    def _classify_image(name: str) -> str:
        lowered = name.lower()
        if any(word in lowered for word in ("diagram", "schematic", "map", "cutaway", "blueprint", "drawing")):
            return "diagram"
        if any(word in lowered for word in ("animation", "simulation", "visualization", "visualisation", "graph", "chart")):
            return "science_visualization"
        if any(word in lowered for word in ("illustration", "artist", "concept")):
            return "illustration"
        return "photo"

    @staticmethod
    def parse_infobox(wikitext: str) -> dict[str, str]:
        """Extract top-level infobox fields from raw wikitext."""
        if not wikitext:
            return {}
        start = wikitext.find("{{Infobox")
        if start < 0:
            return {}
        depth = 0
        end = -1
        for idx in range(start, len(wikitext) - 1):
            pair = wikitext[idx : idx + 2]
            if pair == "{{":
                depth += 1
            elif pair == "}}":
                depth -= 1
                if depth == 0:
                    end = idx + 2
                    break
        if end < 0:
            return {}
        body = wikitext[start + 2 : end - 2]

        # Split on pipes that are not nested in {{ }} or [[ ]].
        fields: list[str] = []
        buffer: list[str] = []
        depth_curly = depth_square = 0
        for idx, ch in enumerate(body):
            pair = body[idx : idx + 2]
            if pair == "{{":
                depth_curly += 1
            elif pair == "}}":
                depth_curly = max(0, depth_curly - 1)
            elif pair == "[[":
                depth_square += 1
            elif pair == "]]":
                depth_square = max(0, depth_square - 1)
            if ch == "|" and depth_curly == 0 and depth_square == 0:
                fields.append("".join(buffer))
                buffer = []
            else:
                buffer.append(ch)
        fields.append("".join(buffer))

        infobox: dict[str, str] = {}
        for field in fields[1:]:
            if "=" not in field:
                continue
            key, value = field.split("=", 1)
            key = key.strip().lower().replace("_", " ")
            cleaned = strip_wiki_markup(value)
            if cleaned and key not in infobox:
                infobox[key] = cleaned
        return infobox

    def fetch_mission(self, mission: dict[str, Any]) -> dict[str, Any]:
        """Aggregate everything the ingestion pipeline needs for one mission."""
        wiki_title = mission["wiki_title"]
        page = self.fetch_page(wiki_title)
        parse = self.fetch_parse(wiki_title)
        infobox = self.parse_infobox(parse.get("wikitext", ""))

        secondary_pages = []
        for secondary_title in mission.get("secondary_wiki_titles") or []:
            try:
                secondary_page = self.fetch_page(secondary_title)
                secondary_pages.append(secondary_page)
            except ProviderError as exc:
                logger.warning("Secondary Wikipedia page failed (%s): %s", secondary_title, exc)

        images = self.fetch_images(page.get("image_titles") or [])
        if page.get("original_image"):
            lead = {
                "file_title": "lead",
                "name": f"{page['title']} lead image",
                "url": page["original_image"],
                "thumb_url": page["original_image"],
                "width": page.get("original_width"),
                "height": page.get("original_height"),
                "license": WIKIPEDIA_LICENSE,
                "artist": "Wikipedia / Wikimedia Commons",
                "description_url": page.get("page_url"),
                "kind": "photo",
                "lead": True,
            }
            images.insert(0, lead)

        return {
            "page": page,
            "secondary_pages": secondary_pages,
            "sections": split_extract_sections(page.get("extract") or ""),
            "infobox": infobox,
            "images": images,
            "wikitext_sections": parse.get("sections") or [],
            "wikitext": parse.get("wikitext") or "",
            "license": WIKIPEDIA_LICENSE,
            "attribution": page.get("attribution"),
        }

    # ------------------------------------------------------------------
    def lookup_person(self, full_name: str) -> dict[str, Any] | None:
        """Return a Wikipedia URL when a person page exists.

        Ambiguous/disambiguation pages are rejected so we never link a person
        to an unrelated namesake.
        """
        if not full_name:
            return None
        try:
            payload = self._api(
                {
                    "action": "query",
                    "prop": "pageprops|info",
                    "redirects": 1,
                    "titles": full_name,
                },
                f"person:{full_name}",
            )
        except ProviderError:
            return None
        pages = self._pages(payload)
        if not pages:
            return None
        page = pages[0]
        if page.get("missing") or page.get("invalid"):
            return None
        props = page.get("pageprops") or {}
        if props.get("disambiguation") is not None:
            return None
        title = page.get("title") or full_name
        return {
            "title": title,
            "url": "https://en.wikipedia.org/wiki/" + quote(title.replace(" ", "_")),
        }

    def fetch_summary(self, wiki_title: str) -> dict[str, Any] | None:
        """REST summary fallback used when the Action API is unavailable."""
        url = WIKIPEDIA_REST_SUMMARY + quote(wiki_title.replace(" ", "_"))
        try:
            return self.get_json(url, cache_key=f"summary:{wiki_title}")
        except ProviderError as exc:
            logger.warning("REST summary failed for %s: %s", wiki_title, exc)
            return None
