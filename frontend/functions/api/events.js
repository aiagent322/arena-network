// /api/events — CRUD
export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    if (method === 'GET') return handleGet(request, env.DB);
    if (method === 'POST') return handlePost(request, env.DB);
    if (method === 'PUT') return handlePut(request, env.DB);
    if (method === 'DELETE') return handleDelete(request, env.DB);

    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders() });
}

async function handleGet(request, db) {
    const url = new URL(request.url);
    const params = url.searchParams;

    const arena_id = params.get('arena_id');
    const type = params.get('type');
    const discipline = params.get('discipline');
    const start = params.get('start');
    const end = params.get('end');
    const status = params.get('status');
    const approved = params.get('approved');
    const search = params.get('search');
    const limit = Math.min(parseInt(params.get('limit')) || 50, 500);
    const page = Math.max(parseInt(params.get('page')) || 1, 1);
    const offset = (page - 1) * limit;

    let where = [];
    let binds = [];

    if (arena_id) { where.push('e.arena_id = ?'); binds.push(arena_id); }
    if (type) { where.push('e.event_type = ?'); binds.push(type); }
    if (discipline) { where.push('e.discipline = ?'); binds.push(discipline); }
    if (start) { where.push('e.end_date >= ? OR (e.end_date IS NULL AND e.start_date >= ?)'); binds.push(start, start); }
    if (end) { where.push('e.start_date <= ?'); binds.push(end); }
    if (status) { where.push('e.status = ?'); binds.push(status); }
    if (approved === 'true') { where.push('e.is_approved = 1'); }
    if (search) { where.push('(e.title LIKE ? OR e.discipline LIKE ? OR e.promoter LIKE ?)'); binds.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM events e ${whereClause}`).bind(...binds).first();
    const total = countResult?.total || 0;

    const sql = `SELECT e.*, a.name as arena_name, a.city as arena_city, a.state as arena_state, a.slug as arena_slug
        FROM events e LEFT JOIN arenas a ON e.arena_id = a.id
        ${whereClause} ORDER BY e.start_date ASC LIMIT ? OFFSET ?`;

    const result = await db.prepare(sql).bind(...binds, limit, offset).all();

    return Response.json({
        events: result.results || [],
        total, page, limit,
        pages: Math.ceil(total / limit)
    }, { headers: corsHeaders() });
}

async function handlePost(request, db) {
    const body = await request.json();
    if (!body.title) return Response.json({ error: 'title is required' }, { status: 400, headers: corsHeaders() });

    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const result = await db.prepare(
        `INSERT INTO events (arena_id, title, slug, description, event_type, discipline, start_date, end_date, promoter, website, status, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
        body.arena_id || null, body.title, slug, body.description || null,
        body.event_type || null, body.discipline || null,
        body.start_date || null, body.end_date || null,
        body.promoter || null, body.website || null,
        body.status || 'pending', body.is_approved ? 1 : 0
    ).first();

    return Response.json(result, { status: 201, headers: corsHeaders() });
}

async function handlePut(request, db) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return Response.json({ error: 'id param required' }, { status: 400, headers: corsHeaders() });

    const body = await request.json();
    const fields = [];
    const binds = [];

    for (const [key, value] of Object.entries(body)) {
        if (['id', 'slug', 'created_at'].includes(key)) continue;
        fields.push(`${key} = ?`);
        binds.push(key === 'is_approved' ? (value ? 1 : 0) : value);
    }
    if (fields.length === 0) return Response.json({ error: 'No fields to update' }, { status: 400, headers: corsHeaders() });

    fields.push("updated_at = datetime('now')");
    binds.push(id);

    const result = await db.prepare(
        `UPDATE events SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...binds).first();

    if (!result) return Response.json({ error: 'Event not found' }, { status: 404, headers: corsHeaders() });
    return Response.json(result, { headers: corsHeaders() });
}

async function handleDelete(request, db) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return Response.json({ error: 'id param required' }, { status: 400, headers: corsHeaders() });

    const result = await db.prepare('DELETE FROM events WHERE id = ? RETURNING id, title').bind(id).first();
    if (!result) return Response.json({ error: 'Event not found' }, { status: 404, headers: corsHeaders() });

    return Response.json({ message: 'Deleted', ...result }, { headers: corsHeaders() });
}

function corsHeaders() {
    return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
}
