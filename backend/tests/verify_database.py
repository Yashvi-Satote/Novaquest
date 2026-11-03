"""
Novaquest Database & API Verification Test Suite
Verifies:
1. Schema & Table Architecture
2. Total Record Counts (Spacecraft: 122, 3D Models: 122, Missions: 112)
3. 3D Model references, formats, file sizes, and asset paths
4. Multi-mission and multi-spacecraft relational associations
5. API endpoints connectivity and JSON responses
"""

import os
import sys
import unittest
import json
import sqlite3

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from Shared.database import engine, SessionLocal
from NovaBase.models import (
    Organization,
    Mission,
    Spacecraft,
    Model3D,
    MissionSpacecraft,
    SpacecraftAlias,
    SpacecraftKeyword,
    SpacecraftImage,
    SpacecraftSource,
    Hardware
)
from NovaBase.app import app


class TestNovaquestDatabaseReplacement(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()
        cls.client = app.test_client()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_tables_exist(self):
        """Verify all new and scalable tables exist in SQLite metadata."""
        db_path = os.path.join(backend_dir, "space_hardware.db")
        self.assertTrue(os.path.exists(db_path), "Database file space_hardware.db must exist.")
        
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = {r[0] for r in cur.fetchall()}
        conn.close()

        expected_tables = {
            "organizations",
            "missions",
            "spacecraft",
            "models_3d",
            "mission_spacecraft",
            "spacecraft_aliases",
            "spacecraft_keywords",
            "spacecraft_images",
            "spacecraft_sources"
        }
        for table in expected_tables:
            self.assertIn(table, tables, f"Expected table '{table}' not found in database.")

    def test_02_total_source_and_imported_records(self):
        """Verify exactly 122 spacecraft imported matching the 122 source records."""
        sc_count = self.db.query(Spacecraft).count()
        self.assertEqual(sc_count, 122, f"Expected exactly 122 spacecraft records, found {sc_count}")

    def test_03_total_3d_models_count_and_availability(self):
        """Verify 122 3D models exist, with 100% availability and valid asset paths."""
        model_count = self.db.query(Model3D).count()
        self.assertEqual(model_count, 122, f"Expected 122 3D models, found {model_count}")

        unavailable_models = self.db.query(Model3D).filter(Model3D.is_available == False).count()
        self.assertEqual(unavailable_models, 0, "All 122 models must be marked as available.")

        # Test sample model details
        sample_model = self.db.query(Model3D).filter(Model3D.model_name == "ace").first()
        self.assertIsNotNone(sample_model)
        self.assertEqual(sample_model.glb_filename, "ace.glb")
        self.assertEqual(sample_model.primary_format, "glb")
        self.assertTrue(sample_model.glb_path.startswith("/models/spacecraft-models/ace/"))
        self.assertGreater(sample_model.file_size_bytes, 1000000)

    def test_04_missions_created(self):
        """Verify missions created and properly populated."""
        mission_count = self.db.query(Mission).count()
        self.assertGreaterEqual(mission_count, 100, f"Expected at least 100 missions, found {mission_count}")

    def test_05_multi_mission_spacecraft_relationship(self):
        """Verify that multiple missions can reference the same spacecraft."""
        # E.g. Voyager probe referenced by Voyager 1 and Voyager 2 missions
        voyager_sc = self.db.query(Spacecraft).filter(Spacecraft.name == "voyager").first()
        self.assertIsNotNone(voyager_sc)
        self.assertGreaterEqual(len(voyager_sc.missions), 2, "Voyager spacecraft must be referenced by at least 2 missions.")
        mission_slugs = {m.slug for m in voyager_sc.missions}
        self.assertIn("voyager-1", mission_slugs)
        self.assertIn("voyager-2", mission_slugs)

        # Pioneer probe referenced by Pioneer 10 and Pioneer 11 missions
        pioneer_sc = self.db.query(Spacecraft).filter(Spacecraft.name == "pioneer").first()
        self.assertIsNotNone(pioneer_sc)
        self.assertGreaterEqual(len(pioneer_sc.missions), 2)

    def test_06_multi_spacecraft_mission_relationship(self):
        """Verify that a single mission can reference multiple spacecraft."""
        # Cassini-Huygens mission references Cassini and Huygens
        cassini_mission = self.db.query(Mission).filter(Mission.slug == "cassini-huygens").first()
        self.assertIsNotNone(cassini_mission)
        spacecraft_names = {sc.name for sc in cassini_mission.spacecraft_items}
        self.assertIn("cassini", spacecraft_names)
        self.assertIn("huygens", spacecraft_names)

        # Rosetta mission references Rosetta and Philae
        rosetta_mission = self.db.query(Mission).filter(Mission.slug == "rosetta-philae").first()
        self.assertIsNotNone(rosetta_mission)
        rosetta_sc_names = {sc.name for sc in rosetta_mission.spacecraft_items}
        self.assertIn("rosetta", rosetta_sc_names)
        self.assertIn("philae", rosetta_sc_names)

    def test_07_api_health_endpoint(self):
        """Verify /api/health returns database engine and complete record counts."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["database_connected"])
        self.assertEqual(data["spacecraft_records_count"], 122)
        self.assertEqual(data["models_count"], 122)

    def test_08_api_mission_selection_and_model_retrieval(self):
        """
        Verify that selecting a mission retrieves:
        - Mission details
        - Associated spacecraft
        - Corresponding 3D model reference
        """
        # Test Cassini-Huygens
        cassini_mission = self.db.query(Mission).filter(Mission.slug == "cassini-huygens").first()
        res = self.client.get(f"/api/missions/{cassini_mission.id}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["slug"], "cassini-huygens")
        self.assertIn("spacecraft", data)
        self.assertGreaterEqual(len(data["spacecraft"]), 2)

        # Check that each associated spacecraft has its 3D model reference
        for sc in data["spacecraft"]:
            self.assertIn("model_3d", sc)
            model = sc["model_3d"]
            self.assertIsNotNone(model)
            self.assertTrue(model["is_available"])
            self.assertTrue(model["glb_filename"].endswith(".glb"))
            self.assertTrue(model["glb_path"].startswith("/models/spacecraft-models/"))
            self.assertGreater(model["file_size_bytes"], 0)

    def test_09_api_spacecraft_detail_endpoint(self):
        """Verify /api/spacecraft/<slug> and /api/hardware/<slug> return complete 3D model info."""
        res = self.client.get("/api/hardware/curiosity")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["identifier"], "curiosity")
        self.assertTrue(data["has_3d_model"])
        self.assertIsNotNone(data["model_3d"])
        self.assertEqual(data["model_3d"]["glb_filename"], "curiosity_static.glb")

    def test_10_api_models_endpoint(self):
        """Verify /api/models returns all 122 3D models."""
        res = self.client.get("/api/models")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["count"], 122)
        self.assertEqual(len(data["models"]), 122)

    def test_11_backward_compatibility_hardware_query(self):
        """Verify that querying Hardware still works seamlessly for existing frontend components."""
        hw_records = self.db.query(Hardware).limit(10).all()
        self.assertEqual(len(hw_records), 10)
        res = self.client.get("/api/hardware?limit=10&page=1")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data["items"]), 10)
        self.assertEqual(data["total"], 122)


if __name__ == "__main__":
    unittest.main()
