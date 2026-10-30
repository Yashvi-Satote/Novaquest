from sqlalchemy import text
from database import engine

with engine.connect() as connection:
    rows = connection.execute(text(
        "SELECT id, name, destination_category, mission_status "
        "FROM missions ORDER BY destination_category, name"
    ))
    for row in rows:
        print(*row)
