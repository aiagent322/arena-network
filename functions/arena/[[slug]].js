// /arena/[slug] → serves arena.html
export async function onRequest(context) {
    try {
        // Build request for the static arena.html asset
        const url = new URL(context.request.url);
        url.pathname = '/arena.html';
        const response = await context.env.ASSETS.fetch(url.toString());
        // Return with original status and headers but serve arena.html content
        return new Response(response.body, {
            status: 200,
            headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
    } catch (e) {
        // Fallback: redirect to query param version
        const slug = context.params.slug ? context.params.slug.join('/') : '';
        return Response.redirect(new URL('/arena.html?id=' + slug, context.request.url).toString(), 302);
    }
}
