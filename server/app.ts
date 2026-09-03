import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { attachIdentity } from '../src/lib/serverAuth';
import { requestLoggingMiddleware } from './core/logger';
import { logger } from './core/logger';

// Decomposed route modules (Phase 2) + client-log sink (Phase 3).
import { registerTelemetryRoutes } from './routes/telemetry';
import { registerNotificationRoutes } from './routes/notifications';
import { registerStateSyncRoutes } from './routes/stateSync';
import { registerPlanRoutes } from './routes/plans';
import { registerEngineRoutes } from './routes/engines';
import { registerReportRoutes } from './routes/reports';
import { registerAccountRoutes } from './routes/account';
import { registerGithubRoutes } from './routes/github';
import { registerSystemRoutes } from './routes/system';
import { registerPaymentRoutes } from './routes/payments';
import { registerClientLogRoutes } from './routes/clientLogs';

/**
 * Builds the fully-configured Express app (security headers, body limits,
 * identity middleware, all API routes, 404 + error fallbacks) without any
 * HTTP/Vite/static wiring, so `server.ts` owns only process concerns and the
 * route suite (Phase 3, item 16) can drive the app with supertest.
 */
export async function createApp(): Promise<express.Express> {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  // Compute sha256 hashes of inline <script> blocks in the built index.html
  // so production CSP can drop 'unsafe-inline' entirely (the pre-paint theme
  // bootstrap is the only legitimate inline script in the bundle).
  const inlineScriptHashes: string[] = [];
  if (isProduction) {
    try {
      const builtHtml = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
      const inlineScriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
      let match: RegExpExecArray | null;
      while ((match = inlineScriptRegex.exec(builtHtml)) !== null) {
        const content = match[1];
        if (content.trim().length > 0) {
          inlineScriptHashes.push(`'sha256-${crypto.createHash('sha256').update(content).digest('base64')}'`);
        }
      }
      logger.info({ count: inlineScriptHashes.length }, '[CSP] Allowlisted inline script hashes from dist/index.html');
    } catch (err: unknown) {
      logger.warn({ err }, '[CSP] Could not hash dist/index.html inline scripts');
    }
  }

  // OWASP Security Hardening Middleware with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Phase 1: production drops 'unsafe-inline' (startup-computed hashes
          // allowlist the theme bootstrap) and 'unsafe-eval' everywhere. Dev
          // keeps 'unsafe-inline' for the Vite/React-refresh dev runtime.
          scriptSrc: isProduction
            ? ["'self'", ...inlineScriptHashes, "https://apis.google.com", "https://*.googleapis.com", "https://*.gstatic.com"]
            : ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://*.googleapis.com", "https://*.gstatic.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.gstatic.com"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: [
            "'self'",
            "https://*.googleapis.com",
            "https://*.firebaseio.com",
            "wss://*.firebaseio.com",
            "https://*.cloudfunctions.net",
            "https://identitytoolkit.googleapis.com",
            "https://securetoken.googleapis.com",
            "https://firestore.googleapis.com",
            "https://www.catalystlab.tech",
            "https://*.run.app",
            "ws:",
            "wss:"
          ],
          frameSrc: ["'self'", "https://*.firebaseapp.com", "https://*.google.com"],
          frameAncestors: ["'self'", "https://*.google.com", "https://*.googleusercontent.com", "https://*.run.app", "https://ai.studio"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      frameguard: false // Permitted for iframe previews in AI Studio
    })
  );

  // Additional defense-in-depth header controls
  app.use((req: Request, res: Response, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Phase 3: structured request logging with correlation IDs.
  app.use(requestLoggingMiddleware);

  // Per-route body limits (Phase 1): 256 KB default; only the state-sync
  // mutation endpoint opts into 2 MB for bulk audit payloads. Raw bytes are
  // captured for webhook HMAC verification (signatures are computed over the
  // raw body, not re-serialized JSON).
  const jsonBodyParser = (limit: string) =>
    express.json({
      limit,
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      }
    });

  app.use((req: Request, res: Response, next: express.NextFunction) => {
    const parser = req.path === '/api/state/sync' && req.method === 'POST'
      ? jsonBodyParser('2mb')
      : jsonBodyParser('256kb');
    parser(req, res, next);
  });

  // Phase 1: verify Bearer ID tokens once per request and attach the
  // server-derived identity (plan tier, trial, superadmin claim) for all
  // downstream resolvers. Anonymous requests pass through as visitors.
  app.use((req: Request, res: Response, next: express.NextFunction) => {
    attachIdentity(req, res, next).catch(next);
  });

  // ---- Decomposed route registration (order preserved from the monolith) ----
  registerTelemetryRoutes(app);
  registerNotificationRoutes(app);
  registerStateSyncRoutes(app);
  registerPlanRoutes(app);
  registerEngineRoutes(app);
  registerReportRoutes(app);
  registerAccountRoutes(app);
  registerGithubRoutes(app);
  registerSystemRoutes(app);
  registerPaymentRoutes(app);
  registerClientLogRoutes(app);

  // API 404 catch-all — ensures unhandled /api/* or /stats/* or /telemetry/* requests ALWAYS return JSON and NEVER HTML SPA fallback
  app.all(['/api/*', '/stats/*', '/telemetry/*'], (req: Request, res: Response) => {
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        error: `API endpoint '${req.method} ${req.path}' not found.`
      });
    }
  });

  // CRITICAL route-level fallback: Handle database queries failing gracefully when MongoDB is offline:
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || err.message?.includes('buffering timed out') || err.message?.includes('Mongo')) {
      logger.warn({ requestId: req.requestId }, 'Database offline — returning 503');
      return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
    }
    next(err);
  });

  return app;
}
