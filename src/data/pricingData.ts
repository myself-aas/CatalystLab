import { SubscriptionPlan, SubscriptionPlanId } from '../types';

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Community',
    tagline: 'Essential developer diagnostics & instant web quality checks',
    badge: 'Free Forever',
    popular: false,
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    annualBillingTotal: 0,
    annualSavingsPercent: 0,
    hasFreeTrial: false,
    trialDays: 0,
    dailyComputeUnits: 50,
    masterAuditsPerDay: 5,
    singleEngineAuditsPerDay: 50,
    ciRunsPerMonth: 25,
    ciParallelConcurrency: 1,
    monitoredSitesQuota: 1,
    probeFrequencyMinutes: 1440, // 24h
    telemetryRetentionDays: 14,
    teamSeats: 1,
    features: [
      { text: '50 Daily Compute Units (5 Master or 50 Single Audits)', included: true, badge: '50 units/day' },
      { text: 'All 8 Core Diagnostic Engines & SDLC Catalysts', included: true },
      { text: 'Public Audit Permalinks & Interactive Diffs', included: true },
      { text: 'Basic /llms.txt AI & robots.txt Inspector', included: true },
      { text: 'OWASP Security Header & TLS 1.3 Verifier', included: true },
      { text: 'Sustainable Web Carbon Modeling (Manifesto v3)', included: true },
      { text: '25 CI/CD Pipeline Runs per Month (1 runner)', included: true },
      { text: 'Automated 15-min background health probes', included: false },
      { text: 'REST API Secret Keys & White-label Reports', included: false },
      { text: 'Multi-seat Workspaces & Role-Based Access', included: false }
    ],
    restrictions: [
      '50 compute units daily limit',
      '14-day telemetry retention',
      'No custom webhook integration'
    ],
    ctaText: 'Free Forever',
    ctaTextTrial: 'Start Free Scan'
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For indie hackers, solo developers & freelance engineers',
    badge: 'Indie Dev Tier',
    popular: false,
    priceMonthly: 9,
    priceAnnualMonthly: 7,
    annualBillingTotal: 84,
    annualSavingsPercent: 22,
    hasFreeTrial: true,
    trialDays: 7,
    dailyComputeUnits: 150,
    masterAuditsPerDay: 15,
    singleEngineAuditsPerDay: 150,
    ciRunsPerMonth: 100,
    ciParallelConcurrency: 2,
    monitoredSitesQuota: 5,
    probeFrequencyMinutes: 180, // 3 hours
    telemetryRetentionDays: 60,
    teamSeats: 1,
    features: [
      { text: '150 Daily Compute Units (15 Master or 150 Single Audits)', included: true, badge: '150 units/day' },
      { text: 'All 8 Engines + 7-Day Free Trial (No Credit Card)', included: true, badge: '7-Day Trial' },
      { text: '100 CI/CD Runs/month (2 parallel jobs)', included: true },
      { text: '5 Monitored Sites (180-min background health probes)', included: true },
      { text: '12-PoP Multi-Region TTFB Edge Radar', included: true },
      { text: 'PDF & JSON Export for Audit Dossiers', included: true },
      { text: 'Slack & Discord Webhook Failure Alerts', included: true },
      { text: '60-day telemetry retention & delta trends', included: true },
      { text: 'White-label Custom Branding', included: false },
      { text: 'Air-Gapped Private Runner Containers', included: false }
    ],
    restrictions: [
      '5 monitored endpoints max',
      'Single user workspace'
    ],
    ctaText: 'Upgrade to Starter',
    ctaTextTrial: 'Start 7-Day Free Trial'
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    tagline: 'Advanced diagnostic telemetry for growing SaaS & modern web teams',
    badge: 'Most Popular',
    popular: true,
    priceMonthly: 19,
    priceAnnualMonthly: 15,
    annualBillingTotal: 180,
    annualSavingsPercent: 21,
    hasFreeTrial: true,
    trialDays: 7,
    dailyComputeUnits: 500,
    masterAuditsPerDay: 50,
    singleEngineAuditsPerDay: 500,
    ciRunsPerMonth: 500,
    ciParallelConcurrency: 5,
    monitoredSitesQuota: 20,
    probeFrequencyMinutes: 60, // 1 hour
    telemetryRetentionDays: 90,
    teamSeats: 3,
    features: [
      { text: '500 Daily Compute Units (50 Master or 500 Single Audits)', included: true, badge: '500 units/day' },
      { text: '7-Day Free Trial with Full Unlocked Access (No Credit Card)', included: true, badge: '7-Day Trial' },
      { text: '500 CI/CD Runs/month (5 parallel runners)', included: true },
      { text: '20 Monitored Sites (60-min automated SSL & health probes)', included: true },
      { text: '42-PoP Global Anycast TTFB Latency Radar', included: true },
      { text: 'Full LLMO Generative Engine & Perplexity Optimization', included: true },
      { text: 'Developer REST API Access (cat_live_ key)', included: true },
      { text: '90-day Historical Regression Analysis', included: true },
      { text: 'Custom CI/CD Build-Breaker Thresholds', included: true },
      { text: 'Multi-seat Workspace (3 seats included)', included: true }
    ],
    restrictions: [
      '20 monitored endpoints max',
      'Standard community support'
    ],
    ctaText: 'Upgrade to Pro',
    ctaTextTrial: 'Start 7-Day Free Trial'
  },
  team: {
    id: 'team',
    name: 'Team / Agency',
    tagline: 'High-throughput engine suite with multi-seat collaboration & white-labeling',
    badge: 'Best for Agencies',
    popular: false,
    priceMonthly: 49,
    priceAnnualMonthly: 39,
    annualBillingTotal: 468,
    annualSavingsPercent: 20,
    hasFreeTrial: true,
    trialDays: 7,
    dailyComputeUnits: 1500,
    masterAuditsPerDay: 150,
    singleEngineAuditsPerDay: 1500,
    ciRunsPerMonth: 2000,
    ciParallelConcurrency: 15,
    monitoredSitesQuota: 50,
    probeFrequencyMinutes: 15, // 15 mins
    telemetryRetentionDays: 365,
    teamSeats: 10,
    features: [
      { text: '1,500 Daily Compute Units (150 Master or 1,500 Single Audits)', included: true, badge: '1,500 units/day' },
      { text: '7-Day Free Trial for Entire Team (No Credit Card)', included: true, badge: '7-Day Trial' },
      { text: '2,000 CI/CD Runs/month (15 parallel runners)', included: true },
      { text: '50 Monitored Sites (15-min background pulse checks)', included: true },
      { text: 'White-Label PDF Reports (Custom Agency Logo & Hex Colors)', included: true, badge: 'White-Label' },
      { text: '10 Team Member Seats with Role-Based Access Control (RBAC)', included: true },
      { text: '365-day (1 Year) Telemetry Archival & Export', included: true },
      { text: 'HMAC-Signed Webhooks & PagerDuty Integration', included: true },
      { text: 'Custom Subdomain Permalinks (audits.yourbrand.com)', included: true },
      { text: 'Priority Slack & Discord Engineering Channel Support', included: true }
    ],
    restrictions: [
      '10 team seats limit',
      '50 monitored endpoints'
    ],
    ctaText: 'Upgrade to Team',
    ctaTextTrial: 'Start 7-Day Free Trial'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Dedicated VPC runners, air-gapped security, 99.99% SLA & bespoke rules',
    badge: 'Enterprise Grade',
    popular: false,
    priceMonthly: 99,
    priceAnnualMonthly: 79,
    annualBillingTotal: 948,
    annualSavingsPercent: 20,
    hasFreeTrial: true,
    trialDays: 7,
    dailyComputeUnits: 5000,
    masterAuditsPerDay: 500,
    singleEngineAuditsPerDay: 5000,
    ciRunsPerMonth: 999999, // unlimited
    ciParallelConcurrency: 50,
    monitoredSitesQuota: 999999, // unlimited
    probeFrequencyMinutes: 1, // 1 min real-time
    telemetryRetentionDays: 730,
    teamSeats: 50,
    features: [
      { text: '5,000+ Daily Compute Units or Unlimited Dedicated Capacity', included: true, badge: '5,000 units/day' },
      { text: '7-Day Full Enterprise Trial (No Credit Card)', included: true, badge: '7-Day Trial' },
      { text: 'Unlimited CI/CD Pipeline Runs with Dedicated Parallel Runners', included: true, badge: 'Unlimited CI' },
      { text: 'Real-time 1-Minute Heartbeat Probes (Unlimited Endpoints)', included: true },
      { text: 'Private Staging Subdomain & Internal VPC Network Scanning', included: true },
      { text: 'Air-gapped Self-Hosted Runner Containers (GCP, AWS, Azure, K8s)', included: true, badge: 'Air-gapped' },
      { text: '99.99% Uptime Guarantee & Custom Legal MSAs', included: true },
      { text: 'SOC 2 Type II & HIPAA Compliance Documentation', included: true },
      { text: 'Custom Diagnostic Rules & Bespoke AST Scanners', included: true },
      { text: 'Dedicated Solutions Architect & 24/7 Phone Support', included: true }
    ],
    restrictions: [],
    ctaText: 'Contact Enterprise',
    ctaTextTrial: 'Start 7-Day Enterprise Trial'
  }
};

export const ALL_PLANS_LIST = Object.values(SUBSCRIPTION_PLANS);
