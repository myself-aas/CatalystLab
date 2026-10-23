import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import type { Request, Response, NextFunction } from 'express';
import { initAnalyticsDB } from './src/lib/analyticsEngine';
import { createApp } from './server/app';
import { isKnownBlogPath, loadRoutesManifest, matchesSpaRoute } from './server/core/spaRoutes';
import { captureException, initErrorTracking, installProcessErrorHandlers } from './server/core/errorTracking';
import { logger } from './server/core/logger';
import { isNoindexSurface } from './src/config/site';
import { aliasTargetFor, splatAliasFor } from './src/config/routeAliases';
import { isDomainSlug } from './src/utils/slugUtils';
import { isPlaygroundEngineId } from './src/data/playgroundEngines';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

/** Injects per-request CSP nonce into HTML shells before sending (Plan 3.8). */
function injectNonceIntoHtml(rawHtml: string, nonce: string): string {
  if (!nonce) return rawHtml;
  const escaped = nonce.replace(/"/g, '');
  return rawHtml
    .replace(/<meta\s+property="csp-nonce"\s+content="[^"]*"\s*\/?>/i, `<meta property="csp-nonce" content="${escaped}" />`)
    .replace(/<script(?![^>]*\bnonce=)/gi, `<script nonce="${escaped}"`);
}

function resolveDistDir(): string {
  // Plan 5.3: resolve dist relative to the compiled server bundle (`dist/server.cjs`)
  // first so starting from `/` under systemd serves the SPA cleanly, with a fallback
  // to `<cwd>/dist` when executed via `tsx server.ts`.
  if (typeof __dirname !== 'undefined') {
    const bundledSibling = path.resolve(__dirname);
    if (existsSync(path.join(bundledSibling, 'routes.json')) || existsSync(path.join(bundledSibling, 'assets'))) {
      return bundledSibling;
    }
  }
  return path.join(process.cwd(), 'dist');
}

async function startServer(): Promise<void> {
  initErrorTracking();
  installProcessErrorHandlers();

  initAnalyticsDB().catch((err: unknown) => {
    logger.warn({ err }, '[Analytics DB] Startup init skipped/deferred');
  });

  const app = await createApp();

  const envPort = Number.parseInt(process.env.PORT || '', 10);
  const PORT = Number.isInteger(envPort) && envPort > 0 && envPort <= 65535 ? envPort : 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  const httpServer = createHttpServer(app);

  if (process.env.NODE_ENV === 'production') {
    const distPath = resolveDistDir();

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.url.endsWith('.map')) {
        return res.status(404).send('Not Found');
      }
      // SEO audit 2026-10-23, issue 5: one URL per document. The alias map is
      // shared with scripts/prerender.ts (which stops writing the shells) and
      // public/_redirects (which mirrors the same list for Cloudflare Pages).
      const aliasTarget = aliasTargetFor(req.path) ?? splatAliasFor(req.path);
      if (aliasTarget && (req.method === 'GET' || req.method === 'HEAD')) {
        const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        res.redirect(301, `${aliasTarget}${query}`);
        return;
      }
      // Programmatic page families with an open-ended parameter (2026-10-23):
      //   /playground/<engine>  -> 308 to the canonical engine, or 404
      //   /report/<id>          -> 301 to /reports/<id>
      //   /reports/<slug>       -> only slugs that can name a domain survive
      // Without these, any invented string answered 200 with the home page's
      // metadata, which is a duplicate page for every value a bot tries.
      if (req.method === 'GET' || req.method === 'HEAD') {
        const playground = req.path.match(/^\/playground\/([^/]+)\/?$/);
        if (playground && !isPlaygroundEngineId(playground[1])) {
          res.redirect(302, '/playground/master');
          return;
        }
        const legacyReport = req.path.match(/^\/report\/([^/]+)\/?$/);
        if (legacyReport) {
          res.redirect(301, `/reports/${legacyReport[1]}`);
          return;
        }
        const reportSlug = req.path.match(/^\/reports\/([^/]+)\/?$/);
        if (reportSlug && !isDomainSlug(reportSlug[1])) {
          if (hasShellFile(notFoundHtml)) {
            res.setHeader('X-Robots-Tag', 'noindex, nofollow');
            sendHtmlShell(res, notFoundHtml, 404);
            return;
          }
          res.status(404).json({ success: false, error: `Page '${req.path}' not found.` });
          return;
        }
      }
      // Plan 7b.2: noindex on application, auth, editor and developer surfaces,
      // including the dynamic ones served from the SPA shell below.
      if (isNoindexSurface(req.path) || /^\/(reports|playground)\/[^/]+\/?$/.test(req.path)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      }
      next();
    });

    const htmlShellCache = new Map<string, string>();
    const missingShellCache = new Set<string>();
    const hasShellFile = (filePath: string): boolean => {
      if (htmlShellCache.has(filePath)) return true;
      if (missingShellCache.has(filePath)) return false;
      if (existsSync(filePath)) return true;
      if (missingShellCache.size < 1024) missingShellCache.add(filePath);
      return false;
    };
    const sendHtmlShell = (res: Response, filePath: string, statusCode = 200) => {
      let cached = htmlShellCache.get(filePath);
      if (cached === undefined) {
        cached = readFileSync(filePath, 'utf8');
        if (htmlShellCache.size < 256) {
          htmlShellCache.set(filePath, cached);
        }
      }
      const nonce = typeof res.locals.cspNonce === 'string' ? res.locals.cspNonce : '';
      res.status(statusCode);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send(injectNonceIntoHtml(cached, nonce));
    };

    const compiledRoutes = loadRoutesManifest(distPath);
    const indexHtml = path.join(distPath, 'index.html');
    const notFoundHtml = path.join(distPath, '404.html');

    // Fast path for legacy redirects (including `.html` paths) & prerendered route shells
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }
      const legacyTarget = compiledRoutes?.legacyRedirects.get(req.path);
      if (legacyTarget) {
        res.redirect(301, legacyTarget);
        return;
      }
      if (req.path.includes('.')) {
        return next();
      }
      const shell = req.path === '/'
        ? indexHtml
        : path.join(distPath, req.path.replace(/^\/+/, '').replace(/\/+$/, ''), 'index.html');
      if (hasShellFile(shell)) {
        sendHtmlShell(res, shell, 200);
        return;
      }
      next();
    });

    app.use(
      express.static(distPath, {
        index: false,
        redirect: false,
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        }
      })
    );

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next();
        return;
      }
      const pathname = req.path;

      // A blog slug only resolves when the build wrote that page; everything
      // else under /blogs is a real 404 rather than a 200 copy of the home page.
      const isBlogPath = /^\/blogs?\/[^/]+\/?$/.test(pathname);
      if (isBlogPath && (!compiledRoutes || !isKnownBlogPath(compiledRoutes, pathname))) {
        if (hasShellFile(notFoundHtml)) {
          res.setHeader('X-Robots-Tag', 'noindex, nofollow');
          sendHtmlShell(res, notFoundHtml, 404);
          return;
        }
        res.status(404).json({ success: false, error: `Page '${pathname}' not found.` });
        return;
      }

      if (compiledRoutes && matchesSpaRoute(compiledRoutes, pathname)) {
        sendHtmlShell(res, indexHtml, 200);
        return;
      }

      if (hasShellFile(notFoundHtml)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        sendHtmlShell(res, notFoundHtml, 404);
        return;
      }
      res.status(404).json({ success: false, error: `Page '${pathname}' not found.` });
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: false
      },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const rawTemplate = readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
        const nonce = typeof res.locals.cspNonce === 'string' ? res.locals.cspNonce : '';
        res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').end(injectNonceIntoHtml(transformed, nonce));
      } catch (err) {
        next(err);
      }
    });
  }

  httpServer.listen(PORT, HOST, () => {
    logger.info({ host: HOST, port: PORT, env: process.env.NODE_ENV || 'development' }, `[CatalystLab] Server listening on http://${HOST}:${PORT}`);
  });

  // Plan 5.5: Graceful shutdown — drain in-flight requests within deadline, then exit cleanly.
  let shuttingDown = false;
  const gracefulShutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, '[CatalystLab] Graceful shutdown initiated');
    const forceTimer = setTimeout(() => {
      logger.warn({ signal }, '[CatalystLab] Shutdown drain deadline reached; closing remaining sockets');
      httpServer.closeAllConnections();
      process.exit(0);
    }, 10_000);

    httpServer.closeIdleConnections();
    httpServer.close(() => {
      logger.info({ signal }, '[CatalystLab] HTTP connections drained; exiting');
      clearTimeout(forceTimer);
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err: unknown) => {
  captureException(err, { source: 'startup' });
  logger.error({ err }, 'Fatal server startup failure');
  process.exit(1);
});
