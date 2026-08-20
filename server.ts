import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import http from 'http';
import tls from 'tls';
import { URL } from 'url';
import os from 'os';
import { runNativeEngine } from './src/lib/nodeEngines';
import 'dotenv/config';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENGINE_SCRIPT_MAP: Record<string, string> = {
  health: 'website_health.py',
  latency: 'edge_latency.py',
  ai_ready: 'ai_readiness.py',
  repo: 'repo_scanner.py',
  eco: 'eco_carbon_audit.py',
  compliance: 'compliance_risk_audit.py',
  migration: 'platform_migration_audit.py',
  llmo: 'llmo_optimizer.py'
};

const SUPERADMIN_EMAILS = [
  'shuvo.1807016@bau.edu.bd',
  'shuvoasifahmed@gmail.com',
  'asifahmedshuvo.aas@gmail.com'
];

const VISITOR_DAILY_LIMIT = 5;
const USER_DAILY_LIMIT = 10;

// Daily Rate Limiter: Map<dateKey_identifier, Set<auditSessionId> or count>
const dailySessionAuditMap = new Map<string, Set<string>>();

function checkAndRecordRateLimit(
  userEmail: string | undefined, 
  userId: string | undefined, 
  visitorId: string | undefined, 
  sessionId: string | undefined,
  ip: string
): { allowed: boolean; remaining: number; limit: number | null; tier: string } {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const isSuperadmin = Boolean(cleanEmail && SUPERADMIN_EMAILS.includes(cleanEmail));

  if (isSuperadmin) {
    return { allowed: true, remaining: Infinity, limit: null, tier: 'superadmin' };
  }

  const today = new Date().toISOString().split('T')[0];
  const isAuthUser = Boolean(userId || cleanEmail);
  const identifier = isAuthUser ? `user_${userId || cleanEmail}` : `vis_${visitorId || ip}`;
  const key = `${today}_${identifier}`;
  const limit = isAuthUser ? USER_DAILY_LIMIT : VISITOR_DAILY_LIMIT;
  const tier = isAuthUser ? 'user' : 'visitor';

  if (!dailySessionAuditMap.has(key)) {
    dailySessionAuditMap.set(key, new Set<string>());
  }

  const sessions = dailySessionAuditMap.get(key)!;
  const auditSessionKey = sessionId || `standalone_${Date.now()}_${Math.random()}`;

  if (!sessions.has(auditSessionKey)) {
    if (sessions.size >= limit) {
      return { allowed: false, remaining: 0, limit, tier };
    }
    sessions.add(auditSessionKey);
  }

  const remaining = Math.max(0, limit - sessions.size);
  return { allowed: true, remaining, limit, tier };
}

// Clean old rate limit map entries every hour
setInterval(() => {
  const today = new Date().toISOString().split('T')[0];
  for (const key of dailySessionAuditMap.keys()) {
    if (!key.startsWith(today)) {
      dailySessionAuditMap.delete(key);
    }
  }
}, 1000 * 60 * 60);

const serverStartTime = Date.now();
let totalAuditsExecuted = 0;

// Helper to check SSL certificate days remaining
function getSslDetails(hostname: string, port = 443): Promise<{ valid: boolean; daysRemaining?: number; issuer?: string }> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname,
          timeout: 4000
        },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            if (cert && cert.valid_to) {
              const validTo = new Date(cert.valid_to);
              const now = new Date();
              const diffTime = validTo.getTime() - now.getTime();
              const daysRemaining = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
              socket.destroy();
              resolve({
                valid: daysRemaining > 0,
                daysRemaining,
                issuer: typeof cert.issuer === 'object' && cert.issuer !== null
                  ? Array.isArray(cert.issuer.O) ? cert.issuer.O.join(', ') : (cert.issuer.O || cert.issuer.CN ? String(cert.issuer.O || cert.issuer.CN) : undefined)
                  : String(cert.issuer)
              });
              return;
            }
          } catch {
            // fallback
          }
          socket.destroy();
          resolve({ valid: true });
        }
      );

      socket.on('error', () => {
        socket.destroy();
        resolve({ valid: false, daysRemaining: 0 });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ valid: false, daysRemaining: 0 });
      });
    } catch {
      resolve({ valid: false });
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const HOST = '0.0.0.0';

  // Security Headers Middleware (OWASP Hardening & Injection Prevention)
  app.use((req: Request, res: Response, next) => {
    // 1. Strict-Transport-Security (HSTS) with preload and subdomains (2 years / 63072000s)
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );

    // 2. Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 3. Robust Content-Security-Policy (CSP) to mitigate XSS and data injection
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.googleapis.com https://*.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.gstatic.com",
      "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.cloudfunctions.net https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://www.catalystlab.tech https://*.run.app ws: wss:",
      "frame-src 'self' https://*.firebaseapp.com https://*.google.com",
      "frame-ancestors 'self' https://*.google.com https://*.googleusercontent.com https://*.run.app https://ai.studio *",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
    res.setHeader('Content-Security-Policy', cspDirectives);

    // 4. Defense-in-depth headers
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Pre-flight check endpoint for URL connectivity
  app.post('/api/check-url', async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ reachable: false, error: 'Target URL is required.' });
        return;
      }
      
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const reqOptions = {
        method: 'HEAD',
        timeout: 4000,
        rejectUnauthorized: false // We just want to know if it's reachable, not strictly if cert is valid (though we could)
      };

      const request = client.request(parsedUrl, reqOptions, (response) => {
        // If we get a response, it's reachable (even if it's a 4xx or 5xx, the server responded)
        res.json({ reachable: true, status: response.statusCode });
      });

      request.on('error', (err) => {
        res.json({ reachable: false, error: err.message });
      });

      request.on('timeout', () => {
        request.destroy();
        res.json({ reachable: false, error: 'Timeout' });
      });

      request.end();
    } catch (e: any) {
      res.json({ reachable: false, error: e.message });
    }
  });

  // Python Engine Execution Endpoint
  app.post('/api/run-engine', async (req: Request, res: Response): Promise<void> => {
    try {
      const { url, engine, userEmail, userId, visitorId, auditSessionId } = req.body;

      if (!url || typeof url !== 'string') {
        res.status(400).json({ success: false, error: 'Target URL is required.' });
        return;
      }

      if (!engine || !ENGINE_SCRIPT_MAP[engine]) {
        res.status(400).json({
          success: false,
          error: `Invalid engine '${engine}'. Valid engines: ${Object.keys(ENGINE_SCRIPT_MAP).join(', ')}`
        });
        return;
      }

      // Check Rate Limits
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      const clientEmail = (userEmail || req.headers['x-user-email'] as string) || undefined;
      const clientUserId = (userId || req.headers['x-user-id'] as string) || undefined;
      const clientVisitorId = (visitorId || req.headers['x-visitor-id'] as string) || undefined;
      const clientSessionId = (auditSessionId || req.headers['x-audit-session'] as string) || undefined;

      const rateCheck = checkAndRecordRateLimit(clientEmail, clientUserId, clientVisitorId, clientSessionId, ip);
      if (!rateCheck.allowed) {
        res.status(429).json({
          success: false,
          rateLimitExceeded: true,
          tier: rateCheck.tier,
          limit: rateCheck.limit,
          error: rateCheck.tier === 'user'
            ? 'Daily rate limit reached for registered users (10 audits/day). Quota resets at midnight.'
            : 'Daily rate limit reached for visitors (5 audits/day). Sign in with Google to get 10 audits/day.'
        });
        return;
      }

      totalAuditsExecuted++;
      const scriptName = ENGINE_SCRIPT_MAP[engine];
      const scriptPath = path.join(__dirname, 'python-engines', scriptName);

      // Validate URL / repo safety
      const safeUrl = url.trim().replace(/(["\\$`])/g, '\\$1');

      // Execute Python script with graceful fallback to Native TypeScript engine
      let output: string | null = null;
      try {
        const command = `python3 "${scriptPath}" "${safeUrl}"`;
        const { stdout, stderr } = await execAsync(command, {
          timeout: 40000,
          maxBuffer: 1024 * 1024 * 5
        });
        output = stdout || stderr;
      } catch (pythonErr) {
        // Fallback to Native Engine if python fails
        output = null;
      }

      if (!output || output.trim() === '') {
        output = await runNativeEngine(url, engine);
      }

      res.json({
        success: true,
        engine,
        url,
        rateLimit: {
          tier: rateCheck.tier,
          remaining: rateCheck.remaining,
          limit: rateCheck.limit
        },
        output: output || 'Engine completed with no output.'
      });
    } catch (err: any) {
      console.error(`Error executing engine:`, err);
      res.status(500).json({
        success: false,
        error: err.stderr || err.message || 'Execution error during telemetry scan.'
      });
    }
  });

  // Site Probe for Monitoring & Uptime
  app.post('/api/monitor/probe', async (req: Request, res: Response): Promise<void> => {
    try {
      let { url } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ success: false, error: 'URL is required' });
        return;
      }

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

      const isHttps = parsedUrl.protocol === 'https:';
      const requestLib = isHttps ? https : http;
      const startTime = performance.now();

      let sslInfo: { valid: boolean; daysRemaining?: number; issuer?: string } = { valid: false };
      if (isHttps) {
        sslInfo = await getSslDetails(parsedUrl.hostname, parsedUrl.port ? parseInt(parsedUrl.port) : 443);
      }

      const reqPromise = new Promise<{
        statusCode: number;
        responseTimeMs: number;
        status: 'healthy' | 'degraded' | 'down';
        contentType?: string;
        contentLength?: number;
        headers: Record<string, string>;
      }>((resolve, reject) => {
        const clientReq = requestLib.request(
          parsedUrl.toString(),
          {
            method: 'GET',
            headers: {
              'User-Agent': 'CatalystLab-Telemetry-Monitor/2.0 (Uptime-Health-Probe)',
              'Accept': '*/*'
            },
            timeout: 10000
          },
          (clientRes) => {
            const responseTimeMs = Math.round(performance.now() - startTime);
            const statusCode = clientRes.statusCode || 0;
            const headers: Record<string, string> = {};
            for (const [k, v] of Object.entries(clientRes.headers)) {
              if (v) headers[k] = Array.isArray(v) ? v.join(', ') : String(v);
            }

            let healthStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
            if (statusCode >= 500 || statusCode === 0) {
              healthStatus = 'down';
            } else if (statusCode >= 400 || responseTimeMs > 1200) {
              healthStatus = 'degraded';
            }

            clientRes.resume(); // consume stream
            resolve({
              statusCode,
              responseTimeMs,
              status: healthStatus,
              contentType: headers['content-type'],
              contentLength: headers['content-length'] ? parseInt(headers['content-length']) : undefined,
              headers
            });
          }
        );

        clientReq.on('timeout', () => {
          clientReq.destroy();
          reject(new Error('Connection timed out (>10,000ms)'));
        });

        clientReq.on('error', (err) => {
          reject(err);
        });

        clientReq.end();
      });

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
      uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
      memoryUsageMb: {
        rss: Math.round(memory.rss / (1024 * 1024)),
        heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
        heapUsed: Math.round(memory.heapUsed / (1024 * 1024))
      },
      activeEnginesCount: Object.keys(ENGINE_SCRIPT_MAP).length,
      totalAuditsLogged: totalAuditsExecuted,
      nodeVersion: process.version,
      platform: `${os.type()} ${os.release()} (${os.arch()})`,
      timestamp: Date.now()
    });
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Use one HTTP server for Express and Vite so Vite can attach its HMR WebSocket
  // upgrade handler in middleware mode.
  const httpServer = http.createServer(app);

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
          // Let the browser choose ws/wss from the page protocol while using
          // the preview proxy's public WebSocket port.
          clientPort: 443
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, HOST, () => {
    console.log(`[CatalystLab] Server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
