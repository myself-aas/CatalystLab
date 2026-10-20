import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { existsSync } from 'fs';
import type { Request, Response, NextFunction } from 'express';
import { initAnalyticsDB } from './src/lib/analyticsEngine';
import { createApp } from './server/app';
import { loadRoutesManifest, matchesSpaRoute } from './server/core/spaRoutes';
import { captureException, initErrorTracking, installProcessErrorHandlers } from './server/core/errorTracking';
import { logger } from './server/core/logger';
import 'dotenv/config';

// Process entrypoint: owns the HTTP server, Vite dev middleware / production
// static serving, and lifecycle concerns only. All Express configuration
// (security headers, body limits, identity, API routes, error fallbacks)
// lives in server/app.ts so the route suite can exercise it headlessly.

async function startServer(): Promise<void> {
  // D10: error tracking first, so a failure during startup is still reported.
  initErrorTracking();
  installProcessErrorHandlers();

  // Initialize analytics DB asynchronously without blocking server startup
  initAnalyticsDB().catch((err: unknown) => {
    logger.warn({ err }, '[Analytics DB] Startup init skipped/deferred');
  });

  const app = await createApp();

  // 12-factor (Q40, owner decision 2026-10-19): PORT/HOST come from the
  // environment, with the historic defaults preserved for local development.
  // An unparseable PORT falls back to 3000 rather than crashing the process.
  const envPort = Number.parseInt(process.env.PORT || '', 10);
  const PORT = Number.isInteger(envPort) && envPort > 0 && envPort <= 65535 ? envPort : 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  // Use one HTTP server for Express and Vite so Vite can attach its HMR WebSocket
  // upgrade handler in middleware mode.
  const httpServer = createHttpServer(app);

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.url.endsWith('.map')) {
        return res.status(404).send('Not Found');
      }
      next();
    });

    // Vite emits content-hashed filenames under /assets, so they can be cached forever.
    // HTML and other top-level files keep the default revalidation behaviour.
    app.use(express.static(distPath, {
      // Prerendered route shells live at dist/<route>/index.html. Without this,
      // /pricing would 301 to /pricing/ and disagree with its own canonical.
      redirect: false,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }));
    // D11/D14: serve the prerendered shell for a route when one exists, the
    // app shell for client-only routes, a 301 for legacy `.html` aliases, and
    // a real 404 (with the prerendered 404 page) for everything else.
    const compiledRoutes = loadRoutesManifest(distPath);
    const indexHtml = path.join(distPath, 'index.html');
    const notFoundHtml = path.join(distPath, '404.html');

    app.get('*', (req: Request, res: Response) => {
      const pathname = req.path;

      const legacyTarget = compiledRoutes?.legacyRedirects.get(pathname);
      if (legacyTarget) {
        res.redirect(301, legacyTarget);
        return;
      }

      const shell = pathname === '/'
        ? indexHtml
        : path.join(distPath, pathname.replace(/^\/+/, '').replace(/\/+$/, ''), 'index.html');
      if (existsSync(shell)) {
        res.sendFile(shell);
        return;
      }

      if (compiledRoutes && matchesSpaRoute(compiledRoutes, pathname)) {
        res.sendFile(indexHtml);
        return;
      }

      if (existsSync(notFoundHtml)) {
        res.status(404).sendFile(notFoundHtml);
        return;
      }
      res.status(404).json({ success: false, error: `Page '${pathname}' not found.` });
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        // The preview proxy does not expose the dev WebSocket upgrade path.
        // Disable Vite HMR so the browser does not retry a socket that cannot open.
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    logger.info({ host: HOST, port: PORT, env: process.env.NODE_ENV || 'development' }, '[CatalystLab] Server started');
  });
}

startServer().catch((err: unknown) => {
  captureException(err, { source: 'startup' });
  logger.error({ err }, 'Fatal server startup failure');
  process.exit(1);
});
