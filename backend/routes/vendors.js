// ============================================================
// VENDORS — /api/vendors
//
//   GET  /api/vendors   List vendors (filter, search, paginate)
//   POST /api/vendors   Create vendor
// ============================================================

const express = require('express');
const router = express.Router();

// ── GET /api/vendors ────────────────────────────────────────
// Query params: category, arena_id, state, search, page, limit

router.get('/', async (req, res) => {
    try {
        const {
            category,
            arena_id,
            state,
            search,
            page = 1,
            limit = 50
        } = req.query;

        const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
        const conditions = ['v.is_active = TRUE'];
        const params = [];
        let idx = 0;

        if (category) {
            idx++;
            conditions.push(`v.category = $${idx}`);
            params.push(category);
        }

        if (arena_id) {
            idx++;
            conditions.push(`v.arena_id = $${idx}`);
            params.push(arena_id);
        }

        if (state) {
            idx++;
            conditions.push(`v.state = $${idx}`);
            params.push(state);
        }

        if (search) {
            idx++;
            conditions.push(`(v.vendor_name ILIKE $${idx} OR v.description ILIKE $${idx} OR v.category ILIKE $${idx})`);
            params.push(`%${search}%`);
        }

        const where = conditions.join(' AND ');

        // Count
        const countResult = await req.db.query(
            `SELECT COUNT(*) FROM vendors v WHERE ${where}`,
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
                v.id,
                v.arena_id,
                v.vendor_name,
                v.slug,
                v.description,
                v.category,
                v.website,
                v.booth_location,
                v.contact_name,
                v.contact_email,
                v.phone,
                v.logo_url,
                v.city,
                v.state,
                v.created_at,
                v.updated_at,
                a.name  AS arena_name,
                a.slug  AS arena_slug,
                a.city  AS arena_city,
                a.state AS arena_state
             FROM vendors v
             LEFT JOIN arenas a ON v.arena_id = a.id
             WHERE ${where}
             ORDER BY v.vendor_name ASC
             LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
            params
        );

        res.json({
            vendors: dataResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        });

    } catch (err) {
        console.error('GET /api/vendors error:', err.message);
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
});

// ── POST /api/vendors ───────────────────────────────────────

router.post('/', async (req, res) => {
    try {
        const {
            arena_id,
            vendor_name,
            description,
            category,
            website,
            booth_location,
            contact_name,
            contact_email,
            phone,
            logo_url,
            city,
            state
        } = req.body;

        if (!vendor_name) {
            return res.status(400).json({ error: 'vendor_name is required' });
        }

        const slug = vendor_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const result = await req.db.query(
            `INSERT INTO vendors (
                arena_id, vendor_name, slug, description, category,
                website, booth_location, contact_name, contact_email,
                phone, logo_url, city, state
             )
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
             RETURNING *`,
            [
                arena_id || null,
                vendor_name,
                slug,
                description || null,
                category || null,
                website || null,
                booth_location || null,
                contact_name || null,
                contact_email || null,
                phone || null,
                logo_url || null,
                city || null,
                state || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('POST /api/vendors error:', err.message);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Vendor with this name already exists' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Invalid arena_id — arena not found' });
        }
        res.status(500).json({ error: 'Failed to create vendor' });
    }
});

module.exports = router;
