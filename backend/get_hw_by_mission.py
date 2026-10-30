from sqlalchemy import text
from database import engine

with engine.connect() as connection:
    rows = connection.execute(text(
        "SELECT id, name, mission_id FROM hardware "
        "WHERE mission_id IN (13, 33, 35) ORDER BY mission_id, name"
    ))
    for row in rows:
        print(tuple(row))
