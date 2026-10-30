import logging

from flask import Flask
from flask_cors import CORS

from NovaBase.routes.api import api
from NovaBase.services.bootstrap import bootstrap_database
from shared.config.settings import CORS_ORIGIN, FLASK_DEBUG, PORT

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = Flask(__name__)
CORS(
    app,
    origins=[CORS_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    supports_credentials=True,
)
app.register_blueprint(api)
bootstrap_database()


if __name__ == "__main__":
    print(f"Starting Space Hardware Explorer Backend on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=FLASK_DEBUG)
