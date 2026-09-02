import { Request, Response } from 'express';
import { checkMongoDBHealth, getBatchMetrics } from '../../src/lib/analyticsEngine';
import os from 'os';
import { runtime } from '../core/runtime';
import { ENGINE_SCRIPT_MAP } from '../core/enginesCatalog';

// System health aliases, MongoDB status, probes, and the OpenAPI document.

export function registerSystemRoutes(app: import('express').Express): void {

// 9. System Health & Probe Aliases
app.get('/api/v1/system/health', async (req: Request, res: Response) => {
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
});

// Dedicated MongoDB & Ingestion Worker Status Route
app.get('/api/v1/database/mongodb/status', async (req: Request, res: Response) => {
  const status = await checkMongoDBHealth();
  const batchMetrics = getBatchMetrics();
  res.json({
    success: true,
    ...status,
    ingestionBatching: batchMetrics
  });
});

app.post('/api/v1/system/probe', (req: Request, res: Response) => {
  // Re-route to probe handler logic
  res.redirect(307, '/api/monitor/probe');
});

// 10. OpenAPI Specification JSON & Postman Collection JSON
app.get('/api/v1/openapi.json', (req: Request, res: Response) => {
  res.json({
    openapi: '3.1.0',
    info: {
      title: 'CatalystLab Telemetry & Quality Intelligence API',
      version: '2.4.0',
      description: 'Comprehensive, high-precision automated web telemetry API specification for Core Web Vitals, Edge Latency, AI LLM Readiness, SecOps, and Sustainable Carbon metrics.',
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
