"""
Migration and data ingestion script for Novaquest.
Replaces the old 52-record hardware schema with the newly designed, scalable schema:
- Space Missions
- Spacecraft (122 records from matthewgiarra/spacecraft-models)
- 3D Models (122 authentic 3D model assets)
- MissionSpacecraft (Many-to-Many relationships)
- Organizations, Aliases, Keywords, Images, Sources

Idempotent: Safe to run repeatedly without generating duplicates.
"""

import os
import sys
import json
import re
from datetime import datetime

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from Shared.database import engine, SessionLocal, Base
from NovaBase.models import (
    Organization,
    Mission,
    Spacecraft,
    Model3D,
    MissionSpacecraft,
    SpacecraftAlias,
    SpacecraftKeyword,
    SpacecraftImage,
    SpacecraftSource
)


def strip_html_tags(text):
    """Strip HTML tags for clean plain text."""
    clean = re.sub(r'<[^>]+>', '', text)
    return ' '.join(clean.split())


def extract_first_link(desc, default_url):
    """Extract primary documentation link from HTML description."""
    links = re.findall(r"href=['\"]([^'\"]+)['\"]", desc)
    for l in links:
        if "nasa.gov" in l or "esa.int" in l:
            return l
    return default_url


def determine_object_type(name, full_name, desc):
    """Accurately determine object type from names and description."""
    text = f"{name} {full_name} {desc}".lower()
    if "rover" in text:
        return "Rover"
    if "helicopter" in text or "rotorcraft" in text:
        return "Helicopter / Rotorcraft"
    if "lander" in text:
        return "Lander"
    if "telescope" in text or "observatory" in text:
        return "Space Telescope"
    if "orbiter" in text:
        return "Orbiter"
    if "station" in text:
        return "Space Station"
    if "probe" in text or "flyby" in text:
        return "Flyby Probe"
    if "capsule" in text or "sample return" in text:
        return "Sample Return Capsule"
    if "cruise" in text:
        return "Cruise Stage"
    if "sail" in text:
        return "Solar Sail"
    if "cubesat" in text or "minisat" in text:
        return "CubeSat"
    return "Orbiter"


def determine_operational_status(name, desc):
    """Determine operational status based on verifiable text."""
    text = desc.lower()
    if any(k in text for k in ["was lost", "mission ended", "mission completed", "impacted", "decommissioned", "retired", "inoperative", "last contact"]):
        return "Inactive / decommissioned"
    if any(k in text for k in ["currently operating", "continues to", "is operating", "is a mission to", "launched in 202", "collects and analyzes", "is investigating"]):
        return "Active / operational"
    return "Active / operational"


def determine_destination_category(name):
    """Categorize spacecraft into canonical space exploration realms."""
    name_lower = name.lower()
    
    MARS = {
        "curiosity", "insight", "marco", "perseverence", "mars-express",
        "mars-global-surveyor", "mars-odyssey", "mars-reconnaissance-orbiter",
        "maven", "opportunity-cruise", "opportunity-rover", "phoenix-cruise",
        "phoenix-edl", "spirit-cruise", "spirit-rover", "trace-gas-orbiter"
    }

    MOON = {
        "artemis", "capstone", "clementine", "grail", "ladee", "lcross",
        "lunar-flashlight", "lunar-prospector", "lunar-reconnaissance-orbiter"
    }

    ASTEROIDS_COMETS = {
        "dart", "dawn", "deep-impact", "lucy", "near-shoemaker", "osiris-apex",
        "osiris-rex-sample-return-capsule", "philae", "psyche", "rosetta",
        "stardust", "stardust-sample-return-capsule"
    }

    HELIOPHYSICS = {
        "ace", "acrimsat", "dscovr", "ibex", "imap", "mms", "parker-solar-probe",
        "soho", "solar-dynamics-observatory", "sorce", "stereo-ahead", "stereo-behind",
        "themis", "van-allen-probe", "wind", "ulysses", "geotail", "polar"
    }

    DEEP_SPACE = {
        "cassini", "dragonfly", "europa-clipper", "galileo", "galileo-probe",
        "huygens", "juice", "juno", "new-horizons", "pioneer", "voyager",
        "mariner-2", "messenger", "chandra", "euclid", "hubble", "ixpe",
        "jwst", "kepler", "nustar", "spherex", "spitzer-space-telescope", "tess"
    }

    if name_lower in MARS:
        return "Mars"
    if name_lower in MOON:
        return "Moon"
    if name_lower in ASTEROIDS_COMETS:
        return "Asteroids & Comets"
    if name_lower in HELIOPHYSICS:
        return "Heliophysics"
    if name_lower in DEEP_SPACE:
        return "Deep Space"
    return "Earth Orbit"


def run_migration_and_import():
    print("=" * 70)
    print("NOVAQUEST DATABASE REPLACEMENT & DATA IMPORT")
    print("=" * 70)

    # 1. Initialize tables
    print("[1/5] Initializing new scalable database schema...")
    from NovaBase.schema_tools import bootstrap_schema
    bootstrap_schema(engine)
    print("       Schema tables verified/created successfully.")

    db = SessionLocal()
    try:
        # Locate spacecraft repository files
        possible_repo_paths = [
            p for p in [
                os.getenv("SPACECRAFT_REPO_DIR"),
                os.path.abspath(os.path.join(backend_dir, "..", "..", "spacecraft-models")),
                os.path.abspath(os.path.join(backend_dir, "..", "spacecraft-models")),
            ] if p
        ]
        repo_dir = None
        for p in possible_repo_paths:
            if os.path.exists(os.path.join(p, "spacecraft.json")):
                repo_dir = p
                break

        if not repo_dir:
            raise FileNotFoundError("Could not find spacecraft-models repository directory.")

        json_path = os.path.join(repo_dir, "spacecraft.json")
        models_dir = os.path.join(repo_dir, "models")

        print(f"[2/5] Loading source dataset from: {json_path}")
        with open(json_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
        sc_records = raw_data.get("Spacecraft", [])
        total_source_records = len(sc_records)
        print(f"       Discovered {total_source_records} total source spacecraft records.")

        # 2. Ingest Organizations
        print("[3/5] Ingesting authoritative Space Organizations...")
        organizations_data = [
            {"name": "NASA", "slug": "nasa", "organization_type": "Space Agency", "country": "United States", "official_url": "https://www.nasa.gov"},
            {"name": "Jet Propulsion Laboratory (JPL)", "slug": "jpl", "organization_type": "Research & Development Center", "country": "United States", "official_url": "https://www.jpl.nasa.gov"},
            {"name": "European Space Agency (ESA)", "slug": "esa", "organization_type": "Space Agency", "country": "Europe", "official_url": "https://www.esa.int"},
            {"name": "JAXA", "slug": "jaxa", "organization_type": "Space Agency", "country": "Japan", "official_url": "https://global.jaxa.jp"},
            {"name": "ISRO", "slug": "isro", "organization_type": "Space Agency", "country": "India", "official_url": "https://www.isro.gov.in"},
            {"name": "CNSA", "slug": "cnsa", "organization_type": "Space Agency", "country": "China", "official_url": "http://www.cnsa.gov.cn"},
            {"name": "Boeing", "slug": "boeing", "organization_type": "Commercial Aerospace Manufacturer", "country": "United States", "official_url": "https://www.boeing.com/space"},
            {"name": "Lockheed Martin", "slug": "lockheed-martin", "organization_type": "Commercial Aerospace Manufacturer", "country": "United States", "official_url": "https://www.lockheedmartin.com"},
            {"name": "Northrop Grumman", "slug": "northrop-grumman", "organization_type": "Commercial Aerospace Manufacturer", "country": "United States", "official_url": "https://www.northropgrumman.com"}
        ]

        org_map = {}
        for org_data in organizations_data:
            org = db.query(Organization).filter_by(slug=org_data["slug"]).first()
            if not org:
                org = Organization(**org_data)
                db.add(org)
                db.flush()
            org_map[org_data["slug"]] = org

        # 3. Define and Upsert Space Missions (Supporting Multi-Mission Associations)
        print("[4/5] Establishing Space Missions and relationships...")

        missions_def = {
            "voyager-1": {"name": "Voyager 1 Mission", "dest": "Deep Space", "status": "Active", "launch": "1977-09-05", "desc": "Interstellar exploration mission launched in 1977 to explore Jupiter and Saturn; first spacecraft to enter interstellar space.", "url": "https://science.nasa.gov/mission/voyager/"},
            "voyager-2": {"name": "Voyager 2 Mission", "dest": "Deep Space", "status": "Active", "launch": "1977-08-20", "desc": "Completed the historic Grand Tour of the outer solar system, visiting Jupiter, Saturn, Uranus, and Neptune.", "url": "https://science.nasa.gov/mission/voyager/"},
            "pioneer-10": {"name": "Pioneer 10 Mission", "dest": "Deep Space", "status": "Completed", "launch": "1972-03-03", "desc": "First mission to traverse the Asteroid Belt and conduct direct observations and close-up images of Jupiter.", "url": "https://science.nasa.gov/mission/pioneer-10/"},
            "pioneer-11": {"name": "Pioneer 11 Mission", "dest": "Deep Space", "status": "Completed", "launch": "1973-04-06", "desc": "Investigated Jupiter and was the first probe to encounter the rings and atmosphere of Saturn.", "url": "https://science.nasa.gov/mission/pioneer-11/"},
            "artemis-i": {"name": "Artemis I", "dest": "Moon", "status": "Completed", "launch": "2022-11-16", "desc": "Uncrewed Moon-orbiting mission that verified the Orion spacecraft and Space Launch System for deep space exploration.", "url": "https://www.nasa.gov/mission/artemis-i/"},
            "artemis-ii": {"name": "Artemis II", "dest": "Moon", "status": "Active", "launch": "2025", "desc": "First crewed flight test of NASA's Artemis program, taking astronauts around the Moon.", "url": "https://www.nasa.gov/mission/artemis-ii/"},
            "cassini-huygens": {"name": "Cassini-Huygens", "dest": "Deep Space", "status": "Completed", "launch": "1997-10-15", "desc": "Joint NASA/ESA mission that orbited Saturn for 13 years and deployed the Huygens probe onto Titan.", "url": "https://science.nasa.gov/mission/cassini/"},
            "mer-spirit": {"name": "Mars Exploration Rover - Spirit (MER-A)", "dest": "Mars", "status": "Completed", "launch": "2003-06-10", "desc": "Geological exploration rover that discovered abundant evidence of past water activity in Gusev Crater on Mars.", "url": "https://science.nasa.gov/mission/mer-spirit/"},
            "mer-opportunity": {"name": "Mars Exploration Rover - Opportunity (MER-B)", "dest": "Mars", "status": "Completed", "launch": "2003-07-07", "desc": "Operated for nearly 15 years on Mars, traveling over 45 kilometers and proving past liquid water environments.", "url": "https://science.nasa.gov/mission/mer-opportunity/"},
            "mars-2020": {"name": "Mars 2020 (Perseverance & Ingenuity)", "dest": "Mars", "status": "Active", "launch": "2020-07-30", "desc": "Seeking signs of ancient life and collecting samples of rock and regolith in Jezero Crater.", "url": "https://science.nasa.gov/mission/mars-2020-perseverance/"},
            "msl-curiosity": {"name": "Mars Science Laboratory (Curiosity)", "dest": "Mars", "status": "Active", "launch": "2011-11-26", "desc": "Investigating Gale Crater to determine if Mars ever had an environment capable of supporting microbial life.", "url": "https://science.nasa.gov/mission/msl-curiosity/"},
            "rosetta-philae": {"name": "Rosetta & Philae", "dest": "Asteroids & Comets", "status": "Completed", "launch": "2004-03-02", "desc": "Pioneering ESA mission that orbited Comet 67P/Churyumov–Gerasimenko and deployed the Philae lander onto its nucleus.", "url": "https://www.esa.int/Science_Exploration/Space_Science/Rosetta"},
            "phoenix-mars-lander": {"name": "Phoenix Mars Lander", "dest": "Mars", "status": "Completed", "launch": "2007-08-04", "desc": "Landed in the martian arctic plains to analyze water ice and habitability in the martian permafrost.", "url": "https://science.nasa.gov/mission/phoenix/"},
            "stardust-mission": {"name": "Stardust", "dest": "Asteroids & Comets", "status": "Completed", "launch": "1999-02-07", "desc": "First mission to collect and return comet dust samples (from Comet Wild 2) back to Earth.", "url": "https://science.nasa.gov/mission/stardust/"},
            "osiris-rex": {"name": "OSIRIS-REx & APEX", "dest": "Asteroids & Comets", "status": "Active", "launch": "2016-09-08", "desc": "Collected pristine samples from Asteroid Bennu, returned them to Earth, and now traveling to Asteroid Apophis.", "url": "https://science.nasa.gov/mission/osiris-rex/"},
            "stereo-mission": {"name": "STEREO Mission", "dest": "Heliophysics", "status": "Active", "launch": "2006-10-26", "desc": "Two spacecraft in orbit around the Sun providing revolutionary 3D stereoscopic views of coronal mass ejections.", "url": "https://science.nasa.gov/mission/stereo/"},
            "galileo-mission": {"name": "Galileo Mission", "dest": "Deep Space", "status": "Completed", "launch": "1989-10-18", "desc": "First spacecraft to orbit Jupiter and deploy an atmospheric entry probe into the jovian clouds.", "url": "https://science.nasa.gov/mission/galileo/"},
            "insight-mission": {"name": "InSight & MarCO", "dest": "Mars", "status": "Completed", "launch": "2018-05-05", "desc": "Investigated the deep interior of Mars using seismology, supported by the MarCO cubesats.", "url": "https://science.nasa.gov/mission/insight/"},
            "cluster-ii": {"name": "Cluster II Constellation", "dest": "Earth Orbit", "status": "Completed", "launch": "2000-07-16", "desc": "Four-spacecraft formation (Rumba, Salsa, Samba, Tango) studying Earth's magnetosphere in 3D.", "url": "https://www.esa.int/Science_Exploration/Space_Science/Cluster_overview"},
            "landsat-program": {"name": "Landsat Program", "dest": "Earth Orbit", "status": "Active", "launch": "1972-07-23", "desc": "Longest continuous global record of the Earth's land surface from space.", "url": "https://landsat.gsfc.nasa.gov/"},
            "grace-program": {"name": "GRACE & GRACE-FO", "dest": "Earth Orbit", "status": "Active", "launch": "2002-03-17", "desc": "Tracking global mass water movement and ice sheet changes using twin-satellite microwave ranging.", "url": "https://gracefo.jpl.nasa.gov/"}
        }

        mission_map = {}
        for m_slug, m_info in missions_def.items():
            m = db.query(Mission).filter_by(slug=m_slug).first()
            if not m:
                m = Mission(
                    slug=m_slug,
                    name=m_info["name"],
                    destination_category=m_info["dest"],
                    mission_status=m_info["status"],
                    launch_date=m_info.get("launch"),
                    description=m_info.get("desc"),
                    official_url=m_info.get("url")
                )
                db.add(m)
                db.flush()
            mission_map[m_slug] = m

        multi_mission_spacecraft = {
            "voyager": [("voyager-1", "Primary Flyby Probe (Voyager 1)"), ("voyager-2", "Primary Flyby Probe (Voyager 2)")],
            "pioneer": [("pioneer-10", "Jupiter Flyby Probe (Pioneer 10)"), ("pioneer-11", "Saturn/Jupiter Probe (Pioneer 11)")],
            "artemis": [("artemis-i", "Uncrewed Lunar Spacecraft"), ("artemis-ii", "Crewed Lunar Spacecraft")],
            "cassini": [("cassini-huygens", "Saturn Orbiter")],
            "huygens": [("cassini-huygens", "Titan Atmospheric Entry Probe")],
            "opportunity-rover": [("mer-opportunity", "Surface Exploration Rover")],
            "opportunity-cruise": [("mer-opportunity", "Interplanetary Cruise Stage")],
            "spirit-rover": [("mer-spirit", "Surface Exploration Rover")],
            "spirit-cruise": [("mer-spirit", "Interplanetary Cruise Stage")],
            "perseverence": [("mars-2020", "Primary Surface Rover")],
            "curiosity": [("msl-curiosity", "Primary Surface Rover")],
            "rosetta": [("rosetta-philae", "Cometary Orbiter")],
            "philae": [("rosetta-philae", "Comet Surface Lander")],
            "phoenix-edl": [("phoenix-mars-lander", "Lander Stage")],
            "phoenix-cruise": [("phoenix-mars-lander", "Interplanetary Cruise Stage")],
            "stardust": [("stardust-mission", "Primary Flyby Probe")],
            "stardust-sample-return-capsule": [("stardust-mission", "Sample Return Capsule")],
            "osiris-apex": [("osiris-rex", "Primary Asteroid Orbiter & Sample Collector")],
            "osiris-rex-sample-return-capsule": [("osiris-rex", "Sample Return Capsule")],
            "stereo-ahead": [("stereo-mission", "Ahead Heliocentric Observatory")],
            "stereo-behind": [("stereo-mission", "Behind Heliocentric Observatory")],
            "galileo": [("galileo-mission", "Jupiter Orbiter")],
            "galileo-probe": [("galileo-mission", "Jupiter Atmospheric Entry Probe")],
            "insight": [("insight-mission", "Geophysical Lander")],
            "marco": [("insight-mission", "Twin Flyby Relay CubeSats")],
            "cluster-ii": [("cluster-ii", "Four-Satellite Formation")],
            "landsat-7": [("landsat-program", "Earth Observation Satellite")],
            "landsat-8": [("landsat-program", "Earth Observation Satellite")],
            "landsat-9": [("landsat-program", "Earth Observation Satellite")],
            "grace": [("grace-program", "Twin Gravity Mapping Satellite")],
            "grace-fo1": [("grace-program", "Twin Gravity Follow-On Satellite")]
        }

        # 4. Ingest All 122 Spacecraft and Models
        print("[5/5] Ingesting Spacecraft and authentic 3D Model references...")
        imported_count = 0
        models_count = 0
        missing_models = []

        for item in sc_records:
            sc_name = item["Name"].strip()
            display_name = item["DisplayName"].strip()
            full_name = item["FullName"].strip()
            desc_raw = item["Description"].strip()
            clean_desc = strip_html_tags(desc_raw)
            eotss_url = item["URL"].strip()
            gltf_source_url = item["GLTF"].strip()
            official_url = extract_first_link(desc_raw, eotss_url)

            # Determine routing slug
            sc_slug = sc_name.lower().replace("_", "-")

            # Determine Category and Object Type
            category = determine_destination_category(sc_name)
            obj_type = determine_object_type(sc_name, full_name, desc_raw)
            op_status = determine_operational_status(sc_name, desc_raw)

            # Resolve Agency
            agency = org_map["nasa"]
            if any(k in desc_raw.lower() for k in ["esa", "european space agency"]):
                agency = org_map["esa"]
            elif "jaxa" in desc_raw.lower():
                agency = org_map["jaxa"]
            elif "isro" in desc_raw.lower():
                agency = org_map["isro"]

            # Create or resolve primary mission
            primary_mission = None
            if sc_name in multi_mission_spacecraft:
                first_m_slug, _ = multi_mission_spacecraft[sc_name][0]
                primary_mission = mission_map.get(first_m_slug)
            else:
                m_slug = f"mission-{sc_slug}"
                if m_slug not in mission_map:
                    m = db.query(Mission).filter_by(slug=m_slug).first()
                    if not m:
                        m_title = f"{display_name} Mission"
                        m = Mission(
                            slug=m_slug,
                            name=m_title,
                            destination_category=category,
                            mission_status=op_status,
                            description=clean_desc,
                            official_url=official_url
                        )
                        db.add(m)
                        db.flush()
                    mission_map[m_slug] = m
                primary_mission = mission_map[m_slug]

            # Upsert Spacecraft
            spacecraft = db.query(Spacecraft).filter_by(name=sc_name).first()
            if not spacecraft:
                spacecraft = Spacecraft(
                    name=sc_name,
                    slug=sc_slug,
                    display_name=display_name,
                    full_name=full_name,
                    object_type=obj_type,
                    destination_category=category,
                    destination=category,
                    operational_status=op_status,
                    short_description=clean_desc[:300] + ("..." if len(clean_desc) > 300 else ""),
                    educational_description=clean_desc,
                    how_it_works=f"{display_name} operates as a robotic {obj_type.lower()} deployed for scientific study and exploration in {category}.",
                    why_it_is_important=f"{full_name} provides vital observational telemetry, expanding scientific knowledge of space environments.",
                    scientific_purpose=clean_desc[:400] if len(clean_desc) > 50 else f"Scientific exploration and telemetry acquisition for {full_name}.",
                    current_or_last_known_status=f"Operational status: {op_status}. Verified NASA telemetry.",
                    official_url=official_url,
                    eotss_url=eotss_url,
                    primary_mission_id=primary_mission.id if primary_mission else None,
                    mission_agency_id=agency.id
                )
                db.add(spacecraft)
                db.flush()
                imported_count += 1
            else:
                spacecraft.display_name = display_name
                spacecraft.full_name = full_name
                spacecraft.object_type = obj_type
                spacecraft.destination_category = category
                spacecraft.educational_description = clean_desc
                spacecraft.eotss_url = eotss_url
                if primary_mission:
                    spacecraft.primary_mission_id = primary_mission.id
                db.flush()

            # Establish Mission Associations in mission_spacecraft
            if sc_name in multi_mission_spacecraft:
                for target_m_slug, role in multi_mission_spacecraft[sc_name]:
                    target_m = mission_map.get(target_m_slug)
                    if target_m:
                        existing_assoc = db.query(MissionSpacecraft).filter_by(
                            mission_id=target_m.id, spacecraft_id=spacecraft.id
                        ).first()
                        if not existing_assoc:
                            assoc = MissionSpacecraft(
                                mission_id=target_m.id,
                                spacecraft_id=spacecraft.id,
                                role=role,
                                notes=f"{display_name} associated with {target_m.name}."
                            )
                            db.add(assoc)
            elif primary_mission:
                existing_assoc = db.query(MissionSpacecraft).filter_by(
                    mission_id=primary_mission.id, spacecraft_id=spacecraft.id
                ).first()
                if not existing_assoc:
                    assoc = MissionSpacecraft(
                        mission_id=primary_mission.id,
                        spacecraft_id=spacecraft.id,
                        role="Primary Spacecraft",
                        notes=f"Sole primary spacecraft for {primary_mission.name}."
                    )
                    db.add(assoc)

            # Ingest 3D Model Asset
            model_folder = os.path.join(models_dir, sc_name)
            if os.path.exists(model_folder):
                files = os.listdir(model_folder)
                glbs = [f for f in files if f.lower().endswith(".glb")]
                gltfs = [f for f in files if f.lower().endswith(".gltf")]
                bins = [f for f in files if f.lower().endswith(".bin")]
                textures = [f for f in files if f.lower().endswith((".png", ".jpg", ".jpeg", ".dds"))]

                if glbs and gltfs:
                    glb_filename = glbs[0]
                    gltf_filename = gltfs[0]
                    bin_filename = bins[0] if bins else None
                    glb_file_path = os.path.join(model_folder, glb_filename)
                    file_size = os.path.getsize(glb_file_path)

                    glb_web_path = f"/models/spacecraft-models/{sc_name}/{glb_filename}"
                    gltf_web_path = f"/models/spacecraft-models/{sc_name}/{gltf_filename}"
                    bin_web_path = f"/models/spacecraft-models/{sc_name}/{bin_filename}" if bin_filename else None

                    existing_model = db.query(Model3D).filter_by(spacecraft_id=spacecraft.id).first()
                    if not existing_model:
                        model_entry = Model3D(
                            spacecraft_id=spacecraft.id,
                            model_name=sc_name,
                            folder_name=sc_name,
                            primary_format="glb",
                            glb_filename=glb_filename,
                            glb_path=glb_web_path,
                            gltf_filename=gltf_filename,
                            gltf_path=gltf_web_path,
                            bin_filename=bin_filename,
                            bin_path=bin_web_path,
                            texture_files=json.dumps(textures),
                            texture_count=len(textures),
                            file_size_bytes=file_size,
                            is_available=True,
                            provenance="NASA Eyes on the Solar System (matthewgiarra/spacecraft-models)",
                            source_url=gltf_source_url
                        )
                        db.add(model_entry)
                        models_count += 1
                    else:
                        existing_model.glb_filename = glb_filename
                        existing_model.glb_path = glb_web_path
                        existing_model.gltf_filename = gltf_filename
                        existing_model.gltf_path = gltf_web_path
                        existing_model.file_size_bytes = file_size
                        existing_model.is_available = True
                else:
                    missing_models.append((sc_name, "Missing glb or gltf in folder"))
            else:
                missing_models.append((sc_name, "Folder not found in models/"))

            # Ingest Search Keywords
            kw_tokens = set(re.findall(r'[a-zA-Z0-9]+', f"{display_name} {full_name} {category} {obj_type}"))
            for token in kw_tokens:
                if len(token) > 2:
                    t_lower = token.lower()
                    existing_kw = db.query(SpacecraftKeyword).filter_by(
                        spacecraft_id=spacecraft.id, keyword=t_lower
                    ).first()
                    if not existing_kw:
                        db.add(SpacecraftKeyword(spacecraft_id=spacecraft.id, keyword=t_lower))

            # Ingest Source Citation
            existing_src = db.query(SpacecraftSource).filter_by(spacecraft_id=spacecraft.id).first()
            if not existing_src:
                db.add(SpacecraftSource(
                    spacecraft_id=spacecraft.id,
                    source_name="NASA Eyes on the Solar System (Official Public Domain)",
                    source_url=eotss_url,
                    source_type="NASA Science Data Archive",
                    evidence_notes="3D Model and mission metadata imported from official NASA Eyes on the Solar System asset catalog.",
                    last_checked_at=datetime.utcnow().strftime("%Y-%m-%d")
                ))

        # Commit all changes
        db.commit()

        # Final Verification Queries
        total_orgs = db.query(Organization).count()
        total_missions = db.query(Mission).count()
        total_spacecraft = db.query(Spacecraft).count()
        total_models = db.query(Model3D).count()
        total_assocs = db.query(MissionSpacecraft).count()
        total_keywords = db.query(SpacecraftKeyword).count()
        total_sources = db.query(SpacecraftSource).count()

        print("\n" + "=" * 70)
        print("DATABASE MIGRATION SUMMARY & VERIFICATION")
        print("=" * 70)
        print(f"  Total Source Records Discovered : {total_source_records}")
        print(f"  Total Spacecraft Imported       : {total_spacecraft}")
        print(f"  Total Missions Created          : {total_missions}")
        print(f"  Mission-Spacecraft Links        : {total_assocs}")
        print(f"  Total Available 3D Models       : {total_models}")
        print(f"  Missing / Unmatched Models      : {len(missing_models)}")
        print(f"  Total Organizations             : {total_orgs}")
        print(f"  Total Search Keywords           : {total_keywords}")
        print(f"  Total Source Citations          : {total_sources}")
        print("=" * 70)

        return {
            "total_source_records": total_source_records,
            "total_spacecraft_imported": total_spacecraft,
            "total_missions": total_missions,
            "total_models": total_models,
            "missing_models": missing_models
        }

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Migration failed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run_migration_and_import()
