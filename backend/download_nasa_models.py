import os
import json
import urllib.request
import urllib.parse

MODELS = [
    {
        "slug": "voyager-1",
        "alias_slugs": ["voyager-2"],
        "folder": "Voyager Probe (A)",
        "file": "Voyager Probe (A).glb",
        "name": "Voyager Spacecraft",
        "out_file": "voyager.glb"
    },
    {
        "slug": "pioneer-10",
        "alias_slugs": ["pioneer-11"],
        "folder": "Pioneer 10",
        "file": "Pioneer 10.glb",
        "name": "Pioneer 10 Spacecraft",
        "out_file": "pioneer_10.glb"
    },
    {
        "slug": "perseverance-rover",
        "alias_slugs": ["perseverance"],
        "folder": "Mars 2020 Perseverance Rover",
        "file": "Mars 2020 Perseverance Rover.glb",
        "name": "Perseverance Rover",
        "out_file": "perseverance.glb"
    },
    {
        "slug": "ingenuity-helicopter",
        "alias_slugs": ["ingenuity"],
        "folder": "Ingenuity Mars Helicopter",
        "file": "Ingenuity Mars Helicopter.glb",
        "name": "Ingenuity Mars Helicopter",
        "out_file": "ingenuity.glb"
    },
    {
        "slug": "opportunity-rover",
        "alias_slugs": ["spirit-rover", "opportunity", "spirit"],
        "folder": "Mars Exploration Rover - Opportunity (MER-B)",
        "file": "Mars Exploration Rover - Opportunity (MER-B).glb",
        "name": "Mars Exploration Rover (Spirit / Opportunity)",
        "out_file": "mer_opportunity.glb"
    },
    {
        "slug": "mars-reconnaissance-orbiter",
        "alias_slugs": ["mro"],
        "folder": "Mars Reconnaissance Orbiter (MRO) (A)",
        "file": "Mars Reconnaissance Orbiter (MRO) (A).glb",
        "name": "Mars Reconnaissance Orbiter (MRO)",
        "out_file": "mro.glb"
    },
    {
        "slug": "juno-spacecraft",
        "alias_slugs": ["juno"],
        "folder": "Juno (A)",
        "file": "Juno (A).glb",
        "name": "Juno Spacecraft",
        "out_file": "juno.glb"
    },
    {
        "slug": "galileo-orbiter",
        "alias_slugs": ["galileo"],
        "folder": "Galileo",
        "file": "Galileo.glb",
        "name": "Galileo Orbiter",
        "out_file": "galileo.glb"
    },
    {
        "slug": "cassini-huygens",
        "alias_slugs": ["cassini"],
        "folder": "Cassini-Huygens (A)",
        "file": "Cassini-Huygens (A).glb",
        "name": "Cassini-Huygens Spacecraft",
        "out_file": "cassini.glb"
    },
    {
        "slug": "parker-solar-probe",
        "alias_slugs": [],
        "folder": "Parker Solar Probe",
        "file": "Parker Solar Probe.glb",
        "name": "Parker Solar Probe",
        "out_file": "parker_solar_probe.glb"
    },
    {
        "slug": "james-webb-space-telescope",
        "alias_slugs": ["jwst"],
        "folder": "James Webb Space Telescope (A)",
        "file": "James Webb Space Telescope (A).glb",
        "name": "James Webb Space Telescope",
        "out_file": "jwst.glb"
    },
    {
        "slug": "hubble-space-telescope",
        "alias_slugs": ["hubble"],
        "folder": "Hubble Space Telescope (A)",
        "file": "Hubble Space Telescope (A).glb",
        "name": "Hubble Space Telescope",
        "out_file": "hubble.glb"
    },
    {
        "slug": "osiris-rex",
        "alias_slugs": [],
        "folder": "Origins, Spectral Interpretation, Resource Identification, and Security - Regolith Explorer (OSIRIS-REx)",
        "file": "OSIRIS-REx.glb",
        "name": "OSIRIS-REx Spacecraft",
        "out_file": "osiris_rex.glb"
    },
    {
        "slug": "rosetta",
        "alias_slugs": ["philae"],
        "folder": "Rosetta",
        "file": "Rosetta.glb",
        "name": "Rosetta Spacecraft",
        "out_file": "rosetta.glb"
    },
    {
        "slug": "apollo-11-lm-descent-stage",
        "alias_slugs": ["apollo-11-lunar-module"],
        "folder": "Apollo Lunar Module",
        "file": "Apollo Lunar Module.glb",
        "name": "Apollo Lunar Module",
        "out_file": "apollo_lm.glb"
    },
    {
        "slug": "international-space-station",
        "alias_slugs": ["iss"],
        "folder": "International Space Station (ISS) (B)",
        "file": "International Space Station (ISS) (B).glb",
        "name": "International Space Station (ISS)",
        "out_file": "iss.glb"
    },
    {
        "slug": "lunar-reconnaissance-orbiter",
        "alias_slugs": ["lro"],
        "folder": "Lunar Reconnaissance Orbiter (A)",
        "file": "Lunar Reconnaissance Orbiter (A).glb",
        "name": "Lunar Reconnaissance Orbiter",
        "out_file": "lro.glb"
    }
]

TARGET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "models", "spacecraft"))
os.makedirs(TARGET_DIR, exist_ok=True)

print(f"Target directory: {TARGET_DIR}")

manifest = []

for item in MODELS:
    folder_enc = urllib.parse.quote(item["folder"])
    file_enc = urllib.parse.quote(item["file"])
    meta_url = f"https://api.github.com/repos/nasa/NASA-3D-Resources/contents/3D%20Models/{folder_enc}/{file_enc}"
    out_path = os.path.join(TARGET_DIR, item["out_file"])
    
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        print(f"Exists: {item['out_file']} ({os.path.getsize(out_path)} bytes)")
        manifest.append({
            "slug": item["slug"],
            "aliases": item["alias_slugs"],
            "name": item["name"],
            "file": f"/models/spacecraft/{item['out_file']}",
            "size_bytes": os.path.getsize(out_path),
            "provenance": "NASA 3D Resources (Official Public Domain - NASA-3D-Resources GitHub)",
            "isAuthenticModel": True
        })
        continue

    try:
        req = urllib.request.Request(meta_url, headers={"User-Agent": "Novaquest-Asset-Downloader"})
        meta = json.loads(urllib.request.urlopen(req).read())
        dl_url = meta.get("download_url")
        if not dl_url:
            print(f"No download_url for {item['name']}")
            continue
        print(f"Downloading {item['name']} ({meta.get('size', 0) / 1048576:.2f} MB) from {dl_url[:60]}...")
        urllib.request.urlretrieve(dl_url, out_path)
        print(f"Saved -> {out_path} ({os.path.getsize(out_path)} bytes)")
        manifest.append({
            "slug": item["slug"],
            "aliases": item["alias_slugs"],
            "name": item["name"],
            "file": f"/models/spacecraft/{item['out_file']}",
            "size_bytes": os.path.getsize(out_path),
            "provenance": "NASA 3D Resources (Official Public Domain - NASA-3D-Resources GitHub)",
            "isAuthenticModel": True
        })
    except Exception as e:
        print(f"Error downloading {item['name']}: {e}")

manifest_path = os.path.join(TARGET_DIR, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"Finished. Manifest saved to {manifest_path} with {len(manifest)} models.")

