import { describe, expect, it } from 'vitest';
import {
  ALLOWED_REQUEST_HEADERS,
  sanitizeLoggedUrl,
  serializeRequest,
  serializeResponse,
} from '../../../server/core/logger';

describe('server/core/logger — strict allowlist serializer (Plan 3.12 / Blocker #4)', () => {
  it('projects ONLY allowlisted request headers and strips every sensitive or arbitrary header', () => {
    const serialized = serializeRequest({
      id: 'req_test_001',
      method: 'POST',
      url: '/api/telemetry/event?api_key=cat_secret_123&mode=fast',
      headers: {
        host: 'www.catalystlab.tech',
        'user-agent': 'Mozilla/5.0 CatalystTest/1.0',
        'content-type': 'application/json',
        'content-length': '128',
        accept: 'application/json',
        'x-request-id': 'req_test_001',
        authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.secret',
        cookie: 'session=super_secret_cookie_value',
        'x-api-key': 'cat_live_secret_token_value',
        'x-user-email': 'founder@acme.io',
        'x-user-id': 'usr_secret_123',
        'x-custom-internal-token': 'internal_secret_999',
        'x-signature-256': 'sha256=hmac_secret_sig',
      },
    });

    const json = JSON.stringify(serialized);
    expect(serialized.headers).toEqual({
      host: 'www.catalystlab.tech',
      'user-agent': 'Mozilla/5.0 CatalystTest/1.0',
      'content-type': 'application/json',
      'content-length': '128',
      accept: 'application/json',
      'x-request-id': 'req_test_001',
    });

    const allowSet = new Set<string>(ALLOWED_REQUEST_HEADERS);
    for (const key of Object.keys(serialized.headers as Record<string, unknown>)) {
      expect(allowSet.has(key)).toBe(true);
    }

    expect(json).not.toContain('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(json).not.toContain('super_secret_cookie_value');
    expect(json).not.toContain('cat_live_secret_token_value');
    expect(json).not.toContain('founder@acme.io');
    expect(json).not.toContain('internal_secret_999');
    expect(json).not.toContain('hmac_secret_sig');
    expect(json).not.toContain('cat_secret_123');
    expect(serialized.url).toBe('/api/telemetry/event?api_key=%5Bredacted%5D&mode=fast');
  });

  it('omits Set-Cookie and non-allowlisted headers in serializeResponse', () => {
    const res = serializeResponse({
      statusCode: 200,
      getHeaders: () => ({
        'content-type': 'application/json; charset=utf-8',
        'x-ratelimit-remaining': '59',
        'set-cookie': 'sid=topsecret; HttpOnly; Secure',
        'x-internal-node': 'oracle-vm-01',
      }),
    });

    expect(res.headers).toEqual({
      'content-type': 'application/json; charset=utf-8',
      'x-ratelimit-remaining': '59',
    });
    expect(JSON.stringify(res)).not.toContain('topsecret');
    expect(JSON.stringify(res)).not.toContain('oracle-vm-01');
  });

  it('redacts sensitive query parameters via sanitizeLoggedUrl', () => {
    expect(sanitizeLoggedUrl('/auth/callback?token=abc123&state=ok&sig=xyz')).toBe(
      '/auth/callback?token=%5Bredacted%5D&state=ok&sig=%5Bredacted%5D'
    );
  });
});
