import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@server/app';

describe('injected seam really substitutes the boundary', () => {
  it('uses the injected engine runner instead of the real one', async () => {
    const calls: string[] = [];
    const app = await createApp({
      deps: {
        engine: {
          runNativeEngine: async (url, engine) => {
            calls.push(`${engine} ${url}`);
            return 'INJECTED-OUTPUT';
          },
          validatePublicUrl: async (url) => ({ valid: true, normalizedUrl: url }),
          guardedFetch: async () => ({ ok: true, status: 200, headers: { has: () => false, get: () => null }, text: async () => '', json: async () => ({}) })
        }
      }
    });
    const res = await request(app).post('/api/run-engine').send({ engine: 'health', url: 'https://example.com' });
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toContain('INJECTED-OUTPUT');
    expect(calls).toEqual(['health https://example.com']);
  }, 30000);
});
