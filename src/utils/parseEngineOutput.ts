/**
 * Reads an engine log.
 *
 * The parser only reports numbers the engine actually printed. When the log
 * says the scan never finished, `measured` is false and `healthScore` /
 * `loadTime` stay null — callers must show "Not measured" rather than a
 * placeholder score.
 */

export type MetricStatus = 'Pass' | 'Fail' | 'Warn' | 'Info';

export interface ParsedMetricRow {
  metric: string;
  status: MetricStatus;
  value: string;
}

export interface ParsedEngineTelemetry {
  measured: boolean;
  healthScore: number | null;
  scoreNote: string | null;
  loadTime: number | null;
  tableData: ParsedMetricRow[];
  issues: { critical: number; warning: number; info: number };
  failures: string[];
  warnings: string[];
  passCount: number;
}

const METRICS_MARKER = '---CATALYST_METRICS---';

interface MetricsBlock {
  measured?: boolean;
  healthScore?: number | null;
  scoreNote?: string;
  loadTime?: number;
}

const SCORE_RE = /([A-Z][A-Z ]*?)SCORE\s*[:=]\s*(\d{1,3})\s*\/\s*100/g;
const LOAD_TIME_PATTERNS = [
  /Time To First Byte \(TTFB proxy\):\s*(\d+)\s*ms/i,
  /Origin TTFB:\s*(\d+)\s*ms/i,
  /Local Origin TTFB:\s*(\d+)\s*ms/i,
  /TTFB:\s*(\d+)\s*ms/i,
];

function splitMetrics(output: string): { log: string; metrics: MetricsBlock | null } {
  const index = output.lastIndexOf(METRICS_MARKER);
  if (index === -1) return { log: output, metrics: null };
  const raw = output.slice(index + METRICS_MARKER.length).trim();
  const log = output.slice(0, index);
  try {
    const parsed = JSON.parse(raw);
    return { log, metrics: parsed && typeof parsed === 'object' ? (parsed as MetricsBlock) : null };
  } catch {
    return { log, metrics: null };
  }
}

function statusOf(line: string): MetricStatus | null {
  if (/^\[-\]/.test(line)) return 'Fail';
  if (/^\[\+\]/.test(line)) return 'Pass';
  if (/^\[~\]/.test(line)) return 'Warn';
  if (/^\[!\]/.test(line)) return 'Fail';
  if (/^\[[>*]\]/.test(line)) return 'Info';
  return null;
}

/** Strips the engine's ASCII markers so the table reads as a sentence. */
function cleanLine(line: string): string {
  return line
    .replace(/^[>\s]*/, '')
    .replace(/^\[[+\-~!*>]\]\s*/, '')
    .replace(/^(PASS|FAIL|WARNING|WARN|CRITICAL|OK)\s*[:\-]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function rowFromLine(line: string, status: MetricStatus): ParsedMetricRow {
  const text = cleanLine(line).replace(/^=>\s*/, '');
  const separator = text.indexOf(':');
  if (separator === -1) {
    return { metric: text, status, value: status === 'Fail' ? 'Failed' : status === 'Warn' ? 'Warning' : status === 'Pass' ? 'Passed' : '—' };
  }
  return {
    metric: text.slice(0, separator).trim(),
    status,
    value: text.slice(separator + 1).trim(),
  };
}

export function parseEngineOutput(output: string): ParsedEngineTelemetry {
  const { log, metrics } = splitMetrics(output || '');
  const lines = log.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const tableData: ParsedMetricRow[] = [];
  const failures: string[] = [];
  const warnings: string[] = [];
  let passCount = 0;

  for (const line of lines) {
    const status = statusOf(line);
    if (!status) continue;

    if (status === 'Fail') {
      const text = cleanLine(line);
      if (text && !failures.includes(text)) failures.push(text);
    } else if (status === 'Warn') {
      const text = cleanLine(line);
      if (text && !warnings.includes(text)) warnings.push(text);
    } else if (status === 'Pass') {
      passCount += 1;
    }

    // The section headers ([*] 1. ...) are structure, not readings.
    if (/^\[\*\]/.test(line)) continue;
    tableData.push(rowFromLine(line, status));
  }

  // Prefer the machine-readable block; fall back to the score the engine printed.
  let healthScore: number | null = null;
  if (metrics && metrics.measured && typeof metrics.healthScore === 'number') {
    healthScore = Math.max(0, Math.min(100, Math.round(metrics.healthScore)));
  } else if (!metrics) {
    const scores = Array.from(log.matchAll(SCORE_RE));
    const last = scores[scores.length - 1];
    if (last) healthScore = Math.max(0, Math.min(100, Number(last[2])));
  }

  const measured = metrics ? metrics.measured !== false : healthScore !== null;

  let loadTime: number | null = null;
  if (metrics && typeof metrics.loadTime === 'number') {
    loadTime = Math.round(metrics.loadTime);
  } else {
    for (const pattern of LOAD_TIME_PATTERNS) {
      const match = log.match(pattern);
      if (match) {
        loadTime = Number(match[1]);
        break;
      }
    }
  }

  return {
    measured,
    healthScore,
    scoreNote: metrics?.scoreNote ?? null,
    loadTime,
    tableData,
    issues: { critical: failures.length, warning: warnings.length, info: passCount },
    failures,
    warnings,
    passCount,
  };
}
