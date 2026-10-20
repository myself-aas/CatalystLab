import { Request, Response } from 'express';
import { checkMongoDBHealth, getBatchMetrics } from '../../src/lib/analyticsEngine';
import os from 'os';
import { runtime } from '../core/runtime';
import { ENGINE_SCRIPT_MAP } from '../core/enginesCatalog';
import { getAttachedIdentity, getAdminFirestore } from '../../src/lib/serverAuth';
import { isDistributedQuotaEnabled, readDailyUnits } from '../core/dailyQuota';
import { requireSuperadmin } from '../core/authz';

// System liveness, readiness (Plan 8.1), MongoDB status, probes, and OpenAPI.
// Plan 3.5: unauthenticated callers receive ONLY minimal liveness fields so
// Node version, OS kernel, heap metrics, and database topology are never leaked.

export function registerSystemRoutes(app: import('express').Express): void {
  const handleLiveness = async (req: Request, res: Response) => {
    const verified = getAttachedIdentity(req);
    if (!verified?.isSuperadmin) {
      res.json({
        status: 'operational',
        timestamp: Date.now()
      });
      return;
    }

    const memory = process.memoryUsage();
    const mongoStatus = await checkMongoDBHealth();
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
      database: {
        type: 'MongoDB Atlas',
        connected: mongoStatus.connected,
        databaseName: mongoStatus.database,
        pingLatencyMs: mongoStatus.pingMs,
        totalAnalyticsEvents: mongoStatus.totalEventsCount,
        connectionUri: mongoStatus.uriMasked,
        error: mongoStatus.error
      },
      nodeVersion: process.version,
      platform: `${os.type()} ${os.release()} (${os.arch()})`,
      timestamp: Date.now()
    });
  };

  app.get('/api/health', handleLiveness);
  app.get('/api/v1/system/health', handleLiveness);

  // Plan 8.1: Readiness probe checking configured upstream dependencies.
  app.get('/api/v1/system/ready', async (_req: Request, res: Response) => {
    const checks: Record<string, 'ready' | 'unconfigured' | 'unreachable'> = {
      mongo: 'unconfigured',
      redis: 'unconfigured',
      firestore: 'unconfigured'
    };

    if (process.env.MONGODB_URI) {
      const mongo = await checkMongoDBHealth();
      checks.mongo = mongo.connected ? 'ready' : 'unreachable';
    }

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      if (isDistributedQuotaEnabled()) {
        const probe = await readDailyUnits('__readiness_probe__', new Date().toISOString().split('T')[0]);
        checks.redis = probe.backend === 'upstash' ? 'ready' : 'unreachable';
      } else {
        checks.redis = 'unreachable';
      }
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const db = await getAdminFirestore();
      checks.firestore = db ? 'ready' : 'unreachable';
    }

    const failing = Object.entries(checks)
      .filter(([, state]) => state === 'unreachable')
      .map(([name]) => name);

    if (failing.length > 0) {
      res.status(503).json({
        status: 'degraded',
        ready: false,
        failing,
        checks,
        timestamp: Date.now()
      });
      return;
    }

    res.json({
      status: 'ready',
      ready: true,
      checks,
      timestamp: Date.now()
    });
  });

  // Plan 3.5: Restrict internal MongoDB batch metrics & URI metadata in production
  app.get('/api/v1/database/mongodb/status', async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      if (!requireSuperadmin(req, res)) return;
    }
    const status = await checkMongoDBHealth();
    const batchMetrics = getBatchMetrics();
    res.json({
      success: true,
      ...status,
      ingestionBatching: batchMetrics
    });
  });

  app.post('/api/v1/system/probe', (_req: Request, res: Response) => {
    res.redirect(307, '/api/monitor/probe');
  });

  app.get('/api/v1/openapi.json', (_req: Request, res: Response) => {
    res.json({
      openapi: '3.1.0',
      info: {
        title: 'CatalystLab Telemetry & Quality Intelligence API',
        version: '2.4.0',
        description:
          'Automated web telemetry API specification for Core Web Vitals, Edge Latency, AI LLM Readiness, SecOps, and Sustainable Carbon metrics.',
        contact: {
          name: 'CatalystLab Developer Relations',
          url: 'https://www.catalystlab.tech/contact',
          email: 'support@catalystlab.tech'
        }
      },
      servers: [
        { url: 'https://www.catalystlab.tech', description: 'Production Anycast Gateway' },
        { url: 'http://localhost:3000', description: 'Local Container Development' }
      ]
    });
  });
}
