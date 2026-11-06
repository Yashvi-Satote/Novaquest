-- =========================================================================
-- NovaBase Space Hardware, Missions & 3D Models Database Schema
-- PostgreSQL-first, idempotent DDL. SQLite compatible via the adapter in
-- backend/NovaBase/schema_tools.py (which rewrites SERIAL/JSONB/TIMESTAMPTZ
-- and skips statements marked "-- @postgres-only").
--
-- The default path NEVER drops tables. Destructive reset lives behind
-- `python -m backend.NovaBase.init_db --reset` and an explicit confirmation.
-- =========================================================================

-- @postgres-only
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- @postgres-only
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -------------------------------------------------------------------------
-- Versioning
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 1. Organizations
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    organization_type VARCHAR(100) NOT NULL DEFAULT 'Space Agency',
    country VARCHAR(100),
    official_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);

-- -------------------------------------------------------------------------
-- 2. Space Missions
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    mission_name VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    agency VARCHAR(255),
    mission_type VARCHAR(100),
    destination_category VARCHAR(100) NOT NULL,
    destination VARCHAR(100) DEFAULT 'Deep Space',
    launch_date VARCHAR(50),
    mission_end_date VARCHAR(50),
    end_date VARCHAR(50),
    mission_status VARCHAR(100) NOT NULL DEFAULT 'Active',
    description TEXT,
    objectives TEXT,
    official_url VARCHAR(500),
    source_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_missions_slug ON missions(slug);
CREATE INDEX IF NOT EXISTS idx_missions_destination ON missions(destination_category);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(mission_status);

-- -------------------------------------------------------------------------
-- 3. Spacecraft Catalog (kept backwards compatible with the existing app)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spacecraft (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    alternate_names TEXT,
    agency VARCHAR(255),
    manufacturer VARCHAR(255),
    spacecraft_type VARCHAR(100) NOT NULL DEFAULT 'Spacecraft',
    description TEXT,
    model_path VARCHAR(500),
    model_format VARCHAR(50) DEFAULT 'glb',
    thumbnail_path VARCHAR(500),
    source_url VARCHAR(500),
    display_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    object_type VARCHAR(100) NOT NULL DEFAULT 'Spacecraft',
    destination_category VARCHAR(100) NOT NULL DEFAULT 'Deep Space',
    destination VARCHAR(100) NOT NULL DEFAULT 'Deep Space',
    operational_status VARCHAR(100) NOT NULL DEFAULT 'Active / operational',
    physical_status VARCHAR(100),
    launch_date VARCHAR(50),
    decommission_date VARCHAR(50),
    landing_date VARCHAR(50),
    location_description VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    short_description TEXT NOT NULL,
    educational_description TEXT NOT NULL,
    how_it_works TEXT NOT NULL,
    why_it_is_important TEXT NOT NULL,
    scientific_purpose TEXT NOT NULL,
    current_or_last_known_status TEXT NOT NULL,
    hardware_materials TEXT,
    official_url VARCHAR(500) NOT NULL,
    eotss_url VARCHAR(500),
    verification_status VARCHAR(100) NOT NULL DEFAULT 'Verified from NASA/JPL Records',
    last_verified_at VARCHAR(50),
    primary_mission_id INTEGER REFERENCES missions(id) ON DELETE SET NULL,
    agency_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    manufacturer_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    operator_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    mission_agency_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    launch_provider_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    -- NovaBase 10-section extensions
    mission_type VARCHAR(50),
    primary_agency VARCHAR(255),
    summary TEXT,
    wiki_title VARCHAR(255),
    nssdca_id VARCHAR(50),
    arrival_or_landing_date VARCHAR(50),
    end_date VARCHAR(50),
    status_label VARCHAR(50),
    status_text TEXT,
    status_as_of VARCHAR(20),
    is_active_flag BOOLEAN DEFAULT FALSE,
    extra TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_name ON spacecraft(name);
CREATE INDEX IF NOT EXISTS idx_spacecraft_slug ON spacecraft(slug);
CREATE INDEX IF NOT EXISTS idx_spacecraft_object_type ON spacecraft(object_type);
CREATE INDEX IF NOT EXISTS idx_spacecraft_destination ON spacecraft(destination_category);
CREATE INDEX IF NOT EXISTS idx_spacecraft_operational_status ON spacecraft(operational_status);
CREATE INDEX IF NOT EXISTS idx_spacecraft_primary_mission ON spacecraft(primary_mission_id);

-- Search indexes (PostgreSQL only; the app uses ILIKE on SQLite).
-- @postgres-only
CREATE INDEX IF NOT EXISTS idx_spacecraft_name_trgm ON spacecraft USING GIN (name gin_trgm_ops);

-- @postgres-only
CREATE INDEX IF NOT EXISTS idx_spacecraft_summary_trgm ON spacecraft USING GIN (summary gin_trgm_ops);

-- -------------------------------------------------------------------------
-- 4. Legacy 3D model assets (kept for the existing frontend contract)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS models_3d (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    model_name VARCHAR(255) NOT NULL UNIQUE,
    folder_name VARCHAR(255) NOT NULL,
    primary_format VARCHAR(50) NOT NULL DEFAULT 'glb',
    glb_filename VARCHAR(255) NOT NULL,
    glb_path VARCHAR(500) NOT NULL,
    gltf_filename VARCHAR(255) NOT NULL,
    gltf_path VARCHAR(500) NOT NULL,
    bin_filename VARCHAR(255),
    bin_path VARCHAR(500),
    texture_files TEXT,
    texture_count INTEGER DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    provenance VARCHAR(255) NOT NULL DEFAULT 'NASA Eyes on the Solar System (Official Public Domain)',
    source_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_models_3d_spacecraft_id ON models_3d(spacecraft_id);
CREATE INDEX IF NOT EXISTS idx_models_3d_name ON models_3d(model_name);
CREATE INDEX IF NOT EXISTS idx_models_3d_available ON models_3d(is_available);

-- -------------------------------------------------------------------------
-- 5. Mission <-> Spacecraft
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_spacecraft (
    id SERIAL PRIMARY KEY,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL DEFAULT 'Primary Spacecraft',
    notes TEXT,
    CONSTRAINT uq_mission_spacecraft UNIQUE (mission_id, spacecraft_id)
);

CREATE INDEX IF NOT EXISTS idx_mission_spacecraft_mid ON mission_spacecraft(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_spacecraft_scid ON mission_spacecraft(spacecraft_id);

-- -------------------------------------------------------------------------
-- 6. Spacecraft aliases / keywords / images / sources
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spacecraft_aliases (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    alias_type VARCHAR(50) NOT NULL DEFAULT 'Alternate Name'
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_aliases_sc_id ON spacecraft_aliases(spacecraft_id);
CREATE INDEX IF NOT EXISTS idx_spacecraft_aliases_alias ON spacecraft_aliases(alias);

CREATE TABLE IF NOT EXISTS spacecraft_keywords (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_keywords_sc_id ON spacecraft_keywords(spacecraft_id);
CREATE INDEX IF NOT EXISTS idx_spacecraft_keywords_keyword ON spacecraft_keywords(keyword);

CREATE TABLE IF NOT EXISTS spacecraft_images (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL DEFAULT 'Photo',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(1000) NOT NULL,
    source_url VARCHAR(1000) NOT NULL,
    attribution VARCHAR(255) NOT NULL,
    publication_date VARCHAR(50),
    thumbnail_url VARCHAR(1000),
    kind VARCHAR(50) DEFAULT 'photo',
    credit VARCHAR(255),
    license VARCHAR(255),
    source_id INTEGER,
    width INTEGER,
    height INTEGER,
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_images_sc_id ON spacecraft_images(spacecraft_id);

CREATE TABLE IF NOT EXISTS spacecraft_sources (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    source_name VARCHAR(255) NOT NULL,
    source_url VARCHAR(1000) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    evidence_notes TEXT,
    last_checked_at VARCHAR(50),
    label VARCHAR(255),
    url VARCHAR(1000),
    verified BOOLEAN DEFAULT FALSE,
    http_status INTEGER,
    last_checked TIMESTAMP WITH TIME ZONE,
    source_id INTEGER,
    CONSTRAINT uq_spacecraft_source_url UNIQUE (spacecraft_id, source_url)
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_sources_sc_id ON spacecraft_sources(spacecraft_id);

-- -------------------------------------------------------------------------
-- 7. NovaBase section content (sections 1-4)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spacecraft_content (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    section_key VARCHAR(50) NOT NULL,
    body_text TEXT,
    source_id INTEGER REFERENCES spacecraft_sources(id) ON DELETE SET NULL,
    license VARCHAR(100),
    attribution VARCHAR(500),
    revision_id VARCHAR(50),
    page_url VARCHAR(1000),
    fetched_at TIMESTAMP WITH TIME ZONE,
    completeness VARCHAR(20) NOT NULL DEFAULT 'missing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_spacecraft_content UNIQUE (spacecraft_id, section_key)
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_content_sc ON spacecraft_content(spacecraft_id);
CREATE INDEX IF NOT EXISTS idx_spacecraft_content_key ON spacecraft_content(section_key);

-- -------------------------------------------------------------------------
-- 8. Parts ("How does it work?")
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spacecraft_parts (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    part_name VARCHAR(255) NOT NULL,
    purpose TEXT,
    sort_order INTEGER DEFAULT 0,
    CONSTRAINT uq_spacecraft_part UNIQUE (spacecraft_id, part_name)
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_parts_sc ON spacecraft_parts(spacecraft_id);

-- -------------------------------------------------------------------------
-- 9. Timeline (section 7)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS timeline_events (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    event_date VARCHAR(50),
    event_date_precision VARCHAR(20) DEFAULT 'day',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'event',
    source_id INTEGER REFERENCES spacecraft_sources(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    CONSTRAINT uq_timeline_event UNIQUE (spacecraft_id, event_date, title)
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_sc ON timeline_events(spacecraft_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(event_date);

-- -------------------------------------------------------------------------
-- 10. Stakeholders (section 8)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spacecraft_stakeholders (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    CONSTRAINT uq_spacecraft_stakeholder UNIQUE (spacecraft_id, organization_id, role)
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_stakeholders_sc ON spacecraft_stakeholders(spacecraft_id);

-- -------------------------------------------------------------------------
-- 11. 3D models (section 9)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spacecraft_models (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    file_path VARCHAR(1000),
    download_url VARCHAR(1500),
    format VARCHAR(20),
    size_bytes BIGINT,
    web_ready BOOLEAN DEFAULT FALSE,
    provider VARCHAR(100) DEFAULT 'NASA 3D Resources',
    license VARCHAR(200) DEFAULT 'NASA 3D resources are free to use without copyright',
    viewer_url VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'ok',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_spacecraft_model_url UNIQUE (spacecraft_id, download_url)
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_models_sc ON spacecraft_models(spacecraft_id);
CREATE INDEX IF NOT EXISTS idx_spacecraft_models_status ON spacecraft_models(status);

-- -------------------------------------------------------------------------
-- 12. Hardware components / 3D model catalogue
--
-- One row per 3D model asset in
-- https://raw.githubusercontent.com/matthewgiarra/spacecraft-models/main/viewer/models.json
-- Every row is linked to the physical spacecraft record it represents and to
-- the mission that deployed/operated that hardware.  The table stores the
-- complete raw metadata payload as well as the resolved local asset paths,
-- download URLs, formats and file sizes so that nothing is lost if the remote
-- catalogue changes.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hardware_components (
    id SERIAL PRIMARY KEY,
    component_key VARCHAR(255) NOT NULL UNIQUE,
    model_name VARCHAR(255) NOT NULL UNIQUE,
    folder_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    component_type VARCHAR(100) NOT NULL DEFAULT 'Spacecraft',
    description TEXT NOT NULL,
    description_html TEXT NOT NULL,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    mission_match_method VARCHAR(60) NOT NULL DEFAULT 'exact_match',
    mission_match_confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    eotss_url VARCHAR(1000) NOT NULL,
    viewer_url VARCHAR(1000) NOT NULL,
    official_url VARCHAR(1000) NOT NULL,
    gltf_filename VARCHAR(255) NOT NULL,
    glb_filename VARCHAR(255) NOT NULL,
    bin_filename VARCHAR(255) NOT NULL,
    gltf_path VARCHAR(1000) NOT NULL,
    glb_path VARCHAR(1000) NOT NULL,
    bin_path VARCHAR(1000) NOT NULL,
    download_gltf_url VARCHAR(1500) NOT NULL,
    download_glb_url VARCHAR(1500) NOT NULL,
    primary_format VARCHAR(20) NOT NULL DEFAULT 'glb',
    web_ready BOOLEAN NOT NULL DEFAULT TRUE,
    texture_files TEXT NOT NULL DEFAULT '[]',
    texture_count INTEGER NOT NULL DEFAULT 0,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    glb_size_bytes BIGINT NOT NULL DEFAULT 0,
    gltf_size_bytes BIGINT NOT NULL DEFAULT 0,
    binary_size_bytes BIGINT NOT NULL DEFAULT 0,
    provenance VARCHAR(255) NOT NULL DEFAULT 'NASA Eyes on the Solar System (Official Public Domain)',
    license VARCHAR(255) NOT NULL DEFAULT 'NASA 3D resources are free to use without copyright',
    source_name VARCHAR(255) NOT NULL DEFAULT 'NASA Eyes on the Solar System',
    source_url VARCHAR(1000) NOT NULL,
    source_repository VARCHAR(1000) NOT NULL DEFAULT 'https://github.com/matthewgiarra/spacecraft-models',
    raw_json TEXT NOT NULL,
    ingestion_status VARCHAR(30) NOT NULL DEFAULT 'complete',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hardware_components_spacecraft ON hardware_components(spacecraft_id);
CREATE INDEX IF NOT EXISTS idx_hardware_components_mission ON hardware_components(mission_id);
CREATE INDEX IF NOT EXISTS idx_hardware_components_model ON hardware_components(model_name);
CREATE INDEX IF NOT EXISTS idx_hardware_components_folder ON hardware_components(folder_name);
CREATE INDEX IF NOT EXISTS idx_hardware_components_type ON hardware_components(component_type);
CREATE INDEX IF NOT EXISTS idx_hardware_components_status ON hardware_components(ingestion_status);

-- Optional many-to-many bridge for hardware / model variants that are shared
-- by more than one mission (for example Voyager 1 + Voyager 2, or the twin
-- STEREO observatories).  hardware_components.mission_id remains the primary
-- mission; this table records every additional mission association.
CREATE TABLE IF NOT EXISTS hardware_component_missions (
    id SERIAL PRIMARY KEY,
    component_id INTEGER NOT NULL REFERENCES hardware_components(id) ON DELETE CASCADE,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    role VARCHAR(150) NOT NULL DEFAULT 'Hardware / 3D model',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    match_method VARCHAR(60) NOT NULL DEFAULT 'exact_match',
    match_confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_hardware_component_mission UNIQUE (component_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_hw_component_missions_component ON hardware_component_missions(component_id);
CREATE INDEX IF NOT EXISTS idx_hw_component_missions_mission ON hardware_component_missions(mission_id);

-- -------------------------------------------------------------------------
-- 13. People (section 10)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS people (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL UNIQUE,
    affiliation VARCHAR(255),
    bio_short TEXT,
    wiki_url VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spacecraft_people (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    role_on_mission VARCHAR(255),
    rank_order INTEGER NOT NULL,
    source_id INTEGER REFERENCES spacecraft_sources(id) ON DELETE SET NULL,
    CONSTRAINT uq_spacecraft_person_rank UNIQUE (spacecraft_id, rank_order),
    CONSTRAINT ck_spacecraft_person_rank CHECK (rank_order BETWEEN 1 AND 10)
);

CREATE INDEX IF NOT EXISTS idx_spacecraft_people_sc ON spacecraft_people(spacecraft_id);
CREATE INDEX IF NOT EXISTS idx_spacecraft_people_person ON spacecraft_people(person_id);

-- -------------------------------------------------------------------------
-- 14. Data sources and ingestion telemetry
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    api_name VARCHAR(100) NOT NULL UNIQUE,
    base_url VARCHAR(1000) NOT NULL,
    license VARCHAR(200),
    attribution TEXT,
    last_checked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(100) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    rows_inserted INTEGER DEFAULT 0,
    rows_updated INTEGER DEFAULT 0,
    errors TEXT,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_started ON ingestion_runs(started_at);

-- -------------------------------------------------------------------------
-- 15. Completeness view (used by verify_db and /api/novabase/health).
-- SQLite also supports this view syntax.
-- -------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS v_spacecraft_completeness AS
SELECT
    sc.id AS spacecraft_id,
    sc.slug AS slug,
    sc.display_name AS display_name,
    (SELECT COUNT(*) FROM spacecraft_content c WHERE c.spacecraft_id = sc.id AND c.section_key = 'what_is_it'       AND LENGTH(TRIM(COALESCE(c.body_text, ''))) > 0) AS what_is_it,
    (SELECT COUNT(*) FROM spacecraft_content c WHERE c.spacecraft_id = sc.id AND c.section_key = 'how_it_works'     AND LENGTH(TRIM(COALESCE(c.body_text, ''))) > 0) AS how_it_works,
    (SELECT COUNT(*) FROM spacecraft_content c WHERE c.spacecraft_id = sc.id AND c.section_key = 'why_important'   AND LENGTH(TRIM(COALESCE(c.body_text, ''))) > 0) AS why_important,
    (SELECT COUNT(*) FROM spacecraft_content c WHERE c.spacecraft_id = sc.id AND c.section_key = 'status'          AND LENGTH(TRIM(COALESCE(c.body_text, ''))) > 0) AS status,
    (SELECT COUNT(*) FROM spacecraft_images   i WHERE i.spacecraft_id = sc.id) AS images,
    (SELECT COUNT(*) FROM spacecraft_sources  s WHERE s.spacecraft_id = sc.id AND s.source_url IS NOT NULL AND LENGTH(TRIM(s.source_url)) > 0) AS sources,
    (SELECT COUNT(*) FROM timeline_events     t WHERE t.spacecraft_id = sc.id) AS timeline,
    (SELECT COUNT(*) FROM spacecraft_stakeholders k WHERE k.spacecraft_id = sc.id) AS stakeholders,
    (SELECT COUNT(*) FROM spacecraft_models   m WHERE m.spacecraft_id = sc.id AND m.status IN ('ok', 'no_model')) AS models,
    (SELECT COUNT(*) FROM spacecraft_people   p WHERE p.spacecraft_id = sc.id) AS people
FROM spacecraft sc;

-- -------------------------------------------------------------------------
-- 16. Hardware component coverage view
-- Reports one row per hardware component and whether every required
-- catalogue field is populated.  This is used by the ingestion script's
-- zero-missing-values validation pass and can be queried directly.
-- -------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS v_hardware_component_coverage AS
SELECT
    hc.id AS component_id,
    hc.component_key,
    hc.model_name,
    hc.spacecraft_id,
    hc.mission_id,
    CASE
        WHEN LENGTH(TRIM(COALESCE(hc.component_key, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.model_name, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.folder_name, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.display_name, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.full_name, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.component_type, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.description, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.description_html, ''))) > 0
         AND hc.spacecraft_id IS NOT NULL
         AND hc.mission_id IS NOT NULL
         AND LENGTH(TRIM(COALESCE(hc.eotss_url, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.viewer_url, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.official_url, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.gltf_filename, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.glb_filename, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.bin_filename, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.gltf_path, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.glb_path, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.bin_path, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.download_gltf_url, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.download_glb_url, ''))) > 0
         AND hc.file_size_bytes > 0
         AND hc.glb_size_bytes > 0
         AND hc.gltf_size_bytes > 0
         AND LENGTH(TRIM(COALESCE(hc.source_url, ''))) > 0
         AND LENGTH(TRIM(COALESCE(hc.raw_json, ''))) > 0
        THEN 1 ELSE 0
    END AS is_complete
FROM hardware_components hc;
