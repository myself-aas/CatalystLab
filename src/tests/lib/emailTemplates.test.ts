import { describe, it, expect } from 'vitest';
import { generateAnomalyAlertHtml, generateWeeklyReportHtml } from '@/lib/emailService';

const PAYLOAD = '<img src=x onerror=alert(1)>"\'';

describe('email templates', () => {
  it('escapes untrusted telemetry strings in the anomaly alert', () => {
    const html = generateAnomalyAlertHtml({
      domain: PAYLOAD,
      timestamp: PAYLOAD,
      metricName: PAYLOAD,
      currentValue: PAYLOAD,
      baselineValue: PAYLOAD,
      deviationPercentage: -42,
      recommendedAction: PAYLOAD,
      radarUrl: 'javascript:alert(1)',
    } as unknown as Parameters<typeof generateAnomalyAlertHtml>[0]);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;&quot;&#39;');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="#"');
  });

  it('keeps a valid https radar link', () => {
    const html = generateAnomalyAlertHtml({
      domain: 'example.com',
      timestamp: '2026-11-17T00:00:00Z',
      metricName: 'TTFB',
      currentValue: '900ms',
      baselineValue: '200ms',
      deviationPercentage: 350,
      recommendedAction: 'Check the origin.',
      radarUrl: 'https://www.catalystlab.tech/radar?d=example.com',
    } as unknown as Parameters<typeof generateAnomalyAlertHtml>[0]);
    expect(html).toContain('href="https://www.catalystlab.tech/radar?d=example.com"');
  });

  it('escapes traffic sources and domain in the weekly report and uses dark cards', () => {
    const html = generateWeeklyReportHtml({
      domain: PAYLOAD,
      startDate: '2026-11-10',
      endDate: '2026-11-16',
      uniqueVisitors: 10,
      totalPageviews: 20,
      bounceRate: 40,
      avgSessionDurationFormatted: '1m 2s',
      healthScore: 91,
      carbonEmissionsGrams: 0.2,
      complianceGrade: 'A',
      topSources: [{ source: PAYLOAD, count: 3, percentage: 30 }],
    } as unknown as Parameters<typeof generateWeeklyReportHtml>[0]);
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('#F3F4F6');
  });
});
