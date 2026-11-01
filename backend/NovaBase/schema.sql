-- =========================================================================
-- Novaquest Scalable Space Hardware, Missions & 3D Models Database Schema
-- Scalable PostgreSQL DDL / SQLite Compatible
-- =========================================================================

-- Enable extensions if supported (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables with dependencies
DROP TABLE IF EXISTS spacecraft_sources CASCADE;
DROP TABLE IF EXISTS spacecraft_images CASCADE;
DROP TABLE IF EXISTS spacecraft_keywords CASCADE;
DROP TABLE IF EXISTS spacecraft_aliases CASCADE;
DROP TABLE IF EXISTS models_3d CASCADE;
DROP TABLE IF EXISTS mission_spacecraft CASCADE;
DROP TABLE IF EXISTS spacecraft CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop legacy compatibility tables if present
DROP TABLE IF EXISTS hardware_sources CASCADE;
DROP TABLE IF EXISTS hardware_images CASCADE;
DROP TABLE IF EXISTS hardware_keywords CASCADE;
DROP TABLE IF EXISTS hardware_aliases CASCADE;
DROP TABLE IF EXISTS hardware CASCADE;

-- 1. Organizations
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    organization_type VARCHAR(100) NOT NULL DEFAULT 'Space Agency',
    country VARCHAR(100),
    official_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_type ON organizations(organization_type);

-- 2. Space Missions
CREATE TABLE missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    destination_category VARCHAR(100) NOT NULL, -- 'Mars', 'Moon', 'Deep Space', 'Earth Orbit', 'Heliophysics', 'Asteroids & Comets'
    launch_date VARCHAR(50),
    mission_end_date VARCHAR(50),
    mission_status VARCHAR(100) NOT NULL DEFAULT 'Active', -- 'Active', 'Completed', 'Extended', 'Decommissioned'
    description TEXT,
    official_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missions_slug ON missions(slug);
CREATE INDEX idx_missions_destination ON missions(destination_category);
CREATE INDEX idx_missions_status ON missions(mission_status);

-- 3. Spacecraft Catalog
CREATE TABLE spacecraft (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    object_type VARCHAR(100) NOT NULL DEFAULT 'Spacecraft', -- 'Orbiter', 'Rover', 'Lander', 'Space Telescope', 'Flyby Probe', 'Satellite', 'Space Station'
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
    manufacturer_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    operator_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    mission_agency_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    launch_provider_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spacecraft_name ON spacecraft(name);
CREATE INDEX idx_spacecraft_slug ON spacecraft(slug);
CREATE INDEX idx_spacecraft_object_type ON spacecraft(object_type);
CREATE INDEX idx_spacecraft_destination ON spacecraft(destination_category);
CREATE INDEX idx_spacecraft_operational_status ON spacecraft(operational_status);
CREATE INDEX idx_spacecraft_primary_mission ON spacecraft(primary_mission_id);

-- 4. 3D Models (Physical Model Assets)
CREATE TABLE models_3d (
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

CREATE INDEX idx_models_3d_spacecraft_id ON models_3d(spacecraft_id);
CREATE INDEX idx_models_3d_name ON models_3d(model_name);
CREATE INDEX idx_models_3d_available ON models_3d(is_available);

-- 5. Many-to-Many Association: Missions <-> Spacecraft
CREATE TABLE mission_spacecraft (
    id SERIAL PRIMARY KEY,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL DEFAULT 'Primary Spacecraft',
    notes TEXT,
    CONSTRAINT uq_mission_spacecraft UNIQUE (mission_id, spacecraft_id)
);

CREATE INDEX idx_mission_spacecraft_mid ON mission_spacecraft(mission_id);
CREATE INDEX idx_mission_spacecraft_scid ON mission_spacecraft(spacecraft_id);

-- 6. Spacecraft Aliases
CREATE TABLE spacecraft_aliases (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    alias_type VARCHAR(50) NOT NULL DEFAULT 'Alternate Name'
);

CREATE INDEX idx_spacecraft_aliases_sc_id ON spacecraft_aliases(spacecraft_id);
CREATE INDEX idx_spacecraft_aliases_alias ON spacecraft_aliases(alias);

-- 7. Spacecraft Keywords
CREATE TABLE spacecraft_keywords (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL
);

CREATE INDEX idx_spacecraft_keywords_sc_id ON spacecraft_keywords(spacecraft_id);
CREATE INDEX idx_spacecraft_keywords_keyword ON spacecraft_keywords(keyword);

-- 8. Spacecraft Images
CREATE TABLE spacecraft_images (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL DEFAULT 'Photo',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(1000) NOT NULL,
    source_url VARCHAR(1000) NOT NULL,
    attribution VARCHAR(255) NOT NULL,
    publication_date VARCHAR(50)
);

CREATE INDEX idx_spacecraft_images_sc_id ON spacecraft_images(spacecraft_id);

-- 9. Spacecraft Sources
CREATE TABLE spacecraft_sources (
    id SERIAL PRIMARY KEY,
    spacecraft_id INTEGER NOT NULL REFERENCES spacecraft(id) ON DELETE CASCADE,
    source_name VARCHAR(255) NOT NULL,
    source_url VARCHAR(1000) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    evidence_notes TEXT,
    last_checked_at VARCHAR(50)
);

CREATE INDEX idx_spacecraft_sources_sc_id ON spacecraft_sources(spacecraft_id);
