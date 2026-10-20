import http from 'k6/http';
import { check, group, sleep } from 'k6';

/**
 * CatalystLab Peak Traffic & SLO Load Test (Plan item 10.3 & D16).
 *
 * Exercises compiled `dist/server.cjs` across three workload tiers:
 *   1. Prerendered static HTML shells (`/`, `/pricing`, `/blog`)
 *   2. Fast JSON APIs (`/api/v1/system/health`, `POST /api/telemetry/event`)
 *   3. CPU/network diagnostic scan route (`POST /api/audit/run`)
 *
 * Run via:
 *   k6 run -e BASE_URL=http://127.0.0.1:3099 ops/loadtest/k6-peak.js
 */

export const options = {
  scenarios: {
    peak_web_and_api: {
      executor: 'ramping-vus',
      startVUs: 4,
      stages: [
        { duration: '10s', target: 20 },
        { duration: '20s', target: 35 },
        { duration: '5s', target: 0 },
      ],
      exec: 'webAndApiMix',
    },
    concurrent_audits: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      exec: 'auditWorkload',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{tier:static}': ['p(95)<75'],
    'http_req_duration{tier:api}': ['p(95)<100'],
    'http_req_duration{tier:audit}': ['p(95)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3099';
const API_KEY = __ENV.LOADTEST_API_KEY || 'cat_live_loadtest_verified_token_01';

export function webAndApiMix() {
  group('static', () => {
    const home = http.get(`${BASE_URL}/`, { tags: { tier: 'static' } });
    check(home, {
      'home 200': (r) => r.status === 200,
      'home strict CSP': (r) => {
        const csp = r.headers['Content-Security-Policy'] || r.headers['content-security-policy'] || '';
        return csp.length > 0 && !csp.includes("'unsafe-inline'");
      },
    });

    const pricing = http.get(`${BASE_URL}/pricing`, { tags: { tier: 'static' } });
    check(pricing, { 'pricing 200': (r) => r.status === 200 });
  });

  group('api', () => {
    const health = http.get(`${BASE_URL}/api/v1/system/health`, { tags: { tier: 'api' } });
    check(health, { 'health 200': (r) => r.status === 200 });

    const telemetry = http.post(
      `${BASE_URL}/api/telemetry/event`,
      JSON.stringify({
        eventType: 'vitals',
        url: 'https://www.catalystlab.tech/pricing',
        lcpMs: 1120,
        cls: 0.01,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
          'X-API-Key': API_KEY,
        },
        tags: { tier: 'api' },
      }
    );
    check(telemetry, { 'telemetry 200/202': (r) => r.status === 200 || r.status === 202 });
  });

  sleep(0.05);
}

export function auditWorkload() {
  const res = http.post(
    `${BASE_URL}/api/run-engine`,
    JSON.stringify({
      url: 'https://github.com/myself-aas/CatalystLab',
      engine: 'repo',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      tags: { tier: 'audit' },
    }
  );
  check(res, {
    'audit handled cleanly without 5xx': (r) => r.status < 500,
  });
  sleep(0.25);
}
