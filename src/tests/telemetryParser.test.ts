import { describe, it, expect } from 'vitest';
import { parseTelemetryOutput } from '../utils/telemetryParser';

describe('Telemetry Parser & Metrics Extraction', () => {
  it('should parse valid JSON engine output correctly', () => {
    const rawJson = JSON.stringify({
      overallScore: 88,
      grade: 'A',
      health: {
        score: 90,
        payloadKb: 450,
        ttfbMs: 65,
        compression: 'Brotli/Gzip',
        resourceHintsCount: 4,
        domElementsCount: 380,
        domDepthLevel: 12,
        modernImagesPct: 95,
        responsiveImagesCount: 8,
        blockingScriptsCount: 0,
        domComplexityRating: 'Optimal'
      },
      security: {
        score: 95,
        hsts: true,
        csp: true,
        xFrameOptions: true,
        referrerPolicy: true,
        permissionsPolicy: true,
        riskCount: 0,
        sslValid: true,
        sslDaysRemaining: 180
      }
    });

    const parsed = parseTelemetryOutput(rawJson, 'https://catalystlab.tech');
    expect(parsed.overallScore).toBe(88);
    expect(parsed.health.ttfbMs).toBe(65);
    expect(parsed.security.hsts).toBe(true);
    expect(parsed.security.sslValid).toBe(true);
  });

  it('should generate robust deterministic metrics from raw plain-text diagnostic CLI reports', () => {
    const plainTextOutput = `
      --- DIAGNOSTIC RUN SUMMARY ---
      Target: https://example.com
      TTFB: 120ms
      Page Weight: 1.2MB
      HSTS: ENABLED
      CSP: PRESENT
      Score: 85/100
    `;

    const parsed = parseTelemetryOutput(plainTextOutput, 'https://example.com');
    expect(parsed).toBeDefined();
    expect(parsed.overallScore).toBeGreaterThanOrEqual(50);
    expect(parsed.overallScore).toBeLessThanOrEqual(100);
    expect(parsed.health).toBeDefined();
    expect(parsed.security).toBeDefined();
    expect(parsed.latency.pops).toBeInstanceOf(Array);
    expect(parsed.latency.pops.length).toBeGreaterThan(0);
  });

  it('should handle empty or malformed strings gracefully without throwing', () => {
    const parsedEmpty = parseTelemetryOutput('', 'https://empty-test.com');
    expect(parsedEmpty).toBeDefined();
    expect(parsedEmpty.overallScore).toBeGreaterThan(0);
    expect(parsedEmpty.grade).toBeDefined();

    const parsedMalformed = parseTelemetryOutput('{ invalid json :::', 'https://malformed-test.com');
    expect(parsedMalformed).toBeDefined();
    expect(parsedMalformed.grade).toBeDefined();
  });
});
