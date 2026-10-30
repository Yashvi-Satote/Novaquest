"""
Idempotent ingestion of the full 250-mission catalogue for Novaquest.
This script preserves existing records, adds missing missions/hardware,
and links to verified official sources where possible.
"""
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import Organization, Mission, Hardware, HardwareAlias, HardwareKeyword, HardwareImage, HardwareSource
from mission_hierarchy import apply_mission_classifications, ensure_mission_hierarchy_schema


CATALOGUE = [
    # A. Lunar Exploration (1-75)
    "Pioneer 0", "Pioneer 1", "Pioneer 3", "Luna 1", "Pioneer 4", "Luna 2", "Luna 3",
    "Ranger 1", "Ranger 2", "Ranger 3", "Ranger 4", "Ranger 5", "Luna 4", "Ranger 6",
    "Ranger 7", "Ranger 8", "Ranger 9", "Luna 5", "Luna 6", "Zond 3", "Luna 7", "Luna 8",
    "Luna 9", "Luna 10", "Surveyor 1", "Lunar Orbiter 1", "Luna 11", "Surveyor 2",
    "Lunar Orbiter 2", "Luna 12", "Luna 13", "Lunar Orbiter 3", "Surveyor 3",
    "Lunar Orbiter 4", "Surveyor 4", "Explorer 35 (IMP-E)", "Lunar Orbiter 5",
    "Surveyor 5", "Surveyor 6", "Surveyor 7", "Zond 5", "Luna 14", "Zond 6", "Zond 7",
    "Luna 15", "Zond 8", "Luna 16", "Luna 17 / Lunokhod 1", "Luna 18", "Luna 19",
    "Luna 20", "Luna 21 / Lunokhod 2", "Luna 22", "Luna 23", "Luna 24",
    "Hiten / Hagoromo", "Clementine", "Lunar Prospector", "SMART-1", "SELENE / Kaguya",
    "Chang'e 1", "Chandrayaan-1 / MIP", "LRO (Lunar Reconnaissance Orbiter)", "LCROSS",
    "Chang'e 2", "GRAIL A/B (Ebb & Flow)", "LADEE", "Chang'e 3 / Yutu",
    "Manfred Memorial Moon Mission (4M)", "Chang'e 4 / Yutu-2", "Beresheet",
    "Chandrayaan-2 (Orbiter/Vikram)", "Chang'e 5", "CAPSTONE", "Hakuto-R Mission 1",
    # B. Inner Planets
    "Sputnik 7", "Venera 1", "Mariner 1", "Mariner 2", "Venera 2", "Venera 3", "Venera 4",
    "Mariner 5", "Venera 5", "Venera 6", "Venera 7", "Venera 8", "Mariner 10",
    "Venera 9", "Venera 10", "Pioneer Venus Orbiter", "Pioneer Venus Multiprobe",
    "Venera 11", "Venera 12", "Venera 13", "Venera 14", "Venera 15", "Venera 16",
    "Vega 1", "Vega 2", "Magellan", "MESSENGER", "Venus Express", "Akatsuki",
    "BepiColombo", "Chandrayaan-3", "SLIM (Smart Lander for Investigating Moon)",
    "Peregrine Mission One", "Intuitive Machines IM-1 (Odysseus)", "Chang'e 6",
    "Luna 25", "Venus Flyby (Galileo)", "Venus Flyby (Cassini)", "Venus Flyby (BepiColombo)",
    "Venus Flyby (JUICE)",
    # C. Mars
    "Mars 1M No.1", "Mars 1M No.2", "Mars 2MV-4 No.1", "Mars 1", "Mars 2MV-3 No.1",
    "Mariner 3", "Mariner 4", "Zond 2", "Mariner 6", "Mariner 7", "Mars 1969A",
    "Mars 1969B", "Mariner 8", "Kosmos 419", "Mars 2", "Mars 3", "Mariner 9", "Mars 4",
    "Mars 5", "Mars 6", "Mars 7", "Viking 1", "Viking 2", "Phobos 1", "Phobos 2",
    "Mars Observer", "Mars Global Surveyor", "Mars 96", "Mars Pathfinder / Sojourner",
    "Nozomi", "Mars Climate Orbiter", "Mars Polar Lander / Deep Space 2",
    "2001 Mars Odyssey", "Mars Express / Beagle 2", "Spirit (MER-A)", "Opportunity (MER-B)",
    "Mars Reconnaissance Orbiter (MRO)", "Phoenix", "Phobos-Grunt / Yinghuo-1",
    "Curiosity (Mars Science Laboratory)", "MAVEN", "Mangalyaan (Mars Orbiter Mission)",
    "ExoMars Trace Gas Orbiter / Schiaparelli", "InSight", "MarCO A / B",
    "Emirates Mars Mission (Hope Probe)", "Tianwen-1 / Zhurong", "Perseverance / Ingenuity",
    "EscaPADE", "Mars 1962A", "Mars 1962B", "Mars 3MV-1 No.1", "Mariner 7 Flyby",
    "Viking 1 Orbiter", "Viking 2 Orbiter", "Rosetta Mars Flyby", "Dawn Mars Flyby",
    "Lucy Mars Flyby", "Psyche Mars Flyby", "JUICE Mars Flyby",
    # D. Asteroids/Comets/Small Bodies
    "ICE (International Cometary Explorer)", "Giotto", "Suisei", "Sakigake", "Vega 1 Comet Flyby",
    "Vega 2 Comet Flyby", "Galileo / Gaspra Flyby", "Galileo / Ida & Dactyl Flyby",
    "NEAR Shoemaker", "Deep Space 1", "Stardust", "CONTOUR", "Hayabusa (MUSES-C)",
    "Rosetta / Philae", "Deep Impact / EPOXI", "Dawn", "Chang'e 2 Flyby", "Hayabusa2",
    "OSIRIS-REx / APEX", "Lucy", "DART (Double Asteroid Redirection Test)", "NEA Scout",
    "Psyche", "Hera", "Stardust-NExT / Tempel 1", "New Horizons Arrokoth Flyby", "Proba-3",
    "Ariel", "Comet Interceptor", "MMX (Martian Moons eXploration)", "DESTINY+", "Tianwen-2",
    "Janus", "RAMSES", "Zhurong Standby",
    # E. Outer Planets/Deep Space
    "Pioneer 10", "Pioneer 11", "Helios-A", "Helios-B", "Voyager 2", "Voyager 1",
    "Ulysses", "Galileo", "Cassini-Huygens", "Genesis", "STEREO-A", "STEREO-B",
    "New Horizons", "Juno", "DSCOVR", "Parker Solar Probe", "Solar Orbiter", "Aditya-L1",
    "JUICE (Jupiter Icy Moons Explorer)", "Europa Clipper", "Dragonfly", "Vanguard 1",
    "Explorer 6", "Pioneer 5", "IMP-1 (Explorer 18)", "Pioneer 6", "Pioneer 7", "Pioneer 8",
    "Pioneer 9", "Pioneer E", "ISEE-1 / ISEE-2", "SOHO", "ACE (Advanced Composition Explorer)",
    "WIND", "IMAGE", "James Webb Space Telescope (JWST)", "Euclid",
    "Xuntian Space Telescope (CSST)", "Nancy Grace Roman Space Telescope", "VERITAS",
]


def slugify(name):
    import re
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'-+', '-', s)
    s = s.strip('-')
    return s


def get_or_create_org(db, org_map, slug, name, org_type='Space Agency', country=None, url=None):
    if slug in org_map:
        return org_map[slug]
    existing = db.query(Organization).filter_by(slug=slug).first()
    if existing:
        org_map[slug] = existing
        return existing
    org = Organization(name=name, slug=slug, organization_type=org_type, country=country, official_url=url)
    db.add(org)
    db.flush()
    org_map[slug] = org
    return org


def get_or_create_mission(db, mm, slug, name, dest_cat, status='Completed', desc=None, url=None):
    if slug in mm:
        return mm[slug]
    existing = db.query(Mission).filter((Mission.slug==slug)|(Mission.name==name)).first()
    if existing:
        mm[slug] = existing
        return existing
    mission = Mission(
        name=name,
        slug=slug,
        destination_category=dest_cat,
        launch_date=None,
        mission_end_date=None,
        mission_status=status,
        description=desc or f"{name} mission catalogue entry.",
        official_url=url
    )
    db.add(mission)
    try:
        db.flush()
    except Exception:
        db.rollback()
        existing = db.query(Mission).filter((Mission.slug==slug)|(Mission.name==name)).first()
        if existing:
            mm[slug] = existing
            return existing
        raise
    mm[slug] = mission
    return mission


def classify_dest(name):
    name_l = name.lower()
    if any(k in name_l for k in ['moon', 'luna', 'ranger', 'surveyor', 'lunar orbiter', 'apollo', 'chang\'e', 'chandrayaan', 'hiten', 'clementine', 'lro', 'lcross', 'grail', 'ladee', 'beresheet', 'manfred', 'slim', 'peregrine', 'odysseus', 'capstone', 'hakuto']):
        # Some in B list are marked lunar - Chandrayaan-3 is lunar (we need to check)
        if 'chandrayaan-3' in name_l or 'slim' in name_l or 'peregrine' in name_l or 'odysseus' in name_l or "luna 25" in name_l or "chang'e 6" in name_l:
            return "Moon"
        return "Moon"
    if any(k in name_l for k in ['mars', 'viking', 'spirit', 'opportunity', 'curiosity', 'perseverance', 'ingenuity', 'phobos', 'deimos', 'mangalyaan', 'hope', 'tianwen-1', 'zhurong', 'insight', 'pathfinder', 'sojourner', 'phoenix', 'odyssey', 'mro', 'maven']):
        return "Mars"
    if any(k in name_l for k in ['venus', 'venera', 'pioneer venus', 'magellan', 'venus express', 'akatsuki', 'vega']):
        return "Venus"
    if any(k in name_l for k in ['mercury', 'messenger', 'bepi']):
        return "Mercury"
    if any(k in name_l for k in ['jupiter', 'galileo', 'juno', 'juice', 'europa clipper']):
        return "Jupiter"
    if any(k in name_l for k in ['saturn', 'cassini']):
        return "Saturn"
    if any(k in name_l for k in ['asteroid', 'comet', 'near shoemaker', 'hayabusa', 'dawn', 'rosetta', 'stardust', 'osiris', 'dart', 'lucy', 'psyche', 'hera', 'ryugu', 'bennu']):
        return "Asteroids/Comets"
    if any(k in name_l for k in ['pluto', 'arrokoth', 'new horizons']):
        return "Deep Space"
    if any(k in name_l for k in ['voyager', 'pioneer 10', 'pioneer 11', 'helios', 'ulysses']):
        return "Deep Space"
    if any(k in name_l for k in ['telescope', 'jwst', 'hubble', 'spitzer', 'kepler', 'tess', 'webb', 'euclid', 'xuntian', 'roman', 'soho', 'ace', 'stereo', 'dscovr', 'aditya', 'parker', 'solar orbiter']):
        return "Deep Space"
    if any(k in name_l for k in ['iss', 'sputnik', 'vanguard', 'explorer', 'imp-', 'isee']):
        # Some are earth orbit
        if 'iss' in name_l or name_l.startswith('sputnik') and '7' in name_l or name_l in ['vanguard 1', 'explorer 6']:
            # Need to be careful
            pass
    return "Deep Space"


def ingest():
    print("=" * 60)
    print("Novaquest - Full 250-Mission Catalogue Ingestion")
    print("=" * 60)
    Base.metadata.create_all(bind=engine)
    ensure_mission_hierarchy_schema(engine)
    db = SessionLocal()
    try:
        org_map = {o.slug: o for o in db.query(Organization).all()}
        mm = {m.slug: m for m in db.query(Mission).all()}
        seen_hw = {h.slug for h in db.query(Hardware).all()}
        seen_hw_names = {h.name.lower() for h in db.query(Hardware).all()}

        # Ensure core orgs
        get_or_create_org(db, org_map, 'nasa', 'NASA', 'Space Agency', 'United States', 'https://www.nasa.gov')
        get_or_create_org(db, org_map, 'esa', 'European Space Agency (ESA)', 'Space Agency', 'Europe', 'https://www.esa.int')
        get_or_create_org(db, org_map, 'roscosmos', 'Roscosmos', 'Space Agency', 'Russia', 'https://www.roscosmos.ru')
        get_or_create_org(db, org_map, 'isro', 'Indian Space Research Organisation (ISRO)', 'Space Agency', 'India', 'https://www.isro.gov.in')
        get_or_create_org(db, org_map, 'jaxa', 'Japan Aerospace Exploration Agency (JAXA)', 'Space Agency', 'Japan', 'https://global.jaxa.jp')
        get_or_create_org(db, org_map, 'cnsa', 'China National Space Administration (CNSA)', 'Space Agency', 'China', 'http://www.cnsa.gov.cn')
        get_or_create_org(db, org_map, 'jpl', 'Jet Propulsion Laboratory (JPL)', 'Research & Development Center', 'United States', 'https://www.jpl.nasa.gov')

        processed = 0
        added_hw = 0
        matched = 0
        unresolved = []

        for i, cat_name in enumerate(CATALOGUE, 1):
            processed += 1
            slug = slugify(cat_name)
            # Check if already exists
            existing_m = db.query(Mission).filter((Mission.slug==slug)|(Mission.name==cat_name)).first()
            existing_hw = db.query(Hardware).filter((Hardware.slug==slug)|(Hardware.name.ilike(cat_name.split('/')[0].strip()))).first()
            if existing_hw or existing_m:
                matched += 1
                continue  # Preserve existing
            # Create mission record
            dest = classify_dest(cat_name)
            if dest == "Venus" and any(k in cat_name.lower() for k in ['chandrayaan-3', 'slim', 'peregrine', 'odysseus', "luna 25", "chang'e 6"]):
                dest = "Moon"
            mslug = slug
            base_name = cat_name.split('/')[0].strip()
            mission = get_or_create_mission(db, mm, mslug, base_name, dest, status='Completed')
            mm[mslug] = mission

            # Create a minimal hardware entry to make it discoverable
            hslug = slug
            if hslug in seen_hw:
                continue
            hw = Hardware(
                name=base_name,
                slug=hslug,
                mission_id=mission.id,
                manufacturer_id=None,
                operator_id=None,
                mission_agency_id=None,
                object_type='Spacecraft',
                destination=dest,
                operational_status='Unknown / disputed',
                physical_status=None,
                launch_date=None,
                landing_date=None,
                decommission_date=None,
                location_description=None,
                latitude=None,
                longitude=None,
                short_description=f"Catalogue entry for {cat_name}.",
                educational_description=f"{cat_name} is listed in the Novaquest 250-mission catalogue. Further verified details to be updated from official sources.",
                how_it_works="Details pending verification from official mission records.",
                why_it_is_important="Listed as part of the complete historical mission catalogue.",
                scientific_purpose="Mission objectives pending verification from official sources.",
                current_or_last_known_status="Status pending verification from official archives.",
                hardware_materials=None,
                official_url="https://www.nasa.gov/a-to-z-of-nasa-missions/",
                verification_status="Unverified - Pending official source review",
                last_verified_at=None,
            )
            db.add(hw)
            db.flush()
            seen_hw.add(hslug)
            db.add(HardwareSource(
                hardware_id=hw.id,
                source_name="NASA A-to-Z of NASA Missions / NSSDC",
                source_url="https://www.nasa.gov/a-to-z-of-nasa-missions/",
                source_type="Official Mission Website",
                evidence_notes="Catalogue inclusion from provided list; URL needs per-mission verification",
                last_checked_at=datetime.utcnow().strftime('%Y-%m-%d')
            ))
            added_hw += 1

        db.commit()
        apply_mission_classifications(db)
        print(f"Processed: {processed}")
        print(f"Matched existing: {matched}")
        print(f"Added new hardware entries: {added_hw}")
        total_hw = db.query(Hardware).count()
        total_m = db.query(Mission).count()
        print(f"Totals now - Hardware: {total_hw}, Missions: {total_m}")
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == '__main__':
    ingest()
