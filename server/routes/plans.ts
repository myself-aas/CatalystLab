import { Request, Response } from 'express';
import {
  getUtcMidnight,
  BURST_WINDOW_MS,
  resolveClientIdentity,
  dailyRateLimitStore,
  VISITOR_DAILY_UNITS,
  FREE_USER_DAILY_UNITS,
  STARTER_DAILY_UNITS,
  PRO_DAILY_UNITS,
  TEAM_DAILY_UNITS,
  ENTERPRISE_DAILY_UNITS,
  MASTER_AUDIT_COST,
  SINGLE_ENGINE_COST
} from '../core/rateLimit';

// Rate-limit status introspection and the 5-tier plan catalog.

export function registerPlanRoutes(app: import('express').Express): void {

// Rate Limit Status Query Endpoint
app.get('/api/rate-limit/status', (req: Request, res: Response): void => {
  const { dateKey, resetAt, resetInSeconds, formattedResetTime } = getUtcMidnight();
  const identity = resolveClientIdentity(req);

  const storeKey = `${dateKey}_${identity.identifier}`;
  const record = dailyRateLimitStore.get(storeKey);
  const unitsUsed = record ? record.unitsUsed : 0;
  const limit = identity.limit || FREE_USER_DAILY_UNITS;
  const unitsRemaining = Math.max(0, limit - unitsUsed);

  const now = Date.now();
  const recentRequests = record ? record.requestTimestamps.filter(t => now - t < BURST_WINDOW_MS).length : 0;
  const burstRemaining = Math.max(0, identity.burstMax - recentRequests);

  res.json({
    success: true,
    tier: identity.tier,
    tierLabel: identity.tierLabel,
    subscriptionPlan: identity.subscriptionPlan,
    isTrialActive: identity.isTrialActive,
    dailyLimit: limit,
    unitsUsed,
    unitsRemaining,
    masterAuditsRemaining: Math.floor(unitsRemaining / MASTER_AUDIT_COST),
    singleEnginesRemaining: Math.floor(unitsRemaining / SINGLE_ENGINE_COST),
    masterAuditCost: MASTER_AUDIT_COST,
    singleEngineCost: SINGLE_ENGINE_COST,
    burstLimit: identity.burstMax,
    burstRemaining,
    resetAt: resetAt.toISOString(),
    resetInSeconds,
    formattedResetTime,
    isUnlimited: false,
    isExceeded: unitsRemaining <= 0
  });
});

// 5-Tier Subscription Plans & Free Trial API
app.get('/api/plans', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    trialDurationDays: 7,
    trialRequiresCreditCard: false,
    plans: [
      {
        id: 'free',
        name: 'Free Community',
        tagline: 'Essential developer diagnostics & baseline audits',
        monthlyPrice: 0,
        annualPrice: 0,
        dailyUnits: 50,
        monthlyAudits: 150,
        burstLimitPerMin: 45,
        maxConcurrentEngines: 8,
        trialAvailable: false,
        features: [
          '50 daily compute units (5 full audits/day)',
          'All 8 zero-overhead diagnostic engines',
          'Full JSON / Markdown / CSV export',
          'Standard edge latency & carbon metrics',
          'Community documentation & GitHub issues'
        ]
      },
      {
        id: 'starter',
        name: 'Starter Pro',
        tagline: 'Ideal for indie hackers, freelancing engineers & single projects',
        monthlyPrice: 9,
        annualPrice: 7,
        dailyUnits: 150,
        monthlyAudits: 450,
        burstLimitPerMin: 60,
        maxConcurrentEngines: 8,
        trialAvailable: true,
        badge: 'Most Popular for Solo Devs',
        features: [
          '150 daily compute units (15 full audits/day)',
          '7-day free trial (no credit card required)',
          '3 Monitored domain slots with hourly tracking',
          'Automated Weekly Email Dossier digests',
          'Slack & Discord anomaly webhook alerts',
          'Custom PDF executive audit summaries'
        ]
      },
      {
        id: 'pro',
        name: 'Professional Team',
        tagline: 'High-speed observability for growing engineering teams',
        monthlyPrice: 19,
        annualPrice: 15,
        dailyUnits: 500,
        monthlyAudits: 1500,
        burstLimitPerMin: 120,
        maxConcurrentEngines: 8,
        trialAvailable: true,
        badge: 'Recommended',
        features: [
          '500 daily compute units (50 full audits/day)',
          '7-day free trial (no credit card required)',
          '10 Monitored domain slots with continuous health scans',
          'CI/CD GitHub Actions & GitLab Webhook integrations',
          'Full REST API access (cat_live_ developer tokens)',
          'Multi-region edge latency probes across 6 continents',
          'Custom threshold anomaly triggers & priority routing'
        ]
      },
      {
        id: 'team',
        name: 'Scale & Growth',
        tagline: 'Continuous DevSecOps pipelines & team-wide multi-cloud monitoring',
        monthlyPrice: 49,
        annualPrice: 39,
        dailyUnits: 1500,
        monthlyAudits: 4500,
        burstLimitPerMin: 300,
        maxConcurrentEngines: 8,
        trialAvailable: true,
        badge: 'High Performance',
        features: [
          '1,500 daily compute units (150 full audits/day)',
          '7-day free trial (no credit card required)',
          '30 Monitored domain slots with 15-minute intervals',
          'Advanced LLMO prompt token benchmarking & cache tracing',
          'Custom compliance rule suites (SOC2 / GDPR / HIPAA)',
          'Unlimited team seat invitations & shared audit vaults',
          'Priority queue execution with zero latency buffering'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise Apex',
        tagline: 'Mission-critical enterprise governance, unlimited scale & dedicated support',
        monthlyPrice: 99,
        annualPrice: 79,
        dailyUnits: 5000,
        monthlyAudits: 15000,
        burstLimitPerMin: 500,
        maxConcurrentEngines: 8,
        trialAvailable: true,
        badge: 'Enterprise SLA',
        features: [
          '5,000 daily compute units (500 full audits/day)',
          '7-day free trial (no credit card required)',
          'Unlimited monitored domains & subdomains',
          'Custom on-premise runner support & VPC peering',
          '99.99% uptime SLA & dedicated solution engineer',
          'Role-based access control (RBAC) & SAML/SSO integration',
          'Quarterly architectural review & bespoke engine rules'
        ]
      }
    ]
  });
});

// Pre-flight check endpoint for URL connectivity
}
