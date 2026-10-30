import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

Base = declarative_base()

# Configure database URL with fallback handling
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
configured_sqlite_path = os.getenv("SQLITE_DATABASE_PATH", "").strip()
if configured_sqlite_path:
    SQLITE_DATABASE_PATH = (
        configured_sqlite_path
        if os.path.isabs(configured_sqlite_path) or configured_sqlite_path == ":memory:"
        else os.path.join(BACKEND_DIR, configured_sqlite_path)
    )
else:
    SQLITE_DATABASE_PATH = os.path.join(BACKEND_DIR, "space_hardware.db")

db_info = {
    "engine_type": "unknown",
    "is_postgres": False,
    "connected": False,
    "error": None,
    "message": ""
}

def create_db_engine():
    # Check if PostgreSQL URL is provided
    if DATABASE_URL and (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")):
        # SQLAlchemy requires postgresql://
        normalized_url = DATABASE_URL
        if normalized_url.startswith("postgres://"):
            normalized_url = normalized_url.replace("postgres://", "postgresql://", 1)
        
        try:
            logger.info("Attempting connection to PostgreSQL...")
            pg_engine = create_engine(
                normalized_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
            # Test connection
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            db_info["engine_type"] = "postgresql"
            db_info["is_postgres"] = True
            db_info["connected"] = True
            db_info["message"] = "Connected to PostgreSQL database."
            logger.info("Successfully connected to PostgreSQL database.")
            return pg_engine
        except Exception as e:
            logger.warning(f"Failed to connect to PostgreSQL ({e}). Falling back to SQLite for local development.")
            db_info["error"] = str(e)
    
    if DATABASE_URL.startswith(("sqlite:", "sqlite+")):
        sqlite_engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
        )
        with sqlite_engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        db_info["engine_type"] = "sqlite"
        db_info["is_postgres"] = False
        db_info["connected"] = True
        db_info["message"] = "Connected to the configured SQLite database."
        logger.info("Connected to configured SQLite database URL.")
        return sqlite_engine

    # Fallback to local SQLite development database
    # Transparently declare this so the app never pretends PostgreSQL is connected when it is not
    if SQLITE_DATABASE_PATH != ":memory:":
        os.makedirs(os.path.dirname(SQLITE_DATABASE_PATH), exist_ok=True)
    sqlite_url = URL.create("sqlite", database=SQLITE_DATABASE_PATH)

    sqlite_engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )
    
    # Test connection
    with sqlite_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    
    db_info["engine_type"] = "sqlite"
    db_info["is_postgres"] = False
    db_info["connected"] = True
    if DATABASE_URL:
        db_info["message"] = (
            "PostgreSQL connection failed or unavailable. Active: Local SQLite database. "
            "To connect to PostgreSQL, verify DATABASE_URL and ensure PostgreSQL is running."
        )
    else:
        db_info["message"] = f"Active: SQLite database at {SQLITE_DATABASE_PATH}."
    
    logger.info(f"Initialized SQLite database at {SQLITE_DATABASE_PATH}")
    return sqlite_engine

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Database session generator for dependency injection or standalone usage."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_status():
    """Return database connection status and type."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            is_alive = True
    except Exception as e:
        is_alive = False
        db_info["error"] = str(e)
    
    return {
        "status": "connected" if is_alive else "disconnected",
        "engine": db_info["engine_type"],
        "is_postgres": db_info["is_postgres"],
        "message": db_info["message"],
        "error": db_info.get("error")
    }
