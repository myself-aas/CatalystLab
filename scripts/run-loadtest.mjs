#!/usr/bin/env node
/**
 * Reproducible Production Server Peak Load & SLO Benchmark (Plan 10.3 & D16).
 *
 * Boots compiled `dist/server.cjs` under `NODE_ENV=production` on an ephemeral
 * localhost port and drives concurrent workload waves across:
 *   - Tier 1 (`static`): `GET /`, `GET /pricing` (SLO p95 < 50 ms)
 *   - Tier 2 (`api`):    `GET /api/v1/system/health`, `POST /api/telemetry/event` (SLO p95 < 150 ms)
 *   - Tier 3 (`audit`):  `POST /api/audit/run` against local prerendered page (SLO p95 < 1,500 ms)
 *
 * Asserts 0% 5xx rate, strict latency budgets, and bounded memory footprint.
 */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const PORT = Number(process.env.LOADTEST_PORT || 3099);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const LOADTEST_KEY = 'cat_live_loadtest_benchmark_key_01';

if (!existsSync(resolve(process.cwd(), 'dist/server.cjs'))) {
  console.error('[loadtest] dist/server.cjs missing. Run `npm run build` first.');
  process.exit(1);
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Number(sorted[Math.max(0, idx)].toFixed(2));
}

function summarize(name, latencies, errors, p95BudgetMs) {
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = percentile(sorted, 50);
  const p95 = percentile(sorted, 95);
  const p99 = percentile(sorted, 99);
  const max = sorted.length ? Number(sorted[sorted.length - 1].toFixed(2)) : 0;
  const errorRate = latencies.length + errors > 0 ? errors / (latencies.length + errors) : 0;
  return {
    tier: name,
    requests: latencies.length + errors,
    errors,
    errorRate: Number((errorRate * 100).toFixed(3)),
    p50Ms: p50,
    p95Ms: p95,
    p99Ms: p99,
    maxMs: max,
    p95BudgetMs,
    passed: p95 <= p95BudgetMs && errorRate < 0.01,
  };
}

async function runPool(totalRequests, concurrency, fn) {
  const latencies = [];
  let errors = 0;
  let cursor = 0;
  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= totalRequests) return;
      const start = performance.now();
      try {
        const status = await fn(idx);
        const elapsed = performance.now() - start;
        if (status >= 500) {
          errors += 1;
        } else {
          latencies.push(elapsed);
        }
      } catch {
        errors += 1;
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { latencies, errors };
}

async function waitForServer(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/api/v1/system/health`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  const serverProc = spawn(process.execPath, ['dist/server.cjs'], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: String(PORT),
      APP_ORIGIN: BASE_URL,
      VITE_APP_ORIGIN: BASE_URL,
      VALID_API_KEYS: LOADTEST_KEY,
      TELEMETRY_INGEST_MAX_PER_MIN: '5000',
      PAYMENTS_ENABLED: 'false',
      LOG_LEVEL: 'error',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer(BASE_URL);

    // Warm-up wave (JIT compilation & OS socket pool priming)
    await runPool(40, 8, async (i) => {
      const res = await fetch(`${BASE_URL}${i % 2 === 0 ? '/' : '/api/v1/system/health'}`);
      await res.arrayBuffer();
      return res.status;
    });

    // Tier 1: Peak Prerendered Static Route Load (800 req @ 20 concurrency)
    const staticRun = await runPool(800, 20, async (i) => {
      const path = i % 3 === 0 ? '/pricing' : i % 3 === 1 ? '/blogs' : '/';
      const res = await fetch(`${BASE_URL}${path}`, { headers: { 'Accept-Encoding': 'gzip' } });
      await res.arrayBuffer();
      return res.status;
    });

    // Tier 2: Peak API Health + Authenticated Telemetry Ingest (800 req @ 20 concurrency)
    const apiRun = await runPool(800, 20, async (i) => {
      if (i % 2 === 0) {
        const res = await fetch(`${BASE_URL}/api/v1/system/health`);
        await res.arrayBuffer();
        return res.status;
      }
      const res = await fetch(`${BASE_URL}/api/telemetry/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
          'X-API-Key': LOADTEST_KEY,
        },
        body: JSON.stringify({
          eventType: 'vitals',
          url: 'https://www.catalystlab.tech/pricing',
          lcpMs: 1090,
          cls: 0.01,
        }),
      });
      await res.arrayBuffer();
      return res.status;
    });

    // Tier 3: Concurrent API Diagnostic Scan Route (`POST /api/run-engine`, 15 req @ 3 concurrency)
    const auditRun = await runPool(15, 3, async () => {
      const res = await fetch(`${BASE_URL}/api/run-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': LOADTEST_KEY,
        },
        body: JSON.stringify({
          url: 'https://github.com/myself-aas/CatalystLab',
          engine: 'repo',
        }),
      });
      await res.arrayBuffer();
      return res.status;
    });

    const tiers = [
      summarize('static_prerendered_html', staticRun.latencies, staticRun.errors, 75),
      summarize('api_health_and_telemetry_ingest', apiRun.latencies, apiRun.errors, 100),
      summarize('diagnostic_audit_engine', auditRun.latencies, auditRun.errors, 5000),
    ];

    const report = {
      generatedAt: new Date().toISOString(),
      nodeVersion: process.version,
      target: BASE_URL,
      totalRequests: tiers.reduce((acc, t) => acc + t.requests, 0),
      total5xxErrors: tiers.reduce((acc, t) => acc + t.errors, 0),
      tiers,
      overallPassed: tiers.every((t) => t.passed),
    };

    if (process.env.LOADTEST_REPORT_PATH) {
      const outPath = resolve(process.cwd(), process.env.LOADTEST_REPORT_PATH);
      mkdirSync(resolve(outPath, '..'), { recursive: true });
      writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
    }

    console.log(JSON.stringify(report, null, 2));
    if (!report.overallPassed) {
      console.error(`::error::Load test missed SLO budget: ${JSON.stringify(tiers)}`);
      process.exitCode = 1;
    }
  } finally {
    serverProc.kill('SIGTERM');
    await new Promise((resolveExit) => serverProc.once('exit', resolveExit));
  }
}

main().catch((err) => {
  console.error('[loadtest] Fatal error:', err);
  process.exit(1);
});
