import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import zlib from 'zlib';
import { attachIdentity } from '../src/lib/serverAuth';
import { requestLoggingMiddleware, logger } from './core/logger';
import { captureException } from './core/errorTracking';

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
import { registerContactRoutes } from './routes/contact';
import { ensureRetentionIndexes } from './core/retention';

/** Empty-stylesheet SHA-256 hash (`""`), covering zero-rule `<style></style>` mounts (e.g. cobe WebGL). */
export const EMPTY_STYLE_HASH = "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='";

/** Explicit external image host allowlist replacing wildcard `https:` (Plan 3.8). */
export const CSP_IMG_ALLOWLIST = [
  "'self'",
  'data:',
  'blob:',
  'https://www.catalystlab.tech',
  'https://cdn.catalystlab.tech',
  'https://images.unsplash.com',
  'https://images.pexels.com',
  'https://cdn.simpleicons.org',
  'https://i.pravatar.cc',
  'https://github.com',
  'https://avatars.githubusercontent.com',
  'https://raw.githubusercontent.com',
  'https://*.googleusercontent.com',
  'https://*.gstatic.com'
];

/** Explicit connect-src allowlist with NO bare `ws:` or `wss:` schemes (Plan 3.8). */
export const CSP_CONNECT_ALLOWLIST = [
  "'self'",
  'https://*.googleapis.com',
  'https://*.firebaseio.com',
  'wss://*.firebaseio.com',
  'https://*.cloudfunctions.net',
  'https://identitytoolkit.googleapis.com',
  'https://securetoken.googleapis.com',
  'https://firestore.googleapis.com',
  'https://www.catalystlab.tech',
  'wss://www.catalystlab.tech',
  'https://*.run.app'
];

const COMPRESSIBLE_CONTENT_TYPE_RE = /\b(text\/html|text\/css|text\/plain|text\/xml|application\/javascript|application\/json|application\/xml|application\/rss\+xml|image\/svg\+xml)\b/i;

/**
 * Zero-dependency response compression middleware (Plan 5.4).
 * Compresses text/JSON/HTML/JS/CSS payloads ≥ 1 KB when the client advertises
 * `Accept-Encoding: gzip`, while strictly skipping Server-Sent Event streams.
 */
function gzipCompressionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const acceptEncoding = req.headers['accept-encoding'];
  if (
    req.method === 'HEAD' ||
    typeof acceptEncoding !== 'string' ||
    !/\bgzip\b/i.test(acceptEncoding) ||
    req.path.endsWith('/stream')
  ) {
    next();
    return;
  }

  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  let passthrough = false;

  const isStreamOrPreEncoded = (): boolean => {
    const contentType = String(res.getHeader('Content-Type') || '');
    const existingEncoding = res.getHeader('Content-Encoding');
    return (
      Boolean(existingEncoding) ||
      /text\/event-stream/i.test(contentType) ||
      (contentType.length > 0 && !COMPRESSIBLE_CONTENT_TYPE_RE.test(contentType))
    );
  };

  res.write = ((chunk: any, encoding?: any, cb?: any): boolean => {
    if (passthrough || isStreamOrPreEncoded()) {
      passthrough = true;
      for (const buffered of chunks.splice(0)) {
        origWrite(buffered);
      }
      return origWrite(chunk, encoding, cb);
    }
    if (chunk !== undefined && chunk !== null) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), typeof encoding === 'string' ? (encoding as BufferEncoding) : 'utf8');
      chunks.push(buf);
      totalBytes += buf.length;
      // Flush uncompressed if response streaming grows large (> 8 MB)
      if (totalBytes > 8 * 1024 * 1024) {
        passthrough = true;
        for (const buffered of chunks.splice(0)) {
          origWrite(buffered);
        }
      }
    }
    if (typeof encoding === 'function') encoding();
    else if (typeof cb === 'function') cb();
    return true;
  }) as typeof res.write;

  res.end = ((chunk?: any, encoding?: any, cb?: any): Response => {
    const done = typeof chunk === 'function' ? chunk : typeof encoding === 'function' ? encoding : cb;
    if (chunk !== undefined && chunk !== null && typeof chunk !== 'function') {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), typeof encoding === 'string' ? (encoding as BufferEncoding) : 'utf8');
      chunks.push(buf);
      totalBytes += buf.length;
    }

    if (passthrough || isStreamOrPreEncoded() || res.statusCode === 204 || res.statusCode === 304 || totalBytes < 1024) {
      for (const buffered of chunks.splice(0)) {
        origWrite(buffered);
      }
      return origEnd(done);
    }

    const body = Buffer.concat(chunks);
    const existingVary = String(res.getHeader('Vary') || '');
    if (!/accept-encoding/i.test(existingVary)) {
      res.setHeader('Vary', existingVary ? `${existingVary}, Accept-Encoding` : 'Accept-Encoding');
    }
    zlib.gzip(body, { level: 1 }, (err, compressed) => {
      if (err || !compressed) {
        origWrite(body);
        origEnd(done);
        return;
      }
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', String(compressed.length));
      origWrite(compressed);
      origEnd(done);
    });
    return res;
  }) as typeof res.end;

  next();
}

export function extractInlineHashes(html: string, tagName: 'script' | 'style'): string[] {
  const hashes = new Set<string>();
  const regex =
    tagName === 'script'
      ? /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi
      : /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const content = match[1];
    if (content.trim().length > 0) {
      hashes.add(`'sha256-${crypto.createHash('sha256').update(content).digest('base64')}'`);
    }
  }
  return Array.from(hashes);
}

/**
 * Builds the fully-configured Express app (security headers, body limits,
 * identity middleware, all API routes, 404 + error fallbacks).
 */
export async function createApp(): Promise<express.Express> {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  let inlineScriptHashes: string[] = [];
  let inlineStyleHashes: string[] = [];
  if (isProduction) {
    try {
      const candidateHtml = [
        path.join(process.cwd(), 'dist', 'index.html'),
        ...(typeof __dirname !== 'undefined' ? [path.resolve(__dirname, 'index.html')] : [])
      ].find((p) => fs.existsSync(p));
      if (candidateHtml) {
        const builtHtml = fs.readFileSync(candidateHtml, 'utf8');
        inlineScriptHashes = extractInlineHashes(builtHtml, 'script');
        inlineStyleHashes = extractInlineHashes(builtHtml, 'style');
        logger.info(
          { scriptHashes: inlineScriptHashes.length, styleHashes: inlineStyleHashes.length },
          '[CSP] Allowlisted inline hashes from built index.html'
        );
      }
    } catch (err: unknown) {
      logger.warn({ err }, '[CSP] Could not hash dist/index.html inline blocks');
    }
  }

  // Generate a fresh 128-bit cryptographic nonce per request (Plan 3.8).
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
    next();
  });

  // OWASP Security Hardening Middleware with strict CSP (Plan item 3.8:
  // zero 'unsafe-inline' in script-src OR style-src, no bare ws:/wss: in
  // connect-src, and explicit host allowlist in img-src).
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            (_req, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
            ...inlineScriptHashes,
            'https://apis.google.com',
            'https://*.googleapis.com',
            'https://*.gstatic.com'
          ],
          styleSrc: [
            "'self'",
            (_req, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
            EMPTY_STYLE_HASH,
            ...inlineStyleHashes,
            'https://fonts.googleapis.com',
            'https://*.gstatic.com'
          ],
          fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
          imgSrc: CSP_IMG_ALLOWLIST,
          connectSrc: CSP_CONNECT_ALLOWLIST,
          frameSrc: ["'self'", 'https://*.firebaseapp.com', 'https://*.google.com'],
          frameAncestors: ["'self'", 'https://*.google.com', 'https://*.googleusercontent.com', 'https://*.run.app', 'https://ai.studio'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          scriptSrcAttr: ["'none'"],
          upgradeInsecureRequests: []
        }
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
      frameguard: false
    })
  );

  app.use((_req: Request, res: Response, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Plan 5.4: SSE-safe gzip compression
  app.use(gzipCompressionMiddleware);

  // Phase 3 (Plan 3.12): allowlist-projected structured request logging
  app.use(requestLoggingMiddleware);

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

  app.use((req: Request, res: Response, next: express.NextFunction) => {
    attachIdentity(req, res, next).catch(next);
  });

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
  registerContactRoutes(app);

  app.all(['/api/*', '/stats/*', '/telemetry/*'], (req: Request, res: Response) => {
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        error: `API endpoint '${req.method} ${req.path}' not found.`
      });
    }
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (!(err?.name === 'MongooseError' || err?.name === 'MongoNetworkError')) {
      captureException(err, { path: req.path, method: req.method, requestId: req.requestId });
    }
    if (res.headersSent) {
      return next(err);
    }
    if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || err.message?.includes('buffering timed out') || err.message?.includes('Mongo')) {
      logger.warn({ requestId: req.requestId }, 'Database offline — returning 503');
      return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
    }
    next(err);
  });

  ensureRetentionIndexes().catch((err: unknown) => {
    logger.warn({ err }, '[Retention] TTL index bootstrap failed');
  });

  return app;
}
