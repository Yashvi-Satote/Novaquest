"""Manage the optional portable PostgreSQL instance used for local NovaUser dev.

The production application only needs ``NOVAUSER_DATABASE_URL``.  This helper is
for environments (like this workspace) where PostgreSQL is not installed as a
system service.  It uses real PostgreSQL binaries and a real PostgreSQL data
directory; it does not emulate PostgreSQL with SQLite.

Commands:
    python backend/NovaUser/local_postgres.py init
    python backend/NovaUser/local_postgres.py start
    python backend/NovaUser/local_postgres.py stop
    python backend/NovaUser/local_postgres.py status
    python backend/NovaUser/local_postgres.py setup
"""

from __future__ import annotations

import getpass
import os
import subprocess
import sys
import tempfile
from pathlib import Path

MODULE_DIR = Path(__file__).resolve().parent
PG_ROOT = MODULE_DIR / ".pg"
INSTALL_DIR = PG_ROOT / "install" / "pgsql"
BIN_DIR = INSTALL_DIR / "bin"
DATA_DIR = PG_ROOT / "data"
LOG_FILE = PG_ROOT / "postgres.log"
DEFAULT_PORT = "55432"
DEFAULT_USER = "novauser"


def _port() -> str:
    return os.getenv("NOVAUSER_PG_PORT", DEFAULT_PORT)


def _database_password() -> str:
    password = os.getenv("NOVAUSER_PG_PASSWORD", "")
    if password:
        return password
    if not sys.stdin.isatty():
        raise SystemExit(
            "Set NOVAUSER_PG_PASSWORD or run the command in an interactive terminal."
        )
    password = getpass.getpass("New PostgreSQL password for novauser: ")
    if len(password) < 8:
        raise SystemExit("Use a password with at least 8 characters.")
    return password


def _run(
    *args: str, check: bool = True, capture: bool = True
) -> subprocess.CompletedProcess:
    command = [str(BIN_DIR / args[0]), *args[1:]]
    # Never capture pg_ctl output: the postgres child process inherits the pipe
    # on Windows and keeps it open after pg_ctl exits, which makes Python wait.
    output = subprocess.PIPE if capture else subprocess.DEVNULL
    return subprocess.run(
        command, check=check, text=True, stdout=output, stderr=output
    )


def _require_binaries() -> None:
    postgres = BIN_DIR / "postgres.exe"
    if not postgres.exists():
        postgres = BIN_DIR / "postgres"
    if not postgres.exists():
        raise SystemExit(
            "PostgreSQL binaries were not found in "
            f"{BIN_DIR}.\nDownload the Windows x64 binaries zip from "
            "https://www.enterprisedb.com/download-postgresql-binaries and "
            f"extract its pgsql folder into {INSTALL_DIR}."
        )


def init_cluster() -> None:
    _require_binaries()
    if (DATA_DIR / "PG_VERSION").exists():
        print(f"Cluster already initialised at {DATA_DIR}")
        return

    DATA_DIR.parent.mkdir(parents=True, exist_ok=True)
    password = _database_password()
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", suffix=".txt", delete=False
    ) as handle:
        handle.write(password)
        password_file = Path(handle.name)

    try:
        result = _run(
            "initdb",
            "-D",
            str(DATA_DIR),
            "-U",
            DEFAULT_USER,
            "--pwfile",
            str(password_file),
            "--auth",
            "scram-sha-256",
            "--encoding",
            "UTF8",
        )
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
    finally:
        password_file.unlink(missing_ok=True)
    print(f"Initialised PostgreSQL cluster at {DATA_DIR}")


def start_cluster() -> None:
    _require_binaries()
    if not (DATA_DIR / "PG_VERSION").exists():
        raise SystemExit("Run the init command first.")
    result = _run(
        "pg_ctl",
        "-D",
        str(DATA_DIR),
        "-l",
        str(LOG_FILE),
        "-o",
        f"-p {_port()} -h 127.0.0.1",
        "-w",
        "start",
        check=False,
        capture=False,
    )
    if result.returncode == 0:
        print(f"PostgreSQL is running on 127.0.0.1:{_port()}")
        print(f"Server log: {LOG_FILE}")
    else:
        print(f"Could not start PostgreSQL. See {LOG_FILE} for details.")
        raise SystemExit(result.returncode)


def stop_cluster() -> None:
    _require_binaries()
    if not (DATA_DIR / "PG_VERSION").exists():
        raise SystemExit("No local cluster exists.")
    result = _run("pg_ctl", "-D", str(DATA_DIR), "-m", "fast", "-w", "stop", check=False)
    print((result.stdout or "") + (result.stderr or ""))
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def status_cluster() -> int:
    _require_binaries()
    result = _run(
        "pg_isready", "-h", "127.0.0.1", "-p", _port(), check=False
    )
    print((result.stdout or "") + (result.stderr or ""))
    return 0 if result.returncode == 0 else 1


def main() -> int:
    command = sys.argv[1].lower() if len(sys.argv) > 1 else "status"
    if command == "init":
        init_cluster()
    elif command == "start":
        start_cluster()
    elif command == "stop":
        stop_cluster()
    elif command == "status":
        return status_cluster()
    elif command == "setup":
        init_cluster()
        start_cluster()
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
