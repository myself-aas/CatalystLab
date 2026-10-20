import { describe, expect, it, vi } from 'vitest';
import worker, { buildUpstreamHeaders, validateConfiguredOrigin } from '../../../worker/api-proxy.js';

describe('worker/api-proxy.js — split-hosting edge proxy hardening (Blocker #2 & Plan 3.6)', () => {
  it('fails closed with 503 API_ORIGIN_NOT_CONFIGURED when API_ORIGIN is empty or points to unprovisioned placeholder', async () => {
    expect(validateConfiguredOrigin('')).toMatchObject({ valid: false });
    expect(validateConfiguredOrigin('https://api.catalystlab.tech')).toMatchObject({ valid: false });
    expect(validateConfiguredOrigin('http://prod-api.internal.net')).toMatchObject({ valid: false });
    expect(validateConfiguredOrigin('https://catalystlab-api.uk-london-1.oraclecloud.example.org')).toEqual({
      valid: true,
      origin: 'https://catalystlab-api.uk-london-1.oraclecloud.example.org',
    });

    const req = new Request('https://www.catalystlab.tech/api/v1/system/health');
    const resEmpty = await worker.fetch(req, { API_ORIGIN: '' });
    expect(resEmpty.status).toBe(503);
    await expect(resEmpty.json()).resolves.toMatchObject({ code: 'API_ORIGIN_NOT_CONFIGURED' });

    const resPlaceholder = await worker.fetch(req, { API_ORIGIN: 'https://api.catalystlab.tech' });
    expect(resPlaceholder.status).toBe(503);
  });

  it('appends cf-connecting-ip to the RIGHT of x-forwarded-for and strips hop-by-hop headers', () => {
    const req = new Request('https://www.catalystlab.tech/api/telemetry/event', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'cf-connecting-ip': '203.0.113.55',
        'cf-ray': 'ray123',
        authorization: 'Bearer token_abc',
      },
    });
    const out = buildUpstreamHeaders(req);
    expect(out.get('x-forwarded-for')).toBe('1.2.3.4, 203.0.113.55');
    expect(out.get('cf-connecting-ip')).toBeNull();
    expect(out.get('cf-ray')).toBeNull();
    expect(out.get('authorization')).toBe('Bearer token_abc');
    expect(out.get('x-forwarded-host')).toBe('www.catalystlab.tech');
    expect(out.get('x-forwarded-proto')).toBe('https');
  });

  it('forwards valid /api/* requests to live HTTPS upstream cleanly', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'operational' }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'set-cookie-domain': 'internal.host' },
      })
    );
    try {
      const req = new Request('https://www.catalystlab.tech/api/v1/system/health?probe=1', {
        headers: { 'cf-connecting-ip': '203.0.113.9' },
      });
      const res = await worker.fetch(req, { API_ORIGIN: 'https://origin-node.catalystlab-edge.net' });
      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie-domain')).toBeNull();
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://origin-node.catalystlab-edge.net/api/v1/system/health?probe=1',
        expect.objectContaining({ method: 'GET', redirect: 'manual' })
      );
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
