// /api/vendors — GET list, POST create
export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    if (request.method === 'GET') return handleGet(request, env.DB);
    if (request.method === 'POST') return handlePost(request, env.DB);
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders() });
}

async function handleGet(request, db) {
    const url = new URL(request.url);
    const params = url.searchParams;
    const category = params.get('category');
    const arena_id = params.get('arena_id');
    const state = params.get('state');
    const search = params.get('search');
    const limit = Math.min(parseInt(params.get('limit')) || 100, 500);

    let where = ['v.is_active = 1'];
    let binds = [];

    if (category) { where.push('v.category = ?'); binds.push(category); }
    if (arena_id) { where.push('v.arena_id = ?'); binds.push(arena_id); }
    if (state) { where.push('(v.state = ? OR a.state = ?)'); binds.push(state, state); }
    if (search) { where.push('(v.vendor_name LIKE ? OR v.category LIKE ? OR v.description LIKE ?)'); binds.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const whereClause = 'WHERE ' + where.join(' AND ');

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM vendors v LEFT JOIN arenas a ON v.arena_id = a.id ${whereClause}`).bind(...binds).first();

    const sql = `SELECT v.*, a.name as arena_name, a.slug as arena_slug, a.city as arena_city, a.state as arena_state
        FROM vendors v LEFT JOIN arenas a ON v.arena_id = a.id
        ${whereClause} ORDER BY v.vendor_name ASC LIMIT ?`;

    const result = await db.prepare(sql).bind(...binds, limit).all();

    return Response.json({
        vendors: result.results || [],
        total: countResult?.total || 0
    }, { headers: corsHeaders() });
}

async function handlePost(request, db) {
    const body = await request.json();
    if (!body.vendor_name) return Response.json({ error: 'vendor_name required' }, { status: 400, headers: corsHeaders() });

    const slug = body.vendor_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const result = await db.prepare(
        `INSERT INTO vendors (arena_id, vendor_name, slug, category, city, state, contact_email, booth_location, website)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(body.arena_id || null, body.vendor_name, slug, body.category || null, body.city || null, body.state || null, body.contact_email || null, body.booth_location || null, body.website || null).first();

    return Response.json(result, { status: 201, headers: corsHeaders() });
}

function corsHeaders() {
    return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
}
