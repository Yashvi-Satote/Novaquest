"""Create the NovaUser PostgreSQL database and users table.

Usage (from the project root):

    python backend/NovaUser/init_db.py

The script is idempotent and never drops existing accounts.
"""

from __future__ import annotations

import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
for path in (PROJECT_DIR, BACKEND_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

try:  # package import when run as ``python -m NovaUser.init_db``
    from .config import ConfigError
    from .database import check_database, create_schema, database_info
except ImportError:  # script import when run as ``python backend/NovaUser/init_db.py``
    from NovaUser.config import ConfigError
    from NovaUser.database import check_database, create_schema, database_info


def main() -> int:
    try:
        info = database_info()
        print("NovaUser PostgreSQL configuration")
        print(f"  host     : {info['host']}")
        print(f"  port     : {info['port']}")
        print(f"  database : {info['database']}")
        print(f"  user     : {info['user']}")

        create_schema()
        status = check_database()
        print("\nSchema ready")
        print(f"  engine   : {status['engine']}")
        print(f"  database : {status['database']}")
        print(f"  server   : {status.get('server_version', 'unknown')}")
        print("  table    : users")
        return 0
    except ConfigError as exc:
        print(f"Configuration error: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:
        print(f"Database setup failed: {exc}", file=sys.stderr)
        print(
            "Start PostgreSQL (or the bundled local instance) and verify "
            "NOVAUSER_DATABASE_URL in .env.",
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
