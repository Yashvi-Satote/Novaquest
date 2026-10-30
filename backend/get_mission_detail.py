from sqlalchemy import inspect
from database import engine

for column in inspect(engine).get_columns("missions"):
    print(column)
