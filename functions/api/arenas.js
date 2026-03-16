// /api/arenas — GET list OR GET detail by ?slug= or ?id=
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const params = url.searchParams;

    // Detail mode: ?slug=xxx or ?id=xxx
    const slug = params.get('slug');
    const id = params.get('id');
    if (slug || id) {
        return getArenaDetail(env.DB, slug || id);
    }

    return listArenas(env.DB, params);
}

async function listArenas(db, params) {
    const search = params.get('search') || '';
    const state = params.get('state') || '';
    const type = params.get('type') || '';
    const limit = Math.min(parseInt(params.get('limit')) || 100, 500);
    const page = Math.max(parseInt(params.get('page')) || 1, 1);
    const offset = (page - 1) * limit;

    let where = ['a.is_active = 1'];
    let binds = [];

    if (search) {
        where.push('(a.name LIKE ? OR a.city LIKE ? OR a.state LIKE ?)');
        binds.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (state) {
        where.push('a.state = ?');
        binds.push(state);
    }
    if (type) {
        where.push('a.arena_type = ?');
        binds.push(type);
    }

    const whereClause = 'WHERE ' + where.join(' AND ');

    const countResult = await db.prepare(
        `SELECT COUNT(*) as total FROM arenas a ${whereClause}`
    ).bind(...binds).first();
    const total = countResult?.total || 0;

    const dataResult = await db.prepare(
        `SELECT a.* FROM arenas a ${whereClause} ORDER BY a.name ASC LIMIT ? OFFSET ?`
    ).bind(...binds, limit, offset).all();

    return Response.json({
        arenas: dataResult.results || [],
        total, page, limit,
        pages: Math.ceil(total / limit)
    }, { headers: corsHeaders() });
}

async function getArenaDetail(db, idOrSlug) {
    // Try slug first, then id
    let arena = await db.prepare('SELECT * FROM arenas WHERE slug = ?').bind(idOrSlug).first();
    if (!arena) {
        arena = await db.prepare('SELECT * FROM arenas WHERE id = ?').bind(idOrSlug).first();
    }
    if (!arena) {
        return Response.json({ error: 'Arena not found' }, { status: 404, headers: corsHeaders() });
    }

    // Upcoming events
    const events = await db.prepare(
        `SELECT e.*, a.name as arena_name, a.city as arena_city, a.state as arena_state
         FROM events e LEFT JOIN arenas a ON e.arena_id = a.id
         WHERE e.arena_id = ? AND e.is_approved = 1
         ORDER BY e.start_date ASC LIMIT 20`
    ).bind(arena.id).all();

    // Vendors at this arena
    const vendors = await db.prepare(
        `SELECT * FROM vendors WHERE arena_id = ? AND is_active = 1 ORDER BY vendor_name`
    ).bind(arena.id).all();

    // Sponsors for this arena
    const sponsors = await db.prepare(
        `SELECT * FROM sponsors WHERE arena_id = ? AND is_active = 1
         ORDER BY CASE sponsor_level WHEN 'platinum' THEN 1 WHEN 'gold' THEN 2 WHEN 'silver' THEN 3 WHEN 'bronze' THEN 4 ELSE 5 END`
    ).bind(arena.id).all();

    // News for this arena
    const news = await db.prepare(
        `SELECT * FROM news WHERE arena_id = ? AND is_published = 1 ORDER BY publish_date DESC LIMIT 10`
    ).bind(arena.id).all();

    return Response.json({
        ...arena,
        upcoming_events: events.results || [],
        vendors: vendors.results || [],
        sponsors: sponsors.results || [],
        news: news.results || []
    }, { headers: corsHeaders() });
}

function corsHeaders() {
    return { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
}
