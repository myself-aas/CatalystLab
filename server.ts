import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';
import { initAnalyticsDB } from './src/lib/analyticsEngine';
import { createApp } from './server/app';
import { logger } from './server/core/logger';
import 'dotenv/config';

// Process entrypoint: owns the HTTP server, Vite dev middleware / production
// static serving, and lifecycle concerns only. All Express configuration
// (security headers, body limits, identity, API routes, error fallbacks)
// lives in server/app.ts so the route suite can exercise it headlessly.

async function startServer(): Promise<void> {
  // Initialize analytics DB asynchronously without blocking server startup
  initAnalyticsDB().catch((err: unknown) => {
    logger.warn({ err }, '[Analytics DB] Startup init skipped/deferred');
  });

  const app = await createApp();

  // 12-factor: PORT/HOST come from the environment (M11), with the historic
  // defaults preserved for local development.
  const PORT = Number(process.env.PORT) || 3000;
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

    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
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
    logger.info({ host: HOST, port: PORT, env: process.env.NODE_ENV || 'development' }, '[CatalystLab] Server started');
  });
}

startServer().catch((err: unknown) => {
  logger.error({ err }, 'Fatal server startup failure');
  process.exit(1);
});
