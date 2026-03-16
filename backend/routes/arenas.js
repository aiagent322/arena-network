// ============================================================
// ARENAS — /api/arenas
//
//   GET  /api/arenas      List arenas (filter, search, paginate)
//   GET  /api/arenas/:id  Single arena by UUID or slug
// ============================================================

const express = require('express');
const router = express.Router();

// ── GET /api/arenas ─────────────────────────────────────────
// Query params: state, type, search, verified, page, limit

router.get('/', async (req, res) => {
    try {
        const {
            state,
            type,
            search,
            verified,
            page = 1,
            limit = 50
        } = req.query;

        const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
        const conditions = ['a.is_active = TRUE'];
        const params = [];
        let idx = 0;

        if (state) {
            idx++;
            conditions.push(`a.state = $${idx}`);
            params.push(state);
        }

        if (type) {
            idx++;
            conditions.push(`a.arena_type = $${idx}`);
            params.push(type);
        }

        if (verified === 'true') {
            conditions.push('a.is_verified = TRUE');
        }

        if (search) {
            idx++;
            conditions.push(`(a.name ILIKE $${idx} OR a.city ILIKE $${idx} OR a.address ILIKE $${idx})`);
            params.push(`%${search}%`);
        }

        const where = conditions.join(' AND ');

        // Count query
        const countResult = await req.db.query(
            `SELECT COUNT(*) FROM arenas a WHERE ${where}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Data query
        idx++;
        params.push(parseInt(limit));
        const limitIdx = idx;

        idx++;
        params.push(offset);
        const offsetIdx = idx;

        const dataResult = await req.db.query(
            `SELECT
                a.id,
                a.name,
                a.slug,
                a.description,
                a.city,
                a.state,
                a.address,
                a.zip,
                a.latitude,
                a.longitude,
                a.phone,
                a.email,
                a.website,
                a.logo_url,
                a.cover_image_url,
                a.arena_type,
                a.surface_type,
                a.indoor_arenas,
                a.outdoor_arenas,
                a.seating_capacity,
                a.stall_count,
                a.rv_spaces,
                a.membership_level,
                a.is_verified,
                a.created_at,
                a.updated_at,
                (SELECT COUNT(*) FROM events e WHERE e.arena_id = a.id AND e.is_approved = TRUE)::int AS event_count,
                (SELECT COUNT(*) FROM vendors v WHERE v.arena_id = a.id AND v.is_active = TRUE)::int AS vendor_count,
                (SELECT COUNT(*) FROM sponsors s WHERE s.arena_id = a.id AND s.is_active = TRUE)::int AS sponsor_count
             FROM arenas a
             WHERE ${where}
             ORDER BY a.name ASC
             LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
            params
        );

        res.json({
            arenas: dataResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        });

    } catch (err) {
        console.error('GET /api/arenas error:', err.message);
        res.status(500).json({ error: 'Failed to fetch arenas' });
    }
});

// ── GET /api/arenas/:id ─────────────────────────────────────
// Accepts UUID or slug

router.get('/:id', async (req, res) => {
    try {
        const identifier = req.params.id;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

        const query = `
            SELECT
                a.*,
                (SELECT COUNT(*) FROM events e WHERE e.arena_id = a.id AND e.is_approved = TRUE)::int AS event_count,
                (SELECT COUNT(*) FROM vendors v WHERE v.arena_id = a.id AND v.is_active = TRUE)::int AS vendor_count,
                (SELECT COUNT(*) FROM sponsors s WHERE s.arena_id = a.id AND s.is_active = TRUE)::int AS sponsor_count
            FROM arenas a
            WHERE ${isUUID ? 'a.id = $1' : 'a.slug = $1'}
              AND a.is_active = TRUE
        `;

        const result = await req.db.query(query, [identifier]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Arena not found' });
        }

        // Also fetch upcoming events for this arena
        const eventsResult = await req.db.query(
            `SELECT id, title, slug, event_type, discipline, start_date, end_date, promoter, status
             FROM events
             WHERE arena_id = $1 AND start_date >= CURRENT_DATE AND is_approved = TRUE
             ORDER BY start_date ASC
             LIMIT 20`,
            [result.rows[0].id]
        );

        // Fetch vendors at this arena
        const vendorsResult = await req.db.query(
            `SELECT id, vendor_name, slug, category, booth_location, contact_email, website
             FROM vendors
             WHERE arena_id = $1 AND is_active = TRUE
             ORDER BY vendor_name ASC`,
            [result.rows[0].id]
        );

        // Fetch sponsors at this arena
        const sponsorsResult = await req.db.query(
            `SELECT id, sponsor_name, slug, sponsor_level, logo, website
             FROM sponsors
             WHERE arena_id = $1 AND is_active = TRUE
             ORDER BY
                CASE sponsor_level
                    WHEN 'platinum' THEN 1
                    WHEN 'gold' THEN 2
                    WHEN 'silver' THEN 3
                    WHEN 'bronze' THEN 4
                    ELSE 5
                END ASC`,
            [result.rows[0].id]
        );

        res.json({
            ...result.rows[0],
            upcoming_events: eventsResult.rows,
            vendors: vendorsResult.rows,
            sponsors: sponsorsResult.rows
        });

    } catch (err) {
        console.error('GET /api/arenas/:id error:', err.message);
        res.status(500).json({ error: 'Failed to fetch arena' });
    }
});

module.exports = router;
