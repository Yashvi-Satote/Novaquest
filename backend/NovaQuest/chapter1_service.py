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
            }
        }

        self.objectives = [
            {
                "id": "obj_surveyor_approach",
                "title": "Locate Surveyor 1",
                "description": "Navigate across the lunar regolith to the historic 1966 touchdown site.",
                "target_coordinates": {"x": 0, "z": 0},
                "status": "active"
            },
            {
                "id": "obj_camera_scan",
                "title": "Examine Vidicon TV Camera",
                "description": "Inspect the steerable mirror housing that transmitted humanity's first 11,237 images from the Moon's surface.",
                "target_coordinates": {"x": 0.4, "z": -0.6},
                "status": "locked"
            },
            {
                "id": "obj_soil_trench",
                "title": "Analyze Footpad 2 Soil Trench",
                "description": "Measure regolith compaction depth (approx. 5 cm) proving lunar soil could support human astronaut boots.",
                "target_coordinates": {"x": -2.8, "z": 1.2},
                "status": "locked"
            },
            {
                "id": "obj_solar_array",
                "title": "Scan Planar Solar Array",
                "description": "Assess 160-year micrometeorite patina and cosmic thermal weathering on the photovoltaic panel.",
                "target_coordinates": {"x": 0, "z": 0.5},
                "status": "locked"
            },
            {
                "id": "obj_track_anomaly",
                "title": "Trace Subsurface Magnetic Anomaly",
                "description": "Follow the fluctuating 432 Hz resonance emitter leading north-west toward the crater ridge.",
                "target_coordinates": {"x": -95, "z": -110},
                "status": "locked"
            },
            {
                "id": "obj_enter_fissure",
                "title": "Descend into Subterranean Anomaly",
                "description": "Investigate the collapsed lava tube fissure opening beneath the basalt shelf.",
                "target_coordinates": {"x": -115, "z": -125},
                "status": "locked"
            }
        ]

        self.points_of_interest: List[Dict[str, Any]] = [
            {
                "id": "poi_surveyor_core",
                "name": "Surveyor 1 Lander",
                "category": "historic_spacecraft",
                "coordinates": {"x": 0, "y": 0, "z": 0},
                "radius": 4.5,
                "summary": "Historic 1966 robotic lander standing untouched for 160 years.",
                "details": (
                    "Surveyor 1 proved that the lunar soil could bear the weight of Apollo lunar modules, "
                    "refuting fears that landers would sink into deep dust. The spacecraft consists of a tubular "
                    "aluminum space frame, 3 tripod landing legs with crushable honeycomb footpads, two radar "
                    "antennas, an omnidirectional mast, and a steerable solar array."
                ),
                "inspections": [
                    {
                        "target": "vidicon_camera",
                        "title": "Vidicon Optical Turret",
                        "lore": "Equipped with variable focal length (25-100mm) and color filters. Between June and July 1966, it sent 11,237 television frames back to Goldstone, DSS-42, and DSS-61.",
                        "state": "operational_archive_recovered"
                    },
                    {
                        "target": "footpad_trench",
                        "title": "Crushable Aluminum Footpad #2",
                        "lore": "Upon touchdown at 3.05 m/s, footpad 2 penetrated 5.2 cm into the regolith, leaving a pristine rim of displaced soil that validated lunar soil mechanics.",
                        "state": "soil_density_confirmed"
                    },
                    {
                        "target": "solar_panel",
                        "title": "Planar Solar Array Panel",
                        "lore": "792 solar cells delivering 89 Watts in full sunlight. Micro-meteorite pits and cosmic ray discolorations have darkened the quartz covers.",
                        "state": "spectrometry_recorded"
                    }
                ]
            },
            {
                "id": "poi_aegis_rover",
                "name": "Artemis/Aegis Recovery Pod",
                "category": "expedition_base",
                "coordinates": {"x": 55, "y": 0.5, "z": 40},
                "radius": 6.0,
                "summary": "Forward telemetry hub and sample return capsule deployed by Arin's team.",
                "details": "Houses precision vacuum sample canisters, telemetry relays linked to the 2126 orbital carrier, and emergency EVA suit replenishment recharge ports."
            },
            {
                "id": "poi_crater_basin",
                "name": "Ejecta Crater Rim (South-East)",
                "category": "geology",
                "coordinates": {"x": 75, "y": 4.5, "z": -60},
                "radius": 12.0,
                "summary": "Fresh impact crater exposing titanium-rich ilmenite basalt.",
                "details": "A 28-meter wide impact crater with raised ejecta ramparts. The low-angle sunlight casts an impenetrable jet-black shadow across half the crater bowl."
            },
            {
                "id": "poi_anomaly_fissure",
                "name": "Subterranean Fissure (Anomaly Site)",
                "category": "anomaly",
                "coordinates": {"x": -95, "y": -1.2, "z": -110},
                "radius": 8.0,
                "summary": "Deep fracture in the lunar basalt shelf emitting anomalous magnetic pulses.",
                "details": (
                    "A seismic rupture along an ancient collapsed lava tube. Sensor telemetry reveals "
                    "a sustained, non-random electromagnetic pulse vibrating at exactly 432 Hz, accompanied "
                    "by strange geometric crystalline deposits down within the chasm."
                )
            },
            {
                "id": "poi_precursor_vault",
                "name": "Subsurface Precursor Chamber",
                "category": "alien_vault",
                "coordinates": {"x": -115, "y": -18.0, "z": -140},
                "radius": 15.0,
                "summary": "Subterranean chamber containing non-human monolith architecture.",
                "details": (
                    "Beneath the lunar basalt, an ancient obsidian-like chamber is carved from unknown alloyed minerals. "
                    "At the center rests a levitating resonant monolith inscribed with astronomical vector glyphs "
                    "pointing toward the outer solar system."
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
