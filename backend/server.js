// ============================================================
// ARENA NETWORK — Node.js API Server
// League of Agricultural and Equine Centers
//
// Endpoints:
//   GET    /api/arenas          GET  /api/arenas/:id
//   GET    /api/events          POST /api/events
//   PUT    /api/events/:id
//   GET    /api/vendors         POST /api/vendors
//   GET    /api/sponsors        POST /api/sponsors
//   GET    /api/news            POST /api/news
//   GET    /api/llm-usage
//   GET    /api/health
// ============================================================

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── PostgreSQL Connection Pool ──────────────────────────────

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/arena_network',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
});

pool.on('connect', () => {
    console.log('[DB] New client connected');
});

// ── Middleware ───────────────────────────────────────────────

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Attach database pool to every request
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// ── Static Frontend ─────────────────────────────────────────

app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ──────────────────────────────────────────────

const arenasRouter   = require('./routes/arenas');
const eventsRouter   = require('./routes/events');
const vendorsRouter  = require('./routes/vendors');
const sponsorsRouter = require('./routes/sponsors');
const newsRouter     = require('./routes/news');
const llmUsageRouter = require('./routes/llm-usage');

app.use('/api/arenas',    arenasRouter);
app.use('/api/events',    eventsRouter);
app.use('/api/vendors',   vendorsRouter);
app.use('/api/sponsors',  sponsorsRouter);
app.use('/api/news',      newsRouter);
app.use('/api/llm-usage', llmUsageRouter);

// ── Health Check ────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
    try {
        const dbResult = await pool.query('SELECT NOW() AS server_time, current_database() AS db_name');
        const row = dbResult.rows[0];

        const tables = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: {
                name: row.db_name,
                server_time: row.server_time,
                tables: tables.rows.map(t => t.table_name)
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            message: err.message
        });
    }
});

// ── Catch-all: serve frontend ───────────────────────────────

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Global Error Handler ────────────────────────────────────

app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        path: req.originalUrl
    });
});

// ── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
    console.log('');
    console.log('  ┌─────────────────────────────────────────┐');
    console.log('  │       ARENA NETWORK — API Server         │');
    console.log('  │  League of Agricultural & Equine Centers │');
    console.log('  └─────────────────────────────────────────┘');
    console.log('');
    console.log(`  Local:   http://localhost:${PORT}`);
    console.log(`  Health:  http://localhost:${PORT}/api/health`);
    console.log(`  Routes:  /api/arenas, /api/events, /api/vendors`);
    console.log(`           /api/sponsors, /api/news, /api/llm-usage`);
    console.log('');
});

module.exports = app;
