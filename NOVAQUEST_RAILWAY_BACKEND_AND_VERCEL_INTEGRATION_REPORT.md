# NOVAQUEST: PRODUCTION DEPLOYMENT REPORT (VERCEL FRONTEND + RAILWAY BACKEND)

**Date:** Sunday, November 15, 2026  
**Repository:** [Yashvi-Satote/Novaquest](https://github.com/Yashvi-Satote/Novaquest.git)  
**Branch:** `hacker_csh`  
**Frontend Deployment (Vercel):** [https://novaquest-mu.vercel.app](https://novaquest-mu.vercel.app)  
**Backend Target (Railway):** Python 3.11/3.12 Flask + Gunicorn WSGI  
**Database Target (Railway):** Persistent Managed PostgreSQL  

---

## 1. Executive Summary & Vercel Frontend Status

- **Vercel Production Deployment:** Live at [https://novaquest-mu.vercel.app](https://novaquest-mu.vercel.app) (Aliased from deployment `dpl_BC8NLw1r8N2zQJfB7D1eBECkHJY8`).
- **SPA Routing Verification:** All client routes return **HTTP 200** with `text/html; charset=utf-8` on direct browser entry and refresh:
  - `/` (Home), `/app` (Mission Control), `/play` (Surveyor 5 Moon Mission), `/novamap` (3D Solar System), `/novabase` (Spacecraft Catalog), `/memoir` (Cinematic Documentary), `/settings` (Preferences).
- **Static Asset Streaming:** All 3D assets (`biosentinel.glb`, `surveyor_5.gltf`) and the 73.19 MB master documentary (`surveyor3_5min_master_documentary.mp4`) return **HTTP 200 / 206 Partial Content** with exact MIME types and byte-range seeking.
- **Frontend Build Status:** Succeeded (`npm run build` executed in 35.43s, 0 errors).
- **Unit Tests:** 60/60 tests passing (`npm test`).

---

## 2. Railway Backend Architecture & Configuration

### Application Entry Point
- **Root Entry Point:** `backend/app.py`
- **WSGI Object:** `app`
- **Modules Combined:** `NovaBase` (hardware catalog, 3D models, missions, celestial map) and `NovaUser` (Firebase + JWT authentication, settings, checkpoint progress).
- **Production Server:** `Gunicorn` (added `gunicorn>=22.0.0` to `backend/requirements.txt`).

### Production Start Commands Configured
Two configurations have been committed so Railway deploys successfully regardless of whether the service root is set to the repository root or `/backend`:
1. **Repository Root (`Procfile` / `railway.json`):**
   ```bash
   gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120 --chdir backend app:app
   ```
2. **Backend Directory (`backend/Procfile` / `backend/railway.json`):**
   ```bash
   gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120 app:app
   ```

### Graceful Startup & Resilience
- **Debug Mode:** Automatically disabled in production (`FLASK_DEBUG=0`).
- **Non-blocking Startup:** If PostgreSQL is temporarily unreachable during startup, the application still boots safely and serves cached/degraded health status rather than crashing.
- **Database Fallback:** `NOVAUSER_DATABASE_URL` safely falls back to `DATABASE_URL` if only a single PostgreSQL instance is attached.

---

## 3. Persistent PostgreSQL Configuration

### Driver & Connection String Handling
- **Driver:** `psycopg2-binary` (pinned in `backend/requirements.txt`).
- **URI Normalization:** Both `Shared/database.py` and `NovaUser/database.py` automatically convert `postgres://` or `postgresql://` URIs provided by Railway into `postgresql+psycopg2://`.
- **Connection Pooling:** Configured with `pool_pre_ping=True`, `pool_size=10`, `max_overflow=20` to withstand idle timeouts.
- **Schema & Data Protection:**
  - Idempotent table creation via `bootstrap_schema(engine)` and `create_schema()`.
  - Guard check `inspect(engine).has_table("spacecraft")` prevents re-ingesting or overwriting existing data on every restart.
  - Zero SQLite dependency when `DATABASE_URL` is configured.

---

## 4. Railway Environment Variables Reference

Configure the following variables in the **Railway Service > Variables** tab:

| Variable | Required | Recommended Production Value | Description |
|---|---|---|---|
| `PORT` | Auto | *Managed by Railway* (e.g. `8080` or `5000`) | Web server listen port |
| `FLASK_DEBUG` | **Yes** | `0` | Disables debug mode and Werkzeug pin |
| `DATABASE_URL` | **Yes** | `${{Postgres.DATABASE_URL}}` | Connection string to Railway PostgreSQL |
| `NOVAUSER_DATABASE_URL` | Optional | `${{Postgres.DATABASE_URL}}` | Auth database (falls back to `DATABASE_URL`) |
| `NOVAUSER_JWT_SECRET` | **Yes** | *(Generate 32+ character random secret)* | Secret key for signing session tokens |
| `NOVAUSER_JWT_ISSUER` | No | `novauser` | JWT issuer claim |
| `NOVAUSER_JWT_AUDIENCE` | No | `novauser-web` | JWT audience claim |
| `NOVAUSER_TOKEN_EXPIRE_MINUTES` | No | `60` | Token expiration duration |
| `NOVAUSER_COOKIE_SECURE` | **Yes** | `true` | Enforces `Secure` flag on HTTPS cookies |
| `NOVAUSER_COOKIE_SAMESITE` | **Yes** | `Lax` | SameSite cookie policy |
| `CORS_ORIGINS` | **Yes** | `https://novaquest-mu.vercel.app,http://localhost:5173` | Allowed CORS origins |
| `NOVAUSER_CORS_ORIGINS` | **Yes** | `https://novaquest-mu.vercel.app,http://localhost:5173` | NovaUser allowed CORS origins |

> [!NOTE]
> Generate a secure 32+ character string for `NOVAUSER_JWT_SECRET` using:
> `python -c "import secrets; print(secrets.token_urlsafe(32))"`

---

## 5. Connecting Vercel to Railway

When you deploy the backend on Railway, Railway assigns a public domain (for example, `https://novaquest-backend.up.railway.app`).

### Option A: Vercel Proxy Rewrite (Recommended)
This approach routes `/api/*` through Vercel's edge network to Railway:
- Requests from the browser remain **same-origin** (`https://novaquest-mu.vercel.app/api/...`), completely avoiding cross-origin cookie restrictions and preflight delays.
- Update `vercel.json` rewrites:
  ```json
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://<your-railway-domain>.up.railway.app/api/$1"
    },
    {
      "source": "/((?!assets/|videos/|models/|textures/|.*\\..*).*)",
      "destination": "/index.html"
    }
  ]
  ```

### Option B: Frontend Environment Variable
The frontend code in `frontend/Shared/services/api.js` and `frontend/NovaUser/services/authApi.js` has been updated to support `VITE_API_BASE_URL`.
- In Vercel Project Settings > Environment Variables, set:
  - `VITE_API_BASE_URL` = `https://<your-railway-domain>.up.railway.app`
- Trigger a redeploy. The frontend will point directly to the Railway backend.

---

## 6. Step-by-Step Railway Deployment Guide

1. Log in to [Railway](https://railway.com).
2. Click **+ New Project** > **Provision PostgreSQL**.
3. In the same project, click **+ New** > **GitHub Repo** > Select `Yashvi-Satote/Novaquest`.
4. Set the branch to `hacker_csh`.
5. Under **Settings > General**:
   - **Root Directory:** `/` (or `/backend`).
6. Under **Variables**:
   - Add the variables from Section 4 above (attach `DATABASE_URL` from the PostgreSQL service).
7. Under **Settings > Networking**:
   - Click **Generate Domain** (gives you `https://xxxx.up.railway.app`).
8. Provide this domain to update Vercel.

---

## 7. Status Checklist

| Component | Status | Details |
|---|---|---|
| **Vercel Frontend** | ✅ **LIVE** | [https://novaquest-mu.vercel.app](https://novaquest-mu.vercel.app) |
| **Vercel SPA Rewrites** | ✅ **VERIFIED** | Deep routes (`/novamap`, `/novabase`, etc.) return 200 |
| **Flask WSGI Entry Point** | ✅ **READY** | `backend/app.py` tested and verified |
| **Gunicorn Configuration** | ✅ **COMMITTED** | Added to requirements, `Procfile`, and `railway.json` |
| **PostgreSQL Compatibility** | ✅ **VERIFIED** | Automatic normalization to `postgresql+psycopg2://` |
| **Git Synchronization** | ✅ **PUSHED** | Pushed cleanly to `origin/hacker_csh` (commit `461b561`) |
| **Railway Deployment** | ⏳ **Awaiting Domain** | Ready for dashboard deployment |
