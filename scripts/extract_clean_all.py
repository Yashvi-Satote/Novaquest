from pathlib import Path
from html.parser import HTMLParser
import re

class FullTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.chunks = []
        self.ignore = False
        self.in_entry = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag in ("script", "style", "noscript", "svg"):
            self.ignore = True
        if "entry-content" in attrs_dict.get("class", "") or "grid-container" in attrs_dict.get("class", ""):
            self.in_entry = True

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg"):
            self.ignore = False
        if tag in ("p", "div", "h1", "h2", "h3", "h4", "li", "tr"):
            self.chunks.append("\n")

    def handle_data(self, data):
        if not self.ignore:
            self.chunks.append(data)

src_dir = Path("backend/NovaBase/data/raw_sources")
for name in ["kepler", "spirit-and-opportunity", "near-shoemaker", "surveyor-3", "mars-pathfinder", "ingenuity", "pioneer-10", "insight"]:
    content = (src_dir / f"{name}.html").read_text(encoding="utf-8", errors="ignore")
    extractor = FullTextExtractor()
    extractor.feed(content)
    text = "".join(extractor.chunks)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    cleaned = "\n".join(lines)
    (src_dir / f"{name}_clean.txt").write_text(cleaned, encoding="utf-8")
    print(f"{name}: {len(cleaned)} chars")
