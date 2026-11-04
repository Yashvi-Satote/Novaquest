# Novaquest 🚀

**Every forgotten mission has a story waiting to be rediscovered.**

Novaquest is an interactive space exploration and digital storytelling experience that brings the history of space missions and space hardware to life. Explore the stories behind humanity's journeys beyond Earth, discover missions that have ended, and learn about the technology that helped us explore the unknown.

Built for **NASA Space Apps Challenge**, Novaquest aims to make space history more engaging, accessible, and exciting for the next generation of explorers.

## 🌌 What You Can Explore

- **Space Missions:** Discover missions that shaped our understanding of space.
- **Forgotten Stories:** Revisit missions and technologies whose journeys have come to an end.
- **Space Hardware:** Learn about the spacecraft and equipment that made exploration possible.
- **Interactive Discovery:** Explore space history through an engaging, accessible digital experience.
- **Learn Through Exploration:** Make complex space topics easier and more exciting to discover.

## 🎯 Our Mission

Space exploration is more than the discoveries we celebrate today. It is also the experiments, machines, missions, and ideas that came before them.

Novaquest brings these stories into focus, encouraging curiosity about the past while inspiring the explorers of tomorrow.

## 🛰️ Built For

- Space enthusiasts
- Students and young explorers
- Educators and curious learners
- Anyone interested in space missions and the history of exploration

## 🛠️ Technology

Novaquest is developed using web technologies and data-driven features to deliver an interactive learning experience.

## 🗄️ NovaBase setup for teammates

NovaBase is the space-hardware database behind the Novaquest explorer. PostgreSQL is
the primary backend; SQLite is an explicit local fallback when `DATABASE_URL` is
unset or unreachable.

### 1. Configure the environment

```powershell
Copy-Item .env.example .env
```

For PostgreSQL, either point `DATABASE_URL` at an existing server:

```text
DATABASE_URL=postgresql+psycopg2://novabase:novabase_dev_password@localhost:5432/space_hardware
```

or start the bundled development server:

```powershell
docker compose up -d
```

`NOVAUSER_DATABASE_URL` and the NovaUser authentication code are separate and must
not be changed for NovaBase work.

### 2. Build the database (one command)

```powershell
.venv\Scripts\python.exe -m backend.NovaBase.init_db --bootstrap
```

This creates the PostgreSQL database if it does not exist, applies
`backend/NovaBase/schema.sql`, and ingests the 20 focus missions from
`backend/NovaBase/data/missions_registry.json` using live Wikipedia and NASA 3D
Resources APIs. The default path never drops tables and can be re-run safely.

Useful flags:

```powershell
# Schema only, no network calls
.venv\Scripts\python.exe -m backend.NovaBase.init_db --schema-only

# Re-ingest one mission
.venv\Scripts\python.exe -m backend.NovaBase.init_db --ingest-only --slug surveyor-1

# Destructive rebuild (asks for confirmation)
.venv\Scripts\python.exe -m backend.NovaBase.init_db --reset
```

### 3. Verify the 10 sections

```powershell
# Fast, no network
.venv\Scripts\python.exe -m backend.NovaBase.verify_db --skip-network

# Also check every stored source/image/model URL
.venv\Scripts\python.exe -m backend.NovaBase.verify_db
```

The command prints a per-spacecraft PASS/FAIL table and exits non-zero on failure.
The same data is available at `GET /api/novabase/health`, and the Explorer page
shows a database/section badge.

### 4. Tests

```powershell
.venv\Scripts\python.exe -m pytest backend\tests -q
```

### 5. Add spacecraft #21 (no code changes)

Add one registry entry and ingest it:

```powershell
.venv\Scripts\python.exe -m backend.NovaBase.expand_db add `
  --slug europa-clipper `
  --name "Europa Clipper" `
  --wiki-title "Europa_Clipper" `
  --destination-category "Deep Space" `
  --object-type "Orbiter" `
  --agency "NASA/JPL" `
  --launch-date 2024-10-14 `
  --status-label active `
  --person "Robert Pappalardo=Project Scientist" `
  --apply
```

Or edit `backend/NovaBase/data/missions_registry.json` directly (same fields) and run
`init_db --ingest-only --slug <slug>`. Registry entries without a verified person list
or date are stored as `missing`, never invented.

## ⚖️ Data attribution

Narrative text comes from Wikipedia and is stored with the page URL, revision id and
CC BY-SA 4.0 attribution; the detail page renders that attribution. Wikimedia Commons
images keep their per-image license/author. 3D models come from NASA 3D Resources
and are free to use without copyright. Missing facts are shown as `Missing — not
available in the current sources.`

## 🚀 Explore Novaquest

Discover the missions. Uncover the stories. Continue the quest.

---

*An independent educational project created for the NASA Space Apps Challenge. Novaquest is not an official NASA product and is not endorsed by NASA.*