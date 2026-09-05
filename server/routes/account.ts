import { Request, Response } from 'express';
import {
  getUtcMidnight,
  resolveClientIdentity,
  dailyRateLimitStore,
  PRO_API_DAILY_UNITS,
  MASTER_AUDIT_COST,
  SINGLE_ENGINE_COST
} from '../core/rateLimit';
import crypto from 'crypto';
import { requireIdentity, isDemoUnauthAllowed } from '../core/authz';
import { logger } from '../core/logger';
import { getAttachedIdentity, getAdminFirestore } from '../../src/lib/serverAuth';
import {
  createApiKey,
  deleteApiKey,
  listApiKeys,
  normalizeEnvironment,
  normalizeScopes,
  normalizeWhiteLabelConfig,
  loadApiKeyStore,
  rotateApiKey,
  revokeApiKey
} from '../core/apiKeys';

// Account surface: current user, quota introspection, API key management,
// entitlement/trial provisioning, workflow automation evaluation, and the
// integrations catalog.

const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const TRIAL_PLAN_IDS = new Set(['starter', 'pro', 'team', 'enterprise']);

function getApiKeyOwnerId(req: Request): string | null {
  const identity = getAttachedIdentity(req);
  if (identity?.uid) return identity.uid;
  // Demo/test surface only; production always requires a verified identity.
  if (isDemoUnauthAllowed()) return 'usr_developer';
  return null;
}

export function registerAccountRoutes(app: import('express').Express): void {
  // Prime the persisted API-key index so request-time validation stays
  // synchronous and constant-time. Idempotent; safe when Admin is unconfigured.
  loadApiKeyStore().catch((err: unknown) => {
    logger.warn({ err }, '[ApiKeys] Index warm-up failed; using in-memory wallet');
  });

// 6. Users & API Keys
app.get('/api/v1/users/me', (req: Request, res: Response) => {
  const { resetAt, resetInSeconds, formattedResetTime } = getUtcMidnight();
  const identity = resolveClientIdentity(req);
  const storeKey = `${getUtcMidnight().dateKey}_${identity.identifier}`;
  const record = dailyRateLimitStore.get(storeKey);
  const unitsUsed = record ? record.unitsUsed : 0;
  const limit = identity.limit;
  const unitsRemaining = limit === null ? Infinity : Math.max(0, limit - unitsUsed);

  res.json({
    success: true,
    user: {
      uid: identity.userId || null,
      email: identity.cleanEmail || null,
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
  const limit = identity.limit;
  const unitsRemaining = limit === null ? Infinity : Math.max(0, limit - unitsUsed);

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

// Server-provisioned 7-day trial. A trial is the ONLY way a client gets a
// paid-tier entitlement without a signed gateway webhook. Admin writes bypass
// Firestore client rules so paid `trialing` documents cannot be self-created.
app.post('/api/v1/users/me/trial', async (req: Request, res: Response): Promise<void> => {
  if (!requireIdentity(req, res)) return;
  const identity = getAttachedIdentity(req);
  if (!identity?.uid) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  const planId = typeof req.body?.planId === 'string' ? req.body.planId : 'starter';
  if (!TRIAL_PLAN_IDS.has(planId)) {
    res.status(400).json({ success: false, error: `planId must be one of: ${Array.from(TRIAL_PLAN_IDS).join(', ')}.` });
    return;
  }

  const db = await getAdminFirestore();
  if (!db) {
    res.status(503).json({ success: false, error: 'Subscription provisioning is not configured on this deployment.' });
    return;
  }

  try {
    const ref = db.collection('user_subscriptions').doc(identity.uid);
    const existing = await ref.get();
    if (existing.exists) {
      const current = existing.data() || {};
      const isAlreadyEntitled =
        current.ownerId === identity.uid &&
        (current.status === 'active' || current.status === 'trialing') &&
        current.planId !== 'free';
      if (isAlreadyEntitled) {
        res.status(409).json({ success: false, error: 'An active subscription or trial already exists for this account.' });
        return;
      }
      const alreadyUsedTrial = Boolean(current.trialStartedAt) && current.planId !== 'free';
      if (alreadyUsedTrial) {
        res.status(409).json({ success: false, error: 'A 7-day trial has already been used for this account.' });
        return;
      }
    }

    const now = Date.now();
    const subscription = {
      ownerId: identity.uid,
      ownerEmail: identity.email || '',
      planId,
      status: 'trialing',
      billingCycle: req.body?.billingCycle === 'annual' ? 'annual' : 'monthly',
      trialStartedAt: now,
      trialEndsAt: now + TRIAL_DURATION_MS,
      createdAt: existing.exists ? (existing.data()?.createdAt || now) : now,
      updatedAt: now
    };
    await ref.set(subscription, { merge: false });

    res.status(201).json({ success: true, subscription });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Trial provisioning failed.';
    logger.error({ err, uid: identity.uid }, '[Trial] Provisioning failed');
    res.status(500).json({ success: false, error: message });
  }
});

// Accept a client's paid downgrade/cancellation request. Paid ACTIVE upgrades
// are never granted from the client; they must arrive from a verified payment
// webhook. This endpoint only allows reverting to `free`.
app.post('/api/v1/users/me/subscription/request', async (req: Request, res: Response): Promise<void> => {
  if (!requireIdentity(req, res)) return;
  const identity = getAttachedIdentity(req);
  if (!identity?.uid) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  const planId = req.body?.planId;
  if (planId !== 'free') {
    res.status(501).json({
      success: false,
      error: 'Paid plan changes require a verified payment webhook. Only downgrade to free is supported without gateway integration.'
    });
    return;
  }
  const db = await getAdminFirestore();
  if (!db) {
    res.status(503).json({ success: false, error: 'Subscription provisioning is not configured on this deployment.' });
    return;
  }
  const now = Date.now();
  await db.collection('user_subscriptions').doc(identity.uid).set({
    ownerId: identity.uid,
    ownerEmail: identity.email || '',
    planId: 'free',
    status: 'active',
    billingCycle: 'monthly',
    trialStartedAt: null,
    trialEndsAt: null,
    updatedAt: now
  }, { merge: true });
  res.json({ success: true, subscription: { ownerId: identity.uid, planId: 'free', status: 'active' } });
});

app.get('/api/v1/users/me/api-keys', async (req: Request, res: Response): Promise<void> => {
  if (!requireIdentity(req, res)) return;
  const ownerId = getApiKeyOwnerId(req);
  if (!ownerId) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  await loadApiKeyStore();
  res.json({
    success: true,
    ownerId,
    keys: listApiKeys(ownerId)
  });
});

app.post('/api/v1/users/me/api-keys', async (req: Request, res: Response): Promise<void> => {
  if (!requireIdentity(req, res)) return;
  const ownerId = getApiKeyOwnerId(req);
  if (!ownerId) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  const identity = getAttachedIdentity(req);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name || name.length > 100) {
    res.status(400).json({ success: false, error: 'name is required and must be 100 characters or fewer.' });
    return;
  }
  const environment = normalizeEnvironment(req.body?.environment ?? 'production');
  const scopes = normalizeScopes(req.body?.scopes ?? ['execute:engines', 'read:reports']);
  const whiteLabelConfig = normalizeWhiteLabelConfig(req.body?.whiteLabelConfig ?? {});
  const rawExpires = req.body?.expiresInDays ?? null;
  const expiresInDays = rawExpires == null ? null : Number(rawExpires);
  if (!environment || !scopes || !whiteLabelConfig) {
    res.status(400).json({
      success: false,
      error: 'Invalid scopes, environment, or white-label configuration.'
    });
    return;
  }
  if (expiresInDays != null && (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 3650)) {
    res.status(400).json({ success: false, error: 'expiresInDays must be an integer between 1 and 3650.' });
    return;
  }

  try {
    const { apiKey, secretKey } = await createApiKey({
      ownerId,
      ownerEmail: identity?.email || '',
      name,
      environment,
      scopes,
      expiresInDays: expiresInDays ?? undefined,
      whiteLabelConfig
    });

    res.status(201).json({
      success: true,
      apiKey,
      secretKey,
      keyId: apiKey.id,
      name: apiKey.name,
      environment: apiKey.environment,
      scopes: apiKey.scopes,
      keyPrefix: apiKey.keyPrefix,
      dailyComputeLimit: apiKey.dailyComputeLimit,
      whiteLabelConfig: apiKey.whiteLabelConfig,
      createdAt: apiKey.createdAt,
      warning: 'Store this secret key securely. It is hashed server-side and cannot be displayed again.'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'API key creation failed.';
    logger.error({ err, ownerId }, '[ApiKeys] Creation failed');
    res.status(500).json({ success: false, error: message });
  }
});

app.post('/api/v1/users/me/api-keys/:id/rotate', async (req: Request, res: Response): Promise<void> => {
  if (!requireIdentity(req, res)) return;
  const ownerId = getApiKeyOwnerId(req);
  if (!ownerId) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  const { id } = req.params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
    res.status(400).json({ success: false, error: 'Invalid API key id.' });
    return;
  }

  try {
    const result = await rotateApiKey(ownerId, id);
    if (!result) {
      res.status(404).json({ success: false, error: `API Key '${id}' not found.` });
      return;
    }
    res.json({
      success: true,
      apiKey: result.apiKey,
      newSecretKey: result.newSecretKey,
      keyId: id,
      keyPrefix: result.apiKey.keyPrefix,
      secretKey: result.newSecretKey,
      lastRotatedAt: result.apiKey.lastRotatedAt,
      status: result.apiKey.status,
      warning: 'Previous key has been rotated. Update your environment variables immediately.'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'API key rotation failed.';
    logger.error({ err, ownerId, keyId: id }, '[ApiKeys] Rotation failed');
    res.status(500).json({ success: false, error: message });
  }
});

app.post('/api/v1/users/me/api-keys/:id/revoke', async (req: Request, res: Response): Promise<void> => {
  if (!requireIdentity(req, res)) return;
  const ownerId = getApiKeyOwnerId(req);
  if (!ownerId) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  const { id } = req.params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
    res.status(400).json({ success: false, error: 'Invalid API key id.' });
    return;
  }
  const revoked = await revokeApiKey(ownerId, id);
  if (!revoked) {
    res.status(404).json({ success: false, error: `API Key '${id}' not found.` });
    return;
  }
  res.json({
    success: true,
    keyId: id,
    apiKey: revoked,
    status: 'revoked',
    revokedAt: Date.now(),
    message: `API Key '${id}' has been permanently revoked.`
  });
});

app.delete('/api/v1/users/me/api-keys/:id', async (req: Request, res: Response): Promise<void> => {
  if (!requireIdentity(req, res)) return;
  const ownerId = getApiKeyOwnerId(req);
  if (!ownerId) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  const { id } = req.params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
    res.status(400).json({ success: false, error: 'Invalid API key id.' });
    return;
  }
  const deleted = await deleteApiKey(ownerId, id);
  if (!deleted) {
    res.status(404).json({ success: false, error: `API Key '${id}' not found.` });
    return;
  }
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

app.post('/api/v1/automation/ci-cd/evaluate', async (req: Request, res: Response) => {
  if (!requireIdentity(req, res)) return;
  const { url, thresholds = {} } = req.body;
  if (!url) {
    res.status(400).json({ success: false, error: 'URL parameter is required.' });
    return;
  }
  res.status(501).json({
    success: false,
    error: 'CI/CD evaluate requires a live engine run. Use POST /api/v1/audit/master instead of a simulated score.',
    url,
    thresholds
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
  if (!requireIdentity(req, res)) return;
  const { targetWebhookUrl } = req.body;
  if (!targetWebhookUrl) {
    res.status(400).json({ success: false, error: 'targetWebhookUrl is required.' });
    return;
  }
  res.status(501).json({
    success: false,
    error: 'Webhook delivery test is not simulated. Configure a real destination via /api/notifications/webhook/dispatch.'
  });
});

}
