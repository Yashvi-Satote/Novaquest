import sys
from pathlib import Path

from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from shared.database.connection import engine

with engine.connect() as connection:
    rows = connection.execute(text(
        "SELECT id, name, mission_id FROM hardware "
        "WHERE mission_id IN (13, 33, 35) ORDER BY mission_id, name"
    ))
    for row in rows:
        print(tuple(row))
