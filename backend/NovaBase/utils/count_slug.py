from pathlib import Path

source = Path(__file__).resolve().parents[1] / "services" / "expand_db.py"
s = source.read_text(encoding="utf-8")
print(s.count('"slug":'))
