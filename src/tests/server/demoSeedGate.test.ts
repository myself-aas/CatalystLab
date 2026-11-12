import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Ruling R4: the plan's endpoint-only assertion was vacuous — /api/v1/integrations/github/repos
// answers 401 when identity is required, so "no seeded repo in the body" proved nothing.
// This suite asserts the predicate's truth table AND the endpoint through the demo-auth
// path, where the list is actually returned.
describe('synthetic GitHub seed requires explicit opt-in', () => {
  const original = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    process.env = { ...original };
  });

  async function reposAsDemoUser(env: Record<string, string | undefined>) {
    process.env = { ...original, NODE_ENV: 'test', ALLOW_UNAUTH_DEMO: 'true', ...env };
    vi.resetModules();
    const { createApp } = await import('@server/app');
    const request = (await import('supertest')).default;
    const app = await createApp();
    const res = await request(app).get('/api/v1/integrations/github/repos');
    return { status: res.status, body: res.body };
  }

  it('never seeds in production, even with the flag set', async () => {
    process.env = { ...original, NODE_ENV: 'production', ALLOW_DEMO_SEED: 'true' };
    vi.resetModules();
    const { isDemoSeedAllowed } = await import('@server/core/authz');
    expect(isDemoSeedAllowed()).toBe(false);
  });

  it('is off in staging when the flag is absent', async () => {
    process.env = { ...original, NODE_ENV: 'staging', ALLOW_DEMO_SEED: undefined };
    vi.resetModules();
    const { isDemoSeedAllowed } = await import('@server/core/authz');
    expect(isDemoSeedAllowed()).toBe(false);
  });

  it('returns an empty integration list when no seed was opted into', async () => {
    const { status, body } = await reposAsDemoUser({ ALLOW_DEMO_SEED: undefined });
    expect(status).toBe(200);
    expect(body.repos).toEqual([]);
    expect(JSON.stringify(body)).not.toContain('gh_repo_default_01');
  });

  it('seeds only in a non-production process that opted in', async () => {
    const { status, body } = await reposAsDemoUser({ ALLOW_DEMO_SEED: 'true' });
    expect(status).toBe(200);
    expect(JSON.stringify(body)).toContain('gh_repo_default_01');
  });
});
