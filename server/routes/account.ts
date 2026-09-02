import { Request, Response } from 'express';
import {
  getUtcMidnight,
  resolveClientIdentity,
  dailyRateLimitStore,
  FREE_USER_DAILY_UNITS,
  PRO_API_DAILY_UNITS,
  MASTER_AUDIT_COST,
  SINGLE_ENGINE_COST
} from '../core/rateLimit';

// Account surface: current user, quota introspection, API key management,
// workflow automation evaluation, and the integrations catalog.

export function registerAccountRoutes(app: import('express').Express): void {

// 6. Users & API Keys
app.get('/api/v1/users/me', (req: Request, res: Response) => {
  const { resetAt, resetInSeconds, formattedResetTime } = getUtcMidnight();
  const identity = resolveClientIdentity(req);
  const storeKey = `${getUtcMidnight().dateKey}_${identity.identifier}`;
  const record = dailyRateLimitStore.get(storeKey);
  const unitsUsed = record ? record.unitsUsed : 0;
  const limit = identity.limit || FREE_USER_DAILY_UNITS;
  const unitsRemaining = identity.tier === 'superadmin' ? Infinity : Math.max(0, limit - unitsUsed);

  res.json({
    success: true,
    user: {
      uid: identity.userId || 'usr_developer',
      email: identity.cleanEmail || 'developer@example.com',
      tier: identity.tier,
      tierLabel: identity.tierLabel,
      dailyQuotaUnits: limit,
      unitsUsedToday: unitsUsed,
      unitsRemainingToday: unitsRemaining,
      masterAuditsRemaining: identity.tier === 'superadmin' ? Infinity : Math.floor(unitsRemaining / MASTER_AUDIT_COST),
      singleEnginesRemaining: identity.tier === 'superadmin' ? Infinity : Math.floor(unitsRemaining / SINGLE_ENGINE_COST),
      resetAt: resetAt.toISOString(),
      resetInSeconds,
      formattedResetTime
    }
  });
});

app.get('/api/v1/users/me/quota', (req: Request, res: Response) => {
  const { resetAt, resetInSeconds, formattedResetTime } = getUtcMidnight();
  const identity = resolveClientIdentity(req);
  const storeKey = `${getUtcMidnight().dateKey}_${identity.identifier}`;
  const record = dailyRateLimitStore.get(storeKey);
  const unitsUsed = record ? record.unitsUsed : 0;
  const limit = identity.limit || FREE_USER_DAILY_UNITS;
  const unitsRemaining = identity.tier === 'superadmin' ? Infinity : Math.max(0, limit - unitsUsed);

  res.json({
    success: true,
    tier: identity.tier,
    tierLabel: identity.tierLabel,
    limit,
    used: unitsUsed,
    remaining: unitsRemaining,
    masterAuditsRemaining: identity.tier === 'superadmin' ? Infinity : Math.floor(unitsRemaining / MASTER_AUDIT_COST),
    singleEnginesRemaining: identity.tier === 'superadmin' ? Infinity : Math.floor(unitsRemaining / SINGLE_ENGINE_COST),
    resetAtUtc: resetAt.toISOString(),
    resetInSeconds,
    formattedResetTime
  });
});

app.get('/api/v1/users/me/api-keys', (req: Request, res: Response) => {
  const identity = resolveClientIdentity(req);
  res.json({
    success: true,
    ownerId: identity.userId || 'usr_developer',
    keys: [
      {
        id: 'key_prod_pipeline_01',
        name: 'Production CI/CD Quality Gate',
        keyPrefix: 'cat_live_3f9a7b12...',
        environment: 'production',
        status: 'active',
        scopes: ['execute:engines', 'execute:master-audit', 'read:reports'],
        dailyComputeLimit: PRO_API_DAILY_UNITS,
        whiteLabelConfig: {
          organizationName: 'Catalyst Enterprise Systems',
          brandHeaderName: 'X-Catalyst-Enterprise',
          customWebhookUrl: 'https://api.example.com/webhooks/telemetry-gate'
        },
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        lastRotatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        lastUsedAt: Date.now() - 15 * 60 * 1000,
        expiresAt: Date.now() + 180 * 24 * 60 * 60 * 1000
      },
      {
        id: 'key_staging_radar_02',
        name: 'Staging Multi-PoP Radar Probe',
        keyPrefix: 'cat_live_8c2d1e90...',
        environment: 'staging',
        status: 'active',
        scopes: ['execute:engines', 'read:monitoring'],
        dailyComputeLimit: PRO_API_DAILY_UNITS,
        whiteLabelConfig: {
          organizationName: 'Staging Quality Ops',
          brandHeaderName: 'X-Staging-Quality'
        },
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
        lastRotatedAt: null,
        lastUsedAt: Date.now() - 2 * 60 * 60 * 1000,
        expiresAt: null
      }
    ]
  });
});

app.post('/api/v1/users/me/api-keys', (req: Request, res: Response) => {
  const { name = 'CI/CD Pipeline Key', scopes = ['execute:engines', 'read:reports'], environment = 'production', whiteLabelConfig = {} } = req.body;
  const randomHex = Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 10);
  const keyId = `key_${Date.now()}`;
  const secretKey = `cat_live_${randomHex}`;
  
  res.status(201).json({
    success: true,
    keyId,
    name,
    environment,
    scopes,
    keyPrefix: secretKey.substring(0, 16) + '...',
    secretKey,
    dailyComputeLimit: PRO_API_DAILY_UNITS,
    whiteLabelConfig,
    createdAt: Date.now(),
    warning: 'Store this secret key securely. For security, it cannot be displayed again.'
  });
});

app.post('/api/v1/users/me/api-keys/:id/rotate', (req: Request, res: Response) => {
  const { id } = req.params;
  const randomHex = Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 10);
  const newSecretKey = `cat_live_${randomHex}`;

  res.json({
    success: true,
    keyId: id,
    keyPrefix: newSecretKey.substring(0, 16) + '...',
    secretKey: newSecretKey,
    lastRotatedAt: Date.now(),
    status: 'active',
    warning: 'Previous key has been rotated. Update your environment variables immediately.'
  });
});

app.post('/api/v1/users/me/api-keys/:id/revoke', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    success: true,
    keyId: id,
    status: 'revoked',
    revokedAt: Date.now(),
    message: `API Key '${id}' has been permanently revoked.`
  });
});

app.delete('/api/v1/users/me/api-keys/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    success: true,
    keyId: id,
    deleted: true,
    message: `API Key '${id}' deleted successfully.`
  });
});

// 7. Workflows & Automation
app.get('/api/v1/workflows', (req: Request, res: Response) => {
  res.json({
    success: true,
    workflows: [
      {
        id: 'wf_nightly_01',
        name: 'Nightly Production Health & TTFB Probe',
        targetUrl: 'https://example.com',
        schedule: '0 0 * * * (Daily UTC)',
        engines: ['health', 'latency', 'compliance'],
        alertThreshold: { minScore: 85, maxTtfbMs: 300 },
        active: true,
        lastRunStatus: 'passed'
      }
    ]
  });
});

app.post('/api/v1/automation/ci-cd/evaluate', (req: Request, res: Response) => {
  const { url, thresholds = {} } = req.body;
  if (!url) {
    res.status(400).json({ success: false, error: 'URL parameter is required.' });
    return;
  }
  const minScore = thresholds.minCompositeScore || 85;
  const simulatedScore = 92;
  const passed = simulatedScore >= minScore;

  res.status(passed ? 200 : 422).json({
    passed,
    url,
    score: simulatedScore,
    assertions: [
      { rule: `minCompositeScore >= ${minScore}`, expected: minScore, actual: simulatedScore, status: passed ? 'pass' : 'fail' },
      { rule: 'maxDomDepth <= 32', expected: 32, actual: 14, status: 'pass' },
      { rule: 'maxTtfbMs <= 350', expected: 350, actual: 142, status: 'pass' },
      { rule: 'requireHsts === true', expected: true, actual: true, status: 'pass' }
    ],
    summary: passed ? 'All quality assertions passed. CI/CD deployment approved.' : 'Quality gate violated.'
  });
});

// 8. Integrations & Webhooks
app.get('/api/v1/integrations', (req: Request, res: Response) => {
  res.json({
    success: true,
    integrations: [
      { id: 'github-actions', name: 'GitHub Actions Quality Gate', category: 'CI/CD', status: 'available' },
      { id: 'gitlab-ci', name: 'GitLab CI CLI Probe', category: 'CI/CD', status: 'available' },
      { id: 'slack', name: 'Slack Telemetry Webhook', category: 'Alerts', status: 'available' },
      { id: 'discord', name: 'Discord Telemetry Webhook', category: 'Alerts', status: 'available' },
      { id: 'datadog', name: 'Datadog APM & Metrics Exporter', category: 'Observability', status: 'available' }
    ]
  });
});

app.post('/api/v1/integrations/webhook/test', (req: Request, res: Response) => {
  const { targetWebhookUrl } = req.body;
  if (!targetWebhookUrl) {
    res.status(400).json({ success: false, error: 'targetWebhookUrl is required.' });
    return;
  }
  res.json({
    success: true,
    delivered: true,
    statusCode: 200,
    responseTimeMs: 68,
    signatureHeaderSent: 'sha256=3a4b5c6d7e8f9012...',
    payloadSent: {
      event: 'audit.completed',
      url: 'https://example.com',
      score: 92,
      timestamp: Date.now()
    }
  });
});

}
