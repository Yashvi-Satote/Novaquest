"""
NovaQuest — Chapter 1: The First Footprint
Service layer containing historical NASA Surveyor 1 documentation,
lunar map points of interest, 2126 mission telemetry, and alien anomaly archives.
"""

from typing import Dict, Any, List

class Chapter1Service:
    """Provides mission data, environmental telemetry, and investigation records for Chapter 1."""

    def __init__(self):
        self.site_info = {
            "title": "Chapter 1: The First Footprint",
            "location_name": "Oceanus Procellarum (Ocean of Storms)",
            "sub_location": "Flamsteed P Ring Basin",
            "historical_landing": {
                "mission": "Surveyor 1 (NASA / JPL / Hughes Aircraft)",
                "touchdown_timestamp": "June 2, 1966, 06:17:36 UTC",
                "lunar_coordinates": "2.4744° S, 43.3399° W",
                "altitude": "-2.04 km (relative to mean lunar sphere)",
                "significance": "Humanity's first true robotic soft landing on another celestial body."
            },
            "environment_telemetry": {
                "gravity": 1.62,  # m/s^2
                "atmosphere": "Exosphere vacuum (< 10^-12 torr)",
                "surface_temp_sunlit": "+117°C (390 K)",
                "surface_temp_shadow": "-133°C (140 K)",
                "solar_elevation_angle": "17.4° (low harsh morning sunlight)",
                "earth_position": "46° elevation in western sky",
                "radiation_flux": "0.32 mSv/hr (Solar quiet background)"
            },
            "zones_overview": [
                {
                    "zone_number": 1,
                    "name": "Team Landing Zone",
                    "coordinates": {"x": 110, "z": 65},
                    "description": "Where Arin Rao, Specialist Maya Chen, and Officer Leo Vance deployed from their Lunar Transport Vehicle."
                },
                {
                    "zone_number": 2,
                    "name": "Surveyor 1 Recovery Site",
                    "coordinates": {"x": 0, "z": 0},
                    "description": "The historic 1966 robotic landing site in Oceanus Procellarum, preserving humanity's first extraterrestrial soft touchdown."
                },
                {
                    "zone_number": 3,
                    "name": "Crater Investigation Area",
                    "coordinates": {"x": -75, "z": -50},
                    "description": "A 64-meter impact crater harboring an anomalous magnetic resonance and a partially buried non-human metallic object."
                }
            ]
        }

        self.objectives = [
            {
                "id": "obj_zone1_briefing",
                "zone": 1,
                "title": "Check In at Team Landing Zone",
                "description": "Consult the portable mission terminal and coordinate with Specialist Maya Chen before heading West.",
                "target_coordinates": {"x": 105, "z": 65},
                "status": "active"
            },
            {
                "id": "obj_zone2_surveyor",
                "zone": 2,
                "title": "Survey Historic Surveyor 1",
                "description": "Navigate West along the EVA trail to inspect the 1966 lander's Vidicon camera, footpads, and solar array.",
                "target_coordinates": {"x": 0, "z": 0},
                "status": "locked"
            },
            {
                "id": "obj_zone2_signal",
                "zone": 2,
                "title": "Trace Subsurface Harmonic",
                "description": "Isolate the 432 Hz anomalous harmonic frequency detected beneath the lander basin heading toward the North-West crater.",
                "target_coordinates": {"x": -35, "z": -25},
                "status": "locked"
            },
            {
                "id": "obj_zone3_crater_puzzle",
                "zone": 3,
                "title": "Investigate Crater Resonance",
                "description": "Scan Survey Sites Alpha, Beta, and Gamma in the impact crater to triangulate the source of the magnetic anomaly.",
                "target_coordinates": {"x": -75, "z": -50},
                "status": "locked"
            },
            {
                "id": "obj_zone3_buried_artifact",
                "zone": 3,
                "title": "Examine Buried Metallic Object",
                "description": "Inspect the partially exposed metallic precursor artifact embedded in the crater wall.",
                "target_coordinates": {"x": -78, "z": -54},
                "status": "locked"
            }
        ]

        self.points_of_interest: List[Dict[str, Any]] = [
            # ================= ZONE 1: TEAM LANDING ZONE =================
            {
                "id": "poi_mission_terminal",
                "zone": 1,
                "name": "Portable Mission Terminal",
                "category": "team_landing",
                "coordinates": {"x": 103, "y": 0.5, "z": 64},
                "radius": 4.0,
                "summary": "NASA Reconnaissance Division tactical field console.",
                "details": "Displays real-time mission telemetry, EVA suits status, route waypoints to Surveyor 1, and orbital communication uplinks to Carrier Aegis."
            },
            {
                "id": "poi_maya_chen",
                "zone": 1,
                "name": "Specialist Maya Chen (Field Scientist)",
                "category": "crewmate",
                "coordinates": {"x": 108, "y": 0.0, "z": 67},
                "radius": 3.8,
                "summary": "Lead sensor specialist monitoring magnetospheric background telemetry.",
                "details": "Maya reports that baseline readings in Flamsteed P are unusually noisy. She advises keeping the handheld LIDAR scanner active during the EVA approach."
            },
            {
                "id": "poi_leo_vance",
                "zone": 1,
                "name": "Officer Leo Vance (Operations Engineer)",
                "category": "crewmate",
                "coordinates": {"x": 100, "y": 0.0, "z": 62},
                "radius": 3.8,
                "summary": "Recovery engineer securing transport vehicle systems.",
                "details": "Leo confirms the lunar transport vehicle's landing thrusters performed nominally. Battery reserves are at 96% and emergency suit replenishment ports are operational."
            },
            {
                "id": "poi_lunar_transport",
                "zone": 1,
                "name": "Lunar Transport Vehicle (Aegis-01)",
                "category": "transport",
                "coordinates": {"x": 112, "y": 1.2, "z": 65},
                "radius": 8.0,
                "summary": "Heavy six-wheeled pressurized expedition vehicle with floodlights.",
                "details": "Reinforced titanium-composite cabin equipped with life-support airlock, high-output LED headlights casting long shadows, and sample storage lockers."
            },

            # ================= ZONE 2: SURVEYOR 1 RECOVERY SITE =================
            {
                "id": "poi_surveyor_core",
                "zone": 2,
                "name": "Surveyor 1 Lander",
                "category": "historic_spacecraft",
                "coordinates": {"x": 0, "y": 0, "z": 0},
                "radius": 4.5,
                "summary": "Historic 1966 robotic lander standing untouched for 160 years.",
                "details": (
                    "Surveyor 1 proved that the lunar soil could bear the weight of Apollo lunar modules. "
                    "The spacecraft consists of a tubular aluminum space frame, 3 tripod landing legs with crushable "
                    "honeycomb footpads, two radar antennas, a steerable Vidicon camera, and an angled solar array."
                ),
                "inspections": [
                    {
                        "target": "vidicon_camera",
                        "title": "Vidicon Optical Turret",
                        "lore": "Equipped with variable focal length (25-100mm) and color filters. Sent 11,237 television frames back to Earth in 1966.",
                        "state": "operational_archive_recovered"
                    },
                    {
                        "target": "footpad_trench",
                        "title": "Crushable Aluminum Footpad #2",
                        "lore": "Penetrated 5.2 cm into the lunar regolith at touchdown, leaving a preserved soil trench that validated lunar bearing strength.",
                        "state": "soil_density_confirmed"
                    },
                    {
                        "target": "solar_panel",
                        "title": "Planar Solar Array Panel",
                        "lore": "Delivered 89 Watts in 1966. Surface is pitted with micrometeorites and coated with a faint electrostatically bound dust patina.",
                        "state": "spectrometry_recorded"
                    }
                ]
            },

            # ================= ZONE 3: CRATER INVESTIGATION AREA =================
            {
                "id": "poi_crater_site_alpha",
                "zone": 3,
                "name": "Survey Site Alpha (North Rim Outcrop)",
                "category": "crater_investigation",
                "coordinates": {"x": -68, "y": 2.2, "z": -40},
                "radius": 5.0,
                "summary": "High-standing basalt outcrop on the crater rim.",
                "details": "LIDAR scan shows normal titanium basalt mineral composition. Signal resonance reading: 22% (Background baseline)."
            },
            {
                "id": "poi_crater_site_beta",
                "zone": 3,
                "name": "Survey Site Beta (Inner Scree Slope)",
                "category": "crater_investigation",
                "coordinates": {"x": -74, "y": -1.8, "z": -48},
                "radius": 5.0,
                "summary": "Impact-melted breccia field in deep crater shadow.",
                "details": "Crushed shock-glass breccia exhibiting secondary seismic refraction. Signal resonance reading: 54% (Reflected harmonic echo)."
            },
            {
                "id": "poi_crater_site_gamma",
                "zone": 3,
                "name": "Survey Site Gamma (Buried Metallic Object)",
                "category": "crater_investigation",
                "coordinates": {"x": -78, "y": -4.2, "z": -54},
                "radius": 5.5,
                "summary": "Partially exposed non-human metallic alloy prism.",
                "details": (
                    "A geometric metallic artifact partially protruding from the excavated crater wall. "
                    "Scanners record a 99.4% peak harmonic resonance at 432.06 Hz. The composition does not match "
                    "any known NASA, ESA, or CNSA alloy database. It points directly toward deeper subterranean strata."
                )
            }
        ]

    def get_chapter_overview(self) -> Dict[str, Any]:
        """Returns the full Chapter 1 overview and environment parameters."""
        return {
            "site": self.site_info,
            "objectives": self.objectives,
            "poi_count": len(self.points_of_interest),
            "playable_boundary_meters": 500,
            "core_zone_meters": 300
        }

    def get_pois(self) -> List[Dict[str, Any]]:
        """Returns all points of interest for the 3D map."""
        return self.points_of_interest

    def get_poi_by_id(self, poi_id: str) -> Dict[str, Any]:
        """Returns specific POI details or empty dict if not found."""
        for p in self.points_of_interest:
            if p["id"] == poi_id:
                return p
        return {}

    def get_telemetry_snapshot(self) -> Dict[str, Any]:
        """Returns live EVA suit telemetry snapshot for Captain Arin Rao."""
        return {
            "officer": "Captain Arin Rao",
            "suit_model": "NASA Mark VIII Heavy Recon EVA",
            "internal_pressure_kpa": 32.5,
            "suit_oxygen_percent": 98.4,
            "suit_temperature_c": 21.5,
            "external_surface_temp_c": -112.0,
            "heart_rate_bpm": 74,
            "dosimeter_msv": 0.042,
            "active_sensor": "LIDAR / Magnetometric Surface Scanner",
            "anomalous_harmonic_hz": 432.06
        }


# Singleton service instance
chapter1_service = Chapter1Service()

