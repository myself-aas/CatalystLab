/**
 * Same-origin `/api/*` proxy for split hosting (D3 (b), Q31 (a)).
 *
 * Security invariants:
 *   1. Fails closed (`503 API_ORIGIN_NOT_CONFIGURED`) when `env.API_ORIGIN` is
 *      empty, non-HTTPS (outside localhost dev), or points at unprovisioned
 *      placeholder hostnames (`api.catalystlab.tech`, `example.com`).
 *   2. Appends `cf-connecting-ip` as the RIGHTMOST `X-Forwarded-For` entry so
 *      `server/core/rateLimit.ts` (`clientIp` rightmost hop when TRUST_PROXY=true,
 *      Plan 3.6) cannot be spoofed by client-supplied `X-Forwarded-For` headers.
 *   3. Strips RFC 9110 §7.6.1 hop-by-hop headers and upstream `set-cookie-domain`,
 *      and streams SSE responses (`/api/v1/audit/master/stream`) without buffering.
 */

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'cf-connecting-ip',
  'cf-ipcountry',
  'cf-ray',
  'cf-visitor',
]);

const PLACEHOLDER_HOSTS = new Set([
  'api.catalystlab.tech',
  'api.example.com',
  'example.com',
  'your-api-host.example.com',
]);

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function validateConfiguredOrigin(rawOrigin) {
  const trimmed = String(rawOrigin || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return { valid: false, reason: 'API_ORIGIN is empty.' };
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'API_ORIGIN is not a valid URL.' };
  }
  const host = parsed.hostname.toLowerCase();
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocal)) {
    return { valid: false, reason: 'API_ORIGIN must use https://.' };
  }
  if (PLACEHOLDER_HOSTS.has(host)) {
    return { valid: false, reason: `API_ORIGIN points to unprovisioned placeholder host "${host}".` };
  }
  return { valid: true, origin: `${parsed.protocol}//${parsed.host}` };
}

export function buildUpstreamHeaders(request) {
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue;
    headers.set(key, value);
  }

  const clientIp = (request.headers.get('cf-connecting-ip') || '').trim();
  const forwardedFor = (request.headers.get('x-forwarded-for') || '').trim();
  // Plan 3.6: append the verified Cloudflare edge client IP at the RIGHT end of
  // X-Forwarded-For so a spoofed client header at position 0 is ignored upstream.
  if (clientIp) {
    headers.set('x-forwarded-for', forwardedFor ? `${forwardedFor}, ${clientIp}` : clientIp);
  } else {
    headers.delete('x-forwarded-for');
  }

  const parsedUrl = new URL(request.url);
  headers.set('x-forwarded-proto', parsedUrl.protocol.replace(':', ''));
  headers.set('x-forwarded-host', parsedUrl.host);
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/') && url.pathname !== '/api') {
      return jsonResponse(404, { success: false, error: 'Not an API route.' });
    }

    const validated = validateConfiguredOrigin(env?.API_ORIGIN);
    if (!validated.valid) {
      return jsonResponse(503, {
        success: false,
        code: 'API_ORIGIN_NOT_CONFIGURED',
        error: 'Upstream API origin is not configured on this edge deployment.',
      });
    }

    const upstream = `${validated.origin}${url.pathname}${url.search}`;

    try {
      const response = await fetch(upstream, {
        method: request.method,
        headers: buildUpstreamHeaders(request),
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual',
      });

      const headers = new Headers(response.headers);
      headers.delete('set-cookie-domain');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      return jsonResponse(502, {
        success: false,
        code: 'API_UPSTREAM_UNREACHABLE',
        error: 'The API host did not answer. Try again shortly.',
      });
    }
  },
};
