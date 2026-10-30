import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from NovaBase.models import Hardware, HardwareImage, HardwareSource, Mission, Organization
from NovaBase.services.expand_db import expand_database
from NovaBase.services.mission_hierarchy import (
    apply_mission_classifications,
    ensure_mission_hierarchy_schema,
)
from NovaBase.services.seed_data import seed_database
from shared.database.connection import Base, SessionLocal, engine, get_db_status

def init_db():
    print("=" * 60)
    print("Novaquest - Database Initialization")
    print("=" * 60)
    
    status = get_db_status()
    print(f"Database Engine: {status['engine'].upper()}")
    print(f"PostgreSQL Active: {status['is_postgres']}")
    print(f"Status Note: {status['message']}")
    print("-" * 60)
    
    print("Creating tables if they do not exist...")
    Base.metadata.create_all(bind=engine)
    ensure_mission_hierarchy_schema(engine)
    print("Tables created successfully.")
    
    print("Ingesting verified seed dataset...")
    seed_database()

    print("Ingesting extended hardware dataset...")
    expand_database()

    db = SessionLocal()
    try:
        apply_mission_classifications(db)
    finally:
        db.close()
    
    # Verify counts
    db = SessionLocal()
    try:
        org_count = db.query(Organization).count()
        mission_count = db.query(Mission).count()
        hw_count = db.query(Hardware).count()
        img_count = db.query(HardwareImage).count()
        src_count = db.query(HardwareSource).count()
        
        print("-" * 60)
        print("Database Verification Summary:")
        print(f"  Organizations: {org_count}")
        print(f"  Missions:      {mission_count}")
        print(f"  Hardware:      {hw_count}")
        print(f"  Images/Data:   {img_count}")
        print(f"  Sources:       {src_count}")
        print("=" * 60)
        print("Initialization completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
