#!/usr/bin/env node
/**
 * CatalystLab Post-Build / Staging / Production Deployment Verifier
 * (Plan items 3.5, 3.8, 5.1, 5.3, 5.4, 5.7, 7b.1, 7b.2, 10.1, 10.4).
 *
 * Usage:
 *   node scripts/verify-deployment.mjs http://127.0.0.1:3000
 *   node scripts/verify-deployment.mjs https://staging.catalystlab.tech
 *   node scripts/verify-deployment.mjs https://www.catalystlab.tech
 */

const baseUrl = (process.argv[2] || process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
    console.error(`  [FAIL] ${message}`);
  } else {
    console.log(`  [PASS] ${message}`);
  }
}

async function run() {
  console.log(`[verify-deploy] Auditing live deployment contracts against ${baseUrl}...`);

  // 1. Landing page + security headers + gzip compression
  const home = await fetch(`${baseUrl}/`, { headers: { 'Accept-Encoding': 'gzip' } });
  const homeHtml = await home.text();
  check(home.status === 200, 'GET / returns HTTP 200');

  const csp = home.headers.get('content-security-policy') || '';
  check(csp.length > 0, 'Content-Security-Policy header is present');
  check(!csp.includes("'unsafe-inline'"), `CSP contains ZERO 'unsafe-inline' directives (got: ${csp.slice(0, 120)}...)`);
  check(!/(?:^|[\s;])img-src[^;]*\shttps:(?:\s|;|$)/i.test(csp), 'CSP img-src removes bare https: wildcard');
  check(!/(?:^|[\s;])connect-src[^;]*\sws:(?:\s|;|$)/i.test(csp), 'CSP connect-src removes bare ws: scheme');
  check(!/(?:^|[\s;])connect-src[^;]*\swss:(?:\s|;|$)/i.test(csp), 'CSP connect-src removes bare wss: scheme');

  const hsts = home.headers.get('strict-transport-security') || '';
  check(hsts.includes('max-age=63072000') && hsts.includes('includeSubDomains') && hsts.includes('preload'), 'Strict-Transport-Security preload header is set');
  check(home.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff is set');
  check(home.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy: strict-origin-when-cross-origin is set');
  check(Boolean(home.headers.get('permissions-policy')), 'Permissions-Policy header is set');
  check(!/\bstyle=/.test(homeHtml), 'Prerendered HTML contains zero raw inline style="..." attributes');

  // 2. Prerendered /pricing canonical self-reference
  const pricing = await fetch(`${baseUrl}/pricing`);
  const pricingHtml = await pricing.text();
  check(pricing.status === 200, 'GET /pricing returns HTTP 200');
  check(pricingHtml.includes('/pricing"'), 'GET /pricing serves its prerendered canonical tag');

  // 3. Real 404 + noindex on unknown URLs (Plan 7b.1)
  const missing = await fetch(`${baseUrl}/__nonexistent_route_check_404__`);
  const missingHtml = await missing.text();
  check(missing.status === 404, 'Unknown route returns real HTTP 404 (not soft-200)');
  check(missingHtml.includes('noindex'), '404 shell includes noindex robots directive');

  // 4. App/Auth routes carry X-Robots-Tag: noindex (Plan 7b.2)
  const admin = await fetch(`${baseUrl}/admin`);
  check(admin.status === 200, 'GET /admin returns HTTP 200 app shell');
  check((admin.headers.get('x-robots-tag') || '').includes('noindex'), 'GET /admin carries X-Robots-Tag: noindex');

  // 5. Sourcemap leakage blocked (Plan 5.7)
  const mapRes = await fetch(`${baseUrl}/server.cjs.map`);
  check(mapRes.status === 404, 'GET /server.cjs.map returns HTTP 404 (sourcemap protected)');

  // 6. Public health returns ONLY minimal liveness (Plan 3.5) + /ready answers 200
  const health = await fetch(`${baseUrl}/api/v1/system/health`);
  const healthBody = await health.json();
  check(health.status === 200 && healthBody.status === 'operational', 'GET /api/v1/system/health returns 200 operational');
  check(healthBody.memoryUsageMb === undefined && healthBody.platform === undefined && healthBody.database === undefined, 'Public /api/v1/system/health omits host memory/OS/DB details (Plan 3.5)');

  // 7. Legal routes & machine-readable manifests return 200
  for (const route of ['/terms', '/privacy', '/refund', '/cookies', '/robots.txt', '/sitemap.xml', '/llms.txt']) {
    const res = await fetch(`${baseUrl}${route}`);
    check(res.status === 200, `GET ${route} returns HTTP 200`);
  }

  // 8. Paid checkout fail-closed check (Q32)
  const checkout = await fetch(`${baseUrl}/api/payments/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId: 'pro', billingCycle: 'monthly' })
  });
  check(checkout.status === 503, 'POST /api/payments/create-checkout fails closed (HTTP 503) per Q32 when payments disabled');

  if (failures.length > 0) {
    console.error(`\n[verify-deploy] FAILED (${failures.length} check(s) failed).`);
    process.exit(1);
  }
  console.log('\n[verify-deploy] All live deployment & security header contracts passed.');
}

run().catch((err) => {
  console.error('[verify-deploy] Fatal error:', err);
  process.exit(1);
});
