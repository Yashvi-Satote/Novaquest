"""Mission destination and programme classifications for the Explorer hierarchy."""

from sqlalchemy import inspect
from sqlalchemy import Index
from NovaBase.models import Mission


DESTINATION_ORDER = [
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto and Kuiper Belt",
    "Asteroids",
    "Comets",
    "Deep Space and Interstellar",
    "Sun and Solar Observation",
    "Earth Orbit",
    "Other / Multiple Destinations",
]

STANDALONE = "Standalone Missions"

# Curated classifications for the missions already in the catalogue. These are
# data, not sidebar entries; the hierarchy itself is always built from records.
CURATED_CLASSIFICATIONS = {
    "viking-1": ("Mars", "Viking Programme", "Verified"),
    "mars-pathfinder": ("Mars", "Mars Rover Missions", "Verified"),
    "mars-exploration-rover": ("Mars", "Mars Exploration Rovers", "Verified"),
    "phoenix": ("Mars", "Mars Exploration Program — Landers", "Provisional"),
    "insight": ("Mars", "Mars Exploration Program — Landers", "Provisional"),
    "mars-2020": ("Mars", "Mars Rover Missions", "Verified"),
    "mars-exploration-rover-a": ("Mars", "Mars Exploration Rovers", "Verified"),
    "mars-science-laboratory": ("Mars", "Mars Rover Missions", "Verified"),
    "viking-2": ("Mars", "Viking Programme", "Verified"),
    "mars-reconnaissance-orbiter": ("Mars", "Mars Exploration Program — Orbiters", "Verified"),
    "mars-express": ("Mars", "International Mars Missions", "Verified"),
    "surveyor-1": ("Moon", "Surveyor Programme", "Verified"),
    "surveyor-3": ("Moon", "Surveyor Programme", "Verified"),
    "surveyor-5": ("Moon", "Surveyor Programme", "Verified"),
    "apollo-11": ("Moon", "Apollo Lunar Missions", "Verified"),
    "apollo-15": ("Moon", "Apollo Lunar Missions", "Verified"),
    "apollo-12": ("Moon", "Apollo Lunar Missions", "Verified"),
    "apollo-14": ("Moon", "Apollo Lunar Missions", "Verified"),
    "apollo-17": ("Moon", "Apollo Lunar Missions", "Verified"),
    "change-4": ("Moon", "Chang'e Programme", "Verified"),
    "chandrayaan-3": ("Moon", "Chandrayaan Programme", "Verified"),
    "luna-17-lunokhod-1": ("Moon", "Luna Programme", "Verified"),
    "ranger-7": ("Moon", "Ranger Programme", "Verified"),
    "lunar-reconnaissance-orbiter": ("Moon", "Lunar Precursor and Reconnaissance Missions", "Provisional"),
    "lcross": ("Moon", "Lunar Precursor and Reconnaissance Missions", "Provisional"),
    "messenger": ("Mercury", "MESSENGER", "Verified"),
    "new-horizons": ("Pluto and Kuiper Belt", "New Horizons Programme", "Verified"),
    "pioneer-10": ("Jupiter", "Pioneer Programme", "Verified"),
    "galileo-mission": ("Jupiter", "Jupiter Exploration Missions", "Verified"),
    "juno-mission": ("Jupiter", "Jupiter Exploration Missions", "Verified"),
    "cassini-huygens": ("Saturn", "Saturn and Titan Exploration Missions", "Verified"),
    "cassini-orbiter": ("Saturn", "Saturn and Titan Exploration Missions", "Verified"),
    "dawn-mission": ("Asteroids", "Asteroid Exploration Missions", "Verified"),
    "hayabusa2": ("Asteroids", "Asteroid Sample Return Missions", "Verified"),
    "osiris-rex": ("Asteroids", "Asteroid Sample Return Missions", "Verified"),
    "rosetta": ("Comets", "Comet Exploration Missions", "Verified"),
    "voyager": ("Deep Space and Interstellar", "Voyager Programme", "Verified"),
    "voyager-1-mission": ("Deep Space and Interstellar", "Voyager Programme", "Verified"),
    "voyager-2-mission": ("Deep Space and Interstellar", "Voyager Programme", "Verified"),
    "parker-solar-probe": ("Sun and Solar Observation", "Solar and Heliospheric Observatories", "Verified"),
    "hubble-space-telescope": ("Earth Orbit", "Space Telescopes and Observatories", "Verified"),
    "chandra-x-ray": ("Earth Orbit", "Space Telescopes and Observatories", "Verified"),
    "fermi-gamma-ray": ("Earth Orbit", "Space Telescopes and Observatories", "Verified"),
    "tess": ("Earth Orbit", "Space Telescopes and Observatories", "Verified"),
    "terra-eos": ("Earth Orbit", "Earth Observation Missions", "Verified"),
    "international-space-station": ("Earth Orbit", "Earth Orbit Stations and Platforms", "Verified"),
    "sputnik-1-mission": ("Earth Orbit", "Early Earth Satellites", "Verified"),
    "vanguard-1": ("Earth Orbit", "Early Earth Satellites", "Verified"),
    "sl-16-debris": ("Earth Orbit", "Orbital Debris", "Verified"),
    "james-webb-space-telescope": ("Other / Multiple Destinations", "Space Telescopes and Observatories", "Verified"),
    "kepler-space-telescope": ("Other / Multiple Destinations", "Space Telescopes and Observatories", "Verified"),
    "spitzer-space-telescope": ("Other / Multiple Destinations", "Space Telescopes and Observatories", "Verified"),
}


def ensure_mission_hierarchy_schema(engine):
    """Add hierarchy columns to databases created before mission classification."""
    if not inspect(engine).has_table("missions"):
        return

    existing_columns = {
        column["name"] for column in inspect(engine).get_columns("missions")
    }
    new_columns = {
        "destination": "VARCHAR(100)",
        "programme": "VARCHAR(255)",
        "classification_status": "VARCHAR(50)",
    }
    with engine.begin() as connection:
        for column_name, column_type in new_columns.items():
            if column_name not in existing_columns:
                connection.exec_driver_sql(
                    f"ALTER TABLE missions ADD COLUMN {column_name} {column_type}"
                )
        Index("ix_missions_destination", Mission.destination).create(
            bind=connection, checkfirst=True
        )
        Index("ix_missions_programme", Mission.programme).create(
            bind=connection, checkfirst=True
        )


def infer_destination(mission):
    """Keep ambiguous legacy deep-space records out of planetary destination groups."""
    legacy_destination = (mission.destination_category or "").strip()
    if legacy_destination in {"Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
                              "Uranus", "Neptune", "Earth Orbit"}:
        return legacy_destination

    text = f"{mission.name} {mission.description or ''}".casefold()
    if "interstellar" in text or "heliopause" in text:
        return "Deep Space and Interstellar"
    if "solar observation" in text or "solar observatory" in text:
        return "Sun and Solar Observation"
    return "Other / Multiple Destinations"


def apply_mission_classifications(db):
    """Persist curated metadata and conservative fallbacks for every mission."""
    changed = False
    missions = db.query(Mission).all()
    for mission in missions:
        curated = CURATED_CLASSIFICATIONS.get(mission.slug)
        if mission.destination and mission.programme and mission.classification_status:
            continue

        destination, programme, status = curated or (
            infer_destination(mission),
            STANDALONE,
            "Provisional",
        )
        mission.destination = mission.destination or destination
        mission.programme = mission.programme or programme
        if curated and mission.classification_status == "Provisional":
            mission.classification_status = status
        else:
            mission.classification_status = mission.classification_status or status
        changed = True

    if changed:
        db.commit()
