/**
 * CATALYSTLAB ENTERPRISE TELEMETRY ENGINE TYPES
 * Strict TypeScript Definitions for 8 Parallel Diagnostic Micro-Analyzers
 */

export type DiagnosticEngineId =
  | 'health'        // 1. Website Health & Core Web Vitals
  | 'ai_ready'      // 2. AI & LLM Readiness Radar
  | 'repo'          // 3. Repo Hygiene & Supply Chain Engine
  | 'latency'       // 4. Global Edge Latency Radar
  | 'eco'           // 5. Eco Carbon Footprint Engine
  | 'compliance'    // 6. Compliance & DevSecOps Risk Engine
  | 'migration'     // 7. Platform Migration Pre-Flight
  | 'ai_search';    // 8. AI Search & Content Architecture Engine

export type EngineExecutionStatus =
  | 'IDLE'
  | 'QUEUED'
  | 'RUNNING'
  | 'STREAMING'
  | 'COMPLETE'
  | 'ERROR';

export type MetricDeltaDirection = 'positive' | 'negative' | 'neutral';

// --- 1. HEALTH ENGINE METRICS ---
export interface WebsiteHealthMetrics {
  ttfbMs: number;
  fcpMs: number;
  lcpMs: number;
  clsScore: number;
  inpMs: number;
  domDepth: number;
  totalDomElements: number;
  renderBlockingAssetsCount: number;
  renderBlockingSizeKb: number;
  resourceHints: {
    dnsPrefetchCount: number;
    preconnectCount: number;
    preloadCount: number;
    hasModernHttpVersion: boolean;
  };
  payloadBreakdownKb: {
    html: number;
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
    total: number;
  };
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

// --- 2. AI & LLM READINESS METRICS ---
export interface AiCrawlerPermission {
  botName: 'GPTBot' | 'ClaudeBot' | 'PerplexityBot' | 'Google-Extended' | 'CCBot' | 'Bytespider' | 'Applebot-Extended';
  allowed: boolean;
  crawlDelay?: number;
  disallowedPaths: string[];
}

export interface StructuredDataEntry {
  type: string;
  isValid: boolean;
  missingFields: string[];
}

export interface AiReadinessMetrics {
  hasLlmsTxt: boolean;
  llmsTxtLength: number;
  hasLlmsFullTxt: boolean;
  hasRobotsTxt: boolean;
  crawlerPolicies: AiCrawlerPermission[];
  structuredData: {
    count: number;
    typesFound: string[];
    schemaDotOrgCompliant: boolean;
    entries: StructuredDataEntry[];
  };
  openGraph: {
    hasTitle: boolean;
    hasDescription: boolean;
    hasImage: boolean;
    hasUrl: boolean;
    hasType: boolean;
    metaCount: number;
  };
  ragContextExtractionScore: number; // 0 - 100
  score: number;
}

// --- 3. REPO HYGIENE METRICS ---
export interface RepoHygieneMetrics {
  repoUrl: string;
  provider: 'github' | 'gitlab' | 'bitbucket' | 'unknown';
  isPublic: boolean;
  hasLicense: boolean;
  licenseName?: string;
  isSpdxCompliant: boolean;
  vulnerabilityFlags: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    hasSecurityPolicy: boolean;
    hasDependabot: boolean;
  };
  branchProtection: {
    isMainProtected: boolean;
    requiresCodeReview: boolean;
    dismissesStaleReviews: boolean;
    enforceAdmins: boolean;
  };
  maintenanceActivity: {
    openIssuesCount: number;
    closedIssuesCount: number;
    issueResolutionRatio: number;
    lastCommitAgeDays: number;
    activeContributorsCount: number;
    commitFrequencyMonthlyAvg: number;
  };
  score: number;
}

// --- 4. GLOBAL EDGE LATENCY METRICS ---
export interface EdgeRegionProbe {
  regionCode: 'us-east' | 'us-west' | 'eu-central' | 'ap-southeast' | 'sa-east' | 'me-central';
  regionName: string;
  city: string;
  country: string;
  dnsLookupMs: number;
  tcpConnectMs: number;
  tlsHandshakeMs: number;
  ttfbMs: number;
  totalTimeMs: number;
  httpStatus: number;
  packetLossPercent: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
}

export interface EdgeLatencyMetrics {
  globalAvgLatencyMs: number;
  fastestRegion: string;
  slowestRegion: string;
  edgeCdnDetected: string | null;
  anycastRoutingEnabled: boolean;
  http3Enabled: boolean;
  probes: EdgeRegionProbe[];
  score: number;
}

// --- 5. ECO CARBON FOOTPRINT METRICS ---
export interface EcoCarbonMetrics {
  totalTransferBytes: number;
  totalTransferKb: number;
  co2GramsPerPageview: number;
  co2GramsPerVisitInitial: number;
  co2GramsPerVisitReturn: number;
  annualCo2KgAt100kVisits: number;
  treesNeededToOffset: number;
  energyKwhPerPageview: number;
  greenHostingVerified: boolean;
  hostingProviderName?: string;
  ecoGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  cleanerThanPercentile: number; // e.g. 84% cleaner than tested pages
  assetWeightRankings: Array<{
    type: 'html' | 'js' | 'css' | 'images' | 'media' | 'fonts';
    kb: number;
    percentage: number;
  }>;
  score: number;
}

// --- 6. COMPLIANCE & DEVSECOPS RISK METRICS ---
export interface OwaspHeaderAudit {
  headerName: string;
  isPresent: boolean;
  value?: string;
  recommendedValue: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  description: string;
}

export interface WcagViolation {
  criterion: string; // e.g. '1.4.3 Contrast (Minimum)'
  level: 'A' | 'AA' | 'AAA';
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  elementsAffectedCount: number;
  description: string;
  remediationAdvice: string;
}

export interface ComplianceRiskMetrics {
  owaspHeaders: OwaspHeaderAudit[];
  sslTls: {
    validCertificate: boolean;
    issuer: string;
    protocol: string;
    cipherSuite: string;
    daysUntilExpiration: number;
    hasHstsPreload: boolean;
  };
  wcag21Aa: {
    passedChecksCount: number;
    failedChecksCount: number;
    contrastIssuesCount: number;
    missingAltTagsCount: number;
    ariaAttributeIssuesCount: number;
    keyboardTrappable: boolean;
    violations: WcagViolation[];
  };
  score: number;
}

// --- 7. PLATFORM MIGRATION PRE-FLIGHT METRICS ---
export interface DetectedStackComponent {
  category: 'CMS' | 'Framework' | 'Hosting/CDN' | 'Database/BaaS' | 'Analytics' | 'Ecommerce';
  name: string;
  version?: string;
  confidence: number; // 0 - 100
  lockInFactor: 'HIGH' | 'MODERATE' | 'LOW';
  migrationPathRecommended: string;
}

export interface PlatformMigrationMetrics {
  detectedCms: string | null;
  detectedFrontend: string | null;
  detectedServer: string | null;
  detectedCdn: string | null;
  components: DetectedStackComponent[];
  databaseFootprint: string | null;
  complexityScore: number; // 0 (trivial) - 100 (extreme refactor required)
  vendorLockInRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedMigrationHours: number;
  readinessChecklist: Array<{
    item: string;
    status: 'READY' | 'WARNING' | 'BLOCKER';
    note: string;
  }>;
  score: number;
}

// --- 8. AI SEARCH OPTIMIZATION METRICS ---
export interface HeadingHierarchyNode {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  text: string;
  length: number;
  isProperlyNested: boolean;
}

export interface AiSearchMetrics {
  textToCodeRatio: number; // Percentage
  totalWordCount: number;
  readingTimeMinutes: number;
  fleschKincaidReadingEase: number;
  semanticHtmlCoverage: {
    hasArticle: boolean;
    hasMain: boolean;
    hasHeader: boolean;
    hasNav: boolean;
    hasSection: boolean;
    hasAside: boolean;
    hasFooter: boolean;
    semanticTagsCount: number;
  };
  headingHierarchy: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    isHierarchyValid: boolean;
    structure: HeadingHierarchyNode[];
  };
  aiSynthesizabilityScore: number; // Likelihood of being cited in Perplexity / SearchGPT
  keyTopicalEntities: string[];
  score: number;
}

// --- UNION METRICS TYPE ---
export type EngineMetricData =
  | WebsiteHealthMetrics
  | AiReadinessMetrics
  | RepoHygieneMetrics
  | EdgeLatencyMetrics
  | EcoCarbonMetrics
  | ComplianceRiskMetrics
  | PlatformMigrationMetrics
  | AiSearchMetrics;

// --- INDIVIDUAL ENGINE RESULT ---
export interface EngineResult<T = EngineMetricData> {
  engineId: DiagnosticEngineId;
  name: string;
  category: 'Performance' | 'Intelligence' | 'Security' | 'Architecture';
  status: EngineExecutionStatus;
  executionTimeMs: number;
  score: number; // 0 - 100
  metrics?: T;
  rawLogStream: string[];
  error?: string;
  completedAt?: string;
}

// --- COMPLETE MASTER TELEMETRY REPORT ---
export interface MasterTelemetryReport {
  id: string;
  targetUrl: string;
  normalizedUrl: string;
  domainSlug: string;
  overallScore: number; // Weighted composite 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  engines: Record<DiagnosticEngineId, EngineResult>;
  startedAt: string;
  completedAt?: string;
  totalDurationMs: number;
  isCompleted: boolean;
  initiatedBy: {
    userId?: string;
    tier: 'visitor' | 'starter' | 'pro' | 'enterprise' | 'superadmin';
    ipHash: string;
  };
}

// --- SERVER SENT EVENTS (SSE) TYPES ---
export type SSEEventType =
  | 'ENGINE_QUEUED'
  | 'ENGINE_START'
  | 'LOG_CHUNK'
  | 'ENGINE_COMPLETE'
  | 'ENGINE_FAILED'
  | 'MASTER_PROGRESS'
  | 'MASTER_COMPLETE'
  | 'RATE_LIMIT_ERROR';

export interface SSEMessagePayload {
  event: SSEEventType;
  engineId?: DiagnosticEngineId;
  progressPercent?: number;
  data?: unknown;
  log?: string;
  error?: string;
  timestamp: number;
}

// --- SIDE-BY-SIDE COMPARISON MATRIX TYPES ---
export interface MetricDelta {
  metricKey: string;
  label: string;
  unit: string;
  valueA: number | string;
  valueB: number | string;
  numericDelta?: number;
  percentDelta?: number;
  better: 'A' | 'B' | 'TIE' | 'NEUTRAL';
  direction: MetricDeltaDirection;
}

export interface EngineComparisonDelta {
  engineId: DiagnosticEngineId;
  engineName: string;
  scoreA: number;
  scoreB: number;
  scoreDelta: number;
  metrics: MetricDelta[];
  winner: 'A' | 'B' | 'TIE';
}

export interface SideBySideComparisonData {
  id: string;
  targetUrlA: string;
  targetUrlB: string;
  overallScoreA: number;
  overallScoreB: number;
  overallScoreDelta: number;
  overallWinner: 'A' | 'B' | 'TIE';
  comparedAt: string;
  engineDeltas: EngineComparisonDelta[];
}

// --- GUEST RATE LIMIT & QUOTA ---
export interface GuestQuotaStatus {
  tier: 'visitor' | 'free' | 'starter' | 'pro' | 'team' | 'enterprise' | 'superadmin';
  remaining: number;
  limit: number;
  used: number;
  resetInSeconds: number;
  formattedResetTime: string;
  allowed: boolean;
  isBlocked: boolean;
  retryAfterSeconds?: number;
}
