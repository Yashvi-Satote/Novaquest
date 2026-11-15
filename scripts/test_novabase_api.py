import sys
import os
sys.path.insert(0, "backend")

os.environ["NOVABASE_SQLITE_PATH"] = "backend/space_hardware.db"
os.environ.pop("DATABASE_URL", None)

from NovaBase.app import app

client = app.test_client()

# 1. Health check
res = client.get("/api/novabase/health")
print("Health endpoint status:", res.status_code)
health_data = res.get_json()
print("Total spacecraft in health:", health_data.get("total_spacecraft"))

# 2. Hardware list check
res = client.get("/api/hardware?limit=100")
print("Hardware list status:", res.status_code)
hw_data = res.get_json()
items = hw_data.get("items") or hw_data.get("hardware") or []
print(f"Hardware items returned: {len(items)}")

# 3. Test detail for every one of the 9 new missions
new_slugs = [
    "apollo-15-lunar-module",
    "apollo-12-lunar-module",
    "spirit",
    "viking-1",
    "insight",
    "dawn",
    "near-shoemaker",
    "pioneer-10",
    "kepler"
]

for slug in new_slugs:
    res = client.get(f"/api/hardware/{slug}")
    assert res.status_code == 200, f"Failed for {slug}: status {res.status_code}"
    detail = res.get_json()
    assert detail["name"], f"No name for {slug}"
    assert "sections" in detail, f"No sections in {slug}"
    assert "content" in detail, f"No content in {slug}"
    sections_count = sum(1 for v in detail["sections"].values() if v.get("populated"))
    print(f"  [OK] /api/hardware/{slug} -> '{detail['name']}', populated sections: {sections_count}/10")

# 4. Also check 2 existing missions
for slug in ["apollo-lunar-module", "surveyor-3"]:
    res = client.get(f"/api/hardware/{slug}")
    assert res.status_code == 200, f"Failed for {slug}: status {res.status_code}"
    detail = res.get_json()
    sections_count = sum(1 for v in detail["sections"].values() if v.get("populated"))
    print(f"  [OK] /api/hardware/{slug} -> '{detail['name']}', populated sections: {sections_count}/10")

print("\nALL API ENDPOINT CHECKS PASSED!")
