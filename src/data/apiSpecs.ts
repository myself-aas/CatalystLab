import { ENGINES_MAP } from './engines';

export interface ApiParam {
  name: string;
  in: 'path' | 'query' | 'header';
  type: string;
  required: boolean;
  default?: string;
  description: string;
  example?: string;
}

export interface ApiResponseSchema {
  status: number;
  description: string;
  example: Record<string, any> | Array<any>;
}

export interface ApiEndpointSpec {
  id: string;
  category: 'Diagnostic Engines' | 'Master Audit' | 'Reports & Dossiers' | 'Blogs & Research' | 'Users & Quota' | 'Workflows & Automation' | 'Integrations & Webhooks' | 'System & Health';
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  auth: string;
  rateLimit: string;
  parameters?: ApiParam[];
  requestBody?: {
    contentType: string;
    required: boolean;
    description: string;
    schema: Record<string, any>;
    defaultPayload: Record<string, any>;
  };
  responses: ApiResponseSchema[];
  engineId?: string;
  tags: string[];
}

export const API_CATEGORIES = [
  'Diagnostic Engines',
  'Master Audit',
  'Reports & Dossiers',
  'Blogs & Research',
  'Users & Quota',
  'Workflows & Automation',
  'Integrations & Webhooks',
  'System & Health'
] as const;

export const API_ENDPOINTS: ApiEndpointSpec[] = [
  // ==========================================
  // 1. DIAGNOSTIC ENGINES
  // ==========================================
  {
    id: 'engine-scan-universal',
    category: 'Diagnostic Engines',
    method: 'POST',
    path: '/api/run-engine',
    summary: 'Universal Engine Scan Dispatcher',
    description: 'Executes a single specified diagnostic engine against a target URL or Git repository in a sandboxed runtime environment with sliding rate limiting.',
    auth: 'None (Public) / Optional User Token',
    rateLimit: '5 scans/day (Visitor), 10 scans/day (User), Unlimited (Admin)',
    tags: ['engines', 'scan', 'telemetry'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Engine execution parameters and target URL.',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Target URL or Git repository URL' },
          engine: { type: 'string', enum: ['health', 'latency', 'ai_ready', 'repo', 'eco', 'compliance', 'migration', 'llmo'], description: 'Engine identifier' },
          userId: { type: 'string', description: 'Optional Firebase User UID for cloud persistence' },
          userEmail: { type: 'string', description: 'Optional user email address' },
          visitorId: { type: 'string', description: 'Optional client device visitor ID' },
          auditSessionId: { type: 'string', description: 'Optional client session grouping ID' }
        },
        required: ['url', 'engine']
      },
      defaultPayload: {
        url: 'https://example.com',
        engine: 'health',
        auditSessionId: 'test_session_001'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Scan executed successfully with raw telemetry output.',
        example: {
          success: true,
          engine: 'health',
          url: 'https://example.com',
          rateLimit: {
            tier: 'visitor',
            remaining: 4,
            limit: 5
          },
          output: `=== [1] DOM TREE HEALTH & RECURSION DEPTH ===\n[✓] Maximum DOM Depth: 14 levels (Optimal < 32)\n[✓] Total DOM Elements: 412 nodes (Optimal < 800)\n[✓] Synchronous Render-Blocking Scripts: 0 blocking scripts\n[✓] Document Wire Payload: 28.4 KB (Brotli active)\n\n=== [2] CORE WEB VITALS TELEMETRY ===\n[✓] Estimated INP Impact: 12ms (Target: < 200ms)\n[✓] Estimated CLS Risk: 0.01 (Target: < 0.1)\n\n=== HEALTH SCORE: 96/100 (GRADE: A+) ===`
        }
      },
      {
        status: 400,
        description: 'Invalid input parameters or missing target URL.',
        example: {
          success: false,
          error: "Invalid engine 'unknown'. Valid engines: health, latency, ai_ready, repo, eco, compliance, migration, llmo"
        }
      },
      {
        status: 429,
        description: 'Daily rate limit exceeded for client tier.',
        example: {
          success: false,
          rateLimitExceeded: true,
          tier: 'visitor',
          limit: 5,
          error: 'Daily rate limit reached for visitors (5 audits/day). Sign in with Google to get 10 audits/day.'
        }
      }
    ]
  },
  {
    id: 'engine-list',
    category: 'Diagnostic Engines',
    method: 'GET',
    path: '/api/v1/engines',
    summary: 'List All Diagnostic Engines',
    description: 'Retrieves metadata, technical specifications, execution script names, categories, and benchmark targets for all 8 diagnostic engines.',
    auth: 'None (Public)',
    rateLimit: '60 req/min',
    tags: ['engines', 'metadata'],
    responses: [
      {
        status: 200,
        description: 'Array of diagnostic engines specifications.',
        example: {
          success: true,
          total: 8,
          engines: [
            {
              id: 'health',
              name: 'Website Health & DOM Engine',
              category: 'Performance',
              script: 'website_health.py',
              route: '/health',
              weight: 0.20,
              description: 'Measures DOM recursion depth, node count, synchronous script blocking, and payload size.'
            },
            {
              id: 'latency',
              name: 'Global Edge Latency Radar',
              category: 'Edge & Network',
              script: 'edge_latency.py',
              route: '/latency',
              weight: 0.20,
              description: 'Evaluates TTFB, TLS 1.3 resumption, and Anycast routing across 12 worldwide PoPs.'
            },
            {
              id: 'ai_ready',
              name: 'AI Readiness & llms.txt Inspector',
              category: 'AI & Crawlers',
              script: 'ai_readiness.py',
              route: '/ai-readiness',
              weight: 0.15,
              description: 'Inspects robots.txt AI crawler policies, /llms.txt manifests, and JSON-LD schemas.'
            },
            {
              id: 'repo',
              name: 'Git Repository Hygiene & SecOps',
              category: 'SecOps & Code',
              script: 'repo_scanner.py',
              route: '/repo-scanner',
              weight: 0.15,
              description: 'Audits open source licenses, SECURITY.md disclosures, Dependabot, and CI/CD pipelines.'
            },
            {
              id: 'eco',
              name: 'Eco-Carbon & Green Web Audit',
              category: 'ESG & Green',
              script: 'eco_carbon_audit.py',
              route: '/eco-audit',
              weight: 0.15,
              description: 'Calculates energy (kWh) and greenhouse gas emissions (g CO2) via SWD Model v4.'
            },
            {
              id: 'compliance',
              name: 'Compliance, Risk & OWASP SecOps',
              category: 'Security & Legal',
              script: 'compliance_risk_audit.py',
              route: '/compliance',
              weight: 0.15,
              description: 'Audits OWASP headers (HSTS, CSP, X-Frame), WCAG 2.2 AA accessibility, and GDPR cookies.'
            },
            {
              id: 'migration',
              name: 'Platform Migration & SEO Parity',
              category: 'Architecture',
              script: 'platform_migration_audit.py',
              route: '/migration',
              weight: 0.15,
              description: 'Audits CMS re-platforming risk index, 301 permanent redirect matrices, and OpenGraph.'
            },
            {
              id: 'llmo',
              name: 'AI Search Optimization (LLMO)',
              category: 'AI & Discovery',
              script: 'llmo_optimizer.py',
              route: '/llmo',
              weight: 0.15,
              description: 'Optimizes content structure for Perplexity, ChatGPT Search, and Gemini citation engines.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'engine-health-dedicated',
    category: 'Diagnostic Engines',
    method: 'POST',
    path: '/api/v1/engines/health/scan',
    summary: 'DOM Health & Web Vitals Scan',
    description: 'Dedicated endpoint for Website Health telemetry. Parses DOM depth, total node count, synchronous script blocking, and payload size.',
    auth: 'None (Public)',
    rateLimit: '5 scans/day (Visitor), 10 scans/day (User)',
    engineId: 'health',
    tags: ['engines', 'health', 'dom', 'web-vitals'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Target URL to evaluate DOM health.',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'https://example.com' },
          auditSessionId: { type: 'string', example: 'sess_health_123' }
        },
        required: ['url']
      },
      defaultPayload: {
        url: 'https://example.com'
      }
    },
    responses: [
      {
        status: 200,
        description: 'DOM health telemetry analysis.',
        example: {
          success: true,
          engine: 'health',
          url: 'https://example.com',
          score: 96,
          metrics: {
            maxDomDepth: 14,
            totalDomNodes: 412,
            blockingScriptsCount: 0,
            blockingStylesheetsCount: 0,
            wirePayloadKb: 28.4,
            brotliCompressionActive: true,
            hasPreconnectHints: true
          },
          recommendations: [
            'Maintain current DOM depth below 32 levels for optimal mobile INP.',
            'Ensure critical CSS remains inlined in <head> for fast First Contentful Paint.'
          ],
          timestamp: 1771465200000
        }
      }
    ]
  },
  {
    id: 'engine-latency-dedicated',
    category: 'Diagnostic Engines',
    method: 'POST',
    path: '/api/v1/engines/latency/scan',
    summary: 'Global Edge Latency Scan (12 PoPs)',
    description: 'Dedicated endpoint to measure synthetic Time-To-First-Byte (TTFB), DNS resolution, TLS 1.3 handshake, and Anycast propagation across 12 global regions.',
    auth: 'None (Public)',
    rateLimit: '5 scans/day (Visitor), 10 scans/day (User)',
    engineId: 'latency',
    tags: ['engines', 'latency', 'edge', 'ttfb'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Target URL for Anycast edge latency audit.',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'https://example.com' }
        },
        required: ['url']
      },
      defaultPayload: {
        url: 'https://example.com'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Global 12 PoP multi-region latency breakdown.',
        example: {
          success: true,
          engine: 'latency',
          url: 'https://example.com',
          averageTtfbMs: 142,
          globalScore: 94,
          regions: [
            { code: 'iad', name: 'US East (N. Virginia)', ttfbMs: 38, status: 'pass' },
            { code: 'sfo', name: 'US West (San Jose)', ttfbMs: 64, status: 'pass' },
            { code: 'fra', name: 'Europe (Frankfurt)', ttfbMs: 82, status: 'pass' },
            { code: 'lhr', name: 'Europe (London)', ttfbMs: 76, status: 'pass' },
            { code: 'sin', name: 'Asia Pacific (Singapore)', ttfbMs: 168, status: 'pass' },
            { code: 'nrt', name: 'Asia Pacific (Tokyo)', ttfbMs: 142, status: 'pass' },
            { code: 'syd', name: 'Oceania (Sydney)', ttfbMs: 210, status: 'warning' },
            { code: 'gru', name: 'South America (São Paulo)', ttfbMs: 195, status: 'pass' },
            { code: 'bom', name: 'South Asia (Mumbai)', ttfbMs: 180, status: 'pass' },
            { code: 'jnb', name: 'Africa (Johannesburg)', ttfbMs: 245, status: 'warning' },
            { code: 'bah', name: 'Middle East (Bahrain)', ttfbMs: 172, status: 'pass' },
            { code: 'icn', name: 'East Asia (Seoul)', ttfbMs: 132, status: 'pass' }
          ],
          cacheStatus: 'HIT (Edge Memory)',
          tlsVersion: 'TLSv1.3'
        }
      }
    ]
  },
  {
    id: 'engine-ai-ready-dedicated',
    category: 'Diagnostic Engines',
    method: 'POST',
    path: '/api/v1/engines/ai_ready/scan',
    summary: 'AI Readiness & llms.txt Scan',
    description: 'Inspects robots.txt crawler policies for GPTBot, ClaudeBot, PerplexityBot, checks /llms.txt manifest, and parses JSON-LD graphs.',
    auth: 'None (Public)',
    rateLimit: '5 scans/day (Visitor), 10 scans/day (User)',
    engineId: 'ai_ready',
    tags: ['engines', 'ai_ready', 'llms-txt', 'crawlers'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Target URL to inspect for LLM accessibility.',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'https://example.com' }
        },
        required: ['url']
      },
      defaultPayload: {
        url: 'https://example.com'
      }
    },
    responses: [
      {
        status: 200,
        description: 'AI crawler readiness report.',
        example: {
          success: true,
          engine: 'ai_ready',
          url: 'https://example.com',
          score: 88,
          crawlers: {
            gptBot: 'ALLOWED',
            claudeBot: 'ALLOWED',
            perplexityBot: 'ALLOWED',
            googleExtended: 'ALLOWED',
            applebotExtended: 'ALLOWED'
          },
          llmsTxtFound: true,
          llmsTxtUrl: 'https://example.com/llms.txt',
          jsonLdSchemas: ['Organization', 'TechArticle', 'WebSite']
        }
      }
    ]
  },

  // ==========================================
  // 2. MASTER AUDIT ORCHESTRATOR
  // ==========================================
  {
    id: 'master-audit',
    category: 'Master Audit',
    method: 'POST',
    path: '/api/v1/audit/master',
    summary: 'Full Master Multi-Engine Audit',
    description: 'Executes parallel synchronous telemetry evaluation across all 8 diagnostic engines, calculates the 0-100 composite quality score, and returns unified diagnostics.',
    auth: 'None (Public) / Token',
    rateLimit: '1 audit/day (Visitor), 3 audits/day (User), Unlimited (Admin)',
    tags: ['master', 'composite', 'full-audit'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Target URL for comprehensive multi-vector quality audit.',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Target URL to audit' },
          saveToHistory: { type: 'boolean', default: true },
          auditSessionId: { type: 'string' }
        },
        required: ['url']
      },
      defaultPayload: {
        url: 'https://example.com',
        saveToHistory: true,
        auditSessionId: 'master_session_789'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Composite master audit results with sub-engine breakdown.',
        example: {
          success: true,
          url: 'https://example.com',
          compositeScore: 92,
          grade: 'A',
          timestamp: 1771465200000,
          engines: {
            health: { score: 96, status: 'pass', maxDepth: 14, nodes: 412 },
            latency: { score: 94, status: 'pass', averageTtfbMs: 142 },
            ai_ready: { score: 88, status: 'pass', llmsTxt: true, allowedBots: 5 },
            repo: { score: 90, status: 'pass', license: 'MIT', securityPolicy: true },
            eco: { score: 95, status: 'pass', gCO2: 0.18, rating: 'A+' },
            compliance: { score: 90, status: 'pass', hsts: true, csp: true },
            migration: { score: 92, status: 'pass', riskIndex: 12 },
            llmo: { score: 89, status: 'pass', ragReadiness: 94 }
          },
          summary: 'The target domain demonstrates exceptional architecture health, ultra-low TTFB latency across all regions, and strong AI LLM citation compatibility.'
        }
      }
    ]
  },
  {
    id: 'audit-compare',
    category: 'Master Audit',
    method: 'POST',
    path: '/api/v1/audit/compare',
    summary: 'Side-by-Side Domain Benchmark Comparison',
    description: 'Executes master quality audits for two distinct domains and returns a differential vector matrix highlighting competitive performance and security gaps.',
    auth: 'None (Public)',
    rateLimit: '2 comparisons/day',
    tags: ['compare', 'benchmark', 'differential'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Two target URLs to benchmark comparatively.',
      schema: {
        type: 'object',
        properties: {
          urlA: { type: 'string', example: 'https://site-a.com' },
          urlB: { type: 'string', example: 'https://site-b.com' }
        },
        required: ['urlA', 'urlB']
      },
      defaultPayload: {
        urlA: 'https://example.com',
        urlB: 'https://wikipedia.org'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Comparative telemetry differential matrix.',
        example: {
          success: true,
          winner: 'https://example.com',
          domainA: { url: 'https://example.com', score: 92, ttfbMs: 142, ecoG: 0.18 },
          domainB: { url: 'https://wikipedia.org', score: 89, ttfbMs: 185, ecoG: 0.22 },
          differential: {
            scoreDelta: '+3 pts',
            latencyDelta: '-43ms (Faster)',
            ecoDelta: '-0.04g CO2 (Greener)'
          }
        }
      }
    ]
  },

  // ==========================================
  // 3. REPORTS & DOSSIERS
  // ==========================================
  {
    id: 'reports-list',
    category: 'Reports & Dossiers',
    method: 'GET',
    path: '/api/v1/reports',
    summary: 'List Audit Reports',
    description: 'Retrieves a paginated list of public or user-scoped audit reports with optional filtering by engine, minimum score, or domain search.',
    auth: 'None (Public) / User Token',
    rateLimit: '60 req/min',
    tags: ['reports', 'history', 'permalinks'],
    parameters: [
      { name: 'limit', in: 'query', type: 'integer', required: false, default: '20', description: 'Number of reports to return (max 100)' },
      { name: 'engine', in: 'query', type: 'string', required: false, description: 'Filter by diagnostic engine (e.g. health, latency, all)' },
      { name: 'search', in: 'query', type: 'string', required: false, description: 'Search reports by domain name keyword' }
    ],
    responses: [
      {
        status: 200,
        description: 'Array of audit reports.',
        example: {
          success: true,
          count: 2,
          total: 1240,
          reports: [
            {
              id: 'rep_abc123',
              url: 'https://example.com',
              engine: 'all',
              score: 92,
              title: 'Master Multi-Engine Quality Audit: https://example.com',
              permalink: '/reports/example-com',
              createdAt: 1771465200000
            },
            {
              id: 'rep_def456',
              url: 'https://react.dev',
              engine: 'health',
              score: 96,
              title: 'Website Health: https://react.dev',
              permalink: '/reports/react-dev',
              createdAt: 1771464000000
            }
          ]
        }
      }
    ]
  },
  {
    id: 'reports-get-by-slug',
    category: 'Reports & Dossiers',
    method: 'GET',
    path: '/api/v1/reports/permalink/{slug}',
    summary: 'Get Report by Domain Slug',
    description: 'Fetches the complete telemetry and article dossier for a canonical domain slug (e.g. `example-com`, `github-com`).',
    auth: 'None (Public)',
    rateLimit: '120 req/min',
    tags: ['reports', 'permalink', 'slug'],
    parameters: [
      { name: 'slug', in: 'path', type: 'string', required: true, description: 'Normalized domain slug (e.g. example-com)', example: 'example-com' }
    ],
    responses: [
      {
        status: 200,
        description: 'Complete report dossier.',
        example: {
          success: true,
          id: 'rep_abc123',
          slug: 'example-com',
          url: 'https://example.com',
          engine: 'all',
          score: 92,
          grade: 'A',
          summary: 'Comprehensive multi-engine audit for example.com',
          output: '... raw telemetry buffer ...',
          createdAt: 1771465200000
        }
      },
      {
        status: 404,
        description: 'Report not found for given slug.',
        example: {
          success: false,
          error: "Report dossier not found for slug 'unknown-xyz'"
        }
      }
    ]
  },
  {
    id: 'reports-export',
    category: 'Reports & Dossiers',
    method: 'POST',
    path: '/api/v1/reports/{id}/export',
    summary: 'Export Report as Structured JSON or Markdown Dossier',
    description: 'Exports a saved report into machine-readable JSON specification or formatted GitHub Markdown dossier for integration into issue trackers and compliance audits.',
    auth: 'None (Public)',
    rateLimit: '30 req/min',
    tags: ['reports', 'export', 'markdown'],
    parameters: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Report unique document ID', example: 'rep_abc123' }
    ],
    requestBody: {
      contentType: 'application/json',
      required: false,
      description: 'Export format preference.',
      schema: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'markdown', 'pdf-spec'], default: 'json' }
        }
      },
      defaultPayload: {
        format: 'markdown'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Formatted report document content.',
        example: {
          success: true,
          reportId: 'rep_abc123',
          format: 'markdown',
          content: `# Telemetry Quality Dossier: example.com\n**Score**: 92/100 (Grade A)\n**Generated**: 2026-08-19\n\n## Core Findings\n- DOM Depth: 14 levels (Pass)\n- Global TTFB: 142ms (Pass)\n- OWASP Security: Strict CSP & HSTS Active (Pass)`
        }
      }
    ]
  },

  // ==========================================
  // 4. BLOGS & RESEARCH DOSSIERS
  // ==========================================
  {
    id: 'blogs-list',
    category: 'Blogs & Research',
    method: 'GET',
    path: '/api/v1/blogs',
    summary: 'List Engineering & Research Articles',
    description: 'Retrieves technical engineering blog posts, architectural deep dives, and audit case studies published on CatalystLab.',
    auth: 'None (Public)',
    rateLimit: '120 req/min',
    tags: ['blogs', 'articles', 'education'],
    parameters: [
      { name: 'tag', in: 'query', type: 'string', required: false, description: 'Filter by category tag (e.g. latency, security, ai, core-web-vitals)' },
      { name: 'search', in: 'query', type: 'string', required: false, description: 'Keyword search across titles and excerpts' }
    ],
    responses: [
      {
        status: 200,
        description: 'List of blog articles.',
        example: {
          success: true,
          count: 6,
          articles: [
            {
              slug: 'dom-recursion-depth-and-mobile-inp',
              title: 'DOM Recursion Depth: How Deep Nesting Destroys Mobile INP',
              author: 'CatalystLab Telemetry Team',
              category: 'Performance & DOM',
              readTime: '6 min read',
              publishedDate: '2026-08-15'
            },
            {
              slug: 'llms-txt-standard-and-autonomous-crawlers',
              title: 'The /llms.txt Standard: Preparing Web Architecture for AI Agents',
              author: 'CatalystLab AI Research',
              category: 'AI Readiness',
              readTime: '8 min read',
              publishedDate: '2026-08-10'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'blogs-get-by-slug',
    category: 'Blogs & Research',
    method: 'GET',
    path: '/api/v1/blogs/{slug}',
    summary: 'Get Article by Slug',
    description: 'Retrieves the complete Markdown article content, schema metadata, and related engine references.',
    auth: 'None (Public)',
    rateLimit: '120 req/min',
    tags: ['blogs', 'content'],
    parameters: [
      { name: 'slug', in: 'path', type: 'string', required: true, description: 'Blog post slug identifier', example: 'dom-recursion-depth-and-mobile-inp' }
    ],
    responses: [
      {
        status: 200,
        description: 'Full blog article object.',
        example: {
          success: true,
          slug: 'dom-recursion-depth-and-mobile-inp',
          title: 'DOM Recursion Depth: How Deep Nesting Destroys Mobile INP',
          author: 'CatalystLab Telemetry Team',
          content: '## Understanding DOM Depth Thrashing\nExcessive <div> nesting exponentially increases browser recalculate style times...',
          tags: ['performance', 'health', 'dom', 'web-vitals'],
          relatedEngine: 'health'
        }
      }
    ]
  },

  // ==========================================
  // 5. USERS, QUOTA & API KEYS
  // ==========================================
  {
    id: 'users-me',
    category: 'Users & Quota',
    method: 'GET',
    path: '/api/v1/users/me',
    summary: 'Get Current Authenticated User Profile & Quota',
    description: 'Returns profile details, current rate-limit usage, remaining daily quota, and saved audit count for the requesting client.',
    auth: 'Bearer Token (Firebase Auth) / X-API-Key',
    rateLimit: '60 req/min',
    tags: ['users', 'profile', 'quota'],
    responses: [
      {
        status: 200,
        description: 'User profile and quota metrics.',
        example: {
          success: true,
          user: {
            uid: 'usr_987654321',
            email: 'developer@example.com',
            tier: 'user',
            dailyQuota: 10,
            usedToday: 3,
            remainingToday: 7,
            quotaResetUtc: '2026-08-20T00:00:00.000Z',
            totalAuditsLifetime: 48
          }
        }
      }
    ]
  },
  {
    id: 'users-api-keys-create',
    category: 'Users & Quota',
    method: 'POST',
    path: '/api/v1/users/me/api-keys',
    summary: 'Generate New Developer API Key',
    description: 'Generates a secure API key for programmatic headless integrations (CI/CD pipelines, automated daemons, custom CLI scripts).',
    auth: 'Bearer Token (Firebase Auth)',
    rateLimit: '5 req/hour',
    tags: ['users', 'api-keys', 'security'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Key configuration parameters.',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'GitHub Actions Production Gate' },
          expiresInDays: { type: 'integer', default: 90, example: 90 }
        },
        required: ['name']
      },
      defaultPayload: {
        name: 'CI/CD Pipeline Quality Gate',
        expiresInDays: 90
      }
    },
    responses: [
      {
        status: 201,
        description: 'API key created successfully. Store secret immediately.',
        example: {
          success: true,
          keyId: 'key_live_abc123',
          name: 'CI/CD Pipeline Quality Gate',
          secretKey: 'cat_live_9f83b271d4e680a9c1e2f3a4b5c6d7e8',
          createdAt: 1771465200000,
          expiresAt: 1779241200000,
          warning: 'This secret key will only be shown once. Store it in your CI/CD secrets manager.'
        }
      }
    ]
  },

  // ==========================================
  // 6. WORKFLOWS & AUTOMATION
  // ==========================================
  {
    id: 'workflows-list',
    category: 'Workflows & Automation',
    method: 'GET',
    path: '/api/v1/workflows',
    summary: 'List Automated Monitoring Workflows',
    description: 'Retrieves scheduled recurring quality audits, cron monitors, and threshold alerting triggers configured for domain properties.',
    auth: 'Bearer Token / X-API-Key',
    rateLimit: '60 req/min',
    tags: ['workflows', 'automation', 'cron'],
    responses: [
      {
        status: 200,
        description: 'Array of configured workflows.',
        example: {
          success: true,
          workflows: [
            {
              id: 'wf_nightly_01',
              name: 'Nightly Production Health & TTFB Probe',
              targetUrl: 'https://example.com',
              schedule: '0 0 * * * (Daily at Midnight UTC)',
              engines: ['health', 'latency', 'compliance'],
              alertThreshold: { minScore: 85, maxTtfbMs: 300 },
              webhookUrl: '',
              active: true,
              lastRunStatus: 'passed',
              lastRunAt: 1771459200000
            }
          ]
        }
      }
    ]
  },
  {
    id: 'automation-cicd-evaluate',
    category: 'Workflows & Automation',
    method: 'POST',
    path: '/api/v1/automation/ci-cd/evaluate',
    summary: 'CI/CD Quality Gate Assertion Check',
    description: 'Evaluates a staging or PR preview URL against strict customizable quality gate thresholds (e.g. minCompositeScore: 90, maxDomDepth: 32, maxTtfbMs: 350). Returns exit code 0 or 1 for build automation.',
    auth: 'X-API-Key / Bearer Token',
    rateLimit: '30 req/min',
    tags: ['automation', 'cicd', 'quality-gate', 'github-actions'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Assertion rules and preview target URL.',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'https://staging.example.com' },
          thresholds: {
            type: 'object',
            properties: {
              minCompositeScore: { type: 'number', default: 85, example: 85 },
              maxDomDepth: { type: 'number', default: 32, example: 32 },
              maxTtfbMs: { type: 'number', default: 350, example: 350 },
              requireHsts: { type: 'boolean', default: true, example: true }
            }
          }
        },
        required: ['url']
      },
      defaultPayload: {
        url: 'https://example.com',
        thresholds: {
          minCompositeScore: 85,
          maxDomDepth: 32,
          maxTtfbMs: 350,
          requireHsts: true
        }
      }
    },
    responses: [
      {
        status: 200,
        description: 'Quality gate evaluated. Check `passed` boolean for CI pass/fail.',
        example: {
          passed: true,
          url: 'https://example.com',
          score: 92,
          assertions: [
            { rule: 'minCompositeScore >= 85', expected: 85, actual: 92, status: 'pass' },
            { rule: 'maxDomDepth <= 32', expected: 32, actual: 14, status: 'pass' },
            { rule: 'maxTtfbMs <= 350', expected: 350, actual: 142, status: 'pass' },
            { rule: 'requireHsts === true', expected: true, actual: true, status: 'pass' }
          ],
          summary: 'All 4 quality gate criteria passed successfully. Build deployment approved.'
        }
      },
      {
        status: 422,
        description: 'Quality gate criteria failed.',
        example: {
          passed: false,
          url: 'https://slow-staging.example.com',
          score: 68,
          failedAssertionsCount: 2,
          assertions: [
            { rule: 'minCompositeScore >= 85', expected: 85, actual: 68, status: 'fail' },
            { rule: 'maxTtfbMs <= 350', expected: 350, actual: 520, status: 'fail' }
          ],
          summary: 'Quality gate failed: 2 assertion violations detected.'
        }
      }
    ]
  },

  // ==========================================
  // 7. INTEGRATIONS & WEBHOOKS
  // ==========================================
  {
    id: 'integrations-list',
    category: 'Integrations & Webhooks',
    method: 'GET',
    path: '/api/v1/integrations',
    summary: 'List Available Integrations & Connectors',
    description: 'Lists all available external integrations including GitHub Actions, GitLab CI, Slack, Discord, Datadog, and Generic Webhook dispatchers.',
    auth: 'None (Public)',
    rateLimit: '60 req/min',
    tags: ['integrations', 'connectors', 'webhooks'],
    responses: [
      {
        status: 200,
        description: 'Available integrations catalog.',
        example: {
          success: true,
          integrations: [
            { id: 'github-actions', name: 'GitHub Actions Quality Gate', category: 'CI/CD', status: 'available' },
            { id: 'gitlab-ci', name: 'GitLab CI CLI Probe', category: 'CI/CD', status: 'available' },
            { id: 'slack', name: 'Slack Telemetry & Alert Webhooks', category: 'Alerts', status: 'available' },
            { id: 'discord', name: 'Discord Incident Notification Bot', category: 'Alerts', status: 'available' },
            { id: 'datadog', name: 'Datadog APM & Metrics Exporter', category: 'Observability', status: 'available' },
            { id: 'opentelemetry', name: 'OpenTelemetry (OTel) Collector', category: 'Observability', status: 'available' }
          ]
        }
      }
    ]
  },
  {
    id: 'integrations-webhook-test',
    category: 'Integrations & Webhooks',
    method: 'POST',
    path: '/api/v1/integrations/webhook/test',
    summary: 'Send Test Webhook with HMAC Signature',
    description: 'Dispatches a sample telemetry event payload with an `X-CatalystLab-Signature-256` HMAC header to verify endpoint integrity.',
    auth: 'Bearer Token / X-API-Key',
    rateLimit: '10 req/min',
    tags: ['integrations', 'webhooks', 'hmac'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Webhook destination URL and signing secret.',
      schema: {
        type: 'object',
        properties: {
          targetWebhookUrl: { type: 'string', example: 'https://webhook.site/sample-guid' },
          signingSecret: { type: 'string', example: 'whsec_sample123456789' }
        },
        required: ['targetWebhookUrl']
      },
      defaultPayload: {
        targetWebhookUrl: 'https://webhook.site/sample-guid',
        signingSecret: 'whsec_sample123456789'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Webhook dispatched and delivery confirmed.',
        example: {
          success: true,
          delivered: true,
          statusCode: 200,
          responseTimeMs: 84,
          signatureHeaderSent: 'sha256=a1b2c3d4e5f6...',
          payloadSent: {
            event: 'audit.completed',
            url: 'https://example.com',
            score: 92,
            timestamp: 1771465200000
          }
        }
      }
    ]
  },

  // ==========================================
  // 8. SYSTEM & HEALTH
  // ==========================================
  {
    id: 'system-health',
    category: 'System & Health',
    method: 'GET',
    path: '/api/monitor/system-health',
    summary: 'Telemetry Cluster Health & Engine Telemetry',
    description: 'Retrieves cluster health, uptime seconds, memory footprint (RSS/heap), active Python engines count, and host platform diagnostics.',
    auth: 'None (Public)',
    rateLimit: '120 req/min',
    tags: ['system', 'health', 'metrics', 'telemetry'],
    responses: [
      {
        status: 200,
        description: 'Cluster health metrics.',
        example: {
          status: 'operational',
          uptimeSeconds: 14205,
          memoryUsageMb: {
            rss: 78,
            heapTotal: 52,
            heapUsed: 36
          },
          activeEnginesCount: 8,
          totalAuditsLogged: 342,
          nodeVersion: 'v20.18.0',
          platform: 'Linux 6.6.0-x86_64 (x64)',
          timestamp: 1771465200000
        }
      }
    ]
  },
  {
    id: 'system-probe',
    category: 'System & Health',
    method: 'POST',
    path: '/api/monitor/probe',
    summary: 'High-Precision Uptime & SSL Socket Probe',
    description: 'Executes high-precision HTTP latency socket probe, inspects TLS x509 certificate expiry days remaining, issuer authority, and server status.',
    auth: 'None (Public)',
    rateLimit: '30 req/min',
    tags: ['system', 'probe', 'uptime', 'ssl'],
    requestBody: {
      contentType: 'application/json',
      required: true,
      description: 'Target URL to probe.',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'https://example.com' }
        },
        required: ['url']
      },
      defaultPayload: {
        url: 'https://example.com'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Socket probe and SSL certificate telemetry.',
        example: {
          success: true,
          url: 'https://example.com',
          statusCode: 200,
          responseTimeMs: 46,
          status: 'healthy',
          sslValid: true,
          sslDaysRemaining: 74,
          sslIssuer: "DigiCert Global Root G2",
          contentType: 'text/html; charset=UTF-8',
          headers: {
            'content-type': 'text/html; charset=UTF-8',
            'cache-control': 'max-age=604800',
            'server': 'ECAcc (iad/182A)'
          },
          timestamp: 1771465200000
        }
      }
    ]
  },
  {
    id: 'openapi-spec',
    category: 'System & Health',
    method: 'GET',
    path: '/api/v1/openapi.json',
    summary: 'OpenAPI 3.1.0 Machine-Readable Specification',
    description: 'Returns the complete OpenAPI 3.1.0 JSON specification for the entire CatalystLab Telemetry API platform.',
    auth: 'None (Public)',
    rateLimit: '120 req/min',
    tags: ['openapi', 'spec', 'swagger'],
    responses: [
      {
        status: 200,
        description: 'Full OpenAPI 3.1.0 document.',
        example: {
          openapi: '3.1.0',
          info: {
            title: 'CatalystLab Telemetry & Quality Intelligence API',
            version: '2.4.0',
            description: 'Automated telemetry API specification for web performance, security, and AI readiness.'
          },
          paths: {
            '/api/run-engine': { post: { summary: 'Universal Engine Scan Dispatcher' } }
          }
        }
      }
    ]
  }
];

// Helper to generate code snippets across multiple languages
export function generateCodeSnippet(endpoint: ApiEndpointSpec, language: 'curl' | 'javascript' | 'python' | 'go' | 'rust' | 'php', baseUrl = 'https://www.catalystlab.tech'): string {
  const method = endpoint.method;
  const path = endpoint.path;
  const fullUrl = `${baseUrl}${path}`;
  const payload = endpoint.requestBody?.defaultPayload;

  switch (language) {
    case 'curl': {
      if (method === 'GET') {
        return `curl -X GET "${fullUrl}" \\
  -H "Accept: application/json"`;
      }
      return `curl -X ${method} "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${JSON.stringify(payload || {}, null, 2)}'`;
    }

    case 'javascript': {
      if (method === 'GET') {
        return `// JavaScript / TypeScript (fetch)
async function callCatalystApi() {
  const response = await fetch("${fullUrl}", {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  });
  const data = await response.json();
  console.log("Telemetry Response:", data);
}

callCatalystApi();`;
      }
      return `// JavaScript / TypeScript (fetch)
async function runDiagnosticScan() {
  const response = await fetch("${fullUrl}", {
    method: "${method}",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(${JSON.stringify(payload || {}, null, 2)})
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.status}\`);
  }

  const result = await response.json();
  console.log("Diagnostic Results:", result);
  return result;
}

runDiagnosticScan();`;
    }

    case 'python': {
      if (method === 'GET') {
        return `# Python 3 (requests)
import requests

url = "${fullUrl}"
headers = {"Accept": "application/json"}

response = requests.get(url, headers=headers)
data = response.json()
print("Telemetry:", data)`;
      }
      return `# Python 3 (requests)
import requests
import json

url = "${fullUrl}"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}
payload = ${JSON.stringify(payload || {}, null, 4)}

response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)
data = response.json()

print(f"Status: {response.status_code}")
print(json.dumps(data, indent=2))`;
    }

    case 'go': {
      if (method === 'GET') {
        return `// Go (net/http)
package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	req, _ := http.NewRequest("GET", "${fullUrl}", nil)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;
      }
      return `// Go (net/http)
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func main() {
	payload := []byte(\`${JSON.stringify(payload || {})}\`)
	req, _ := http.NewRequest("${method}", "${fullUrl}", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %d\\nResponse: %s\\n", resp.StatusCode, string(body))
}`;
    }

    case 'rust': {
      return `// Rust (reqwest & tokio)
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE, ACCEPT};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let payload = json!(${JSON.stringify(payload || {})});

    let res = client
        .${method.toLowerCase()}("${fullUrl}")
        .headers(headers)
        .json(&payload)
        .send()
        .await?;

    let body = res.text().await?;
    println!("Response: {}", body);
    Ok(())
}`;
    }

    case 'php': {
      return `<?php
// PHP (cURL)
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${fullUrl}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => '${method}',
  CURLOPT_POSTFIELDS => '${JSON.stringify(payload || {})}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json',
    'Accept: application/json'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;
`;
    }
  }
}

// Generate complete OpenAPI 3.1.0 document
export function generateOpenApiSpec(): Record<string, any> {
  const paths: Record<string, any> = {};

  API_ENDPOINTS.forEach((ep) => {
    if (!paths[ep.path]) {
      paths[ep.path] = {};
    }

    const methodKey = ep.method.toLowerCase();
    paths[ep.path][methodKey] = {
      tags: ep.tags,
      summary: ep.summary,
      description: ep.description,
      operationId: ep.id,
      parameters: ep.parameters?.map((p) => ({
        name: p.name,
        in: p.in,
        required: p.required,
        description: p.description,
        schema: { type: p.type, default: p.default }
      })),
      requestBody: ep.requestBody ? {
        required: ep.requestBody.required,
        description: ep.requestBody.description,
        content: {
          [ep.requestBody.contentType]: {
            schema: ep.requestBody.schema,
            example: ep.requestBody.defaultPayload
          }
        }
      } : undefined,
      responses: ep.responses.reduce((acc, r) => {
        acc[String(r.status)] = {
          description: r.description,
          content: {
            'application/json': {
              example: r.example
            }
          }
        };
        return acc;
      }, {} as Record<string, any>)
    };
  });

  return {
    openapi: '3.1.0',
    info: {
      title: 'CatalystLab Telemetry & Quality Intelligence API',
      version: '2.4.0',
      description: 'Comprehensive, high-precision automated web telemetry API specification for Core Web Vitals, Edge Latency, AI LLM Readiness, SecOps, and Sustainable Carbon metrics.',
      contact: {
        name: 'CatalystLab Developer Relations',
        url: 'https://www.catalystlab.tech/contact',
        email: 'support@catalystlab.tech'
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://www.catalystlab.tech',
        description: 'Production Global Anycast Gateway'
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Container Development Environment'
      }
    ],
    paths
  };
}

// Generate Postman Collection v2.1 format
export function generatePostmanCollection(): Record<string, any> {
  const itemsByCategory: Record<string, any[]> = {};

  API_ENDPOINTS.forEach((ep) => {
    if (!itemsByCategory[ep.category]) {
      itemsByCategory[ep.category] = [];
    }

    itemsByCategory[ep.category].push({
      name: ep.summary,
      request: {
        method: ep.method,
        header: [
          { key: 'Content-Type', value: 'application/json', type: 'text' },
          { key: 'Accept', value: 'application/json', type: 'text' }
        ],
        body: ep.requestBody ? {
          mode: 'raw',
          raw: JSON.stringify(ep.requestBody.defaultPayload, null, 2),
          options: {
            raw: { language: 'json' }
          }
        } : undefined,
        url: {
          raw: `{{baseUrl}}${ep.path}`,
          host: ['{{baseUrl}}'],
          path: ep.path.split('/').filter(Boolean)
        },
        description: ep.description
      },
      response: []
    });
  });

  return {
    info: {
      name: 'CatalystLab Telemetry & Quality Intelligence API',
      _postman_id: 'catalystlab-api-v2-4',
      description: 'Complete API collection for automated web quality, latency radar, and AI readiness scans.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    variable: [
      { key: 'baseUrl', value: 'https://www.catalystlab.tech', type: 'string' }
    ],
    item: Object.entries(itemsByCategory).map(([catName, items]) => ({
      name: catName,
      item: items
    }))
  };
}
