from sqlalchemy import text
from database import engine

with engine.connect() as connection:
    rows = connection.execute(text(
        "SELECT * FROM missions "
        "WHERE id IN (3, 10, 11, 25, 27, 57, 7, 8, 9, 56, 2, 20, 24, 1, 22, 13, 33, 35, 15)"
    ))
    for row in rows:
        print(tuple(row))
