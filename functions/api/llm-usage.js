// /api/llm-usage — GET stats, POST log
export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    if (request.method === 'GET') return handleGet(request, env.DB);
    if (request.method === 'POST') return handlePost(request, env.DB);
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders() });
}

async function handleGet(request, db) {
    const url = new URL(request.url);
    const days = Math.max(1, Math.min(365, parseInt(url.searchParams.get('days')) || 30));

    const summary = await db.prepare(
        `SELECT COUNT(*) as total_calls, COALESCE(SUM(tokens),0) as total_tokens, COALESCE(SUM(cost),0) as total_cost,
         CASE WHEN COUNT(*)>0 THEN ROUND(CAST(SUM(tokens) AS REAL)/COUNT(*),0) ELSE 0 END as avg_tokens_per_call
         FROM llm_usage WHERE timestamp >= datetime('now', '-${days} days')`
    ).first();

    const byOp = await db.prepare(
        `SELECT operation, model, COUNT(*) as call_count, SUM(tokens) as total_tokens, SUM(cost) as total_cost
         FROM llm_usage WHERE timestamp >= datetime('now', '-${days} days')
         GROUP BY operation, model ORDER BY total_tokens DESC`
    ).all();

    const daily = await db.prepare(
        `SELECT date(timestamp) as date, COUNT(*) as call_count, SUM(tokens) as total_tokens, SUM(cost) as total_cost
         FROM llm_usage WHERE timestamp >= datetime('now', '-${days} days')
         GROUP BY date(timestamp) ORDER BY date DESC`
    ).all();

    return Response.json({
        period_days: days,
        summary: summary || {},
        by_operation: byOp.results || [],
        daily: daily.results || [],
        by_arena: []
    }, { headers: corsHeaders() });
}

async function handlePost(request, db) {
    const body = await request.json();
    if (!body.operation) return Response.json({ error: 'operation required' }, { status: 400, headers: corsHeaders() });

    const tokens = body.tokens || ((parseInt(body.input_tokens) || 0) + (parseInt(body.output_tokens) || 0));

    const result = await db.prepare(
        `INSERT INTO llm_usage (arena_id, operation, model, input_tokens, output_tokens, tokens, cost, endpoint, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
        body.arena_id || null, body.operation, body.model || null,
        parseInt(body.input_tokens) || 0, parseInt(body.output_tokens) || 0,
        tokens, parseFloat(body.cost) || 0,
        body.endpoint || null, body.metadata ? JSON.stringify(body.metadata) : null
    ).first();

    return Response.json(result, { status: 201, headers: corsHeaders() });
}

function corsHeaders() {
    return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
}
