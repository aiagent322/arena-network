-- ============================================================
-- ARENA NETWORK PLATFORM — PostgreSQL Schema
-- League of Agricultural and Equine Centers
--
-- Tables: arenas, events, vendors, sponsors,
--         users, news, llm_usage, scrape_jobs
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ARENAS
-- ============================================================

CREATE TABLE arenas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    city            VARCHAR(100),
    state           VARCHAR(50),
    address         VARCHAR(255),
    zip             VARCHAR(20),
    latitude        DECIMAL(10, 7),
    longitude       DECIMAL(10, 7),
    phone           VARCHAR(30),
    email           VARCHAR(255),
    website         VARCHAR(500),
    logo_url        VARCHAR(500),
    cover_image_url VARCHAR(500),
    arena_type      VARCHAR(50) DEFAULT 'equine',
    surface_type    VARCHAR(100),
    indoor_arenas   INTEGER DEFAULT 0,
    outdoor_arenas  INTEGER DEFAULT 0,
    seating_capacity INTEGER DEFAULT 0,
    stall_count     INTEGER DEFAULT 0,
    rv_spaces       INTEGER DEFAULT 0,
    membership_level VARCHAR(50) DEFAULT 'free',
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    claimed_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arenas_state  ON arenas(state);
CREATE INDEX idx_arenas_type   ON arenas(arena_type);
CREATE INDEX idx_arenas_active ON arenas(is_active);
CREATE INDEX idx_arenas_slug   ON arenas(slug);

-- ============================================================
-- 2. EVENTS
-- ============================================================

CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arena_id        UUID REFERENCES arenas(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    event_type      VARCHAR(100),
    discipline      VARCHAR(100),
    start_date      DATE NOT NULL,
    end_date        DATE,
    start_time      TIME,
    end_time        TIME,
    entry_fee       DECIMAL(10, 2),
    added_money     DECIMAL(10, 2),
    promoter        VARCHAR(255),
    website         VARCHAR(500),
    contact_name    VARCHAR(255),
    contact_phone   VARCHAR(30),
    contact_email   VARCHAR(255),
    flyer_url       VARCHAR(500),
    source_url      VARCHAR(500),
    status          VARCHAR(50) DEFAULT 'pending',
    is_approved     BOOLEAN DEFAULT FALSE,
    is_scraped      BOOLEAN DEFAULT FALSE,
    scrape_job_id   UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_start    ON events(start_date);
CREATE INDEX idx_events_arena    ON events(arena_id);
CREATE INDEX idx_events_type     ON events(event_type);
CREATE INDEX idx_events_status   ON events(status);
CREATE INDEX idx_events_approved ON events(is_approved);
CREATE INDEX idx_events_slug     ON events(slug);

-- ============================================================
-- 3. VENDORS
-- ============================================================

CREATE TABLE vendors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arena_id        UUID REFERENCES arenas(id) ON DELETE SET NULL,
    vendor_name     VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    category        VARCHAR(100),
    website         VARCHAR(500),
    booth_location  VARCHAR(255),
    contact_name    VARCHAR(255),
    contact_email   VARCHAR(255),
    phone           VARCHAR(30),
    logo_url        VARCHAR(500),
    city            VARCHAR(100),
    state           VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_arena    ON vendors(arena_id);
CREATE INDEX idx_vendors_state    ON vendors(state);
CREATE INDEX idx_vendors_slug     ON vendors(slug);

-- ============================================================
-- 4. SPONSORS
-- ============================================================

CREATE TABLE sponsors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arena_id        UUID REFERENCES arenas(id) ON DELETE SET NULL,
    sponsor_name    VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    logo            VARCHAR(500),
    website         VARCHAR(500),
    sponsor_level   VARCHAR(50) DEFAULT 'bronze',
    contact_name    VARCHAR(255),
    contact_email   VARCHAR(255),
    contract_start  DATE,
    contract_end    DATE,
    annual_value    DECIMAL(10, 2),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sponsors_level  ON sponsors(sponsor_level);
CREATE INDEX idx_sponsors_arena  ON sponsors(arena_id);
CREATE INDEX idx_sponsors_active ON sponsors(is_active);
CREATE INDEX idx_sponsors_slug   ON sponsors(slug);

-- ============================================================
-- 5. USERS
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arena_id        UUID REFERENCES arenas(id) ON DELETE SET NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    role            VARCHAR(50) DEFAULT 'manager',
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_arena ON users(arena_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- 6. NEWS
-- ============================================================

CREATE TABLE news (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arena_id        UUID REFERENCES arenas(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    body            TEXT,
    excerpt         VARCHAR(500),
    cover_image_url VARCHAR(500),
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    publish_date    DATE,
    is_published    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_arena   ON news(arena_id);
CREATE INDEX idx_news_publish ON news(publish_date);
CREATE INDEX idx_news_slug    ON news(slug);

-- ============================================================
-- 7. LLM USAGE
-- ============================================================

CREATE TABLE llm_usage (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arena_id        UUID REFERENCES arenas(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    operation       VARCHAR(100) NOT NULL,
    model           VARCHAR(100),
    input_tokens    INTEGER DEFAULT 0,
    output_tokens   INTEGER DEFAULT 0,
    tokens          INTEGER DEFAULT 0,
    cost            DECIMAL(10, 6) DEFAULT 0,
    endpoint        VARCHAR(255),
    metadata        JSONB,
    timestamp       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_llm_usage_arena     ON llm_usage(arena_id);
CREATE INDEX idx_llm_usage_operation ON llm_usage(operation);
CREATE INDEX idx_llm_usage_timestamp ON llm_usage(timestamp);
CREATE INDEX idx_llm_usage_user      ON llm_usage(user_id);

-- ============================================================
-- 8. SCRAPE JOBS (Event Scraping Pipeline)
-- ============================================================

CREATE TABLE scrape_jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_url      VARCHAR(500) NOT NULL,
    source_type     VARCHAR(50),
    status          VARCHAR(50) DEFAULT 'pending',
    events_found    INTEGER DEFAULT 0,
    events_created  INTEGER DEFAULT 0,
    raw_data        JSONB,
    parsed_data     JSONB,
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scrape_jobs_status ON scrape_jobs(status);

-- ============================================================
-- SEED DATA — Arenas
-- ============================================================

INSERT INTO arenas (name, slug, city, state, address, arena_type, indoor_arenas, outdoor_arenas, stall_count, rv_spaces, seating_capacity, website, is_verified) VALUES
(
    'WestWorld of Scottsdale',
    'westworld-scottsdale',
    'Scottsdale', 'AZ',
    '16601 N Pima Rd, Scottsdale, AZ 85260',
    'equine',
    4, 6, 2200, 800, 8000,
    'https://www.scottsdaleaz.gov/westworld',
    TRUE
),
(
    'Buckeye Equestrian Center',
    'buckeye-equestrian',
    'Buckeye', 'AZ',
    '799 N Miller Rd, Buckeye, AZ 85326',
    'equine',
    1, 3, 400, 200, 2500,
    NULL,
    TRUE
),
(
    'Rancho Rio Arena',
    'rancho-rio',
    'Wickenburg', 'AZ',
    '37505 S Rancho Rio Dr, Wickenburg, AZ 85390',
    'equine',
    1, 2, 300, 150, 1500,
    NULL,
    TRUE
),
(
    'South Point Arena & Equestrian Center',
    'south-point',
    'Las Vegas', 'NV',
    '9777 Las Vegas Blvd S, Las Vegas, NV 89183',
    'multi-use',
    2, 1, 1200, 500, 4600,
    'https://www.southpointcasino.com/amenities/equestrian-center',
    TRUE
),
(
    'Bell County Expo Center',
    'bell-county-expo',
    'Belton', 'TX',
    '301 W Loop 121, Belton, TX 76513',
    'agricultural',
    3, 2, 800, 400, 6500,
    'https://www.bellcountyexpo.com',
    TRUE
),
(
    'Lazy E Arena',
    'lazy-e',
    'Guthrie', 'OK',
    '7201 E Hwy 66, Guthrie, OK 73044',
    'equine',
    1, 2, 600, 350, 5800,
    'https://www.lazye.com',
    TRUE
),
(
    'Will Rogers Memorial Center',
    'will-rogers',
    'Fort Worth', 'TX',
    '3401 W Lancaster Ave, Fort Worth, TX 76107',
    'multi-use',
    5, 3, 3000, 600, 10000,
    'https://www.fortworthtexas.gov/departments/public-events/will-rogers',
    TRUE
),
(
    'Tulsa Expo Square',
    'tulsa-expo',
    'Tulsa', 'OK',
    '4145 E 21st St, Tulsa, OK 74114',
    'multi-use',
    4, 3, 1800, 500, 9200,
    'https://www.exposquare.com',
    TRUE
),
(
    'State Fair Park — Oklahoma City',
    'okc-state-fair',
    'Oklahoma City', 'OK',
    '3001 General Pershing Blvd, Oklahoma City, OK 73107',
    'agricultural',
    3, 4, 2000, 700, 12000,
    'https://okstatefair.com',
    TRUE
),
(
    'Horseshoe Park & Equestrian Centre',
    'horseshoe-park',
    'Queen Creek', 'AZ',
    '20464 E Riggs Rd, Queen Creek, AZ 85142',
    'equine',
    2, 3, 500, 250, 3000,
    NULL,
    TRUE
);

-- ============================================================
-- SEED DATA — Events
-- ============================================================

INSERT INTO events (arena_id, title, slug, event_type, discipline, start_date, end_date, promoter, status, is_approved) VALUES
(
    (SELECT id FROM arenas WHERE slug = 'westworld-scottsdale'),
    'Arizona Sun Circuit',
    'az-sun-circuit-2026',
    'horse show', 'western',
    '2026-03-20', '2026-03-29',
    'Sun Circuit LLC',
    'approved', TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'lazy-e'),
    'Cinch Timed Event Championship',
    'cinch-tec-2026',
    'rodeo', 'timed event',
    '2026-04-10', '2026-04-12',
    'Cinch / Lazy E Arena',
    'approved', TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'south-point'),
    'South Point Futurity',
    'south-point-futurity-2026',
    'futurity', 'reining',
    '2026-05-01', '2026-05-05',
    'South Point Equestrian',
    'approved', TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'will-rogers'),
    'NCHA Summer Spectacular',
    'ncha-summer-2026',
    'futurity', 'cutting',
    '2026-06-10', '2026-07-05',
    'NCHA',
    'approved', TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'westworld-scottsdale'),
    'Arizona Equifest',
    'az-equifest-2026',
    'expo', 'multi-discipline',
    '2026-04-04', '2026-04-06',
    'Equifest Productions',
    'pending', FALSE
),
(
    (SELECT id FROM arenas WHERE slug = 'tulsa-expo'),
    'International Finals Rodeo',
    'ifr-2026',
    'rodeo', 'rodeo',
    '2026-01-09', '2026-01-17',
    'IFR Committee',
    'approved', TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'rancho-rio'),
    'Rancho Rio Team Roping',
    'rancho-rio-roping-mar-2026',
    'roping', 'team roping',
    '2026-03-14', '2026-03-15',
    'Rancho Rio Productions',
    'approved', TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'horseshoe-park'),
    'Queen Creek Barrel Bash',
    'qc-barrel-bash-2026',
    'rodeo', 'barrel racing',
    '2026-04-18', '2026-04-19',
    'AZ Barrel Racing Assoc',
    'pending', FALSE
);

-- ============================================================
-- SEED DATA — Vendors
-- ============================================================

INSERT INTO vendors (arena_id, vendor_name, slug, category, city, state, contact_email, booth_location) VALUES
(
    (SELECT id FROM arenas WHERE slug = 'westworld-scottsdale'),
    'Superior Saddlery',
    'superior-saddlery',
    'tack',
    'Scottsdale', 'AZ',
    'info@superiorsaddlery.com',
    'Barn 4 — Booth 12'
),
(
    NULL,
    'Desert Forge Farrier Supply',
    'desert-forge',
    'farrier',
    'Phoenix', 'AZ',
    'sales@desertforge.com',
    NULL
),
(
    NULL,
    'Cactus Ropes',
    'cactus-ropes',
    'roping',
    'Tonopah', 'AZ',
    'orders@cactusropes.com',
    NULL
),
(
    (SELECT id FROM arenas WHERE slug = 'will-rogers'),
    'Bobs Custom Saddles',
    'bobs-custom-saddles',
    'tack',
    'Fort Worth', 'TX',
    'info@bobscustomsaddles.com',
    'Exhibit Hall B — Booth 7'
),
(
    NULL,
    'Classic Equine',
    'classic-equine',
    'equipment',
    'Weatherford', 'TX',
    'support@classisequine.com',
    NULL
);

-- ============================================================
-- SEED DATA — Sponsors
-- ============================================================

INSERT INTO sponsors (arena_id, sponsor_name, slug, sponsor_level, logo, website, is_active) VALUES
(
    NULL,
    'Purina',
    'purina',
    'platinum',
    '/images/sponsors/purina.png',
    'https://www.purinamills.com',
    TRUE
),
(
    NULL,
    'Cinch Jeans',
    'cinch-jeans',
    'gold',
    '/images/sponsors/cinch.png',
    'https://www.cinch.com',
    TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'westworld-scottsdale'),
    'Cactus Saddlery',
    'cactus-saddlery',
    'silver',
    '/images/sponsors/cactus.png',
    'https://www.cactussaddlery.com',
    TRUE
),
(
    NULL,
    'Platinum Performance',
    'platinum-performance',
    'gold',
    '/images/sponsors/platinum-perf.png',
    'https://www.platinumperformance.com',
    TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'lazy-e'),
    'Wrangler',
    'wrangler',
    'platinum',
    '/images/sponsors/wrangler.png',
    'https://www.wrangler.com',
    TRUE
);

-- ============================================================
-- SEED DATA — Users
-- ============================================================

INSERT INTO users (arena_id, email, password_hash, display_name, role) VALUES
(
    (SELECT id FROM arenas WHERE slug = 'westworld-scottsdale'),
    'admin@arenanetwork.com',
    '$2b$10$placeholder_hash_replace_in_production',
    'Platform Admin',
    'admin'
),
(
    (SELECT id FROM arenas WHERE slug = 'westworld-scottsdale'),
    'manager@westworld.example.com',
    '$2b$10$placeholder_hash_replace_in_production',
    'WestWorld Manager',
    'manager'
),
(
    (SELECT id FROM arenas WHERE slug = 'lazy-e'),
    'ops@lazye.example.com',
    '$2b$10$placeholder_hash_replace_in_production',
    'Lazy E Operations',
    'manager'
);

-- ============================================================
-- SEED DATA — News
-- ============================================================

INSERT INTO news (arena_id, title, slug, body, publish_date, is_published) VALUES
(
    (SELECT id FROM arenas WHERE slug = 'westworld-scottsdale'),
    'WestWorld Announces 2026 Sun Circuit Dates',
    'westworld-sun-circuit-dates-2026',
    'WestWorld of Scottsdale has confirmed the 2026 Arizona Sun Circuit will run March 20–29. The annual show draws thousands of competitors across multiple western disciplines and is one of the largest events on the WestWorld calendar. Entry information and stall reservations open January 15.',
    '2026-01-10',
    TRUE
),
(
    (SELECT id FROM arenas WHERE slug = 'lazy-e'),
    'Lazy E Arena Completes Indoor Lighting Upgrade',
    'lazy-e-lighting-upgrade-2026',
    'Lazy E Arena in Guthrie, Oklahoma has completed a full LED lighting upgrade to its main indoor arena, improving visibility for both competitors and spectators during evening performances. The project was completed ahead of the 2026 Cinch Timed Event Championship.',
    '2026-02-01',
    TRUE
),
(
    NULL,
    'Arena Network Platform Launches for 2026 Season',
    'arena-network-launch-2026',
    'The Arena Network, a new national directory and calendar platform for agricultural and equine centers, officially launches for the 2026 season. The platform connects arenas, event promoters, vendors, and sponsors in a single searchable hub designed for the western and agricultural event industry.',
    '2026-03-01',
    TRUE
);
