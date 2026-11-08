"""
Full catalogue ingestion for NovaBase.

Two ingestion modes live in this module:

* ``--models-json`` (default) downloads
  https://raw.githubusercontent.com/matthewgiarra/spacecraft-models/main/viewer/models.json
  and ingests every 3D model / hardware item into the new
  ``hardware_components`` table, resolving a spacecraft row and a mission row
  for every single record.  Re-running is idempotent (upserts by stable keys).

* ``--catalogue`` runs the original 250-mission placeholder catalogue builder.

The models.json mode is deliberately strict: it validates every required field,
resolves every local asset (GLB / glTF / BIN / textures), resolves every mission,
and prints an itemised report of anything that could not be populated.
"""
import argparse
import hashlib
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import func, or_, text

from Shared.database import engine, SessionLocal, Base
from NovaBase.models import (
    Organization,
    Mission,
    Spacecraft,
    SpacecraftMission,
    SpacecraftAlias,
    SpacecraftKeyword,
    SpacecraftImage,
    SpacecraftSource,
    Model3D,
    SpacecraftModel,
    HardwareComponent,
    HardwareComponentMission,
    DataSource,
    IngestionRun,
)

# Backwards-compatible names used by the legacy --catalogue builder below.
Hardware = Spacecraft
HardwareAlias = SpacecraftAlias
HardwareKeyword = SpacecraftKeyword
HardwareImage = SpacecraftImage
HardwareSource = SpacecraftSource


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
    s = (name or "").lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'-+', '-', s)
    s = s.strip('-')
    return s


def strip_html_tags(text):
    """Convert the HTML fragments used by NASA Eyes into clean plain text."""
    if not text:
        return ""
    value = re.sub(r"(?i)<br\s*/?>", "\n", text)
    value = re.sub(r"(?i)</p\s*>", "\n\n", value)
    value = re.sub(r"(?i)<li[^>]*>", "\n- ", value)
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def extract_first_link(html_text, fallback=""):
    """Return the first absolute HTTP(S) link found in an HTML fragment."""
    if not html_text:
        return fallback or ""
    match = re.search(r"""href\s*=\s*['"]([^'"]+)['"]""", html_text, re.IGNORECASE)
    if not match:
        match = re.search(r"""https?://[^\s'"<>]+""", html_text, re.IGNORECASE)
    if not match:
        return fallback or ""
    url = html.unescape(match.group(1) if match.groups() else match.group(0))
    return url.strip() or (fallback or "")


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


# =========================================================================
# models.json HARDWARE / 3D MODEL CATALOGUE INGESTION
# =========================================================================
try:
    from pathlib import Path
except ImportError:  # pragma: no cover - pathlib is part of the stdlib
    Path = None

MODELS_JSON_URL = (
    "https://raw.githubusercontent.com/matthewgiarra/spacecraft-models/"
    "main/viewer/models.json"
)
SPACECRAFT_JSON_URL = (
    "https://raw.githubusercontent.com/matthewgiarra/spacecraft-models/"
    "main/spacecraft.json"
)
REPOSITORY_URL = "https://github.com/matthewgiarra/spacecraft-models"
RAW_REPOSITORY_BASE = (
    "https://raw.githubusercontent.com/matthewgiarra/spacecraft-models/main"
)
MODEL_RAW_BASE = RAW_REPOSITORY_BASE + "/models"
NASA_EYES_URL = "https://eyes.nasa.gov/apps/solar-system/"
NASA_3D_RESOURCES = "https://github.com/nasa/NASA-3D-Resources"
NSSDCA_URL = "https://nssdc.gsfc.nasa.gov/nmc/"
NSSDCA_QUERY_URL = "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/query?name={query}"
NSSDCA_DISPLAY_URL = "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id={nssdca_id}"
NASA_SCIENCE_MISSIONS = "https://science.nasa.gov/missions/"
WIKIMEDIA_API = "https://en.wikipedia.org/w/api.php"
WIKIMEDIA_SEARCH_API = WIKIMEDIA_API + "?action=query&list=search&format=json&srlimit=5&srsearch={query}"
WIKIMEDIA_PAGE_API = (
    WIKIMEDIA_API
    + "?action=query&format=json&prop=extracts%7Cinfo%7Crevisions%7Cpageprops"
    "&inprop=url&redirects=1&explaintext=1&exintro=1"
    "&rvprop=content&rvslots=main&titles={title}"
)
WIKIDATA_API = "https://www.wikidata.org/w/api.php"
NASA_HISTORY_URL = "https://history.nasa.gov/"

# Bump this whenever the enrichment logic changes so that previously enriched
# catalogue rows are re-checked exactly once.
ENRICHMENT_VERSION = 5

# Historical agencies for the legacy mission rows whose spacecraft records do
# not carry an agency value and whose NSSDCA page is unavailable.
MISSION_AGENCY_FALLBACK = {
    "apollo-lunar-module": "NASA",
    "apollo-lrv": "NASA",
    "surveyor-1": "NASA",
    "surveyor-3": "NASA",
    "mars-pathfinder": "NASA",
    "luna-17-lunokhod-1": "Soviet Union",
    "venera-13": "Soviet Union",
}
JPL_URL = "https://www.jpl.nasa.gov/"
JHUAPL_URL = "https://www.jhuapl.edu/"

PROJECT_ROOT = Path(backend_dir).parent
ASSET_DIR = PROJECT_ROOT / "frontend" / "public" / "assets" / "spacecraft"
FLAT_MODEL_DIR = PROJECT_ROOT / "frontend" / "public" / "models" / "spacecraft"

REQUIRED_SOURCE_FIELDS = [
    "ModelName",
    "FolderName",
    "gltfFileName",
    "glbFileName",
    "DisplayName",
    "FullName",
    "Description",
    "eotssURL",
]

REQUIRED_COMPONENT_FIELDS = [
    "component_key",
    "model_name",
    "folder_name",
    "display_name",
    "full_name",
    "component_type",
    "description",
    "description_html",
    "spacecraft_id",
    "mission_id",
    "mission_match_method",
    "mission_match_confidence",
    "eotss_url",
    "viewer_url",
    "official_url",
    "gltf_filename",
    "glb_filename",
    "bin_filename",
    "gltf_path",
    "glb_path",
    "bin_path",
    "download_gltf_url",
    "download_glb_url",
    "primary_format",
    "texture_files",
    "file_size_bytes",
    "glb_size_bytes",
    "gltf_size_bytes",
    "binary_size_bytes",
    "provenance",
    "license",
    "source_name",
    "source_url",
    "source_repository",
    "raw_json",
    "ingestion_status",
]

# Multi-model / multi-spacecraft mission families.  The key is the raw
# ModelName from models.json; the tuple is (mission slug, mission name, role).
# This is deliberately curated because these assets are phase variants or
# component-level models of a single mission (e.g. Cassini orbiter + Huygens
# probe, or Opportunity cruise stage + rover phase).
MISSION_GROUP_MAP = {
    "cassini": ("cassini-huygens", "Cassini-Huygens", "Saturn Orbiter"),
    "huygens": ("cassini-huygens", "Cassini-Huygens", "Titan Atmospheric Entry Probe"),
    "galileo": ("galileo", "Galileo", "Jupiter Orbiter"),
    "galileo-probe": ("galileo", "Galileo", "Jupiter Atmospheric Entry Probe"),
    "rosetta": ("rosetta", "Rosetta (Comet 67P Orbiter)", "Cometary Orbiter"),
    "philae": ("rosetta", "Rosetta (Comet 67P Orbiter)", "Comet Surface Lander"),
    "opportunity-cruise": (
        "opportunity",
        "Opportunity (Mars Exploration Rover B)",
        "Interplanetary Cruise Stage",
    ),
    "opportunity-rover": (
        "opportunity",
        "Opportunity (Mars Exploration Rover B)",
        "Surface Exploration Rover",
    ),
    "spirit-cruise": (
        "mer-spirit",
        "Mars Exploration Rover - Spirit (MER-A)",
        "Interplanetary Cruise Stage",
    ),
    "spirit-rover": (
        "mer-spirit",
        "Mars Exploration Rover - Spirit (MER-A)",
        "Surface Exploration Rover",
    ),
    "phoenix-cruise": ("phoenix-mars-lander", "Phoenix Mars Lander", "Interplanetary Cruise Stage"),
    "phoenix-edl": (
        "phoenix-mars-lander",
        "Phoenix Mars Lander",
        "Entry, Descent and Landing Stage",
    ),
    "osiris-apex": (
        "osiris-rex",
        "OSIRIS-REx & APEX",
        "Primary Asteroid Orbiter & Sample Collector",
    ),
    "osiris-rex-sample-return-capsule": (
        "osiris-rex",
        "OSIRIS-REx & APEX",
        "Sample Return Capsule",
    ),
    "stardust": ("stardust-mission", "Stardust", "Primary Comet Flyby Probe"),
    "stardust-sample-return-capsule": (
        "stardust-mission",
        "Stardust",
        "Sample Return Capsule",
    ),
    "stereo-ahead": ("stereo-mission", "STEREO Mission", "Ahead Heliocentric Observatory"),
    "stereo-behind": ("stereo-mission", "STEREO Mission", "Behind Heliocentric Observatory"),
    "grace": ("grace-program", "GRACE & GRACE-FO", "Twin Gravity Mapping Satellite"),
    "grace-fo1": ("grace-program", "GRACE & GRACE-FO", "Twin Gravity Follow-On Satellite"),
    "landsat-7": ("landsat-program", "Landsat Program", "Earth Observation Satellite"),
    "landsat-8": ("landsat-program", "Landsat Program", "Earth Observation Satellite"),
    "landsat-9": ("landsat-program", "Landsat Program", "Earth Observation Satellite"),
    "voyager": ("voyager-program", "Voyager Program", "Interstellar Flyby Probe (Voyagers 1 & 2)"),
    "pioneer": ("pioneer-program", "Pioneer Program", "Jupiter & Saturn Flyby Probes (Pioneer 10 & 11)"),
    "perseverence": (
        "perseverance-ingenuity",
        "Perseverance / Ingenuity",
        "Primary Surface Rover",
    ),
    "curiosity": (
        "msl-curiosity",
        "Mars Science Laboratory (Curiosity)",
        "Primary Surface Rover",
    ),
    "insight": ("insight-mission", "InSight & MarCO", "Geophysical Lander"),
    "marco": ("insight-mission", "InSight & MarCO", "Twin Flyby Relay CubeSats"),
    "mms": ("mms-mission", "Magnetospheric Multiscale (MMS)", "Four-Spacecraft Constellation"),
    "themis": ("themis-mission", "THEMIS", "Five-Spacecraft Constellation"),
    "cluster-ii": ("cluster-ii-mission", "Cluster II", "Four-Spacecraft Formation"),
    "grail": ("grail-mission", "GRAIL", "Twin Lunar Gravity Mapping Spacecraft"),
    "prefire": ("prefire-mission", "PREFIRE", "Twin CubeSats"),
    "tropics": ("tropics-mission", "TROPICS", "Constellation of SmallSats"),
    "cygnss": ("cygnss-mission", "CYGNSS", "Eight-Satellite Constellation"),
    "tdrs": (
        "tdrs-program",
        "Tracking and Data Relay Satellite (TDRS)",
        "Geostationary Relay Constellation",
    ),
    "van-allen-probe": ("van-allen-probes", "Van Allen Probes", "Twin Radiation Belt Spacecraft"),
    "sentinel-6": (
        "sentinel-6-mission",
        "Sentinel-6/6B (Michael Freilich)",
        "Ocean Altimetry Satellite",
    ),
    "aquarius": ("sac-d-mission", "Aquarius / SAC-D", "Ocean Salinity Instrument"),
    "artemis": ("artemis-program", "Artemis Program", "Orion Crew Exploration Vehicle"),
    "iss": ("iss-program", "International Space Station", "Modular Space Station"),
}

# Additional mission associations for shared / program-level hardware.
EXTRA_MISSION_LINKS = {
    "voyager": [
        {
            "slug": "voyager-1",
            "name": "Voyager 1",
            "role": "Voyager 1 flight spacecraft",
            "destination": "Deep Space",
            "mission_status": "Active",
            "agency": "NASA",
            "launch_date": "1977-09-05",
            "source_url": "https://science.nasa.gov/mission/voyager/",
        },
        {
            "slug": "voyager-2",
            "name": "Voyager 2",
            "role": "Voyager 2 flight spacecraft",
            "destination": "Deep Space",
            "mission_status": "Active",
            "agency": "NASA",
            "launch_date": "1977-08-20",
            "source_url": "https://science.nasa.gov/mission/voyager/",
        },
    ],
    "pioneer": [
        {
            "slug": "pioneer-10",
            "name": "Pioneer 10",
            "role": "Pioneer 10 flight spacecraft",
            "destination": "Deep Space",
            "mission_status": "Completed",
            "agency": "NASA",
            "launch_date": "1972-03-03",
            "source_url": "https://science.nasa.gov/mission/pioneer-10/",
        },
        {
            "slug": "pioneer-11",
            "name": "Pioneer 11",
            "role": "Pioneer 11 flight spacecraft",
            "destination": "Deep Space",
            "mission_status": "Completed",
            "agency": "NASA",
            "launch_date": "1973-04-06",
            "source_url": "https://science.nasa.gov/mission/pioneer-11/",
        },
    ],
    "artemis": [
        {
            "slug": "artemis-i",
            "name": "Artemis I",
            "role": "Artemis I Orion spacecraft",
            "destination": "Moon",
            "mission_status": "Completed",
            "agency": "NASA",
            "launch_date": "2022-11-16",
            "source_url": "https://www.nasa.gov/mission/artemis-i/",
        },
        {
            "slug": "artemis-ii",
            "name": "Artemis II",
            "role": "Artemis II Orion spacecraft",
            "destination": "Moon",
            "mission_status": "Active",
            "agency": "NASA",
            "launch_date": "2025",
            "source_url": "https://www.nasa.gov/mission/artemis-ii/",
        },
    ],
}

DATA_SOURCE_DEFINITIONS = [
    {
        "api_name": "NASA Eyes on the Solar System",
        "base_url": NASA_EYES_URL,
        "license": "Public Domain (NASA)",
        "attribution": "NASA/JPL Eyes on the Solar System - source platform for the 3D model structures and hardware assets in models.json.",
    },
    {
        "api_name": "NASA 3D Resources",
        "base_url": NASA_3D_RESOURCES,
        "license": "NASA 3D resources are free to use without copyright",
        "attribution": "Official NASA repository of spacecraft hardware meshes, textures and component metadata.",
    },
    {
        "api_name": "NASA NSSDCA Master Catalog",
        "base_url": NSSDCA_URL,
        "license": "Public Domain (NASA)",
        "attribution": "Authoritative source for spacecraft identifiers, mission timelines, launch vehicles and experiment listings.",
    },
    {
        "api_name": "NASA Science Mission Directorate",
        "base_url": NASA_SCIENCE_MISSIONS,
        "license": "Public Domain (NASA)",
        "attribution": "Official directory used to cross-reference active and historical missions, hardware and telemetry data.",
    },
    {
        "api_name": "Wikimedia REST API / MediaWiki Action API",
        "base_url": WIKIMEDIA_API,
        "license": "CC BY-SA 4.0",
        "attribution": "Used for mapping hardware text summaries, infobox specifications, launch dates and related spacecraft metadata.",
    },
    {
        "api_name": "NASA History Division",
        "base_url": NASA_HISTORY_URL,
        "license": "Public Domain (NASA)",
        "attribution": "NASA historical publications and programme records.",
    },
    {
        "api_name": "JPL Archives & Mission History",
        "base_url": JPL_URL,
        "license": "Public Domain (NASA/JPL)",
        "attribution": "Jet Propulsion Laboratory mission archives and technical history.",
    },
    {
        "api_name": "JHU Applied Physics Laboratory Technical Archives",
        "base_url": JHUAPL_URL,
        "license": "Public Domain / JHU APL terms",
        "attribution": "Johns Hopkins APL technical archives for APL-built spacecraft and instruments.",
    },
    {
        "api_name": "spacecraft-models (matthewgiarra)",
        "base_url": REPOSITORY_URL,
        "license": "NASA Public Domain assets, repository metadata",
        "attribution": "viewer/models.json and the corresponding glTF/GLB/BIN payloads.",
    },
]

ORG_DEFINITIONS = [
    ("nasa", "NASA", "Space Agency", "United States", "https://www.nasa.gov"),
    ("esa", "European Space Agency (ESA)", "Space Agency", "Europe", "https://www.esa.int"),
    ("jaxa", "Japan Aerospace Exploration Agency (JAXA)", "Space Agency", "Japan", "https://global.jaxa.jp"),
    ("isro", "Indian Space Research Organisation (ISRO)", "Space Agency", "India", "https://www.isro.gov.in"),
    ("kari", "Korea Aerospace Research Institute (KARI)", "Space Agency", "South Korea", "https://www.kari.re.kr/eng.do"),
    ("csa", "Canadian Space Agency (CSA)", "Space Agency", "Canada", "https://www.asc-csa.gc.ca/eng/"),
    ("roscosmos", "Roscosmos", "Space Agency", "Russia", "https://www.roscosmos.ru"),
    ("eumetsat", "EUMETSAT", "Space Agency", "Europe", "https://www.eumetsat.int/"),
    ("conae", "Comisión Nacional de Actividades Espaciales (CONAE)", "Space Agency", "Argentina", "https://www.argentina.gob.ar/ciencia/conae"),
    ("asi", "Italian Space Agency (ASI)", "Space Agency", "Italy", "https://www.asi.it/en/"),
    ("jpl", "Jet Propulsion Laboratory (JPL)", "Research & Development Center", "United States", JPL_URL),
]

GENERIC_MISSION_TOKENS = {
    "deep", "space", "earth", "orbit", "mars", "moon", "solar", "science",
    "exploration", "explorer", "mission", "probe", "orbiter", "lander",
    "rover", "satellite", "telescope", "observatory", "international",
    "station", "system", "survey", "program", "programme", "spacecraft",
    "the", "and", "for", "with", "from", "into", "near",
}

MOON_SLUGS = {
    "artemis", "capstone", "clementine", "danuri", "grail", "ladee",
    "lcross", "lunar-flashlight", "lunar-prospector",
    "lunar-reconnaissance-orbiter",
}
MARS_SLUGS = {
    "curiosity", "insight", "marco", "perseverence", "mars-express",
    "mars-global-surveyor", "mars-odyssey", "mars-reconnaissance-orbiter",
    "maven", "opportunity-cruise", "opportunity-rover", "phoenix-cruise",
    "phoenix-edl", "spirit-cruise", "spirit-rover", "trace-gas-orbiter",
    "escapade",
}
VENUS_SLUGS = {"magellan"}
MERCURY_SLUGS = {"messenger"}
JUPITER_SLUGS = {"juno", "galileo", "galileo-probe", "juice", "europa-clipper"}
SATURN_SLUGS = {"cassini", "huygens"}
ASTEROID_SLUGS = {
    "dart", "dawn", "deep-impact", "lucy", "near-shoemaker", "osiris-apex",
    "osiris-rex-sample-return-capsule", "psyche", "rosetta", "philae",
    "stardust", "stardust-sample-return-capsule",
}
HELIOPHYSICS_SLUGS = {
    "ace", "acrimsat", "cluster-ii", "dscovr", "geotail", "ibex", "imap",
    "image", "mms", "parker-solar-probe", "polar", "sdo",
    "solar-dynamics-observatory", "soho", "sorce", "stereo-ahead",
    "stereo-behind", "themis", "ulysses", "van-allen-probe", "wind",
}
DEEP_SPACE_SLUGS = {
    "chandra", "euclid", "hubble", "ixpe", "jwst", "kepler", "neo-surveyor",
    "new-horizons", "nustar", "pioneer", "spherex",
    "spitzer-space-telescope", "tess", "voyager",
}
EARTH_ORBIT_SLUGS = {
    "aqua", "aquarius", "aura", "biosentinel", "calipso", "cloudsat",
    "cygnss", "eo-1", "gpm", "grace", "grace-fo1", "grifex", "icesat-2",
    "iss", "jason", "landsat-7", "landsat-8", "landsat-9", "mcubed-2",
    "nisar", "oco-2", "pace", "prefire", "qikscat", "raincube",
    "sentinel-6", "smap", "starling", "suomi-npp", "swot", "tempo",
    "terra", "trmm", "tropics", "ipex",
}

APL_MISSIONS = {"messenger", "new-horizons", "dart", "parker-solar-probe"}


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def today_iso():
    return utcnow().date().isoformat()


def normalize_key(value):
    value = html.unescape(value or "").lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return " ".join(value.split())


def significant_tokens(value):
    return {
        token
        for token in normalize_key(value).split()
        if len(token) >= 3 and token not in GENERIC_MISSION_TOKENS
    }


def normalize_url(url):
    value = (url or "").strip()
    if not value:
        return ""
    if value.startswith("//"):
        return "https:" + value
    if value.startswith(("http://", "https://")):
        return value
    return "https://" + value.lstrip("/")


def quote_path_segment(value):
    return urllib.parse.quote(str(value or ""), safe="")


def extract_eotss_key(url):
    if not url:
        return ""
    match = re.search(r"#/sc_([a-z0-9_]+)", url, re.IGNORECASE)
    if not match:
        match = re.search(r"/sc_([a-z0-9_]+)", url, re.IGNORECASE)
    return match.group(1).lower() if match else ""


def extract_launch_date(description_html):
    text = strip_html_tags(description_html)
    patterns = [
        r"(?:launched|launch(?:ed)?\s+(?:on|in)|lifted off)\s+(?:on\s+)?"
        r"([A-Z][a-z]+\s+\d{1,2},\s+\d{4})",
        r"(?:launched|launch(?:ed)?\s+(?:on|in)|lifted off)\s+(?:on\s+)?"
        r"(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})",
        r"(?:launched|launch(?:ed)?\s+(?:on|in)|lifted off)\s+(?:on\s+)?"
        r"([A-Z][a-z]+\s+\d{4})",
        r"(?:launched|launch(?:ed)?\s+(?:on|in)|lifted off)\s+(?:on\s+)?"
        r"(\d{4})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def infer_component_type(model_name, display_name, full_name, description):
    slug = slugify(model_name)
    text = f"{model_name} {display_name} {full_name} {description}".lower()
    if "sample return capsule" in text or "sample-return capsule" in slug:
        return "Sample Return Capsule"
    if slug.endswith("-cruise") or "cruise phase" in text:
        return "Cruise Stage"
    if slug.endswith("-edl") or "entry, descent" in text:
        return "Entry, Descent and Landing Stage"
    if "helicopter" in text or "rotorcraft" in text:
        return "Helicopter / Rotorcraft"
    if "rover" in text:
        return "Rover"
    if "lander" in text:
        return "Lander"
    if "space station" in text or slug == "iss":
        return "Space Station"
    if "solar sail" in text:
        return "Solar Sail"
    if "telescope" in text or "observatory" in text:
        return "Space Telescope"
    if "constellation" in text or "formation" in text:
        return "Constellation"
    if "cubesat" in text or "minisat" in text or "smallsat" in text:
        return "CubeSat"
    if "probe" in text or slug in {"voyager", "pioneer", "ace"}:
        return "Probe"
    if "orbiter" in text:
        return "Orbiter"
    if "satellite" in text:
        return "Satellite"
    return "Spacecraft"


def infer_operational_status(description):
    text = (description or "").lower()
    if any(
        keyword in text
        for keyword in (
            "failed", "destroyed", "crashed", "loss of signal", "was lost",
            "contact was lost", "impacted",
        )
    ):
        return "Failed"
    if any(
        keyword in text
        for keyword in (
            "decommissioned", "retired", "inoperative", "mission ended",
            "ended its mission", "ended in", "completed its mission",
            "concluded", "no longer operating", "was a mission",
        )
    ):
        return "Completed"
    if any(
        keyword in text
        for keyword in (
            "planned", "scheduled", "will launch", "future mission",
            "in development", "to be launched",
        )
    ):
        return "Planned"
    if any(
        keyword in text
        for keyword in (
            "continues", "currently operating", "is operating", "operational",
            "active", "collects and analyzes", "is investigating", "is exploring",
        )
    ):
        return "Active"
    return "Active"


def infer_destination(model_name, display_name, full_name, description):
    slug = slugify(model_name)
    text = f"{model_name} {display_name} {full_name} {description}".lower()
    if slug in MOON_SLUGS:
        return "Moon"
    if slug in MARS_SLUGS:
        return "Mars"
    if slug in VENUS_SLUGS:
        return "Venus"
    if slug in MERCURY_SLUGS:
        return "Mercury"
    if slug in JUPITER_SLUGS:
        return "Jupiter"
    if slug in SATURN_SLUGS:
        return "Saturn"
    if slug in ASTEROID_SLUGS:
        return "Asteroids & Comets"
    if slug in HELIOPHYSICS_SLUGS:
        return "Heliophysics"
    if slug in DEEP_SPACE_SLUGS:
        return "Deep Space"
    if slug in EARTH_ORBIT_SLUGS:
        return "Earth Orbit"

    if any(keyword in text for keyword in ("lunar", "moon")):
        return "Moon"
    if "mars" in text:
        return "Mars"
    if "venus" in text:
        return "Venus"
    if "mercury" in text:
        return "Mercury"
    if any(keyword in text for keyword in ("jupiter", "jovian")):
        return "Jupiter"
    if any(keyword in text for keyword in ("saturn", "titan")):
        return "Saturn"
    if any(keyword in text for keyword in ("asteroid", "comet", "kuiper")):
        return "Asteroids & Comets"
    if any(
        keyword in text
        for keyword in (
            "solar wind", "heliospheric", "heliophysics", "magnetosphere",
            "magnetospheric", "coronal", "sun-earth",
        )
    ):
        return "Heliophysics"
    if any(
        keyword in text
        for keyword in (
            "earth orbit", "low earth orbit", "low-earth orbit",
            "geostationary", "geosynchronous", "sun-synchronous",
        )
    ):
        return "Earth Orbit"
    if any(
        keyword in text
        for keyword in ("interstellar", "pluto", "deep space", "space telescope")
    ):
        return "Deep Space"
    return "Earth Orbit"


def infer_agency(model_name, display_name, full_name, description):
    slug = slugify(model_name)
    text = f"{model_name} {display_name} {full_name} {description}".lower()
    if slug == "danuri":
        return "KARI"
    if slug in {
        "huygens", "rosetta", "philae", "mars-express", "juice", "euclid",
        "cluster-ii",
    }:
        return "ESA"
    if slug == "trace-gas-orbiter":
        return "ESA / Roscosmos"
    if slug == "sentinel-6":
        return "NASA / ESA / EUMETSAT"
    if slug == "aquarius":
        return "NASA / CONAE"
    def has_token(token):
        return re.search(
            r"(?<![a-z0-9])" + re.escape(token) + r"(?![a-z0-9])", text
        ) is not None

    if has_token("jaxa"):
        return "JAXA"
    if has_token("isro"):
        return "ISRO"
    if has_token("esa") or "european space agency" in text:
        return "ESA"
    if has_token("kari") or has_token("korea"):
        return "KARI"
    if "canadian space agency" in text or has_token("csa"):
        return "CSA"
    if has_token("roscosmos") or has_token("russian"):
        return "Roscosmos"
    return "NASA"


def agency_org_slug(agency):
    value = (agency or "").lower()
    if "esa" in value:
        return "esa"
    if "jaxa" in value:
        return "jaxa"
    if "isro" in value:
        return "isro"
    if "kari" in value:
        return "kari"
    if "csa" in value:
        return "csa"
    if "roscosmos" in value:
        return "roscosmos"
    if "eumetsat" in value:
        return "eumetsat"
    if "conae" in value:
        return "conae"
    if "asi" in value:
        return "asi"
    return "nasa"


def _find_case_insensitive(files, requested, extension):
    if requested:
        for path in files:
            if path.name.lower() == str(requested).lower():
                return path
    matches = sorted(
        [path for path in files if path.suffix.lower() == extension],
        key=lambda path: path.name.lower(),
    )
    return matches[0] if matches else None


def resolve_assets(item):
    """Resolve local GLB / glTF / BIN / texture files and compute their sizes."""
    folder = str(item.get("FolderName") or item.get("ModelName") or "").strip()
    model_name = str(item.get("ModelName") or "").strip()
    requested_glb = str(item.get("glbFileName") or "").strip()
    requested_gltf = str(item.get("gltfFileName") or "").strip()

    folder_path = ASSET_DIR / folder if folder else None
    files = []
    if folder_path and folder_path.is_dir():
        files = [path for path in folder_path.iterdir() if path.is_file()]
    elif FLAT_MODEL_DIR.is_dir():
        # Fallback for deployments that keep a flat model directory.
        flat_files = [path for path in FLAT_MODEL_DIR.iterdir() if path.is_file()]
        files = [
            path
            for path in flat_files
            if path.name.lower().startswith(model_name.lower() + ".")
        ]
        if files:
            folder_path = FLAT_MODEL_DIR

    glb_path = _find_case_insensitive(files, requested_glb, ".glb")
    gltf_path = _find_case_insensitive(files, requested_gltf, ".gltf")
    bin_path = _find_case_insensitive(files, None, ".bin")
    texture_extensions = {".png", ".jpg", ".jpeg", ".dds", ".webp", ".ktx2"}
    textures = sorted(
        [path.name for path in files if path.suffix.lower() in texture_extensions]
    )
    thumbnail = next(
        (path.name for path in files if path.name.lower() == "thumbnail.png"), None
    )

    asset_folder = folder or model_name
    web_base = f"/assets/spacecraft/{quote_path_segment(asset_folder)}"

    def web_path(path, fallback_name):
        name = path.name if path else fallback_name
        if not name:
            return ""
        return f"{web_base}/{quote_path_segment(name)}"

    def download_url(path, fallback_name):
        name = path.name if path else fallback_name
        if not name:
            return ""
        return (
            f"{MODEL_RAW_BASE}/{quote_path_segment(asset_folder)}/"
            f"{quote_path_segment(name)}"
        )

    def size_of(path):
        try:
            return int(path.stat().st_size) if path else 0
        except OSError:
            return 0

    all_files = list(files)
    total_size = sum(size_of(path) for path in all_files)
    missing = []
    if not folder_path or not folder_path.is_dir():
        missing.append("asset folder not found")
    if not glb_path:
        missing.append("GLB file not found")
    if not gltf_path:
        missing.append("glTF file not found")
    if not bin_path:
        missing.append("BIN file not found")

    return {
        "folder_path": str(folder_path) if folder_path else "",
        "folder_found": bool(folder_path and folder_path.is_dir()),
        "glb_filename": glb_path.name if glb_path else requested_glb,
        "gltf_filename": gltf_path.name if gltf_path else requested_gltf,
        "bin_filename": bin_path.name if bin_path else "",
        "glb_path": web_path(glb_path, requested_glb),
        "gltf_path": web_path(gltf_path, requested_gltf),
        "bin_path": web_path(bin_path, ""),
        "download_glb_url": download_url(glb_path, requested_glb),
        "download_gltf_url": download_url(gltf_path, requested_gltf),
        "thumbnail_path": (
            f"{web_base}/{quote_path_segment(thumbnail)}" if thumbnail else ""
        ),
        "texture_files": textures,
        "texture_count": len(textures),
        "file_size_bytes": total_size,
        "glb_size_bytes": size_of(glb_path),
        "gltf_size_bytes": size_of(gltf_path),
        "binary_size_bytes": size_of(bin_path),
        "missing": missing,
    }


def infer_metadata(item, assets):
    model_name = str(item.get("ModelName") or "").strip()
    display_name = str(item.get("DisplayName") or model_name).strip()
    full_name = str(item.get("FullName") or display_name or model_name).strip()
    description_html = str(item.get("Description") or "").strip()
    description = strip_html_tags(description_html)
    eotss_url = normalize_url(item.get("eotssURL") or NASA_EYES_URL)
    official_url = normalize_url(extract_first_link(description_html, eotss_url))
    launch_date = extract_launch_date(description_html)
    component_type = infer_component_type(
        model_name, display_name, full_name, description
    )
    destination = infer_destination(
        model_name, display_name, full_name, description
    )
    operational_status = infer_operational_status(description)
    agency = infer_agency(model_name, display_name, full_name, description)
    short_description = description[:300] + ("..." if len(description) > 300 else "")
    if not short_description:
        short_description = f"{full_name} is catalogued in the NASA Eyes 3D model archive."

    return {
        "model_name": model_name,
        "display_name": display_name,
        "full_name": full_name,
        "description": description or short_description,
        "description_html": description_html,
        "eotss_url": eotss_url,
        "official_url": official_url or eotss_url,
        "launch_date": launch_date,
        "component_type": component_type,
        "destination": destination,
        "operational_status": operational_status,
        "agency": agency,
        "short_description": short_description,
        "how_it_works": (
            f"{display_name} is a {component_type.lower()} represented by an authentic "
            f"NASA Eyes 3D model and operated in the {destination} environment."
        ),
        "why_it_is_important": (
            f"{full_name} contributes scientific observations and mission data that "
            f"support our understanding of {destination}."
        ),
        "scientific_purpose": (
            (description[:500] + ("..." if len(description) > 500 else ""))
            if description
            else f"Scientific operations and data collection for {full_name}."
        ),
        "status_text": (
            f"Operational status: {operational_status}. "
            f"Source: NASA Eyes on the Solar System 3D model catalogue."
        ),
    }


def fetch_bytes(url, retries=4, timeout=60):
    headers = {
        "User-Agent": "CosmicTimekeepers-NovaBase/2.0 (+https://github.com/matthewgiarra/spacecraft-models)",
        "Accept": "application/json,text/plain,*/*",
    }
    last_error = None
    for attempt in range(1, retries + 1):
        try:
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.read()
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(min(2 ** (attempt - 1), 8))
    raise RuntimeError(f"Unable to download {url}: {last_error}")


# -------------------------------------------------------------------------
# External enrichment: NSSDCA master catalogue + Wikimedia / MediaWiki API
# -------------------------------------------------------------------------
# NSSDCA's search endpoint is name based and occasionally needs a fuller
# query than the short ModelName in models.json.  These aliases only provide
# additional search candidates; the returned values are still verified against
# the NSSDCA response before they are stored.
NSSDCA_QUERY_ALIASES = {
    "cassini": ["Cassini-Huygens", "Cassini Orbiter"],
    "huygens": ["Huygens Probe", "Huygens"],
    "galileo": ["Galileo Orbiter", "Galileo Jupiter Probe", "Galileo"],
    "galileo-probe": ["Galileo Probe", "Galileo Atmospheric Entry Probe"],
    "rosetta": ["Rosetta Orbiter", "Rosetta comet"],
    "philae": ["Philae Lander", "Philae comet lander"],
    "grace": ["GRACE", "GRACE 1"],
    "grace-fo1": ["GRACE-FO", "GRACE Follow-On"],
    "landsat-7": ["Landsat-7", "Landsat 7"],
    "landsat-8": ["Landsat-8", "Landsat 8"],
    "landsat-9": ["Landsat-9", "Landsat 9"],
    "aquarius": ["Aquarius SAC-D", "SAC-D", "Aquarius"],
    "artemis": ["Artemis 1", "Artemis I"],
    "iss": ["International Space Station", "ISS"],
    "hubble": ["Hubble Space Telescope", "Hubble"],
    "mms": ["Magnetospheric Multiscale", "MMS"],
    "themis": ["THEMIS", "Time History of Events and Macroscale Interactions during Substorms"],
    "cluster-ii": ["Cluster II", "Cluster 2"],
    "grail": ["GRAIL", "Gravity Recovery and Interior Laboratory"],
    "prefire": ["PREFIRE"],
    "tropics": ["TROPICS"],
    "cygnss": ["CYGNSS"],
    "tdrs": ["Tracking and Data Relay Satellite", "TDRS"],
    "van-allen-probe": ["Van Allen Probes", "Radiation Belt Storm Probes"],
    "sentinel-6": ["Sentinel-6", "Sentinel-6 Michael Freilich", "Sentinel-6B"],
    "osiris-apex": ["OSIRIS-REx", "OSIRIS-APEX"],
    "osiris-rex-sample-return-capsule": ["OSIRIS-REx"],
    "stardust": ["Stardust", "Stardust/NExT"],
    "stardust-sample-return-capsule": ["Stardust Sample Return Capsule"],
    "stereo-ahead": ["STEREO A", "STEREO Ahead"],
    "stereo-behind": ["STEREO B", "STEREO Behind"],
    "perseverence": ["Mars 2020", "Perseverance"],
    "curiosity": ["Mars Science Laboratory", "Curiosity"],
    "opportunity-cruise": ["Opportunity", "Mars Exploration Rover Opportunity"],
    "opportunity-rover": ["Opportunity", "Mars Exploration Rover Opportunity"],
    "spirit-cruise": ["Spirit", "Mars Exploration Rover Spirit"],
    "spirit-rover": ["Spirit", "Mars Exploration Rover Spirit"],
    "phoenix-cruise": ["Phoenix Mars Lander", "Phoenix"],
    "phoenix-edl": ["Phoenix Mars Lander", "Phoenix"],
    "euclid": ["Euclid", "Euclid space telescope"],
    "magellan": ["Magellan", "Magellan Venus"],
    "jason": ["Jason", "Jason-1"],
    "clementine": ["Clementine", "Clementine DSPSE"],
    "lucy": ["Lucy", "Lucy spacecraft"],
    "psyche": ["Psyche", "Psyche spacecraft"],
    "dawn": ["Dawn", "Dawn spacecraft"],
    "terra": ["Terra", "Terra satellite"],
    "aqua": ["Aqua", "Aqua satellite"],
    "aura": ["Aura", "Aura satellite"],
    "polar": ["Polar", "Polar satellite"],
    "wind": ["Wind", "Wind spacecraft"],
    "tempo": ["TEMPO", "Tropospheric Emissions Monitoring of Pollution"],
    "acs3": ["ACS3", "Advanced Composite Solar Sail System"],
    "starling": ["Starling", "Starling Mission"],
    "grifex": ["GRIFEX"],
    # MCubed-2 has no dedicated English Wikipedia article.  "M-Cubed" is a
    # different 2011 spacecraft, so it must not be used as an alias.
    "mcubed-2": ["MCubed-2"],
}

# Some model families match several NSSDCA records (for example the Stardust
# spacecraft and its sample-return capsule).  These preferences pick the record
# that represents the hardware item in viewer/models.json.
NSSDCA_ID_PREFERENCES = {
    "stardust": "1999-003A",
    "stardust-sample-return-capsule": "1999-003D",
    "pioneer": "1972-012A",
    "grace": "2002-012A",
    "grace-fo1": "2018-047A",
    "sentinel-6": "2020-086A",
}

# A few catalogue entries are instruments or hosted payloads whose own record
# does not exist in NSSDCA.  These verified values come from the host mission
# and from the NASA mission page; each override carries its provenance so the
# database never presents an inferred value as if it were fetched.
CURATED_FACT_OVERRIDES = {
    "acs3": {
        "launch_date": "2024-04-23",
        "nssdca_id": "2024-077B",
        "agency": "NASA",
        "official_url": "https://www.nasa.gov/mission/acs3/",
        "note": (
            "NASA ACS3 mission page: launched 23 April 2024; NASA-led "
            "Small Spacecraft Technology Program.  NSSDCA record 2024-077B "
            "confirms the COSPAR designation and launch facts."
        ),
    },
    "aquarius": {
        "nssdca_id": "2011-024A",
        "note": (
            "Aquarius is a NASA instrument hosted on the Argentine SAC-D "
            "spacecraft (COSPAR 2011-024A), so the host COSPAR ID is stored."
        ),
    },
    "tempo": {
        "nssdca_id": "2023-052A",
        "note": (
            "TEMPO is a NASA/Smithsonian hosted payload on Intelsat 40e "
            "(COSPAR 2023-052A), so the host COSPAR ID is stored."
        ),
    },
    # GRIFEX and MCubed-2 have no dedicated English Wikipedia articles.  The
    # values below come from NASA/JPL, NASA ESTO, eoPortal and Wikidata and are
    # stored as explicit alternate references rather than invented titles.
    "grifex": {
        "official_url": (
            "https://www.jpl.nasa.gov/missions/"
            "geo-cape-roic-in-flight-performance-experiment-grifex/"
        ),
        "wikidata_id": "Q111471637",
        "reference_title": "GRIFEX (GEO-CAPE ROIC In-Flight Performance Experiment)",
        "reference_url": (
            "https://www.jpl.nasa.gov/missions/"
            "geo-cape-roic-in-flight-performance-experiment-grifex/"
        ),
        "note": (
            "No English Wikipedia article exists.  JPL, NASA Science and "
            "eoPortal mission pages provide the verified facts."
        ),
        "sources": [
            {
                "name": "NASA JPL",
                "url": (
                    "https://www.jpl.nasa.gov/missions/"
                    "geo-cape-roic-in-flight-performance-experiment-grifex/"
                ),
                "source_type": "NASA Mission Page",
                "notes": (
                    "GRIFEX 3U CubeSat technology demonstration, launched "
                    "31 January 2015 with SMAP."
                ),
            },
            {
                "name": "NASA Science",
                "url": (
                    "https://science.nasa.gov/science-research/"
                    "science-enabling-technology/technology-highlights/"
                    "new-atmospheric-detector-technology-demonstrated-cubesat/"
                ),
                "source_type": "NASA Mission Page",
                "notes": (
                    "NASA Science technology highlight describing the GRIFEX "
                    "ROIC/FPA demonstration."
                ),
            },
            {
                "name": "eoPortal",
                "url": "https://www.eoportal.org/satellite-missions/grifex",
                "source_type": "Mission Encyclopedia",
                "notes": (
                    "eoPortal GRIFEX mission summary: University of Michigan / "
                    "NASA ESTO / JPL collaboration."
                ),
            },
        ],
    },
    "mcubed-2": {
        "wiki_title": "M-Cubed",
        "official_url": "https://www.eoportal.org/satellite-missions/mcubed-2",
        "wikidata_id": "Q127979596",
        "reference_title": "MCubed-2/COVE (Michigan Multipurpose Minisat-2)",
        "reference_url": "https://www.eoportal.org/satellite-missions/mcubed-2",
        "note": (
            "No dedicated English Wikipedia article exists; the 'M-Cubed' "
            "article documents the MCubed-2 reflight.  eoPortal and NASA ESTO "
            "provide the mission facts."
        ),
        "sources": [
            {
                "name": "eoPortal",
                "url": "https://www.eoportal.org/satellite-missions/mcubed-2",
                "source_type": "Mission Encyclopedia",
                "notes": (
                    "MCubed-2/COVE reflight mission overview (University of "
                    "Michigan and NASA/JPL)."
                ),
            },
            {
                "name": "NASA ESTO",
                "url": (
                    "https://esto.nasa.gov/"
                    "two-cubesat-technology-demonstrations-launch-in-december"
                ),
                "source_type": "NASA Program",
                "notes": (
                    "NASA ESTO announcement of the MCubed-2 and IPEX CubeSat "
                    "technology demonstrations."
                ),
            },
            {
                "name": "Wikipedia / MediaWiki API",
                "url": "https://en.wikipedia.org/wiki/M-Cubed",
                "source_type": "Reference Encyclopedia",
                "notes": (
                    "M-Cubed article; states that the mission was re-flown as "
                    "MCubed-2 on 6 December 2013."
                ),
            },
        ],
    },
    "neo-surveyor": {
        "official_url": "https://science.nasa.gov/mission/neo-surveyor/",
        "reference_title": "NEO Surveyor",
        "reference_url": "https://science.nasa.gov/mission/neo-surveyor/",
        "note": (
            "Pre-launch mission: no COSPAR/NSSDCA identifier has been assigned "
            "yet.  NASA Science mission page provides the verified facts."
        ),
        "sources": [
            {
                "name": "NASA Science",
                "url": "https://science.nasa.gov/mission/neo-surveyor/",
                "source_type": "NASA Mission Page",
                "notes": (
                    "NEO Surveyor mission overview; planned launch no earlier "
                    "than September 2027."
                ),
            },
        ],
    },
}

# Wikipedia article titles that are disambiguation pages, common nouns or
# redirects to unrelated topics when queried by the short ModelName.  Aliases
# are tried before the source names so these resolve to the spacecraft article.
WIKIPEDIA_QUERY_ALIASES = {
    "aquarius": ["Aquarius (satellite)", "Aquarius (SAC-D instrument)"],
    "huygens": ["Huygens (spacecraft)", "Huygens probe"],
    "grace": ["GRACE and GRACE-FO", "Gravity Recovery and Climate Experiment"],
    "grace-fo1": ["GRACE and GRACE-FO", "GRACE-FO"],
    "swot": ["Surface Water and Ocean Topography", "SWOT (satellite)"],
    "ulysses": ["Ulysses (spacecraft)"],
    "jason": ["Jason-1", "Jason (satellite)"],
    "clementine": ["Clementine (spacecraft)"],
    "magellan": ["Magellan (spacecraft)"],
    "euclid": ["Euclid (space telescope)", "Euclid (spacecraft)"],
    "cluster-ii": ["Cluster II (spacecraft)", "Cluster (spacecraft)"],
    "acs3": ["Advanced Composite Solar Sail System"],
    "tempo": ["Tropospheric Emissions: Monitoring of Pollution"],
    "cygnss": ["Cyclone Global Navigation Satellite System"],
    "artemis": ["Artemis 1", "Artemis program"],
    "iss": ["International Space Station"],
    "hubble": ["Hubble Space Telescope"],
    "mms": ["Magnetospheric Multiscale Mission"],
    "themis": ["THEMIS"],
    "galileo": ["Galileo (spacecraft)"],
    "galileo-probe": ["Galileo (spacecraft)"],
    "voyager": ["Voyager program", "Voyager 1"],
    "pioneer": ["Pioneer 10", "Pioneer program"],
    "stardust": ["Stardust (spacecraft)", "Stardust/NExT"],
    "lucy": ["Lucy (spacecraft)"],
    "psyche": ["Psyche (spacecraft)"],
    "dawn": ["Dawn (spacecraft)"],
    "terra": ["Terra (satellite)"],
    "aqua": ["Aqua (satellite)"],
    "aura": ["Aura (satellite)"],
    "polar": ["Polar (satellite)"],
    "wind": ["Wind (spacecraft)"],
    "starling": ["Starling Mission"],
}


def _clean_html_text(value):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", value or "")).split())


def parse_nssdca_results(page_text):
    """Parse the NSSDCA spacecraft query results table into dictionaries."""
    if not page_text:
        return []
    rows = []
    pattern = re.compile(
        r"<tr[^>]*>\s*<td[^>]*>\s*<a[^>]+href=\"([^\"]+)\"[^>]*>(.*?)</a>\s*</td>"
        r"\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>",
        re.IGNORECASE | re.DOTALL,
    )
    for match in pattern.finditer(page_text):
        href, name, nssdca_id, launch_date = match.groups()
        nssdca_id = _clean_html_text(nssdca_id)
        rows.append(
            {
                "name": _clean_html_text(name),
                "nssdca_id": nssdca_id,
                "launch_date": _clean_html_text(launch_date) or None,
                "url": urllib.parse.urljoin(NSSDCA_URL, href),
                "display_url": (
                    NSSDCA_DISPLAY_URL.format(nssdca_id=nssdca_id)
                    if nssdca_id
                    else urllib.parse.urljoin(NSSDCA_URL, href)
                ),
            }
        )
    return rows


def _nssdca_list_section(page_text, heading):
    """Return the clean list items under a named NSSDCA detail heading."""
    pattern = re.compile(
        r"<h2[^>]*>\s*" + re.escape(heading) + r"\s*</h2>\s*<ul[^>]*>(.*?)</ul>",
        re.IGNORECASE | re.DOTALL,
    )
    match = pattern.search(page_text or "")
    if not match:
        return []
    return [
        _clean_html_text(item)
        for item in re.findall(r"<li[^>]*>(.*?)</li>", match.group(1), re.DOTALL)
        if _clean_html_text(item)
    ]


def parse_nssdca_detail(page_text):
    """Parse the useful sections of one NSSDCA spacecraft detail page."""
    if not page_text or "Facts in Brief" not in page_text:
        return {}
    title_match = re.search(r"<h1[^>]*>(.*?)</h1>", page_text, re.IGNORECASE | re.DOTALL)
    facts = {}
    facts_match = re.search(
        r"<h2[^>]*>\s*Facts in Brief\s*</h2>\s*<p[^>]*>(.*?)</p>",
        page_text,
        re.IGNORECASE | re.DOTALL,
    )
    if facts_match:
        for label_html, value_html in re.findall(
            r"<strong[^>]*>(.*?)</strong>\s*:?\s*(.*?)(?=<br\s*/?>|$)",
            facts_match.group(1),
            re.IGNORECASE | re.DOTALL,
        ):
            label = _clean_html_text(label_html).rstrip(":").strip().lower()
            value = _clean_html_text(value_html)
            if label and value:
                facts[label] = value
    description = ""
    description_match = re.search(
        r"<h2[^>]*>\s*Description\s*</h2>(.*?)(?=<h2|<div class=\"urtwo\")",
        page_text,
        re.IGNORECASE | re.DOTALL,
    )
    if description_match:
        description = _clean_html_text(description_match.group(1))
    detail = {
        "name": _clean_html_text(title_match.group(1)) if title_match else None,
        "facts": facts,
        "description": description[:12000] or None,
        "alternate_names": _nssdca_list_section(page_text, "Alternate Names"),
        "disciplines": _nssdca_list_section(page_text, "Disciplines"),
        "funding_agency": _nssdca_list_section(page_text, "Funding Agency"),
    }
    if facts.get("launch date"):
        detail["launch_date"] = _extract_date_value(facts["launch date"])
    for source_key, target_key in (
        ("launch vehicle", "launch_vehicle"),
        ("launch site", "launch_site"),
        ("mass", "mass"),
        ("nominal power", "power"),
    ):
        if facts.get(source_key):
            detail[target_key] = facts[source_key]
    return detail


def _nssdca_match_score(source_text, source_tokens, candidate_name):
    candidate_tokens = significant_tokens(candidate_name)
    if not candidate_tokens:
        return 0.0
    overlap = source_tokens & candidate_tokens
    if not overlap:
        return 0.0
    score = len(overlap) / len(candidate_tokens)
    normalized_source = normalize_key(source_text)
    normalized_candidate = normalize_key(candidate_name)
    if normalized_candidate and normalized_candidate in normalized_source:
        score = max(score, 0.95)
    if source_tokens and source_tokens.issubset(candidate_tokens):
        score = max(score, 0.92)
    return round(score, 3)


def _nssdca_candidates(item, meta):
    slug = slugify(item.get("ModelName", ""))
    names = []
    for value in (
        meta.get("full_name"),
        meta.get("display_name"),
        item.get("FullName"),
        item.get("DisplayName"),
        item.get("ModelName", "").replace("-", " "),
    ):
        value = (value or "").strip()
        if value:
            names.append(value)
            stripped = re.sub(r"\([^)]*\)", " ", value)
            stripped = " ".join(stripped.split())
            if stripped and stripped != value:
                names.append(stripped)
    names.extend(NSSDCA_QUERY_ALIASES.get(slug, []))
    seen = set()
    result = []
    for name in names:
        key = normalize_key(name)
        if key and key not in seen:
            seen.add(key)
            result.append(name)
    return result


def lookup_nssdca(item, meta):
    """Find the best matching NSSDCA spacecraft record for one model."""
    source_text = " ".join(
        str(item.get(key) or "")
        for key in ("ModelName", "DisplayName", "FullName")
    )
    source_tokens = significant_tokens(source_text)
    if not source_tokens:
        return {"matched": False, "reason": "no usable name tokens"}

    best = None
    errors = []
    for query in _nssdca_candidates(item, meta):
        try:
            page = fetch_bytes(
                NSSDCA_QUERY_URL.format(query=urllib.parse.quote(query)),
                retries=2,
                timeout=30,
            ).decode("utf-8", "replace")
        except Exception as exc:  # network failure is recorded, not fatal
            errors.append(f"{query}: {exc}")
            continue
        rows = parse_nssdca_results(page)
        scored = []
        for row in rows:
            if not (row.get("nssdca_id") or "").strip():
                continue
            score = _nssdca_match_score(source_text, source_tokens, row["name"])
            if score >= 0.5:
                scored.append((score, row))
        if not scored:
            continue
        scored.sort(key=lambda pair: pair[0], reverse=True)
        top_score = scored[0][0]
        matches = [row for score, row in scored if score >= max(0.5, top_score - 0.05)]
        # Pick the earliest launch date for multi-spacecraft programmes so the
        # value remains factual for the family as a whole, unless a curated
        # preference identifies the exact hardware item.
        slug = slugify(item.get("ModelName", ""))
        preferred_id = NSSDCA_ID_PREFERENCES.get(slug)
        preferred_rows = [
            row for row in matches if preferred_id and row.get("nssdca_id") == preferred_id
        ]
        if preferred_id and not preferred_rows:
            # The curated preference is authoritative for this hardware item;
            # do not fall back to a different member of the same family.
            continue
        dated = [row for row in matches if row.get("launch_date")]
        if preferred_rows:
            chosen = preferred_rows[0]
        elif dated:
            chosen = sorted(dated, key=lambda row: row["launch_date"])[0]
        else:
            chosen = matches[0]
        candidate = {
            "matched": True,
            "nssdca_id": chosen["nssdca_id"],
            "launch_date": chosen["launch_date"],
            "matched_name": chosen["name"],
            "source_url": chosen["display_url"],
            "query": query,
            "score": top_score,
            "ambiguous": len(matches) > 1,
            "matches": [
                {
                    "name": row["name"],
                    "nssdca_id": row["nssdca_id"],
                    "launch_date": row["launch_date"],
                    "url": row["display_url"],
                }
                for row in matches[:10]
            ],
        }
        if best is None or candidate["score"] > best["score"]:
            best = candidate
            if candidate["score"] >= 0.95:
                break
    if best is None:
        # Some catalogue entries (for example hosted payloads or instruments)
        # have a verified NSSDCA identifier that the name search cannot find.
        # Fall back to the curated identifier and read its detail page.
        curated_id = (
            CURATED_FACT_OVERRIDES.get(slugify(item.get("ModelName", ""))) or {}
        ).get("nssdca_id")
        if curated_id:
            best = {
                "matched": True,
                "nssdca_id": curated_id,
                "launch_date": None,
                "matched_name": str(item.get("DisplayName") or "").strip() or None,
                "source_url": (
                    "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/"
                    "display.action?id=" + urllib.parse.quote(curated_id)
                ),
                "query": "curated_override",
                "score": 1.0,
                "ambiguous": False,
                "matches": [],
            }
        else:
            return {
                "matched": False,
                "reason": "no NSSDCA row matched the model name",
                "errors": errors[:3],
            }

    # Fetch the detail page for verified "Facts in Brief" metadata.
    if best.get("source_url"):
        try:
            detail_html = fetch_bytes(
                best["source_url"], retries=1, timeout=30
            ).decode("utf-8", "replace")
            detail = parse_nssdca_detail(detail_html)
            if detail:
                best["detail"] = detail
                if detail.get("launch_date"):
                    best["launch_date"] = _align_launch_with_cospar(
                        best.get("nssdca_id"), detail["launch_date"]
                    )
        except Exception as exc:
            best["detail_error"] = str(exc)
    best["launch_date"] = _align_launch_with_cospar(
        best.get("nssdca_id"), best.get("launch_date")
    )
    best["errors"] = errors[:3]
    return best


def _wiki_candidates(item, meta):
    slug = slugify(item.get("ModelName", ""))
    names = []
    # Aliases come first: they steer ambiguous common nouns (Euclid, Magellan,
    # Jason, Grace, Clementine, ...) to the spacecraft article before the short
    # source name can resolve to a person, fruit or disambiguation page.
    names.extend(WIKIPEDIA_QUERY_ALIASES.get(slug, []))
    for value in (
        meta.get("full_name"),
        meta.get("display_name"),
        item.get("FullName"),
        item.get("DisplayName"),
    ):
        value = (value or "").strip()
        if value:
            names.append(value)
            stripped = re.sub(r"\([^)]*\)", " ", value)
            stripped = " ".join(stripped.split())
            if stripped and stripped != value:
                names.append(stripped)
    model_value = (item.get("ModelName") or "").replace("-", " ").strip()
    if model_value:
        names.append(model_value)
    seen = set()
    result = []
    for name in names:
        key = normalize_key(name)
        if key and key not in seen:
            seen.add(key)
            result.append(name)
    return result


SPACEFLIGHT_INFOBOX_KEYS = {
    "mission_type",
    "cospar_id",
    "nssdc_id",
    "launch_date",
    "launch_site",
    "launch_rocket",
    "satcat",
    "operator",
    "manufacturer",
}
SPACEFLIGHT_KEYWORDS = (
    "spacecraft",
    "satellite",
    "space probe",
    "space telescope",
    "space station",
    "orbiter",
    "lander",
    "rover",
    "cubesat",
    "payload",
    "mission",
    "launched",
    "launch",
    "orbit",
    "nasa",
    "esa",
    "jaxa",
    "isro",
    "planet",
    "moon",
    "asteroid",
    "comet",
    "astronomy",
    "solar",
)


def _has_spaceflight_signal(text):
    lowered = (text or "").lower()
    return any(keyword in lowered for keyword in SPACEFLIGHT_KEYWORDS)


def _wiki_page_is_usable(page, meta_all_tokens):
    if not page:
        return False
    if page.get("disambiguation"):
        return False
    extract = (page.get("extract") or "").strip()
    lowered = extract.lower()[:600]
    if any(
        phrase in lowered
        for phrase in (
            "may refer to",
            "commonly refers to",
            "can refer to",
            "most commonly refers to",
            "is a disambiguation page",
        )
    ):
        return False
    infobox = page.get("infobox") or {}
    # Person, fruit, company and other non-spaceflight infoboxes are rejected.
    if infobox.get("birth_date") or infobox.get("death_date"):
        return False
    if any(key in infobox for key in SPACEFLIGHT_INFOBOX_KEYS):
        return True
    title_tokens = set(normalize_key(page.get("title") or "").split())
    if title_tokens & (meta_all_tokens or set()) and _has_spaceflight_signal(extract):
        return True
    return False


def _template_parts(inner):
    """Split a MediaWiki template body on top-level pipes."""
    parts = []
    current = []
    curly = 0
    square = 0
    index = 0
    while index < len(inner):
        pair = inner[index:index + 2]
        if pair == "{{":
            curly += 1
            current.append(pair)
            index += 2
            continue
        if pair == "}}":
            curly = max(0, curly - 1)
            current.append(pair)
            index += 2
            continue
        if pair == "[[":
            square += 1
            current.append(pair)
            index += 2
            continue
        if pair == "]]":
            square = max(0, square - 1)
            current.append(pair)
            index += 2
            continue
        if inner[index] == "|" and curly == 0 and square == 0:
            parts.append("".join(current))
            current = []
            index += 1
            continue
        current.append(inner[index])
        index += 1
    parts.append("".join(current))
    return parts


def _replace_wiki_template(match):
    parts = _template_parts(match.group(1))
    name = parts[0].strip().lower()
    args = [part.strip() for part in parts[1:]]
    positional = [part for part in args if "=" not in part]
    if name in {"start date", "start-date", "startdate"}:
        numbers = [part for part in positional if re.fullmatch(r"\d{1,4}", part)]
        if len(numbers) >= 3:
            return f"{int(numbers[0]):04d} {int(numbers[1]):02d} {int(numbers[2]):02d}"
        return positional[0] if positional else " "
    if name in {"cospar", "nssdc id", "nssdc_id", "nssdca id"}:
        return positional[0] if positional else " "
    if name in {
        "unbulleted list",
        "ubl",
        "plainlist",
        "indented plainlist",
        "flatlist",
        "hlist",
    }:
        items = []
        for part in positional:
            part = re.sub(r"^\*+\s*", "", part).strip()
            if part:
                items.append(part)
        return ", ".join(items)
    if name in {"cvt", "convert", "val"}:
        return " ".join(positional[:2])
    if name in {
        "nowrap",
        "small",
        "big",
        "center",
        "left",
        "right",
        "url",
        "tooltip",
        "linktext",
        "flagicon",
        "flag",
        "abbr",
        "ill",
    }:
        return positional[0] if positional else " "
    if name in {"lang", "transl"}:
        return positional[1] if len(positional) >= 2 else (positional[0] if positional else " ")
    if name in {"nbsp", "spaces", "bull", "middot", "·", "!", "\\"}:
        return " "
    # Unknown templates: keep their positional text (dates, names) but drop
    # named parameters and the template keyword.
    if positional:
        return " ".join(positional[:2])
    return " "


def _clean_wiki_value(value):
    value = value or ""
    value = re.sub(r"(?is)<!--.*?-->", " ", value)
    value = re.sub(r"(?is)<ref[^>]*>.*?</ref>", " ", value)
    value = re.sub(r"(?is)<ref[^>]*/>", " ", value)
    # Expand innermost templates first; this preserves {{start date|...}},
    # {{cospar|...}} and {{unbulleted list|...}} values instead of dropping them.
    for _ in range(12):
        expanded = re.sub(r"\{\{([^{}]*)\}\}", _replace_wiki_template, value)
        if expanded == value:
            break
        value = expanded
    value = re.sub(r"(?is)<br\s*/?>", " ", value)
    value = re.sub(r"\[\[([^|\]]*)\|([^\]]*)\]\]", r"\2", value)
    value = re.sub(r"\[\[([^\]]*)\]\]", r"\1", value)
    value = re.sub(r"\[https?://[^\s\]]+\s+([^\]]+)\]", r"\1", value)
    value = re.sub(r"\[https?://[^\]]+\]", " ", value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"'''?", "", value)
    value = html.unescape(value).replace("\u00a0", " ")
    value = re.sub(r"\{\{[^{}]*\}\}", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip(" |,;")


MONTH_NUMBERS = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}


def _month_number(name):
    key = (name or "").strip().lower().rstrip(".")
    return MONTH_NUMBERS.get(key) or MONTH_NUMBERS.get(key[:3])


def _valid_date(year, month=None, day=None):
    if not (1957 <= int(year) <= 2035):
        return None
    if month is None:
        return f"{int(year):04d}"
    month = int(month)
    if not (1 <= month <= 12):
        return None
    if day is None:
        return f"{int(year):04d}-{month:02d}"
    try:
        datetime(int(year), month, int(day))
    except ValueError:
        return None
    return f"{int(year):04d}-{month:02d}-{int(day):02d}"


def _extract_date_value(value):
    value = _clean_wiki_value(value)
    if not value:
        return None
    match = re.search(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b", value)
    if match:
        parsed = _valid_date(match.group(1), match.group(2), match.group(3))
        if parsed:
            return parsed
    match = re.search(r"\b(\d{4})\s+(\d{1,2})\s+(\d{1,2})\b", value)
    if match:
        parsed = _valid_date(match.group(1), match.group(2), match.group(3))
        if parsed:
            return parsed
    match = re.search(
        r"\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b",
        value,
    )
    if match:
        parsed = _valid_date(
            match.group(3), _month_number(match.group(1)), match.group(2)
        )
        if parsed:
            return parsed
    match = re.search(
        r"\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b",
        value,
    )
    if match:
        parsed = _valid_date(
            match.group(3), _month_number(match.group(2)), match.group(1)
        )
        if parsed:
            return parsed
    match = re.search(r"\b([A-Za-z]{3,9})\.?\s+(\d{4})\b", value)
    if match:
        parsed = _valid_date(match.group(2), _month_number(match.group(1)))
        if parsed:
            return parsed
    # Year-only values are only accepted for short launch-date strings so that
    # a random year in a paragraph is not mistaken for a launch date.
    if len(value) <= 80:
        match = re.search(r"\b(19\d{2}|20\d{2})\b", value)
        if match:
            return _valid_date(match.group(1))
    return None


def _extract_cospar_id(value):
    value = _clean_wiki_value(value)
    if not value:
        return None
    match = re.search(r"\b(\d{4}-\d{3}[A-Z]{1,3})\b", value)
    if match:
        return match.group(1)
    match = re.search(r"\b(\d{7}[A-Z]{1,3})\b", value)
    if match:
        return match.group(1)
    match = re.search(r"\b([A-Z]{2,}[A-Z0-9]*)\b", value)
    if match and len(match.group(1)) >= 4:
        return match.group(1)
    return None


def _iter_infobox_blocks(wikitext):
    for match in re.finditer(r"\{\{\s*infobox", wikitext or "", re.IGNORECASE):
        start = match.start()
        index = start
        depth = 0
        while index < len(wikitext):
            pair = wikitext[index:index + 2]
            if pair == "{{":
                depth += 1
                index += 2
                continue
            if pair == "}}":
                depth -= 1
                index += 2
                if depth <= 0:
                    break
                continue
            index += 1
        block = wikitext[start:index]
        if block.endswith("}}"):
            yield block[2:-2]


def _parse_infobox_params(inner):
    params = {}
    parts = _template_parts(inner)
    for part in parts[1:]:
        if "=" not in part:
            continue
        key, value = part.split("=", 1)
        key = key.strip().lower()
        if key and key not in params:
            params[key] = value.strip()
    return params


def _select_infobox(blocks, meta):
    if not blocks:
        return {}
    meta_text = " ".join(
        str(value or "")
        for value in (
            meta.get("display_name"),
            meta.get("full_name"),
            meta.get("model_name"),
        )
    )
    # Use every token here (including short ones such as "FO") so combined
    # articles like GRACE and GRACE-FO select the matching infobox.
    meta_tokens = set(normalize_key(meta_text).split())
    meta_normalized = normalize_key(meta_text)
    best = None
    best_score = -1
    for block in blocks:
        name = block.get("name") or block.get("title") or ""
        name_normalized = normalize_key(name)
        score = len(set(name_normalized.split()) & meta_tokens)
        if name_normalized and name_normalized in meta_normalized:
            score += 2
        if score > best_score:
            best_score = score
            best = block
    return best or blocks[0]


WIKI_INFOBOX_KEYS = {
    "nssdc_id": "nssdc_id",
    "nssdc id": "nssdc_id",
    "nssdca_id": "nssdc_id",
    "nssdca id": "nssdc_id",
    "cospar_id": "cospar_id",
    "cospar id": "cospar_id",
    "satcat": "satcat",
    "launch_date": "launch_date",
    "launch date": "launch_date",
    "launchdate": "launch_date",
    "launch": "launch_date",
    "launched": "launch_date",
    "launch_site": "launch_site",
    "launch site": "launch_site",
    "launch_rocket": "launch_rocket",
    "launch rocket": "launch_rocket",
    "launch_vehicle": "launch_rocket",
    "launch vehicle": "launch_rocket",
    "manufacturer": "manufacturer",
    "operator": "operator",
    "mission_type": "mission_type",
    "mission type": "mission_type",
    "launch_mass": "launch_mass",
    "dry_mass": "dry_mass",
    "power": "power",
    "mission_duration": "mission_duration",
    "name": "name",
    "title": "name",
    "birth_date": "birth_date",
    "death_date": "death_date",
}


def _parse_wiki_infobox(wikitext, meta=None):
    """Extract a small, verifiable set of infobox fields from page wikitext."""
    if not wikitext:
        return {}
    blocks = [
        _parse_infobox_params(inner)
        for inner in _iter_infobox_blocks(wikitext)
    ]
    selected = _select_infobox(blocks, meta or {})
    fields = {}
    for key, value in selected.items():
        canonical = WIKI_INFOBOX_KEYS.get(key)
        if canonical and canonical not in fields:
            cleaned = _clean_wiki_value(value)
            if cleaned:
                fields[canonical] = cleaned[:1000]
    if fields.get("launch_date"):
        parsed = _extract_date_value(fields["launch_date"])
        if parsed:
            fields["launch_date"] = parsed
    cospar = _extract_cospar_id(
        fields.get("cospar_id") or fields.get("nssdc_id")
    )
    if cospar:
        fields["nssdca_id"] = cospar
    elif fields.get("nssdc_id"):
        fields["nssdca_id"] = fields["nssdc_id"]
    return fields


def _wiki_page_from_payload(payload, requested_title, meta=None):
    query = (payload or {}).get("query") or {}
    pages = query.get("pages") or {}
    redirects = query.get("redirects") or []
    requested_normalized = requested_title.replace("_", " ").strip().lower()
    redirect = next(
        (
            item
            for item in redirects
            if (item.get("from") or "").strip().lower() == requested_normalized
        ),
        None,
    )
    for page in pages.values():
        if page.get("missing") is not None:
            continue
        title = page.get("title") or requested_title
        extract = (page.get("extract") or "").strip()
        url = page.get("fullurl") or (
            "https://en.wikipedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"))
        )
        wikitext = ""
        revisions = page.get("revisions") or []
        if revisions:
            slots = revisions[0].get("slots") or {}
            wikitext = (
                ((slots.get("main") or {}).get("*"))
                or ((slots.get("main") or {}).get("content"))
                or ""
            )
        pageprops = page.get("pageprops") or {}
        infobox = _parse_wiki_infobox(wikitext, meta)
        return {
            "title": title,
            "extract": extract,
            "url": url,
            "page_id": page.get("pageid"),
            "touched": page.get("touched"),
            "disambiguation": "disambiguation" in pageprops,
            "wikibase_item": pageprops.get("wikibase_item"),
            "redirect_from": redirect.get("from") if redirect else None,
            "section": redirect.get("tofragment") if redirect else None,
            "infobox": infobox,
            "infobox_count": len(list(_iter_infobox_blocks(wikitext))),
            "nssdca_id": infobox.get("nssdca_id"),
            "launch_date": infobox.get("launch_date"),
        }
    return None


def _search_title_score(query, title):
    query_all = set(normalize_key(query).split())
    title_all = set(normalize_key(title).split())
    if not query_all or not title_all:
        return 0.0
    query_tokens = {
        token for token in query_all if token not in GENERIC_MISSION_TOKENS
    } or query_all
    title_tokens = {
        token for token in title_all if token not in GENERIC_MISSION_TOKENS
    } or title_all
    overlap = query_tokens & title_tokens
    if not overlap:
        return 0.0
    score = len(overlap) / len(query_tokens)
    if normalize_key(title) == normalize_key(query):
        score = 1.0
    elif normalize_key(query) in normalize_key(title):
        score = max(score, 0.9)
    elif normalize_key(title) in normalize_key(query):
        score = max(score, 0.85)
    return round(score, 3)


def lookup_wikipedia(item, meta):
    """Resolve a Wikipedia article title and intro extract for one model."""
    errors = []
    candidates = _wiki_candidates(item, meta)
    meta_text = (
        f"{item.get('ModelName', '')} {meta.get('display_name', '')} "
        f"{meta.get('full_name', '')}"
    )
    meta_all_tokens = set(normalize_key(meta_text).split())
    # 1. Try exact title lookups first (aliases are already first).
    for title in candidates:
        try:
            payload = json.loads(
                fetch_bytes(
                    WIKIMEDIA_PAGE_API.format(
                        title=urllib.parse.quote(title.replace(" ", "_"))
                    ),
                    retries=2,
                    timeout=30,
                ).decode("utf-8", "replace")
            )
        except Exception as exc:
            errors.append(f"page {title}: {exc}")
            continue
        page = _wiki_page_from_payload(payload, title, meta)
        if page and _wiki_page_is_usable(page, meta_all_tokens):
            page["query"] = title
            page["match_method"] = "exact_title"
            page["errors"] = errors[:3]
            return page

    # 2. Fall back to full-text search and pick the best verified title.
    for query in candidates:
        try:
            payload = json.loads(
                fetch_bytes(
                    WIKIMEDIA_SEARCH_API.format(query=urllib.parse.quote(query)),
                    retries=2,
                    timeout=30,
                ).decode("utf-8", "replace")
            )
        except Exception as exc:
            errors.append(f"search {query}: {exc}")
            continue
        hits = ((payload or {}).get("query") or {}).get("search") or []
        scored = sorted(
            (
                (_search_title_score(query, hit.get("title") or ""), hit.get("title") or "")
                for hit in hits
            ),
            reverse=True,
        )
        for score, title in scored[:3]:
            if score < 0.75:
                continue
            try:
                page_payload = json.loads(
                    fetch_bytes(
                        WIKIMEDIA_PAGE_API.format(
                            title=urllib.parse.quote(title.replace(" ", "_"))
                        ),
                        retries=2,
                        timeout=30,
                    ).decode("utf-8", "replace")
                )
            except Exception as exc:
                errors.append(f"page {title}: {exc}")
                continue
            page = _wiki_page_from_payload(page_payload, title, meta)
            if page and _wiki_page_is_usable(page, meta_all_tokens):
                page["query"] = query
                page["match_method"] = "search"
                page["score"] = score
                page["errors"] = errors[:3]
                return page
    return {
        "matched": False,
        "reason": "no Wikipedia article matched the model name",
        "errors": errors[:3],
    }


def _wikidata_claim_values(claims, prop):
    values = []
    for claim in claims.get(prop, []):
        datavalue = (claim.get("mainsnak") or {}).get("datavalue") or {}
        if datavalue.get("value") is not None:
            values.append(datavalue["value"])
    return values


def _wikidata_time_to_iso(value):
    if not isinstance(value, dict):
        return None
    time_value = value.get("time") or ""
    precision = value.get("precision", 11)
    match = re.match(r"[+-]?(\d{4})-(\d{2})-(\d{2})", time_value)
    if not match:
        return None
    year = int(match.group(1))
    month = int(match.group(2))
    day = int(match.group(3))
    if precision >= 11:
        return _valid_date(year, month, day)
    if precision == 10:
        return _valid_date(year, month)
    return _valid_date(year)


def _wikidata_quantity(value):
    if not isinstance(value, dict):
        return None
    amount = value.get("amount")
    if amount is None:
        return None
    try:
        amount = float(amount.replace("+", ""))
    except (TypeError, ValueError):
        return None
    unit = value.get("unit") or ""
    if unit.endswith("Q11570"):
        return f"{amount:g} kg"
    return f"{amount:g}"


def _wikidata_labels(qids):
    qids = [qid for qid in qids if qid]
    if not qids:
        return {}
    url = (
        WIKIDATA_API
        + "?action=wbgetentities&format=json&props=labels&languages=en&ids="
        + "|".join(qids[:8])
    )
    try:
        payload = json.loads(
            fetch_bytes(url, retries=1, timeout=30).decode("utf-8", "replace")
        )
    except Exception:
        return {}
    labels = {}
    for qid, entity in ((payload or {}).get("entities") or {}).items():
        label = (((entity or {}).get("labels") or {}).get("en") or {}).get("value")
        if label:
            labels[qid] = label
    return labels


def lookup_wikidata(qid):
    """Read structured spacecraft facts from Wikidata for a resolved article."""
    if not qid:
        return {}
    url = (
        WIKIDATA_API
        + "?action=wbgetentities&format=json&props=claims&ids="
        + urllib.parse.quote(qid)
    )
    try:
        payload = json.loads(
            fetch_bytes(url, retries=1, timeout=30).decode("utf-8", "replace")
        )
    except Exception:
        return {}
    entity = ((payload or {}).get("entities") or {}).get(qid) or {}
    claims = entity.get("claims") or {}
    nssdca_ids = _wikidata_claim_values(claims, "P8913")
    cospar_ids = _wikidata_claim_values(claims, "P247")
    launch_values = _wikidata_claim_values(claims, "P619")
    mass_values = _wikidata_claim_values(claims, "P2067")
    manufacturer_ids = [
        value.get("id")
        for value in _wikidata_claim_values(claims, "P176")
        if isinstance(value, dict)
    ]
    operator_ids = [
        value.get("id")
        for value in _wikidata_claim_values(claims, "P137")
        if isinstance(value, dict)
    ]
    labels = _wikidata_labels(manufacturer_ids + operator_ids)
    cospar_id = next(
        (
            parsed
            for parsed in (
                _valid_nssdca_id(value)
                for value in cospar_ids
                if isinstance(value, str)
            )
            if parsed
        ),
        None,
    )
    # Prefer the standardized COSPAR identifier over the free-form NSSDCA code.
    nssdca_id = cospar_id or next(
        (
            parsed
            for parsed in (
                _valid_nssdca_id(value)
                for value in nssdca_ids
                if isinstance(value, str)
            )
            if parsed
        ),
        None,
    )
    launch_date = next(
        (
            parsed
            for parsed in (_wikidata_time_to_iso(value) for value in launch_values)
            if parsed
        ),
        None,
    )
    mass = next(
        (
            parsed
            for parsed in (_wikidata_quantity(value) for value in mass_values)
            if parsed
        ),
        None,
    )
    return {
        "wikidata_id": qid,
        "url": f"https://www.wikidata.org/wiki/{qid}",
        "nssdca_id": nssdca_id,
        "cospar_id": cospar_id,
        "launch_date": launch_date,
        "mass": mass,
        "manufacturer": [labels[qid] for qid in manufacturer_ids if qid in labels],
        "operator": [labels[qid] for qid in operator_ids if qid in labels],
    }


def lookup_external_metadata(item, meta):
    """Fetch NSSDCA, Wikipedia and Wikidata metadata for one model."""
    nssdca = lookup_nssdca(item, meta)
    wikipedia = lookup_wikipedia(item, meta)
    wikidata = {}
    if wikipedia.get("wikibase_item"):
        wikidata = lookup_wikidata(wikipedia["wikibase_item"])
    return {
        "nssdca": nssdca,
        "wikipedia": wikipedia,
        "wikidata": wikidata,
    }


def _merge_extra(spacecraft, enrichment):
    try:
        data = json.loads(spacecraft.extra) if spacecraft.extra else {}
        if not isinstance(data, dict):
            data = {"catalogue": data}
    except (TypeError, ValueError):
        data = {"catalogue": spacecraft.extra}
    existing = data.get("enrichment")
    if not isinstance(existing, dict):
        existing = {}
    for key, value in enrichment.items():
        if value:
            existing[key] = value
    data["enrichment"] = existing
    spacecraft.extra = json.dumps(data, ensure_ascii=False)


def _is_catalogue_spacecraft(spacecraft):
    """True for rows created by the models.json ingestion (not the legacy 20)."""
    return (spacecraft.verification_status or "").startswith(
        "Verified from NASA Eyes"
    )


def _alternate_references(spacecraft):
    """Return curated non-Wikipedia references stored on a spacecraft row."""
    try:
        data = json.loads(spacecraft.extra) if spacecraft.extra else {}
    except (TypeError, ValueError):
        return []
    enrichment = (data or {}).get("enrichment") or {}
    refs = enrichment.get("alternate_references") or []
    return [
        ref
        for ref in refs
        if isinstance(ref, dict) and ref.get("title") and ref.get("url")
    ]


def _date_precision(value):
    value = (value or "").strip()
    if not value:
        return 0
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return 3
    if re.fullmatch(r"\d{4}-\d{2}", value):
        return 2
    if re.fullmatch(r"(in\s+)?\d{4}", value, re.IGNORECASE):
        return 1
    return 0


def _looks_malformed_date(value):
    value = (value or "").strip()
    if not value:
        return True
    lowered = value.lower()
    if any(
        token in lowered
        for token in ("&nbsp;", "<br", "utc", "fm5", "fm6", "fm7", "fm8", "{{", "}}", "|")
    ):
        return True
    return _date_precision(value) == 0


NSSDCA_ID_BLOCKLIST = {
    "SATCAT",
    "COSPAR",
    "NSSDC",
    "NSSDCA",
    "UTC",
    "NASA",
    "ESA",
    "JAXA",
    "ISRO",
    "TBD",
    "NONE",
    "UNKNOWN",
}


def _looks_malformed_id(value):
    value = (value or "").strip()
    if not value:
        return True
    lowered = value.lower()
    if any(
        token in lowered
        for token in (
            "|", "{", "}", "<", ">", "&", "=",
            "satcat", "cospar", "nssdc", "nssdca",
        )
    ):
        return True
    if " " in value:
        return True
    # Bare years are dates, not catalog identifiers.  Some sources expose a
    # page's publication year through the wrong property; reject it so it
    # cannot overwrite a real COSPAR/NSSDCA value.
    if re.fullmatch(r"\d{4}", value):
        return True
    if re.fullmatch(r"\d{4}-\d{1,2}", value):
        return True
    if re.fullmatch(r"\d{4}-\d{3}[A-Z]{1,3}", value):
        return False
    if re.fullmatch(r"\d{7}[A-Z]{1,3}", value):
        return False
    if re.fullmatch(r"[A-Z][A-Z0-9]{3,}", value):
        return value.upper() in NSSDCA_ID_BLOCKLIST
    return True


def _valid_nssdca_id(value):
    value = (value or "").strip()
    return None if _looks_malformed_id(value) else value


def _align_launch_with_cospar(nssdca_id, launch_date):
    """Correct a source typo where the launch year disagrees with COSPAR."""
    launch_date = (launch_date or "").strip()
    match = re.match(r"^(\d{4})-\d{3}[A-Z]{1,3}$", nssdca_id or "")
    if not match or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", launch_date):
        return launch_date or None
    year = match.group(1)
    if launch_date[:4] == year:
        return launch_date
    return f"{year}{launch_date[4:]}"


# Canonical agency names used to normalise the free-text operator/funding
# strings returned by Wikipedia, NSSDCA and Wikidata.  Matching uses word
# boundaries so that substrings such as "esa" inside "research" are ignored.
AGENCY_ALIASES = (
    ("national aeronautics and space administration", "NASA"),
    ("nasa", "NASA"),
    ("jet propulsion laboratory", "NASA"),
    ("jpl", "NASA"),
    ("applied physics laboratory", "NASA"),
    ("apl", "NASA"),
    ("european space agency", "ESA"),
    ("esa", "ESA"),
    ("japan aerospace exploration agency", "JAXA"),
    ("isas", "JAXA"),
    ("jaxa", "JAXA"),
    ("indian space research organisation", "ISRO"),
    ("indian space research organization", "ISRO"),
    ("isro", "ISRO"),
    ("russian federal space agency", "Roscosmos"),
    ("roscosmos", "Roscosmos"),
    ("china national space administration", "CNSA"),
    ("cnsa", "CNSA"),
    ("korea aerospace research institute", "KARI"),
    ("kari", "KARI"),
    ("comisión nacional de actividades espaciales", "CONAE"),
    ("comision nacional de actividades espaciales", "CONAE"),
    ("conae", "CONAE"),
    ("eumetsat", "EUMETSAT"),
    ("italian space agency", "ASI"),
    ("asi", "ASI"),
    ("german aerospace center", "DLR"),
    ("dlr", "DLR"),
    ("canadian space agency", "CSA"),
    ("csa", "CSA"),
    ("uk space agency", "UKSA"),
    ("uksa", "UKSA"),
    ("national oceanic and atmospheric administration", "NOAA"),
    ("noaa", "NOAA"),
    ("united states geological survey", "USGS"),
    ("usgs", "USGS"),
    ("centre national d'études spatiales", "CNES"),
    ("centre national d'etudes spatiales", "CNES"),
    ("cnes", "CNES"),
    ("german research centre for geosciences", "GFZ"),
    ("gfz", "GFZ"),
    ("army ballistic missile agency", "US Army"),
    ("abma", "US Army"),
    ("united states army", "US Army"),
    ("us army", "US Army"),
    ("united states air force", "US Air Force"),
    ("us air force", "US Air Force"),
    ("us space force", "US Space Force"),
    ("department of defense", "US DoD"),
    ("us dod", "US DoD"),
)


def _clean_agency_name(value):
    value = _clean_html_text(value)
    if not value:
        return None
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(r"\s+", " ", value).strip(" ,;/")
    return value or None


def _agency_tokens(value):
    """Return canonical agency tokens found in free text, in source order.

    Unknown operators (for example ``STScI`` or ``Princeton University``) are
    deliberately *not* returned: they are host institutions, not funding
    agencies, and must never replace a real agency such as NASA.
    """
    text = _clean_html_text(value)
    if not text:
        return []
    lowered = text.lower()
    matches = []
    for alias, canonical in AGENCY_ALIASES:
        pattern = r"(?<![a-z0-9])" + re.escape(alias) + r"(?![a-z0-9])"
        for match in re.finditer(pattern, lowered):
            matches.append((match.start(), canonical))
    matches.sort(key=lambda item: item[0])
    tokens = []
    for _, canonical in matches:
        if canonical not in tokens:
            tokens.append(canonical)
    return tokens


def _normalize_agency_name(value):
    """Return a canonical, de-duplicated agency label for a free-text value."""
    tokens = _agency_tokens(value)
    if tokens:
        return " / ".join(tokens)
    return _clean_agency_name(value)


def _agency_token_set(value):
    return set(_agency_tokens(value))


def apply_external_enrichment(db, spacecraft, component, result, counters):
    """Fill empty fields and record verified source links.

    The 20 legacy spacecraft rows are never overwritten.  Rows created by the
    models.json catalogue are allowed to repair previously-enriched values when
    a newer verified source disagrees (for example a disambiguation page that
    was resolved to the wrong article on an earlier run).
    """
    nssdca = (result or {}).get("nssdca") or {}
    wiki = (result or {}).get("wikipedia") or {}
    wikidata = (result or {}).get("wikidata") or {}
    catalogue_row = _is_catalogue_spacecraft(spacecraft)
    filled = []
    old_title = (spacecraft.wiki_title or "").strip()
    title_changed = False

    def fill_field(field, value, allow_update=False):
        if not value:
            return False
        current = (getattr(spacecraft, field, None) or "").strip()
        if not current:
            setattr(spacecraft, field, value)
            filled.append(field)
            return True
        if allow_update and current != value:
            setattr(spacecraft, field, value)
            filled.append(f"{field}_updated")
            return True
        return False

    # A malformed catalogue identifier (for example a bare year or "SATCAT =")
    # must not survive forever just because the column is non-empty.
    if (
        catalogue_row
        and (spacecraft.nssdca_id or "").strip()
        and _looks_malformed_id(spacecraft.nssdca_id)
    ):
        spacecraft.nssdca_id = None
        filled.append("nssdca_id_cleared")

    # Wikipedia title / infobox values.
    if wiki.get("title"):
        new_title = wiki["title"]
        if not old_title or (catalogue_row and old_title != new_title):
            spacecraft.wiki_title = new_title
            filled.append("wiki_title")
            title_changed = bool(old_title and old_title != new_title)
        wiki_nssdca = _valid_nssdca_id(wiki.get("nssdca_id"))
        if wiki_nssdca:
            fill_field("nssdca_id", wiki_nssdca)
        if wiki.get("url"):
            source_url = wiki["url"]
            if wiki.get("section"):
                source_url = (
                    source_url
                    + "#"
                    + urllib.parse.quote(wiki["section"].replace(" ", "_"))
                )
            if add_spacecraft_source(
                db,
                spacecraft,
                "Wikipedia / MediaWiki API",
                source_url,
                "Reference Encyclopedia",
                (
                    f"Wikipedia article '{wiki.get('title')}' resolved via "
                    f"{wiki.get('match_method')} lookup."
                ),
            ):
                counters["wikipedia_sources_inserted"] += 1
        counters["wikipedia_matched"] += 1
    else:
        counters["wikipedia_missing"] += 1

    # NSSDCA verified record and detail-page facts.
    detail = nssdca.get("detail") or {}
    if nssdca.get("matched"):
        nssdca_code = _valid_nssdca_id(nssdca.get("nssdca_id"))
        if nssdca_code:
            fill_field("nssdca_id", nssdca_code)
        if detail:
            counters["nssdca_details_parsed"] += 1
        if nssdca.get("source_url"):
            if add_spacecraft_source(
                db,
                spacecraft,
                "NASA NSSDCA Master Catalog",
                nssdca["source_url"],
                "NASA NSSDCA Master Catalog",
                (
                    f"Matched NSSDCA record {nssdca.get('nssdca_id')} "
                    f"({nssdca.get('matched_name')}); query='{nssdca.get('query')}'."
                ),
            ):
                counters["nssdca_sources_inserted"] += 1
        counters["nssdca_matched"] += 1
        if nssdca.get("ambiguous"):
            counters["nssdca_ambiguous"] += 1
            counters.setdefault("nssdca_ambiguous_models", []).append(
                {
                    "model_name": component.model_name,
                    "matched": nssdca.get("matched_name"),
                    "members": [row["name"] for row in nssdca.get("matches", [])],
                }
            )
    else:
        counters["nssdca_missing"] += 1

    # Wikidata structured facts.  It may only fill an empty/malformed identifier;
    # a bare year exposed through the wrong Wikidata property must never replace
    # a valid COSPAR/NSSDCA code.
    if wikidata.get("wikidata_id"):
        counters["wikidata_matched"] += 1
    wikidata_nssdca = _valid_nssdca_id(wikidata.get("nssdca_id"))
    if wikidata_nssdca:
        fill_field("nssdca_id", wikidata_nssdca)

    # Agency repair.  Wikipedia's operator field is the richest verified value;
    # NSSDCA funding agency and Wikidata operator are fallbacks.  On catalogue
    # rows a value is replaced only when it is clearly incomplete or wrong, so
    # a richer existing multi-agency label (for example NASA / CONAE) survives.
    agency_candidates = []
    wiki_operator = (wiki.get("infobox") or {}).get("operator")
    if wiki_operator:
        agency_candidates.append(wiki_operator)
    if detail.get("funding_agency"):
        agency_candidates.append(" / ".join(detail["funding_agency"]))
    if wikidata.get("operator"):
        agency_candidates.append(" / ".join(wikidata["operator"]))
    for candidate in agency_candidates:
        new_tokens = _agency_tokens(candidate)
        if not new_tokens:
            # A host institution or unknown operator; try the next source.
            continue
        normalized_agency = " / ".join(new_tokens)
        current_agency = (spacecraft.agency or "").strip()
        if not current_agency:
            fill_field("agency", normalized_agency)
        elif catalogue_row:
            current_tokens = _agency_token_set(current_agency)
            if set(new_tokens) > current_tokens or current_tokens.isdisjoint(
                new_tokens
            ):
                fill_field("agency", normalized_agency, allow_update=True)
        break

    # Catalogue rows whose stored label is empty or is a host institution (for
    # example STScI or Princeton University) get the agency inferred from the
    # model metadata.  Legacy rows are never modified here.
    if catalogue_row:
        current_tokens = _agency_token_set(spacecraft.agency)
        if not current_tokens:
            inferred = infer_agency(
                component.model_name,
                component.display_name,
                component.full_name,
                component.description,
            )
            if inferred:
                fill_field("agency", inferred, allow_update=True)

    # Launch date: use the most precise verified candidate.  NSSDCA wins ties,
    # then Wikipedia, then Wikidata, so a year-only Wikipedia field cannot beat
    # a full Wikidata date.
    launch_candidates = [
        nssdca.get("launch_date"),
        wiki.get("launch_date"),
        wikidata.get("launch_date"),
    ]
    new_launch = None
    best_precision = 0
    for value in launch_candidates:
        precision = _date_precision(value)
        if precision > best_precision:
            new_launch = value
            best_precision = precision
    if new_launch:
        current_launch = (spacecraft.launch_date or "").strip()
        allow_update = catalogue_row and (
            title_changed
            or _looks_malformed_date(current_launch)
            or best_precision >= _date_precision(current_launch)
        )
        fill_field("launch_date", new_launch, allow_update=allow_update)

    # Verified overrides for instruments/hosted payloads whose own catalog
    # record is absent.  These are applied last and are deliberately explicit.
    curated = CURATED_FACT_OVERRIDES.get(
        component.model_name
    ) or CURATED_FACT_OVERRIDES.get(slugify(component.model_name or ""))
    alternate_references = []
    if catalogue_row and curated:
        if curated.get("launch_date"):
            fill_field("launch_date", curated["launch_date"], allow_update=True)
        curated_nssdca = _valid_nssdca_id(curated.get("nssdca_id"))
        if curated_nssdca:
            fill_field(
                "nssdca_id",
                curated_nssdca,
                allow_update=_looks_malformed_id(spacecraft.nssdca_id),
            )
        if curated.get("agency"):
            fill_field("agency", curated["agency"], allow_update=True)
        if curated.get("wiki_title"):
            fill_field("wiki_title", curated["wiki_title"], allow_update=True)
        if curated.get("description"):
            fill_field("description", curated["description"])
        if curated.get("official_url"):
            fill_field("official_url", curated["official_url"])
        if curated.get("reference_title") and curated.get("reference_url"):
            alternate_references.append(
                {
                    "title": curated["reference_title"],
                    "url": curated["reference_url"],
                }
            )
        for source in curated.get("sources") or []:
            if not source.get("url"):
                continue
            if add_spacecraft_source(
                db,
                spacecraft,
                source.get("name") or "Curated source",
                source["url"],
                source.get("source_type") or "Reference",
                source.get("notes") or curated.get("note") or "",
            ):
                counters["curated_sources_inserted"] += 1
        counters.setdefault("curated_overrides_applied", []).append(
            {
                "model_name": component.model_name,
                "fields": sorted(
                    key for key in curated if key not in {"note", "sources"}
                ),
                "note": curated.get("note"),
            }
        )

    # Description: Wikipedia intro first, then the richer NSSDCA description.
    if not (spacecraft.description or "").strip():
        description = wiki.get("extract") or detail.get("description")
        fill_field("description", description)

    if filled:
        counters["fields_filled"] += len(filled)
        counters.setdefault("enriched_models", []).append(
            {"model_name": component.model_name, "fields": filled}
        )

    _merge_extra(
        spacecraft,
        {
            "version": ENRICHMENT_VERSION,
            "curated": curated or None,
            "alternate_references": alternate_references or None,
            "wikidata_id": (wikidata or {}).get("wikidata_id")
            or (curated or {}).get("wikidata_id"),
            "nssdca": {
                "matched": bool(nssdca.get("matched")),
                "nssdca_id": nssdca.get("nssdca_id"),
                "launch_date": nssdca.get("launch_date"),
                "matched_name": nssdca.get("matched_name"),
                "source_url": nssdca.get("source_url"),
                "matches": nssdca.get("matches") or [],
                "facts": detail.get("facts") or {},
                "description": (detail.get("description") or "")[:8000] or None,
                "alternate_names": detail.get("alternate_names") or [],
                "disciplines": detail.get("disciplines") or [],
                "funding_agency": detail.get("funding_agency") or [],
                "launch_vehicle": detail.get("launch_vehicle"),
                "launch_site": detail.get("launch_site"),
                "mass": detail.get("mass"),
                "power": detail.get("power"),
                "checked_at": utcnow().isoformat() + "Z",
            },
            "wikipedia": {
                "matched": bool(wiki.get("title")),
                "title": wiki.get("title"),
                "url": wiki.get("url"),
                "extract": (wiki.get("extract") or "")[:4000],
                "match_method": wiki.get("match_method"),
                "wikibase_item": wiki.get("wikibase_item"),
                "redirect_from": wiki.get("redirect_from"),
                "section": wiki.get("section"),
                "infobox": wiki.get("infobox") or {},
                "checked_at": utcnow().isoformat() + "Z",
            },
            "wikidata": wikidata or None,
        },
    )


def enrich_database(db, models, counters):
    """Concurrently resolve NSSDCA + Wikipedia metadata and apply it."""
    items_by_name = {
        str(item.get("ModelName") or "").strip(): item
        for item in models
        if str(item.get("ModelName") or "").strip()
    }
    components = db.query(HardwareComponent).all()
    tasks = []
    for component in components:
        spacecraft = component.spacecraft
        if not spacecraft:
            continue
        try:
            existing_extra = json.loads(spacecraft.extra) if spacecraft.extra else {}
        except (TypeError, ValueError):
            existing_extra = {}
        existing_enrichment = (existing_extra or {}).get("enrichment") or {}
        current_version = existing_enrichment.get("version", 0)
        complete = (
            (spacecraft.launch_date or "").strip()
            and (spacecraft.nssdca_id or "").strip()
            and (
                (spacecraft.wiki_title or "").strip()
                or _alternate_references(spacecraft)
            )
        )
        if complete and (
            current_version >= ENRICHMENT_VERSION
            or not _is_catalogue_spacecraft(spacecraft)
        ):
            counters["enrichment_skipped"] += 1
            continue
        item = items_by_name.get(component.model_name) or {
            "ModelName": component.model_name,
            "DisplayName": component.display_name,
            "FullName": component.full_name,
            "Description": component.description_html,
            "eotssURL": component.eotss_url,
        }
        meta = {
            "display_name": component.display_name,
            "full_name": component.full_name,
            "description": component.description,
            "eotss_url": component.eotss_url,
        }
        tasks.append((component, item, meta))

    if not tasks:
        return

    print(
        f"      Fetching NSSDCA + Wikimedia metadata for {len(tasks)} "
        f"spacecraft (concurrent)..."
    )
    results = {}
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {
            pool.submit(lookup_external_metadata, item, meta): component.id
            for component, item, meta in tasks
        }
        completed = 0
        for future in as_completed(futures):
            component_id = futures[future]
            try:
                results[component_id] = future.result()
            except Exception as exc:
                results[component_id] = {
                    "nssdca": {"matched": False, "reason": str(exc)},
                    "wikipedia": {"matched": False, "reason": str(exc)},
                }
            completed += 1
            if completed % 20 == 0 or completed == len(tasks):
                print(f"      [{completed:03d}/{len(tasks):03d}] metadata resolved")

    components_by_id = {component.id: component for component, _, _ in tasks}
    for component_id, result in results.items():
        component = components_by_id.get(component_id)
        if component is None or component.spacecraft is None:
            continue
        try:
            apply_external_enrichment(
                db, component.spacecraft, component, result, counters
            )
        except Exception as exc:
            counters["enrichment_errors"] += 1
            counters.setdefault("enrichment_error_details", []).append(
                {"model_name": component.model_name, "error": str(exc)}
            )
    db.flush()

    # Backfill mission records from every linked spacecraft, including the
    # legacy mission_spacecraft bridge used by the original 20 missions.
    legacy_links = {}
    try:
        for mission_id, spacecraft_id in db.execute(
            text("SELECT mission_id, spacecraft_id FROM mission_spacecraft")
        ).all():
            legacy_links.setdefault(mission_id, []).append(spacecraft_id)
    except Exception:
        legacy_links = {}

    mission_filled = 0
    for mission in db.query(Mission).all():
        changed = False
        if not (mission.mission_name or "").strip() and (mission.name or "").strip():
            mission.mission_name = mission.name
            changed = True

        linked = []
        for component in (
            db.query(HardwareComponent)
            .filter(HardwareComponent.mission_id == mission.id)
            .all()
        ):
            if component.spacecraft:
                linked.append(component.spacecraft)
        for spacecraft in mission.spacecraft_items:
            linked.append(spacecraft)
        for spacecraft_id in legacy_links.get(mission.id, []):
            spacecraft = db.get(Spacecraft, spacecraft_id)
            if spacecraft:
                linked.append(spacecraft)

        seen_ids = set()
        spacecraft_items = []
        for spacecraft in linked:
            if spacecraft.id not in seen_ids:
                seen_ids.add(spacecraft.id)
                spacecraft_items.append(spacecraft)

        values = {field: None for field in (
            "agency",
            "destination",
            "destination_category",
            "launch_date",
            "description",
            "objectives",
            "source_url",
            "mission_name",
            "mission_type",
        )}
        for spacecraft in spacecraft_items:
            candidate_values = {
                "agency": spacecraft.agency,
                "destination": spacecraft.destination_category,
                "destination_category": spacecraft.destination_category,
                "launch_date": spacecraft.launch_date,
                "description": spacecraft.description,
                "objectives": spacecraft.scientific_purpose,
                "source_url": spacecraft.official_url,
                "mission_name": spacecraft.full_name or spacecraft.display_name,
                "mission_type": spacecraft.mission_type,
            }
            for field, value in candidate_values.items():
                if value and not values[field]:
                    values[field] = value
        agency_fallback = MISSION_AGENCY_FALLBACK.get(mission.slug)
        if agency_fallback and not values["agency"]:
            values["agency"] = agency_fallback
        for field, value in values.items():
            if value and not (getattr(mission, field, None) or "").strip():
                setattr(mission, field, value)
                changed = True
        if changed:
            mission_filled += 1
    counters["missions_enriched"] = mission_filled
    db.flush()



def load_models_payload(input_path=None):
    if input_path:
        if Path is None:
            raise RuntimeError("pathlib is unavailable")
        raw_bytes = Path(input_path).expanduser().read_bytes()
        source = str(Path(input_path).expanduser().resolve())
    else:
        raw_bytes = fetch_bytes(MODELS_JSON_URL)
        source = MODELS_JSON_URL
    payload = json.loads(raw_bytes.decode("utf-8-sig"))
    if not isinstance(payload, dict) or not isinstance(payload.get("Models"), list):
        raise ValueError(
            "models.json must contain a top-level object with a 'Models' array."
        )
    return payload, raw_bytes, source


def ensure_organization(db, slug, name, org_type, country, official_url):
    organization = (
        db.query(Organization)
        .filter(or_(Organization.slug == slug, Organization.name == name))
        .first()
    )
    if organization is None:
        organization = Organization(
            name=name,
            slug=slug,
            organization_type=org_type,
            country=country,
            official_url=official_url,
        )
        db.add(organization)
        db.flush()
    else:
        changed = False
        if not organization.organization_type:
            organization.organization_type = org_type
            changed = True
        if not organization.country:
            organization.country = country
            changed = True
        if not organization.official_url:
            organization.official_url = official_url
            changed = True
        if changed:
            db.flush()
    return organization


class MissionResolver:
    """Resolve a models.json record to an existing or newly created mission."""

    def __init__(self, db):
        self.db = db
        self.missions = db.query(Mission).all()
        self.by_slug = {}
        self.by_key = {}
        self.created_count = 0
        self.updated_count = 0
        for mission in self.missions:
            self._register(mission)

    def _register(self, mission):
        self.by_slug[mission.slug] = mission
        for value in (mission.name, mission.mission_name):
            key = normalize_key(value)
            if key:
                self.by_key.setdefault(key, mission)
        self.by_key.setdefault(normalize_key(mission.slug), mission)

    def ensure_mission(
        self,
        slug,
        name,
        destination="Deep Space",
        mission_status="Active",
        agency="NASA",
        mission_type=None,
        description=None,
        objectives=None,
        launch_date=None,
        source_url=None,
    ):
        mission = (
            self.db.query(Mission)
            .filter(or_(Mission.slug == slug, Mission.name == name))
            .first()
        )
        created = mission is None
        if created:
            mission = Mission(
                slug=slug,
                name=name,
                mission_name=name,
                destination=destination,
                destination_category=destination,
                mission_status=mission_status,
                agency=agency,
                mission_type=mission_type or f"{destination} mission",
                description=description,
                objectives=objectives,
                launch_date=launch_date,
                source_url=source_url,
            )
            self.db.add(mission)
            self.db.flush()
            self.created_count += 1
        else:
            changed = False
            values = {
                "name": name if not mission.name else mission.name,
                "mission_name": name if not mission.mission_name else mission.mission_name,
                "destination": destination if not mission.destination else mission.destination,
                "destination_category": (
                    destination
                    if not mission.destination_category
                    else mission.destination_category
                ),
                "mission_status": (
                    mission_status if not mission.mission_status else mission.mission_status
                ),
                "agency": agency if not mission.agency else mission.agency,
                "mission_type": (
                    mission_type if not mission.mission_type else mission.mission_type
                ),
                "description": description if not mission.description else mission.description,
                "objectives": objectives if not mission.objectives else mission.objectives,
                "launch_date": launch_date if not mission.launch_date else mission.launch_date,
                "source_url": source_url if not mission.source_url else mission.source_url,
            }
            for field, value in values.items():
                if value is not None and getattr(mission, field, None) in (None, ""):
                    setattr(mission, field, value)
                    changed = True
            if changed:
                self.db.flush()
                self.updated_count += 1
        self._register(mission)
        if mission not in self.missions:
            self.missions.append(mission)
        return mission, created

    def _best_token_match(self, item):
        model_name = item.get("ModelName", "")
        display_name = item.get("DisplayName", "")
        full_name = item.get("FullName", "")
        tokens = significant_tokens(f"{model_name} {display_name} {full_name}")
        if not tokens:
            return None
        best = None
        second_score = 0.0
        for mission in self.missions:
            candidate_name = mission.name or mission.mission_name or mission.slug
            candidate_tokens = significant_tokens(candidate_name)
            if not candidate_tokens:
                continue
            intersection = tokens & candidate_tokens
            if not intersection:
                continue
            score = len(intersection) / max(1, len(tokens))
            if tokens.issubset(candidate_tokens):
                score = max(score, 0.92)
            if score >= 0.82:
                if best is None or score > best[0]:
                    second_score = best[0] if best else 0.0
                    best = (score, mission)
                elif score > second_score:
                    second_score = score
        if best and (best[0] - second_score >= 0.08 or best[0] >= 0.99):
            return best[1], "token_match", round(best[0], 3)
        return None

    def resolve(self, item, spacecraft, meta):
        model_name = str(item.get("ModelName") or "").strip()
        slug = slugify(model_name)

        # 1. Curated multi-model mission family.
        group = MISSION_GROUP_MAP.get(slug)
        if group:
            mission_slug, mission_name, role = group
            mission, _ = self.ensure_mission(
                mission_slug,
                mission_name,
                destination=meta["destination"],
                mission_status=meta["operational_status"],
                agency=meta["agency"],
                mission_type=f"{meta['destination']} mission",
                description=meta["description"],
                objectives=meta["scientific_purpose"],
                launch_date=meta["launch_date"],
                source_url=meta["official_url"],
            )
            return mission, "curated_mission_family", 1.0, role

        # 2. Exact slug / normalised name match against existing missions.
        for candidate in (
            slug,
            normalize_key(item.get("ModelName")),
            normalize_key(item.get("DisplayName")),
            normalize_key(item.get("FullName")),
        ):
            mission = self.by_slug.get(candidate) or self.by_key.get(candidate)
            if mission:
                return mission, "exact_match", 1.0, "Primary hardware"

        # 3. NASA Eyes URL key (e.g. #/sc_ace -> ace).
        eotss_key = extract_eotss_key(item.get("eotssURL"))
        if eotss_key:
            for candidate in (
                eotss_key,
                eotss_key.replace("_", "-"),
                eotss_key.replace("sc_", "", 1),
            ):
                mission = self.by_slug.get(candidate) or self.by_key.get(
                    normalize_key(candidate)
                )
                if mission:
                    return mission, "eotss_url_match", 0.97, "Primary hardware"

        # 4. Mission already attached to the resolved spacecraft.
        if spacecraft and spacecraft.primary_mission_id:
            mission = (
                self.db.query(Mission)
                .filter(Mission.id == spacecraft.primary_mission_id)
                .first()
            )
            if mission:
                return mission, "existing_spacecraft_mission", 0.94, "Primary hardware"

        # 5. Conservative keyword/token match.
        token_match = self._best_token_match(item)
        if token_match:
            mission, method, confidence = token_match
            return mission, method, confidence, "Primary hardware"

        # 6. Create a dedicated mission for this hardware item.  This guarantees
        #    that every model has a non-null mission link.
        mission, _ = self.ensure_mission(
            f"mission-{slug}",
            meta["full_name"],
            destination=meta["destination"],
            mission_status=meta["operational_status"],
            agency=meta["agency"],
            mission_type=f"{meta['destination']} {meta['component_type']}",
            description=meta["description"],
            objectives=meta["scientific_purpose"],
            launch_date=meta["launch_date"],
            source_url=meta["official_url"],
        )
        return mission, "created_dedicated_mission", 1.0, "Primary hardware"


def upsert_spacecraft(db, item, meta, assets, mission, agency_org):
    model_name = str(item.get("ModelName") or "").strip()
    slug = slugify(model_name)
    spacecraft = (
        db.query(Spacecraft)
        .filter(or_(Spacecraft.slug == slug, Spacecraft.name == model_name))
        .first()
    )
    if spacecraft is None:
        for candidate in {slugify(meta["display_name"]), slugify(meta["full_name"])}:
            spacecraft = (
                db.query(Spacecraft).filter(Spacecraft.slug == candidate).first()
            )
            if spacecraft:
                break

    created = spacecraft is None
    alternate_names = ", ".join(
        dict.fromkeys(
            value
            for value in (
                meta["display_name"],
                meta["full_name"],
                item.get("DisplayName"),
                item.get("FullName"),
            )
            if value and value != model_name
        )
    )
    values = {
        "display_name": meta["display_name"],
        "full_name": meta["full_name"],
        "alternate_names": alternate_names or None,
        "agency": meta["agency"],
        "manufacturer": meta["agency"],
        "launch_date": meta["launch_date"],
        "spacecraft_type": meta["component_type"],
        "object_type": meta["component_type"],
        "description": meta["description"],
        "short_description": meta["short_description"],
        "educational_description": meta["description"],
        "how_it_works": meta["how_it_works"],
        "why_it_is_important": meta["why_it_is_important"],
        "scientific_purpose": meta["scientific_purpose"],
        "current_or_last_known_status": meta["status_text"],
        "operational_status": meta["operational_status"],
        "model_path": assets["glb_path"] or None,
        "model_format": "glb" if assets["glb_path"] else None,
        "thumbnail_path": assets["thumbnail_path"] or None,
        "source_url": meta["official_url"],
        "destination": meta["destination"],
        "destination_category": meta["destination"],
        "official_url": meta["official_url"],
        "eotss_url": meta["eotss_url"],
        "agency_id": agency_org.id,
        "verification_status": "Verified from NASA Eyes on the Solar System catalogue",
        "last_verified_at": today_iso(),
        "mission_type": f"{meta['destination']} {meta['component_type']}",
        "primary_agency": meta["agency"],
        "summary": meta["short_description"],
        "status_label": meta["operational_status"],
        "status_text": meta["status_text"],
        "status_as_of": today_iso(),
        "is_active_flag": meta["operational_status"].lower().startswith("active"),
        "extra": json.dumps(item, ensure_ascii=False),
    }
    if created:
        spacecraft = Spacecraft(
            name=model_name,
            slug=slug,
            **values,
        )
        db.add(spacecraft)
        db.flush()
    else:
        # Existing catalogue rows are the authoritative legacy records: never
        # overwrite a populated value.  Only fill fields that are still empty.
        for field, value in values.items():
            if value is None or value == "":
                continue
            current = getattr(spacecraft, field, None)
            if current is None or (isinstance(current, str) and not current.strip()):
                setattr(spacecraft, field, value)
        db.flush()
    return spacecraft, created


def upsert_model3d(db, spacecraft, item, meta, assets):
    model_name = str(item.get("ModelName") or "").strip()
    model = (
        db.query(Model3D)
        .filter(
            or_(
                Model3D.spacecraft_id == spacecraft.id,
                Model3D.model_name == model_name,
            )
        )
        .first()
    )
    created = model is None
    values = {
        "model_name": model_name,
        "folder_name": str(item.get("FolderName") or model_name).strip(),
        "primary_format": "glb",
        "glb_filename": assets["glb_filename"] or f"{model_name}.glb",
        "glb_path": assets["glb_path"] or f"/assets/spacecraft/{model_name}/{model_name}.glb",
        "gltf_filename": assets["gltf_filename"] or f"{model_name}.gltf",
        "gltf_path": assets["gltf_path"] or f"/assets/spacecraft/{model_name}/{model_name}.gltf",
        "bin_filename": assets["bin_filename"] or None,
        "bin_path": assets["bin_path"] or None,
        "texture_files": json.dumps(assets["texture_files"], ensure_ascii=False),
        "texture_count": assets["texture_count"],
        "file_size_bytes": assets["file_size_bytes"],
        "is_available": bool(assets["glb_path"]),
        "provenance": "NASA Eyes on the Solar System (Official Public Domain) via matthewgiarra/spacecraft-models",
        "source_url": assets["download_gltf_url"] or meta["eotss_url"],
    }
    if created:
        model = Model3D(spacecraft_id=spacecraft.id, **values)
        db.add(model)
        db.flush()
    else:
        # Never overwrite an existing model record; only fill empty fields.
        for field, value in values.items():
            if value is None or value == "":
                continue
            current = getattr(model, field, None)
            if current is None or (isinstance(current, str) and not current.strip()):
                setattr(model, field, value)
        db.flush()
    return model, created


def upsert_spacecraft_model(db, spacecraft, meta, assets, format_name):
    if format_name == "glb":
        download_url = assets["download_glb_url"]
        file_path = assets["glb_path"]
        size_bytes = assets["glb_size_bytes"]
    else:
        download_url = assets["download_gltf_url"]
        file_path = assets["gltf_path"]
        size_bytes = assets["gltf_size_bytes"]
    if not download_url:
        return False
    # The existing spacecraft_models rows are authoritative: if this spacecraft
    # already has an asset in this format, keep it untouched.
    existing_format = (
        db.query(SpacecraftModel)
        .filter(
            SpacecraftModel.spacecraft_id == spacecraft.id,
            SpacecraftModel.format == format_name,
        )
        .first()
    )
    if existing_format is not None:
        return False
    model = (
        db.query(SpacecraftModel)
        .filter(
            SpacecraftModel.spacecraft_id == spacecraft.id,
            SpacecraftModel.download_url == download_url,
        )
        .first()
    )
    if model is not None:
        return False
    values = {
        "file_path": file_path or None,
        "download_url": download_url,
        "format": format_name,
        "size_bytes": size_bytes,
        "web_ready": True,
        "provider": "NASA Eyes on the Solar System / matthewgiarra/spacecraft-models",
        "license": "NASA 3D resources are free to use without copyright",
        "viewer_url": meta["eotss_url"],
        "status": "ok",
    }
    model = SpacecraftModel(spacecraft_id=spacecraft.id, **values)
    db.add(model)
    db.flush()
    return True


def upsert_hardware_component(db, item, meta, assets, spacecraft, mission, match_method, confidence):
    model_name = str(item.get("ModelName") or "").strip()
    component_key = slugify(model_name)
    component = (
        db.query(HardwareComponent)
        .filter(
            or_(
                HardwareComponent.component_key == component_key,
                HardwareComponent.model_name == model_name,
            )
        )
        .first()
    )
    created = component is None
    status = "complete" if not assets["missing"] else "partial"
    values = {
        "component_key": component_key,
        "model_name": model_name,
        "folder_name": str(item.get("FolderName") or model_name).strip(),
        "display_name": meta["display_name"],
        "full_name": meta["full_name"],
        "component_type": meta["component_type"],
        "description": meta["description"],
        "description_html": meta["description_html"],
        "spacecraft_id": spacecraft.id,
        "mission_id": mission.id,
        "mission_match_method": match_method,
        "mission_match_confidence": confidence,
        "eotss_url": meta["eotss_url"],
        "viewer_url": meta["eotss_url"],
        "official_url": meta["official_url"],
        "gltf_filename": assets["gltf_filename"] or f"{model_name}.gltf",
        "glb_filename": assets["glb_filename"] or f"{model_name}.glb",
        "bin_filename": assets["bin_filename"] or "",
        "gltf_path": assets["gltf_path"] or f"/assets/spacecraft/{model_name}/{model_name}.gltf",
        "glb_path": assets["glb_path"] or f"/assets/spacecraft/{model_name}/{model_name}.glb",
        "bin_path": assets["bin_path"] or "",
        "download_gltf_url": assets["download_gltf_url"],
        "download_glb_url": assets["download_glb_url"],
        "primary_format": "glb",
        "web_ready": True,
        "texture_files": json.dumps(assets["texture_files"], ensure_ascii=False),
        "texture_count": assets["texture_count"],
        "file_size_bytes": assets["file_size_bytes"],
        "glb_size_bytes": assets["glb_size_bytes"],
        "gltf_size_bytes": assets["gltf_size_bytes"],
        "binary_size_bytes": assets["binary_size_bytes"],
        "provenance": "NASA Eyes on the Solar System (Official Public Domain) via matthewgiarra/spacecraft-models",
        "license": "NASA 3D resources are free to use without copyright",
        "source_name": "NASA Eyes on the Solar System",
        "source_url": meta["eotss_url"],
        "source_repository": REPOSITORY_URL,
        "raw_json": json.dumps(item, ensure_ascii=False),
        "ingestion_status": status,
    }
    if created:
        component = HardwareComponent(**values)
        db.add(component)
        db.flush()
    else:
        for field, value in values.items():
            setattr(component, field, value)
        db.flush()
    return component, created


def upsert_component_mission(db, component, mission, role, is_primary, method, confidence):
    link = (
        db.query(HardwareComponentMission)
        .filter(
            HardwareComponentMission.component_id == component.id,
            HardwareComponentMission.mission_id == mission.id,
        )
        .first()
    )
    created = link is None
    if created:
        link = HardwareComponentMission(
            component_id=component.id,
            mission_id=mission.id,
        )
        db.add(link)
    link.role = (role or "Hardware / 3D model")[:150]
    link.is_primary = bool(is_primary)
    link.match_method = method
    link.match_confidence = confidence
    db.flush()
    return created


def seed_data_sources(db):
    inserted = 0
    for definition in DATA_SOURCE_DEFINITIONS:
        source = (
            db.query(DataSource)
            .filter(DataSource.api_name == definition["api_name"])
            .first()
        )
        if source is None:
            source = DataSource(
                api_name=definition["api_name"],
                base_url=definition["base_url"],
                license=definition["license"],
                attribution=definition["attribution"],
                last_checked=utcnow(),
            )
            db.add(source)
            inserted += 1
        else:
            source.base_url = definition["base_url"]
            source.license = definition["license"]
            source.attribution = definition["attribution"]
            source.last_checked = utcnow()
    db.flush()
    return inserted


def add_spacecraft_source(db, spacecraft, name, url, source_type, notes):
    url = normalize_url(url)
    if not url:
        return False
    existing = (
        db.query(SpacecraftSource)
        .filter(
            SpacecraftSource.spacecraft_id == spacecraft.id,
            SpacecraftSource.source_url == url,
        )
        .first()
    )
    if existing:
        return False
    db.add(
        SpacecraftSource(
            spacecraft_id=spacecraft.id,
            source_name=name[:255],
            source_url=url,
            source_type=source_type[:100],
            evidence_notes=notes,
            last_checked_at=today_iso(),
        )
    )
    return True


def _component_sources(db, spacecraft, item, meta):
    inserted = 0
    inserted += add_spacecraft_source(
        db,
        spacecraft,
        "NASA Eyes on the Solar System",
        meta["eotss_url"],
        "NASA Science Data Archive",
        "Authentic 3D model and hardware metadata from the NASA Eyes catalogue.",
    )
    inserted += add_spacecraft_source(
        db,
        spacecraft,
        "NASA 3D Resources / spacecraft-models",
        REPOSITORY_URL,
        "3D Model Repository",
        "Source repository for the GLB, glTF, BIN and texture payloads.",
    )
    inserted += add_spacecraft_source(
        db,
        spacecraft,
        "NASA NSSDCA Master Catalog",
        f"{NSSDCA_URL}spacecraft/query?name={urllib.parse.quote(meta['display_name'])}",
        "NASA NSSDCA Master Catalog",
        "Authoritative spacecraft identifier, timeline and experiment index.",
    )
    inserted += add_spacecraft_source(
        db,
        spacecraft,
        "NASA Science Mission Directorate",
        meta["official_url"],
        "Official Mission Website",
        "Official mission page extracted from the NASA Eyes description.",
    )
    inserted += add_spacecraft_source(
        db,
        spacecraft,
        "Wikimedia REST API / MediaWiki Action API",
        "https://en.wikipedia.org/w/index.php?search="
        + urllib.parse.quote(meta["full_name"]),
        "Reference Encyclopedia",
        "Cross-reference for text summaries, infobox specifications and launch dates.",
    )
    slug = slugify(item.get("ModelName"))
    if meta["agency"].lower().startswith("nasa") or "nasa" in meta["agency"].lower():
        inserted += add_spacecraft_source(
            db,
            spacecraft,
            "JPL Archives & Mission History",
            JPL_URL,
            "JPL Archive",
            "JPL mission history and technical archive cross-reference.",
        )
    if slug in APL_MISSIONS:
        inserted += add_spacecraft_source(
            db,
            spacecraft,
            "JHU Applied Physics Laboratory Technical Archives",
            JHUAPL_URL,
            "Technical Archive",
            "APL-built spacecraft and instrument technical archive.",
        )
    inserted += add_spacecraft_source(
        db,
        spacecraft,
        "NASA History Division",
        NASA_HISTORY_URL,
        "NASA History Publication",
        "NASA historical programme records and mission documentation.",
    )
    return inserted


def build_ingestion_report(db, models, source, raw_bytes, counters, source_issues):
    components = (
        db.query(HardwareComponent).order_by(HardwareComponent.model_name).all()
    )
    source_names = {
        str(item.get("ModelName") or "").strip()
        for item in models
        if str(item.get("ModelName") or "").strip()
    }
    db_names = {component.model_name for component in components}

    missing_components = sorted(source_names - db_names)
    unexpected_components = sorted(db_names - source_names)

    required_gaps = []
    for component in components:
        for field in REQUIRED_COMPONENT_FIELDS:
            value = getattr(component, field, None)
            if value is None or (isinstance(value, str) and not value.strip()):
                required_gaps.append(
                    {
                        "model_name": component.model_name,
                        "field": field,
                        "reason": "NULL or empty value",
                    }
                )

    asset_gaps = []
    for component in components:
        if component.file_size_bytes <= 0:
            asset_gaps.append(
                {
                    "model_name": component.model_name,
                    "field": "file_size_bytes",
                    "reason": "asset folder is empty or unreadable",
                }
            )
        if component.glb_size_bytes <= 0:
            asset_gaps.append(
                {
                    "model_name": component.model_name,
                    "field": "glb_size_bytes",
                    "reason": "GLB asset missing or empty",
                }
            )
        if component.gltf_size_bytes <= 0:
            asset_gaps.append(
                {
                    "model_name": component.model_name,
                    "field": "gltf_size_bytes",
                    "reason": "glTF asset missing or empty",
                }
            )
        if not component.bin_filename:
            asset_gaps.append(
                {
                    "model_name": component.model_name,
                    "field": "bin_filename",
                    "reason": "BIN asset missing",
                }
            )

    mission_ids = {mission_id for (mission_id,) in db.query(Mission.id).all()}
    mission_gaps = []
    link_counts = dict(
        db.query(
            HardwareComponentMission.component_id,
            func.count(HardwareComponentMission.id),
        )
        .group_by(HardwareComponentMission.component_id)
        .all()
    )
    for component in components:
        if not component.mission_id or component.mission_id not in mission_ids:
            mission_gaps.append(
                {
                    "model_name": component.model_name,
                    "field": "mission_id",
                    "reason": "mission row does not exist",
                }
            )
        if link_counts.get(component.id, 0) < 1:
            mission_gaps.append(
                {
                    "model_name": component.model_name,
                    "field": "hardware_component_missions",
                    "reason": "no mission bridge row",
                }
            )

    raw_field_gaps = []
    for item in models:
        model_name = str(item.get("ModelName") or "").strip()
        for field in REQUIRED_SOURCE_FIELDS:
            if not str(item.get(field) or "").strip():
                raw_field_gaps.append(
                    {
                        "model_name": model_name or "<unknown>",
                        "field": field,
                        "reason": "missing from the source JSON",
                    }
                )

    unmapped_or_missing = (
        list(source_issues)
        + list(required_gaps)
        + list(asset_gaps)
        + list(mission_gaps)
        + list(raw_field_gaps)
    )
    if missing_components:
        unmapped_or_missing.extend(
            {
                "model_name": name,
                "field": "hardware_components",
                "reason": "source model is missing from the database",
            }
            for name in missing_components
        )

    launch_date_missing = sorted(
        component.model_name
        for component in components
        if not (component.spacecraft and component.spacecraft.launch_date)
    )
    nssdca_missing = sorted(
        component.model_name
        for component in components
        if not (component.spacecraft and component.spacecraft.nssdca_id)
    )
    wiki_missing = sorted(
        component.model_name
        for component in components
        if not (component.spacecraft and component.spacecraft.wiki_title)
    )
    reference_missing = sorted(
        component.model_name
        for component in components
        if not (
            component.spacecraft
            and (
                component.spacecraft.wiki_title
                or _alternate_references(component.spacecraft)
            )
        )
    )
    gap_notes = []
    if "neo-surveyor" in nssdca_missing:
        gap_notes.append(
            "neo-surveyor is pre-launch (planned 2027); no COSPAR/NSSDCA "
            "identifier has been assigned yet, so the NASA mission page and "
            "Wikidata record Q6984358 are stored instead."
        )
    for model_name in wiki_missing:
        component = next(
            (item for item in components if item.model_name == model_name), None
        )
        if component and component.spacecraft and _alternate_references(
            component.spacecraft
        ):
            gap_notes.append(
                f"{model_name} has no English Wikipedia article; verified "
                "JPL/eoPortal/NASA references are stored instead."
            )
    mission_field_gaps = []
    for mission in db.query(Mission).order_by(Mission.name).all():
        for field in (
            "agency",
            "destination",
            "launch_date",
            "objectives",
            "source_url",
        ):
            if not (getattr(mission, field, None) or "").strip():
                mission_field_gaps.append(
                    {"mission": mission.name, "field": field}
                )

    method_counts = Counter(component.mission_match_method for component in components)
    type_counts = Counter(component.component_type for component in components)
    destination_counts = Counter(
        component.spacecraft.destination_category
        for component in components
        if component.spacecraft
    )
    status_counts = Counter(component.ingestion_status for component in components)

    database_counts = {
        "hardware_components": db.query(HardwareComponent).count(),
        "hardware_component_missions": db.query(HardwareComponentMission).count(),
        "spacecraft": db.query(Spacecraft).count(),
        "missions": db.query(Mission).count(),
        "models_3d": db.query(Model3D).count(),
        "spacecraft_models": db.query(SpacecraftModel).count(),
        "spacecraft_sources": db.query(SpacecraftSource).count(),
        "organizations": db.query(Organization).count(),
        "data_sources": db.query(DataSource).count(),
    }

    return {
        "status": "pass" if not unmapped_or_missing else "gaps",
        "source": source,
        "source_url": MODELS_JSON_URL,
        "source_sha256": hashlib.sha256(raw_bytes).hexdigest(),
        "source_records": len(models),
        "source_fields": {
            field: sum(
                1 for item in models if str(item.get(field) or "").strip()
            )
            for field in REQUIRED_SOURCE_FIELDS
        },
        "database_counts": database_counts,
        "ingestion_counters": dict(counters),
        "enrichment": {
            "nssdca_matched": counters.get("nssdca_matched", 0),
            "nssdca_missing": counters.get("nssdca_missing", 0),
            "nssdca_ambiguous": counters.get("nssdca_ambiguous", 0),
            "nssdca_details_parsed": counters.get("nssdca_details_parsed", 0),
            "wikipedia_matched": counters.get("wikipedia_matched", 0),
            "wikipedia_missing": counters.get("wikipedia_missing", 0),
            "wikidata_matched": counters.get("wikidata_matched", 0),
            "fields_filled": counters.get("fields_filled", 0),
            "enriched_models": counters.get("enriched_models", []),
            "nssdca_ambiguous_models": counters.get(
                "nssdca_ambiguous_models", []
            ),
            "errors": counters.get("enrichment_error_details", []),
        },
        "mission_mapping": dict(sorted(method_counts.items())),
        "component_types": dict(sorted(type_counts.items())),
        "destinations": dict(sorted(destination_counts.items())),
        "ingestion_status": dict(sorted(status_counts.items())),
        "missing_components": missing_components,
        "unexpected_components": unexpected_components,
        "unmapped_or_missing": unmapped_or_missing,
        "optional_enrichment_gaps": {
            "note": (
                "These fields are not present in viewer/models.json. They are "
                "registered source links rather than fabricated values."
            ),
            "launch_date_missing": launch_date_missing,
            "nssdca_id_missing": nssdca_missing,
            "wiki_title_missing": wiki_missing,
            "reference_missing": reference_missing,
            "gap_notes": gap_notes,
            "mission_field_gaps": mission_field_gaps,
        },
        "checked_at": utcnow().isoformat() + "Z",
    }


def print_ingestion_report(report):
    line = "=" * 78
    print(line)
    print("HARDWARE COMPONENTS / 3D MODELS INGESTION REPORT")
    print(line)
    print(f"Source                : {report['source']}")
    print(f"Source SHA-256        : {report['source_sha256']}")
    print(f"Source records        : {report['source_records']}")
    print(f"Hardware components   : {report['database_counts']['hardware_components']}")
    print(f"Mission bridge rows   : {report['database_counts']['hardware_component_missions']}")
    print(f"Spacecraft rows       : {report['database_counts']['spacecraft']}")
    print(f"Mission rows          : {report['database_counts']['missions']}")
    print(f"models_3d rows        : {report['database_counts']['models_3d']}")
    print(f"spacecraft_models rows: {report['database_counts']['spacecraft_models']}")
    print(f"spacecraft_sources    : {report['database_counts']['spacecraft_sources']}")
    print(f"organizations         : {report['database_counts']['organizations']}")
    print(f"data_sources          : {report['database_counts']['data_sources']}")
    enrichment = report.get("enrichment") or {}
    print("-" * 78)
    print("EXTERNAL ENRICHMENT (NSSDCA + Wikimedia)")
    print(f"  NSSDCA matched      : {enrichment.get('nssdca_matched', 0)}")
    print(f"  NSSDCA unmatched    : {enrichment.get('nssdca_missing', 0)}")
    print(f"  NSSDCA ambiguous    : {enrichment.get('nssdca_ambiguous', 0)}")
    print(f"  NSSDCA detail pages : {enrichment.get('nssdca_details_parsed', 0)}")
    print(f"  Wikipedia matched   : {enrichment.get('wikipedia_matched', 0)}")
    print(f"  Wikipedia unmatched : {enrichment.get('wikipedia_missing', 0)}")
    print(f"  Wikidata matched    : {enrichment.get('wikidata_matched', 0)}")
    print(f"  Fields filled       : {enrichment.get('fields_filled', 0)}")
    print("-" * 78)
    print("MISSION MAPPING METHODS")
    for method, count in report["mission_mapping"].items():
        print(f"  {method:<32} {count}")
    print("-" * 78)
    print("COMPONENT TYPES")
    for component_type, count in report["component_types"].items():
        print(f"  {component_type:<32} {count}")
    print("-" * 78)
    print("DESTINATIONS")
    for destination, count in report["destinations"].items():
        print(f"  {destination:<32} {count}")
    print("-" * 78)
    print("ZERO MISSING VALUES VALIDATION")
    gaps = report["unmapped_or_missing"]
    if gaps:
        print(f"FAIL - {len(gaps)} gap(s) found:")
        for gap in gaps:
            print(
                f"  - {gap.get('model_name', '<unknown>'):<32} "
                f"{gap.get('field', ''):<28} {gap.get('reason', '')}"
            )
    else:
        print(
            "PASS - every source model has a spacecraft, a mission, a mission "
            "bridge row, resolved GLB/glTF/BIN assets, file sizes and raw JSON."
        )
    print("-" * 78)
    print("OPTIONAL ENRICHMENT GAPS (not present in viewer/models.json)")
    optional = report["optional_enrichment_gaps"]
    print(f"  launch_date missing : {len(optional['launch_date_missing'])}")
    if optional["launch_date_missing"]:
        print(f"    {', '.join(optional['launch_date_missing'])}")
    print(f"  nssdca_id missing   : {len(optional['nssdca_id_missing'])}")
    if optional["nssdca_id_missing"]:
        print(f"    {', '.join(optional['nssdca_id_missing'])}")
    print(f"  wiki_title missing  : {len(optional['wiki_title_missing'])}")
    if optional["wiki_title_missing"]:
        print(f"    {', '.join(optional['wiki_title_missing'])}")
    print(f"  reference missing   : {len(optional.get('reference_missing') or [])}")
    if optional.get("reference_missing"):
        print(f"    {', '.join(optional['reference_missing'])}")
    for note in optional.get("gap_notes") or []:
        print(f"    note: {note}")
    mission_gaps = optional.get("mission_field_gaps") or []
    print(f"  mission field gaps  : {len(mission_gaps)}")
    if mission_gaps:
        print(
            "    "
            + ", ".join(
                f"{gap['mission']}:{gap['field']}" for gap in mission_gaps
            )
        )
    print(
        "  These fields are populated when present in the source description; "
        "source links for NSSDCA/Wikipedia/Wikidata/NASA Science are stored "
        "instead of inventing values."
    )
    print(line)


def ingest_models_json(input_path=None, skip_schema=False, enrich=True):
    """Fetch, parse and upsert every record in viewer/models.json."""
    from NovaBase.schema_tools import bootstrap_schema

    print("=" * 78)
    print("NovaBase - models.json hardware / 3D model ingestion")
    print("=" * 78)
    if skip_schema:
        print("[1/6] Skipping schema bootstrap (--skip-schema).")
        Base.metadata.create_all(bind=engine)
    else:
        print("[1/6] Applying schema (idempotent)...")
        schema_info = bootstrap_schema(engine)
        print(
            f"      Schema version {schema_info['schema_version']}, "
            f"{schema_info['statements_executed']} statements executed."
        )

    print("[2/6] Downloading / parsing models.json...")
    payload, raw_bytes, source = load_models_payload(input_path)
    models = payload.get("Models") or []
    print(f"      Loaded {len(models)} model records from {source}")

    source_issues = []
    for item in models:
        model_name = str(item.get("ModelName") or "").strip()
        for field in REQUIRED_SOURCE_FIELDS:
            if not str(item.get(field) or "").strip():
                source_issues.append(
                    {
                        "model_name": model_name or "<unknown>",
                        "field": field,
                        "reason": "missing from the source JSON",
                    }
                )

    db = SessionLocal()
    run = IngestionRun(
        provider="spacecraft-models/models.json",
        status="running",
    )
    db.add(run)
    db.flush()
    counters = Counter()

    try:
        print("[3/6] Seeding organizations and data-source registry...")
        orgs = {
            slug: ensure_organization(db, slug, name, org_type, country, url)
            for slug, name, org_type, country, url in ORG_DEFINITIONS
        }
        seed_data_sources(db)
        db.flush()

        resolver = MissionResolver(db)
        print("[4/6] Resolving spacecraft, missions and asset metadata...")
        for index, item in enumerate(models, 1):
            model_name = str(item.get("ModelName") or "").strip()
            if not model_name:
                continue
            assets = resolve_assets(item)
            meta = infer_metadata(item, assets)
            agency_org = orgs.get(agency_org_slug(meta["agency"]), orgs["nasa"])

            spacecraft, spacecraft_created = upsert_spacecraft(
                db, item, meta, assets, None, agency_org
            )
            mission, method, confidence, role = resolver.resolve(
                item, spacecraft, meta
            )
            db.flush()

            model3d, model_created = upsert_model3d(
                db, spacecraft, item, meta, assets
            )
            glb_created = upsert_spacecraft_model(
                db, spacecraft, meta, assets, "glb"
            )
            gltf_created = upsert_spacecraft_model(
                db, spacecraft, meta, assets, "gltf"
            )
            component, component_created = upsert_hardware_component(
                db,
                item,
                meta,
                assets,
                spacecraft,
                mission,
                method,
                confidence,
            )
            bridge_created = upsert_component_mission(
                db,
                component,
                mission,
                role,
                True,
                method,
                confidence,
            )

            for extra in EXTRA_MISSION_LINKS.get(slugify(model_name), []):
                extra_mission, _ = resolver.ensure_mission(
                    extra["slug"],
                    extra["name"],
                    destination=extra.get("destination", meta["destination"]),
                    mission_status=extra.get("mission_status", meta["operational_status"]),
                    agency=extra.get("agency", meta["agency"]),
                    mission_type=f"{extra.get('destination', meta['destination'])} mission",
                    description=extra.get("description") or meta["description"],
                    objectives=extra.get("objectives") or meta["scientific_purpose"],
                    launch_date=extra.get("launch_date"),
                    source_url=extra.get("source_url") or meta["official_url"],
                )
                upsert_component_mission(
                    db,
                    component,
                    extra_mission,
                    extra["role"],
                    False,
                    "multi_mission_family",
                    1.0,
                )
                # Keep the shared spacecraft discoverable from both missions.
                existing_link = (
                    db.query(SpacecraftMission)
                    .filter(
                        SpacecraftMission.spacecraft_id == spacecraft.id,
                        SpacecraftMission.mission_id == extra_mission.id,
                    )
                    .first()
                )
                if not existing_link:
                    db.add(
                        SpacecraftMission(
                            spacecraft_id=spacecraft.id,
                            mission_id=extra_mission.id,
                            mission_role=extra["role"][:100],
                            relationship_description=(
                                f"{meta['display_name']} is shared by the "
                                f"{extra['name']} mission family."
                            ),
                        )
                    )
                    counters["spacecraft_mission_links_inserted"] += 1

            # Primary spacecraft <-> mission bridge used by the existing API.
            primary_link = (
                db.query(SpacecraftMission)
                .filter(
                    SpacecraftMission.spacecraft_id == spacecraft.id,
                    SpacecraftMission.mission_id == mission.id,
                )
                .first()
            )
            if not primary_link:
                db.add(
                    SpacecraftMission(
                        spacecraft_id=spacecraft.id,
                        mission_id=mission.id,
                        mission_role="Primary Spacecraft",
                        relationship_description=(
                            f"{meta['display_name']} is the hardware represented by "
                            f"this 3D model."
                        ),
                    )
                )
                counters["spacecraft_mission_links_inserted"] += 1

            source_count = _component_sources(db, spacecraft, item, meta)
            counters["spacecraft_sources_inserted"] += source_count

            if spacecraft_created:
                counters["spacecraft_inserted"] += 1
            else:
                counters["spacecraft_updated"] += 1
            if model_created:
                counters["models_3d_inserted"] += 1
            else:
                counters["models_3d_updated"] += 1
            if glb_created:
                counters["spacecraft_models_inserted"] += 1
            if gltf_created:
                counters["spacecraft_models_inserted"] += 1
            if component_created:
                counters["components_inserted"] += 1
            else:
                counters["components_updated"] += 1
            if bridge_created:
                counters["component_mission_links_inserted"] += 1
            else:
                counters["component_mission_links_updated"] += 1

            if index % 20 == 0 or index == len(models):
                print(f"      [{index:03d}/{len(models):03d}] processed")

        if enrich:
            print("[4b/6] Enriching from NSSDCA + Wikimedia APIs...")
            enrich_database(db, models, counters)

        counters["missions_inserted"] = resolver.created_count
        counters["missions_updated"] = resolver.updated_count
        db.commit()
        print("[5/6] Commit complete. Running zero-missing-values validation...")

        report = build_ingestion_report(
            db, models, source, raw_bytes, counters, source_issues
        )
        run.status = "completed" if report["status"] == "pass" else "completed_with_gaps"
        run.finished_at = utcnow()
        run.rows_inserted = int(
            counters.get("components_inserted", 0)
            + counters.get("spacecraft_inserted", 0)
            + counters.get("missions_inserted", 0)
        )
        run.rows_updated = int(
            counters.get("components_updated", 0)
            + counters.get("spacecraft_updated", 0)
            + counters.get("missions_updated", 0)
        )
        run.details = json.dumps(report, ensure_ascii=False)
        run.errors = (
            "\n".join(
                f"{gap.get('model_name')}: {gap.get('field')} ({gap.get('reason')})"
                for gap in report["unmapped_or_missing"][:50]
            )
            or None
        )
        db.commit()
    except Exception as exc:
        db.rollback()
        try:
            with SessionLocal() as failure_db:
                failure_db.add(
                    IngestionRun(
                        provider="spacecraft-models/models.json",
                        status="failed",
                        finished_at=utcnow(),
                        errors=str(exc)[:4000],
                    )
                )
                failure_db.commit()
        except Exception:
            pass
        raise
    finally:
        db.close()

    print("[6/6] Reporting...")
    print_ingestion_report(report)
    return report


def build_parser():
    parser = argparse.ArgumentParser(
        description=(
            "Ingest the NASA Eyes / spacecraft-models catalogue into the "
            "Space Hardware SQLite database."
        )
    )
    parser.add_argument(
        "--models-json",
        action="store_true",
        help="Ingest viewer/models.json into hardware_components (default).",
    )
    parser.add_argument(
        "--catalogue",
        action="store_true",
        help="Run the legacy 250-mission placeholder catalogue builder.",
    )
    parser.add_argument(
        "--both",
        action="store_true",
        help="Run both the legacy catalogue builder and the models.json ingestion.",
    )
    parser.add_argument(
        "--input",
        metavar="PATH",
        help="Read a local models.json instead of downloading it.",
    )
    parser.add_argument(
        "--report-json",
        metavar="PATH",
        help="Write the full machine-readable ingestion report to this file.",
    )
    parser.add_argument(
        "--skip-schema",
        action="store_true",
        help="Do not run the idempotent schema bootstrap before ingesting.",
    )
    parser.add_argument(
        "--enrich",
        dest="enrich",
        action="store_true",
        default=True,
        help="Enrich spacecraft with NSSDCA and Wikimedia API metadata (default).",
    )
    parser.add_argument(
        "--no-enrich",
        dest="enrich",
        action="store_false",
        help="Skip the NSSDCA / Wikimedia enrichment pass.",
    )
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    run_models = args.models_json or args.both or not (args.catalogue and not args.both)
    exit_code = 0

    if args.catalogue or args.both:
        ingest()

    if run_models:
        report = ingest_models_json(
            input_path=args.input,
            skip_schema=args.skip_schema,
            enrich=args.enrich,
        )
        if args.report_json:
            with open(args.report_json, "w", encoding="utf-8") as handle:
                json.dump(report, handle, indent=2, ensure_ascii=False)
            print(f"Report written to {args.report_json}")
        if report["unmapped_or_missing"]:
            exit_code = 1

    return exit_code


def ingest():
    print("=" * 60)
    print("Novaquest - Full 250-Mission Catalogue Ingestion")
    print("=" * 60)
    from NovaBase.schema_tools import bootstrap_schema
    bootstrap_schema(engine)
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
            db.add(SpacecraftMission(
                spacecraft_id=hw.id,
                mission_id=mission.id,
                mission_role='Primary Spacecraft',
                relationship_description=f"{base_name} is the hardware for this mission.",
            ))
            seen_hw.add(hslug)
            db.add(HardwareSource(
                spacecraft_id=hw.id,
                source_name="NASA A-to-Z of NASA Missions / NSSDC",
                source_url="https://www.nasa.gov/a-to-z-of-nasa-missions/",
                source_type="Official Mission Website",
                evidence_notes="Catalogue inclusion from provided list; URL needs per-mission verification",
                last_checked_at=datetime.utcnow().strftime('%Y-%m-%d')
            ))
            added_hw += 1

        db.commit()
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
    sys.exit(main())
