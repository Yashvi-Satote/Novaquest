from pathlib import Path

src_dir = Path("backend/NovaBase/data/raw_sources")
missions = ["dawn", "insight", "near-shoemaker", "pioneer-10", "kepler", "spirit-and-opportunity"]

for m in missions:
    text = (src_dir / f"{m}_text.txt").read_text(encoding="utf-8", errors="ignore")
    lines = text.split("\n")
    print(f"\n==================== {m.upper()} ====================")
    # Find start of mission facts (e.g. Type, Launch, Target, Nation, Objective)
    recording = False
    count = 0
    for line in lines:
        if line in ["Type", "Nation", "Objective(s)", "Fast Facts", "Key Dates"]:
            recording = True
        if recording:
            print(line)
            count += 1
            if count > 70:
                break
