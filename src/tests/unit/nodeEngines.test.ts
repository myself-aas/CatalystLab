import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../lib/networkSecurity', () => ({
  guardedFetch: vi.fn(),
}));

vi.mock('../../lib/securityAudit', () => ({
  getEmailSecurityProfile: vi.fn(),
  enumerateSubdomains: vi.fn(),
}));

import { guardedFetch } from '../../lib/networkSecurity';
import { getEmailSecurityProfile, enumerateSubdomains } from '../../lib/securityAudit';
import { runNativeEngine } from '../../lib/nodeEngines';
import { parseEngineOutput } from '../../utils/parseEngineOutput';

const PAGE = `<!doctype html><html><head>
<title>Example</title>
<link rel="preload" href="/app.js">
<script src="/blocking.js"></script>
<script type="application/ld+json">{"@type":"Organization"}</script>
<meta property="og:title" content="Example">
<meta property="og:description" content="Example page">
<link rel="canonical" href="https://example.com/">
</head><body>
<div><section><p>Hello world</p><p>Second paragraph of copy.</p></section></div>
<a href="/privacy">Privacy policy</a>
<img src="/hero.webp" alt="Hero">
<img src="/icon.png" alt="">
<form><input id="email" type="email"><label for="email">Email</label><input type="text"></form>
</body></html>`;

function response(body: string, headers: Record<string, string> = {}, status = 200) {
  const map = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    status,
    headers: {
      has: (name: string) => map.has(name.toLowerCase()),
      get: (name: string) => map.get(name.toLowerCase()) ?? null,
    },
    text: async () => body,
  };
}

function metricsOf(output: string): Record<string, unknown> {
  const raw = output.split('---CATALYST_METRICS---')[1];
  return JSON.parse(raw);
}

describe('native engines report only what they measured', () => {
  beforeEach(() => {
    vi.mocked(guardedFetch).mockReset();
    vi.mocked(getEmailSecurityProfile).mockReset();
    vi.mocked(enumerateSubdomains).mockReset();
  });

  it('records a health run with element counts read from the page', async () => {
    vi.mocked(guardedFetch).mockResolvedValue(
      response(PAGE, {
        'content-encoding': 'br',
        'strict-transport-security': 'max-age=60',
        'content-security-policy': "default-src 'self'",
      }) as never
    );

    const output = await runNativeEngine('https://example.com', 'health');
    const parsed = parseEngineOutput(output);
    const metrics = metricsOf(output);

    expect(metrics.measured).toBe(true);
    expect(typeof metrics.healthScore).toBe('number');
    expect(parsed.healthScore).toBe(metrics.healthScore);

    // Responds with what the page actually contains.
    expect(output).toContain('Strict-Transport-Security is present');
    expect(output).toContain('Content-Security-Policy is present');
    expect(output).toContain('X-Frame-Options is missing');
    expect(metrics).toHaveProperty('tagMix');
    expect(metrics).toHaveProperty('maxDepth');
    expect(metrics.responsiveImages).toBe(0);
    // No invented time series or clamp padding.
    expect(metrics).not.toHaveProperty('plot1');
    expect(metrics).not.toHaveProperty('plot2');
    expect(metrics).not.toHaveProperty('plot3');
    expect(metrics).not.toHaveProperty('issues');
  });

  it('reports no score at all when the page cannot be fetched', async () => {
    vi.mocked(guardedFetch).mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));

    const output = await runNativeEngine('https://broken.example', 'health');
    const parsed = parseEngineOutput(output);
    const metrics = metricsOf(output);

    expect(metrics).toEqual({
      measured: false,
      healthScore: null,
      scoreNote: 'The scan did not complete, so no readings were recorded.',
    });
    expect(parsed.measured).toBe(false);
    expect(parsed.healthScore).toBeNull();
    expect(output).not.toMatch(/SCORE: \d+\/100/);
  });

  it('keeps unmeasured SPF, DMARC and TLS status out of the compliance report', async () => {
    vi.mocked(guardedFetch).mockResolvedValue(response(PAGE) as never);
    vi.mocked(getEmailSecurityProfile).mockResolvedValue({
      spf_status: 'Not measured',
      dmarc_status: 'Not measured',
      spoofing_risk_level: 'Not measured',
      ssl_status: {
        measured: false,
        is_expired: null,
        days_until_expiration: null,
        encryption_algorithm: null,
        validation_alert: null,
      },
      pipeline_summary: 'DNS lookups for example.com did not complete, so SPF and DMARC status is unknown.',
    });

    const output = await runNativeEngine('https://example.com', 'compliance');
    const metrics = metricsOf(output);

    expect(metrics.measured).toBe(true);
    expect(metrics.spf_status).toBe('Not measured');
    expect(metrics.dmarc_status).toBe('Not measured');
    expect(output).toContain('SPF status could not be measured');
    expect(output).toContain('TLS handshake did not complete');
    expect(output).not.toContain('Days Until Expiration');
  });

  it('scores the eco engine from the measured page weight only', async () => {
    vi.mocked(guardedFetch).mockResolvedValue(response(PAGE) as never);

    const output = await runNativeEngine('https://example.com', 'eco');
    const metrics = metricsOf(output);

    expect(metrics.measured).toBe(true);
    expect(metrics.emissionsPerVisitGrams).toBeGreaterThan(0);
    expect(output).toContain('Estimate basis:');
    expect(metrics).not.toHaveProperty('plot1');
    expect(output).not.toContain("Jan");
  });

  it('lists certificate transparency results without inventing hosts', async () => {
    vi.mocked(enumerateSubdomains).mockResolvedValue({
      subdomains: [
        { subdomain: 'api.example.com', ip: '203.0.113.10', status: 'active', type: 'A', discovered_at: new Date().toISOString() },
      ],
      infrastructure_growth: {
        total_discovered: 1,
        active_hosts: 1,
        cloud_providers: [],
        expansion_rate: null,
        discovery_source: 'Certificate Transparency logs (crt.sh) with live A-record lookups',
      },
    });

    const output = await runNativeEngine('https://github.com/acme/widget', 'repo');
    const metrics = metricsOf(output);

    expect(metrics.measured).toBe(true);
    expect(metrics.healthScore).toBeNull();
    expect(String(metrics.scoreNote)).toContain('no hygiene score');
    expect(output).toContain('api.example.com');
    expect(output).toContain('Not measured (no stored baseline)');
    expect(output).not.toContain('Zero committed high-entropy');
  });

  it('never claims migration readiness it did not assess', async () => {
    vi.mocked(guardedFetch).mockResolvedValue(response(PAGE) as never);

    const output = await runNativeEngine('https://example.com', 'migration');
    const metrics = metricsOf(output);

    expect(metrics.measured).toBe(true);
    expect(metrics.healthScore).toBeNull();
    expect(metrics.detectedStack).toBe('No known framework fingerprint found');
    expect(output).not.toContain('COMPATIBILITY: 100%');
  });
});
