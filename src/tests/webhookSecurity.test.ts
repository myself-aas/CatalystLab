import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { verifyHmacSha256, signHmacSha256 } from '../lib/webhookSecurity';
import { guardedFetch } from '../lib/networkSecurity';

// Hoisted dns mock: validatePublicUrl captures promisify(dns.lookup) at import
// time, so the mock must replace the dns module itself.
const lookupMock = vi.fn();
vi.mock('dns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('dns')>();
  const lookup = (...args: unknown[]) => lookupMock(...args);
  // Copy util.promisify's custom-args symbols so promisify(dns.lookup)
  // resolves { address, family } exactly like the real implementation.
  for (const sym of Object.getOwnPropertySymbols(actual.lookup)) {
    (lookup as unknown as Record<symbol, unknown>)[sym] = (actual.lookup as unknown as Record<symbol, unknown>)[sym];
  }
  return { default: { lookup }, lookup };
});

/**
 * Realistic default: IP literals resolve to themselves (so isPrivateIp-based
 * rejections behave like production), the integration-test hostnames resolve
 * to a public IP, and everything else fails with ENOTFOUND (fail closed).
 * promisify may call the mock with (host, cb) or (host, opts, cb).
 */
beforeAll(() => {
  lookupMock.mockImplementation((...args: unknown[]) => {
    const host = args[0] as string;
    const cb = args[args.length - 1] as (err: NodeJS.ErrnoException | null, address?: string, family?: number) => void;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) {
      cb(null, host, host.includes(':') ? 6 : 4);
    } else if (host === 'guarded-test.example' || host === 'hop-two.example.com') {
      cb(null, '93.184.215.14', 4);
    } else {
      const err = new Error(`ENOTFOUND ${host}`) as NodeJS.ErrnoException;
      err.code = 'ENOTFOUND';
      cb(err);
    }
  });
});

describe('verifyHmacSha256 (Phase 0 webhook hardening)', () => {
  const secret = 'whsec_test_0123456789abcdef';
  const body = Buffer.from(JSON.stringify({ action: 'push', zen: 'test' }));

  it('accepts a correctly signed payload', () => {
    const signature = signHmacSha256(body, secret);
    expect(verifyHmacSha256(body, signature, secret).valid).toBe(true);
  });

  it('accepts string bodies identically to buffers', () => {
    const signature = signHmacSha256(body.toString('utf8'), secret);
    expect(verifyHmacSha256(body.toString('utf8'), signature, secret).valid).toBe(true);
  });

  it('rejects a signature computed with the wrong secret', () => {
    const signature = signHmacSha256(body, 'attacker-secret');
    const result = verifyHmacSha256(body, signature, secret);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/mismatch/i);
  });

  it('rejects a tampered payload', () => {
    const signature = signHmacSha256(body, secret);
    const tampered = Buffer.from(JSON.stringify({ action: 'push', zen: 'evil' }));
    expect(verifyHmacSha256(tampered, signature, secret).valid).toBe(false);
  });

  it('rejects missing or malformed signature headers', () => {
    expect(verifyHmacSha256(body, undefined, secret).valid).toBe(false);
    expect(verifyHmacSha256(body, null, secret).valid).toBe(false);
    expect(verifyHmacSha256(body, '', secret).valid).toBe(false);
    expect(verifyHmacSha256(body, 'garbage-not-a-signature', secret).valid).toBe(false);
    expect(verifyHmacSha256(body, 'sha256=short', secret).valid).toBe(false);
  });

  it('rejects sha1-only signatures (sha256 required)', () => {
    const sha1 = 'sha1=' + require('crypto').createHmac('sha1', secret).update(body).digest('hex');
    expect(verifyHmacSha256(body, sha1, secret).valid).toBe(false);
  });

  it('rejects everything when the server secret is not configured', () => {
    const signature = signHmacSha256(body, secret);
    const result = verifyHmacSha256(body, signature, '');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/not configured/i);
  });
});

describe('guardedFetch SSRF enforcement (Phase 0 DNS pinning)', () => {
  it.each([
    ['http://localhost:3000/admin', 'loopback hostname'],
    ['http://127.0.0.1:8080/', 'loopback IP literal'],
    ['http://169.254.169.254/latest/meta-data/', 'cloud metadata endpoint'],
    ['http://10.1.2.3/internal', 'RFC1918 private'],
    ['http://192.168.0.42/router', 'RFC1918 private'],
    ['https://internal.service.local/', 'mDNS-style internal hostname']
  ])('blocks %s (%s)', async (url) => {
    await expect(guardedFetch(url)).rejects.toThrow(/private|loopback|Internal|blocked/i);
  });

  it('blocks non-http(s) protocols', async () => {
    await expect(guardedFetch('ftp://example.com/file')).rejects.toThrow(/HTTP and HTTPS/i);
  });

  it('fails closed on unresolvable hosts instead of connecting blind', async () => {
    await expect(guardedFetch('https://catalystlab-nonexistent-host-abcxyz.invalid/')).rejects.toThrow(
      /DNS resolution failed/i
    );
  }, 15000);
});

describe('guardedFetch positive path (offline integration via local server)', () => {
  let server: import('http').Server;
  let port: number;
  let hits: string[];

  beforeEach(() => {
    hits = [];
  });

  beforeAll(async () => {
    const http = await import('http');
    hits = [];
    server = http.createServer((req, res) => {
      hits.push(req.url || '/');
      if (req.url === '/start') {
        // Redirect to an absolute URL on a second "public" hostname; the
        // guard must re-validate hop 2 before the pinned connect follows it.
        res.writeHead(302, { location: `http://hop-two.example.com:${port}/landed` });
        res.end();
      } else if (req.url === '/to-private') {
        res.writeHead(302, { location: 'http://127.0.0.1:9/secret' });
        res.end();
      } else {
        res.writeHead(200, { 'content-type': 'application/json', 'x-proof': 'guarded-fetch' });
        res.end(JSON.stringify({ landed: req.url }));
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = (server.address() as { port: number }).port;
  });

  it('returns status/headers/body through the pinned connection', async () => {
    lookupMock.mockImplementation((...args: unknown[]) => {
      const cb = args[args.length - 1] as (e: null, a: string, f: number) => void;
      cb(null, '93.184.215.14', 4);
    });
    const res = await guardedFetch(`http://guarded-test.example:${port}/data`, {
      connectIpOverride: '127.0.0.1'
    });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-proof')).toBe('guarded-fetch');
    expect(await res.json()).toEqual({ landed: '/data' });
  });

  it('follows redirects with per-hop SSRF re-validation (public hop 2)', async () => {
    lookupMock.mockImplementation((...args: unknown[]) => {
      const cb = args[args.length - 1] as (e: null, a: string, f: number) => void;
      cb(null, '93.184.215.14', 4);
    });
    const res = await guardedFetch(`http://guarded-test.example:${port}/start`, {
      connectIpOverride: '127.0.0.1'
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ landed: '/landed' });
    expect(hits).toEqual(['/start', '/landed']);
  });

  it('refuses redirects that target private/loopback addresses', async () => {
    lookupMock.mockImplementation((...args: unknown[]) => {
      const cb = args[args.length - 1] as (e: null, a: string, f: number) => void;
      cb(null, '93.184.215.14', 4);
    });
    await expect(
      guardedFetch(`http://guarded-test.example:${port}/to-private`, { connectIpOverride: '127.0.0.1' })
    ).rejects.toThrow(/loopback|private|Internal/i);
  });
});
