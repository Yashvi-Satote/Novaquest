import logging

from NovaBase.services.expand_db import expand_database
from NovaBase.services.mission_hierarchy import (
    apply_mission_classifications,
    ensure_mission_hierarchy_schema,
)
from NovaBase.services.seed_data import seed_database
from shared.database.connection import SessionLocal, engine

logger = logging.getLogger(__name__)


def bootstrap_database():
    """Create tables and ensure the full verified dataset is present."""
    try:
        seed_database()
        ensure_mission_hierarchy_schema(engine)
        expand_database()
        db = SessionLocal()
        try:
            apply_mission_classifications(db)
        finally:
            db.close()
    except Exception as error:
        logger.error("Database bootstrap failed: %s", error)
