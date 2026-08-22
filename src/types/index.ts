export type CoreEngineType = 
  | 'master-audit'
  | 'health' 
  | 'latency' 
  | 'ai_ready' 
  | 'repo' 
  | 'eco' 
  | 'compliance' 
  | 'migration' 
  | 'llmo';

export type SdlcCatalystType =
  | 'planning_arch'
  | 'code_quality'
  | 'build_eco'
  | 'testing_vitals'
  | 'release_edge'
  | 'devsecops_compliance'
  | 'operations_ai_ready'
  | 'evolution_llmo';

export type EngineType = CoreEngineType | SdlcCatalystType;

export interface AuditReport {
  id?: string;
  url: string;
  engine: string;
  output: string;
  createdAt: number;
  ownerId: string;
  ownerEmail?: string;
  title?: string;
  summary?: string;
  score?: number;
  auditSessionId?: string;
  visitorId?: string;
}

export interface EngineRecommendation {
  engineId: EngineType;
  rationale: string;
}

export interface EngineMeta {
  id: EngineType;
  name: string;
  shortCode?: string;
  catalystName?: string;
  sdlcPhase: string;
  sdlcPhaseNumber: number;
  lifecycleFocus?: string;
  departmentReplaced?: string;
  expertCountReplaced?: number;
  category: 'Core' | 'Developer & AI' | 'Enterprise';
  icon: string;
  color: string;
  badgeClass: string;
  description: string;
  pythonScript: string;
  route: string;
  docsAnchor?: string;
  image?: string;
  keyVectors?: string[];
  stateOfTheArtCapabilities?: string[];
  autonomousActions?: string[];
  sampleTargets?: string[];
  recommendedEngines?: EngineRecommendation[];
  relevantBlogSlugs?: string[];
}

export interface EngineExecutionResult {
  engine: EngineType;
  output: string;
  success: boolean;
  error?: string;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  status: 'published' | 'draft' | 'archived';
  readTime: string;
  coverImage?: string;
  featured?: boolean;
  createdAt: number;
  updatedAt?: number;
  views?: number;
}

export interface MonitoredSite {
  id?: string;
  name: string;
  url: string;
  checkIntervalMinutes?: number;
  status: 'healthy' | 'degraded' | 'down' | 'untested';
  lastCheckedAt?: number;
  responseTimeMs?: number;
  statusCode?: number;
  sslDaysRemaining?: number;
  sslValid?: boolean;
  uptimePercentage?: number;
  createdAt: number;
  ownerId: string;
  notes?: string;
}

export interface SiteProbeResult {
  success: boolean;
  url: string;
  statusCode?: number;
  responseTimeMs: number;
  status: 'healthy' | 'degraded' | 'down';
  sslValid?: boolean;
  sslDaysRemaining?: number;
  contentType?: string;
  contentLength?: number;
  headers?: Record<string, string>;
  error?: string;
  timestamp: number;
}

export interface SystemHealthStats {
  status: string;
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  activeEnginesCount: number;
  totalAuditsLogged: number;
  nodeVersion: string;
  platform: string;
  timestamp: number;
}

export type ApiKeyScope = 
  | 'execute:engines'
  | 'execute:master-audit'
  | 'read:reports'
  | 'read:monitoring'
  | 'manage:webhooks';

export type ApiKeyEnvironment = 'production' | 'staging' | 'development';

export interface WhiteLabelConfig {
  organizationName?: string;
  brandHeaderName?: string;
  customWebhookUrl?: string;
  allowedOrigins?: string[];
  reportTheme?: 'light' | 'dark' | 'corporate';
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string; // e.g. cat_live_9f83...
  secretKey?: string; // only available immediately upon creation or rotation
  ownerId: string;
  ownerEmail: string;
  scopes: ApiKeyScope[];
  environment: ApiKeyEnvironment;
  status: 'active' | 'revoked' | 'expired';
  dailyComputeLimit: number; // 500 units by default for Pro API
  whiteLabelConfig?: WhiteLabelConfig;
  createdAt: number;
  lastRotatedAt?: number | null;
  lastUsedAt?: number | null;
  expiresAt?: number | null;
  requestCountToday?: number;
  totalRequests?: number;
}

export interface PlaygroundHistoryItem {
  id: string;
  timestamp: number;
  endpoint: string;
  method: 'POST' | 'GET';
  engine?: string;
  targetUrl: string;
  statusCode: number;
  latencyMs: number;
  payloadSizeKb: number;
  costCharged: number;
  success: boolean;
  rateLimitRemaining?: number;
  rateLimitTier?: string;
  requestPayload: any;
  responsePayload: any;
  responseHeaders: Record<string, string>;
}

export interface RateLimitThresholdAlertInfo {
  isApproaching: boolean;
  isHit: boolean;
  remainingUnits: number;
  totalUnits: number;
  percentageRemaining: number;
  resetsInFormatted: string;
  tier: string;
  tierLabel: string;
  isUnlimited: boolean;
  burstRemaining?: number;
  isBurstExceeded?: boolean;
}

export interface ContactInquiry {
  id?: string;
  email: string;
  name?: string;
  message?: string;
  source?: string;
  company?: string;
  status?: 'new' | 'contacted' | 'resolved' | 'archived';
  createdAt: number;
  ownerId?: string;
}

export type SubscriptionPlanId = 'free' | 'starter' | 'pro' | 'team' | 'enterprise';

export interface PlanFeature {
  text: string;
  included: boolean;
  tooltip?: string;
  badge?: string;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  priceMonthly: number;
  priceAnnualMonthly: number;
  annualBillingTotal: number;
  annualSavingsPercent: number;
  hasFreeTrial: boolean;
  trialDays: number;
  dailyComputeUnits: number;
  masterAuditsPerDay: number;
  singleEngineAuditsPerDay: number;
  ciRunsPerMonth: number;
  ciParallelConcurrency: number;
  monitoredSitesQuota: number;
  probeFrequencyMinutes: number;
  telemetryRetentionDays: number;
  teamSeats: number;
  features: PlanFeature[];
  restrictions: string[];
  ctaText: string;
  ctaTextTrial: string;
}

export interface UserSubscription {
  id?: string;
  ownerId: string;
  ownerEmail?: string;
  planId: SubscriptionPlanId;
  status: 'active' | 'trialing' | 'expired' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  trialStartedAt?: number | null;
  trialEndsAt?: number | null;
  createdAt: number;
  updatedAt?: number;
}

export type SpoofingRiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';
export type ProtectionStatus = 'Configured' | 'Missing Protection';
export type SslValidationAlert = 'Secure' | 'Warning: Expiring Soon' | 'Critical: Expired/Missing';

export interface SslStatusInfo {
  is_expired: boolean;
  days_until_expiration: number;
  encryption_algorithm: string;
  validation_alert: SslValidationAlert;
  issuer?: string;
  valid_from?: string;
  valid_to?: string;
  protocol?: string;
}

export interface SecurityDiagnosticProfile {
  spf_status: ProtectionStatus;
  dmarc_status: ProtectionStatus;
  spoofing_risk_level: SpoofingRiskLevel;
  ssl_status: SslStatusInfo;
  pipeline_summary: string;
  hosting_ecosystem?: string;
}

export interface SubdomainDiscoveryRecord {
  subdomain: string;
  ip?: string;
  cname?: string;
  status: 'active' | 'unresolved' | 'wildcard';
  type: 'A' | 'CNAME' | 'AAAA' | 'TXT';
  discovered_at: string;
  cloud_provider?: string;
}

export interface InfrastructureGrowthSummary {
  total_discovered: number;
  active_hosts: number;
  cloud_providers: string[];
  expansion_rate: string;
  discovery_source: string;
}

