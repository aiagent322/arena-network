// ============================================================
// SPONSORS — /api/sponsors
//
//   GET  /api/sponsors   List sponsors (filter by level, arena)
//   POST /api/sponsors   Create sponsor
// ============================================================

const express = require('express');
const router = express.Router();

// ── GET /api/sponsors ───────────────────────────────────────
// Query params: sponsor_level, arena_id, active

router.get('/', async (req, res) => {
    try {
        const { sponsor_level, arena_id, active } = req.query;

        const conditions = [];
        const params = [];
        let idx = 0;

        if (sponsor_level) {
            idx++;
            conditions.push(`s.sponsor_level = $${idx}`);
            params.push(sponsor_level);
        }

        if (arena_id) {
            idx++;
            conditions.push(`s.arena_id = $${idx}`);
            params.push(arena_id);
        }

        if (active !== undefined) {
            conditions.push(`s.is_active = ${active === 'true'}`);
        } else {
            // Default to active only
            conditions.push('s.is_active = TRUE');
        }

        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const result = await req.db.query(
            `SELECT
                s.id,
                s.arena_id,
                s.sponsor_name,
                s.slug,
                s.logo,
                s.website,
                s.sponsor_level,
                s.contact_name,
                s.contact_email,
                s.contract_start,
                s.contract_end,
                s.annual_value,
                s.is_active,
                s.created_at,
                s.updated_at,
                a.name  AS arena_name,
                a.slug  AS arena_slug
             FROM sponsors s
             LEFT JOIN arenas a ON s.arena_id = a.id
             ${where}
             ORDER BY
                CASE s.sponsor_level
                    WHEN 'platinum' THEN 1
                    WHEN 'gold'     THEN 2
                    WHEN 'silver'   THEN 3
                    WHEN 'bronze'   THEN 4
                    ELSE 5
                END ASC,
                s.sponsor_name ASC`,
            params
        );

        // Group by tier for convenience
        const tiers = {};
        for (const row of result.rows) {
            const level = row.sponsor_level || 'other';
            if (!tiers[level]) tiers[level] = [];
            tiers[level].push(row);
        }

        res.json({
            sponsors: result.rows,
            by_tier: tiers,
            total: result.rows.length
        });

    } catch (err) {
        console.error('GET /api/sponsors error:', err.message);
        res.status(500).json({ error: 'Failed to fetch sponsors' });
    }
});

// ── POST /api/sponsors ──────────────────────────────────────

router.post('/', async (req, res) => {
    try {
        const {
            arena_id,
            sponsor_name,
            logo,
            website,
            sponsor_level,
            contact_name,
            contact_email,
            contract_start,
            contract_end,
            annual_value
        } = req.body;

        if (!sponsor_name) {
            return res.status(400).json({ error: 'sponsor_name is required' });
        }

        const slug = sponsor_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const result = await req.db.query(
            `INSERT INTO sponsors (
                arena_id, sponsor_name, slug, logo, website,
                sponsor_level, contact_name, contact_email,
                contract_start, contract_end, annual_value
             )
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING *`,
            [
                arena_id || null,
                sponsor_name,
                slug,
                logo || null,
                website || null,
                sponsor_level || 'bronze',
                contact_name || null,
                contact_email || null,
                contract_start || null,
                contract_end || null,
                annual_value ? parseFloat(annual_value) : null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('POST /api/sponsors error:', err.message);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Sponsor with this name already exists' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Invalid arena_id — arena not found' });
        }
        res.status(500).json({ error: 'Failed to create sponsor' });
    }
});

module.exports = router;
