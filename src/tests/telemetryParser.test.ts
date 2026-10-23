import { describe, it, expect } from 'vitest';
import { parseTelemetryOutput } from '../utils/telemetryParser';

describe('Telemetry parser', () => {
  it('reads a structured JSON report field by field', () => {
    const rawJson = JSON.stringify({
      overallScore: 88,
      grade: 'A',
      health: { score: 90, payloadKb: 450, ttfbMs: 65, compression: 'Brotli/Gzip' },
      security: { score: 95, hsts: true, csp: true, xFrameOptions: true, riskCount: 0, sslValid: true, sslDaysRemaining: 180 },
    });

    const parsed = parseTelemetryOutput(rawJson, 'https://catalystlab.tech');
    expect(parsed.overallScore).toBe(88);
    expect(parsed.health?.ttfbMs).toBe(65);
    expect(parsed.security?.hsts).toBe(true);
    expect(parsed.security?.sslValid).toBe(true);
    // Sections the JSON never carried stay absent rather than being invented.
    expect(parsed.eco).toBeNull();
    expect(parsed.llmo).toBeNull();
  });

  it('reads the readings an engine log actually printed', () => {
    const log = `
--- CORE WEBSITE HEALTH ANALYSIS ---
Target: https://example.com
  [>] HTML Payload Size: 42.10 KB
  [>] Time To First Byte (TTFB proxy): 120 ms
  [>] Total DOM Elements: 640
  [>] Tag Mix: containers 240, text 260, links 60, media 12, scripts 40, other 28
  [>] Maximum Nesting Depth: 14 levels
  [>] Responsive Images (srcset): 3 of 12
  [>] Modern Image Formats (WebP/AVIF): 9/12 (75.0%)
  [+] PASS: Compression enabled (br).
  [+] PASS: Found 4 modern resource hints (Preload: 2, Preconnect: 2).
  [+] PASS: Zero parser-blocking scripts found in <head>.
=> [SCORE] CATALYST HEALTH SCORE: 92/100

--- GLOBAL EDGE LATENCY RADAR ---
  [>] Local Origin TTFB: 118 ms
  [>] Reported Edge Infrastructure: cloudflare
=> [SCORE] LATENCY SCORE FROM THAT PROBE: 91/100
`;

    const parsed = parseTelemetryOutput(log, 'https://example.com');
    expect(parsed.health?.score).toBe(92);
    expect(parsed.health?.domElementsCount).toBe(640);
    expect(parsed.health?.domDepthLevel).toBe(14);
    expect(parsed.health?.responsiveImagesCount).toBe(3);
    expect(parsed.health?.tagMix).toEqual([
      { label: 'Containers', count: 240 },
      { label: 'Text', count: 260 },
      { label: 'Links', count: 60 },
      { label: 'Media', count: 12 },
      { label: 'Scripts', count: 40 },
      { label: 'Other', count: 28 },
    ]);
    expect(parsed.health?.blockingScriptsCount).toBe(0);
    expect(parsed.latency?.originTtfbMs).toBe(118);
    expect(parsed.latency?.infrastructure).toBe('cloudflare');
    expect(parsed.overallScore).toBe(Math.round((92 + 91) / 2));
    // Engines that did not run are absent, not zero-filled.
    expect(parsed.security).toBeNull();
    expect(parsed.eco).toBeNull();
  });

  it('does not invent readings for an empty or malformed report', () => {
    const empty = parseTelemetryOutput('', 'https://empty-test.com');
    expect(empty.overallScore).toBeNull();
    expect(empty.grade).toBeNull();
    expect(empty.health).toBeNull();

    const malformed = parseTelemetryOutput('{ invalid json :::', 'https://malformed-test.com');
    expect(malformed.overallScore).toBeNull();
    expect(malformed.grade).toBeNull();
  });

  it('reports unmeasured fields as null instead of a default', () => {
    const log = `
--- CORE WEBSITE HEALTH ANALYSIS ---
Target: https://example.com
  [>] Total DOM Elements: 900
`;
    const parsed = parseTelemetryOutput(log, 'https://example.com');
    expect(parsed.health?.domElementsCount).toBe(900);
    expect(parsed.health?.ttfbMs).toBeNull();
    expect(parsed.health?.payloadKb).toBeNull();
    expect(parsed.health?.score).toBeNull();
    expect(parsed.overallScore).toBeNull();
  });
});
