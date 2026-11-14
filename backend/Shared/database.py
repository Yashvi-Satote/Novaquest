import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

Base = declarative_base()

# Configure database URL with fallback handling
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

db_info = {
    "engine_type": "unknown",
    "is_postgres": False,
    "connected": False,
    "error": None,
    "message": ""
}

def _is_postgres_url(url: str) -> bool:
    lowered = (url or "").strip().lower()
    return lowered.startswith(("postgresql://", "postgres://", "postgresql+psycopg://",
                               "postgresql+psycopg2://", "postgresql+asyncpg://"))


def create_db_engine():
    global DATABASE_URL
    
    # Check if PostgreSQL URL is provided. Accept driver-qualified URLs too
    # (postgresql+psycopg://, postgresql+psycopg2://).
    is_placeholder = any(p in (DATABASE_URL or "").lower() for p in ["your_db_user", "your_db_password", "placeholder"])
    if DATABASE_URL and _is_postgres_url(DATABASE_URL) and not is_placeholder:
        normalized_url = DATABASE_URL
        if normalized_url.startswith("postgres://"):
            normalized_url = normalized_url.replace("postgres://", "postgresql://", 1)
        if normalized_url.startswith("postgresql+asyncpg://"):
            normalized_url = normalized_url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
        if normalized_url.startswith("postgresql://"):
            normalized_url = "postgresql+psycopg2://" + normalized_url[len("postgresql://"):]
        
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
    
    # Fallback to local SQLite development database
    # Transparently declare this so the app never pretends PostgreSQL is connected when it is not
    db_path = os.getenv("NOVABASE_SQLITE_PATH", "").strip()
    if not db_path:
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "space_hardware.db")
    db_path = os.path.abspath(db_path)
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    sqlite_url = f"sqlite:///{db_path.replace(os.sep, '/')}"
    
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
        db_info["message"] = (
            "Active: Local SQLite development database. "
            "To connect to PostgreSQL, configure DATABASE_URL in .env and run init_db.py."
        )
    
    logger.info(f"Initialized SQLite database at {db_path}")
    return sqlite_engine

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Public dialect flags for code that needs to branch on the active backend.
IS_POSTGRES = bool(engine.dialect.name == "postgresql")
IS_SQLITE = bool(engine.dialect.name == "sqlite")

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
