import React, { useState } from 'react';
import {
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  AlertCircle,
} from 'lucide-react';
import type { MasterTelemetryReport, DiagnosticEngineId } from '../../types/telemetry';
import { Skeleton, SkeletonTable } from '../skeleton';

export interface SideBySideDeltaMatrixProps {
  reportA?: MasterTelemetryReport | null;
  reportB?: MasterTelemetryReport | null;
  onCompare?: (urlA: string, urlB: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface DimensionReading {
  /** Human-readable measurement, when the engine actually returned one. */
  detail: string | null;
  /** Engine score, when the engine actually returned one. */
  score: number | null;
}

const DIMENSIONS: Array<{
  id: DiagnosticEngineId;
  name: string;
  metricLabel: string;
  read: (report?: MasterTelemetryReport | null) => DimensionReading;
}> = [
  {
    id: 'health',
    name: 'Health & Core Web Vitals',
    metricLabel: 'TTFB',
    read: (report) => {
      const engine = report?.engines?.health;
      const ttfb = (engine?.metrics as { ttfbMs?: number } | undefined)?.ttfbMs;
      return {
        detail: typeof ttfb === 'number' ? `${ttfb} ms TTFB` : null,
        score: typeof engine?.score === 'number' ? engine.score : null,
      };
    },
  },
  {
    id: 'ai_ready',
    name: 'AI & LLM readiness',
    metricLabel: 'llms.txt, RAG context',
    read: (report) => {
      const engine = report?.engines?.ai_ready;
      const rag = (engine?.metrics as { ragContextExtractionScore?: number } | undefined)?.ragContextExtractionScore;
      return {
        detail: typeof rag === 'number' ? `${rag}% RAG context` : null,
        score: typeof engine?.score === 'number' ? engine.score : null,
      };
    },
  },
  {
    id: 'latency',
    name: 'Global edge latency',
    metricLabel: 'Average across PoPs',
    read: (report) => {
      const engine = report?.engines?.latency;
      const avg = (engine?.metrics as { globalAvgLatencyMs?: number } | undefined)?.globalAvgLatencyMs;
      return {
        detail: typeof avg === 'number' ? `${avg} ms average` : null,
        score: typeof engine?.score === 'number' ? engine.score : null,
      };
    },
  },
  {
    id: 'eco',
    name: 'Carbon per page view',
    metricLabel: 'CO₂e',
    read: (report) => {
      const engine = report?.engines?.eco;
      const co2 = (engine?.metrics as { co2GramsPerPageview?: number } | undefined)?.co2GramsPerPageview;
      return {
        detail: typeof co2 === 'number' ? `${co2} g CO₂e` : null,
        score: typeof engine?.score === 'number' ? engine.score : null,
      };
    },
  },
  {
    id: 'compliance',
    name: 'Security & OWASP headers',
    metricLabel: 'Transport headers present',
    read: (report) => {
      const engine = report?.engines?.compliance;
      const headers = (engine?.metrics as { owaspHeaders?: Array<{ isPresent: boolean }> } | undefined)?.owaspHeaders;
      const present = headers?.filter((h) => h.isPresent).length;
      return {
        detail: typeof present === 'number' && headers ? `${present} of ${headers.length} headers` : null,
        score: typeof engine?.score === 'number' ? engine.score : null,
      };
    },
  },
  {
    id: 'migration',
    name: 'Frontend & migration',
    metricLabel: 'Detected stack',
    read: (report) => {
      const engine = report?.engines?.migration;
      const stack = (engine?.metrics as { detectedFrontend?: string } | undefined)?.detectedFrontend;
      return {
        detail: stack || null,
        score: typeof engine?.score === 'number' ? engine.score : null,
      };
    },
  },
  {
    id: 'ai_search',
    name: 'AI search & LLMO',
    metricLabel: 'AI synthesizability',
    read: (report) => {
      const engine = report?.engines?.ai_search;
      const score = (engine?.metrics as { aiSynthesizabilityScore?: number } | undefined)?.aiSynthesizabilityScore;
      return {
        detail: typeof score === 'number' ? `${score}% synthesizable` : null,
        score: typeof engine?.score === 'number' ? engine.score : null,
      };
    },
  },
  {
    id: 'repo',
    name: 'Repository hygiene',
    metricLabel: 'License & supply chain',
    read: (report) => {
      const engine = report?.engines?.repo;
      const license = (engine?.metrics as { licenseName?: string } | undefined)?.licenseName;
      return {
        detail: license || null,
        score: typeof engine?.score === 'number' ? engine.score : null,
      };
    },
  },
];

const scoreOf = (report?: MasterTelemetryReport | null): number | null =>
  typeof report?.overallScore === 'number' ? report.overallScore : null;

export const SideBySideDeltaMatrix: React.FC<SideBySideDeltaMatrixProps> = ({
  reportA,
  reportB,
  onCompare,
  isLoading = false,
  error = null,
}) => {
  const [urlAInput, setUrlAInput] = useState(reportA?.targetUrl || '');
  const [urlBInput, setUrlBInput] = useState(reportB?.targetUrl || '');

  const scoreA = scoreOf(reportA);
  const scoreB = scoreOf(reportB);
  const hasResult = scoreA !== null && scoreB !== null;
  const scoreDelta = hasResult ? (scoreA as number) - (scoreB as number) : null;
  const winner = !hasResult || scoreDelta === null
    ? null
    : scoreDelta > 0
      ? reportA?.targetUrl
      : scoreDelta < 0
        ? reportB?.targetUrl
        : null;

  const rows = DIMENSIONS.map((dim) => ({
    ...dim,
    a: dim.read(reportA),
    b: dim.read(reportB),
  })).filter((row) => row.a.score !== null || row.b.score !== null);

  const handleRunComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCompare && urlAInput.trim() && urlBInput.trim()) {
      onCompare(urlAInput.trim(), urlBInput.trim());
    }
  };

  const formatDelta = (delta: number) => `${delta > 0 ? '+' : ''}${delta} pts`;

  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <form onSubmit={handleRunComparison} className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <label htmlFor="compare-domain-a" className="mb-1.5 block text-sm font-medium text-foreground">
              First domain
            </label>
            <input
              id="compare-domain-a"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={urlAInput}
              onChange={(e) => setUrlAInput(e.target.value)}
              placeholder="example.com"
              className="ds-input w-full bg-background text-sm"
            />
          </div>

          <div className="hidden items-center justify-center pb-2 md:col-span-2 md:flex">
            <span className="font-mono text-xs text-muted-foreground" aria-hidden="true">vs</span>
          </div>

          <div className="md:col-span-5">
            <label htmlFor="compare-domain-b" className="mb-1.5 block text-sm font-medium text-foreground">
              Second domain
            </label>
            <input
              id="compare-domain-b"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={urlBInput}
              onChange={(e) => setUrlBInput(e.target.value)}
              placeholder="competitor.com"
              className="ds-input w-full bg-background text-sm"
            />
          </div>

          <div className="md:col-span-12 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !urlAInput.trim() || !urlBInput.trim()}
              className="ds-btn ds-btn-primary w-full text-sm disabled:opacity-50 md:w-auto"
            >
              <Zap className="size-4 shrink-0" aria-hidden="true" />
              <span>{isLoading ? 'Comparing…' : 'Compare domains'}</span>
            </button>
          </div>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          Compare runs the health engine against both domains. Open a dossier for the full
          eight-engine reading.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">Comparison failed</p>
            <p className="mt-0.5 text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6" role="status" aria-label="Comparing both domains">
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 md:flex-row">
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-36 rounded-xs" />
                <Skeleton className="h-6 w-48 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-20 rounded-lg" />
              <Skeleton className="h-14 w-20 rounded-lg" />
            </div>
          </div>
          <SkeletonTable rows={4} columns={4} />
        </div>
      ) : !hasResult ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="framer-card-title text-lg text-foreground">No comparison yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Enter two domains above and run the comparison. Scores come back in a few seconds,
            one health reading per domain.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 md:flex-row">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
                <Trophy className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Score difference</span>
                  <span className="rounded-md border border-border px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                    {scoreDelta === 0 ? 'Level' : formatDelta(scoreDelta as number)}
                  </span>
                </div>
                <h3 className="mt-0.5 text-base font-semibold text-foreground md:text-lg">
                  {winner ? <>Higher score: <span className="text-info">{winner}</span></> : 'Both domains score the same'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div className="rounded-lg border border-border bg-muted px-4 py-2 text-center">
                <div className="text-xs text-muted-foreground">First</div>
                <div className="text-xl font-bold text-foreground">{scoreA}</div>
              </div>
              <div className="font-bold text-muted-foreground">:</div>
              <div className="rounded-lg border border-border bg-muted px-4 py-2 text-center">
                <div className="text-xs text-muted-foreground">Second</div>
                <div className="text-xl font-bold text-foreground">{scoreB}</div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Measured engine scores for both domains</caption>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-medium">Engine</th>
                    <th scope="col" className="px-4 py-3 font-medium">{urlAInput || 'First domain'}</th>
                    <th scope="col" className="px-4 py-3 font-medium">{urlBInput || 'Second domain'}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => {
                    const delta = row.a.score !== null && row.b.score !== null ? row.a.score - row.b.score : null;
                    return (
                      <tr key={row.id}>
                        <th scope="row" className="px-4 py-3.5 text-left font-normal">
                          <div className="font-medium text-foreground">{row.name}</div>
                          <div className="text-xs text-muted-foreground">{row.metricLabel}</div>
                        </th>
                        <td className="px-4 py-3.5">
                          <Reading reading={row.a} />
                        </td>
                        <td className="px-4 py-3.5">
                          <Reading reading={row.b} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {delta === null ? (
                            <span className="font-mono text-xs text-muted-foreground">—</span>
                          ) : delta > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-xs font-semibold text-success">
                              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />+{delta}
                            </span>
                          ) : delta < 0 ? (
                            <span className="inline-flex items-center gap-1 rounded border border-danger/30 bg-danger/10 px-2 py-0.5 font-mono text-xs font-semibold text-danger">
                              <ArrowDownRight className="h-3 w-3" aria-hidden="true" />{delta}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                              <Minus className="h-3 w-3" aria-hidden="true" />equal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Reading: React.FC<{ reading: DimensionReading }> = ({ reading }) => (
  <div className="flex flex-wrap items-baseline gap-2">
    <span className="font-mono font-semibold text-foreground">
      {reading.score === null ? '—' : reading.score}
    </span>
    <span className="text-xs text-muted-foreground">
      {reading.detail ?? 'Not measured in compare'}
    </span>
  </div>
);
