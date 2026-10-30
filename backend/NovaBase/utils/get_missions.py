import sys
from pathlib import Path

from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from shared.database.connection import engine

with engine.connect() as connection:
    rows = connection.execute(text(
        "SELECT id, name, destination_category, mission_status "
        "FROM missions ORDER BY destination_category, name"
    ))
    for row in rows:
        print(*row)
