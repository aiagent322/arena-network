// /api/news — CRUD
export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    if (request.method === 'GET') return handleGet(request, env.DB);
    if (request.method === 'POST') return handlePost(request, env.DB);
    if (request.method === 'PUT') return handlePut(request, env.DB);
    if (request.method === 'DELETE') return handleDelete(request, env.DB);
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders() });
}

async function handleGet(request, db) {
    const url = new URL(request.url);
    const arena_id = url.searchParams.get('arena_id');
    const published = url.searchParams.get('published');
    const search = url.searchParams.get('search');
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 25, 200);

    let where = [];
    let binds = [];

    if (arena_id) { where.push('n.arena_id = ?'); binds.push(arena_id); }
    if (published === 'true') { where.push('n.is_published = 1'); }
    else if (published === 'false') { where.push('n.is_published = 0'); }
    if (search) { where.push('(n.title LIKE ? OR n.body LIKE ?)'); binds.push(`%${search}%`, `%${search}%`); }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const result = await db.prepare(
        `SELECT n.*, a.name as arena_name, a.slug as arena_slug FROM news n LEFT JOIN arenas a ON n.arena_id = a.id ${whereClause} ORDER BY n.publish_date DESC, n.created_at DESC LIMIT ?`
    ).bind(...binds, limit).all();

    return Response.json({ news: result.results || [] }, { headers: corsHeaders() });
}

async function handlePost(request, db) {
    const body = await request.json();
    if (!body.title) return Response.json({ error: 'title required' }, { status: 400, headers: corsHeaders() });

    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    const excerpt = body.excerpt || (body.body ? body.body.substring(0, 300) : null);

    const result = await db.prepare(
        `INSERT INTO news (arena_id, title, slug, body, excerpt, publish_date, is_published) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(body.arena_id || null, body.title, slug, body.body || null, excerpt, body.publish_date || new Date().toISOString().split('T')[0], body.is_published ? 1 : 0).first();

    return Response.json(result, { status: 201, headers: corsHeaders() });
}

async function handlePut(request, db) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return Response.json({ error: 'id required' }, { status: 400, headers: corsHeaders() });

    const body = await request.json();

    // Handle publish toggle
    if (body.is_published !== undefined && Object.keys(body).length <= 2) {
        const result = await db.prepare(
            `UPDATE news SET is_published = ?, updated_at = datetime('now') WHERE id = ? RETURNING *`
        ).bind(body.is_published ? 1 : 0, id).first();
        if (!result) return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders() });
        return Response.json(result, { headers: corsHeaders() });
    }

    // Full update
    const fields = [];
    const binds = [];
    for (const [key, value] of Object.entries(body)) {
        if (['id', 'slug', 'created_at'].includes(key)) continue;
        fields.push(`${key} = ?`);
        binds.push(key === 'is_published' ? (value ? 1 : 0) : value);
    }
    if (body.body && !body.excerpt) { fields.push('excerpt = ?'); binds.push(body.body.substring(0, 300)); }
    fields.push("updated_at = datetime('now')");
    binds.push(id);

    const result = await db.prepare(`UPDATE news SET ${fields.join(', ')} WHERE id = ? RETURNING *`).bind(...binds).first();
    if (!result) return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders() });
    return Response.json(result, { headers: corsHeaders() });
}

async function handleDelete(request, db) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return Response.json({ error: 'id required' }, { status: 400, headers: corsHeaders() });

    const result = await db.prepare('DELETE FROM news WHERE id = ? RETURNING id, title').bind(id).first();
    if (!result) return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders() });
    return Response.json({ message: 'Deleted', ...result }, { headers: corsHeaders() });
}

function corsHeaders() {
    return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
}
