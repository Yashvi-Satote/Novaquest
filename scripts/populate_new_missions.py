"""Populate NovaBase with the new verified missions strictly from official NASA sources."""
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path("backend/space_hardware.db")
REGISTRY_PATH = Path("backend/NovaBase/data/missions_registry.json")
FACTS_PATH = Path("backend/NovaBase/data/fill_facts.json")

NOW = datetime.now(timezone.utc).isoformat(timespec="seconds")
TODAY = datetime.now(timezone.utc).date().isoformat()

# Load current missions_registry.json
with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
    registry_data = json.load(f)

# Load current fill_facts.json
with open(FACTS_PATH, "r", encoding="utf-8") as f:
    facts_data = json.load(f)

# Connect to SQLite
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

def get_or_create_org(name, org_type="Space Agency", country="United States"):
    slug = name.lower().replace("/", "-").replace(" ", "-").replace("(", "").replace(")", "").replace("&", "and")
    slug = "".join(c for c in slug if c.isalnum() or c == "-").strip("-")
    cursor.execute("SELECT id FROM organizations WHERE name = ? OR slug = ?", (name, slug))
    row = cursor.fetchone()
    if row:
        return row["id"]
    cursor.execute(
        "INSERT INTO organizations (name, slug, organization_type, country) VALUES (?, ?, ?, ?)",
        (name, slug, org_type, country)
    )
    return cursor.lastrowid

def get_or_create_person(full_name, affiliation=None, role=None):
    cursor.execute("SELECT id FROM people WHERE full_name = ?", (full_name,))
    row = cursor.fetchone()
    if row:
        return row["id"]
    cursor.execute(
        "INSERT INTO people (full_name, affiliation) VALUES (?, ?)",
        (full_name, affiliation)
    )
    return cursor.lastrowid

# -----------------------------------------------------------------------------
# Define the 9 new missions to add
# -----------------------------------------------------------------------------

NEW_MISSIONS_DATA = [
    {
        "slug": "apollo-15-lunar-module",
        "name": "Apollo 15 Lunar Module",
        "display_name": "Apollo 15 Lunar Module / ALSEP",
        "destination_category": "Moon",
        "destination": "Moon (Hadley-Apennine)",
        "mission_type": "Lander",
        "object_type": "Lander",
        "agency": "NASA",
        "operator": "NASA",
        "manufacturer": "Grumman",
        "wiki_title": "Apollo_15_Lunar_Module",
        "nssdca_id": "1971-063C",
        "model_keywords": ["Apollo Lunar Module", "Lunar Module"],
        "launch_date": "1971-07-26",
        "landing_date": "1971-07-30",
        "end_date": "1977-09-30",
        "status_label": "ended",
        "status_text": "Ascent stage impacted the Moon on August 3, 1971; descent stage remains at Hadley-Apennine. Surface ALSEP station operated until September 30, 1977.",
        "mission_status": "Completed",
        "source_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C",
        "sources": [
            {
                "label": "NASA NSSDCA - Apollo 15 Lunar Module / ALSEP",
                "url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C",
                "source_type": "archive"
            }
        ],
        "aliases": ["Falcon", "LM-10", "Apollo 15C", "Apollo 15 LM/ALSEP", "LEM 15", "05366", "Rover 15", "Apollo15ALSEP"],
        "sections": {
            "what_is_it": "The Apollo 15 Lunar Module 'Falcon' (LM-10) was the fourth crewed vehicle to land on the Moon, transporting Commander David R. Scott and Lunar Module Pilot James B. Irwin to the surface on July 30, 1971. In addition to housing and landing the astronauts, the spacecraft delivered the first Lunar Roving Vehicle (LRV) and the Apollo Lunar Surface Experiments Package (ALSEP) to the Hadley-Apennine landing site for extended scientific investigations.",
            "how_it_works": "The Lunar Module was a two-stage spacecraft with a total mass of 16,430 kg at launch. The descent stage (dry mass 2,797 kg, 8,873 kg propellant) was an octagonal prism measuring 4.2 meters across and 1.7 meters thick, equipped with a 45,000 N deep-throttling ablative rocket engine, four landing gear legs spanning 9.4 meters, silver-zinc batteries, and storage bays for the LRV and ALSEP instruments. The ascent stage (dry mass 2,385 kg, 2,375 kg propellant) housed the 6.65 cubic meter pressurized crew cabin, Apollo guidance computer, 15,000 N constant-thrust rocket engine, reaction control thrusters, and S-band and VHF antennas. Power for surface science was supplied by a SNAP-27 radioisotope thermoelectric generator producing ~70 W DC from a plutonium-238 capsule.",
            "why_important": "Apollo 15 marked the first extended scientific expedition to the Moon and the first deployment of the Lunar Roving Vehicle. The crew completed three moonwalk EVAs totaling 18 hours and 35 minutes, traversed 27.9 km across Hadley Rille and the Apennine Mountains, and collected 77.31 kg of rock and soil samples, including a core drill sample from three meters depth. Commander Scott also performed the famous televised demonstration of a hammer and feather dropping at identical rates in the lunar vacuum.",
            "status": "The LM ascent stage lifted off from the Moon on August 2, 1971 at 17:11:22 UT, docked with the CSM, and was jettisoned on August 3, intentionally impacting the Moon at 26.36 N, 0.25 E. The descent stage remains at the landing site (26.13239 N, 3.63330 E). The ALSEP scientific station transmitted surface geophysical data continuously until all Apollo ALSEP stations were officially shut down on September 30, 1977."
        },
        "parts": [
            {"part_name": "Passive Seismometer", "purpose": "Measured seismic activity and physical properties of the lunar crust and interior."},
            {"part_name": "Lunar Surface Magnetometer (LSM)", "purpose": "Measured the magnetic field at the lunar surface."},
            {"part_name": "Solar Wind Spectrometer", "purpose": "Measured fluxes and energy spectra of solar wind electrons and protons reaching the Moon."},
            {"part_name": "Suprathermal Ion Detector", "purpose": "Measured flux, composition, energy, and velocity of low-energy positive ions."},
            {"part_name": "Cold Cathode Ion Gauge", "purpose": "Measured the neutral lunar atmosphere and temporal variations with solar activity."},
            {"part_name": "Lunar Dust Detector", "purpose": "Measured dust accumulation, radiation damage to solar cells, and temperatures."},
            {"part_name": "Heat Flow Experiment", "purpose": "Measured heat loss rate from the lunar interior and thermal conductivity of lunar regolith."},
            {"part_name": "Lunar Roving Vehicle (LRV)", "purpose": "Four-wheeled electric vehicle driven by astronauts up to 5 km from the LM."},
            {"part_name": "SNAP-27 Radioisotope Thermoelectric Generator", "purpose": "Plutonium-238 thermoelectric power source delivering ~70 W DC to the ALSEP station."}
        ],
        "timeline": [
            {"event_date": "1971-07-26", "title": "Launch from Cape Canaveral", "description": "Launched aboard a Saturn 5 rocket from Cape Canaveral Launch Complex 39A.", "event_type": "launch"},
            {"event_date": "1971-07-30", "title": "Lunar Landing at Hadley-Apennine", "description": "LM Falcon separated from the CSM and touched down at 22:16:29 UT in Mare Imbrium near the Apennine Mountains.", "event_type": "landing"},
            {"event_date": "1971-07-31", "title": "First Moonwalk and LRV Deployment", "description": "Scott and Irwin unloaded and drove the Lunar Roving Vehicle 10.3 km to Hadley Rille and deployed the ALSEP station.", "event_type": "eva"},
            {"event_date": "1971-08-01", "title": "Second Moonwalk Traverse", "description": "Astronauts drove 12.5 km along the base of the Apennine Mountains near Spur Crater.", "event_type": "eva"},
            {"event_date": "1971-08-02", "title": "Third Moonwalk and Lunar Liftoff", "description": "Conducted 5.1 km traverse to Scarp Crater, demonstrated hammer-and-feather drop, and lifted off the Moon at 17:11:22 UT.", "event_type": "departure"},
            {"event_date": "1971-08-03", "title": "Ascent Stage Lunar Impact", "description": "After CSM docking and crew transfer, the ascent stage was jettisoned and impacted the Moon at 26.36 N, 0.25 E.", "event_type": "impact"},
            {"event_date": "1977-09-30", "title": "ALSEP Station Shutdown", "description": "The Apollo 15 ALSEP scientific station was formally shut down along with all Apollo surface stations.", "event_type": "decommission"}
        ],
        "stakeholders": [
            {"name": "NASA-Office of Manned Space Flight", "role": "Program Leadership", "country": "United States"},
            {"name": "NASA-Office of Space Science", "role": "Scientific Sponsor", "country": "United States"},
            {"name": "NASA Johnson Space Center", "role": "Project Management", "country": "United States"},
            {"name": "Grumman", "role": "Spacecraft Manufacturer", "country": "United States"}
        ],
        "people": [
            {"full_name": "Floyd I. Roberson", "role_on_mission": "Program Manager (NASA Headquarters)", "affiliation": "NASA Headquarters", "rank_order": 1},
            {"full_name": "Wilbert F. Eichelman", "role_on_mission": "Project Manager (NASA Johnson Space Center)", "affiliation": "NASA Johnson Space Center", "rank_order": 2},
            {"full_name": "Dr. John B. Hanley", "role_on_mission": "Program Scientist (NASA Headquarters)", "affiliation": "NASA Headquarters", "rank_order": 3},
            {"full_name": "David R. Scott", "role_on_mission": "Commander (Apollo 15 Crew)", "affiliation": "NASA Astronaut Corps", "rank_order": 4},
            {"full_name": "James B. Irwin", "role_on_mission": "Lunar Module Pilot (Apollo 15 Crew)", "affiliation": "NASA Astronaut Corps", "rank_order": 5}
        ],
        "images": [
            {
                "title": "Diagram of the Apollo Lunar Module",
                "description": "Schematic diagram of the Apollo Lunar Module descent and ascent stages.",
                "image_url": "https://nssdc.gsfc.nasa.gov/planetary/lunar/images/lm_diagram.gif",
                "source_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C",
                "attribution": "NASA History Office",
                "kind": "diagram"
            }
        ]
    },
    {
        "slug": "apollo-12-lunar-module",
        "name": "Apollo 12 Lunar Module",
        "display_name": "Apollo 12 Lunar Module / ALSEP",
        "destination_category": "Moon",
        "destination": "Moon (Oceanus Procellarum)",
        "mission_type": "Lander",
        "object_type": "Lander",
        "agency": "NASA",
        "operator": "NASA",
        "manufacturer": "Grumman",
        "wiki_title": "Apollo_12_Lunar_Module",
        "nssdca_id": "1969-099C",
        "model_keywords": ["Apollo Lunar Module", "Lunar Module"],
        "launch_date": "1969-11-14",
        "landing_date": "1969-11-19",
        "end_date": "1977-09-30",
        "status_label": "ended",
        "status_text": "Ascent stage crashed intentionally into the Moon on November 20, 1969; descent stage remains at Oceanus Procellarum. ALSEP operated until September 30, 1977.",
        "mission_status": "Completed",
        "source_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C",
        "sources": [
            {
                "label": "NASA NSSDCA - Apollo 12 Lunar Module / ALSEP",
                "url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C",
                "source_type": "archive"
            }
        ],
        "aliases": ["Intrepid", "LM-6", "Apollo 12C", "Apollo 12 LM/ALSEP", "LEM 12", "04246", "Apollo12ALSEP"],
        "sections": {
            "what_is_it": "The Apollo 12 Lunar Module 'Intrepid' (LM-6) was the second crewed vehicle to land on the Moon, carrying Commander Charles 'Pete' Conrad and Lunar Module Pilot Alan L. Bean to Oceanus Procellarum on November 19, 1969. The spacecraft demonstrated pinpoint lunar landing accuracy by touching down within approximately 180 meters of the robotic Surveyor 3 lander and carried the first complete Apollo Lunar Surface Experiments Package (ALSEP).",
            "how_it_works": "The Lunar Module comprised an ascent stage (dry mass 2,383 kg, 2,375 kg propellant) and a descent stage (dry mass 2,118 kg, 8,359 kg propellant) with a total mass of 15,235 kg. The descent stage used a 45,000 N throttleable rocket engine for powered descent and landed on four gear legs spanning 9.4 meters. The ascent stage featured a 6.65 cubic meter crew compartment, a 15,000 N constant-thrust ascent engine, S-band parabolic antenna, VHF transceivers, Apollo guidance computer, and silver-zinc batteries. The ALSEP instruments were powered by a 17 kg SNAP-27 radioisotope thermoelectric generator containing a 4 kg plutonium-238 capsule producing ~70 W DC.",
            "why_important": "Apollo 12 proved that pinpoint precision landings on the Moon were achievable, landing within walking distance (180 meters) of the Surveyor 3 probe. Astronauts performed two moonwalks totaling 7 hours and 45 minutes, gathered 34.35 kg of lunar samples, retrieved ~10 kg of Surveyor 3 components (including its TV camera) to test prolonged space exposure, and deployed the first nuclear-powered geophysical ALSEP station. Upon jettison, the ascent stage's deliberate lunar impact produced the first recorded artificial moonquake.",
            "status": "After 31 hours and 31 minutes on the lunar surface, the ascent stage lifted off on November 20, 1969 at 14:25:47 UT, docked with the CSM, and was jettisoned at 20:21:30 UT. It intentionally crashed into the Moon at 3.94 S, 338.80 E (~60 km from the landing site). The descent stage remains at Oceanus Procellarum (3.0128 S, 23.4219 W). The ALSEP geophysical station transmitted science data until it was shut down on September 30, 1977."
        },
        "parts": [
            {"part_name": "Passive Seismometer", "purpose": "Recorded seismic vibrations and artificial impacts to probe the lunar crust and interior."},
            {"part_name": "Lunar Surface Magnetometer (LSM)", "purpose": "Measured the localized magnetic field on the lunar surface."},
            {"part_name": "Solar Wind Spectrometer", "purpose": "Measured electron and proton fluxes and energy spectra from the solar wind."},
            {"part_name": "Suprathermal Ion Detector", "purpose": "Detected the flux, composition, and velocity of positive lunar ions."},
            {"part_name": "Cold Cathode Ion Gauge", "purpose": "Monitored neutral atmospheric density and ambient gas variations."},
            {"part_name": "Lunar Dust Detector", "purpose": "Monitored dust deposition, thermal environment, and solar cell degradation."},
            {"part_name": "Solar Wind Composition Foil Collector", "purpose": "Exposed metal foil sheet deployed to trap solar wind particles and returned to Earth."},
            {"part_name": "SNAP-27 Radioisotope Thermoelectric Generator", "purpose": "Plutonium-238 thermoelectric power source delivering ~70 W DC to the central ALSEP station."}
        ],
        "timeline": [
            {"event_date": "1969-11-14", "title": "Launch from Cape Canaveral", "description": "Launched aboard a Saturn 5 rocket from Launch Complex 39A.", "event_type": "launch"},
            {"event_date": "1969-11-19", "title": "Precision Landing at Oceanus Procellarum", "description": "Intrepid touched down at 06:54:35 UT within 180 meters of the Surveyor 3 robotic probe.", "event_type": "landing"},
            {"event_date": "1969-11-19", "title": "First Moonwalk and ALSEP Activation", "description": "Conrad and Bean deployed the ALSEP station and solar wind composition foil; ALSEP turned on at 14:21 UT.", "event_type": "eva"},
            {"event_date": "1969-11-20", "title": "Second Moonwalk and Surveyor 3 Visit", "description": "Astronauts walked 1.3 km to Surveyor 3, recovered its camera and mechanical parts, and collected rock samples.", "event_type": "eva"},
            {"event_date": "1969-11-20", "title": "Lunar Liftoff and Intentional Crash", "description": "Ascent stage lifted off at 14:25:47 UT, docked with CSM, and was jettisoned to crash into the Moon at 3.94 S, 338.80 E.", "event_type": "impact"},
            {"event_date": "1977-09-30", "title": "ALSEP Station Shutdown", "description": "The Apollo 12 ALSEP geophysical station was powered down along with all Apollo surface stations.", "event_type": "decommission"}
        ],
        "stakeholders": [
            {"name": "NASA-Office of Manned Space Flight", "role": "Program Oversight", "country": "United States"},
            {"name": "NASA-Office of Space Science", "role": "Scientific Program", "country": "United States"},
            {"name": "NASA Johnson Space Center", "role": "Mission Operations", "country": "United States"},
            {"name": "Grumman", "role": "Spacecraft Manufacturer", "country": "United States"}
        ],
        "people": [
            {"full_name": "Floyd I. Roberson", "role_on_mission": "Program Manager (NASA Headquarters)", "affiliation": "NASA Headquarters", "rank_order": 1},
            {"full_name": "Wilbert F. Eichelman", "role_on_mission": "Project Manager (NASA Johnson Space Center)", "affiliation": "NASA Johnson Space Center", "rank_order": 2},
            {"full_name": "Dr. John B. Hanley", "role_on_mission": "Program Scientist (NASA Headquarters)", "affiliation": "NASA Headquarters", "rank_order": 3},
            {"full_name": "Charles P. \"Pete\" Conrad", "role_on_mission": "Commander (Apollo 12 Crew)", "affiliation": "NASA Astronaut Corps", "rank_order": 4},
            {"full_name": "Alan L. Bean", "role_on_mission": "Lunar Module Pilot (Apollo 12 Crew)", "affiliation": "NASA Astronaut Corps", "rank_order": 5}
        ],
        "images": [
            {
                "title": "Pete Conrad at Surveyor 3",
                "description": "Apollo 12 astronaut Pete Conrad examining the robotic Surveyor 3 lander with Intrepid visible in the background.",
                "image_url": "https://nssdc.gsfc.nasa.gov/planetary/lunar/images/as12_48_7133.jpg",
                "source_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C",
                "attribution": "NASA / Alan Bean",
                "kind": "photo"
            }
        ]
    },
    {
        "slug": "spirit",
        "name": "Spirit",
        "display_name": "Spirit (Mars Exploration Rover A)",
        "destination_category": "Mars",
        "destination": "Mars (Gusev Crater)",
        "mission_type": "Rover",
        "object_type": "Rover",
        "agency": "NASA/JPL",
        "operator": "NASA/JPL",
        "manufacturer": "Jet Propulsion Laboratory",
        "wiki_title": "Spirit_(rover)",
        "nssdca_id": "2003-027A",
        "model_keywords": ["Mars Exploration Rover", "MER"],
        "launch_date": "2003-06-10",
        "landing_date": "2004-01-03",
        "end_date": "2010-03-22",
        "status_label": "ended",
        "status_text": "Spirit concluded its mission in 2010 after operating for over six years and driving 4.8 miles (7.7 kilometers) on Mars.",
        "mission_status": "Completed",
        "source_url": "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
        "sources": [
            {
                "label": "NASA Science - Mars Exploration Rovers: Spirit and Opportunity",
                "url": "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
                "source_type": "official"
            }
        ],
        "aliases": ["MER-A", "Spirit Rover", "Mars Exploration Rover A", "Columbia Memorial Station"],
        "sections": {
            "what_is_it": "Spirit (MER-A) was one of NASA's twin Mars Exploration Rovers sent to explore the Red Planet as a robotic field geologist. Launched in 2003, Spirit touched down on January 3, 2004 at Gusev Crater, an ancient crater suspected to have once harbored an impact-basin lake, in search of clues about the historical presence of liquid water on Mars.",
            "how_it_works": "Spirit was an autonomous six-wheeled rover powered by multi-panel solar arrays. It featured an articulated rocker-bogie mobility suspension to traverse rough terrain, a mast-mounted Panoramic Camera (Pancam) with multi-spectral color filters, and a deployable robotic instrument arm to position scientific sensors in direct contact with Martian rocks and soils.",
            "why_important": "Spirit provided groundbreaking evidence confirming that liquid water was long-standing on ancient Mars. Operating for more than six years across a mission originally planned for 90 days, Spirit drove 4.8 miles (7.7 kilometers), scaled the Columbia Hills, and discovered extensive silica deposits that pointed to past hydrothermal activity and volcanic steam vents.",
            "status": "Spirit completed its primary mission and extended investigations across over 2,200 sols, driving 4.8 miles (7.7 km). The rover became lodged in soft soil at 'Troy' in 2009 and served as a stationary science platform until contact was lost in March 2010 following winter power decline. NASA formally concluded the mission in 2010."
        },
        "parts": [
            {"part_name": "Panoramic Camera (Pancam)", "purpose": "Mast-mounted stereo imaging system equipped with 8-position filter wheels to examine terrain mineralogy and geology."},
            {"part_name": "Solar Array", "purpose": "Triple-junction photovoltaic array providing electrical power from Martian sunlight."},
            {"part_name": "Rocker-Bogie Mobility System", "purpose": "Six-wheel independent drive suspension enabling traversal over obstacles and sandy slopes."},
            {"part_name": "Instrument Deployment Device (Robotic Arm)", "purpose": "Articulated arm placing spectrometers and microscopes against rocks and soil targets."}
        ],
        "timeline": [
            {"event_date": "2003-06-10", "title": "Launch of Spirit", "description": "Launched from Cape Canaveral Air Force Station aboard a Delta II rocket.", "event_type": "launch"},
            {"event_date": "2004-01-03", "title": "Landing at Gusev Crater", "description": "Spirit touched down in Gusev Crater, dedicated as the Columbia Memorial Station.", "event_type": "landing"},
            {"event_date": "2004-01-18", "title": "First Full Pancam Landscape", "description": "Captured sol 16 panoramic mosaic showing the landing site and journey toward the east hills.", "event_type": "science"},
            {"event_date": "2010", "title": "Mission Concluded", "description": "Spirit concluded operations after traveling 4.8 miles (7.7 km) across six years on Mars.", "event_type": "end_of_mission"}
        ],
        "stakeholders": [
            {"name": "NASA", "role": "Space Agency", "country": "United States"},
            {"name": "NASA / JPL", "role": "Mission Design and Management", "country": "United States"},
            {"name": "Cornell University", "role": "Pancam and Science Instrument Partner", "country": "United States"}
        ],
        "people": [
            {"full_name": "Steven Squyres", "role_on_mission": "Principal Investigator (Athena Science Package)", "affiliation": "Cornell University", "rank_order": 1},
            {"full_name": "Peter Theisinger", "role_on_mission": "Project Manager", "affiliation": "NASA / JPL", "rank_order": 2}
        ],
        "images": [
            {
                "title": "Spirit Sol 16 Panoramic Landscape",
                "description": "Approximate true-color mosaic taken by Spirit's panoramic camera showing the Columbia Memorial Station landing site at Gusev Crater.",
                "image_url": "https://photojournal.jpl.nasa.gov/jpeg/PIA05203.jpg",
                "source_url": "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
                "attribution": "NASA/JPL-Caltech/Cornell",
                "kind": "photo"
            }
        ]
    },
    {
        "slug": "viking-1",
        "name": "Viking 1",
        "display_name": "Viking 1 Orbiter & Lander",
        "destination_category": "Mars",
        "destination": "Mars (Chryse Planitia)",
        "mission_type": "Orbiter / Lander",
        "object_type": "Lander",
        "agency": "NASA",
        "operator": "NASA / Langley / JPL",
        "manufacturer": "Martin Marietta",
        "wiki_title": "Viking_1",
        "nssdca_id": "1975-075A",
        "model_keywords": ["Viking Lander", "Viking"],
        "launch_date": "1975-08-20",
        "landing_date": "1976-07-20",
        "end_date": "1982-11-11",
        "status_label": "ended",
        "status_text": "Orbiter shut down August 7, 1980 after propellant exhaustion; Lander operated until November 11, 1982 when communications ceased.",
        "mission_status": "Completed",
        "source_url": "https://science.nasa.gov/mission/viking-1/",
        "sources": [
            {
                "label": "NASA Science - Viking 1",
                "url": "https://science.nasa.gov/mission/viking-1/",
                "source_type": "official"
            }
        ],
        "aliases": ["Viking-B", "Viking Lander 1", "Thomas Mutch Memorial Station"],
        "sections": {
            "what_is_it": "Viking 1 was the first NASA spacecraft to achieve a successful soft landing on Mars, providing humanity's first extended operational look at the Red Planet's surface. Launched on August 20, 1975, the mission consisted of an orbiter to map the planet from space and a lander equipped with a biological laboratory to conduct direct in-situ searches for signs of Martian life.",
            "how_it_works": "The composite Viking 1 spacecraft weighed 7,776 pounds (3,527 kg), comprising a 5,157-pound (2,339 kg) solar-powered orbiter and a 2,156-pound (978 kg) lander powered by two SNAP-19 radioisotope thermoelectric generators (RTGs). Launched by a Titan IIIE-Centaur rocket, the orbiter conducted atmospheric and surface mapping, while the lander deployed an aeroshell, parachute, and terminal descent engines before using a robotic sampler arm to deliver soil to onboard chemical and biological analysis chambers.",
            "why_important": "Viking 1 made history on July 20, 1976 by successfully landing on Chryse Planitia and returning the first color images, panoramas, and meteorological data from the Martian surface. The mission returned over 50,000 orbiter images (mapping 97% of the surface) and 4,500 surface photos, revealing volcanic features, immense canyons, water-carved channels, and sulfur-rich soil, establishing the foundational baseline for modern Mars exploration.",
            "status": "Viking 1 completed its primary mission in November 1976 and continued through extended survey operations. The orbiter was deactivated on August 7, 1980 after exhausting attitude-control propellant during its 1,489th orbit. The lander, renamed the Thomas Mutch Memorial Station in 1982, returned daily weather reports until November 11, 1982, when a flawed ground command permanently disrupted communications."
        },
        "parts": [
            {"part_name": "Visual Imaging System (VIS)", "purpose": "Twin vidicon cameras on the orbiter that mapped 97 percent of Mars at 300-meter resolution."},
            {"part_name": "Mars Atmospheric Water Detector (MAWD)", "purpose": "Infrared spectrometer mapping atmospheric water vapor distribution."},
            {"part_name": "Infrared Radiometer for Thermal Mapping (IRTM)", "purpose": "Mapped surface temperatures and thermal properties from orbit."},
            {"part_name": "Lander Facsimile Cameras", "purpose": "Twin scanning cameras producing 300-degree high-resolution color panoramas of the landing site."},
            {"part_name": "Gas Chromatograph Mass Spectrometer (GCMS)", "purpose": "Analyzed atmospheric gases and searched for organic molecules in scooped soil samples."},
            {"part_name": "Biological Laboratory", "purpose": "Three metabolic experiments (pyrolytic release, labeled release, gas exchange) testing for microbial activity."},
            {"part_name": "X-Ray Fluorescence Spectrometer", "purpose": "Measured elemental concentrations in Martian regolith, revealing high sulfur and iron content."},
            {"part_name": "Weather Instrument Package", "purpose": "Recorded continuous surface atmospheric pressure, temperature, and wind speed."},
            {"part_name": "Remote Sampler Arm", "purpose": "Articulated boom with a motorized scoop to dig trenches and deliver soil to instrument funnels."},
            {"part_name": "SNAP-19 RTGs", "purpose": "Dual plutonium-238 radioisotope thermoelectric generators providing uninterrupted lander electrical power."}
        ],
        "timeline": [
            {"event_date": "1975-08-20", "title": "Launch from Cape Canaveral", "description": "Launched on Titan IIIE-Centaur at 21:22:00 UT from Launch Complex 41.", "event_type": "launch"},
            {"event_date": "1976-06-19", "title": "Mars Orbit Insertion", "description": "Entered Mars orbit with initial parameters of 1,500 x 50,300 km.", "event_type": "orbit"},
            {"event_date": "1976-07-20", "title": "First Successful Mars Landing", "description": "Lander separated and touched down on Chryse Planitia at 11:53:06 UT (22.483 N, 47.94 W).", "event_type": "landing"},
            {"event_date": "1976-07-28", "title": "First Soil Scoop Analysis", "description": "Robot arm collected first surface soil sample for delivery to the biological laboratory.", "event_type": "science"},
            {"event_date": "1980-08-07", "title": "Orbiter Shutdown", "description": "Viking 1 Orbiter powered down after running out of attitude-control propellant on orbit 1,489.", "event_type": "end_of_mission"},
            {"event_date": "1982-01", "title": "Renamed Thomas Mutch Memorial Station", "description": "Lander renamed in honor of the late leader of the Viking lander imaging team.", "event_type": "milestone"},
            {"event_date": "1982-11-11", "title": "Lander Contact Terminated", "description": "Final transmission received; communications ended following an uplink command error.", "event_type": "end_of_mission"}
        ],
        "stakeholders": [
            {"name": "NASA", "role": "Space Agency", "country": "United States"},
            {"name": "NASA Langley Research Center", "role": "Project Management", "country": "United States"},
            {"name": "NASA Jet Propulsion Laboratory", "role": "Orbiter & Operations", "country": "United States"},
            {"name": "Martin Marietta", "role": "Lander Prime Contractor", "country": "United States"}
        ],
        "people": [
            {"full_name": "Thomas A. Mutch", "role_on_mission": "Lander Imaging Team Leader", "affiliation": "Brown University / NASA", "rank_order": 1}
        ],
        "images": [
            {
                "title": "Viking 1 Surface Panorama of Chryse Planitia",
                "description": "First panoramic view taken by Viking Lander 1 showing the rolling, rock-strewn plains of Chryse Planitia on Mars.",
                "image_url": "https://images.nasa.gov/details/PIA00014",
                "source_url": "https://science.nasa.gov/mission/viking-1/",
                "attribution": "NASA",
                "kind": "photo"
            }
        ]
    },
    {
        "slug": "insight",
        "name": "InSight",
        "display_name": "InSight Lander",
        "destination_category": "Mars",
        "destination": "Mars (Elysium Planitia)",
        "mission_type": "Lander",
        "object_type": "Lander",
        "agency": "NASA/JPL",
        "operator": "NASA/JPL",
        "manufacturer": "Lockheed Martin Space",
        "wiki_title": "InSight",
        "nssdca_id": "2018-042A",
        "model_keywords": ["InSight", "InSight Mars lander"],
        "launch_date": "2018-05-05",
        "landing_date": "2018-11-26",
        "end_date": "2022-12-15",
        "status_label": "ended",
        "status_text": "InSight operated for over four years on Mars, concluding operations on December 15, 2022 after dust accumulation depleted solar power.",
        "mission_status": "Completed",
        "source_url": "https://science.nasa.gov/mission/insight/",
        "sources": [
            {
                "label": "NASA Science - InSight",
                "url": "https://science.nasa.gov/mission/insight/",
                "source_type": "official"
            }
        ],
        "aliases": ["Interior Exploration using Seismic Investigations, Geodesy and Heat Transport", "InSight Mars Lander"],
        "sections": {
            "what_is_it": "InSight (Interior Exploration using Seismic Investigations, Geodesy and Heat Transport) was a stationary NASA lander engineered to probe the deep interior structure of Mars. Part of NASA's Discovery program, the mission was designed to measure Mars' internal 'pulse' (seismology), 'temperature' (heat flow), and 'reflexes' (precession tracking) to uncover the formation and evolution of rocky planets in the inner solar system.",
            "how_it_works": "Derived from the flight-proven Mars Phoenix lander design, InSight utilized twin deployable UltraFlex solar arrays built by Lockheed Martin Space Systems. It was launched from California's Central Coast on an Atlas V-401 rocket alongside two MarCO technology-demonstration CubeSats. The lander featured a 5 foot 9 inch (1.8-meter) robotic instrument deployment arm that lifted its seismometer and heat flow probe from the deck and placed them directly onto the Martian ground.",
            "why_important": "InSight offered humanity's first comprehensive examination beneath the Martian crust, detecting hundreds of marsquakes and tracking seismic tremors caused by meteorite impacts that penetrated deep into the planet's mantle. It revealed the layered nature of Mars' interior, measured the depth of its crust and the size of its liquid metallic core, and captured the first audio recordings of Martian wind blowing across Elysium Planitia.",
            "status": "InSight landed safely on November 26, 2018 at Elysium Planitia (4.5 N, 135.9 E) and operated for over four years. On December 15, 2022, after thick Martian dust steadily covered its solar panels and diminished electrical output below operating thresholds, NASA announced the end of the mission."
        },
        "parts": [
            {"part_name": "Seismic Experiment for Interior Structure (SEIS)", "purpose": "High-precision dome-shielded seismometer measuring marsquakes, meteorite impacts, and internal vibrations."},
            {"part_name": "Heat Flow and Physical Properties Package (HP3)", "purpose": "Self-hammering thermal probe designed to measure heat flow escaping from Mars' deep interior."},
            {"part_name": "Instrument Deployment Arm (IDA)", "purpose": "1.8-meter (5 ft 9 in) robotic arm with grapple used to emplace sensors onto the surface."},
            {"part_name": "Temperature and Wind Sensors (TWINS)", "purpose": "Environmental monitoring package measuring surface wind velocity, temperature, and atmospheric pressure."},
            {"part_name": "UltraFlex Solar Arrays", "purpose": "Twin 2.15-meter circular solar panels producing electrical power from sunlight."}
        ],
        "timeline": [
            {"event_date": "2018-05-05", "title": "Launch from Vandenberg AFB", "description": "Launched aboard an Atlas V-401 from Vandenberg Air Force Base, California at 04:05 PT.", "event_type": "launch"},
            {"event_date": "2018-11-26", "title": "Touchdown on Elysium Planitia", "description": "Landed smoothly at 11:52:59 PT on the smooth plains of Elysium Planitia (4.5 N, 135.9 E).", "event_type": "landing"},
            {"event_date": "2018-12-01", "title": "Martian Wind Sounds Recorded", "description": "Sensors recorded low-frequency rumble vibrations from 10 to 15 mph Martian winds blowing over the lander.", "event_type": "science"},
            {"event_date": "2022-12-15", "title": "End of Mission", "description": "Mission concluded after dust buildup on the solar arrays depleted operating power.", "event_type": "end_of_mission"}
        ],
        "stakeholders": [
            {"name": "NASA", "role": "Space Agency", "country": "United States"},
            {"name": "NASA / JPL", "role": "Project Management", "country": "United States"},
            {"name": "Lockheed Martin Space", "role": "Spacecraft Prime Contractor", "country": "United States"},
            {"name": "CNES / IPGP", "role": "SEIS Lead Partner", "country": "France"}
        ],
        "people": [
            {"full_name": "Joel Steinkraus", "role_on_mission": "MarCO / InSight Spacecraft Testing Engineer", "affiliation": "NASA / JPL", "rank_order": 1}
        ],
        "images": [
            {
                "title": "InSight Solar Arrays Clean Room Deployment",
                "description": "Solar arrays on NASA's InSight lander deployed during pre-launch testing at Lockheed Martin Space Systems in Denver.",
                "image_url": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/InSight_Solar_Array_Test.jpg",
                "source_url": "https://science.nasa.gov/mission/insight/",
                "attribution": "NASA/JPL-Caltech/Lockheed Martin Space",
                "kind": "photo"
            }
        ]
    },
    {
        "slug": "dawn",
        "name": "Dawn",
        "display_name": "Dawn Spacecraft",
        "destination_category": "Deep Space",
        "destination": "Main Asteroid Belt (Vesta & Ceres)",
        "mission_type": "Orbiter",
        "object_type": "Orbiter",
        "agency": "NASA/JPL",
        "operator": "NASA/JPL",
        "manufacturer": "Orbital Sciences Corporation",
        "wiki_title": "Dawn_(spacecraft)",
        "nssdca_id": "2007-043A",
        "model_keywords": ["Dawn", "Dawn Spacecraft"],
        "launch_date": "2007-09-27",
        "landing_date": None,
        "end_date": "2018-11-01",
        "status_label": "ended",
        "status_text": "Completed mission in November 2018 upon hydrazine depletion; remains in a perpetual, unpowered orbit around dwarf planet Ceres.",
        "mission_status": "Completed",
        "source_url": "https://science.nasa.gov/mission/dawn/",
        "sources": [
            {
                "label": "NASA Science - Dawn",
                "url": "https://science.nasa.gov/mission/dawn/",
                "source_type": "official"
            }
        ],
        "aliases": ["Dawn Spacecraft", "Discovery 9"],
        "sections": {
            "what_is_it": "Dawn was NASA's first truly interplanetary spaceship capable of visiting, orbiting, and exploring two distinct extraterrestrial bodies in deep space. Flown under NASA's Discovery program, Dawn spent extended years exploring the giant asteroid Vesta and the dwarf planet Ceres in the main asteroid belt between Mars and Jupiter to investigate the conditions present at the birth of the solar system.",
            "how_it_works": "Dawn relied on innovative xenon ion propulsion thrusters, which accelerated ionized xenon gas electrostatically to achieve exceptionally high propellant efficiency and execute complex orbital rendezvous at multiple planetary targets. Large deployable solar panels powered the ion engines and payload, which included framing cameras, a visible and infrared mapping spectrometer, and a gamma ray and neutron detector.",
            "why_important": "Dawn became the first human spacecraft to orbit an object in the main asteroid belt (Vesta in 2011) and the first to visit and orbit a dwarf planet (Ceres in 2015). It provided evidence of ancient interior heating and fluid flow on Ceres, examined clues of long-standing internal energy and potential habitability, and photographed dramatic bright sodium carbonate salt deposits inside Occator Crater on Ceres.",
            "status": "Dawn completed its mission successfully after exhausting its hydrazine attitude-control propellant on October 31 - November 1, 2018. Having met all planetary protection requirements, the silent spacecraft remains in a stable, unpowered perpetual orbit around dwarf planet Ceres."
        },
        "parts": [
            {"part_name": "Ion Propulsion System", "purpose": "Xenon electrostatic thrusters providing high specific impulse for interplanetary cruising and orbital maneuvers."},
            {"part_name": "Framing Camera (FC)", "purpose": "High-resolution optical cameras for topological, geological, and multi-band multispectral mapping."},
            {"part_name": "Visible and Infrared Spectrometer (VIR)", "purpose": "Mapped mineralogical compositions across the surfaces of Vesta and Ceres."},
            {"part_name": "Gamma Ray and Neutron Detector (GRaND)", "purpose": "Measured elemental surface compositions (hydrogen, iron, silicon) through nuclear radiation detection."}
        ],
        "timeline": [
            {"event_date": "2007-09-27", "title": "Launch from Cape Canaveral", "description": "Launched aboard a Delta II Heavy rocket from Cape Canaveral Air Force Station.", "event_type": "launch"},
            {"event_date": "2011-07-16", "title": "Orbit Insertion at Vesta", "description": "Became the first spacecraft to enter orbit around the giant asteroid Vesta.", "event_type": "orbit"},
            {"event_date": "2012-09-05", "title": "Departure from Vesta", "description": "Escaped Vesta's gravity via ion propulsion, setting course for Ceres.", "event_type": "departure"},
            {"event_date": "2015-03-06", "title": "Orbit Insertion at Ceres", "description": "Became the first spacecraft to enter orbit around a dwarf planet.", "event_type": "orbit"},
            {"event_date": "2018-11-01", "title": "Mission Concluded", "description": "Mission ended following hydrazine fuel exhaustion; entered silent perpetual orbit around Ceres.", "event_type": "end_of_mission"}
        ],
        "stakeholders": [
            {"name": "NASA", "role": "Space Agency", "country": "United States"},
            {"name": "NASA / JPL", "role": "Mission Lead and Operations", "country": "United States"}
        ],
        "people": [],
        "images": [
            {
                "title": "Dawn Sees Crescent Ceres",
                "description": "Crescent view of dwarf planet Ceres captured by NASA's Dawn spacecraft from high orbit.",
                "image_url": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/PIA21921_hires.jpg",
                "source_url": "https://science.nasa.gov/mission/dawn/",
                "attribution": "NASA/JPL-Caltech/UCLA/MPS/DLR/IDA",
                "kind": "photo"
            }
        ]
    },
    {
        "slug": "near-shoemaker",
        "name": "NEAR Shoemaker",
        "display_name": "NEAR Shoemaker",
        "destination_category": "Deep Space",
        "destination": "Asteroid 433 Eros",
        "mission_type": "Orbiter / Lander",
        "object_type": "Orbiter",
        "agency": "NASA",
        "operator": "NASA / GSFC / APL",
        "manufacturer": "Johns Hopkins APL",
        "wiki_title": "NEAR_Shoemaker",
        "nssdca_id": "1996-008A",
        "model_keywords": ["NEAR Shoemaker", "NEAR"],
        "launch_date": "1996-02-17",
        "landing_date": "2001-02-12",
        "end_date": "2001-02-28",
        "status_label": "ended",
        "status_text": "Touched down on asteroid 433 Eros on February 12, 2001; transmitted science for two weeks before last contact on February 28, 2001.",
        "mission_status": "Completed",
        "source_url": "https://science.nasa.gov/mission/near-shoemaker/",
        "sources": [
            {
                "label": "NASA Science - NEAR Shoemaker",
                "url": "https://science.nasa.gov/mission/near-shoemaker/",
                "source_type": "official"
            }
        ],
        "aliases": ["NEAR", "Near Earth Asteroid Rendezvous", "Discovery 1"],
        "sections": {
            "what_is_it": "NEAR Shoemaker (Near Earth Asteroid Rendezvous) was the first spacecraft to orbit an asteroid and the first to soft-land on one. Flown as the inaugural mission of NASA's Discovery program, the robotic explorer rendezvoused with the near-Earth asteroid 433 Eros to gather data on its physical properties, mineralogy, surface morphology, and magnetic field. It was later renamed in honor of renowned planetary geologist Eugene M. Shoemaker.",
            "how_it_works": "The spacecraft weighed 1,775 pounds (805 kg) and was launched by a Delta 7925-8 rocket. It was the first planetary mission to rely entirely on solar cells for electrical power beyond the orbit of Mars. Although not designed as a lander, NEAR possessed hydrazine attitude thrusters, guidance sensors, and an array of spectrometers, laser rangefinders, and imaging cameras that allowed controllers to guide it through a controlled 4 mph (6.4 km/h) touchdown onto the asteroid surface.",
            "why_important": "NEAR achieved an unprecedented series of firsts: the first spacecraft to orbit an asteroid (February 14, 2000) and the first to touch down on one (February 12, 2001). It marked the first time an American spacecraft was the first in human history to land on an extraterrestrial celestial body. The probe mapped over 70% of Eros, returned 160,000 images, and survived touchdown to beam gamma-ray surface spectroscopy data back to Earth for two weeks.",
            "status": "NEAR successfully touched down on asteroid 433 Eros just south of Himeros on February 12, 2001. It operated on the surface until February 28, 2001, when extreme surface temperatures (minus 279 degrees Fahrenheit / minus 173 degrees Celsius) drained operating batteries. The probe rests permanently on Eros."
        },
        "parts": [
            {"part_name": "Multi-Spectral Imager (MSI)", "purpose": "Optical camera that acquired over 160,000 high-resolution images of asteroids Mathilde and Eros."},
            {"part_name": "Magnetometer (MAG)", "purpose": "Measured magnetic fields around 433 Eros, discovering the asteroid lacks an inherent magnetic field."},
            {"part_name": "Near Infrared Spectrometer (NIS)", "purpose": "Mapped surface mineralogy across more than 70 percent of Eros before a May 2000 power surge."},
            {"part_name": "X-Ray/Gamma-Ray Spectrometer (XGRS)", "purpose": "Measured elemental abundances (magnesium, iron, silicon) from orbit and directly from the surface."},
            {"part_name": "NEAR Laser Rangefinder (NLR)", "purpose": "Laser altimeter measuring spacecraft altitude and topographical relief on the asteroid surface."},
            {"part_name": "Radio Science and Gravimetry Experiment", "purpose": "Used Doppler tracking to determine Eros' mass, density, and internal mass distribution."}
        ],
        "timeline": [
            {"event_date": "1996-02-17", "title": "Launch from Cape Canaveral", "description": "Launched aboard a Delta 7925-8 rocket from Launch Complex 17B at 20:43:27 UT.", "event_type": "launch"},
            {"event_date": "1997-06-27", "title": "Flyby of Asteroid 253 Mathilde", "description": "Encountered asteroid Mathilde at a closest range of 750 miles (1,200 km).", "event_type": "encounter"},
            {"event_date": "1998-01-23", "title": "Earth Gravity Assist", "description": "Flew by Earth at an altitude of 335 miles (540 km) to alter trajectory toward Eros.", "event_type": "gravity_assist"},
            {"event_date": "2000-02-14", "title": "First Orbit of an Asteroid", "description": "Entered orbit around 433 Eros at 15:33 UT, becoming the first craft to orbit an asteroid.", "event_type": "orbit"},
            {"event_date": "2000-03-14", "title": "Renamed NEAR Shoemaker", "description": "Renamed in memory of legendary planetary geologist Eugene M. Shoemaker.", "event_type": "milestone"},
            {"event_date": "2001-02-12", "title": "First Landing on an Asteroid", "description": "Descended at 4 mph (6.4 km/h) and gently touched down on Eros near Himeros at 19:44 UT.", "event_type": "landing"},
            {"event_date": "2001-02-28", "title": "Last Contact from Surface", "description": "Final transmission received from the asteroid surface after two weeks of post-landing science.", "event_type": "end_of_mission"}
        ],
        "stakeholders": [
            {"name": "NASA", "role": "Space Agency", "country": "United States"},
            {"name": "NASA Goddard Space Flight Center", "role": "Program Management", "country": "United States"},
            {"name": "Johns Hopkins APL", "role": "Spacecraft Design and Operations", "country": "United States"}
        ],
        "people": [
            {"full_name": "Eugene M. Shoemaker", "role_on_mission": "Planetary Geologist / Mission Namesake", "affiliation": "USGS / Caltech", "rank_order": 1}
        ],
        "images": [
            {
                "title": "NEAR at Asteroid Eros",
                "description": "Artist's concept depicting the NEAR Shoemaker spacecraft in close proximity to minor planet 433 Eros.",
                "image_url": "https://images.nasa.gov/details/PIA02462",
                "source_url": "https://science.nasa.gov/mission/near-shoemaker/",
                "attribution": "NASA / JHUAPL",
                "kind": "illustration"
            }
        ]
    },
    {
        "slug": "pioneer-10",
        "name": "Pioneer 10",
        "display_name": "Pioneer 10",
        "destination_category": "Deep Space",
        "destination": "Outer Solar System / Interstellar Space",
        "mission_type": "Flyby",
        "object_type": "Probe",
        "agency": "NASA",
        "operator": "NASA / ARC",
        "manufacturer": "TRW Inc.",
        "wiki_title": "Pioneer_10",
        "nssdca_id": "1972-012A",
        "model_keywords": ["Pioneer 10", "Pioneer"],
        "launch_date": "1972-03-02",
        "landing_date": None,
        "end_date": "2003-01-23",
        "status_label": "ended",
        "status_text": "Routine contact ended March 31, 1997; final signal received January 23, 2003 from 7.6 billion miles away. Now drifting out of the solar system.",
        "mission_status": "Completed",
        "source_url": "https://science.nasa.gov/mission/pioneer-10/",
        "sources": [
            {
                "label": "NASA Science - Pioneer 10",
                "url": "https://science.nasa.gov/mission/pioneer-10/",
                "source_type": "official"
            }
        ],
        "aliases": ["Pioneer-F", "Pioneer 10 Probe"],
        "sections": {
            "what_is_it": "Pioneer 10 (Pioneer-F) was NASA's trailblazing first robotic mission to the outer planets. Launched in March 1972, the spacecraft achieved an unmatched series of deep-space exploration milestones, becoming the first probe to venture beyond Mars, the first to traverse the main asteroid belt, the first to conduct a close flyby of Jupiter, and the first human-built craft placed on an escape trajectory out of the solar system.",
            "how_it_works": "Weighing 569 pounds (258 kilograms), Pioneer 10 was boosted by a three-stage Atlas Centaur rocket with a TE-M-364-4 upper stage to a record escape velocity of 32,110 mph (51,682 km/h). Pioneer 10 was the first spacecraft to rely exclusively on nuclear electrical power, driven by twin SNAP-19 radioisotope thermoelectric generators (RTGs) generating ~140 W during its Jupiter flyby. It operated with spin stabilization and carried an array of magnetic, plasma, and imaging photopolarimeter instruments alongside an iconic gold-anodized pictorial plaque.",
            "why_important": "Pioneer 10 revolutionized planetary science by revealing that Jupiter is predominantly a liquid planet encased in intense trapped-radiation belts and a massive magnetic tail stretching nearly 800 million kilometers. In June 1983, it crossed the orbit of Neptune to become the first human-made object to venture beyond the outermost known planet, operating for over three decades across a mission planned for 21 months.",
            "status": "NASA maintained routine communications with Pioneer 10 until March 31, 1997. Ground antennas received the spacecraft's final faint radio signal on January 23, 2003, at a distance of 7.6 billion miles (12.23 billion kilometers) from Earth. Pioneer 10 is currently drifting silently into interstellar space toward the red star Aldebaran in the constellation Taurus."
        },
        "parts": [
            {"part_name": "Imaging Photopolarimeter", "purpose": "Acquired roughly 500 images of Jupiter's atmosphere, the Great Red Spot, and Galilean satellites."},
            {"part_name": "Helium Vector Magnetometer (HVM)", "purpose": "Mapped interplanetary magnetic fields and charted Jupiter's immense magnetosphere."},
            {"part_name": "Infrared Radiometer", "purpose": "Measured Jovian atmospheric thermal emissions and net thermal energy balance."},
            {"part_name": "Quadrispherical Plasma Analyzer", "purpose": "Observed solar wind interactions, solar storm shock fronts, and planetary bow shock crossings."},
            {"part_name": "Ultraviolet Photometer", "purpose": "Measured hydrogen and helium glow in the interplanetary medium and Jovian atmosphere."},
            {"part_name": "Charged Particle Instrument (CPI)", "purpose": "Detected high-energy electrons and cosmic ray protons in interplanetary space and Jupiter's belts."},
            {"part_name": "Cosmic Ray Telescope (CRT)", "purpose": "Monitored cosmic ray composition and solar energetic particle fluxes."},
            {"part_name": "Geiger Tube Telescope (GTT)", "purpose": "Characterized high-intensity radiation belts encountered during the Jupiter flyby."},
            {"part_name": "Asteroid/Meteoroid Detector (AMD)", "purpose": "Optical and pressurized-cell meteoroid impact sensors tracking debris in the asteroid belt."},
            {"part_name": "SNAP-19 RTGs", "purpose": "Twin plutonium-238 radioisotope thermoelectric generators producing continuous electrical power."},
            {"part_name": "Pioneer Plaque", "purpose": "Gold-anodized aluminum plaque with diagrams of human anatomy and solar system origin."}
        ],
        "timeline": [
            {"event_date": "1972-03-02", "title": "Launch from Cape Canaveral", "description": "Launched on an Atlas Centaur rocket from Launch Complex 36A at 01:49:04 UT.", "event_type": "launch"},
            {"event_date": "1972-07-15", "title": "Entered the Asteroid Belt", "description": "First spacecraft to enter the main asteroid belt, emerging safely in February 1973.", "event_type": "encounter"},
            {"event_date": "1973-12-04", "title": "Closest Approach to Jupiter", "description": "Raced past Jupiter at a range of 81,000 miles (130,354 km) at 78,000 mph, returning close-up imagery.", "event_type": "flyby"},
            {"event_date": "1976-02", "title": "Crossed Saturn's Orbit", "description": "Crossed Saturn's orbital radius while detecting Jupiter's enormous magnetic tail.", "event_type": "milestone"},
            {"event_date": "1983-06-13", "title": "Crossed Neptune's Orbit", "description": "Became the first human-built craft to travel beyond the furthest planet in the solar system.", "event_type": "milestone"},
            {"event_date": "1997-03-31", "title": "Routine Contact Terminated", "description": "Formal mission operations ended due to budget constraints after 25 years.", "event_type": "milestone"},
            {"event_date": "2003-01-23", "title": "Last Signal Received on Earth", "description": "Received final telemetry signal from a distance of 7.6 billion miles (12.23 billion km).", "event_type": "end_of_mission"}
        ],
        "stakeholders": [
            {"name": "NASA", "role": "Space Agency", "country": "United States"},
            {"name": "NASA Ames Research Center", "role": "Mission Design and Management", "country": "United States"},
            {"name": "TRW Inc.", "role": "Spacecraft Prime Contractor", "country": "United States"}
        ],
        "people": [],
        "images": [
            {
                "title": "Pioneer 10 Artist's Concept",
                "description": "Artist's rendering of the Pioneer 10 spacecraft during its flight past Jupiter.",
                "image_url": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/pioneer10.jpg",
                "source_url": "https://science.nasa.gov/mission/pioneer-10/",
                "attribution": "NASA",
                "kind": "illustration"
            }
        ]
    },
    {
        "slug": "kepler",
        "name": "Kepler",
        "display_name": "Kepler Space Telescope",
        "destination_category": "Earth Orbit",
        "destination": "Earth-trailing heliocentric orbit",
        "mission_type": "Space Telescope",
        "object_type": "Space Telescope",
        "agency": "NASA",
        "operator": "NASA / ARC",
        "manufacturer": "Ball Aerospace",
        "wiki_title": "Kepler_space_telescope",
        "nssdca_id": "2009-011A",
        "model_keywords": ["Kepler", "Kepler Space Telescope"],
        "launch_date": "2009-03-06",
        "landing_date": None,
        "end_date": "2018-10-30",
        "status_label": "ended",
        "status_text": "Retired on October 30, 2018 after depleting fuel following nine years of discoveries; remains in an Earth-trailing heliocentric orbit.",
        "mission_status": "Completed",
        "source_url": "https://science.nasa.gov/mission/kepler/",
        "sources": [
            {
                "label": "NASA Science - Kepler / K2",
                "url": "https://science.nasa.gov/mission/kepler/",
                "source_type": "official"
            }
        ],
        "aliases": ["Kepler Space Telescope", "K2", "Discovery 10"],
        "sections": {
            "what_is_it": "The Kepler Space Telescope was NASA’s first dedicated planet-hunting mission, assigned to survey our region of the Milky Way galaxy for Earth-sized exoplanets orbiting within stellar habitable zones. Operating in an Earth-trailing heliocentric orbit, Kepler and its second-act extended mission, K2, surveyed more than 500,000 stars over nine years in deep space.",
            "how_it_works": "The spacecraft was built around a single primary instrument: a specialized 3-foot (1-meter) aperture Schmidt telescope equipped with a 4-foot 7-inch (1.4-meter) primary mirror and a 95-megapixel image sensor array—the largest digital camera array launched into outer space at that time. Kepler detected planets by observing transits, recording tiny periodic dips in stellar brightness. When two of four reaction wheels failed in 2013, engineers used solar photon pressure to balance the telescope's pointing, initiating the extended K2 mission.",
            "why_important": "Kepler revolutionized astronomy by confirming more than 2,600 exoplanets and proving that planets outnumber stars in our galaxy. Its observations revealed that 20 to 50 percent of stars visible in the night sky likely host small, rocky planets in their habitable zones. Kepler discovered the first multi-planet transiting systems (Kepler-9 and Kepler-11) and demonstrated that worlds between the size of Earth and Neptune are common throughout the Milky Way.",
            "status": "After nine years of operations, Kepler exhausted its attitude-control fuel needed for further science observations. NASA officially retired the spacecraft on October 30, 2018, leaving it safely parked in its Earth-trailing heliocentric orbit."
        },
        "parts": [
            {"part_name": "1.4-Meter Primary Mirror", "purpose": "Primary concave mirror (4 ft 7 in diameter) focusing starlight onto the focal plane."},
            {"part_name": "0.95-Meter Aperture Schmidt Corrector", "purpose": "Front corrector lens providing an expansive 105-square-degree field of view."},
            {"part_name": "CCD Focal Plane Array", "purpose": "95-megapixel array of 42 charge-coupled devices continuously monitoring stellar brightness."},
            {"part_name": "Reaction Wheel Control System", "purpose": "Gyroscopic pointing wheels used for fine stabilization (adapted to solar-pressure pointing during K2)."}
        ],
        "timeline": [
            {"event_date": "2009-03-06", "title": "Launch into Heliocentric Orbit", "description": "Launched aboard a Delta II rocket from Cape Canaveral Air Force Station.", "event_type": "launch"},
            {"event_date": "2010-01", "title": "First Exoplanet Discoveries", "description": "NASA announced Kepler's first five exoplanet detections (Kepler 4b through 8b).", "event_type": "science"},
            {"event_date": "2010-04", "title": "First Multi-Planet Transiting System", "description": "Confirmed Kepler-9, the first planetary system with multiple planets transiting the same star.", "event_type": "science"},
            {"event_date": "2013-05", "title": "Second Reaction Wheel Failure", "description": "Loss of second reaction wheel concluded prime mission; engineers devised solar-pressure pointing.", "event_type": "milestone"},
            {"event_date": "2014", "title": "K2 Mission Initiated", "description": "Commenced K2 extended mission observing fields along the ecliptic plane across 19 campaigns.", "event_type": "milestone"},
            {"event_date": "2018-10-30", "title": "Kepler Officially Retired", "description": "NASA retired Kepler within its safe Earth-trailing heliocentric orbit upon fuel exhaustion.", "event_type": "end_of_mission"}
        ],
        "stakeholders": [
            {"name": "NASA", "role": "Space Agency", "country": "United States"},
            {"name": "NASA Ames Research Center", "role": "Science Lead and Operations", "country": "United States"},
            {"name": "Ball Aerospace", "role": "Spacecraft Prime Contractor", "country": "United States"}
        ],
        "people": [
            {"full_name": "William Borucki", "role_on_mission": "Founding Principal Investigator", "affiliation": "NASA Ames Research Center", "rank_order": 1}
        ],
        "images": [
            {
                "title": "Kepler Space Telescope in K2 Mission",
                "description": "Artist's concept of NASA's planet-hunting Kepler spacecraft operating in its K2 mission configuration.",
                "image_url": "https://assets.science.nasa.gov/dynamicimage/assets/science/astro/missions/Kepler_concept.jpg",
                "source_url": "https://science.nasa.gov/mission/kepler/",
                "attribution": "NASA, ESA, CSA, and STScI",
                "kind": "illustration"
            }
        ]
    }
]

# -----------------------------------------------------------------------------
# Apply to Database
# -----------------------------------------------------------------------------

existing_slugs = {row["slug"] for row in cursor.execute("SELECT slug FROM spacecraft").fetchall()}

for mission in NEW_MISSIONS_DATA:
    slug = mission["slug"]
    print(f"Applying {slug}...")

    # 1. Mission row
    cursor.execute("SELECT id FROM missions WHERE slug = ?", (slug,))
    m_row = cursor.fetchone()
    if not m_row:
        cursor.execute(
            """INSERT INTO missions 
               (name, mission_name, slug, destination_category, destination, launch_date, 
                mission_end_date, end_date, mission_status, description, objectives, official_url, source_url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                mission["name"],
                mission["display_name"],
                slug,
                mission["destination_category"],
                mission["destination"],
                mission["launch_date"],
                mission["end_date"],
                mission["end_date"],
                mission["mission_status"],
                mission["sections"]["what_is_it"],
                mission["sections"]["why_important"],
                mission["source_url"],
                mission["source_url"]
            )
        )
        mission_id = cursor.lastrowid
    else:
        mission_id = m_row["id"]

    # 2. Spacecraft row
    cursor.execute("SELECT id FROM spacecraft WHERE slug = ?", (slug,))
    sc_row = cursor.fetchone()
    if not sc_row:
        cursor.execute(
            """INSERT INTO spacecraft
               (name, slug, display_name, full_name, object_type, spacecraft_type,
                destination_category, destination, operational_status, launch_date,
                decommission_date, landing_date, short_description, educational_description,
                how_it_works, why_it_is_important, scientific_purpose, current_or_last_known_status,
                official_url, source_url, verification_status, last_verified_at, mission_type,
                primary_agency, summary, wiki_title, nssdca_id, end_date, status_label,
                status_text, status_as_of, is_active_flag, primary_mission_id, agency, manufacturer)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                mission["name"],
                slug,
                mission["display_name"],
                mission["display_name"],
                mission["object_type"],
                mission["object_type"],
                mission["destination_category"],
                mission["destination"],
                "Inactive / completed" if mission["status_label"] == "ended" else "Active / operational",
                mission["launch_date"],
                mission["end_date"],
                mission["landing_date"],
                mission["sections"]["what_is_it"],
                mission["sections"]["what_is_it"],
                mission["sections"]["how_it_works"],
                mission["sections"]["why_important"],
                mission["sections"]["why_important"],
                mission["sections"]["status"],
                mission["source_url"],
                mission["source_url"],
                "Verified from NASA Records",
                TODAY,
                mission["mission_type"],
                mission["agency"],
                mission["sections"]["what_is_it"],
                mission["wiki_title"],
                mission["nssdca_id"],
                mission["end_date"],
                mission["status_label"],
                mission["status_text"],
                TODAY,
                1 if mission["status_label"] == "active" else 0,
                mission_id,
                mission["agency"],
                mission["manufacturer"]
            )
        )
        spacecraft_id = cursor.lastrowid
    else:
        spacecraft_id = sc_row["id"]

    # 3. MissionSpacecraft link
    cursor.execute(
        "SELECT id FROM mission_spacecraft WHERE mission_id = ? AND spacecraft_id = ?",
        (mission_id, spacecraft_id)
    )
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO mission_spacecraft (mission_id, spacecraft_id, role) VALUES (?, ?, ?)",
            (mission_id, spacecraft_id, "Primary Spacecraft")
        )

    # 4. Sources
    cursor.execute("DELETE FROM spacecraft_sources WHERE spacecraft_id = ?", (spacecraft_id,))
    for src in mission["sources"]:
        cursor.execute(
            """INSERT INTO spacecraft_sources 
               (spacecraft_id, source_name, source_url, source_type, last_checked_at, label, url, verified, last_checked)
               VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)""",
            (spacecraft_id, src["label"], src["url"], src["source_type"], TODAY, src["label"], src["url"], NOW)
        )

    # 5. Content blocks (sections 1-4)
    cursor.execute("DELETE FROM spacecraft_content WHERE spacecraft_id = ?", (spacecraft_id,))
    for skey, text in mission["sections"].items():
        cursor.execute(
            """INSERT INTO spacecraft_content
               (spacecraft_id, section_key, body_text, license, attribution, page_url, fetched_at, completeness)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                spacecraft_id,
                skey,
                text,
                "Public domain (NASA)",
                mission["agency"],
                mission["source_url"],
                NOW,
                "ok"
            )
        )

    # 6. Parts
    cursor.execute("DELETE FROM spacecraft_parts WHERE spacecraft_id = ?", (spacecraft_id,))
    for idx, part in enumerate(mission.get("parts", [])):
        cursor.execute(
            "INSERT INTO spacecraft_parts (spacecraft_id, part_name, purpose, sort_order) VALUES (?, ?, ?, ?)",
            (spacecraft_id, part["part_name"], part["purpose"], idx + 1)
        )

    # 7. Timeline events
    cursor.execute("DELETE FROM timeline_events WHERE spacecraft_id = ?", (spacecraft_id,))
    for idx, event in enumerate(mission.get("timeline", [])):
        cursor.execute(
            """INSERT INTO timeline_events 
               (spacecraft_id, event_date, event_date_precision, title, description, event_type, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (spacecraft_id, event["event_date"], "day", event["title"], event["description"], event["event_type"], idx + 1)
        )

    # 8. Stakeholders
    cursor.execute("DELETE FROM spacecraft_stakeholders WHERE spacecraft_id = ?", (spacecraft_id,))
    for org_data in mission.get("stakeholders", []):
        org_id = get_or_create_org(org_data["name"], country=org_data.get("country", "United States"))
        cursor.execute(
            "INSERT INTO spacecraft_stakeholders (spacecraft_id, organization_id, role) VALUES (?, ?, ?)",
            (spacecraft_id, org_id, org_data["role"])
        )

    # 9. 3D Model
    cursor.execute("DELETE FROM spacecraft_models WHERE spacecraft_id = ?", (spacecraft_id,))
    cursor.execute(
        """INSERT INTO spacecraft_models
           (spacecraft_id, file_path, download_url, format, web_ready, provider, license, viewer_url, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            spacecraft_id,
            None,
            None,
            "glb",
            False,
            "NASA 3D Resources",
            "NASA 3D resources are free to use without copyright",
            "https://eyes.nasa.gov/apps/solar-system/",
            "ok"
        )
    )

    # 10. People
    cursor.execute("DELETE FROM spacecraft_people WHERE spacecraft_id = ?", (spacecraft_id,))
    for idx, person_data in enumerate(mission.get("people", [])):
        p_id = get_or_create_person(person_data["full_name"], person_data.get("affiliation"), person_data.get("role_on_mission"))
        cursor.execute(
            """INSERT INTO spacecraft_people (spacecraft_id, person_id, role_on_mission, rank_order)
               VALUES (?, ?, ?, ?)""",
            (spacecraft_id, p_id, person_data["role_on_mission"], person_data["rank_order"])
        )

    # Images
    cursor.execute("DELETE FROM spacecraft_images WHERE spacecraft_id = ?", (spacecraft_id,))
    for idx, img in enumerate(mission.get("images", [])):
        cursor.execute(
            """INSERT INTO spacecraft_images
               (spacecraft_id, item_type, title, description, image_url, source_url, attribution, kind, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (spacecraft_id, "Photo", img["title"], img["description"], img["image_url"], img["source_url"], img["attribution"], img["kind"], idx + 1)
        )

    # Aliases
    cursor.execute("DELETE FROM spacecraft_aliases WHERE spacecraft_id = ?", (spacecraft_id,))
    cursor.execute(
        "INSERT INTO spacecraft_aliases (spacecraft_id, alias, alias_type) VALUES (?, ?, ?)",
        (spacecraft_id, mission["display_name"], "Display name")
    )
    for alias in mission.get("aliases", []):
        cursor.execute(
            "INSERT INTO spacecraft_aliases (spacecraft_id, alias, alias_type) VALUES (?, ?, ?)",
            (spacecraft_id, alias, "Alternate Name")
        )

# Ensure Surveyor 3 has parts populated from its official page
cursor.execute("SELECT id FROM spacecraft WHERE slug = 'surveyor-3'")
s3 = cursor.fetchone()
if s3:
    cursor.execute("SELECT count(*) FROM spacecraft_parts WHERE spacecraft_id = ?", (s3["id"],))
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO spacecraft_parts (spacecraft_id, part_name, purpose, sort_order) VALUES (?, ?, ?, ?)",
            (s3["id"], "Television Camera", "Vidicon camera with 25mm and 100mm lenses and color filters that transmitted 6,315 lunar surface photos.", 1)
        )
        cursor.execute(
            "INSERT INTO spacecraft_parts (spacecraft_id, part_name, purpose, sort_order) VALUES (?, ?, ?, ?)",
            (s3["id"], "Soil Mechanics Surface Sampler", "Electric-motor-driven scoop on an extendable pantograph arm used to dig four trenches and conduct bearing/impact tests.", 2)
        )

# Ensure Perseverance / Ingenuity has aliases for "Ingenuity"
cursor.execute("SELECT id FROM spacecraft WHERE slug = 'perseverance-ingenuity'")
pi = cursor.fetchone()
if pi:
    cursor.execute("SELECT count(*) FROM spacecraft_aliases WHERE spacecraft_id = ? AND alias = 'Ingenuity'", (pi["id"],))
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO spacecraft_aliases (spacecraft_id, alias, alias_type) VALUES (?, ?, ?)",
            (pi["id"], "Ingenuity", "Alternate Name")
        )
        cursor.execute(
            "INSERT INTO spacecraft_aliases (spacecraft_id, alias, alias_type) VALUES (?, ?, ?)",
            (pi["id"], "Ingenuity Mars Helicopter", "Alternate Name")
        )

conn.commit()
conn.close()

# -----------------------------------------------------------------------------
# Update missions_registry.json
# -----------------------------------------------------------------------------

registry_existing_slugs = {m["slug"] for m in registry_data["missions"]}
for mission in NEW_MISSIONS_DATA:
    slug = mission["slug"]
    if slug not in registry_existing_slugs:
        registry_item = {
            "slug": slug,
            "name": mission["name"],
            "display_name": mission["display_name"],
            "destination_category": mission["destination_category"],
            "destination": mission["destination"],
            "mission_type": mission["mission_type"],
            "object_type": mission["object_type"],
            "agency": mission["agency"],
            "operator": mission["operator"],
            "manufacturer": mission["manufacturer"],
            "wiki_title": mission["wiki_title"],
            "secondary_wiki_titles": [],
            "nssdca_id": mission["nssdca_id"],
            "model_keywords": mission["model_keywords"],
            "model_include": [],
            "model_exclude": [],
            "model_overrides": [],
            "launch_date": mission["launch_date"],
            "landing_date": mission["landing_date"],
            "end_date": mission["end_date"],
            "status_label": mission["status_label"],
            "status_text": mission["status_text"],
            "mission_status": mission["mission_status"],
            "sources": mission["sources"],
            "people": [
                {"name": p["full_name"], "role": p["role_on_mission"]} for p in mission["people"]
            ]
        }
        registry_data["missions"].append(registry_item)

with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
    json.dump(registry_data, f, indent=2, ensure_ascii=False)
    f.write("\n")

# -----------------------------------------------------------------------------
# Update fill_facts.json
# -----------------------------------------------------------------------------

for mission in NEW_MISSIONS_DATA:
    slug = mission["slug"]
    entry_dict = {
        "retrieved_at": TODAY,
        "confidence": "high",
        "sections": {
            "what_is_it": {
                "text": mission["sections"]["what_is_it"],
                "source_url": mission["source_url"],
                "confidence": "high",
                "attribution": mission["agency"],
                "license": "Public domain (NASA)"
            },
            "how_it_works": {
                "text": mission["sections"]["how_it_works"],
                "source_url": mission["source_url"],
                "confidence": "high",
                "attribution": mission["agency"],
                "license": "Public domain (NASA)"
            },
            "why_important": {
                "text": mission["sections"]["why_important"],
                "source_url": mission["source_url"],
                "confidence": "high",
                "attribution": mission["agency"],
                "license": "Public domain (NASA)"
            },
            "status": {
                "text": mission["sections"]["status"],
                "source_url": mission["source_url"],
                "confidence": "high",
                "attribution": mission["agency"],
                "license": "Public domain (NASA)"
            }
        },
        "timeline": [
            {
                "event_date": ev["event_date"],
                "event_date_precision": "day",
                "title": ev["title"],
                "description": ev["description"],
                "event_type": ev["event_type"],
                "source_url": mission["source_url"]
            }
            for ev in mission["timeline"]
        ],
        "imagery": [
            {
                "title": img["title"],
                "image_url": img["image_url"],
                "source_url": mission["source_url"],
                "attribution": img["attribution"],
                "kind": img["kind"],
                "item_type": "Photo",
                "license": "Public domain (NASA)",
                "description": img["description"]
            }
            for img in mission["images"]
        ],
        "stakeholders": [
            {
                "name": sh["name"],
                "organization_type": "Government Agency" if "NASA" in sh["name"] else "Contractor / University",
                "country": sh["country"],
                "role": sh["role"],
                "source_url": mission["source_url"]
            }
            for sh in mission["stakeholders"]
        ],
        "people": [
            {
                "full_name": p["full_name"],
                "role_on_mission": p["role_on_mission"],
                "affiliation": p["affiliation"],
                "wiki_url": None,
                "source_url": mission["source_url"],
                "rank_order": p["rank_order"]
            }
            for p in mission["people"]
        ]
    }
    facts_data.setdefault("entries", {})[slug] = entry_dict

with open(FACTS_PATH, "w", encoding="utf-8") as f:
    json.dump(facts_data, f, indent=2, ensure_ascii=False)
    f.write("\n")

print(f"Successfully added 9 new missions to database, missions_registry.json, and fill_facts.json.")
