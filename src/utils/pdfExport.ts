import type { AuditReport } from '../types';
import { parseTelemetryOutput } from './telemetryParser';

/** Every exporter prints this instead of inventing a reading it does not have. */
const NOT_MEASURED = 'Not measured';

const show = (value: number | null | undefined, unit = ''): string =>
  value === null || value === undefined ? NOT_MEASURED : `${value}${unit}`;

const verdict = (value: boolean | null): string =>
  value === null ? NOT_MEASURED : value ? 'Present' : 'Missing';

/**
 * Native print dialog trigger for PDF reports
 */
export async function exportReportToPdf(elementId: string, filename: string = 'CatalystLab-Audit-Report.pdf'): Promise<void> {
  // Trigger browser's native print engine configured for dark/light PDF export
  window.print();
}

export async function exportAuditReportDataToPdf(report: AuditReport): Promise<void> {
  window.print();
}

/**
 * Triggers a client-side file download for generated text/blob payloads
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Raw machine-readable JSON telemetry export
 */
export function exportAuditReportToJson(report: AuditReport, customFilename?: string): void {
  const parsed = parseTelemetryOutput(report.output, report.url);
  const exportPayload = {
    platform: 'CatalystLab Multi-Dimensional Telemetry',
    version: '2.5.0',
    exportTimestamp: new Date().toISOString(),
    reportMeta: {
      id: report.id || `rep-${Date.now()}`,
      url: report.url,
      engine: report.engine,
      score: report.score ?? parsed.overallScore ?? null,
      createdAt: report.createdAt
    },
    telemetryMetrics: parsed,
    rawOutput: report.output
  };

  const filename = customFilename || `CatalystLab-Telemetry-${sanitizeUrlForFilename(report.url)}-${Date.now()}.json`;
  downloadFile(JSON.stringify(exportPayload, null, 2), filename, 'application/json');
}

/**
 * OASIS SARIF v2.1.0 Standard Export
 * Allows direct ingestion into GitHub Code Scanning, GitLab Security Dashboard, and Azure DevOps.
 */
export function exportAuditReportToSarif(report: AuditReport, customFilename?: string): void {
  const parsed = parseTelemetryOutput(report.output, report.url);
  const targetUrl = report.url || 'https://target-domain.io';

  const results: any[] = [];
  const rules: any[] = [
    {
      id: 'CAT001-HSTS',
      name: 'MissingHSTSHeader',
      shortDescription: { text: 'HTTP Strict Transport Security (HSTS) header is missing or misconfigured' },
      defaultConfiguration: { level: 'error' }
    },
    {
      id: 'CAT002-CSP',
      name: 'MissingContentSecurityPolicy',
      shortDescription: { text: 'Content Security Policy (CSP) header is absent, allowing potential XSS injections' },
      defaultConfiguration: { level: 'error' }
    },
    {
      id: 'CAT003-PERMISSIONS',
      name: 'MissingPermissionsPolicy',
      shortDescription: { text: 'Permissions-Policy header is missing, failing to restrict browser device APIs' },
      defaultConfiguration: { level: 'warning' }
    },
    {
      id: 'CAT004-WCAG-ALT',
      name: 'WCAGMissingAltText',
      shortDescription: { text: 'Image elements found without descriptive alt text attributes' },
      defaultConfiguration: { level: 'warning' }
    },
    {
      id: 'CAT005-LLMS-TXT',
      name: 'MissingLlmsTxtManifest',
      shortDescription: { text: 'Domain missing llms.txt AI crawler manifest for RAG indexability' },
      defaultConfiguration: { level: 'note' }
    }
  ];

  if (parsed.security?.hsts === false) {
    results.push({
      ruleId: 'CAT001-HSTS',
      level: 'error',
      message: { text: `Domain ${targetUrl} does not enforce Strict-Transport-Security (HSTS).` },
      locations: [{ physicalLocation: { artifactLocation: { uri: targetUrl } } }]
    });
  }

  if (parsed.security?.csp === false) {
    results.push({
      ruleId: 'CAT002-CSP',
      level: 'error',
      message: { text: `Domain ${targetUrl} lacks a valid Content-Security-Policy (CSP) header.` },
      locations: [{ physicalLocation: { artifactLocation: { uri: targetUrl } } }]
    });
  }

  if (parsed.security?.permissionsPolicy === false) {
    results.push({
      ruleId: 'CAT003-PERMISSIONS',
      level: 'warning',
      message: { text: `Domain ${targetUrl} lacks a modern Permissions-Policy header.` },
      locations: [{ physicalLocation: { artifactLocation: { uri: targetUrl } } }]
    });
  }

  if ((parsed.accessibility?.missingAltCount ?? 0) > 0) {
    results.push({
      ruleId: 'CAT004-WCAG-ALT',
      level: 'warning',
      message: { text: `Found ${parsed.accessibility?.missingAltCount ?? 0} image(s) missing alt text on ${targetUrl}.` },
      locations: [{ physicalLocation: { artifactLocation: { uri: targetUrl } } }]
    });
  }

  if (parsed.aiReadiness?.hasLlmsTxt === false) {
    results.push({
      ruleId: 'CAT005-LLMS-TXT',
      level: 'note',
      message: { text: `Domain ${targetUrl} has not declared /llms.txt for autonomous agent grounding.` },
      locations: [{ physicalLocation: { artifactLocation: { uri: `${targetUrl}/llms.txt` } } }]
    });
  }

  const sarifPayload = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'CatalystLab Telemetry & Security Engine',
            version: '2.5.0',
            informationUri: 'https://www.catalystlab.tech',
            rules
          }
        },
        results
      }
    ]
  };

  const filename = customFilename || `CatalystLab-SARIF-${sanitizeUrlForFilename(report.url)}-${Date.now()}.sarif`;
  downloadFile(JSON.stringify(sarifPayload, null, 2), filename, 'application/json');
}

/**
 * CycloneDX v1.5 JSON SBOM & Health Specification Export
 */
export function exportAuditReportToCycloneDx(report: AuditReport, customFilename?: string): void {
  const parsed = parseTelemetryOutput(report.output, report.url);
  const targetUrl = report.url || 'https://target-domain.io';

  const cycloneDxPayload = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${generateSimpleUuid()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [
        {
          vendor: 'CatalystLab Inc.',
          name: 'CatalystLab Telemetry Platform',
          version: '2.5.0'
        }
      ],
      component: {
        type: 'application',
        name: sanitizeUrlForFilename(targetUrl),
        version: '1.0.0',
        purl: `pkg:generic/${sanitizeUrlForFilename(targetUrl)}@1.0.0`
      }
    },
    vulnerabilities: [
      ...(parsed.security?.hsts !== false ? [] : [{
        id: 'CAT-VULN-HSTS',
        source: { name: 'CatalystLab RiskProtease' },
        ratings: [{ score: 7.2, severity: 'medium', method: 'CVSSv31' }],
        description: 'Missing HTTP Strict Transport Security header exposes transport channel.'
      }]),
      ...(parsed.security?.csp !== false ? [] : [{
        id: 'CAT-VULN-CSP',
        source: { name: 'CatalystLab RiskProtease' },
        ratings: [{ score: 8.1, severity: 'high', method: 'CVSSv31' }],
        description: 'Missing Content-Security-Policy enables Cross-Site Scripting (XSS) vectors.'
      }])
    ],
    properties: [
      { name: 'catalystlab:overall_score', value: show(parsed.overallScore) },
      { name: 'catalystlab:health_ttfb_ms', value: show(parsed.health?.ttfbMs) },
      { name: 'catalystlab:health_payload_kb', value: show(parsed.health?.payloadKb) },
      { name: 'catalystlab:accessibility_alt_text_pct', value: show(parsed.accessibility?.altTextCoveragePct) },
      { name: 'catalystlab:llms_txt', value: verdict(parsed.aiReadiness?.hasLlmsTxt ?? null) }
    ]
  };

  const filename = customFilename || `CatalystLab-CycloneDX-${sanitizeUrlForFilename(report.url)}-${Date.now()}.cdx.json`;
  downloadFile(JSON.stringify(cycloneDxPayload, null, 2), filename, 'application/json');
}

/**
 * Tabular CSV export of diagnostic telemetry
 */
export function exportAuditReportToCsv(report: AuditReport, customFilename?: string): void {
  const parsed = parseTelemetryOutput(report.output, report.url);
  const health = parsed.health;
  const security = parsed.security;
  const accessibility = parsed.accessibility;
  const ai = parsed.aiReadiness;

  const rows = [
    ['Vector / Dimension', 'Metric', 'Measured Value', 'Reading', 'Engine Score'],
    ['Executive', 'Overall score', show(parsed.overallScore, '/100'), parsed.grade ?? NOT_MEASURED, show(parsed.overallScore)],
    ['Core Health', 'TTFB (Time to First Byte)', show(health?.ttfbMs, ' ms'), health ? 'Measured' : NOT_MEASURED, show(health?.score)],
    ['Core Health', 'Payload size', show(health?.payloadKb, ' KB'), health ? 'Measured' : NOT_MEASURED, show(health?.score)],
    ['Core Health', 'Compression', health?.compression ?? NOT_MEASURED, health ? 'Measured' : NOT_MEASURED, show(health?.score)],
    ['OWASP Security', 'HSTS header', verdict(security?.hsts ?? null), security ? 'Measured' : NOT_MEASURED, show(security?.score)],
    ['OWASP Security', 'CSP header', verdict(security?.csp ?? null), security ? 'Measured' : NOT_MEASURED, show(security?.score)],
    ['OWASP Security', 'SSL days left', show(security?.sslDaysRemaining, ' days'), security ? 'Measured' : NOT_MEASURED, show(security?.score)],
    ['Accessibility', 'Alt text coverage', show(accessibility?.altTextCoveragePct, '%'), accessibility ? 'Measured' : NOT_MEASURED, ''],
    ['Accessibility', 'Images missing alt text', show(accessibility?.missingAltCount), accessibility ? 'Measured' : NOT_MEASURED, ''],
    ['AI Readiness', 'llms.txt declared', verdict(ai?.hasLlmsTxt ?? null), ai ? 'Measured' : NOT_MEASURED, show(ai?.score)],
    ['AI Readiness', 'Extracted words', show(ai?.wordCount), ai ? 'Measured' : NOT_MEASURED, show(ai?.score)]
  ];

  const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const filename = customFilename || `CatalystLab-Audit-${sanitizeUrlForFilename(report.url)}-${Date.now()}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

function sanitizeUrlForFilename(url: string = ''): string {
  return url.replace(/https?:\/\//i, '').replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 40) || 'domain';
}

function generateSimpleUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
