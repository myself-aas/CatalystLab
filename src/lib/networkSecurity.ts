import { URL } from 'url';
import dns from 'dns';
import http from 'http';
import https from 'https';
import type { LookupFunction } from 'net';
import zlib from 'zlib';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

/**
 * Checks whether an IPv4 address falls within private, loopback, link-local,
 * or cloud provider instance metadata ranges.
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;

  // Normalize IPv6-mapped IPv4 addresses (e.g. "::ffff:127.0.0.1")
  const v4 = ip.startsWith('::ffff:') ? ip.substring(7) : ip;

  // IPv6 checks
  if (v4.includes(':')) {
    const lower = v4.toLowerCase();
    if (lower === '::1' || lower === '::') return true; // Loopback / Unspecified
    if (lower.startsWith('fe80:')) return true; // Link-local
    if (lower.startsWith('fc00:') || lower.startsWith('fd00:')) return true; // Unique Local Address
    return false;
  }

  const parts = v4.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid format
  }

  const [p0, p1] = parts;

  // 0.0.0.0/8 (Current network)
  if (p0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (p0 === 127) return true;

  // 10.0.0.0/8 (Private RFC 1918)
  if (p0 === 10) return true;

  // 172.16.0.0/12 (Private RFC 1918)
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;

  // 192.168.0.0/16 (Private RFC 1918)
  if (p0 === 192 && p1 === 168) return true;

  // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata API 169.254.169.254)
  if (p0 === 169 && p1 === 254) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT)
  if (p0 === 100 && p1 >= 64 && p1 <= 127) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (p0 >= 224) return true;

  return false;
}

/**
 * Validates whether a target URL is safe for outbound telemetry auditing,
 * blocking SSRF attacks, internal service probing, and loopback exploits.
 */
export async function validatePublicUrl(rawUrl: string, isRepo: boolean = false): Promise<{
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
  hostname?: string;
  ip?: string;
}> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string.' };
  }

  let clean = rawUrl.trim();

  // Normalize scheme (repo and web engines share the same rules)
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }

  let parsed: URL;
  try {
    parsed = new URL(clean);
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }

  // Enforce http/https protocols only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost, local network names, and explicit reserved domains
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost')
  ) {
    return { valid: false, error: 'Internal hostnames and loopback addresses cannot be audited.' };
  }

  // Resolve hostname DNS to check target IP against SSRF ranges
  try {
    const lookup = await dnsLookup(hostname);
    if (isPrivateIp(lookup.address)) {
      return {
        valid: false,
        error: `Target resolves to a private or reserved network address (${lookup.address}). Access blocked for security.`,
        hostname,
        ip: lookup.address
      };
    }

    return {
      valid: true,
      normalizedUrl: parsed.toString(),
      hostname,
      ip: lookup.address
    };
  } catch (dnsErr: any) {
    // If the hostname is a raw IP literal, classify it directly.
    const isIpLiteral = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');
    if (isIpLiteral && isPrivateIp(hostname)) {
      return {
        valid: false,
        error: 'Target IP is a private or reserved network address. Access blocked.',
        hostname
      };
    }

    // Fail closed: an unresolvable host must never fall through to a blind
    // connect, because the connection would resolve DNS a second time (TOCTOU).
    return {
      valid: false,
      error: `DNS resolution failed for target host (${dnsErr?.message || 'unreachable'}). Access blocked.`,
      hostname
    };
  }
}

// --- SSRF-hardened outbound fetch -------------------------------------------

export interface GuardedFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  isRepo?: boolean;
  /** Maximum accepted response body size in bytes (default 5 MB). */
  maxBytes?: number;
  /** Redirect hops followed; every hop is re-validated against the SSRF guard. */
  maxRedirects?: number;
  /**
   * TESTING ONLY. Overrides the IP the socket connects to while all SSRF
   * guard logic (DNS resolution, private-range checks, per-hop
   * re-validation) still runs against the real hostname. Never set this
   * from request-handling code.
   */
  connectIpOverride?: string;
}

/** Minimal fetch-like response surface consumed by the audit engines. */
export interface GuardedResponse {
  ok: boolean;
  status: number;
  headers: { has(name: string): boolean; get(name: string): string | null };
  text(): Promise<string>;
  json(): Promise<unknown>;
  /** Total wall-clock ms until the response (including redirects) completed. */
  elapsedMs: number;
}

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function pinnedRequest(
  parsedUrl: URL,
  ip: string,
  options: GuardedFetchOptions
): Promise<{ status: number; headers: http.IncomingHttpHeaders; stream: http.IncomingMessage }> {
  const transport = parsedUrl.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = transport.request(
      parsedUrl,
      {
        method: options.method || 'GET',
        headers: { 'User-Agent': 'CatalystLab-Telemetry/2.0', ...(options.headers || {}) },
        timeout: options.timeoutMs ?? 10000,
        // Pin the connection to the DNS answer validated by the SSRF guard:
        // the socket can never reach an address the guard did not approve.
        lookup: (async (
          _hostname: string,
          lookupOpts: { all?: boolean } | undefined,
          cb: (err: NodeJS.ErrnoException | null, address?: string | readonly { address: string; family: number }[], family?: number) => void
        ) => {
          const family = ip.includes(':') ? 6 : 4;
          // Node 20+ Happy Eyeballs (autoSelectFamily) requests all addresses.
          if (lookupOpts?.all) {
            cb(null, [{ address: ip, family }]);
          } else {
            cb(null, ip, family);
          }
        }) as LookupFunction,
      },
      (res) => resolve({ status: res.statusCode || 0, headers: res.headers, stream: res })
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error(`Request timed out after ${options.timeoutMs ?? 10000}ms.`)));
    req.end();
  });
}

/**
 * Performs an outbound HTTP request for audit engines with full SSRF protection:
 * DNS is resolved once and validated, the connection is pinned to the validated
 * IP (anti-rebinding), redirects are re-validated per hop, response size is
 * capped, and TLS verification stays enabled.
 */
export async function guardedFetch(rawUrl: string, options: GuardedFetchOptions = {}): Promise<GuardedResponse> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? 3;
  const startedAt = performance.now();

  // Reject non-HTTP(S) schemes before any normalization can mask them.
  if (/^[a-z][a-z0-9+.-]*:/i.test(rawUrl)) {
    const probe = new URL(rawUrl);
    if (probe.protocol !== 'http:' && probe.protocol !== 'https:') {
      throw new Error('Only HTTP and HTTPS protocols are supported.');
    }
  }

  let currentUrl = rawUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const validation = await validatePublicUrl(currentUrl, options.isRepo ?? false);
    if (!validation.valid || !validation.hostname) {
      throw new Error(validation.error || 'Target URL blocked by SSRF guard.');
    }

    // Re-check the exact IP the connection will use.
    let ip = validation.ip;
    if (!ip) {
      const lookup = await dnsLookup(validation.hostname);
      ip = lookup.address;
    }
    if (isPrivateIp(ip)) {
      throw new Error(`Target resolves to a private or reserved network address (${ip}). Access blocked.`);
    }

    const parsedUrl = new URL(validation.normalizedUrl || currentUrl);
    const connectIp = options.connectIpOverride ?? ip;
    const { status, headers, stream } = await pinnedRequest(parsedUrl, connectIp, options);

    if (REDIRECT_STATUSES.has(status) && hop < maxRedirects && headers.location) {
      stream.resume(); // drain the redirect body
      currentUrl = new URL(headers.location, parsedUrl).toString();
      if (status === 303 && (options.method || 'GET') !== 'HEAD') {
        options = { ...options, method: 'GET' };
      }
      continue;
    }

    const headerMap = new Map<string, string>();
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined) headerMap.set(key.toLowerCase(), Array.isArray(value) ? value.join(', ') : value);
    }

    const contentEncoding = (headerMap.get('content-encoding') || '').toLowerCase();
    let decoder: zlib.Gunzip | zlib.BrotliDecompress | zlib.Inflate | null = null;
    if (contentEncoding.includes('br')) decoder = zlib.createBrotliDecompress();
    else if (contentEncoding.includes('gzip')) decoder = zlib.createGunzip();
    else if (contentEncoding.includes('deflate')) decoder = zlib.createInflate();

    const body = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let total = 0;
      let pipeline: NodeJS.ReadableStream = stream;
      if (decoder) {
        stream.pipe(decoder);
        pipeline = decoder;
      }
      pipeline.on('data', (chunk: Buffer) => {
        total += chunk.length;
        if (total > maxBytes) {
          stream.destroy();
          reject(new Error(`Response body exceeded the ${maxBytes} byte safety limit.`));
          return;
        }
        chunks.push(chunk);
      });
      pipeline.on('end', () => resolve(Buffer.concat(chunks)));
      pipeline.on('error', reject);
    });

    return {
      ok: status >= 200 && status < 300,
      status,
      elapsedMs: Math.round(performance.now() - startedAt),
      headers: {
        has: (name) => headerMap.has(name.toLowerCase()),
        get: (name) => headerMap.get(name.toLowerCase()) ?? null
      },
      text: async () => body.toString('utf8'),
      json: async () => JSON.parse(body.toString('utf8'))
    };
  }

  throw new Error(`Too many redirects (limit ${maxRedirects}).`);
}
