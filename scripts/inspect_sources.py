from pathlib import Path
from html.parser import HTMLParser
import re

class TitleH1Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = []
        self.h1 = []
        self.in_title = False
        self.in_h1 = False

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True
        elif tag == "h1" and not self.h1:
            self.in_h1 = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False

    def handle_data(self, data):
        if self.in_title:
            self.title.append(data)
        elif self.in_h1:
            self.h1.append(data)

src_dir = Path("backend/NovaBase/data/raw_sources")
for html_file in sorted(src_dir.glob("*.html")):
    text = html_file.read_text(encoding="utf-8", errors="ignore")
    parser = TitleH1Parser()
    parser.feed(text[:50000])
    title_str = " ".join("".join(parser.title).split())
    h1_str = " ".join("".join(parser.h1).split())
    print(f"{html_file.name}: title='{title_str}' | h1='{h1_str}'")
