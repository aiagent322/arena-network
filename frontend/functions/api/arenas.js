// /api/arenas — GET list, GET /:id detail
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/arenas', '').replace(/^\//, '');

    if (path) {
        return getArenaDetail(env.DB, path);
    }
    return listArenas(env.DB, url.searchParams);
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
    let idx = 0;

    if (search) {
        idx++;
        where.push(`(a.name LIKE ?${idx} OR a.city LIKE ?${idx} OR a.state LIKE ?${idx})`);
        binds.push(`%${search}%`);
    }
    if (state) {
        idx++;
        where.push(`a.state = ?${idx}`);
        binds.push(state);
    }
    if (type) {
        idx++;
        where.push(`a.arena_type = ?${idx}`);
        binds.push(type);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    // D1 uses positional ? params, not numbered
    const countSql = `SELECT COUNT(*) as total FROM arenas a ${whereClause}`;
    const dataSql = `SELECT a.* FROM arenas a ${whereClause} ORDER BY a.name ASC LIMIT ? OFFSET ?`;

    const countResult = await db.prepare(countSql).bind(...binds).first();
    const total = countResult?.total || 0;

    const dataResult = await db.prepare(dataSql).bind(...binds, limit, offset).all();
    const arenas = dataResult.results || [];

    return Response.json({
        arenas,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
    }, { headers: corsHeaders() });
}

async function getArenaDetail(db, idOrSlug) {
    // Try by slug first, then by id
    let arena = await db.prepare('SELECT * FROM arenas WHERE slug = ?1').bind(idOrSlug).first();
    if (!arena) {
        arena = await db.prepare('SELECT * FROM arenas WHERE id = ?1').bind(idOrSlug).first();
    }
    if (!arena) {
        return Response.json({ error: 'Arena not found' }, { status: 404, headers: corsHeaders() });
    }

    // Get related data
    const events = await db.prepare(
        `SELECT * FROM events WHERE arena_id = ?1 AND is_approved = 1 AND start_date >= date('now') ORDER BY start_date ASC LIMIT 20`
    ).bind(arena.id).all();

    const vendors = await db.prepare(
        'SELECT * FROM vendors WHERE arena_id = ?1 AND is_active = 1 ORDER BY vendor_name'
    ).bind(arena.id).all();

    const sponsors = await db.prepare(
        'SELECT * FROM sponsors WHERE arena_id = ?1 AND is_active = 1 ORDER BY sponsor_level'
    ).bind(arena.id).all();

    return Response.json({
        ...arena,
        upcoming_events: events.results || [],
        vendors: vendors.results || [],
        sponsors: sponsors.results || []
    }, { headers: corsHeaders() });
}

function corsHeaders() {
    return { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
}
