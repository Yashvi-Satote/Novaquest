import re
from pathlib import Path
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.chunks = []
        self.ignore = False

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg", "nav", "footer"):
            self.ignore = True

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg", "nav", "footer"):
            self.ignore = False
        elif tag in ("p", "div", "h1", "h2", "h3", "h4", "li", "tr"):
            self.chunks.append("\n")

    def handle_data(self, data):
        if not self.ignore:
            self.chunks.append(data)

def get_clean_text(html_path):
    parser = TextExtractor()
    content = Path(html_path).read_text(encoding="utf-8", errors="ignore")
    parser.feed(content)
    text = "".join(parser.chunks)
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    return "\n".join(lines)

src_dir = Path("backend/NovaBase/data/raw_sources")
for html_file in sorted(src_dir.glob("*.html")):
    stem = html_file.stem
    cleaned = get_clean_text(html_file)
    out_file = src_dir / f"{stem}_text.txt"
    out_file.write_text(cleaned, encoding="utf-8")
    print(f"{stem}: {len(cleaned)} chars")
