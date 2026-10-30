import sys
from pathlib import Path

from sqlalchemy import inspect

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from shared.database.connection import engine

for column in inspect(engine).get_columns("missions"):
    print(column)
