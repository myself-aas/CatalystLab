import http from 'http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../../server/app';
import { resetSharedLimiterLocalState, setSharedWindowBackendForTests } from '../../../server/core/sharedLimiter';

describe('Telemetry Ingest Rate Limiting & XFF Spoof Protection (Plan 3.2 & 3.6 / Blocker #3)', () => {
  const originalEnv = { ...process.env };
  let server: http.Server;
  let baseUrl: string;

  beforeEach(async () => {
    resetSharedLimiterLocalState();
    setSharedWindowBackendForTests(null);
    process.env.TRUST_PROXY = 'true';
    process.env.TELEMETRY_INGEST_MAX_PER_MIN = '3';
    const app = await createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const addr = server.address() as { port: number };
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterEach(async () => {
    process.env = { ...originalEnv };
    resetSharedLimiterLocalState();
    setSharedWindowBackendForTests(null);
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('enforces 429 + Retry-After on burst traffic AND blocks leftmost X-Forwarded-For spoofing', async () => {
    for (let i = 0; i < 3; i++) {
      // Attacker rotates leftmost X-Forwarded-For IP on every request while real edge IP stays 203.0.113.77
      const res = await fetch(`${baseUrl}/api/telemetry/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
          'X-Forwarded-For': `10.0.0.${i + 1}, 203.0.113.77`,
        },
        body: JSON.stringify({ eventType: 'vitals', url: 'https://www.catalystlab.tech/' }),
      });
      expect(res.status).toBeLessThan(400);
    }

    const blocked = await fetch(`${baseUrl}/api/telemetry/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.250, 203.0.113.77',
      },
      body: JSON.stringify({ eventType: 'vitals', url: 'https://www.catalystlab.tech/' }),
    });

    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThanOrEqual(1);
    expect(blocked.headers.get('x-ratelimit-remaining')).toBe('0');
  });

  it('rejects oversized event batch arrays (> 50 events) with HTTP 413', async () => {
    const events = Array.from({ length: 51 }, (_, idx) => ({
      eventType: 'click',
      idx,
    }));
    const res = await fetch(`${baseUrl}/api/telemetry/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
        'X-Forwarded-For': '203.0.113.88',
      },
      body: JSON.stringify({ events }),
    });
    expect(res.status).toBe(413);
  });
});
