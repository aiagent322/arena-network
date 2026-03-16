// /api/sponsors — GET list, POST create

export async function onRequest(context) {
    const { request, env } = context;
    const m = request.method;
    if (m === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    try {
        if (m === 'GET') return await handleGet(request, env.DB);
        if (m === 'POST') return await handlePost(request, env.DB);
        return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders() });
    } catch (err) {
        return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders() });
    }
}

async function handleGet(request, db) {
    const url = new URL(request.url);
    const level = url.searchParams.get('sponsor_level');
    const arena_id = url.searchParams.get('arena_id');

    let where = ['s.is_active = 1'];
    let binds = [];
    if (level) { where.push('s.sponsor_level = ?'); binds.push(level); }
    if (arena_id) { where.push('s.arena_id = ?'); binds.push(arena_id); }

    const wc = 'WHERE ' + where.join(' AND ');
    const result = await db.prepare(
        `SELECT s.*, a.name as arena_name FROM sponsors s LEFT JOIN arenas a ON s.arena_id = a.id ${wc}
         ORDER BY CASE s.sponsor_level WHEN 'platinum' THEN 1 WHEN 'gold' THEN 2 WHEN 'silver' THEN 3 WHEN 'bronze' THEN 4 ELSE 5 END, s.sponsor_name`
    ).bind(...binds).all();

    return Response.json({ sponsors: result.results || [] }, { headers: corsHeaders() });
}

async function handlePost(request, db) {
    const body = await request.json();
    if (!body.sponsor_name) return Response.json({ error: 'sponsor_name required' }, { status: 400, headers: corsHeaders() });

    const slug = body.sponsor_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    const result = await db.prepare(
        `INSERT INTO sponsors (arena_id, sponsor_name, slug, sponsor_level, website, is_active) VALUES (?, ?, ?, ?, ?, 1) RETURNING *`
    ).bind(body.arena_id || null, body.sponsor_name, slug, body.sponsor_level || 'bronze', body.website || null).first();

    return Response.json(result, { status: 201, headers: corsHeaders() });
}

function corsHeaders() {
    return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
}
