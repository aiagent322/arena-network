// ============================================================
// LLM USAGE TRACKING — /api/llm-usage
//
// When the LLM parser runs, insert a record into llm_usage.
// Stores: arena_id, operation, tokens, cost, timestamp.
//
//   POST /api/llm-usage            Insert usage record
//   GET  /api/llm-usage            Usage summary (global + per arena)
//   GET  /api/llm-usage/arenas     Usage summary per arena
//   GET  /api/llm-usage/:id        Single record by ID
// ============================================================

const express = require('express');
const router = express.Router();

// ────────────────────────────────────────────────────────────
// POST /api/llm-usage — Insert a tracking record
// ────────────────────────────────────────────────────────────
//
// Called by the Python scraper/LLM parser after each API call.
//
// Body:
//   arena_id    (uuid, optional)  — arena this operation relates to
//   operation   (string, required) — e.g. "event_scraping", "flyer_parsing"
//   tokens      (int)             — total tokens used
//   cost        (decimal)         — estimated cost in USD
//   model       (string, optional)
//   input_tokens  (int, optional)
//   output_tokens (int, optional)
//   endpoint    (string, optional) — caller identifier
//   user_id     (uuid, optional)
//   metadata    (object, optional) — extra context (URL scraped, etc.)

router.post('/', async (req, res) => {
    try {
        const {
            arena_id,
            operation,
            tokens,
            cost,
            model,
            input_tokens,
            output_tokens,
            endpoint,
            user_id,
            metadata
        } = req.body;

        // Validate required field
        if (!operation) {
            return res.status(400).json({ error: 'operation is required' });
        }

        // Calculate total tokens if not provided directly
        const totalTokens = tokens
            || ((parseInt(input_tokens) || 0) + (parseInt(output_tokens) || 0))
            || 0;

        const result = await req.db.query(
            `INSERT INTO llm_usage (
                arena_id, user_id, operation, model,
                input_tokens, output_tokens, tokens,
                cost, endpoint, metadata
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING
                id, arena_id, operation, model,
                input_tokens, output_tokens, tokens,
                cost, endpoint, timestamp`,
            [
                arena_id || null,
                user_id || null,
                operation,
                model || null,
                parseInt(input_tokens) || 0,
                parseInt(output_tokens) || 0,
                totalTokens,
                parseFloat(cost) || 0,
                endpoint || null,
                metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null
            ]
        );

        const record = result.rows[0];

        console.log(
            `[LLM-USAGE] Logged: ${operation} | ${totalTokens} tokens | $${parseFloat(cost || 0).toFixed(6)}` +
            (arena_id ? ` | arena=${arena_id.substring(0, 8)}` : '')
        );

        res.status(201).json(record);

    } catch (err) {
        console.error('POST /api/llm-usage error:', err.message);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Invalid arena_id or user_id — referenced record not found' });
        }
        res.status(500).json({ error: 'Failed to log LLM usage' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /api/llm-usage — Full usage summary
// ────────────────────────────────────────────────────────────
//
// Query params:
//   arena_id   — filter to single arena
//   operation  — filter by operation type
//   days       — lookback period (default 30, max 365)
//   detail     — if "true", include raw record rows
//
// Returns:
//   summary       — aggregate totals for the period
//   by_operation   — grouped by operation + model
//   by_arena       — usage per arena (with arena name)
//   daily          — day-by-day breakdown
//   records        — raw rows (only if detail=true)

router.get('/', async (req, res) => {
    try {
        const {
            arena_id,
            operation,
            days = 30,
            detail
        } = req.query;

        const safeDays = Math.max(1, Math.min(365, parseInt(days) || 30));
        const conditions = [`lu.timestamp >= NOW() - INTERVAL '${safeDays} days'`];
        const params = [];
        let idx = 0;

        if (arena_id) {
            idx++;
            conditions.push(`lu.arena_id = $${idx}`);
            params.push(arena_id);
        }

        if (operation) {
            idx++;
            conditions.push(`lu.operation = $${idx}`);
            params.push(operation);
        }

        const where = conditions.join(' AND ');

        // ── Summary totals ──────────────────────────────────
        const summaryResult = await req.db.query(
            `SELECT
                COUNT(*)::int                           AS total_calls,
                COALESCE(SUM(lu.tokens), 0)::int        AS total_tokens,
                COALESCE(SUM(lu.input_tokens), 0)::int  AS total_input_tokens,
                COALESCE(SUM(lu.output_tokens), 0)::int AS total_output_tokens,
                COALESCE(SUM(lu.cost), 0)::numeric      AS total_cost,
                CASE WHEN COUNT(*) > 0
                     THEN ROUND(SUM(lu.tokens)::numeric / COUNT(*), 0)
                     ELSE 0
                END                                     AS avg_tokens_per_call,
                MIN(lu.timestamp)                       AS first_usage,
                MAX(lu.timestamp)                       AS last_usage
             FROM llm_usage lu
             WHERE ${where}`,
            params
        );

        // ── By operation ────────────────────────────────────
        const operationResult = await req.db.query(
            `SELECT
                lu.operation,
                lu.model,
                COUNT(*)::int                       AS call_count,
                COALESCE(SUM(lu.tokens), 0)::int    AS total_tokens,
                COALESCE(SUM(lu.input_tokens), 0)::int AS total_input_tokens,
                COALESCE(SUM(lu.output_tokens), 0)::int AS total_output_tokens,
                COALESCE(SUM(lu.cost), 0)::numeric  AS total_cost,
                MAX(lu.timestamp)                   AS last_used
             FROM llm_usage lu
             WHERE ${where}
             GROUP BY lu.operation, lu.model
             ORDER BY total_tokens DESC`,
            params
        );

        // ── By arena (usage summary per arena) ──────────────
        const arenaResult = await req.db.query(
            `SELECT
                lu.arena_id,
                a.name                              AS arena_name,
                a.city                              AS arena_city,
                a.state                             AS arena_state,
                COUNT(*)::int                       AS call_count,
                COALESCE(SUM(lu.tokens), 0)::int    AS total_tokens,
                COALESCE(SUM(lu.cost), 0)::numeric  AS total_cost,
                MAX(lu.timestamp)                   AS last_used
             FROM llm_usage lu
             LEFT JOIN arenas a ON lu.arena_id = a.id
             WHERE ${where}
             GROUP BY lu.arena_id, a.name, a.city, a.state
             ORDER BY total_tokens DESC`,
            params
        );

        // ── Daily breakdown ─────────────────────────────────
        const dailyResult = await req.db.query(
            `SELECT
                DATE(lu.timestamp)                  AS date,
                COUNT(*)::int                       AS call_count,
                COALESCE(SUM(lu.tokens), 0)::int    AS total_tokens,
                COALESCE(SUM(lu.cost), 0)::numeric  AS total_cost
             FROM llm_usage lu
             WHERE ${where}
             GROUP BY DATE(lu.timestamp)
             ORDER BY date DESC`,
            params
        );

        // ── Raw records (optional) ──────────────────────────
        let records = [];
        if (detail === 'true') {
            const detailResult = await req.db.query(
                `SELECT
                    lu.id,
                    lu.arena_id,
                    lu.user_id,
                    lu.operation,
                    lu.model,
                    lu.input_tokens,
                    lu.output_tokens,
                    lu.tokens,
                    lu.cost,
                    lu.endpoint,
                    lu.metadata,
                    lu.timestamp,
                    a.name          AS arena_name,
                    u.display_name  AS user_name
                 FROM llm_usage lu
                 LEFT JOIN arenas a ON lu.arena_id = a.id
                 LEFT JOIN users u  ON lu.user_id = u.id
                 WHERE ${where}
                 ORDER BY lu.timestamp DESC
                 LIMIT 500`,
                params
            );
            records = detailResult.rows;
        }

        res.json({
            period_days: safeDays,
            summary: summaryResult.rows[0],
            by_operation: operationResult.rows,
            by_arena: arenaResult.rows,
            daily: dailyResult.rows,
            records
        });

    } catch (err) {
        console.error('GET /api/llm-usage error:', err.message);
        res.status(500).json({ error: 'Failed to fetch LLM usage data' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /api/llm-usage/arenas — Per-arena usage summary
// ────────────────────────────────────────────────────────────
//
// Dedicated endpoint returning only the per-arena breakdown.
// Includes arena details and operation breakdown within each arena.
//
// Query params:
//   days — lookback period (default 30)

router.get('/arenas', async (req, res) => {
    try {
        const days = Math.max(1, Math.min(365, parseInt(req.query.days) || 30));

        // Per-arena summary
        const arenaResult = await req.db.query(
            `SELECT
                lu.arena_id,
                a.name                              AS arena_name,
                a.city                              AS arena_city,
                a.state                             AS arena_state,
                a.arena_type,
                COUNT(*)::int                       AS call_count,
                COALESCE(SUM(lu.tokens), 0)::int    AS total_tokens,
                COALESCE(SUM(lu.input_tokens), 0)::int AS total_input_tokens,
                COALESCE(SUM(lu.output_tokens), 0)::int AS total_output_tokens,
                COALESCE(SUM(lu.cost), 0)::numeric  AS total_cost,
                MIN(lu.timestamp)                   AS first_usage,
                MAX(lu.timestamp)                   AS last_usage
             FROM llm_usage lu
             LEFT JOIN arenas a ON lu.arena_id = a.id
             WHERE lu.timestamp >= NOW() - INTERVAL '${days} days'
             GROUP BY lu.arena_id, a.name, a.city, a.state, a.arena_type
             ORDER BY total_tokens DESC`
        );

        // Per-arena operation breakdown
        const opsResult = await req.db.query(
            `SELECT
                lu.arena_id,
                lu.operation,
                COUNT(*)::int                       AS call_count,
                COALESCE(SUM(lu.tokens), 0)::int    AS total_tokens,
                COALESCE(SUM(lu.cost), 0)::numeric  AS total_cost
             FROM llm_usage lu
             WHERE lu.timestamp >= NOW() - INTERVAL '${days} days'
             GROUP BY lu.arena_id, lu.operation
             ORDER BY lu.arena_id, total_tokens DESC`
        );

        // Group operations by arena_id
        const opsMap = {};
        for (const row of opsResult.rows) {
            const aid = row.arena_id || '__global__';
            if (!opsMap[aid]) opsMap[aid] = [];
            opsMap[aid].push({
                operation: row.operation,
                call_count: row.call_count,
                total_tokens: row.total_tokens,
                total_cost: row.total_cost
            });
        }

        // Combine
        const arenas = arenaResult.rows.map(a => ({
            ...a,
            operations: opsMap[a.arena_id || '__global__'] || []
        }));

        // Grand total
        const grandTotal = {
            call_count: arenas.reduce((s, a) => s + a.call_count, 0),
            total_tokens: arenas.reduce((s, a) => s + a.total_tokens, 0),
            total_cost: arenas.reduce((s, a) => s + parseFloat(a.total_cost), 0).toFixed(6)
        };

        res.json({
            period_days: days,
            grand_total: grandTotal,
            arenas
        });

    } catch (err) {
        console.error('GET /api/llm-usage/arenas error:', err.message);
        res.status(500).json({ error: 'Failed to fetch per-arena usage' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /api/llm-usage/:id — Single usage record
// ────────────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await req.db.query(
            `SELECT
                lu.*,
                a.name          AS arena_name,
                a.city          AS arena_city,
                a.state         AS arena_state,
                u.display_name  AS user_name
             FROM llm_usage lu
             LEFT JOIN arenas a ON lu.arena_id = a.id
             LEFT JOIN users u  ON lu.user_id = u.id
             WHERE lu.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usage record not found' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('GET /api/llm-usage/:id error:', err.message);
        res.status(500).json({ error: 'Failed to fetch usage record' });
    }
});

module.exports = router;
