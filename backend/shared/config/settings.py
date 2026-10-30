import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")
PORT = int(os.getenv("PORT", 5000))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

configured_sqlite_path = os.getenv("SQLITE_DATABASE_PATH", "").strip()
if configured_sqlite_path:
    SQLITE_DATABASE_PATH = (
        configured_sqlite_path
        if os.path.isabs(configured_sqlite_path) or configured_sqlite_path == ":memory:"
        else str(BACKEND_DIR / configured_sqlite_path)
    )
else:
    SQLITE_DATABASE_PATH = str(BACKEND_DIR / "space_hardware.db")
