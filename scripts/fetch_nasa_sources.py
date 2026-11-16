"""Fetch the official NASA source pages for the 13 specified missions and save raw content."""
import os
import sys
import time
import urllib.request
import urllib.error
import re
from pathlib import Path

URLS = {
    "1969-059C": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C",
    "1971-063C": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C",
    "1969-099C": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C",
    "surveyor-3": "https://science.nasa.gov/mission/surveyor-3/",
    "mars-pathfinder": "https://science.nasa.gov/mission/mars-pathfinder/",
    "spirit-and-opportunity": "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
    "viking-1": "https://science.nasa.gov/mission/viking-1/",
    "insight": "https://science.nasa.gov/mission/insight/",
    "dawn": "https://science.nasa.gov/mission/dawn/",
    "near-shoemaker": "https://science.nasa.gov/mission/near-shoemaker/",
    "pioneer-10": "https://science.nasa.gov/mission/pioneer-10/",
    "ingenuity": "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/",
    "kepler": "https://science.nasa.gov/mission/kepler/",
}

OUT_DIR = Path("backend/NovaBase/data/raw_sources")
OUT_DIR.mkdir(parents=True, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

for key, url in URLS.items():
    out_file = OUT_DIR / f"{key}.html"
    print(f"Fetching {key} from {url}...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read().decode("utf-8", errors="ignore")
            out_file.write_text(content, encoding="utf-8")
            print(f"  Saved {len(content)} characters to {out_file}")
    except Exception as e:
        print(f"  Error fetching {key}: {e}")
    time.sleep(1)

print("Done fetching sources.")
