import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from NovaBase.app import app, run
from NovaUser.app import init_novauser

# Register the NovaUser authentication API on the existing application.
# NovaBase already configures CORS for the SPA, so NovaUser reuses it here.
init_novauser(app, create_tables=True, enable_cors=False)


if __name__ == "__main__":
    run()
