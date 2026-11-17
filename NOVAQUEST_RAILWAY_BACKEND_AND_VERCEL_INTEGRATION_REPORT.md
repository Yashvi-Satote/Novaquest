# NOVAQUEST: PRODUCTION-READINESS AUDIT & RAILWAY INTEGRATION REPORT

**Date:** Sunday, November 15, 2026  
**Repository:** [Yashvi-Satote/Novaquest](https://github.com/Yashvi-Satote/Novaquest.git)  
**Branch:** `hacker_csh`  
**Frontend Deployment (Vercel):** [https://novaquest-mu.vercel.app](https://novaquest-mu.vercel.app)  
**Backend Target (Railway):** Python Flask + Gunicorn WSGI (`backend/app.py:app`)  
**Database Target (Railway):** Persistent Managed PostgreSQL  

---

## 1. Vercel Routing & Pure Frontend Isolation

- **Serverless Backend Removed:** Removed `services.backend` from `vercel.json`. Vercel now exclusively builds and hosts the React + Vite frontend and static assets, eliminating Python Lambda build overhead.
- **Route Protection:** Added `api/` to the negative lookahead pattern in `vercel.json` (`^(?:/((?!assets/|videos/|models/|textures/|api/|.*\..*).*))$ -> /index.html`). This prevents API calls from ever falling back to HTML documents.
- **SPA & Asset Verification:** All 7 main routes (`/`, `/app`, `/play`, `/novamap`, `/novabase`, `/memoir`, `/settings`) return **HTTP 200 OK**. Static assets (`biosentinel.glb`, `surveyor_5.gltf`) and the 73.19 MB master documentary return **HTTP 200 / 206 Partial Content**.
- **Prepared `/api/*` Rewrite Template:** Once the public Railway domain is created, add the proxy rule to the top of `rewrites` in `vercel.json`:
  ```json
  {
    "source": "/api/(.*)",
    "destination": "https://<your-railway-domain>.up.railway.app/api/$1"
  }
  ```
  *(Because requests to `https://novaquest-mu.vercel.app/api/...` remain first-party to the browser, authentication cookies (`novauser_token`) and headers pass through without cross-origin cookie blocking).*

---

## 2. Production Database Safety (`backend/Shared/database.py`)

- **Root Cause Identified:** Previously, if `DATABASE_URL` was missing or PostgreSQL connection failed, `Shared/database.py` silently fell back to local SQLite (`space_hardware.db`). On ephemeral cloud containers like Railway, this would cause catastrophic data loss on restart.
- **Production Guard Added:** Implemented `is_production()` checking `RAILWAY_ENVIRONMENT`, `FLASK_ENV`, `ENVIRONMENT`, and container signals.
- **Exact Production Behavior:**
  - If `DATABASE_URL` is missing, placeholder, or invalid in production: **Raises `RuntimeError` immediately** and halts startup with an explicit message directing the developer to configure persistent PostgreSQL.
  - If PostgreSQL connection fails in production: **Raises `RuntimeError` immediately** with the exact network/auth error.
  - **Silent SQLite fallback is strictly blocked in production.**
  - SQLite fallback is retained **only for local development** when no production environment flags are present.
- **Automated Verification:** Verified via automated tests in `backend/tests/test_production_readiness.py`.

---

## 3. NovaUser Database Initialization (`backend/NovaUser/database.py`)

- **Root Cause Identified:** Previously, `ensure_database()` connected to `dbname="postgres"` and attempted `CREATE DATABASE "users.db"`. On Railway and other managed cloud databases, users lack `CREATEDB` privileges and connecting to maintenance database `postgres` fails.
- **Provisioned Database Support:**
  - `ensure_database()` now attempts a direct connection to the target database specified in the URL path (`dbname=database_name`, e.g. `railway`) first.
  - If the database exists and connects (the standard case on Railway), `ensure_database()` returns immediately. **No maintenance connection is made and no `CREATE DATABASE` query is executed.**
  - `NOVAUSER_DATABASE_URL` safely falls back to `DATABASE_URL`, allowing both NovaBase and NovaUser to share the single Railway PostgreSQL instance without collisions.
  - `create_schema()` runs `Base.metadata.create_all(engine)` and idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` migrations, creating only the missing tables and **never dropping existing users or data**.

---

## 4. Test & Build Verification Summary

| Suite | Status | Details |
|---|---|---|
| **Production Readiness Tests** | ✅ **6 / 6 PASS** | `test_production_readiness.py` (production detection, SQLite blocking, Gunicorn routes, provisioned DB check) |
| **Security Test Suite** | ✅ **24 / 24 PASS** | `test_security.py` (CORS origin validation, path traversal protection, rate limiting, debug defaults) |
| **Frontend Unit Tests** | ✅ **60 / 60 PASS** | `npm test` (auth state, settings sync, progress checkpoints, API activity tracking) |
| **Frontend Production Build** | ✅ **PASS** | `npm run build` executed cleanly in 41.49s (0 errors) |
| **Live Vercel Routes & Assets** | ✅ **12 / 12 HTTP 200** | Direct navigation and page refresh verified on [https://novaquest-mu.vercel.app](https://novaquest-mu.vercel.app) |

---

## 5. Manual Railway Dashboard Steps Required

To deploy the backend to Railway, perform these steps in the Railway web dashboard:

### Step 1: Provision Managed PostgreSQL
1. Log in to your [Railway Dashboard](https://railway.com/dashboard).
2. Create a **New Project** (or open your existing project).
3. Click **+ New** > **Database** > **Add PostgreSQL**.
4. Railway will provision a persistent PostgreSQL database.

### Step 2: Deploy the Flask Backend Service
1. In the same project, click **+ New** > **GitHub Repo**.
2. Select repository `Yashvi-Satote/Novaquest`.
3. Set the deployment branch to `hacker_csh`.
4. Go to the new service's **Settings**:
   - **Root Directory:** Set to `/` (uses root `Procfile` / `railway.json`) or `/backend` (uses `backend/Procfile`).
   - The start command is pre-configured:
     `gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120 --chdir backend app:app`

### Step 3: Configure Environment Variables
In the Flask service **Variables** tab, add the following:

```env
FLASK_DEBUG=0
DATABASE_URL=${{Postgres.DATABASE_URL}}
NOVAUSER_DATABASE_URL=${{Postgres.DATABASE_URL}}
NOVAUSER_JWT_SECRET=<Generate a 32+ character random string>
NOVAUSER_COOKIE_SECURE=true
NOVAUSER_COOKIE_SAMESITE=Lax
CORS_ORIGINS=https://novaquest-mu.vercel.app,http://localhost:5173
NOVAUSER_CORS_ORIGINS=https://novaquest-mu.vercel.app,http://localhost:5173
```
*(Tip: In Railway, typing `${{Postgres.DATABASE_URL}}` automatically references the connection string from your PostgreSQL service).*

### Step 4: Generate Public Domain
1. In the Flask service **Settings** > **Networking**:
2. Click **Generate Domain**.
3. Railway will display a URL (e.g. `https://novaquest-backend-production.up.railway.app`).

### Step 5: Test Backend Health & Wire into Vercel
1. Test your live health endpoint:
   `curl https://<your-railway-domain>/api/health`
2. Provide the domain URL so I can add the production rewrite rule to `vercel.json` and perform the final end-to-end integration tests.
