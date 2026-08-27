import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportReportToPdf,
  exportAuditReportDataToPdf,
  exportAuditReportToJson,
  exportAuditReportToSarif,
  exportAuditReportToCycloneDx,
  exportAuditReportToCsv
} from '../utils/pdfExport';
import type { AuditReport } from '../types';

describe('Export Utilities (SARIF, CycloneDX, CSV, JSON, PDF)', () => {
  let createdBlob: any = null;
  let clickCount = 0;

  beforeEach(() => {
    createdBlob = null;
    clickCount = 0;

    global.URL.createObjectURL = vi.fn((blob: any) => {
      createdBlob = blob;
      return 'blob:mock-url';
    });
    global.URL.revokeObjectURL = vi.fn();
    window.print = vi.fn();

    // Mock HTMLAnchorElement click
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      clickCount++;
    });
  });

  const sampleReport: AuditReport = {
    id: 'rep-test-123',
    url: 'https://catalystlab.tech',
    engine: 'health',
    output: `[*] Core Health Probe:
  Overall Score: 94/100
  TTFB: 42 ms
  Payload: 840 KB
  HSTS: ENABLED
  CSP: ENABLED
  Alt Coverage: 100%
  llms.txt: FOUND`,
    createdAt: Date.now(),
    ownerId: 'test-user',
    score: 94
  };

  it('triggers native print for PDF exports', async () => {
    await exportReportToPdf('container-id');
    expect(window.print).toHaveBeenCalled();

    await exportAuditReportDataToPdf(sampleReport);
    expect(window.print).toHaveBeenCalledTimes(2);
  });

  it('exports valid machine-readable JSON telemetry', () => {
    exportAuditReportToJson(sampleReport);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickCount).toBe(1);
  });

  it('exports valid OASIS SARIF v2.1.0 JSON with security rules', () => {
    exportAuditReportToSarif(sampleReport);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickCount).toBe(1);
  });

  it('exports CycloneDX v1.5 SBOM payload', () => {
    exportAuditReportToCycloneDx(sampleReport);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickCount).toBe(1);
  });

  it('exports tabular CSV metrics', () => {
    exportAuditReportToCsv(sampleReport);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickCount).toBe(1);
  });
});
