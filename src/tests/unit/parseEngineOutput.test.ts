import { describe, expect, it } from 'vitest';
import { parseEngineOutput } from '../../utils/parseEngineOutput';

describe('parseEngineOutput', () => {
  it('extracts score, key/value rows, and chart points from engine logs', () => {
    const parsed = parseEngineOutput(`
Health Score: 91
TTFB: 118ms
HSTS: present
CSP: missing
    `);
    expect(parsed.healthScore).toBe(91);
    expect(parsed.tableData.length).toBeGreaterThanOrEqual(3);
    expect(parsed.chartData.some((d) => d.name.includes('TTFB'))).toBe(true);
    expect(parsed.tableData.find((r) => r.metric === 'CSP')?.status).toBe('Fail');
  });

  it('returns empty charts when there is no structured telemetry', () => {
    const parsed = parseEngineOutput('Engine completed with no output.');
    expect(parsed.chartData).toEqual([]);
    expect(parsed.tableData).toEqual([]);
  });
});
