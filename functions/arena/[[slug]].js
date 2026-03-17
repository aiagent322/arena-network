// /arena/[slug] → serves arena.html
// The arena.html page reads the slug from the URL path
export async function onRequest(context) {
    const url = new URL(context.request.url);
    // Serve the arena.html page for any /arena/* path
    const assetUrl = new URL('/arena.html', url.origin);
    return context.env.ASSETS.fetch(new Request(assetUrl, context.request));
}
