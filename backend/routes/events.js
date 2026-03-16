// ============================================================
// EVENTS — /api/events
//
//   GET  /api/events       List events (filter, search, paginate)
//   POST /api/events       Create event
//   PUT  /api/events/:id   Update event
// ============================================================

const express = require('express');
const router = express.Router();

// ── GET /api/events ─────────────────────────────────────────
// Query params: arena_id, type, discipline, start, end,
//               status, approved, promoter, search, page, limit

router.get('/', async (req, res) => {
    try {
        const {
            arena_id,
            type,
            discipline,
            start,
            end,
            status,
            approved,
            promoter,
            search,
            page = 1,
            limit = 100
        } = req.query;

        const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
        const conditions = [];
        const params = [];
        let idx = 0;

        if (arena_id) {
            idx++;
            conditions.push(`e.arena_id = $${idx}`);
            params.push(arena_id);
        }

        if (type) {
            idx++;
            conditions.push(`e.event_type = $${idx}`);
            params.push(type);
        }

        if (discipline) {
            idx++;
            conditions.push(`e.discipline ILIKE $${idx}`);
            params.push(`%${discipline}%`);
        }

        if (start) {
            idx++;
            conditions.push(`e.start_date >= $${idx}`);
            params.push(start);
        }

        if (end) {
            idx++;
            conditions.push(`e.start_date <= $${idx}`);
            params.push(end);
        }

        if (status) {
            idx++;
            conditions.push(`e.status = $${idx}`);
            params.push(status);
        }

        if (approved !== undefined) {
            conditions.push(`e.is_approved = ${approved === 'true'}`);
        }

        if (promoter) {
            idx++;
            conditions.push(`e.promoter ILIKE $${idx}`);
            params.push(`%${promoter}%`);
        }

        if (search) {
            idx++;
            conditions.push(`(e.title ILIKE $${idx} OR e.description ILIKE $${idx} OR e.promoter ILIKE $${idx})`);
            params.push(`%${search}%`);
        }

        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // Count
        const countResult = await req.db.query(
            `SELECT COUNT(*) FROM events e ${where}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Data with arena join
        idx++;
        params.push(parseInt(limit));
        const limitIdx = idx;

        idx++;
        params.push(offset);
        const offsetIdx = idx;

        const dataResult = await req.db.query(
            `SELECT
                e.id,
                e.arena_id,
                e.title,
                e.slug,
                e.description,
                e.event_type,
                e.discipline,
                e.start_date,
                e.end_date,
                e.start_time,
                e.end_time,
                e.entry_fee,
                e.added_money,
                e.promoter,
                e.website,
                e.contact_name,
                e.contact_phone,
                e.contact_email,
                e.flyer_url,
                e.source_url,
                e.status,
                e.is_approved,
                e.is_scraped,
                e.created_at,
                e.updated_at,
                a.name   AS arena_name,
                a.slug   AS arena_slug,
                a.city   AS arena_city,
                a.state  AS arena_state
             FROM events e
             LEFT JOIN arenas a ON e.arena_id = a.id
             ${where}
             ORDER BY e.start_date ASC
             LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
            params
        );

        res.json({
            events: dataResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        });

    } catch (err) {
        console.error('GET /api/events error:', err.message);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// ── POST /api/events ────────────────────────────────────────

router.post('/', async (req, res) => {
    try {
        const {
            arena_id,
            title,
            description,
            event_type,
            discipline,
            start_date,
            end_date,
            start_time,
            end_time,
            entry_fee,
            added_money,
            promoter,
            website,
            contact_name,
            contact_phone,
            contact_email,
            flyer_url,
            source_url,
            status
        } = req.body;

        // Validate required fields
        if (!title || !start_date) {
            return res.status(400).json({ error: 'title and start_date are required' });
        }

        // Generate slug: lowercase, alphanumeric + hyphens, append short unique suffix
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36);

        const result = await req.db.query(
            `INSERT INTO events (
                arena_id, title, slug, description, event_type, discipline,
                start_date, end_date, start_time, end_time,
                entry_fee, added_money, promoter, website,
                contact_name, contact_phone, contact_email,
                flyer_url, source_url, status
             )
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
             RETURNING *`,
            [
                arena_id || null,
                title,
                slug,
                description || null,
                event_type || null,
                discipline || null,
                start_date,
                end_date || null,
                start_time || null,
                end_time || null,
                entry_fee ? parseFloat(entry_fee) : null,
                added_money ? parseFloat(added_money) : null,
                promoter || null,
                website || null,
                contact_name || null,
                contact_phone || null,
                contact_email || null,
                flyer_url || null,
                source_url || null,
                status || 'pending'
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('POST /api/events error:', err.message);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Event with this slug already exists' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Invalid arena_id — arena not found' });
        }
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// ── PUT /api/events/:id ─────────────────────────────────────

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const fields = req.body;

        // Prevent overwriting protected fields
        const protected_keys = ['id', 'slug', 'created_at'];
        const setClauses = [];
        const params = [];
        let idx = 0;

        for (const [key, value] of Object.entries(fields)) {
            if (protected_keys.includes(key)) continue;
            idx++;
            setClauses.push(`${key} = $${idx}`);
            params.push(value);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Always update the timestamp
        setClauses.push('updated_at = NOW()');

        // Add the id as last param
        idx++;
        params.push(id);

        const result = await req.db.query(
            `UPDATE events
             SET ${setClauses.join(', ')}
             WHERE id = $${idx}
             RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('PUT /api/events/:id error:', err.message);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Invalid arena_id — arena not found' });
        }
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// ── DELETE /api/events/:id ───────────────────────────────────

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.db.query(
            'DELETE FROM events WHERE id = $1 RETURNING id, title',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ message: 'Event deleted', id: result.rows[0].id, title: result.rows[0].title });

    } catch (err) {
        console.error('DELETE /api/events/:id error:', err.message);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;
