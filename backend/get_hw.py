from sqlalchemy import text
from database import engine

with engine.connect() as connection:
    rows = connection.execute(text(
        "SELECT id, name, mission_id, destination, object_type, operational_status "
        "FROM hardware ORDER BY mission_id, name"
    ))
    for row in rows:
        print(tuple(row))
