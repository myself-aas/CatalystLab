import { describe, expect, it } from 'vitest';
import { parseEngineOutput } from '../../utils/parseEngineOutput';

describe('parseEngineOutput', () => {
  it('reads the score and the checks an engine printed', () => {
    const parsed = parseEngineOutput(`
--- CORE WEBSITE HEALTH ANALYSIS ---
Target: https://example.com
  [+] PASS: Lean HTML payload.
  [-] FAIL: Text compression (Brotli/Gzip) is not active. Major performance loss.
  [~] WARNING: No responsive images (srcset) found.
=> [SCORE] CATALYST HEALTH SCORE: 91/100
    `);
    expect(parsed.measured).toBe(true);
    expect(parsed.healthScore).toBe(91);
    expect(parsed.issues.info).toBe(1);
    expect(parsed.issues.critical).toBe(1);
    expect(parsed.issues.warning).toBe(1);
    expect(parsed.failures[0]).toContain('Text compression');
    expect(parsed.tableData.find((r) => r.metric.includes('Text compression'))?.status).toBe('Fail');
  });

  it('trusts the metrics block over the log text', () => {
    const parsed = parseEngineOutput(`
  [>] Local Origin TTFB: 118 ms
---CATALYST_METRICS---
{ "measured": true, "healthScore": 91, "loadTime": 118 }
    `);
    expect(parsed.healthScore).toBe(91);
    expect(parsed.loadTime).toBe(118);
  });

  it('returns no score when the engine says the scan did not finish', () => {
    const parsed = parseEngineOutput(`
--- CORE WEBSITE HEALTH ANALYSIS ---
  [!] CRITICAL: Failed to complete health scan: getaddrinfo ENOTFOUND
---CATALYST_METRICS---
{ "measured": false, "healthScore": null, "scoreNote": "The scan did not complete, so no readings were recorded." }
    `);
    expect(parsed.measured).toBe(false);
    expect(parsed.healthScore).toBeNull();
    expect(parsed.loadTime).toBeNull();
    expect(parsed.scoreNote).toContain('did not complete');
    expect(parsed.issues.critical).toBe(1);
  });

  it('keeps a completed run without a score unscored but measured', () => {
    const parsed = parseEngineOutput(`
=> [SCORE] No hygiene score is computed: repository contents were not read.
---CATALYST_METRICS---
{ "measured": true, "healthScore": null, "scoreNote": "No hygiene score." }
    `);
    expect(parsed.measured).toBe(true);
    expect(parsed.healthScore).toBeNull();
    expect(parsed.scoreNote).toBe('No hygiene score.');
  });

  it('never invents a score for output that contains none', () => {
    const parsed = parseEngineOutput('Engine completed with no output.');
    expect(parsed.measured).toBe(false);
    expect(parsed.healthScore).toBeNull();
    expect(parsed.tableData).toEqual([]);
    expect(parsed.loadTime).toBeNull();
  });
});
