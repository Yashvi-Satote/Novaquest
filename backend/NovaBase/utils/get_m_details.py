import sys
from pathlib import Path

from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from shared.database.connection import engine

with engine.connect() as connection:
    rows = connection.execute(text(
        "SELECT * FROM missions "
        "WHERE id IN (3, 10, 11, 25, 27, 57, 7, 8, 9, 56, 2, 20, 24, 1, 22, 13, 33, 35, 15)"
    ))
    for row in rows:
        print(tuple(row))
