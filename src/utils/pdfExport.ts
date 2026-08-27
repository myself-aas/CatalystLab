import type { AuditReport } from '../types';
import { parseTelemetryOutput, type ParsedTelemetryData } from './telemetryParser';

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
      score: report.score ?? parsed.overallScore,
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

  if (!parsed.security.hsts) {
    results.push({
      ruleId: 'CAT001-HSTS',
      level: 'error',
      message: { text: `Domain ${targetUrl} does not enforce Strict-Transport-Security (HSTS).` },
      locations: [{ physicalLocation: { artifactLocation: { uri: targetUrl } } }]
    });
  }

  if (!parsed.security.csp) {
    results.push({
      ruleId: 'CAT002-CSP',
      level: 'error',
      message: { text: `Domain ${targetUrl} lacks a valid Content-Security-Policy (CSP) header.` },
      locations: [{ physicalLocation: { artifactLocation: { uri: targetUrl } } }]
    });
  }

  if (!parsed.security.permissionsPolicy) {
    results.push({
      ruleId: 'CAT003-PERMISSIONS',
      level: 'warning',
      message: { text: `Domain ${targetUrl} lacks a modern Permissions-Policy header.` },
      locations: [{ physicalLocation: { artifactLocation: { uri: targetUrl } } }]
    });
  }

  if (parsed.accessibility.missingAltCount > 0) {
    results.push({
      ruleId: 'CAT004-WCAG-ALT',
      level: 'warning',
      message: { text: `Found ${parsed.accessibility.missingAltCount} image(s) missing alt text on ${targetUrl}.` },
      locations: [{ physicalLocation: { artifactLocation: { uri: targetUrl } } }]
    });
  }

  if (!parsed.aiReadiness.hasLlmsTxt) {
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
      ...(parsed.security.hsts ? [] : [{
        id: 'CAT-VULN-HSTS',
        source: { name: 'CatalystLab RiskProtease' },
        ratings: [{ score: 7.2, severity: 'medium', method: 'CVSSv31' }],
        description: 'Missing HTTP Strict Transport Security header exposes transport channel.'
      }]),
      ...(parsed.security.csp ? [] : [{
        id: 'CAT-VULN-CSP',
        source: { name: 'CatalystLab RiskProtease' },
        ratings: [{ score: 8.1, severity: 'high', method: 'CVSSv31' }],
        description: 'Missing Content-Security-Policy enables Cross-Site Scripting (XSS) vectors.'
      }])
    ],
    properties: [
      { name: 'catalystlab:overall_score', value: String(parsed.overallScore) },
      { name: 'catalystlab:health_ttfb_ms', value: String(parsed.health.ttfbMs) },
      { name: 'catalystlab:health_payload_kb', value: String(parsed.health.payloadKb) },
      { name: 'catalystlab:accessibility_grade', value: parsed.accessibility.complianceLevel },
      { name: 'catalystlab:ai_readiness_rag', value: parsed.aiReadiness.ragIndexability }
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
  const rows = [
    ['Vector / Dimension', 'Metric', 'Measured Value', 'Standard / Status', 'Weight Score'],
    ['Executive', 'Overall Score', `${parsed.overallScore}/100`, parsed.grade, `${parsed.overallScore}`],
    ['Core Health', 'TTFB (Time to First Byte)', `${parsed.health.ttfbMs} ms`, parsed.health.ttfbMs < 200 ? 'PASS' : 'WARN', `${parsed.health.score}`],
    ['Core Health', 'Payload Size', `${parsed.health.payloadKb} KB`, parsed.health.payloadKb < 1500 ? 'PASS' : 'WARN', `${parsed.health.score}`],
    ['Core Health', 'Compression', parsed.health.compression, parsed.health.compression !== 'None' ? 'PASS' : 'FAIL', `${parsed.health.score}`],
    ['OWASP Security', 'HSTS Header', parsed.security.hsts ? 'Enforced' : 'Missing', parsed.security.hsts ? 'PASS' : 'FAIL', `${parsed.security.score}`],
    ['OWASP Security', 'CSP Header', parsed.security.csp ? 'Enforced' : 'Missing', parsed.security.csp ? 'PASS' : 'FAIL', `${parsed.security.score}`],
    ['OWASP Security', 'SSL Days Left', `${parsed.security.sslDaysRemaining} days`, parsed.security.sslDaysRemaining > 30 ? 'PASS' : 'WARN', `${parsed.security.score}`],
    ['Accessibility', 'Alt Text Coverage', `${parsed.accessibility.altTextCoveragePct}%`, parsed.accessibility.complianceLevel, `${parsed.accessibility.score}`],
    ['Accessibility', 'Missing Alt Images', `${parsed.accessibility.missingAltCount} images`, parsed.accessibility.missingAltCount === 0 ? 'PASS' : 'WARN', `${parsed.accessibility.score}`],
    ['AI Readiness', 'llms.txt Declared', parsed.aiReadiness.hasLlmsTxt ? 'Yes' : 'No', parsed.aiReadiness.hasLlmsTxt ? 'PASS' : 'WARN', `${parsed.aiReadiness.score}`],
    ['AI Readiness', 'RAG Indexability', parsed.aiReadiness.ragIndexability, parsed.aiReadiness.ragIndexability === 'Highly Indexable' ? 'PASS' : 'WARN', `${parsed.aiReadiness.score}`]
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
