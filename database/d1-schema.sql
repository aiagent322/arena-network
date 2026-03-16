-- Arena Network — D1 SQLite Schema

DROP TABLE IF EXISTS llm_usage;
DROP TABLE IF EXISTS scrape_jobs;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS sponsors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS arenas;

CREATE TABLE arenas (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    description     TEXT,
    city            TEXT,
    state           TEXT,
    address         TEXT,
    zip             TEXT,
    latitude        REAL,
    longitude       REAL,
    phone           TEXT,
    email           TEXT,
    website         TEXT,
    logo_url        TEXT,
    cover_image_url TEXT,
    arena_type      TEXT DEFAULT 'equine',
    surface_type    TEXT,
    indoor_arenas   INTEGER DEFAULT 0,
    outdoor_arenas  INTEGER DEFAULT 0,
    seating_capacity INTEGER DEFAULT 0,
    stall_count     INTEGER DEFAULT 0,
    rv_spaces       INTEGER DEFAULT 0,
    membership_level TEXT DEFAULT 'free',
    is_verified     INTEGER DEFAULT 0,
    is_active       INTEGER DEFAULT 1,
    claimed_by      TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_arenas_state  ON arenas(state);
CREATE INDEX idx_arenas_type   ON arenas(arena_type);
CREATE INDEX idx_arenas_active ON arenas(is_active);
CREATE INDEX idx_arenas_slug   ON arenas(slug);

CREATE TABLE events (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    arena_id        TEXT REFERENCES arenas(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    description     TEXT,
    event_type      TEXT,
    discipline      TEXT,
    start_date      TEXT NOT NULL,
    end_date        TEXT,
    start_time      TEXT,
    end_time        TEXT,
    entry_fee       REAL,
    added_money     REAL,
    promoter        TEXT,
    website         TEXT,
    contact_name    TEXT,
    contact_phone   TEXT,
    contact_email   TEXT,
    flyer_url       TEXT,
    source_url      TEXT,
    status          TEXT DEFAULT 'pending',
    is_approved     INTEGER DEFAULT 0,
    is_scraped      INTEGER DEFAULT 0,
    scrape_job_id   TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_start    ON events(start_date);
CREATE INDEX idx_events_arena    ON events(arena_id);
CREATE INDEX idx_events_type     ON events(event_type);
CREATE INDEX idx_events_status   ON events(status);
CREATE INDEX idx_events_approved ON events(is_approved);
CREATE INDEX idx_events_slug     ON events(slug);

CREATE TABLE vendors (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    arena_id        TEXT REFERENCES arenas(id) ON DELETE SET NULL,
    vendor_name     TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    description     TEXT,
    category        TEXT,
    website         TEXT,
    booth_location  TEXT,
    contact_name    TEXT,
    contact_email   TEXT,
    phone           TEXT,
    logo_url        TEXT,
    city            TEXT,
    state           TEXT,
    is_active       INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_arena    ON vendors(arena_id);
CREATE INDEX idx_vendors_state    ON vendors(state);
CREATE INDEX idx_vendors_slug     ON vendors(slug);

CREATE TABLE sponsors (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    arena_id        TEXT REFERENCES arenas(id) ON DELETE SET NULL,
    sponsor_name    TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    logo            TEXT,
    website         TEXT,
    sponsor_level   TEXT DEFAULT 'bronze',
    contact_name    TEXT,
    contact_email   TEXT,
    contract_start  TEXT,
    contract_end    TEXT,
    annual_value    REAL,
    is_active       INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sponsors_level  ON sponsors(sponsor_level);
CREATE INDEX idx_sponsors_arena  ON sponsors(arena_id);
CREATE INDEX idx_sponsors_active ON sponsors(is_active);
CREATE INDEX idx_sponsors_slug   ON sponsors(slug);

CREATE TABLE users (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    arena_id        TEXT REFERENCES arenas(id) ON DELETE SET NULL,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    display_name    TEXT,
    role            TEXT DEFAULT 'manager',
    is_active       INTEGER DEFAULT 1,
    last_login      TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_arena ON users(arena_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

CREATE TABLE news (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    arena_id        TEXT REFERENCES arenas(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    body            TEXT,
    excerpt         TEXT,
    cover_image_url TEXT,
    author_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
    publish_date    TEXT,
    is_published    INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_news_arena   ON news(arena_id);
CREATE INDEX idx_news_publish ON news(publish_date);
CREATE INDEX idx_news_slug    ON news(slug);

CREATE TABLE llm_usage (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    arena_id        TEXT REFERENCES arenas(id) ON DELETE SET NULL,
    user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
    operation       TEXT NOT NULL,
    model           TEXT,
    input_tokens    INTEGER DEFAULT 0,
    output_tokens   INTEGER DEFAULT 0,
    tokens          INTEGER DEFAULT 0,
    cost            REAL DEFAULT 0,
    endpoint        TEXT,
    metadata        TEXT,
    timestamp       TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_llm_usage_arena     ON llm_usage(arena_id);
CREATE INDEX idx_llm_usage_operation ON llm_usage(operation);
CREATE INDEX idx_llm_usage_timestamp ON llm_usage(timestamp);

-- Fix 5: Added index for news published queries
CREATE INDEX idx_news_published ON news(is_published, publish_date DESC);

CREATE TABLE scrape_jobs (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    source_url      TEXT NOT NULL,
    source_type     TEXT,
    status          TEXT DEFAULT 'pending',
    events_found    INTEGER DEFAULT 0,
    events_created  INTEGER DEFAULT 0,
    raw_data        TEXT,
    parsed_data     TEXT,
    error_message   TEXT,
    started_at      TEXT,
    completed_at    TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_scrape_jobs_status ON scrape_jobs(status);
