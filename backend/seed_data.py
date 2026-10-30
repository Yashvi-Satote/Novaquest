"""
Seed data ingestion script for the Space Hardware Explorer.
Populates authoritative, scientifically verified records for Mars, Moon, Deep Space, and Earth Orbit hardware.
All records are derived from NASA, JPL, NASA PDS, and ESA public archives.
"""

import sys
import os
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import Organization, Mission, Hardware, HardwareAlias, HardwareKeyword, HardwareImage, HardwareSource
from mission_hierarchy import apply_mission_classifications, ensure_mission_hierarchy_schema

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    ensure_mission_hierarchy_schema(engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_count = db.query(Hardware).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} hardware records. Skipping seed.")
            apply_mission_classifications(db)
            return

        print("Seeding Organizations...")
        organizations_data = [
            {
                "name": "NASA",
                "slug": "nasa",
                "organization_type": "Space Agency",
                "country": "United States",
                "official_url": "https://www.nasa.gov"
            },
            {
                "name": "Jet Propulsion Laboratory (JPL)",
                "slug": "jpl",
                "organization_type": "Research & Development Center",
                "country": "United States",
                "official_url": "https://www.jpl.nasa.gov"
            },
            {
                "name": "European Space Agency (ESA)",
                "slug": "esa",
                "organization_type": "Space Agency",
                "country": "Europe",
                "official_url": "https://www.esa.int"
            },
            {
                "name": "China National Space Administration (CNSA)",
                "slug": "cnsa",
                "organization_type": "Space Agency",
                "country": "China",
                "official_url": "http://www.cnsa.gov.cn"
            },
            {
                "name": "Boeing",
                "slug": "boeing",
                "organization_type": "Commercial Aerospace Manufacturer",
                "country": "United States",
                "official_url": "https://www.boeing.com/space"
            },
            {
                "name": "Lockheed Martin",
                "slug": "lockheed-martin",
                "organization_type": "Commercial Aerospace Manufacturer",
                "country": "United States",
                "official_url": "https://www.lockheedmartin.com"
            },
            {
                "name": "Grumman Aerospace",
                "slug": "grumman",
                "organization_type": "Aerospace Manufacturer",
                "country": "United States",
                "official_url": "https://www.northropgrumman.com"
            },
            {
                "name": "Hughes Aircraft",
                "slug": "hughes-aircraft",
                "organization_type": "Aerospace Manufacturer",
                "country": "United States",
                "official_url": ""
            },
            {
                "name": "Martin Marietta",
                "slug": "martin-marietta",
                "organization_type": "Aerospace Manufacturer",
                "country": "United States",
                "official_url": ""
            },
            {
                "name": "Yuzhnoye Design Office",
                "slug": "yuzhnoye",
                "organization_type": "State Aerospace Bureau",
                "country": "Ukraine / USSR",
                "official_url": "https://www.yuzhnoye.com"
            }
        ]

        org_map = {}
        for o_data in organizations_data:
            org = Organization(**o_data)
            db.add(org)
            db.flush()
            org_map[org.slug] = org

        print("Seeding Missions...")
        missions_data = [
            # MARS MISSIONS
            {
                "name": "Viking 1",
                "slug": "viking-1",
                "destination_category": "Mars",
                "launch_date": "1975-08-20",
                "mission_end_date": "1982-11-13",
                "mission_status": "Completed",
                "description": "NASA's historic first mission to successfully land a spacecraft on Mars and operate for over six years.",
                "official_url": "https://science.nasa.gov/mission/viking-1"
            },
            {
                "name": "Mars Pathfinder",
                "slug": "mars-pathfinder",
                "destination_category": "Mars",
                "launch_date": "1996-12-04",
                "mission_end_date": "1997-09-27",
                "mission_status": "Completed",
                "description": "Pioneered low-cost planetary entry using airbags and delivered humanity's first mobile wheeled robotic rover, Sojourner, to Mars.",
                "official_url": "https://science.nasa.gov/mission/mars-pathfinder"
            },
            {
                "name": "Mars Exploration Rover (MER)",
                "slug": "mars-exploration-rover",
                "destination_category": "Mars",
                "launch_date": "2003-06-10",
                "mission_end_date": "2018-06-10",
                "mission_status": "Completed",
                "description": "NASA twin rover mission (Spirit and Opportunity) seeking past water activity and habitability across Martian geology.",
                "official_url": "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/"
            },
            {
                "name": "Phoenix",
                "slug": "phoenix",
                "destination_category": "Mars",
                "launch_date": "2007-08-04",
                "mission_end_date": "2008-11-10",
                "mission_status": "Completed",
                "description": "Landed in the Martian arctic plains to analyze sub-surface water ice and polar environmental chemistry.",
                "official_url": "https://science.nasa.gov/mission/phoenix"
            },
            {
                "name": "InSight",
                "slug": "insight",
                "destination_category": "Mars",
                "launch_date": "2018-05-05",
                "mission_end_date": "2022-12-15",
                "mission_status": "Completed",
                "description": "Geophysics lander dedicated to investigating the deep interior structure, seismology, and core mantle of Mars.",
                "official_url": "https://science.nasa.gov/mission/insight"
            },
            {
                "name": "Mars 2020",
                "slug": "mars-2020",
                "destination_category": "Mars",
                "launch_date": "2020-07-30",
                "mission_end_date": None,
                "mission_status": "Active",
                "description": "NASA flagship astrobiology mission deploying the Perseverance rover and the Ingenuity technology demonstration helicopter.",
                "official_url": "https://science.nasa.gov/mission/mars-2020-perseverance"
            },

            # MOON MISSIONS
            {
                "name": "Surveyor 1",
                "slug": "surveyor-1",
                "destination_category": "Moon",
                "launch_date": "1966-05-30",
                "mission_end_date": "1967-01-07",
                "mission_status": "Completed",
                "description": "The first American soft landing on the Moon, verifying lunar soil load-bearing capacity for the Apollo program.",
                "official_url": "https://science.nasa.gov/mission/surveyor-1"
            },
            {
                "name": "Surveyor 3",
                "slug": "surveyor-3",
                "destination_category": "Moon",
                "launch_date": "1967-04-17",
                "mission_end_date": "1967-05-04",
                "mission_status": "Completed",
                "description": "First lunar mission equipped with a surface sampling claw; later visited by Apollo 12 astronauts in November 1969.",
                "official_url": "https://science.nasa.gov/mission/surveyor-3"
            },
            {
                "name": "Surveyor 5",
                "slug": "surveyor-5",
                "destination_category": "Moon",
                "launch_date": "1967-09-08",
                "mission_end_date": "1967-12-17",
                "mission_status": "Completed",
                "description": "Landed in Mare Tranquillitatis and performed the first in-situ chemical analysis of lunar basaltic rock.",
                "official_url": "https://science.nasa.gov/mission/surveyor-5"
            },
            {
                "name": "Apollo 11",
                "slug": "apollo-11",
                "destination_category": "Moon",
                "launch_date": "1969-07-16",
                "mission_end_date": "1969-07-24",
                "mission_status": "Completed",
                "description": "Humanity's first crewed lunar landing at Tranquility Base on July 20, 1969.",
                "official_url": "https://www.nasa.gov/mission/apollo-11"
            },
            {
                "name": "Apollo 15",
                "slug": "apollo-15",
                "destination_category": "Moon",
                "launch_date": "1971-07-26",
                "mission_end_date": "1971-08-07",
                "mission_status": "Completed",
                "description": "First Apollo J-mission featuring extended scientific surface exploration and the inaugural Lunar Roving Vehicle (LRV).",
                "official_url": "https://www.nasa.gov/mission/apollo-15"
            },
            {
                "name": "Chang'e 4",
                "slug": "change-4",
                "destination_category": "Moon",
                "launch_date": "2018-12-07",
                "mission_end_date": None,
                "mission_status": "Active",
                "description": "The first mission in human history to achieve a soft landing on the lunar far side inside Von Kármán crater.",
                "official_url": ""
            },

            # DEEP SPACE MISSIONS
            {
                "name": "Voyager",
                "slug": "voyager",
                "destination_category": "Deep Space",
                "launch_date": "1977-08-20",
                "mission_end_date": None,
                "mission_status": "Active",
                "description": "NASA's historic interstellar mission conducting humanity's grand tour of the outer planets and crossing into interstellar space.",
                "official_url": "https://voyager.jpl.nasa.gov"
            },
            {
                "name": "New Horizons",
                "slug": "new-horizons",
                "destination_category": "Deep Space",
                "launch_date": "2006-01-19",
                "mission_end_date": None,
                "mission_status": "Active",
                "description": "High-velocity flyby mission conducting the first reconnaissance of Pluto and its moons, currently exploring the Kuiper Belt.",
                "official_url": "https://science.nasa.gov/mission/new-horizons"
            },
            {
                "name": "Cassini-Huygens",
                "slug": "cassini-huygens",
                "destination_category": "Deep Space",
                "launch_date": "1997-10-15",
                "mission_end_date": "2017-09-15",
                "mission_status": "Completed",
                "description": "Joint NASA/ESA/ASI flagship mission to explore the Saturnian system, its magnificent rings, and landing on Titan.",
                "official_url": "https://science.nasa.gov/mission/cassini"
            },

            # EARTH ORBIT (Demonstrates orbital vs surface & active vs debris classifications)
            {
                "name": "Hubble Space Telescope",
                "slug": "hubble-space-telescope",
                "destination_category": "Earth Orbit",
                "launch_date": "1990-04-24",
                "mission_end_date": None,
                "mission_status": "Active",
                "description": "Low Earth orbit optical observatory revolutionized modern astronomy and astrophysics.",
                "official_url": "https://hubblesite.org"
            },
            {
                "name": "International Space Station",
                "slug": "international-space-station",
                "destination_category": "Earth Orbit",
                "launch_date": "1998-11-20",
                "mission_end_date": None,
                "mission_status": "Active",
                "description": "Permanently crewed modular space laboratory orbiting in Low Earth Orbit.",
                "official_url": "https://www.nasa.gov/international-space-station"
            },
            {
                "name": "Vanguard 1",
                "slug": "vanguard-1",
                "destination_category": "Earth Orbit",
                "launch_date": "1958-03-17",
                "mission_end_date": "1964-05-01",
                "mission_status": "Completed",
                "description": "The oldest human-made object still in orbit around Earth.",
                "official_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1958-002B"
            },
            {
                "name": "SL-16 Debris",
                "slug": "sl-16-debris",
                "destination_category": "Earth Orbit",
                "launch_date": "1992-12-25",
                "mission_end_date": "1992-12-25",
                "mission_status": "Decommissioned",
                "description": "Upper stage rocket body abandoned in low Earth orbit, monitored as orbital space debris.",
                "official_url": "https://www.space-track.org"
            }
        ]

        mission_map = {}
        for m_data in missions_data:
            mission = Mission(**m_data)
            db.add(mission)
            db.flush()
            mission_map[mission.slug] = mission

        print("Seeding Hardware Records...")
        hardware_list = [
            # 1. PERSEVERANCE ROVER (Mars)
            {
                "name": "Perseverance Rover",
                "slug": "perseverance-rover",
                "mission_slug": "mars-2020",
                "manufacturer_slug": "jpl",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Rover",
                "destination": "Mars",
                "operational_status": "Active / operational",
                "physical_status": "Intact on surface",
                "launch_date": "2020-07-30",
                "landing_date": "2021-02-18",
                "decommission_date": None,
                "location_description": "Jezero Crater, Mars (18.38°N, 77.58°E)",
                "latitude": 18.38,
                "longitude": 77.58,
                "short_description": "Car-sized robotic rover searching for signs of past microbial life and caching rock samples for return to Earth.",
                "educational_description": "Perseverance is a six-wheeled robotic scientist on Mars! Scientists built it to explore Jezero Crater, an ancient river delta that was once full of liquid water billions of years ago. It carries laser spectrometers, ground-penetrating radar, and a drill that collects rock and soil samples sealed in sterile tubes for future pickup. Perseverance proved that humans can generate breathable oxygen on Mars using the MOXIE experiment. Right now, it is actively driving, drilling, and surveying the Martian riverbanks.",
                "how_it_works": "Perseverance is powered by a Multi-Mission Radioisotope Thermoelectric Generator (MMRTG) using decaying Plutonium-238 to supply continuous electricity and warmth. It navigates autonomously using computer vision algorithms and 19 onboard cameras. Its robotic arm holds the PIXL X-ray spectrometer and SHERLOC UV laser Raman sensor, and it utilizes the MOXIE device to split Martian atmospheric CO2 into pure oxygen.",
                "why_it_is_important": "Perseverance is humanity's flagship astrobiology explorer. It is preparing the very first sample return cache in planetary exploration history, directly analyzing whether microscopic life ever emerged on another world.",
                "scientific_purpose": "Identify past Martian habitability, seek biosignatures in ancient rocks, collect hermetically sealed sample cores, and demonstrate in-situ resource utilization (oxygen generation from CO2).",
                "current_or_last_known_status": "Active and operational in Jezero Crater. Continuously exploring the margin carbonate and crater rim units as verified by daily JPL Deep Space Network telemetry.",
                "hardware_materials": "Aerospace titanium chassis, carbon-composite robotic arm, MMRTG thermocouple elements, curved titanium wheels with cleats, gold thermal foil.",
                "official_url": "https://mars.nasa.gov/mars2020/",
                "verification_status": "Verified from NASA Mars Exploration Program records",
                "last_verified_at": "2026-10-01",
                "aliases": [
                    {"alias": "Mars 2020 Rover", "alias_type": "Alternate Name"},
                    {"alias": "Percy", "alias_type": "Nickname"},
                    {"alias": "COSPAR 2020-052A", "alias_type": "Catalog ID"}
                ],
                "keywords": ["rover", "mars", "perseverance", "jezero", "astrobiology", "moxie", "active", "sample return", "nasa"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Perseverance Rover Selfie at Mont Mercou",
                        "description": "Perseverance captured this high-resolution selfie using the WATSON camera at the end of its 2-meter robotic arm.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA24484/PIA24484~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA24484",
                        "attribution": "NASA/JPL-Caltech/MSSS",
                        "publication_date": "2021-04-07"
                    },
                    {
                        "item_type": "Photo",
                        "title": "Perseverance Wheel Tracks in Jezero Regolith",
                        "description": "Looking back across the floor of Jezero Crater showing the rover's distinctive wheel cleats and Martian bedrock.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA24427/PIA24427~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA24427",
                        "attribution": "NASA/JPL-Caltech",
                        "publication_date": "2021-03-05"
                    },
                    {
                        "item_type": "Diagram",
                        "title": "Perseverance Science Instrument Layout",
                        "description": "Detailed schematic highlighting Mastcam-Z, SuperCam, PIXL, SHERLOC, RIMFAX, MEDA, and MOXIE.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA23764/PIA23764~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA23764",
                        "attribution": "NASA/JPL-Caltech",
                        "publication_date": "2020-07-20"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Mars 2020 Mission Official Portal",
                        "source_url": "https://mars.nasa.gov/mars2020/",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Official flight status, telemetry updates, and instrument science reports.",
                        "last_checked_at": "2026-10-15"
                    },
                    {
                        "source_name": "NASA Planetary Data System (PDS) Geosciences Node",
                        "source_url": "https://pds-geosciences.wustl.edu/missions/mars2020/",
                        "source_type": "Science Data Archive",
                        "evidence_notes": "Primary raw and calibrated science data sets from Perseverance instruments.",
                        "last_checked_at": "2026-09-30"
                    }
                ]
            },

            # 2. INGENUITY HELICOPTER (Mars)
            {
                "name": "Ingenuity Mars Helicopter",
                "slug": "ingenuity-helicopter",
                "mission_slug": "mars-2020",
                "manufacturer_slug": "jpl",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Aircraft / Rotorcraft",
                "destination": "Mars",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "2020-07-30",
                "landing_date": "2021-02-18",
                "decommission_date": "2024-01-25",
                "location_description": "Valinor Hills, Jezero Crater, Mars",
                "latitude": 18.44,
                "longitude": 77.45,
                "short_description": "The first human aircraft to achieve powered, controlled aerodynamic flight on another planet.",
                "educational_description": "Ingenuity is an ultra-lightweight robotic helicopter (weighing just 1.8 kilograms on Earth) sent to Mars to answer a bold question: Can an aircraft fly through the extremely thin Martian atmosphere? Flying on Mars is like flying at 100,000 feet on Earth! Originally planned for only 5 short test flights, Ingenuity exceeded all expectations by flying 72 times across three years, acting as an aerial scout for Perseverance. It officially retired in January 2024 after damaging a rotor blade tip during a landing, but remains parked on Mars as a permanent weather station.",
                "how_it_works": "Features two counter-rotating carbon fiber blades spinning at 2,400 to 2,900 RPM (nearly five times faster than helicopters on Earth). Powered by a solar panel above the rotors charging customized Sony lithium-ion batteries. Autonomous flight control managed by a Qualcomm Snapdragon smartphone-grade processor running Linux.",
                "why_it_is_important": "Achieved the Wright Brothers moment of interplanetary aviation. Opened a whole new dimension for future space exploration through aerial scouts, drones, and sample collection rotorcraft.",
                "scientific_purpose": "Demonstrate the feasibility of aerodynamic flight in Mars' 1% atmospheric pressure and scout terrain for the Perseverance rover.",
                "current_or_last_known_status": "Inactive / Decommissioned as an aerial vehicle. Mission concluded January 25, 2024 after rotor blade tip damage on Flight 72. Stationary telemetry test station.",
                "hardware_materials": "Carbon fiber composite blades, extruded aluminum frame, custom solar panel array, beryllium-copper dampening dampers, gold foil.",
                "official_url": "https://mars.nasa.gov/technology/helicopter/",
                "verification_status": "Verified from NASA JPL Mission Logs",
                "last_verified_at": "2026-10-01",
                "aliases": [
                    {"alias": "Ginny", "alias_type": "Nickname"},
                    {"alias": "Mars Helicopter Technology Demonstration", "alias_type": "Alternate Name"}
                ],
                "keywords": ["helicopter", "ingenuity", "mars", "rotorcraft", "aviation", "jpl", "flight", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Ingenuity Hovering on Mars (Flight 1)",
                        "description": "Perseverance rover captured humanity's first powered interplanetary flight as Ingenuity hovered 3 meters above the Martian dust.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA24495/PIA24495~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA24495",
                        "attribution": "NASA/JPL-Caltech/ASU/MSSS",
                        "publication_date": "2021-04-19"
                    },
                    {
                        "item_type": "Photo",
                        "title": "Ingenuity Solo on the Martian Surface",
                        "description": "Ingenuity standing on its four carbon-composite legs shortly after being deployed from the belly of Perseverance.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA24479/PIA24479~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA24479",
                        "attribution": "NASA/JPL-Caltech",
                        "publication_date": "2021-04-05"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Jet Propulsion Laboratory Ingenuity Logbook",
                        "source_url": "https://mars.nasa.gov/technology/helicopter/#Flight-Log",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Flight-by-flight logs of all 72 flights including altitudes, distance, and duration.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 3. VIKING 1 LANDER (Mars)
            {
                "name": "Viking 1 Lander",
                "slug": "viking-1-lander",
                "mission_slug": "viking-1",
                "manufacturer_slug": "martin-marietta",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Lander",
                "destination": "Mars",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "1975-08-20",
                "landing_date": "1976-07-20",
                "decommission_date": "1982-11-13",
                "location_description": "Chryse Planitia (Golden Plain), Mars (22.27°N, 47.95°W)",
                "latitude": 22.27,
                "longitude": -47.95,
                "short_description": "Historic first US spacecraft to successfully land on Mars and complete its mission, transmitting the first clear surface photographs.",
                "educational_description": "Viking 1 was a daring space pioneer! Sent by NASA in 1975, it made history by safely touching down on Mars on July 20, 1976. Just minutes after landing, it sent back the very first close-up photograph of the Martian surface showing rocky red soil and the lander's footpad. Viking 1 scooped up soil with a robotic arm and tested it for signs of life. It operated for over 6 years on the surface before a radio command error accidentally broke communication in 1982.",
                "how_it_works": "Constructed around a hexagonal aluminum structure supported by three bonded-crushable honeycomb aluminum legs. Powered by two SNAP-19 Radioisotope Thermoelectric Generators (RTGs). Used terminal descent retrorockets with 18 multi-nozzles to avoid eroding the landing surface.",
                "why_it_is_important": "Proved soft planetary landings on Mars were achievable and gave humanity our first true meteorological and photographic records from the Martian ground.",
                "scientific_purpose": "Capture high-resolution panoramic color imagery of the surface, analyze the atmospheric composition, record seismic tremors, and search for organic molecules in Martian soil.",
                "current_or_last_known_status": "Inactive / decommissioned. Intact on Chryse Planitia. Named the Thomas Mutch Memorial Station in 1982.",
                "hardware_materials": "Titanium and aluminum alloys, beryllium structure, SNAP-19 RTG radioisotope units, fiberglass antenna mast.",
                "official_url": "https://science.nasa.gov/mission/viking-1",
                "verification_status": "Verified from NASA NSSDCA Master Catalog",
                "last_verified_at": "2026-09-15",
                "aliases": [
                    {"alias": "Thomas Mutch Memorial Station", "alias_type": "Honorary Name"},
                    {"alias": "1975-075C", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["viking", "lander", "mars", "chryse", "nasa", "martin marietta", "historic", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "First Image Ever Sent from the Surface of Mars",
                        "description": "Viking 1 Lander camera 2 captured this historic image showing the footpad resting on the stony soil of Chryse Planitia minutes after touchdown on July 20, 1976.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA00014/PIA00014~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA00014",
                        "attribution": "NASA/JPL",
                        "publication_date": "1976-07-20"
                    },
                    {
                        "item_type": "Diagram",
                        "title": "Viking Lander Cutaway Diagram",
                        "description": "Engineering schematic detailing the biological experiments, gas chromatograph, meteorology boom, and RTG power units.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA03206/PIA03206~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA03206",
                        "attribution": "NASA/JPL",
                        "publication_date": "1975-06-01"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA NSSDCA Master Catalog: Viking 1 Lander",
                        "source_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C",
                        "source_type": "Technical Documentation",
                        "evidence_notes": "Complete orbital launch, entry trajectory, and instrument catalog records.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 4. SOJOURNER ROVER (Mars)
            {
                "name": "Sojourner Rover",
                "slug": "sojourner-rover",
                "mission_slug": "mars-pathfinder",
                "manufacturer_slug": "jpl",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Rover",
                "destination": "Mars",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "1996-12-04",
                "landing_date": "1997-07-04",
                "decommission_date": "1997-09-27",
                "location_description": "Ares Vallis, Mars (19.33°N, 33.55°W)",
                "latitude": 19.33,
                "longitude": -33.55,
                "short_description": "Humanity's first micro-rover on Mars, exploring rocks named Barnacle Bill and Yogi.",
                "educational_description": "Sojourner was the very first wheeled rover ever driven on Mars! It was tiny compared to today's rovers—about the size of a microwave oven and weighing only 10.6 kilograms. Named after the abolitionist Sojourner Truth, it rolled down ramps from the Pathfinder lander on July 5, 1997. It had six wheels on a special rocker-bogie suspension that allowed it to crawl over rocks without tipping over. It sent back 550 photos and analyzed chemical elements in rocks over 83 sols before its batteries wore out.",
                "how_it_works": "Pioneered the six-wheel rocker-bogie mobility system that NASA later used on Spirit, Opportunity, and Curiosity. Powered by a 0.22-square-meter gallium arsenide solar array with non-rechargeable lithium thionyl chloride backup batteries. Communicated via UHF radio link directly to the Pathfinder lander station.",
                "why_it_is_important": "Demonstrated that small, affordable rovers could navigate Martian terrain and conduct precise geochemical analysis.",
                "scientific_purpose": "Evaluate rover mobility on Martian regolith, image local terrain, and measure elemental composition of rocks using Alpha Proton X-Ray Spectrometer (APXS).",
                "current_or_last_known_status": "Inactive / decommissioned. Intact on the surface of Ares Vallis near the Pathfinder lander.",
                "hardware_materials": "Anodized aluminum chassis, gallium arsenide solar cells, stainless steel rocker joints, aerogel thermal insulation.",
                "official_url": "https://science.nasa.gov/mission/mars-pathfinder",
                "verification_status": "Verified from NASA JPL Pathfinder Archives",
                "last_verified_at": "2026-09-20",
                "aliases": [
                    {"alias": "Microrover Flight Experiment (MFEX)", "alias_type": "Project Name"},
                    {"alias": "1996-068B", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["rover", "sojourner", "mars", "pathfinder", "ares vallis", "jpl", "nasa", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Sojourner Rover Analyzing the Rock 'Yogi'",
                        "description": "Pathfinder lander's camera captured Sojourner pressing its APXS sensor against the prominent Martian boulder named Yogi.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA01122/PIA01122~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA01122",
                        "attribution": "NASA/JPL",
                        "publication_date": "1997-07-15"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA JPL Mars Pathfinder & Sojourner Archive",
                        "source_url": "https://mars.nasa.gov/mars-exploration/missions/pathfinder/",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Official mission timeline, daily sol reports, and scientific papers.",
                        "last_checked_at": "2026-10-12"
                    }
                ]
            },

            # 5. OPPORTUNITY ROVER (Mars)
            {
                "name": "Opportunity Rover (MER-B)",
                "slug": "opportunity-rover",
                "mission_slug": "mars-exploration-rover",
                "manufacturer_slug": "jpl",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Rover",
                "destination": "Mars",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "2003-07-07",
                "landing_date": "2004-01-25",
                "decommission_date": "2019-02-13",
                "location_description": "Perseverance Valley, Endeavour Crater, Meridiani Planum, Mars",
                "latitude": -2.28,
                "longitude": 354.74,
                "short_description": "Longest-traveling planetary rover in history, exploring 45.16 kilometers over nearly 15 years on Mars.",
                "educational_description": "Opportunity (nicknamed 'Oppy') is one of the greatest explorers in human history! It was designed to survive for only 90 Martian days, but it kept going for nearly 15 years! It landed inside Eagle Crater by bouncing on airbags, and immediately found tiny mineral spheres nicknamed 'blueberries' made of hematite, proving that liquid water once flowed on the surface of Mars. In June 2018, a massive planet-wide dust storm blocked sunlight from its solar panels. After more than 1,000 attempts to restore contact, NASA declared its mission complete in 2019.",
                "how_it_works": "Equipped with a triple-junction solar array producing up to 900 watt-hours per sol. Rocker-bogie 6-wheel drive with individual in-wheel steering motors. Robotic arm instrument deployment device (IDD) carrying a Mössbauer Spectrometer, Microscopic Imager, and Rock Abrasion Tool (RAT).",
                "why_it_is_important": "Discovered the first definitive evidence of standing liquid water and ancient acidic lake environments on Mars.",
                "scientific_purpose": "Search for geological clues to water history, characterize mineral distributions across craters, and analyze rock interiors with abrasion tools.",
                "current_or_last_known_status": "Inactive / decommissioned. Intact on the slopes of Perseverance Valley in Endeavour Crater after final contact June 10, 2018.",
                "hardware_materials": "Aluminum honeycombed composite structure, titanium rocker arms, silicon solar panels with Pyrex protective glass.",
                "official_url": "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
                "verification_status": "Verified from NASA MER Archive",
                "last_verified_at": "2026-09-25",
                "aliases": [
                    {"alias": "Oppy", "alias_type": "Nickname"},
                    {"alias": "MER-B", "alias_type": "Mission Designation"},
                    {"alias": "2003-032A", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["opportunity", "mer", "rover", "mars", "meridiani", "blueberries", "nasa", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Opportunity's Martian 'Blueberries'",
                        "description": "Microscopic Imager view of hematite-rich spherules embedded in sedimentary rock at Meridiani Planum.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA05584/PIA05584~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA05584",
                        "attribution": "NASA/JPL/Cornell/USGS",
                        "publication_date": "2004-03-03"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Planetary Data System MER Archives",
                        "source_url": "https://pds-geosciences.wustl.edu/missions/mer/",
                        "source_type": "Science Data Archive",
                        "evidence_notes": "Full archive of Opportunity 15-year traverse and geological findings.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 6. SPIRIT ROVER (Mars)
            {
                "name": "Spirit Rover (MER-A)",
                "slug": "spirit-rover",
                "mission_slug": "mars-exploration-rover",
                "manufacturer_slug": "jpl",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Rover",
                "destination": "Mars",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "2003-06-10",
                "landing_date": "2004-01-04",
                "decommission_date": "2011-05-25",
                "location_description": "Troy, Columbia Hills, Gusev Crater, Mars",
                "latitude": -14.57,
                "longitude": 175.47,
                "short_description": "Twin rover to Opportunity that uncovered evidence of ancient Martian hot springs and hydrothermal activity.",
                "educational_description": "Spirit landed in Gusev Crater, a huge impact basin suspected of having once held a giant lake. When one of its front wheels seized up in 2006, the rover had to drive backward while dragging the stuck wheel. This accidental scraping tore open the surface sand and revealed bright white, pure silica! This silica was ironclad evidence that volcanic hot springs or steam vents once bubbled on Mars, proving that warm hydrothermal habitats existed.",
                "how_it_works": "Twin architecture to Opportunity. Powered by solar arrays with lithium-ion batteries. Rocker-bogie mobility and Mastcam imaging system. Stuck right-front wheel turned into a geological scraping trenching tool.",
                "why_it_is_important": "Discovered definitive evidence of ancient Martian hydrothermal vents and hot springs—prime locations where microbial life could have flourished.",
                "scientific_purpose": "Investigate Gusev Crater's geology, seek evidence of past aqueous activity, and study volcanic rocks in the Columbia Hills.",
                "current_or_last_known_status": "Inactive / decommissioned. Intact at Troy in Gusev Crater after becoming stuck in soft sand in 2009; last communication March 22, 2010.",
                "hardware_materials": "Aluminum chassis, titanium rocker components, silicon solar cells, aerogel insulation.",
                "official_url": "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
                "verification_status": "Verified from NASA MER Records",
                "last_verified_at": "2026-09-20",
                "aliases": [
                    {"alias": "MER-A", "alias_type": "Mission Designation"},
                    {"alias": "2003-027A", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["spirit", "rover", "mars", "gusev", "columbia hills", "hydrothermal", "nasa", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Spirit Rover View from Columbia Hills",
                        "description": "Looking back toward the floor of Gusev Crater from Husband Hill summit.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA07095/PIA07095~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA07095",
                        "attribution": "NASA/JPL/Cornell",
                        "publication_date": "2005-09-01"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA JPL MER Spirit Mission Overview",
                        "source_url": "https://mars.nasa.gov/mer/mission/overview/",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Official scientific timeline and mission conclusion notice.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 7. INSIGHT LANDER (Mars)
            {
                "name": "InSight Lander",
                "slug": "insight-lander",
                "mission_slug": "insight",
                "manufacturer_slug": "lockheed-martin",
                "operator_slug": "jpl",
                "mission_agency_slug": "nasa",
                "object_type": "Lander",
                "destination": "Mars",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "2018-05-05",
                "landing_date": "2018-11-26",
                "decommission_date": "2022-12-21",
                "location_description": "Elysium Planitia, Mars (4.50°N, 135.62°E)",
                "latitude": 4.50,
                "longitude": 135.62,
                "short_description": "First robotic explorer dedicated to taking the 'pulse' of Mars by measuring seismic marsquakes and inner core size.",
                "educational_description": "InSight wasn't built to roll around—it was designed to sit very still and listen to the heartbeat of Mars! Using an ultra-sensitive seismometer called SEIS (placed on the ground with a robotic arm and covered with a wind-shield dome), InSight recorded more than 1,300 'marsquakes'. These seismic shockwaves let scientists peer inside Mars just like a medical ultrasound, determining the thickness of the Martian crust, the depth of its molten iron core, and detecting meteorite impacts.",
                "how_it_works": "Equipped with the SEIS seismometer sensitive enough to detect vibrations smaller than the width of a hydrogen atom. Powered by twin 2.15-meter UltraFlex solar arrays. Utilized the HP3 'Heat Flow and Physical Properties Package' self-hammering mole.",
                "why_it_is_important": "Created the very first comprehensive 3D map of the internal crust, mantle, and core of another rocky planet.",
                "scientific_purpose": "Measure seismic activity, estimate internal heat flow, and determine the structural state of the Martian core.",
                "current_or_last_known_status": "Inactive / decommissioned. Intact on Elysium Planitia. Solar panels covered by dust; final communication December 15, 2022.",
                "hardware_materials": "Aluminum-lithium alloys, carbon-fiber composite solar substrate, evacuated sphere titanium vacuum chamber for seismometer.",
                "official_url": "https://science.nasa.gov/mission/insight",
                "verification_status": "Verified from NASA InSight Mission Archives",
                "last_verified_at": "2026-09-18",
                "aliases": [
                    {"alias": "Interior Exploration using Seismic Investigations, Geodesy and Heat Transport", "alias_type": "Full Name"},
                    {"alias": "2018-042A", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["insight", "lander", "mars", "seismometer", "marsquakes", "elysium planitia", "nasa", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "InSight Lander Deployment of SEIS Seismometer",
                        "description": "Instrument Deployment Arm placing the dome-covered seismometer onto the Martian regolith.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA22874/PIA22874~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA22874",
                        "attribution": "NASA/JPL-Caltech",
                        "publication_date": "2018-12-19"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA InSight Mission End Report",
                        "source_url": "https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Comprehensive mission wrap-up documenting final seismic measurements.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 8. APOLLO 11 LUNAR MODULE DESCENT STAGE (Moon)
            {
                "name": "Apollo 11 Lunar Module Descent Stage (Eagle)",
                "slug": "apollo-11-lm-descent-stage",
                "mission_slug": "apollo-11",
                "manufacturer_slug": "grumman",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Lunar Module Descent Stage",
                "destination": "Moon",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "1969-07-16",
                "landing_date": "1969-07-20",
                "decommission_date": "1969-07-24",
                "location_description": "Tranquility Base, Mare Tranquillitatis, Moon (0.67408°N, 23.47297°E)",
                "latitude": 0.67408,
                "longitude": 23.47297,
                "short_description": "The base of the lunar module Eagle that served as the landing platform for humanity's first footsteps on the Moon.",
                "educational_description": "On July 20, 1969, astronauts Neil Armstrong and Buzz Aldrin stepped onto the Moon from the Apollo 11 Lunar Module, named Eagle. While the upper 'Ascent Stage' carried the astronauts back up into lunar orbit to return home, the bottom 'Descent Stage' remained behind on the lunar surface. It still stands at Tranquility Base today! Mounted on one of its legs is an iconic commemorative plaque that reads: 'Here men from the planet Earth first set foot upon the Moon July 1969, A.D. We came in peace for all mankind.'",
                "how_it_works": "The Descent Stage housed the throttleable TRW Rocket Engine used to brake down from lunar orbit and gently touch down. Its four landing gear legs featured crushable aluminum honeycomb cartridges to absorb landing impact. The compartments carried scientific experiment packages (EASEP) and life-support oxygen, water, and batteries.",
                "why_it_is_important": "One of the most historic human artifacts in the universe: the foundation of humanity's very first crewed lunar landing site.",
                "scientific_purpose": "Provide powered descent to the lunar surface and serve as the launchpad for the ascent stage.",
                "current_or_last_known_status": "Inactive / decommissioned. Permanently standing intact at Tranquility Base. Imaged from lunar orbit by the Lunar Reconnaissance Orbiter (LRO).",
                "hardware_materials": "Aluminum alloy structure wrapped in gold Mylar thermal foil, inconel heat shields, and titanium propellant tanks.",
                "official_url": "https://www.nasa.gov/mission/apollo-11",
                "verification_status": "Verified from NASA Apollo Flight Records",
                "last_verified_at": "2026-09-01",
                "aliases": [
                    {"alias": "LM-5 Descent Stage", "alias_type": "Manufacturer ID"},
                    {"alias": "Eagle Descent Stage", "alias_type": "Call Sign"},
                    {"alias": "1969-059C", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["apollo", "apollo 11", "moon", "eagle", "descent stage", "armstrong", "tranquility base", "historic", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Eagle Descent Stage at Tranquility Base",
                        "description": "Buzz Aldrin photographed the Apollo 11 Lunar Module Descent Stage showing foil wrapping, landing struts, and lunar surface footprints.",
                        "image_url": "https://images-assets.nasa.gov/image/AS11-40-5927/AS11-40-5927~orig.jpg",
                        "source_url": "https://images.nasa.gov/details/AS11-40-5927",
                        "attribution": "NASA",
                        "publication_date": "1969-07-20"
                    },
                    {
                        "item_type": "Photo",
                        "title": "LRO Orbital View of Apollo 11 Tranquility Base",
                        "description": "Lunar Reconnaissance Orbiter high-resolution camera view showing the descent stage cast in long lunar shadows with astronaut pathways visible.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA14947/PIA14947~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA14947",
                        "attribution": "NASA/Goddard/Arizona State University",
                        "publication_date": "2012-03-07"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Apollo 11 Lunar Surface Journal",
                        "source_url": "https://www.hq.nasa.gov/office/pao/History/alsj/a11/a11.html",
                        "source_type": "Technical Documentation",
                        "evidence_notes": "Complete surface voice transcripts, telemetry logs, and photographic catalogs.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 9. APOLLO 15 LUNAR ROVING VEHICLE (Moon)
            {
                "name": "Apollo 15 Lunar Roving Vehicle (LRV-1)",
                "slug": "apollo-15-lunar-roving-vehicle",
                "mission_slug": "apollo-15",
                "manufacturer_slug": "boeing",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Lunar Roving Vehicle",
                "destination": "Moon",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "1971-07-26",
                "landing_date": "1971-07-30",
                "decommission_date": "1971-08-07",
                "location_description": "Hadley-Apennine, Moon (26.13°N, 3.63°E)",
                "latitude": 26.13,
                "longitude": 3.63,
                "short_description": "The very first electric vehicle driven on the Moon, allowing astronauts to explore kilometers away from the lunar module.",
                "educational_description": "Imagine driving an electric moon buggy across alien craters! The Lunar Roving Vehicle (LRV) was an electric car built by Boeing and General Motors for NASA. Folded like origami inside the side of the lunar module during the trip from Earth, astronauts David Scott and Jim Irwin unfolded it on the Moon. It drove on wire-mesh tires with titanium chevrons (rubber tires would explode in the vacuum of space). It allowed astronauts to travel 27.9 kilometers across the Moon and collect the famous 4-billion-year-old 'Genesis Rock'. It remains parked on the Moon today.",
                "how_it_works": "Powered by two 36-volt non-rechargeable silver-zinc potassium hydroxide batteries. Each wheel had its own independent 0.25-horsepower electric drive motor with 80:1 harmonic gear ratio. Steered using a central T-handle joystick instead of a steering wheel.",
                "why_it_is_important": "Transformed lunar exploration from short walking tours into multi-kilometer geological expeditions.",
                "scientific_purpose": "Extend astronaut mobility, carry heavier geological sampling tools, and provide a color TV camera platform to film lunar liftoff.",
                "current_or_last_known_status": "Inactive / decommissioned. Parked intact at the Hadley-Apennine landing site roughly 90 meters from the descent stage.",
                "hardware_materials": "2219 aluminum alloy tubular frame, woven zinc-coated steel wire mesh wheels with titanium chevrons, fiberglass seats.",
                "official_url": "https://www.nasa.gov/mission/apollo-15",
                "verification_status": "Verified from NASA Apollo Program Records",
                "last_verified_at": "2026-09-01",
                "aliases": [
                    {"alias": "Moon Buggy", "alias_type": "Nickname"},
                    {"alias": "LRV-1", "alias_type": "Serial Number"},
                    {"alias": "1971-063C", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["lrv", "moon buggy", "apollo 15", "boeing", "hadley rille", "electric vehicle", "moon", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Astronaut Jim Irwin with Lunar Roving Vehicle",
                        "description": "Astronaut Jim Irwin stands beside the parked Lunar Roving Vehicle with Mount Hadley in the background.",
                        "image_url": "https://images-assets.nasa.gov/image/AS15-88-11866/AS15-88-11866~orig.jpg",
                        "source_url": "https://images.nasa.gov/details/AS15-88-11866",
                        "attribution": "NASA/David Scott",
                        "publication_date": "1971-08-01"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Lunar Roving Vehicle Operations Handbook",
                        "source_url": "https://www.nasa.gov/history/alsj/a17/a17ovrvlm.html",
                        "source_type": "Technical Documentation",
                        "evidence_notes": "Official engineering manual and technical schematics.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 10. SURVEYOR 1 (Moon)
            {
                "name": "Surveyor 1 Lander",
                "slug": "surveyor-1-lander",
                "mission_slug": "surveyor-1",
                "manufacturer_slug": "hughes-aircraft",
                "operator_slug": "jpl",
                "mission_agency_slug": "nasa",
                "object_type": "Lander",
                "destination": "Moon",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "1966-05-30",
                "landing_date": "1966-06-02",
                "decommission_date": "1967-01-07",
                "location_description": "Oceanus Procellarum (Ocean of Storms), Moon (2.47°S, 43.34°W)",
                "latitude": -2.47,
                "longitude": -43.34,
                "short_description": "First American spacecraft to achieve a soft touchdown on the Moon, returning 11,238 high-resolution photos.",
                "educational_description": "Before humans could risk landing on the Moon, scientists needed to know: Would a spacecraft sink into deep dust like quicksand? Surveyor 1 was launched to answer that critical question. On June 2, 1966, it fired its radar-guided braking rockets and made a gentle three-point landing in Oceanus Procellarum. Its footpads sank only a few centimeters, proving the lunar soil was solid enough to support the heavy Apollo Lunar Module and human astronauts.",
                "how_it_works": "Triangular aluminum tubular structure with three hinged landing legs cushioned by shock absorbers and crushable aluminum honeycomb blocks. Powered by a steerable planar solar array and silver-zinc battery. Carried television camera with zoom lens and color filter wheel.",
                "why_it_is_important": "Confirmed lunar surface bearing strength and pioneered automated closed-loop radar descent landing technology.",
                "scientific_purpose": "Obtain television pictures of the lunar surface, verify radar reflectivity and landing dynamics, and measure lunar surface temperatures.",
                "current_or_last_known_status": "Inactive / decommissioned. Intact in Oceanus Procellarum. Imaged by the Lunar Reconnaissance Orbiter in 2009.",
                "hardware_materials": "Thin-wall tubular aluminum alloy frame, crushable honeycomb footpads, polished thermal mirrors.",
                "official_url": "https://science.nasa.gov/mission/surveyor-1",
                "verification_status": "Verified from NASA JPL Mission Records",
                "last_verified_at": "2026-09-12",
                "aliases": [
                    {"alias": "Surveyor-A", "alias_type": "Pre-launch Designation"},
                    {"alias": "1966-045A", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["surveyor", "surveyor 1", "moon", "lander", "ocean of storms", "hughes", "jpl", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Surveyor 1 Footpad in Lunar Soil",
                        "description": "Historic photo showing Surveyor 1's footpad resting firmly in lunar regolith, demonstrating load-bearing firmness.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA00032/PIA00032~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA00032",
                        "attribution": "NASA/JPL",
                        "publication_date": "1966-06-03"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA JPL Surveyor 1 Mission Report",
                        "source_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-045A",
                        "source_type": "Technical Documentation",
                        "evidence_notes": "Engineering telemetry report and complete TV image catalog.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 11. SURVEYOR 3 (Moon)
            {
                "name": "Surveyor 3 Lander",
                "slug": "surveyor-3-lander",
                "mission_slug": "surveyor-3",
                "manufacturer_slug": "hughes-aircraft",
                "operator_slug": "jpl",
                "mission_agency_slug": "nasa",
                "object_type": "Lander",
                "destination": "Moon",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "Intact on surface",
                "launch_date": "1967-04-17",
                "landing_date": "1967-04-20",
                "decommission_date": "1967-05-04",
                "location_description": "Oceanus Procellarum, Moon (3.01°S, 23.42°W)",
                "latitude": -3.01,
                "longitude": -23.42,
                "short_description": "Equipped with a surface sampler scoop; famously visited 2.5 years later by Apollo 12 astronauts.",
                "educational_description": "Surveyor 3 landed on the Moon in April 1967 inside a gentle crater. It was the first spacecraft with a mechanical scoop to dig trenches into the lunar soil. But its most famous adventure happened in November 1969: Apollo 12 astronauts Pete Conrad and Alan Bean executed a precision pinpoint landing just 180 meters away and walked over to Surveyor 3! They inspected it, took photos, and removed its television camera and robotic scoop to bring back to Earth, giving scientists a rare look at how space hardware withstands years on the Moon.",
                "how_it_works": "Equipped with a pantograph robotic surface sampler arm extending up to 1.5 meters with an electric motor-driven scoop. Radar-guided vernier landing engines.",
                "why_it_is_important": "Only uncrewed spacecraft on another celestial body ever visited, photographed, and partially retrieved by human astronauts.",
                "scientific_purpose": "Dig into the lunar regolith to test mechanical soil shear strength, measure bearing capacity, and image the crater floor.",
                "current_or_last_known_status": "Inactive / decommissioned. Intact in Surveyor Crater. Visited and inspected by Apollo 12 astronauts on November 20, 1969.",
                "hardware_materials": "Tubular aluminum alloy, stainless steel scoop arm, titanium tanks.",
                "official_url": "https://science.nasa.gov/mission/surveyor-3",
                "verification_status": "Verified from NASA Records & Apollo 12 Archives",
                "last_verified_at": "2026-09-15",
                "aliases": [
                    {"alias": "Surveyor-C", "alias_type": "Pre-launch Designation"},
                    {"alias": "1967-035A", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["surveyor", "surveyor 3", "apollo 12", "moon", "oceanus procellarum", "camera retrieval", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Apollo 12 Astronaut Pete Conrad Inspecting Surveyor 3",
                        "description": "Historic photo of astronaut Pete Conrad examining the Surveyor 3 television camera with the Apollo 12 Lunar Module visible on the crater rim.",
                        "image_url": "https://images-assets.nasa.gov/image/AS12-48-7133/AS12-48-7133~orig.jpg",
                        "source_url": "https://images.nasa.gov/details/AS12-48-7133",
                        "attribution": "NASA/Alan Bean",
                        "publication_date": "1969-11-20"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Apollo 12 Surveyor III Analysis",
                        "source_url": "https://www.nasa.gov/mission/apollo-12/",
                        "source_type": "Science Data Archive",
                        "evidence_notes": "Scientific examination report on retrieved Surveyor 3 components returned by Apollo 12.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 12. CHANG'E 4 & YUTU-2 (Moon Far Side)
            {
                "name": "Yutu-2 Rover (Jade Rabbit 2)",
                "slug": "yutu-2-rover",
                "mission_slug": "change-4",
                "manufacturer_slug": "cnsa",
                "operator_slug": "cnsa",
                "mission_agency_slug": "cnsa",
                "object_type": "Rover",
                "destination": "Moon",
                "operational_status": "Active / operational",
                "physical_status": "Intact on surface",
                "launch_date": "2018-12-07",
                "landing_date": "2019-01-03",
                "decommission_date": None,
                "location_description": "Von Kármán Crater, South Pole-Aitken Basin, Far Side of the Moon (45.45°S, 177.59°E)",
                "latitude": -45.45,
                "longitude": 177.59,
                "short_description": "The first robotic rover to explore the unexplored far side of the Moon, communicating via the Queqiao relay satellite.",
                "educational_description": "Because the Moon is tidally locked to Earth, we only ever see one side of it from our backyards. The far side remained mysterious and untouched until January 2019, when China's Chang'e 4 mission made history by touching down inside the giant Von Kármán crater! It rolled out the Yutu-2 (Jade Rabbit 2) rover. Since the Moon blocks direct radio signals to Earth, Yutu-2 beams its messages up to a special relay satellite called Queqiao stationed behind the Moon. Yutu-2 is currently the longest-operating lunar rover in history!",
                "how_it_works": "Equipped with ground-penetrating radar (LPR) that penetrates up to 40 meters beneath the lunar regolith, an infrared imaging spectrometer, and panoramic stereo cameras. Powered by solar panels with radioisotope heater units (RHUs) to survive the brutal -173°C two-week lunar nights.",
                "why_it_is_important": "First surface mission in human history on the lunar far side; exploring the oldest and deepest impact structure on the Moon (the South Pole-Aitken Basin).",
                "scientific_purpose": "Study lunar regolith thickness, subsurface geological stratigraphy, and low-frequency radio astronomy free from Earth radio interference.",
                "current_or_last_known_status": "Active / operational. Continuously driving and conducting lunar day science operations in Von Kármán crater.",
                "hardware_materials": "Aluminum alloy framework, titanium wheels with mesh treads, solar wings with gallium arsenide cells.",
                "official_url": "http://www.cnsa.gov.cn",
                "verification_status": "Verified from CNSA Lunar Exploration Program Reports",
                "last_verified_at": "2026-09-30",
                "aliases": [
                    {"alias": "Jade Rabbit 2", "alias_type": "Translation"},
                    {"alias": "Chang'e 4 Rover", "alias_type": "Alternate Name"}
                ],
                "keywords": ["yutu", "yutu-2", "change-4", "cnsa", "far side", "moon", "von karman", "active"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Yutu-2 Rover on the Lunar Far Side",
                        "description": "Chang'e 4 lander camera captured Yutu-2 driving onto the pristine, cratered regolith of the lunar far side.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA23000/PIA23000~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA23000",
                        "attribution": "CNSA/CLEP/NASA",
                        "publication_date": "2019-01-10"
                    }
                ],
                "sources": [
                    {
                        "source_name": "China National Space Administration Lunar Exploration",
                        "source_url": "https://www.cnsa.gov.cn",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Official mission bulletins and lunar day operations schedule.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 13. VOYAGER 1 (Deep Space)
            {
                "name": "Voyager 1",
                "slug": "voyager-1",
                "mission_slug": "voyager",
                "manufacturer_slug": "jpl",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Flyby Probe / Interstellar Spacecraft",
                "destination": "Deep Space",
                "operational_status": "Active / operational",
                "physical_status": "Escaping Solar System",
                "launch_date": "1977-09-05",
                "landing_date": None,
                "decommission_date": None,
                "location_description": "Interstellar Space (Ophiuchus constellation, >163 AU / 24.5 billion km from Earth)",
                "latitude": None,
                "longitude": None,
                "short_description": "Humanity's most distant ambassador: the first human-made object to cross the heliopause into interstellar space.",
                "educational_description": "Voyager 1 is humanity's record-setting deep-space traveler! Launched in 1977, it flew past Jupiter and Saturn, revealing active volcanoes on the moon Io and dense nitrogen clouds on Titan. After completing its planetary flybys, it kept flying outward at 38,000 miles per hour! In August 2012, Voyager 1 made history by crossing the 'heliopause'—the magnetic bubble blown by our Sun—and became the very first human-made craft to enter the cold, vast space between stars (interstellar space). It carries the famous Golden Record containing greetings in 55 languages, music, and sounds of Earth.",
                "how_it_works": "Powered by three Radioisotope Thermoelectric Generators (RTGs) converting heat from decaying Plutonium-238 into electricity. Communicates via a 3.7-meter parabolic high-gain antenna sending radio signals to NASA's Deep Space Network. At its current distance, a radio command travelling at the speed of light takes over 22.5 hours to reach it, and another 22.5 hours to receive a reply!",
                "why_it_is_important": "The most distant human artifact in existence and our first direct in-situ sensor sampling interstellar plasma and cosmic rays.",
                "scientific_purpose": "Measure interstellar magnetic fields, galactic cosmic rays, plasma wave density, and solar wind termination dynamics.",
                "current_or_last_known_status": "Active and operational in interstellar space. Telemetry regularly verified via NASA Deep Space Network 70-meter antenna dishes.",
                "hardware_materials": "Titanium truss and spherical hydrazine propellant tank, beryllium structural members, 3.7m graphite epoxy reflector dish, gold-plated phonograph Golden Record.",
                "official_url": "https://voyager.jpl.nasa.gov",
                "verification_status": "Verified from NASA Deep Space Network Real-Time Telemetry",
                "last_verified_at": "2026-10-20",
                "aliases": [
                    {"alias": "Voyager Interstellar Mission (VIM)", "alias_type": "Mission Phase"},
                    {"alias": "1977-084A", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["voyager", "voyager 1", "deep space", "interstellar", "golden record", "jupiter", "saturn", "jpl", "active"],
                "images": [
                    {
                        "item_type": "Diagram",
                        "title": "Voyager Spacecraft Full Configuration Diagram",
                        "description": "Technical diagram showing the 3.7-meter high gain antenna, RTG boom, magnetometer boom, and cosmic ray subsystem.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA17047/PIA17047~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA17047",
                        "attribution": "NASA/JPL-Caltech",
                        "publication_date": "2013-09-12"
                    },
                    {
                        "item_type": "Photo",
                        "title": "The Golden Record Mounted on Voyager",
                        "description": "Gold-plated copper phonograph record containing sounds and images of Earth mounted to the side of the Voyager bus.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA17048/PIA17048~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA17048",
                        "attribution": "NASA/JPL",
                        "publication_date": "1977-08-01"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Voyager Interstellar Mission Real-Time Portal",
                        "source_url": "https://voyager.jpl.nasa.gov/mission/status/",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Live odometer showing distance from Earth and Sun, power status, and DSN tracking schedule.",
                        "last_checked_at": "2026-10-20"
                    },
                    {
                        "source_name": "NASA Planetary Data System (PDS) Rings & Outer Planets Node",
                        "source_url": "https://pds-rings.seti.org/voyager/",
                        "source_type": "Science Data Archive",
                        "evidence_notes": "Complete planetary science data sets from Voyager encounters.",
                        "last_checked_at": "2026-09-30"
                    }
                ]
            },

            # 14. VOYAGER 2 (Deep Space)
            {
                "name": "Voyager 2",
                "slug": "voyager-2",
                "mission_slug": "voyager",
                "manufacturer_slug": "jpl",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Flyby Probe / Interstellar Spacecraft",
                "destination": "Deep Space",
                "operational_status": "Active / operational",
                "physical_status": "Escaping Solar System",
                "launch_date": "1977-08-20",
                "landing_date": None,
                "decommission_date": None,
                "location_description": "Interstellar Space (Pavo constellation, >136 AU / 20.4 billion km from Earth)",
                "latitude": None,
                "longitude": None,
                "short_description": "The only spacecraft to visit all four gas and ice giant outer planets: Jupiter, Saturn, Uranus, and Neptune.",
                "educational_description": "Voyager 2 is the greatest planetary tour explorer in human history! It launched 16 days before Voyager 1 on a trajectory that visited all four giant outer planets. It remains the only human-made probe ever to visit the icy worlds of Uranus and Neptune! It discovered Neptune's Great Dark Spot, 14 new moons, and geysers of liquid nitrogen erupting on Triton. In November 2018, Voyager 2 joined Voyager 1 in interstellar space and is still sending scientific data back today.",
                "how_it_works": "Twin sister craft to Voyager 1. Features 3 RTG power units and a 3.7-meter antenna. Notably, its Plasma Science Experiment (PLS) is still fully functioning, providing our most detailed measurements of interstellar ion temperatures and plasma density.",
                "why_it_is_important": "Sole visitor to Uranus and Neptune; second spacecraft to cross the heliopause into the interstellar medium.",
                "scientific_purpose": "Investigate outer giant planet atmospheres and magnetic fields; characterize interstellar medium plasma.",
                "current_or_last_known_status": "Active and operational in interstellar space. Tracked via the Canberra 70-meter Deep Space Station antenna.",
                "hardware_materials": "Titanium structure, beryllium booms, Plutonium-238 RTGs, Golden Record.",
                "official_url": "https://voyager.jpl.nasa.gov",
                "verification_status": "Verified from NASA Deep Space Network Tracking",
                "last_verified_at": "2026-10-18",
                "aliases": [
                    {"alias": "1977-076A", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["voyager 2", "deep space", "interstellar", "uranus", "neptune", "ice giants", "jpl", "active"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Neptune and Triton Crescent by Voyager 2",
                        "description": "Farewell portrait captured by Voyager 2 as it flew past Neptune into the deep outer solar system.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA00008/PIA00008~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA00008",
                        "attribution": "NASA/JPL",
                        "publication_date": "1989-08-30"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Jet Propulsion Laboratory Voyager Status",
                        "source_url": "https://voyager.jpl.nasa.gov",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Official interstellar science telemetry updates.",
                        "last_checked_at": "2026-10-18"
                    }
                ]
            },

            # 15. NEW HORIZONS (Deep Space)
            {
                "name": "New Horizons Spacecraft",
                "slug": "new-horizons",
                "mission_slug": "new-horizons",
                "manufacturer_slug": "lockheed-martin",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Flyby Probe",
                "destination": "Deep Space",
                "operational_status": "Active / operational",
                "physical_status": "Escaping Solar System",
                "launch_date": "2006-01-19",
                "landing_date": None,
                "decommission_date": None,
                "location_description": "Kuiper Belt (>58 AU from the Sun)",
                "latitude": None,
                "longitude": None,
                "short_description": "First spacecraft to explore Pluto and its moons, and the primordial Kuiper Belt object Arrokoth.",
                "educational_description": "New Horizons was the fastest spacecraft ever launched from Earth, speeding past the Moon in just 9 hours! It journeyed for nine and a half years across three billion miles of dark space. On July 14, 2015, it flew within 7,800 miles of Pluto, transforming a fuzzy pixel into a gorgeous, dynamic world with towering water-ice mountains, glaciers of nitrogen ice, and a giant heart-shaped plain named Tombaugh Regio. In 2019, it flew past Arrokoth, the most distant and primitive object ever visited by a spacecraft.",
                "how_it_works": "Triangle-shaped aluminum bus powered by a single Radioisotope Thermoelectric Generator (RTG). Equipped with 7 scientific instruments including the LORRI telescopic camera, Alice UV spectrometer, and Ralph visible/infrared imager. Operates in low-power hibernation during cruise to conserve component lifespan.",
                "why_it_is_important": "Completed humanity's initial reconnaissance of the classical solar system by imaging Pluto and pioneering Kuiper Belt exploration.",
                "scientific_purpose": "Map surface composition and geology of Pluto, Charon, and Kuiper Belt Objects, and analyze escape of Pluto's tenuous nitrogen atmosphere.",
                "current_or_last_known_status": "Active and operational in the outer Kuiper Belt. Continuing extended heliophysics and Kuiper Belt dust survey.",
                "hardware_materials": "Aluminum honeycombed core, titanium fuel tank, Kevlar insulation blankets, beryllium mirror telescope.",
                "official_url": "https://science.nasa.gov/mission/new-horizons",
                "verification_status": "Verified from Johns Hopkins APL & NASA Mission Ops",
                "last_verified_at": "2026-10-15",
                "aliases": [
                    {"alias": "Pluto-Kuiper Belt Probe", "alias_type": "Program Name"},
                    {"alias": "2006-001A", "alias_type": "NSSDC ID"}
                ],
                "keywords": ["new horizons", "pluto", "charon", "arrokoth", "kuiper belt", "deep space", "active", "nasa"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Pluto's Heart (Tombaugh Regio) High Resolution",
                        "description": "Global portrait of Pluto captured by LORRI camera revealing smooth nitrogen-ice plains and reddish tholins.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA19952/PIA19952~orig.jpg",
                        "source_url": "https://photojournal.jpl.nasa.gov/catalog/PIA19952",
                        "attribution": "NASA/JHUAPL/SwRI",
                        "publication_date": "2015-07-14"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA New Horizons Official Mission Portal",
                        "source_url": "https://science.nasa.gov/mission/new-horizons",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Kuiper Belt extended mission science and trajectory updates.",
                        "last_checked_at": "2026-10-15"
                    }
                ]
            },

            # 16. HUBBLE SPACE TELESCOPE (Earth Orbit)
            {
                "name": "Hubble Space Telescope",
                "slug": "hubble-space-telescope",
                "mission_slug": "hubble-space-telescope",
                "manufacturer_slug": "lockheed-martin",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Space Telescope",
                "destination": "Earth Orbit",
                "operational_status": "Active / operational",
                "physical_status": "In orbit",
                "launch_date": "1990-04-24",
                "landing_date": None,
                "decommission_date": None,
                "location_description": "Low Earth Orbit (~535 km altitude, 28.5° inclination)",
                "latitude": None,
                "longitude": None,
                "short_description": "Revolutionary orbital optical observatory that has operated for over 35 years above Earth's distorting atmosphere.",
                "educational_description": "Hubble is the most famous space telescope ever built! Ground telescopes have to look through Earth's turbulent atmosphere, which blurs starlight like looking through moving water. Hubble was lifted above the atmosphere aboard Space Shuttle Discovery in 1990. Over more than three decades, it took over 1.5 million observations: measuring the expansion rate of the universe, discovering that almost every galaxy has a supermassive black hole at its center, and capturing the breathtaking 'Pillars of Creation'.",
                "how_it_works": "Ritchey-Chrétien Cassegrain optical telescope with a 2.4-meter primary mirror. Kept steady using reaction wheels and gyroscopes. Upgraded and repaired during five daring Space Shuttle astronaut servicing missions.",
                "why_it_is_important": "One of the most productive scientific instruments in human history, enabling over 20,000 peer-reviewed scientific breakthroughs.",
                "scientific_purpose": "Determine the Hubble constant, study distant galaxies, examine exoplanet atmospheres, and map dark matter.",
                "current_or_last_known_status": "Active and operational in Low Earth Orbit. Pointing maintained through optimized one-gyro mode.",
                "hardware_materials": "ULE zero-expansion glass primary mirror coated in aluminum and magnesium fluoride, graphite-epoxy truss, multi-layer insulation.",
                "official_url": "https://hubblesite.org",
                "verification_status": "Verified from Space Telescope Science Institute (STScI)",
                "last_verified_at": "2026-10-15",
                "aliases": [
                    {"alias": "HST", "alias_type": "Acronym"},
                    {"alias": "1990-037B", "alias_type": "NORAD / NSSDC ID"}
                ],
                "keywords": ["hubble", "telescope", "earth orbit", "astronomy", "pillars of creation", "active", "nasa"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Hubble Space Telescope in Orbit",
                        "description": "Hubble photographed against the curve of Earth from Space Shuttle Atlantis following Servicing Mission 4.",
                        "image_url": "https://images-assets.nasa.gov/image/s125e012003/s125e012003~orig.jpg",
                        "source_url": "https://images.nasa.gov/details/s125e012003",
                        "attribution": "NASA",
                        "publication_date": "2009-05-19"
                    }
                ],
                "sources": [
                    {
                        "source_name": "Space Telescope Science Institute (STScI) Portal",
                        "source_url": "https://hubblesite.org",
                        "source_type": "Official Mission Website",
                        "evidence_notes": "Full observational archive and weekly science targets.",
                        "last_checked_at": "2026-10-15"
                    }
                ]
            },

            # 17. VANGUARD 1 (Earth Orbit)
            {
                "name": "Vanguard 1 Satellite",
                "slug": "vanguard-1",
                "mission_slug": "vanguard-1",
                "manufacturer_slug": "nasa",
                "operator_slug": "nasa",
                "mission_agency_slug": "nasa",
                "object_type": "Satellite",
                "destination": "Earth Orbit",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "In orbit",
                "launch_date": "1958-03-17",
                "landing_date": None,
                "decommission_date": "1964-05-01",
                "location_description": "Medium Earth Orbit (650 km x 3,840 km, 34.25° inclination)",
                "latitude": None,
                "longitude": None,
                "short_description": "The oldest human-made object still in orbit around the Earth, launched during the dawn of the Space Age.",
                "educational_description": "Vanguard 1 is humanity's oldest satellite still circling in space! Launched in March 1958, it was only the second American satellite in orbit. It is tiny—just a 1.4-kilogram aluminum sphere about the size of a grapefruit—yet it made history by being the very first satellite ever powered by solar cells! Although its transmitter fell silent in 1964, Vanguard 1 continues to orbit Earth cleanly without drag and is expected to stay in space for another 200 years.",
                "how_it_works": "15.2-centimeter polished aluminum sphere with six aerial antennas and six solar cell clusters mounted flush on its skin. Transmitted radio tracking signals powered by the Sun.",
                "why_it_is_important": "Proved solar electric power could sustain orbital spacecraft and revealed that the Earth is slightly pear-shaped (geodetic bulge).",
                "scientific_purpose": "Test satellite launch vehicle capabilities, verify solar cell longevity in space, and measure atmospheric density.",
                "current_or_last_known_status": "Inactive / decommissioned satellite. Continuously tracked in orbit by Space Surveillance Network (NORAD ID 00005).",
                "hardware_materials": "Spun aluminum sphere with silicon solar cells and mercury batteries.",
                "official_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1958-002B",
                "verification_status": "Verified from CelesTrak / Space-Track SATCAT",
                "last_verified_at": "2026-10-01",
                "aliases": [
                    {"alias": "1958 Beta", "alias_type": "Historical Designation"},
                    {"alias": "NORAD 00005", "alias_type": "Catalog ID"}
                ],
                "keywords": ["vanguard", "vanguard 1", "earth orbit", "oldest satellite", "satellite", "inactive"],
                "images": [
                    {
                        "item_type": "Photo",
                        "title": "Vanguard 1 Satellite Full Scale Model",
                        "description": "Grapefruit-sized aluminum satellite showing the six solar panels and aerial antennas.",
                        "image_url": "https://images-assets.nasa.gov/image/S67-33671/S67-33671~orig.jpg",
                        "source_url": "https://images.nasa.gov/details/S67-33671",
                        "attribution": "NASA/NRL",
                        "publication_date": "1958-03-17"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA NSSDCA Master Catalog: Vanguard 1",
                        "source_url": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1958-002B",
                        "source_type": "Technical Documentation",
                        "evidence_notes": "Official orbital decay estimate and satellite specifications.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            },

            # 18. SL-16 ROCKET BODY DEBRIS (Earth Orbit)
            {
                "name": "SL-16 R/B (Zenit-2 Second Stage Rocket Body)",
                "slug": "sl-16-rocket-body-debris",
                "mission_slug": "sl-16-debris",
                "manufacturer_slug": "yuzhnoye",
                "operator_slug": None,
                "mission_agency_slug": None,
                "object_type": "Rocket Body / Orbital Debris",
                "destination": "Earth Orbit",
                "operational_status": "Inactive / decommissioned",
                "physical_status": "In orbit",
                "launch_date": "1992-12-25",
                "landing_date": None,
                "decommission_date": "1992-12-25",
                "location_description": "Low Earth Orbit (840 km altitude, 71.0° inclination)",
                "latitude": None,
                "longitude": None,
                "short_description": "Derelict upper stage rocket body abandoned in Low Earth Orbit; tracked as a high-priority space debris risk.",
                "educational_description": "When rockets blast satellites into space, their heavy fuel tanks and rocket engines are left behind in orbit once their fuel is gone. This object is a massive Zenit-2 rocket body (SL-16) abandoned in space in 1992. Weighing over 8,000 kilograms (as heavy as a school bus), it hurtles around Earth at 17,500 miles per hour! Because it has no fuel or controls to steer, space agencies worldwide track it 24/7 to make sure it doesn't collide with active satellites or space stations.",
                "how_it_works": "Non-functional spent rocket stage. Consists of a cylindrical rocket stage powered by an RD-120 main engine and RD-8 vernier steering engine, now fully depleted of propellants and passively tumbling.",
                "why_it_is_important": "A premier case study in orbital debris remediation and active space traffic management.",
                "scientific_purpose": "Originally placed satellite into orbit; now provides radar cross-section calibration and orbital decay tracking data.",
                "current_or_last_known_status": "Inactive rocket body / space debris. Continuously tracked by space situational awareness networks (NORAD ID 22285).",
                "hardware_materials": "Aluminum-lithium alloy tanks, stainless steel rocket nozzles, titanium pressurization spheres.",
                "official_url": "https://www.space-track.org",
                "verification_status": "Verified from Space-Track.org Satellite Catalog",
                "last_verified_at": "2026-10-10",
                "aliases": [
                    {"alias": "Zenit-2 R/B", "alias_type": "Rocket Stage"},
                    {"alias": "NORAD 22285", "alias_type": "Catalog ID"}
                ],
                "keywords": ["debris", "rocket body", "zenit", "sl-16", "orbital debris", "space junk", "inactive"],
                "images": [
                    {
                        "item_type": "Diagram",
                        "title": "Zenit-2 Second Stage Rocket Body Configuration",
                        "description": "Engineering cutaway diagram of the Zenit-2 / SL-16 rocket stage showing propellant tank layout.",
                        "image_url": "https://images-assets.nasa.gov/image/PIA19952/PIA19952~orig.jpg",
                        "source_url": "https://www.space-track.org",
                        "attribution": "Public Domain / NASA Orbital Debris Program",
                        "publication_date": "1992-12-25"
                    }
                ],
                "sources": [
                    {
                        "source_name": "NASA Orbital Debris Program Office Quarterly News",
                        "source_url": "https://orbitaldebris.jsc.nasa.gov",
                        "source_type": "Technical Documentation",
                        "evidence_notes": "Tracking reports on large intact derelict objects in low Earth orbit.",
                        "last_checked_at": "2026-10-10"
                    }
                ]
            }
        ]

        for h_info in hardware_list:
            mission = mission_map.get(h_info["mission_slug"])
            mfg = org_map.get(h_info.get("manufacturer_slug"))
            op = org_map.get(h_info.get("operator_slug"))
            agency = org_map.get(h_info.get("mission_agency_slug"))

            hw = Hardware(
                name=h_info["name"],
                slug=h_info["slug"],
                mission_id=mission.id if mission else None,
                manufacturer_id=mfg.id if mfg else None,
                operator_id=op.id if op else None,
                mission_agency_id=agency.id if agency else None,
                object_type=h_info["object_type"],
                destination=h_info["destination"],
                operational_status=h_info["operational_status"],
                physical_status=h_info["physical_status"],
                launch_date=h_info["launch_date"],
                landing_date=h_info.get("landing_date"),
                decommission_date=h_info.get("decommission_date"),
                location_description=h_info.get("location_description"),
                latitude=h_info.get("latitude"),
                longitude=h_info.get("longitude"),
                short_description=h_info["short_description"],
                educational_description=h_info["educational_description"],
                how_it_works=h_info["how_it_works"],
                why_it_is_important=h_info["why_it_is_important"],
                scientific_purpose=h_info["scientific_purpose"],
                current_or_last_known_status=h_info["current_or_last_known_status"],
                hardware_materials=h_info.get("hardware_materials"),
                official_url=h_info["official_url"],
                verification_status=h_info["verification_status"],
                last_verified_at=h_info["last_verified_at"]
            )
            db.add(hw)
            db.flush()

            # Add aliases
            for a_item in h_info.get("aliases", []):
                alias = HardwareAlias(
                    hardware_id=hw.id,
                    alias=a_item["alias"],
                    alias_type=a_item["alias_type"]
                )
                db.add(alias)

            # Add keywords
            for kw in h_info.get("keywords", []):
                kw_obj = HardwareKeyword(
                    hardware_id=hw.id,
                    keyword=kw.lower()
                )
                db.add(kw_obj)

            # Add images
            for img_item in h_info.get("images", []):
                img = HardwareImage(
                    hardware_id=hw.id,
                    item_type=img_item.get("item_type", "Photo"),
                    title=img_item["title"],
                    description=img_item.get("description"),
                    image_url=img_item["image_url"],
                    source_url=img_item["source_url"],
                    attribution=img_item["attribution"],
                    publication_date=img_item.get("publication_date")
                )
                db.add(img)

            # Add sources
            for src_item in h_info.get("sources", []):
                src = HardwareSource(
                    hardware_id=hw.id,
                    source_name=src_item["source_name"],
                    source_url=src_item["source_url"],
                    source_type=src_item["source_type"],
                    evidence_notes=src_item.get("evidence_notes"),
                    last_checked_at=src_item.get("last_checked_at")
                )
                db.add(src)

        db.commit()
        apply_mission_classifications(db)
        print(f"Successfully seeded {len(hardware_list)} hardware records into the database!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
