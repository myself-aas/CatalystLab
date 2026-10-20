/**
 * Same-origin `/api/*` proxy for the split hosting decision.
 *
 * Owner decisions: D3 (b) — the static frontend runs on Cloudflare Pages while
 * the Express API runs on a Node host (Q32) — and Q31 (a), which chose a
 * Cloudflare Worker route on the apex zone to forward `/api/*` to that host.
 * The browser therefore only ever talks to www.catalystlab.tech: no CORS
 * preflight for first-party calls, and no API host name is published.
 *
 * Deploy: `npx wrangler deploy` (see wrangler.toml). Set `API_ORIGIN` to the
 * API host's origin, for example https://api-internal.catalystlab.tech.
 */

/** Hop-by-hop headers must not be forwarded (RFC 9110 §7.6.1). */
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  // The Cloudflare pseudo-header would otherwise be echoed upstream twice.
  'cf-connecting-ip',
  'cf-ipcountry',
  'cf-ray',
  'cf-visitor',
]);

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function buildUpstreamHeaders(request) {
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue;
    headers.set(key, value);
  }

  const clientIp = request.headers.get('cf-connecting-ip') || '';
  // The API only trusts X-Forwarded-For when TRUST_PROXY=true, and it takes the
  // leftmost entry, so the real client IP goes first.
  const forwardedFor = request.headers.get('x-forwarded-for');
  headers.set('x-forwarded-for', clientIp ? (forwardedFor ? `${clientIp}, ${forwardedFor}` : clientIp) : forwardedFor || '');
  headers.set('x-forwarded-proto', new URL(request.url).protocol.replace(':', ''));
  headers.set('x-forwarded-host', new URL(request.url).host);
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/') && url.pathname !== '/api') {
      // The Worker is attached to the /api/* route, so this should not happen.
      return jsonResponse(404, { success: false, error: 'Not an API route.' });
    }

    const origin = (env.API_ORIGIN || '').replace(/\/+$/, '');
    if (!origin) {
      return jsonResponse(503, { success: false, error: 'API_ORIGIN is not configured.' });
    }

    const upstream = `${origin}${url.pathname}${url.search}`;

    try {
      // No timeout is set on purpose: /api/v1/audit/master/stream is a
      // server-sent event stream that stays open for the whole audit.
      const response = await fetch(upstream, {
        method: request.method,
        headers: buildUpstreamHeaders(request),
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual',
      });

      const headers = new Headers(response.headers);
      // The API host name must not leak into what the browser sees.
      headers.delete('set-cookie-domain');
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    } catch (error) {
      // 502 rather than 504: the Worker could not complete the request, and the
      // distinction does not matter to the client. Never leak the upstream name.
      return jsonResponse(502, {
        success: false,
        error: 'The API host did not answer. Try again shortly.',
      });
    }
  },
};
