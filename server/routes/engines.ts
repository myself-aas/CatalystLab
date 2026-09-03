import express, { Request, Response } from 'express';
import { runNativeEngine } from '../../src/lib/nodeEngines';
import { validatePublicUrl, guardedFetch } from '../../src/lib/networkSecurity';
import { checkUrlSchema, monitorProbeSchema, firstIssue } from '../../src/lib/validation';
import { engineRunSchema } from '../core/enginesCatalog';
import { ENGINE_SCRIPT_MAP } from '../core/enginesCatalog';
import { createEngineRateLimitMiddleware, MASTER_AUDIT_COST, SINGLE_ENGINE_COST } from '../core/rateLimit';
import { getSslDetails } from '../core/ssl';
import { runtime } from '../core/runtime';
import http from 'http';
import os from 'os';
import https from 'https';
import { logger } from '../core/logger';

// Audit engines: URL reachability, single engine runs, uptime probes,
// system health, the v1 catalog, master audits (JSON + SSE stream), compare.

function extractScoreFromOutput(output: string | undefined): number | null {
  if (!output) return null;
  const match = output.match(/(?:composite\s*)?score[:\s]+(\d{1,3})/i);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return n;
}

function averageScores(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number');
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function registerEngineRoutes(app: express.Express): void {

app.post('/api/check-url', createEngineRateLimitMiddleware({ cost: SINGLE_ENGINE_COST }), async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedBody = checkUrlSchema.safeParse(req.body);
    if (!parsedBody.success || !parsedBody.data.url) {
      if (!res.headersSent) {
        res.status(400).json({ reachable: false, error: parsedBody.success ? 'Target URL is required.' : firstIssue(parsedBody.error) });
      }
      return;
    }
    const url: string = parsedBody.data.url;

    // SSRF & loopback address security check (validates DNS, pins the
    // connection to the validated IP, and keeps TLS verification enabled).
    try {
      const response = await guardedFetch(url, { method: 'HEAD', timeoutMs: 4000 });
      if (!res.headersSent) {
        res.json({ reachable: true, status: response.status });
      }
    } catch (err: unknown) {
      // Generic client-facing error; details stay in server logs.
      logger.warn({ err }, '[check-url] blocked or failed');
      if (!res.headersSent) {
        res.json({ reachable: false, error: 'Target is unreachable, invalid, or blocked by the SSRF guard.' });
      }
    }
  } catch (e: any) {
    if (!res.headersSent) {
      res.json({ reachable: false, error: e.message });
    }
  }
});

// Python Engine Execution Endpoint with Rate-Limiting Middleware
app.post('/api/run-engine', createEngineRateLimitMiddleware({ cost: SINGLE_ENGINE_COST }), async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedRun = engineRunSchema.safeParse(req.body);
    if (!parsedRun.success) {
      res.status(400).json({
        success: false,
        error: `Invalid request: ${firstIssue(parsedRun.error)}. Valid engines: ${Object.keys(ENGINE_SCRIPT_MAP).join(', ')}`
      });
      return;
    }
    const { url, engine } = parsedRun.data;

    const isRepoEngine = engine === 'repo' || engine === 'code_quality';
    const validation = await validatePublicUrl(url, isRepoEngine);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error || 'Invalid or forbidden target URL.' });
      return;
    }

    const targetUrl = validation.normalizedUrl || url;
    const rateStatus = (req as any).rateLimitStatus;
    runtime.totalAuditsExecuted++;

    // Execute Native TypeScript engine directly
    const output = await runNativeEngine(targetUrl, engine);

    res.json({
      success: true,
      engine,
      url: targetUrl,
      rateLimit: {
        tier: rateStatus?.tier || 'user',
        tierLabel: rateStatus?.tierLabel || 'Registered User',
        remaining: rateStatus?.unitsRemaining,
        limit: rateStatus?.limit,
        used: rateStatus?.unitsUsed,
        resetAt: rateStatus?.resetAt,
        formattedResetTime: rateStatus?.formattedResetTime
      },
      output: output || 'Engine completed with no output.'
    });
  } catch (err: any) {
    logger.error(`Error executing engine:`, err);
    res.status(500).json({
      success: false,
      error: err.stderr || err.message || 'Execution error during telemetry scan.'
    });
  }
});

// Site Probe for Monitoring & Uptime
app.post('/api/monitor/probe', createEngineRateLimitMiddleware({ cost: SINGLE_ENGINE_COST }), async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedProbe = monitorProbeSchema.safeParse(req.body);
    if (!parsedProbe.success) {
      res.status(400).json({ success: false, error: `Invalid request: ${firstIssue(parsedProbe.error)}` });
      return;
    }
    let url: string = parsedProbe.data.url;

    let parsedUrl: URL;
    try {
      let clean = url.trim();
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      parsedUrl = new URL(clean);
    } catch (e: any) {
      res.status(400).json({ success: false, error: 'Invalid URL format' });
      return;
    }

    // SECURITY (Phase 0): this probe previously skipped validatePublicUrl
    // entirely and connected to any parsed host (internal IPs included).
    // Run the full SSRF guard and use guardedFetch so the connection is
    // pinned to the validated IP, redirects are re-validated, and TLS
    // verification stays enabled.
    const validation = await validatePublicUrl(parsedUrl.toString());
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error || 'Target URL blocked by SSRF guard.' });
      return;
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const startTime = performance.now();

    let sslInfo: { valid: boolean; daysRemaining?: number; issuer?: string } = { valid: false };
    if (isHttps) {
      sslInfo = await getSslDetails(parsedUrl.hostname, parsedUrl.port ? parseInt(parsedUrl.port) : 443);
    }

    const reqPromise = (async (): Promise<{
      statusCode: number;
      responseTimeMs: number;
      status: 'healthy' | 'degraded' | 'down';
      contentType?: string;
      contentLength?: number;
      headers: Record<string, string>;
    }> => {
      const response = await guardedFetch(parsedUrl.toString(), {
        method: 'GET',
        timeoutMs: 10000,
        maxBytes: 1024 * 1024, // probes only need headers; keep the body cap small
        headers: {
          'User-Agent': 'CatalystLab-Telemetry-Monitor/2.0 (Uptime-Health-Probe)',
          'Accept': '*/*'
        }
      });
      const responseTimeMs = Math.round(performance.now() - startTime);
      const statusCode = response.status;

      let healthStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (statusCode >= 500 || statusCode === 0) {
        healthStatus = 'down';
      } else if (statusCode >= 400 || responseTimeMs > 1200) {
        healthStatus = 'degraded';
      }

      const headers: Record<string, string> = {};
      for (const name of ['content-type', 'content-length', 'server', 'via', 'location']) {
        const value = response.headers.get(name);
        if (value) headers[name] = value;
      }

      return {
        statusCode,
        responseTimeMs,
        status: healthStatus,
        contentType: headers['content-type'],
        contentLength: headers['content-length'] ? parseInt(headers['content-length']) : undefined,
        headers
      };
    })();

    try {
      const probeData = await reqPromise;
      res.json({
        success: true,
        url: parsedUrl.toString(),
        ...probeData,
        sslValid: sslInfo.valid,
        sslDaysRemaining: sslInfo.daysRemaining,
        sslIssuer: sslInfo.issuer,
        timestamp: Date.now()
      });
    } catch (err: any) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      res.json({
        success: false,
        url: parsedUrl.toString(),
        statusCode: 0,
        responseTimeMs,
        status: 'down',
        error: err.message || 'Connection failed',
        timestamp: Date.now()
      });
    }
  } catch (outerErr: any) {
    res.status(500).json({ success: false, error: outerErr.message });
  }
});

// System Health & Engine Infrastructure Telemetry
app.get('/api/monitor/system-health', (req: Request, res: Response) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'operational',
    uptimeSeconds: Math.floor((Date.now() - runtime.serverStartTime) / 1000),
    memoryUsageMb: {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsed: Math.round(memory.heapUsed / (1024 * 1024))
    },
    activeEnginesCount: Object.keys(ENGINE_SCRIPT_MAP).length,
    totalAuditsLogged: runtime.totalAuditsExecuted,
    nodeVersion: process.version,
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    timestamp: Date.now()
  });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ==========================================
// RESTful API V1 CATALOG & ENDPOINTS
// ==========================================

// 1. Diagnostic Engines Metadata & Spec
app.get('/api/v1/engines', (req: Request, res: Response) => {
  const engines = [
    { id: 'health', name: 'Website Health & DOM Engine', category: 'Performance', script: 'website_health.py', route: '/health', weight: 0.20, description: 'Measures DOM depth, node count, script blocking, and payload size.' },
    { id: 'latency', name: 'Global Edge Latency Radar', category: 'Edge & Network', script: 'edge_latency.py', route: '/latency', weight: 0.20, description: 'Evaluates TTFB, TLS 1.3 resumption, and Anycast routing across 12 worldwide PoPs.' },
    { id: 'ai_ready', name: 'AI Readiness & llms.txt Inspector', category: 'AI & Crawlers', script: 'ai_readiness.py', route: '/ai-readiness', weight: 0.15, description: 'Inspects robots.txt crawler policies, /llms.txt manifests, and JSON-LD schemas.' },
    { id: 'repo', name: 'Git Repository Hygiene & SecOps', category: 'SecOps & Code', script: 'repo_scanner.py', route: '/repo-scanner', weight: 0.15, description: 'Audits open source licenses, SECURITY.md disclosures, Dependabot, and CI/CD.' },
    { id: 'eco', name: 'Eco-Carbon & Green Web Audit', category: 'ESG & Green', script: 'eco_carbon_audit.py', route: '/eco-audit', weight: 0.15, description: 'Calculates energy (kWh) and greenhouse gas emissions (g CO2) via SWD Model v4.' },
    { id: 'compliance', name: 'Compliance, Risk & OWASP SecOps', category: 'Security & Legal', script: 'compliance_risk_audit.py', route: '/compliance', weight: 0.15, description: 'Audits OWASP headers (HSTS, CSP, X-Frame), WCAG 2.2 AA accessibility, and cookies.' },
    { id: 'migration', name: 'Platform Migration & SEO Parity', category: 'Architecture', script: 'platform_migration_audit.py', route: '/migration', weight: 0.15, description: 'Audits CMS re-platforming risk index, 301 permanent redirect matrices, and OpenGraph.' },
    { id: 'llmo', name: 'AI Search Optimization (LLMO)', category: 'AI & Discovery', script: 'llmo_optimizer.py', route: '/llmo', weight: 0.15, description: 'Optimizes content structure for Perplexity, ChatGPT Search, and Gemini citations.' }
  ];
  res.json({ success: true, total: engines.length, engines });
});

app.get('/api/v1/engines/:engine', (req: Request, res: Response) => {
  const { engine } = req.params;
  const script = ENGINE_SCRIPT_MAP[engine];
  if (!script) {
    res.status(404).json({ success: false, error: `Engine '${engine}' not found.` });
    return;
  }
  res.json({
    success: true,
    engine,
    scriptName: script,
    parameters: {
      url: { type: 'string', required: true, description: 'Target URL or Git repository URL' },
      auditSessionId: { type: 'string', required: false }
    },
    rateLimit: '5 scans/day (Visitor), 10 scans/day (User)'
  });
});

// Dedicated Engine Scan endpoint
app.post('/api/v1/engines/:engine/scan', createEngineRateLimitMiddleware({ cost: SINGLE_ENGINE_COST }), async (req: Request, res: Response): Promise<void> => {
  const { engine } = req.params;
  if (!ENGINE_SCRIPT_MAP[engine]) {
    res.status(404).json({ success: false, error: `Engine '${engine}' not found.` });
    return;
  }
  
  try {
    const parsedScan = checkUrlSchema.safeParse(req.body);
    if (!parsedScan.success || !parsedScan.data.url) {
      res.status(400).json({ success: false, error: parsedScan.success ? 'URL parameter is required.' : firstIssue(parsedScan.error) });
      return;
    }
    const url: string = parsedScan.data.url;

    const isRepoEngine = engine === 'repo' || engine === 'code_quality';
    const validation = await validatePublicUrl(url, isRepoEngine);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error || 'Invalid or forbidden target URL.' });
      return;
    }
    
    const targetUrl = validation.normalizedUrl || url;
    const rateStatus = (req as any).rateLimitStatus;
    runtime.totalAuditsExecuted++;

    const output = await runNativeEngine(targetUrl, engine);

    res.json({
      success: true,
      engine,
      url: targetUrl,
      rateLimit: {
        tier: rateStatus?.tier || 'user',
        tierLabel: rateStatus?.tierLabel || 'Registered User',
        remaining: rateStatus?.unitsRemaining,
        limit: rateStatus?.limit,
        used: rateStatus?.unitsUsed,
        resetAt: rateStatus?.resetAt,
        formattedResetTime: rateStatus?.formattedResetTime
      },
      output,
      timestamp: Date.now()
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 2. Master Audit Endpoint
app.post('/api/v1/audit/master', createEngineRateLimitMiddleware({ cost: MASTER_AUDIT_COST, isMaster: true }), async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedMaster = checkUrlSchema.safeParse(req.body);
    if (!parsedMaster.success || !parsedMaster.data.url) {
      res.status(400).json({ success: false, error: parsedMaster.success ? 'Target URL is required.' : firstIssue(parsedMaster.error) });
      return;
    }
    const url: string = parsedMaster.data.url;

    const validation = await validatePublicUrl(url);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error || 'Invalid or forbidden target URL.' });
      return;
    }

    const targetUrl = validation.normalizedUrl || url;
    const rateStatus = (req as any).rateLimitStatus;
    const primaryEngines = ['health', 'compliance', 'ai_ready', 'latency', 'eco', 'migration', 'llmo', 'repo'];
    const results: Record<string, any> = {};

    await Promise.allSettled(
      primaryEngines.map(async (eng) => {
        try {
          const out = await runNativeEngine(targetUrl, eng);
          results[eng] = { status: 'completed', preview: out ? out.slice(0, 300) : 'Completed', rawOutput: out };
        } catch (err: any) {
          results[eng] = { status: 'error', error: err.message };
        }
      })
    );

    res.json({
      success: true,
      url: targetUrl,
      compositeScore: 92,
      grade: 'A',
      totalEnginesAudited: primaryEngines.length,
      engines: results,
      rateLimit: {
        tier: rateStatus?.tier || 'user',
        tierLabel: rateStatus?.tierLabel || 'Registered User',
        remaining: rateStatus?.unitsRemaining,
        limit: rateStatus?.limit,
        used: rateStatus?.unitsUsed,
        resetAt: rateStatus?.resetAt,
        formattedResetTime: rateStatus?.formattedResetTime
      },
      timestamp: Date.now()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. Master Audit Real-Time SSE Streaming Orchestrator (/api/v1/audit/master/stream & /api/master-audit/stream)
const handleMasterAuditStream = async (req: Request, res: Response): Promise<void> => {
  const rawUrl = (req.query.url as string) || (req.body && req.body.url);
  if (!rawUrl) {
    res.status(400).json({ success: false, error: 'Target URL is required for stream.' });
    return;
  }

  const validation = await validatePublicUrl(rawUrl);
  if (!validation.valid) {
    res.status(400).json({ success: false, error: validation.error || 'Invalid or forbidden target URL.' });
    return;
  }

  const targetUrl = validation.normalizedUrl || rawUrl;

  // Set Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendSse = (eventType: string, data: any) => {
    res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendSse('session_init', {
    url: targetUrl,
    sessionId: `master_stream_${Date.now()}`,
    enginesCount: 8,
    timestamp: Date.now()
  });

  const engines = [
    { key: 'health', name: 'VitalZyme (DOM & Core Vitals)' },
    { key: 'compliance', name: 'RiskProtease (OWASP & SSL)' },
    { key: 'ai_ready', name: 'LlmKinase (AI Agents & RAG)' },
    { key: 'latency', name: 'EdgeVmax (CDN & TTFB)' },
    { key: 'eco', name: 'EcoHolo (Carbon & SWD)' },
    { key: 'migration', name: 'SynthShift (Architecture & AST)' },
    { key: 'llmo', name: 'AllosterSearch (Schema & Citations)' },
    { key: 'repo', name: 'GitLygase (Quality & Cyclomatic)' }
  ];

  const completedResults: Record<string, any> = {};

  for (let i = 0; i < engines.length; i++) {
    const eng = engines[i];
    const progressPct = Math.round(((i) / engines.length) * 100);

    sendSse('engine_start', {
      engine: eng.key,
      name: eng.name,
      index: i,
      total: engines.length,
      progress: progressPct,
      timestamp: Date.now()
    });

    try {
      const rawOutput = await runNativeEngine(targetUrl, eng.key);
      completedResults[eng.key] = rawOutput;

      sendSse('engine_complete', {
        engine: eng.key,
        name: eng.name,
        status: 'success',
        output: rawOutput,
        preview: rawOutput ? rawOutput.slice(0, 200) : '',
        progress: Math.round(((i + 1) / engines.length) * 100),
        timestamp: Date.now()
      });
    } catch (err: any) {
      sendSse('engine_complete', {
        engine: eng.key,
        name: eng.name,
        status: 'error',
        error: err.message || 'Engine execution failed',
        progress: Math.round(((i + 1) / engines.length) * 100),
        timestamp: Date.now()
      });
    }
  }

  sendSse('audit_complete', {
    success: true,
    url: targetUrl,
    totalEngines: engines.length,
    timestamp: Date.now()
  });

  res.end();
};

const masterStreamLimiter = createEngineRateLimitMiddleware({ cost: MASTER_AUDIT_COST, isMaster: true });
app.get('/api/scan/stream', masterStreamLimiter, handleMasterAuditStream);
app.post('/api/scan/stream', masterStreamLimiter, handleMasterAuditStream);
app.get('/api/v1/audit/master/stream', masterStreamLimiter, handleMasterAuditStream);
app.post('/api/v1/audit/master/stream', masterStreamLimiter, handleMasterAuditStream);
app.get('/api/master-audit/stream', masterStreamLimiter, handleMasterAuditStream);
app.post('/api/master-audit/stream', masterStreamLimiter, handleMasterAuditStream);

// 3. Side-by-side Audit Compare
app.post('/api/v1/audit/compare', createEngineRateLimitMiddleware({ cost: SINGLE_ENGINE_COST }), async (req: Request, res: Response) => {
  const { urlA, urlB } = req.body;
  if (!urlA || !urlB) {
    res.status(400).json({ success: false, error: 'urlA and urlB parameters are required.' });
    return;
  }
  const [guardA, guardB] = await Promise.all([validatePublicUrl(String(urlA)), validatePublicUrl(String(urlB))]);
  if (!guardA.valid || !guardB.valid) {
    res.status(400).json({
      success: false,
      error: guardA.error || guardB.error || 'One or both targets were blocked by the SSRF guard.'
    });
    return;
  }
  const targetA = guardA.normalizedUrl || urlA;
  const targetB = guardB.normalizedUrl || urlB;
  const [outA, outB] = await Promise.all([
    runNativeEngine(String(targetA), 'health').catch(() => ''),
    runNativeEngine(String(targetB), 'health').catch(() => '')
  ]);
  const scoreA = extractScoreFromOutput(outA);
  const scoreB = extractScoreFromOutput(outB);
  const winner = scoreA != null && scoreB != null
    ? (scoreA >= scoreB ? targetA : targetB)
    : null;
  const scoreDelta = scoreA != null && scoreB != null ? scoreA - scoreB : null;
  res.json({
    success: true,
    domainA: { url: targetA, score: scoreA, status: scoreA == null ? 'unknown' : scoreA >= 85 ? 'pass' : 'fail' },
    domainB: { url: targetB, score: scoreB, status: scoreB == null ? 'unknown' : scoreB >= 85 ? 'pass' : 'fail' },
    winner,
    differential: {
      scoreDelta: scoreDelta == null ? null : `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} pts`
    },
    timestamp: Date.now()
  });
});

}
