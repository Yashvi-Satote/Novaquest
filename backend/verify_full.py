# Full verification of Novaquest database and Flask routes.
import sqlite3
import sys
import os

DB = "space_hardware.db"
PASS = []
FAIL = []

def check(label, condition, detail=""):
    if condition:
        PASS.append(label)
        print("  [PASS] " + label + (" -- " + detail if detail else ""))
    else:
        FAIL.append(label)
        print("  [FAIL] " + label + (" -- " + detail if detail else ""))

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
c = conn.cursor()

print("\n=== 1. DATABASE RECORD COUNTS ===\n")
sc = c.execute("SELECT COUNT(*) FROM spacecraft").fetchone()[0]
ms = c.execute("SELECT COUNT(*) FROM missions").fetchone()[0]
assoc = c.execute("SELECT COUNT(*) FROM mission_spacecraft").fetchone()[0]
mdl = c.execute("SELECT COUNT(*) FROM models_3d").fetchone()[0]

check("122 spacecraft records", sc == 122, "got " + str(sc))
check("112 mission records", ms == 112, "got " + str(ms))
check("125 mission-spacecraft associations", assoc == 125, "got " + str(assoc))
check("122 3D model records", mdl == 122, "got " + str(mdl))

print("\n=== 2. SPACECRAFT DATA QUALITY ===\n")
sc_noname = c.execute("SELECT COUNT(*) FROM spacecraft WHERE name IS NULL OR name=''").fetchone()[0]
check("All spacecraft have names", sc_noname == 0, str(sc_noname) + " missing")

sc_noshortdesc = c.execute("SELECT COUNT(*) FROM spacecraft WHERE short_description IS NULL OR short_description=''").fetchone()[0]
print("  [INFO] Spacecraft with no short_description: " + str(sc_noshortdesc) + "/122")

sc_noedu = c.execute("SELECT COUNT(*) FROM spacecraft WHERE educational_description IS NULL OR educational_description=''").fetchone()[0]
print("  [INFO] Spacecraft with no educational_description: " + str(sc_noedu) + "/122")

print("\n=== 3. KEY SPACECRAFT PRESENT ===\n")
for name in ["Voyager 1", "Chandrayaan-3", "Cassini", "James Webb Space Telescope", "Hubble Space Telescope", "Mars Science Laboratory Curiosity"]:
    row = c.execute("SELECT id, name, operational_status, launch_date FROM spacecraft WHERE name=?", (name,)).fetchone()
    if row:
        print("  [PASS] " + name + " -- id=" + str(row["id"]) + " status=" + str(row["operational_status"]) + " launched=" + str(row["launch_date"]))
        PASS.append("Spacecraft: " + name)
    else:
        # try LIKE
        row2 = c.execute("SELECT id, name FROM spacecraft WHERE name LIKE ?", ("%" + name + "%",)).fetchone()
        if row2:
            print("  [PARTIAL] " + name + " -- found as: " + row2["name"])
        else:
            print("  [FAIL] " + name + " -- NOT IN DATABASE")
            FAIL.append("Spacecraft: " + name)

print("\n=== 4. KEY MISSIONS PRESENT ===\n")
for mname in ["Voyager 1", "Chandrayaan-3", "Apollo 11", "Mars Science Laboratory", "Hubble Space Telescope"]:
    row = c.execute("SELECT id, name, mission_status, launch_date FROM missions WHERE name=?", (mname,)).fetchone()
    if row:
        print("  [PASS] " + mname + " -- id=" + str(row["id"]) + " status=" + str(row["mission_status"]) + " launched=" + str(row["launch_date"]))
        PASS.append("Mission: " + mname)
    else:
        row2 = c.execute("SELECT id, name FROM missions WHERE name LIKE ?", ("%" + mname + "%",)).fetchone()
        if row2:
            print("  [PARTIAL] " + mname + " -- found as: " + row2["name"])
        else:
            print("  [FAIL] " + mname + " -- NOT IN DATABASE")
            FAIL.append("Mission: " + mname)

ms_nulldate = c.execute("SELECT COUNT(*) FROM missions WHERE launch_date IS NULL").fetchone()[0]
print("\n  [INFO] Missions with NULL launch_date: " + str(ms_nulldate) + "/112")

print("\n=== 5. MISSION-SPACECRAFT ASSOCIATION INTEGRITY ===\n")
orphan_sc = c.execute("SELECT COUNT(*) FROM mission_spacecraft ms WHERE NOT EXISTS (SELECT 1 FROM spacecraft s WHERE s.id=ms.spacecraft_id)").fetchone()[0]
orphan_ms = c.execute("SELECT COUNT(*) FROM mission_spacecraft ms WHERE NOT EXISTS (SELECT 1 FROM missions m WHERE m.id=ms.mission_id)").fetchone()[0]
check("No orphan spacecraft FKs in associations", orphan_sc == 0, str(orphan_sc) + " orphans")
check("No orphan mission FKs in associations", orphan_ms == 0, str(orphan_ms) + " orphans")

# Sample associations
sample_assoc = c.execute("""
    SELECT m.name AS mission, s.name AS spacecraft
    FROM mission_spacecraft ms
    JOIN missions m ON m.id = ms.mission_id
    JOIN spacecraft s ON s.id = ms.spacecraft_id
    LIMIT 8
""").fetchall()
print("  Sample associations:")
for row in sample_assoc:
    print("    " + row["mission"] + " <-> " + row["spacecraft"])

print("\n=== 6. 3D MODEL RECORDS AND FILE PATHS ===\n")
model_rows = c.execute("SELECT spacecraft_id, file_path, format FROM models_3d").fetchall()
no_path = 0
found_files = 0
missing_files = 0
missing_list = []
formats = {}
for row in model_rows:
    fp = row["file_path"]
    fmt = str(row["format"] or "unknown")
    formats[fmt] = formats.get(fmt, 0) + 1
    if not fp:
        no_path += 1
    else:
        full = "C:/nqueue/Novaquest/frontend/public/" + fp.lstrip("/").replace("\\", "/")
        if os.path.exists(full):
            found_files += 1
        else:
            missing_files += 1
            missing_list.append(fp)

print("  Model formats: " + str(formats))
print("  Records with no file_path: " + str(no_path))
print("  Files found on disk: " + str(found_files))
print("  Files MISSING on disk: " + str(missing_files))
check("All 3D model records have file paths", no_path == 0, str(no_path) + " records have no path")
if missing_files > 0:
    print("  Sample missing paths (first 5):")
    for p in missing_list[:5]:
        print("    " + p)

print("\n=== 7. FLASK APP ROUTES ===\n")
try:
    sys.path.insert(0, ".")
    from NovaBase.app import app
    check("Flask app imports without error", True)
    routes = [str(rule) for rule in app.url_map.iter_rules()]
    api_routes = sorted([r for r in routes if r.startswith("/api")])
    print("  API routes (" + str(len(api_routes)) + "):")
    for r in api_routes:
        print("    " + r)
    check(">=5 API routes defined", len(api_routes) >= 5, "found " + str(len(api_routes)))
except Exception as e:
    check("Flask app imports without error", False, str(e))

conn.close()

print("\n=== SUMMARY ===")
print("  PASSED: " + str(len(PASS)) + "/" + str(len(PASS) + len(FAIL)))
print("  FAILED: " + str(len(FAIL)) + "/" + str(len(PASS) + len(FAIL)))
if FAIL:
    print("\n  Failed checks:")
    for f in FAIL:
        print("    - " + f)
else:
    print("\n  All checks passed!")
