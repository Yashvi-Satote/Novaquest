-- NovaUser authentication schema (PostgreSQL)
-- The application also creates this schema and applies incremental migrations
-- idempotently through SQLAlchemy.
-- Database name: "users.db"

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    firebase_uid VARCHAR(128) UNIQUE,
    auth_provider VARCHAR(32) NOT NULL DEFAULT 'password',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_users_full_name_length CHECK (char_length(btrim(full_name)) >= 2),
    CONSTRAINT ck_users_full_name_max CHECK (char_length(full_name) <= 120),
    CONSTRAINT ck_users_email_lowercase CHECK (email = lower(email)),
    CONSTRAINT ck_users_email_max CHECK (char_length(email) <= 320),
    CONSTRAINT ck_users_firebase_uid_max CHECK (
        firebase_uid IS NULL OR char_length(firebase_uid) <= 128
    )
);

-- Existing databases: safe, idempotent upgrades.
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;
UPDATE users SET auth_provider = 'password' WHERE auth_provider IS NULL;
ALTER TABLE users ALTER COLUMN auth_provider SET DEFAULT 'password';
ALTER TABLE users ALTER COLUMN auth_provider SET NOT NULL;
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_firebase_uid
    ON users (firebase_uid) WHERE firebase_uid IS NOT NULL;

-- Per-user NovaQuest data.
CREATE TABLE IF NOT EXISTS user_game_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_game_progress (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    progress JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
