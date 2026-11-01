import os
import sys
from dotenv import load_dotenv

# Ensure the backend package root is available when run directly.
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from Shared.database import engine, SessionLocal, Base, get_db_status
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
from NovaBase.migrate_and_import import run_migration_and_import

def init_db():
    print("=" * 70)
    print("Novaquest - Scalable Database Initialization")
    print("=" * 70)
    
    status = get_db_status()
    print(f"Database Engine  : {status['engine'].upper()}")
    print(f"PostgreSQL Active: {status['is_postgres']}")
    print(f"Connection Status: {status['status']}")
    print(f"Status Note      : {status['message']}")
    print("-" * 70)
    
    print("Creating relational schema tables if they do not exist...")
    Base.metadata.create_all(bind=engine)
    print("Schema tables ready.")
    
    print("Executing idempotent migration and spacecraft catalog ingestion...")
    results = run_migration_and_import()
    
    # Final database verification
    db = SessionLocal()
    try:
        org_count = db.query(Organization).count()
        mission_count = db.query(Mission).count()
        sc_count = db.query(Spacecraft).count()
        model_count = db.query(Model3D).count()
        assoc_count = db.query(MissionSpacecraft).count()
        
        print("\n" + "=" * 70)
        print("DATABASE INITIALIZATION & INTEGRITY REPORT:")
        print(f"  Organizations              : {org_count}")
        print(f"  Missions                   : {mission_count}")
        print(f"  Spacecraft Records         : {sc_count}")
        print(f"  3D Models Ingested         : {model_count}")
        print(f"  Mission-Spacecraft Links   : {assoc_count}")
        print("=" * 70)
        print("Initialization completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
