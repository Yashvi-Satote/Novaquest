-- =========================================================================
-- Space Hardware Explorer Database Schema (PostgreSQL DDL)
-- NASA Space Apps Educational Space Exploration Web Application
-- =========================================================================

-- Optional: Enable PostgreSQL extensions for advanced search if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop tables if recreating
DROP TABLE IF EXISTS hardware_sources CASCADE;
DROP TABLE IF EXISTS hardware_images CASCADE;
DROP TABLE IF EXISTS hardware_keywords CASCADE;
DROP TABLE IF EXISTS hardware_aliases CASCADE;
DROP TABLE IF EXISTS hardware CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

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

-- 2. Missions
CREATE TABLE missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    destination_category VARCHAR(100) NOT NULL, -- 'Mars', 'Moon', 'Deep Space', 'Earth Orbit'
    launch_date VARCHAR(50),
    mission_end_date VARCHAR(50),
    mission_status VARCHAR(100) NOT NULL DEFAULT 'Active',
    description TEXT,
    official_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missions_slug ON missions(slug);
CREATE INDEX idx_missions_destination ON missions(destination_category);
CREATE INDEX idx_missions_status ON missions(mission_status);

-- 3. Hardware Objects
CREATE TABLE hardware (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    manufacturer_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    operator_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    mission_agency_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    launch_provider_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    object_type VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    operational_status VARCHAR(100) NOT NULL, -- 'Active / operational', 'Inactive / decommissioned', 'Unknown / disputed'
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
    verification_status VARCHAR(100) NOT NULL DEFAULT 'Verified from NASA/JPL Records',
    last_verified_at VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hardware_name ON hardware(name);
CREATE INDEX idx_hardware_slug ON hardware(slug);
CREATE INDEX idx_hardware_mission_id ON hardware(mission_id);
CREATE INDEX idx_hardware_manufacturer_id ON hardware(manufacturer_id);
CREATE INDEX idx_hardware_operator_id ON hardware(operator_id);
CREATE INDEX idx_hardware_mission_agency_id ON hardware(mission_agency_id);
CREATE INDEX idx_hardware_destination ON hardware(destination);
CREATE INDEX idx_hardware_object_type ON hardware(object_type);
CREATE INDEX idx_hardware_operational_status ON hardware(operational_status);
CREATE INDEX idx_hardware_composite_filter ON hardware(destination, operational_status, object_type);

-- Full-text search index on Hardware
CREATE INDEX idx_hardware_fts ON hardware USING GIN (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(educational_description, '') || ' ' || coalesce(scientific_purpose, ''))
);

-- 4. Hardware Aliases & Alternative Names
CREATE TABLE hardware_aliases (
    id SERIAL PRIMARY KEY,
    hardware_id INTEGER NOT NULL REFERENCES hardware(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    alias_type VARCHAR(50) NOT NULL DEFAULT 'Alternate Name'
);

CREATE INDEX idx_hardware_aliases_hw_id ON hardware_aliases(hardware_id);
CREATE INDEX idx_hardware_aliases_alias ON hardware_aliases(alias);

-- 5. Hardware Search Keywords
CREATE TABLE hardware_keywords (
    id SERIAL PRIMARY KEY,
    hardware_id INTEGER NOT NULL REFERENCES hardware(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL
);

CREATE INDEX idx_hardware_keywords_hw_id ON hardware_keywords(hardware_id);
CREATE INDEX idx_hardware_keywords_keyword ON hardware_keywords(keyword);

-- 6. Hardware Images & Visual Data
CREATE TABLE hardware_images (
    id SERIAL PRIMARY KEY,
    hardware_id INTEGER NOT NULL REFERENCES hardware(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL DEFAULT 'Photo', -- 'Photo', 'Diagram', 'Data Visualization', 'Map'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(1000) NOT NULL,
    source_url VARCHAR(1000) NOT NULL,
    attribution VARCHAR(255) NOT NULL,
    publication_date VARCHAR(50)
);

CREATE INDEX idx_hardware_images_hw_id ON hardware_images(hardware_id);

-- 7. Official Documentation Sources
CREATE TABLE hardware_sources (
    id SERIAL PRIMARY KEY,
    hardware_id INTEGER NOT NULL REFERENCES hardware(id) ON DELETE CASCADE,
    source_name VARCHAR(255) NOT NULL,
    source_url VARCHAR(1000) NOT NULL,
    source_type VARCHAR(100) NOT NULL, -- 'Official Mission Website', 'Science Data Archive', 'Technical Documentation', 'Image Archive'
    evidence_notes TEXT,
    last_checked_at VARCHAR(50)
);

CREATE INDEX idx_hardware_sources_hw_id ON hardware_sources(hardware_id);
