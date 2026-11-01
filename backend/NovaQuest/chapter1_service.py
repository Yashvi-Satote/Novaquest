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
                },
                {
                    "zone_number": 4,
                    "name": "Alien Structure Discovery",
                    "coordinates": {"x": -120, "z": -75},
                    "description": "An ancient, partially buried geometric alien structure embedded in the northwest basalt ridge, connected to Surveyor 1 by a dark data conduit."
                },
                {
                    "zone_number": 5,
                    "name": "Mission Echo Interface",
                    "coordinates": {"x": -116, "z": -72},
                    "description": "An interactive holographic projection interface beside the alien structure, reconstructing the historical 1966 Surveyor 1 mission archives."
                },
                {
                    "zone_number": 6,
                    "name": "Recovery and Extraction Area",
                    "coordinates": {"x": 0, "z": 0},
                    "description": "The secured Surveyor 1 site equipped with robotic stabilizers, quantum storage vault, and extraction pallet as the alien signal powers down."
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
            },
            {
                "id": "obj_zone4_alien_structure",
                "zone": 4,
                "title": "Discover Alien Structure",
                "description": "Follow the dark data conduit from the crater northwest into the basalt ridge to uncover the alien geometric monolith.",
                "target_coordinates": {"x": -120, "z": -75},
                "status": "locked"
            },
            {
                "id": "obj_zone4_activate_interface",
                "zone": 4,
                "title": "Activate Central Scanning Panel",
                "description": "Approach the alien interface panel to interface with the anomalous network.",
                "target_coordinates": {"x": -118, "z": -74},
                "status": "locked"
            },
            {
                "id": "obj_zone5_mission_echo",
                "zone": 5,
                "title": "Complete Mission Echo Simulations",
                "description": "Solve the 3 historical simulation puzzles: Controlled Descent, Surface Observation, and Image Archive Restoration.",
                "target_coordinates": {"x": -116, "z": -72},
                "status": "locked"
            },
            {
                "id": "obj_zone6_recovery",
                "zone": 6,
                "title": "Return to Surveyor 1 Recovery Rig",
                "description": "Return to Surveyor 1, verify the conduit has powered down, secure the robotic lifting stabilizers, and extract the stellar coordinates.",
                "target_coordinates": {"x": 0, "z": 0},
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
            },

            # ================= ZONE 4: ALIEN STRUCTURE DISCOVERY =================
            {
                "id": "poi_alien_structure",
                "zone": 4,
                "name": "Precursor Geometric Monolith",
                "category": "alien_structure",
                "coordinates": {"x": -120, "y": 2.5, "z": -75},
                "radius": 7.0,
                "summary": "Partially buried non-human geometric structure.",
                "details": (
                    "A seamless obsidian-like polyhedral structure protruding from the basalt ridge. "
                    "Surfaces are completely smooth with no fasteners, screws, or seams. Intricate luminescent "
                    "cyan glyph circuitry lines trace across its dark metallic facets, while geometric shards "
                    "levitate silently above its apex in an active repulsive Casimir-force field."
                )
            },
            {
                "id": "poi_data_conduit",
                "zone": 4,
                "name": "Subterranean Data Conduit",
                "category": "alien_infrastructure",
                "coordinates": {"x": -60, "y": 0.1, "z": -35},
                "radius": 4.5,
                "summary": "Dark glowing conduit extending toward Surveyor 1.",
                "details": (
                    "A glassy, dark metallic conduit running along the regolith from the alien structure "
                    "directly to the base of Surveyor 1. Rhythmic cyan light pulses travel along the conduit, "
                    "indicating active data extraction and harmonic synchronization."
                )
            },
            {
                "id": "poi_scanning_panel",
                "zone": 4,
                "name": "Central Scanning Panel & Interface",
                "category": "alien_interface",
                "coordinates": {"x": -118, "y": 1.5, "z": -74},
                "radius": 4.0,
                "summary": "Interactive energy interface on the monolith's frontal face.",
                "details": (
                    "A recessed scanning panel emitting a faint blue glow and low-frequency vibration. "
                    "Placing an EVA sensor probe on this panel initiates the Mission Echo historical reconstruction."
                )
            },

            # ================= ZONE 5: MISSION ECHO INTERFACE =================
            {
                "id": "poi_mission_echo_console",
                "zone": 5,
                "name": "Mission Echo Holographic Console",
                "category": "mission_echo",
                "coordinates": {"x": -116, "y": 1.2, "z": -72},
                "radius": 4.5,
                "summary": "Volumetric projection matrix reconstructing 1966 Surveyor 1 mission.",
                "details": (
                    "When activated, the surrounding terrain dims as high-fidelity blue holographic wireframes "
                    "project into the air. Reconstructs Surveyor 1's controlled descent, panoramic observations, "
                    "and the decryption of the corrupted historic image archive."
                )
            },
            {
                "id": "poi_descent_simulation",
                "zone": 5,
                "name": "Descent Trajectory Visualizer",
                "category": "mission_echo",
                "coordinates": {"x": -115, "y": 2.0, "z": -71},
                "radius": 4.0,
                "summary": "Historical 1966 descent flight telemetry simulation.",
                "details": (
                    "Visualizes the 1966 descent from retro-rocket ignition at 75 km altitude down to "
                    "vernier engine cut-off at 3.4 meters, completing humanity's first extraterrestrial soft landing."
                )
            },

            # ================= ZONE 6: RECOVERY AND EXTRACTION AREA =================
            {
                "id": "poi_recovery_rig",
                "zone": 6,
                "name": "Robotic Stabilization Gantry",
                "category": "recovery_extraction",
                "coordinates": {"x": 1.8, "y": 1.2, "z": 0.5},
                "radius": 5.0,
                "summary": "Hydraulic carbon-fiber gantry securing Surveyor 1.",
                "details": (
                    "Deployed by Officer Leo Vance to brace the historic spacecraft. With the alien conduit "
                    "powered down, the lander is completely stabilized for NASA heritage preservation."
                )
            },
            {
                "id": "poi_quantum_storage_unit",
                "zone": 6,
                "name": "Quantum Archive Vault (Q-SSD)",
                "category": "recovery_extraction",
                "coordinates": {"x": -1.2, "y": 1.4, "z": -1.0},
                "radius": 4.0,
                "summary": "Solid-state storage unit with 11,237 restored Vidicon frames.",
                "details": (
                    "All 11,237 historic images and decoded telemetry packets are secured inside this "
                    "radiation-hardened quantum storage unit, ready for orbital transfer to Carrier Aegis."
                )
            },
            {
                "id": "poi_extraction_pallet",
                "zone": 6,
                "name": "Secure Transport Pallet & Mystery Coordinates",
                "category": "recovery_extraction",
                "coordinates": {"x": 3.5, "y": 0.6, "z": -2.5},
                "radius": 5.5,
                "summary": "Mobile transport pallet containing deciphered Chapter 2 coordinates.",
                "details": (
                    "The final payload container. Contains the extracted precursor signal fragment. "
                    "Decoded telemetry yields deep lunar coordinates pointing toward an ancient subterranean "
                    "vault system beneath the Oceanus Procellarum basalt crust."
                )
            }
        ]

    def get_mission_echo_puzzles(self) -> List[Dict[str, Any]]:
        """Returns the three Mission Echo interactive simulation puzzles."""
        return [
            {
                "step": 1,
                "id": "echo_descent",
                "title": "Controlled Descent Sequence",
                "description": "Adjust the retro-rocket burn duration and Vernier thruster throttle to achieve a nominal touchdown velocity of 3.05 m/s at Oceanus Procellarum.",
                "parameters": {
                    "initial_altitude_km": 75.0,
                    "target_touchdown_mps": 3.05,
                    "burn_time_sec": 40.2,
                    "status": "pending"
                }
            },
            {
                "step": 2,
                "id": "echo_observation",
                "title": "Lunar Surface Observation",
                "description": "Align the Vidicon camera mirror elevation and optical filter wheel to reconstruct a 360-degree panoramic mosaic of the landing basin.",
                "parameters": {
                    "filter_selected": "Clear / UV-Pass",
                    "elevation_angle_deg": 18.5,
                    "frames_stitched": "360 / 360",
                    "status": "pending"
                }
            },
            {
                "step": 3,
                "id": "echo_archive_restoration",
                "title": "Historic Archive Restoration",
                "description": "Filter out the 432.06 Hz alien harmonic interference from the 11,237 television frames to extract the hidden stellar vector coordinates.",
                "parameters": {
                    "filter_frequency_hz": 432.06,
                    "reconstructed_frames": 11237,
                    "coordinate_signal": "DECIPHERED · CHAPTER 2 VECTOR UNLOCKED",
                    "status": "pending"
                }
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

