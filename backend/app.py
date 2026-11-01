import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from NovaBase.app import app, run


if __name__ == "__main__":
    run()
