# Space in Time

> **Searchable, Interactive Space Hardware Catalogue**  
> Comprehensive catalogue of human-made hardware sent into space.

---

## Overview

**Space in Time** is a searchable, interactive space hardware application that catalogues human-made hardware sent into space, including satellites, spacecraft, landers, rovers, deep-space probes, rocket bodies, and surface equipment left on the Moon and Mars.

The catalogue is backed by verified data derived from official archives including **NASA NSSDCA**, **NASA Jet Propulsion Laboratory (JPL)**, the **NASA Planetary Data System (PDS)**, **CelesTrak SATCAT**, and **Space-Track**.

---

## Key Features

1. **Mission-Based Hierarchical Sidebar**:
   - Organized in canonical order: **Mars → Moon → Deep Space** (plus **Earth Orbit**).
   - Multi-level interactive hierarchy:  
     `Destination Category → Mission → Operational Status → Organization → Hardware Record`
   - Real-time dynamic counts generated directly from database records.
   - Independent vertical scrolling, multiple mission expansions, and one-click filter reset.

2. **Advanced Keyword & Combined Search**:
   - Fast, debounced search across hardware names, aliases, mission names, organizations, object types, status, launch timeline, materials, educational descriptions, and keywords.
   - Case-insensitive, multi-keyword, and partial-word matching.
   - Seamlessly combines search keywords with active sidebar filters.

3. **Expandable Hardware Cards (7-Section Scientific Anatomy)**:
   - **Collapsed View**: Hardware name, mission, organization, launch/landing timeline, destination, object type, and operational status badge.
   - **Expanded View** presents 7 strictly ordered educational and scientific sections:
     1. **What is it?** — Simplified educational narrative tailored for school students (ages 10–15) explaining what it is, why scientists sent it, what it did, and what we learned.
     2. **Mission and timeline** — Launch date, landing date, decommission date, location coordinates, and physical condition.
     3. **How does it work?** — Scientific and mechanical operation (power, propulsion, instruments, communications, materials).
     4. **Why is it important?** — Historical breakthroughs and scientific legacy.
     5. **Current or last-known status** — Verified present-day condition from telemetry and mission logs.
     6. **Images and related data** — Responsive gallery of up to 10 verified photographs, diagrams, and maps with attribution and click-to-enlarge lightbox modal.
     7. **Know more ↗** — Direct links to official mission websites, NASA PDS science archives, and technical documentation.

4. **Transparent Database Architecture**:
   - Primary production database: **PostgreSQL** with SQLAlchemy models, relational foreign keys, composite indexes, and full-text search.
   - Development fallback: Automatically detects if PostgreSQL is active; if not, seamlessly runs on a local SQLite database (`space_hardware.db`) without crashing.
   - **Strict Scientific Honesty**: The application explicitly reports its database status via `/api/health` and in the UI banner. It never falsely claims PostgreSQL is connected when it is not.

5. **Responsive & Accessible Design**:
   - Dark, space-inspired aesthetic with glassmorphism, subtle starfield, and glowing status indicators.
   - Mobile-friendly slide-out drawer with Escape key, backdrop click, and touch targets.
   - Full keyboard accessibility (`tabIndex`, `Enter`/`Space` to expand cards, arrow keys in image lightbox).

---

## Technology Stack

- **Frontend**: React 19 + Vite 8 (JavaScript JSX)
- **Styling**: Tailwind CSS v4 + Custom Cosmic Theme
- **Icons**: Lucide React
- **Backend**: Python 3 Flask REST API
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL (with psycopg2-binary driver and automatic SQLite fallback)
- **CORS**: Flask-CORS

---

## Directory Structure

```text
cosmic timekeepers/
├── backend/
│   ├── app.py              # Flask REST API server with query & hierarchy endpoints
│   ├── database.py         # SQLAlchemy engine with PostgreSQL & fallback handling
│   ├── models.py           # SQLAlchemy ORM models (Missions, Hardware, Images, etc.)
│   ├── schema.sql          # Native PostgreSQL DDL schema with indexes and GIN FTS
│   ├── seed_data.py        # Verified seed dataset ingestion script
│   ├── init_db.py          # Database initializer and table creation script
│   └── requirements.txt    # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx               # Navigation, branding & DB status badge
│   │   │   ├── Sidebar.jsx              # Hierarchical mission/status tree
│   │   │   ├── FilterBar.jsx            # Search bar, destination pills & sorting
│   │   │   ├── HardwareCard.jsx         # Collapsible card with 7 sections
│   │   │   ├── ImageGallery.jsx         # Responsive image grid with attribution
│   │   │   ├── ImageModal.jsx           # Enlarged modal lightbox with keyboard controls
│   │   │   └── DatabaseStatusModal.jsx  # Connection architecture & setup modal
│   │   ├── services/
│   │   │   └── api.js                   # Fetch API wrapper for REST endpoints
│   │   ├── App.jsx                      # Main React application coordinator
│   │   ├── index.css                    # Cosmic design tokens & glassmorphism
│   │   └── main.jsx                     # Vite React entry point
│   ├── index.html                       # HTML5 template with Space Grotesk & Inter
│   ├── vite.config.js                   # Vite config with Tailwind & /api proxy
│   └── package.json                     # Frontend dependencies
├── .env.example            # Environment variables template
└── README.md               # Complete project documentation
```

---

## Installation & Setup

### Prerequisites

- **Python**: 3.10+ (tested on Python 3.14)
- **Node.js**: v18+ (tested on Node.js v24 with npm)
- *(Optional)* **PostgreSQL**: 13+ (if running production database)

---

### Step 1: Backend Setup

1. Open a terminal in the project root:
   ```bash
   cd "d:/cosmic timekeepers"
   ```

2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. *(Optional)* Configure PostgreSQL in `.env`:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL credentials:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/space_hardware
   PORT=5000
   ```
   > **Note**: If `DATABASE_URL` is omitted or PostgreSQL is unreachable, the system automatically uses the local SQLite development database.

4. Initialize the database schema and ingest verified seed data:
   ```bash
   python backend/init_db.py
   ```
   Output:
   ```text
   ============================================================
   Space Hardware Explorer - Database Initialization
   ============================================================
   Database Engine: SQLITE (or POSTGRESQL)
   Creating tables...
   Ingesting verified seed dataset...
   Successfully seeded 18 hardware records into the database!
   ```

5. Start the Flask backend server:
   ```bash
   python backend/app.py
   ```
   The backend API will run on `http://127.0.0.1:5000`.

---

### Step 2: Frontend Setup

1. In a second terminal, navigate to `frontend`:
   ```bash
   cd "d:/cosmic timekeepers/frontend"
   ```

2. Install frontend packages:
   ```bash
   npm.cmd install
   ```

3. Start the Vite development server:
   ```bash
   npm.cmd run dev
   ```
   Open your browser to: **`http://localhost:5173/`**

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and database connection health check |
| `GET` | `/api/filters` | Dynamic hierarchical tree (Mars → Moon → Deep Space) and counts |
| `GET` | `/api/hardware` | Paginated hardware items with destination, status, and org filters |
| `GET` | `/api/hardware/search?q=...` | Unified multi-field keyword search |
| `GET` | `/api/hardware/<id>` | Full hardware record including educational description and sources |
| `GET` | `/api/hardware/<id>/images` | Up to 10 verified photographs, diagrams, and source attributions |
| `GET` | `/api/missions` | Mission list with destination categories and hardware counts |
| `GET` | `/api/missions/<id>/hardware` | All hardware objects belonging to a specific mission |
| `GET` | `/api/organizations` | Space agencies and aerospace manufacturers |

---

## Verified Seed Dataset Coverage

The included seed dataset represents verified hardware across multiple destinations:

- **Mars**:
  - *Perseverance Rover* (Mars 2020) — Active astrobiology rover caching samples in Jezero Crater.
  - *Ingenuity Helicopter* (Mars 2020) — Historic rotorcraft with 72 powered flights on Mars.
  - *Viking 1 Lander* — First successful long-duration Mars lander (Chryse Planitia).
  - *Sojourner Rover* (Mars Pathfinder) — First micro-rover on Mars (Ares Vallis).
  - *Opportunity Rover* (MER-B) — Explored 45.16 km over nearly 15 years in Meridiani Planum.
  - *Spirit Rover* (MER-A) — Uncovered ancient hydrothermal hot springs in Gusev Crater.
  - *InSight Lander* — Geophysics station that recorded over 1,300 marsquakes.
- **Moon**:
  - *Apollo 11 Lunar Module Descent Stage (Eagle)* — Foundation at Tranquility Base.
  - *Apollo 15 Lunar Roving Vehicle (LRV-1)* — First electric vehicle driven on the Moon.
  - *Surveyor 1 Lander* — Verified lunar soil load-bearing capacity for Apollo.
  - *Surveyor 3 Lander* — Famously visited 2.5 years later by Apollo 12 astronauts.
  - *Yutu-2 Rover (Chang'e 4)* — First rover on the lunar far side (Von Kármán crater).
- **Deep Space**:
  - *Voyager 1* — Humanity's most distant ambassador in interstellar space (>163 AU).
  - *Voyager 2* — Sole spacecraft to visit Jupiter, Saturn, Uranus, and Neptune.
  - *New Horizons* — First reconnaissance of Pluto, Charon, and Kuiper Belt object Arrokoth.
- **Earth Orbit**:
  - *Hubble Space Telescope* — Premier optical orbital observatory.
  - *Vanguard 1* — Oldest human-made object still in orbit around Earth (launched 1958).
  - *SL-16 R/B (Zenit-2 Rocket Body)* — Derelict upper stage rocket body tracked as orbital space debris.

---

## Testing & Quality Assurance

### Verification Checklist

- [x] **Desktop Layout**: 3-pane layout with independently scrollable sidebar, sticky search bar, and hardware cards.
- [x] **Mobile Drawer**: Slide-out drawer with hamburger toggle, backdrop blur click-to-close, and Escape key listener.
- [x] **Sidebar Order**: Exact sequence: **Mars**, **Moon**, **Deep Space**, then **Earth Orbit**.
- [x] **Nested Tree**: `Destination → Mission → Status → Organization → Hardware` with live counts.
- [x] **7-Section Card**: Every expanded card displays:
  1. What is it?
  2. Mission and timeline
  3. How does it work?
  4. Why is it important?
  5. Current or last-known status
  6. Images and related data
  7. Know more ↗
- [x] **Educational Explanations**: Written specifically for students ages 10–15 without sacrificing factual accuracy.
- [x] **Image Lightbox**: Modal viewer with Previous/Next controls, Escape to close, captions, and official credits.
- [x] **Search & Combined Filters**: Multi-keyword search works simultaneously with sidebar filters and sort options.
- [x] **Database Transparency**: UI and API accurately declare whether PostgreSQL or local development SQLite is active.

---

## License

This educational project was created for the **NASA Space Apps Challenge**. All mission data, photographs, and schematics are credited to **NASA**, **JPL-Caltech**, **ESA**, **CNSA**, and the **NASA Planetary Data System**.
