// ============================================================
// NEWS — /api/news
//
//   GET    /api/news              List articles (filter, paginate)
//   POST   /api/news              Create article
//   PUT    /api/news/:id          Edit article
//   PUT    /api/news/:id/publish  Toggle publish status
//   DELETE /api/news/:id          Delete article
// ============================================================

const express = require('express');
const router = express.Router();

// ── GET /api/news ───────────────────────────────────────────
// Query params: arena_id, published, search, page, limit

router.get('/', async (req, res) => {
    try {
        const {
            arena_id,
            published,
            search,
            page = 1,
            limit = 25
        } = req.query;

        const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
        const conditions = [];
        const params = [];
        let idx = 0;

        if (arena_id) {
            idx++;
            conditions.push(`n.arena_id = $${idx}`);
            params.push(arena_id);
        }

        if (published !== undefined) {
            conditions.push(`n.is_published = ${published === 'true'}`);
        }

        if (search) {
            idx++;
            conditions.push(`(n.title ILIKE $${idx} OR n.body ILIKE $${idx})`);
            params.push(`%${search}%`);
        }

        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const countResult = await req.db.query(
            `SELECT COUNT(*) FROM news n ${where}`, params
        );
        const total = parseInt(countResult.rows[0].count);

        idx++;
        params.push(parseInt(limit));
        const limitIdx = idx;

        idx++;
        params.push(offset);
        const offsetIdx = idx;

        const dataResult = await req.db.query(
            `SELECT
                n.id, n.arena_id, n.title, n.slug, n.body, n.excerpt,
                n.cover_image_url, n.author_id, n.publish_date,
                n.is_published, n.created_at, n.updated_at,
                a.name AS arena_name, a.slug AS arena_slug,
                u.display_name AS author_name
             FROM news n
             LEFT JOIN arenas a ON n.arena_id = a.id
             LEFT JOIN users u ON n.author_id = u.id
             ${where}
             ORDER BY n.publish_date DESC, n.created_at DESC
             LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
            params
        );

        res.json({
            news: dataResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        });

    } catch (err) {
        console.error('GET /api/news error:', err.message);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// ── POST /api/news ──────────────────────────────────────────

router.post('/', async (req, res) => {
    try {
        const { arena_id, title, body, excerpt, cover_image_url, author_id, publish_date, is_published } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'title is required' });
        }

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
        const autoExcerpt = excerpt || (body ? body.substring(0, 300).replace(/\s+\S*$/, '...') : null);

        const result = await req.db.query(
            `INSERT INTO news (arena_id, title, slug, body, excerpt, cover_image_url, author_id, publish_date, is_published)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             RETURNING *`,
            [arena_id || null, title, slug, body || null, autoExcerpt, cover_image_url || null,
             author_id || null, publish_date || new Date().toISOString().split('T')[0],
             is_published !== undefined ? is_published : false]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('POST /api/news error:', err.message);
        if (err.code === '23505') return res.status(409).json({ error: 'Article with this slug already exists' });
        if (err.code === '23503') return res.status(400).json({ error: 'Invalid arena_id or author_id' });
        res.status(500).json({ error: 'Failed to create article' });
    }
});

// ── PUT /api/news/:id ───────────────────────────────────────

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const fields = req.body;
        const protectedKeys = ['id', 'slug', 'created_at'];
        const setClauses = [];
        const params = [];
        let idx = 0;

        for (const [key, value] of Object.entries(fields)) {
            if (protectedKeys.includes(key)) continue;
            idx++;
            setClauses.push(`${key} = $${idx}`);
            params.push(value);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Re-generate excerpt if body changed and no explicit excerpt provided
        if (fields.body && !fields.excerpt) {
            idx++;
            setClauses.push(`excerpt = $${idx}`);
            params.push(fields.body.substring(0, 300).replace(/\s+\S*$/, '...'));
        }

        setClauses.push('updated_at = NOW()');
        idx++;
        params.push(id);

        const result = await req.db.query(
            `UPDATE news SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('PUT /api/news/:id error:', err.message);
        if (err.code === '23503') return res.status(400).json({ error: 'Invalid arena_id or author_id' });
        res.status(500).json({ error: 'Failed to update article' });
    }
});

// ── PUT /api/news/:id/publish ───────────────────────────────

router.put('/:id/publish', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_published } = req.body;
        const publish = is_published !== undefined ? is_published : true;

        const result = await req.db.query(
            `UPDATE news SET is_published = $1, updated_at = NOW()
             WHERE id = $2 RETURNING id, title, is_published`,
            [publish, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('PUT /api/news/:id/publish error:', err.message);
        res.status(500).json({ error: 'Failed to update publish status' });
    }
});

// ── DELETE /api/news/:id ────────────────────────────────────

router.delete('/:id', async (req, res) => {
    try {
        const result = await req.db.query(
            'DELETE FROM news WHERE id = $1 RETURNING id, title',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'Article deleted', id: result.rows[0].id, title: result.rows[0].title });

    } catch (err) {
        console.error('DELETE /api/news/:id error:', err.message);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

module.exports = router;
