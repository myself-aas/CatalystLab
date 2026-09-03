export interface ParsedMetricRow {
  metric: string;
  status: 'Pass' | 'Fail';
  value: string;
}

export interface ParsedEngineTelemetry {
  healthScore: number;
  tableData: ParsedMetricRow[];
  chartData: { name: string; value: number }[];
  issues: { critical: number; warning: number; info: number };
  loadTime: number;
}

const SCORE_RE =
  /(?:composite\s*)?(?:health\s*)?(?:score|index|grade)\s*[:=]\s*(\d{1,3})/i;
const KV_RE =
  /^[-*•]?\s*([A-Za-z][A-Za-z0-9 _/%().-]{1,48})\s*[:=]\s*(.+)$/;
const MS_RE = /(\d+(?:\.\d+)?)\s*ms\b/i;

function inferStatus(value: string): 'Pass' | 'Fail' {
  if (/fail|error|missing|critical|denied|invalid|absent/i.test(value)) return 'Fail';
  return 'Pass';
}

export function parseEngineOutput(output: string): ParsedEngineTelemetry {
  const text = output || '';
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const scoreMatch = text.match(SCORE_RE);
  let healthScore = scoreMatch ? Math.min(100, Number(scoreMatch[1])) : NaN;

  const tableData: ParsedMetricRow[] = [];
  const chartData: { name: string; value: number }[] = [];
  let loadTime = 350;
  let critical = 0;
  let warning = 0;
  let info = 0;

  for (const line of lines) {
    const kv = line.match(KV_RE);
    if (!kv) {
      if (/critical/i.test(line)) critical += 1;
      else if (/warn/i.test(line)) warning += 1;
      continue;
    }
    const metric = kv[1].trim();
    const value = kv[2].trim().replace(/[,;]+$/, '');
    const status = inferStatus(value);
    tableData.push({ metric, status, value });
    if (status === 'Fail') critical += 1;
    else info += 1;

    const num = parseFloat(value.replace(/[^0-9.+-]/g, ''));
    if (!Number.isNaN(num) && chartData.length < 8) {
      chartData.push({ name: metric.slice(0, 18), value: num });
    }

    const ms = line.match(MS_RE);
    if (ms) loadTime = Math.round(Number(ms[1]));
  }

  if (Number.isNaN(healthScore)) {
    const fails = tableData.filter((r) => r.status === 'Fail').length;
    healthScore = tableData.length
      ? Math.max(40, 100 - fails * 8)
      : text.length > 80
        ? 82
        : 0;
  }

  return {
    healthScore,
    tableData,
    chartData,
    issues: { critical, warning, info },
    loadTime,
  };
}
