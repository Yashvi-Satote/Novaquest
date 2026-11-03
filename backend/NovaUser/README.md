# NovaUser backend

JWT email/password authentication for NovaUser, stored in a real PostgreSQL
database named `users.db`.

## Layout

| File | Purpose |
| --- | --- |
| `config.py` | Environment validation, JWT, cookie and CORS settings |
| `database.py` | PostgreSQL-only engine, database creation, schema helpers |
| `models.py` | `users` table (UUID id, unique email, bcrypt hash, timestamps) |
| `validation.py` | Registration/login validation and password policy |
| `security.py` | bcrypt hashing, JWT signing and verification |
| `middleware.py` | Bearer/cookie extraction, `@auth_required` decorator |
| `routes.py` | `/api/novauser/*` endpoints |
| `app.py` | Standalone app factory and `init_novauser(app)` integration hook |
| `init_db.py` | Idempotent database/schema setup command |
| `local_postgres.py` | Optional helper for the bundled portable PostgreSQL instance |
| `schema.sql` | SQL reference for the `users` table |
| `tests/test_auth.py` | API, JWT, cookie and schema tests |

## Environment

Copy the NovaUser section from the root `.env.example` into `.env` (or use
`backend/NovaUser/.env.example`) and set real values:

```dotenv
NOVAUSER_DATABASE_URL=postgresql://novauser:your_password@localhost:5432/users.db
NOVAUSER_JWT_SECRET=<long random value, at least 32 characters>
NOVAUSER_JWT_ISSUER=novauser
NOVAUSER_JWT_AUDIENCE=novauser-web
NOVAUSER_TOKEN_EXPIRE_MINUTES=60
NOVAUSER_COOKIE_NAME=novauser_token
NOVAUSER_COOKIE_SECURE=false   # true behind HTTPS
NOVAUSER_COOKIE_SAMESITE=Lax
NOVAUSER_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Never commit `.env` or a real JWT secret.

## Database setup

With an existing PostgreSQL server:

```bash
python backend/NovaUser/init_db.py
```

The command creates the `users.db` database if needed and creates the `users`
table idempotently. PostgreSQL treats `users.db` as an identifier, not a file.

### Portable local PostgreSQL (no system install)

This workspace includes real PostgreSQL 17.2 Windows binaries in
`.pg/install/pgsql` (ignored by git). To initialise and start a local cluster:

```bash
# PowerShell; choose your own password
$env:NOVAUSER_PG_PASSWORD = "novauser_dev_password"
python backend/NovaUser/local_postgres.py setup
python backend/NovaUser/init_db.py
```

The local instance listens on `127.0.0.1:55432` and stores data in
`backend/NovaUser/.pg/data`. Use the matching URL:

```dotenv
NOVAUSER_DATABASE_URL=postgresql://novauser:novauser_dev_password@127.0.0.1:55432/users.db
```

Other commands: `start`, `stop`, `status`.

## Run

From the project root:

```bash
python backend/app.py
```

`backend/app.py` registers NovaUser on the existing NovaBase Flask app. The API
is available at `http://localhost:5000/api/novauser/*`. NovaUser can also run
as a standalone app via `NovaUser.app.create_app()`.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/novauser/auth/register` | Create an account, set auth cookie, return JWT |
| `POST` | `/api/novauser/auth/login` | Verify credentials, set auth cookie, return JWT |
| `POST` | `/api/novauser/auth/logout` | Clear the auth cookie |
| `GET` | `/api/novauser/auth/me` | Protected account details (`@auth_required`) |
| `GET` | `/api/novauser/health` | Service and PostgreSQL status |
| `GET` | `/api/novauser/auth/count` | Account count (operational check) |

Registration body:

```json
{ "full_name": "Ada Lovelace", "email": "ada@example.com", "password": "OrbitPass9" }
```

Login body:

```json
{ "email": "ada@example.com", "password": "OrbitPass9" }
```

Successful responses include `user`, `access_token`, `token_type` and
`expires_in`. The JWT is also set as an HTTP-only `novauser_token` cookie.
Password hashes are never serialised.

Error shape:

```json
{ "error": { "code": "validation_error", "message": "...", "fields": { "email": "..." } } }
```

## Test

The tests use the configured PostgreSQL database and clean up accounts ending
in `@example.test`:

```bash
python -m unittest backend/NovaUser/tests/test_auth.py -v
```

## Firebase / Google

Google buttons are UI placeholders only. Firebase is intentionally not
installed or configured. The service layer and provider boundaries are kept
separate so Firebase Authentication can be added later without changing the
JWT email/password flow.
