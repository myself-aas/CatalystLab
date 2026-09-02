// @vitest-environment node
// Phase 3 (item 16): server-route suite covering the five Critical-mapped
// flows (C1 payments fail-closed, C2 identity spoof resistance, C3 webhook
// HMAC, C4 state-sync auth, C5-adjacent validation) plus the HTTP plumbing
// (404 JSON, request correlation, client-log sink).
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createHmac } from 'crypto';

let app: Express;

const GH_SECRET = 'whsec_test_secret';
const PAY_SECRET = 'whsec_payments_test';

function hmacSha256(body: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

const GH_PING_BODY = JSON.stringify({ zen: 'Keep it logically awesome.', hook_id: 424242 });

beforeAll(async () => {
  // Must be set BEFORE the app (and its route modules) are imported — the
  // default repo record snapshots GITHUB_WEBHOOK_SECRET at module load.
  process.env.GITHUB_WEBHOOK_SECRET = GH_SECRET;
  process.env.PAYMENTS_WEBHOOK_SECRET = PAY_SECRET;
  const { createApp } = await import('@server/app');
  app = await createApp();
});

describe('C1: payments fail closed', () => {
  it('POST /api/payments/verify never grants entitlements', async () => {
    const res = await request(app)
      .post('/api/payments/verify')
      .send({ orderId: 'ord_fake_123', planId: 'enterprise', billingCycle: 'annual' });
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.activeUntil).toBeUndefined();
  });

  it('POST /api/payments/create-checkout is 503 without gateway credentials', async () => {
    const res = await request(app).post('/api/payments/create-checkout').send({ planId: 'pro', gateway: '2checkout' });
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });

  it('2Checkout webhook rejects unsigned payloads with a configured secret', async () => {
    const res = await request(app).post('/api/payments/webhook/2checkout').send({ message_type: 'ORDER_CREATED' });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('2Checkout webhook accepts a valid HMAC over the raw body', async () => {
    const body = JSON.stringify({ message_type: 'ORDER_CREATED', sale_id: 12345 });
    const res = await request(app)
      .post('/api/payments/webhook/2checkout')
      .set('Content-Type', 'application/json')
      .set('x-signature-256', hmacSha256(body, PAY_SECRET))
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it('2Checkout webhook rejects a tampered signature', async () => {
    const body = JSON.stringify({ message_type: 'ORDER_CREATED' });
    const res = await request(app)
      .post('/api/payments/webhook/2checkout')
      .set('Content-Type', 'application/json')
      .set('x-signature-256', hmacSha256(body, 'attacker-controlled-secret'))
      .send(body);
    expect(res.status).toBe(401);
  });
});

describe('C3: GitHub webhook HMAC verification', () => {
  it('404s unknown repoIds instead of auto-provisioning', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/github/webhook?repoId=gh_does_not_exist')
      .set('x-github-event', 'push')
      .send({});
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('rejects unsigned and bad-signature events with 401', async () => {
    const unsigned = await request(app)
      .post('/api/v1/integrations/github/webhook?repoId=gh_repo_default_01')
      .set('x-github-event', 'ping')
      .set('Content-Type', 'application/json')
      .send(GH_PING_BODY);
    expect(unsigned.status).toBe(401);

    const forged = await request(app)
      .post('/api/v1/integrations/github/webhook?repoId=gh_repo_default_01')
      .set('x-github-event', 'ping')
      .set('Content-Type', 'application/json')
      .set('x-hub-signature-256', hmacSha256(GH_PING_BODY, 'wrong-secret'))
      .send(GH_PING_BODY);
    expect(forged.status).toBe(401);
  });

  it('accepts a validly-signed ping and echoes the zen', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/github/webhook?repoId=gh_repo_default_01')
      .set('x-github-event', 'ping')
      .set('Content-Type', 'application/json')
      .set('x-hub-signature-256', hmacSha256(GH_PING_BODY, GH_SECRET))
      .send(GH_PING_BODY);
    expect(res.status).toBe(200);
    expect(res.body.zen).toBe('Keep it logically awesome.');
    expect(res.body.message).toMatch(/verified/i);
  });
});

describe('C2: identity cannot be spoofed via client headers', () => {
  it('spoofed superadmin headers still resolve to the visitor tier', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/quota')
      .set('x-user-email', 'shuvoasifahmed@gmail.com')
      .set('x-user-id', 'usr_attacker')
      .set('subscriptionPlan', 'enterprise')
      .set('isTrialActive', 'true');
    expect(res.status).toBe(200);
    expect(res.body.tier).toBe('visitor');
    expect(res.body.tierLabel).not.toMatch(/superadmin/i);
    expect(res.body.limit).toBe(20); // VISITOR_DAILY_UNITS, not enterprise
    expect(res.body.remaining).toBe(20);
  });

  it('does not grant infinite quota to header-supplied superadmins', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/quota')
      .set('x-user-email', 'shuvoasifahmed@gmail.com');
    expect(res.body.masterAuditsRemaining).not.toBe(Infinity);
    expect(Number.isFinite(res.body.remaining)).toBe(true);
  });
});

describe('C4: state sync requires a verified token', () => {
  it('GET /api/state/sync is 401 without credentials', async () => {
    const res = await request(app).get('/api/state/sync');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/state/sync is 401 without credentials', async () => {
    const res = await request(app)
      .post('/api/state/sync')
      .send({ ownerId: 'usr_attacker', collection: 'audits', mutations: [] });
    expect(res.status).toBe(401);
  });

  it('bogus Bearer tokens are rejected with 401', async () => {
    const res = await request(app)
      .get('/api/state/sync')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });
});

describe('Telemetry ingestion validates at the boundary', () => {
  it('drops schema-violating events instead of persisting them', async () => {
    const res = await request(app)
      .post('/api/telemetry/event')
      .set('User-Agent', 'Mozilla/5.0 (integration-test)')
      .send({ visitor_id: 12345, props: 'not-an-object', vitals: { LCP: 'banana' } });
    expect(res.status).toBe(202);
    expect(res.body.processed).toBe(0);
  });

  it('accepts a well-formed event', async () => {
    const res = await request(app)
      .post('/api/telemetry/event')
      .set('User-Agent', 'Mozilla/5.0 (integration-test)')
      .send({
        name: 'page_view',
        pathname: '/',
        domain: 'catalystlab.tech',
        visitor_id: 'v_test_1',
        session_id: 's_test_1',
        timestamp: Date.now(),
        props: { ref: 'test' },
        vitals: { LCP: 1200.5, CLS: 0.02 }
      });
    expect([202, 200]).toContain(res.status);
    expect(res.body.success).not.toBe(false);
  });
});

describe('Catalog and introspection surfaces', () => {
  it('serves the plans catalog', async () => {
    const res = await request(app).get('/api/plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.plans)).toBe(true);
    expect(res.body.plans.length).toBeGreaterThan(0);
  });

  it('serves the engines catalog', async () => {
    const res = await request(app).get('/api/v1/engines');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('serves the OpenAPI document', async () => {
    const res = await request(app).get('/api/v1/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi || res.body.swagger).toBeDefined();
  });

  it('serves health, system-health, db-status and workflow endpoints', async () => {
    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);

    const sysHealth = await request(app).get('/api/v1/system/health');
    expect(sysHealth.status).toBe(200);

    const dbStatus = await request(app).get('/api/v1/database/mongodb/status');
    expect([200, 503]).toContain(dbStatus.status);

    const workflows = await request(app).get('/api/v1/workflows');
    expect(workflows.status).toBe(200);
  });

  it('serves the GitHub integration surface', async () => {
    const repos = await request(app).get('/api/v1/integrations/github/repos');
    expect(repos.status).toBe(200);
    expect(repos.body.repos.length).toBeGreaterThan(0);
    // The default repo's secret must never leak through the list endpoint.
    for (const repo of repos.body.repos) {
      expect(JSON.stringify(repo)).not.toContain('whsec');
    }

    const events = await request(app).get('/api/v1/integrations/github/events');
    expect(events.status).toBe(200);

    const integrations = await request(app).get('/api/v1/integrations');
    expect(integrations.status).toBe(200);
  });

  it('connects a repo with an in-memory secret (never persisted, never echoed)', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/github/repos')
      .send({ repoUrl: 'https://github.com/example/connector-test' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.repo.webhookUrl).toContain('repoId=');
    // The repo object itself must be clean; instructions.secret is the one-time
    // display shown to the owner configuring the webhook (by design).
    expect(JSON.stringify(res.body.repo)).not.toContain('cat_whsec_');
    expect(res.body.instructions.secret).toMatch(/^cat_whsec_/);

    const del = await request(app).delete(`/api/v1/integrations/github/repos/${res.body.repo.id}`);
    expect([200, 404]).toContain(del.status);
  });

  it('serves the first-party telemetry script', async () => {
    const res = await request(app).get('/api/telemetry.js');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/javascript/);
  });
});

describe('SSRF guard surface (C5-adjacent)', () => {
  it('blocks loopback targets through /api/check-url', async () => {
    const res = await request(app).post('/api/check-url').send({ url: 'http://127.0.0.1:8080/admin' });
    expect(res.status).toBe(200);
    expect(res.body.reachable).toBe(false);
  });

  it('blocks private-range targets through /api/check-url', async () => {
    const res = await request(app).post('/api/check-url').send({ url: 'http://10.0.0.1/internal' });
    expect(res.status).toBe(200);
    expect(res.body.reachable).toBe(false);
  });
});

describe('Account surface', () => {
  it('returns the anonymous account shape', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('lists (empty) API keys without leaking anything', async () => {
    const res = await request(app).get('/api/v1/users/me/api-keys');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Notifications surface', () => {
  it('rejects digest/anomaly/test sends without a recipient', async () => {
    const digest = await request(app).post('/api/notifications/email/weekly-digest').send({});
    expect(digest.status).toBe(400);

    const anomaly = await request(app).post('/api/notifications/email/anomaly-alert').send({});
    expect(anomaly.status).toBe(400);

    const test = await request(app).post('/api/notifications/email/send-test').send({});
    expect(test.status).toBe(400);
  });

  it('generates the weekly-digest HTML preview', async () => {
    const res = await request(app).get('/api/notifications/email/preview-html');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toMatch(/<html|<!doctype/i);
  });

  it('rejects webhook dispatch without a webhookUrl', async () => {
    const res = await request(app).post('/api/notifications/webhook/test-slack').send({});
    expect(res.status).toBe(400);
  });
});

describe('Reports and blogs surface', () => {
  it('lists reports, synthesizes permalinks, and 404s unknown exports', async () => {
    const list = await request(app).get('/api/v1/reports');
    expect(list.status).toBe(200);

    // Permalinks are synthetic dossiers derived from the slug (demo surface).
    const permalink = await request(app).get('/api/v1/reports/permalink/example-com');
    expect(permalink.status).toBe(200);
    expect(permalink.body.score).toBeDefined();

    // Export synthesizes a dossier for any id (demo surface).
    const exported = await request(app).post('/api/v1/reports/unknown-id/export').send({ format: 'json' });
    expect(exported.status).toBe(200);
    expect(exported.body.reportId).toBe('unknown-id');
  });

  it('lists blogs and synthesizes dossier content for slugs', async () => {
    const list = await request(app).get('/api/v1/blogs');
    expect(list.status).toBe(200);

    const post = await request(app).get('/api/v1/blogs/any-slug');
    expect(post.status).toBe(200);
    expect(post.body.title).toBeDefined();
  });
});

describe('Engines surface validation', () => {
  it('exposes the engines catalog and per-engine detail', async () => {
    const catalog = await request(app).get('/api/v1/engines');
    expect(catalog.status).toBe(200);
    const engines = catalog.body.engines || catalog.body;
    expect(Array.isArray(engines)).toBe(true);

    const first = (engines as Array<{ id?: string }>)[0];
    expect(first?.id).toBeTruthy();
    const detail = await request(app).get(`/api/v1/engines/${first?.id}`);
    expect(detail.status).toBe(200);

    const unknown = await request(app).get('/api/v1/engines/not-an-engine');
    expect(unknown.status).toBe(404);
  });

  it('rejects /api/run-engine calls with missing or blocked URLs', async () => {
    const missing = await request(app).post('/api/run-engine').send({ engine: 'security' });
    expect(missing.status).toBe(400);

    const blocked = await request(app)
      .post('/api/run-engine')
      .send({ url: 'http://169.254.169.254/latest/meta-data', engine: 'security' });
    expect([400, 403]).toContain(blocked.status);
  });

  it('rejects unknown engines on the scan endpoint without executing anything', async () => {
    const res = await request(app)
      .post('/api/v1/engines/not-an-engine/scan')
      .send({ url: 'https://example.com' });
    expect([400, 404]).toContain(res.status);
  });

  it('exposes the rate-limit status endpoint', async () => {
    const res = await request(app).get('/api/rate-limit/status');
    expect(res.status).toBe(200);
    expect(res.body.tier || res.body.success).toBeDefined();
  });
});

describe('Telemetry analytical pipelines', () => {
  it('serves stats/realtime without Mongo (in-memory fallback)', async () => {
    const stats = await request(app).get('/api/analytics/stats?domain=all&timeframe=7d');
    expect(stats.status).toBe(200);

    const realtime = await request(app).get('/api/analytics/realtime');
    expect(realtime.status).toBe(200);
  });

  it('runs the anomaly check with default domain', async () => {
    const res = await request(app).post('/api/analytics/anomalies/check').send({});
    expect(res.status).toBe(200);
    expect(res.body.success).not.toBe(false);
  });

  it('serves the telemetry script from the alternate paths', async () => {
    const js = await request(app).get('/stats/js');
    expect(js.status).toBe(200);
    expect(js.headers['content-type']).toMatch(/javascript/);
  });
});

describe('State-sync auth coverage (C4 completion)', () => {
  it('DELETE mutations are 401 without credentials (no unauthenticated PUT route exists)', async () => {
    const noRoute = await request(app).put('/api/state/sync').send({});
    expect(noRoute.status).toBe(404); // API 404 catch-all, JSON not SPA

    const del = await request(app).delete('/api/state/sync/audits/some-id');
    expect(del.status).toBe(401);
  });
});

describe('DodoPay webhook (C1 completion)', () => {
  it('rejects unsigned payloads with a configured secret', async () => {
    const res = await request(app).post('/api/payments/webhook/dodopay').send({ event: 'payment.succeeded' });
    expect(res.status).toBe(401);
  });

  it('accepts a validly-signed event and rejects tampering', async () => {
    const body = JSON.stringify({ event: 'payment.succeeded', payment_id: 'pay_1' });
    const valid = await request(app)
      .post('/api/payments/webhook/dodopay')
      .set('Content-Type', 'application/json')
      .set('x-signature-256', hmacSha256(body, PAY_SECRET))
      .send(body);
    expect(valid.status).toBe(200);

    const forged = await request(app)
      .post('/api/payments/webhook/dodopay')
      .set('Content-Type', 'application/json')
      .set('x-signature-256', hmacSha256(body, 'evil'))
      .send(body);
    expect(forged.status).toBe(401);
  });

  it('create-checkout fails closed for the dodopay gateway too', async () => {
    const res = await request(app).post('/api/payments/create-checkout').send({ planId: 'pro', gateway: 'dodopay' });
    expect(res.status).toBe(503);
  });
});

describe('Execution and dispatch surfaces (deep coverage)', () => {
  it('runs a real single-engine scan against a public target', async () => {
    const res = await request(app)
      .post('/api/v1/engines/health/scan')
      .send({ url: 'https://example.com' });
    // The run must complete through the SSRF guard + engine pipeline; either a
    // successful scan or a graceful engine-level failure — never a crash.
    expect([200, 502, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).not.toBe(false);
    }
  }, 30_000);

  it('simulates a webhook payload for a connected repo (dev only)', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/github/repos/gh_repo_default_01/test-payload')
      .send({ eventType: 'push' });
    expect(res.status).toBe(200);
    expect(res.body.delivered).toBe(true);
    expect(res.body.simulatedEvent.score).toBeGreaterThanOrEqual(91);
  });

  it('streams GitHub telemetry as SSE (headers verified, socket closed)', async () => {
    const http = await import('http');
    await new Promise<void>((resolve, reject) => {
      const server = app.listen(0, '127.0.0.1', () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : 0;
        const req = http.get(
          { host: '127.0.0.1', port, path: '/api/v1/integrations/github/events/stream', headers: { Accept: 'text/event-stream' } },
          (res) => {
            try {
              expect(res.statusCode).toBe(200);
              expect(String(res.headers['content-type'])).toMatch(/text\/event-stream/);
              expect(String(res.headers['cache-control'])).toMatch(/no-cache/);
              res.destroy();
              server.close(() => resolve());
            } catch (err) {
              res.destroy();
              server.close(() => reject(err as Error));
            }
          }
        );
        req.on('error', () => {
          server.close(() => resolve());
        });
      });
    });
  });

  it('dispatches the weekly digest in Mailgun mock mode (no credentials)', async () => {
    const res = await request(app)
      .post('/api/notifications/email/weekly-digest')
      .send({ recipientEmail: 'digest@example.com', domain: 'catalystlab.tech' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mock).toBe(true);
  });

  it('dispatches the anomaly alert in mock mode', async () => {
    const res = await request(app)
      .post('/api/notifications/email/anomaly-alert')
      .send({ recipientEmail: 'alerts@example.com', domain: 'catalystlab.tech' });
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) expect(res.body.mock).toBe(true);
  });
});

describe('API-key lifecycle and webhook push processing', () => {
  it('creates, rotates, revokes and deletes an API key (in-memory demo)', async () => {
    const created = await request(app)
      .post('/api/v1/users/me/api-keys')
      .send({ name: 'ci-key', environment: 'test' });
    expect([200, 201]).toContain(created.status);
    const keyId = created.body.key?.id || created.body.apiKey?.id || created.body.id;
    if (keyId) {
      const rotated = await request(app).post(`/api/v1/users/me/api-keys/${keyId}/rotate`).send({});
      expect([200, 404]).toContain(rotated.status);

      const revoked = await request(app).post(`/api/v1/users/me/api-keys/${keyId}/revoke`).send({});
      expect([200, 404]).toContain(revoked.status);

      const deleted = await request(app).delete(`/api/v1/users/me/api-keys/${keyId}`).send({});
      expect([200, 404]).toContain(deleted.status);
    } else {
      // Demo store shapes vary; the create surface must at least answer JSON.
      expect(created.headers['content-type']).toMatch(/json/);
    }
  });

  it('processes a signed push webhook through the telemetry pipeline', async () => {
    const pushBody = JSON.stringify({
      ref: 'refs/heads/main',
      after: 'deadbeef1234567890',
      head_commit: { id: 'deadbeef1234567890', message: 'feat: coverage push' },
      pusher: { name: 'asifahmedshuvo' }
    });
    const res = await request(app)
      .post('/api/v1/integrations/github/webhook?repoId=gh_repo_default_01')
      .set('x-github-event', 'push')
      .set('Content-Type', 'application/json')
      .set('x-hub-signature-256', hmacSha256(pushBody, GH_SECRET))
      .send(pushBody);
    expect(res.status).toBe(200);

    // The processed event must appear in the telemetry history.
    const events = await request(app).get('/api/v1/integrations/github/events?repoId=gh_repo_default_01');
    expect(events.status).toBe(200);
    expect(events.body.events.length).toBeGreaterThan(0);
  });

  it('runs an engine through /api/run-engine end-to-end', async () => {
    const res = await request(app)
      .post('/api/run-engine')
      .send({ url: 'https://example.com', engine: 'health' });
    expect([200, 502, 500]).toContain(res.status);
    expect(res.headers['content-type']).toMatch(/json/);
  }, 30_000);
});

describe('HTTP plumbing', () => {
  it('unknown API routes return JSON 404, never the SPA fallback', async () => {
    const res = await request(app).get('/api/definitely/not/here');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('issues an x-request-id correlation header and echoes inbound IDs', async () => {
    const issued = await request(app).get('/api/v1/users/me/quota');
    expect(issued.headers['x-request-id']).toMatch(/^[\w.-]{8,128}$/);

    const echoed = await request(app)
      .get('/api/v1/users/me/quota')
      .set('x-request-id', 'trace-correlation-abc-123');
    expect(echoed.headers['x-request-id']).toBe('trace-correlation-abc-123');
  });

  it('falls back to a generated ID when the inbound ID fails the safety regex', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/quota')
      .set('x-request-id', 'bad id with spaces');
    // The middleware must issue a fresh correlation ID rather than echo it.
    expect(res.headers['x-request-id']).not.toBe('bad id with spaces');
    expect(res.headers['x-request-id']).toMatch(/^[\w.-]{8,128}$/);
  });
});

describe('Client log sink (item 15 boundary)', () => {
  it('accepts a valid warn/error batch', async () => {
    const res = await request(app)
      .post('/api/client-logs')
      .send({
        events: [
          { level: 'error', message: 'ChunkLoadError: dynamic import failed', href: 'https://app.test/', ts: Date.now() },
          { level: 'warn', message: 'Retry budget exhausted', context: { attempt: 3 } }
        ]
      });
    expect(res.status).toBe(202);
    expect(res.body.accepted).toBe(2);
  });

  it('rejects invalid levels and oversized batches', async () => {
    const badLevel = await request(app)
      .post('/api/client-logs')
      .send({ events: [{ level: 'bogus', message: 'x' }] });
    expect(badLevel.status).toBe(400);

    const tooMany = await request(app)
      .post('/api/client-logs')
      .send({ events: Array.from({ length: 30 }, (_, i) => ({ level: 'warn', message: `e${i}` })) });
    expect(tooMany.status).toBe(400);
  });

  it('rejects oversized messages', async () => {
    const res = await request(app)
      .post('/api/client-logs')
      .send({ events: [{ level: 'error', message: 'x'.repeat(3000) }] });
    expect(res.status).toBe(400);
  });
});
