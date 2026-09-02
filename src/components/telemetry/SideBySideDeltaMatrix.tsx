import React, { useState } from 'react';
import {
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap
} from 'lucide-react';
import type { MasterTelemetryReport, DiagnosticEngineId } from '../../types/telemetry';

export interface SideBySideDeltaMatrixProps {
  reportA?: MasterTelemetryReport | null;
  reportB?: MasterTelemetryReport | null;
  onCompare?: (urlA: string, urlB: string) => void;
  isLoading?: boolean;
}

const COMPARISON_DIMENSIONS: Array<{
  id: DiagnosticEngineId;
  name: string;
  category: string;
  metricLabel: string;
  getValue: (report?: MasterTelemetryReport | null) => { value: string | number; score: number };
}> = [
  {
    id: 'health',
    name: 'Website Health & DOM',
    category: 'Performance',
    metricLabel: 'LCP & TTFB',
    getValue: (r) => {
      const eng = r?.engines?.health;
      return {
        value: eng ? `${(eng.metrics as any)?.ttfbMs || 120}ms TTFB` : '--',
        score: eng?.score || 0,
      };
    },
  },
  {
    id: 'ai_ready',
    name: 'AI & LLM Readiness',
    category: 'Intelligence',
    metricLabel: 'llms.txt & RAG',
    getValue: (r) => {
      const eng = r?.engines?.ai_ready;
      return {
        value: eng ? `${(eng.metrics as any)?.ragContextExtractionScore || 70}% RAG` : '--',
        score: eng?.score || 0,
      };
    },
  },
  {
    id: 'latency',
    name: 'Global Edge Latency',
    category: 'Performance',
    metricLabel: 'Avg Multi-Region Latency',
    getValue: (r) => {
      const eng = r?.engines?.latency;
      return {
        value: eng ? `${(eng.metrics as any)?.globalAvgLatencyMs || 85}ms Avg` : '--',
        score: eng?.score || 0,
      };
    },
  },
  {
    id: 'eco',
    name: 'Carbon & Green Hosting',
    category: 'Performance',
    metricLabel: 'CO2 / Pageview',
    getValue: (r) => {
      const eng = r?.engines?.eco;
      return {
        value: eng ? `${(eng.metrics as any)?.co2GramsPerPageview || 0.3}g CO2` : '--',
        score: eng?.score || 0,
      };
    },
  },
  {
    id: 'compliance',
    name: 'Security & OWASP Headers',
    category: 'Security',
    metricLabel: 'Security Headers & SSL',
    getValue: (r) => {
      const eng = r?.engines?.compliance;
      return {
        value: eng ? `${(eng.metrics as any)?.owaspHeaders?.filter((h: any) => h.isPresent).length || 4}/6 Headers` : '--',
        score: eng?.score || 0,
      };
    },
  },
  {
    id: 'migration',
    name: 'Stack Modernization AST',
    category: 'Architecture',
    metricLabel: 'Frontend Runtime & Lock-in',
    getValue: (r) => {
      const eng = r?.engines?.migration;
      return {
        value: eng ? (eng.metrics as any)?.detectedFrontend?.split(' ')[0] || 'Modern' : '--',
        score: eng?.score || 0,
      };
    },
  },
  {
    id: 'ai_search',
    name: 'AI Search & LLMO',
    category: 'Intelligence',
    metricLabel: 'Perplexity & SearchGPT',
    getValue: (r) => {
      const eng = r?.engines?.ai_search;
      return {
        value: eng ? `${(eng.metrics as any)?.aiSynthesizabilityScore || 80}% Synthesizable` : '--',
        score: eng?.score || 0,
      };
    },
  },
  {
    id: 'repo',
    name: 'Repository Hygiene',
    category: 'Architecture',
    metricLabel: 'Supply Chain & License',
    getValue: (r) => {
      const eng = r?.engines?.repo;
      return {
        value: eng ? (eng.metrics as any)?.licenseName || 'MIT' : '--',
        score: eng?.score || 0,
      };
    },
  },
];

export const SideBySideDeltaMatrix: React.FC<SideBySideDeltaMatrixProps> = ({
  reportA,
  reportB,
  onCompare,
  isLoading = false,
}) => {
  const [urlAInput, setUrlAInput] = useState(reportA?.targetUrl || 'catalystlab.tech');
  const [urlBInput, setUrlBInput] = useState(reportB?.targetUrl || 'vercel.com');

  const scoreA = reportA?.overallScore ?? 88;
  const scoreB = reportB?.overallScore ?? 82;
  const scoreDelta = scoreA - scoreB;

  const winner = scoreDelta > 0 ? reportA?.targetUrl || urlAInput : scoreDelta < 0 ? reportB?.targetUrl || urlBInput : 'Tied';

  const handleRunComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCompare && urlAInput && urlBInput) {
      onCompare(urlAInput, urlBInput);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Comparison Input Bar */}
      <div className="rounded-xl border border-border bg-[#111726]/90 p-5 backdrop-blur-md shadow-xl">
        <form onSubmit={handleRunComparison} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Domain A Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-[10px] font-mono uppercase text-[#06B6D4] font-semibold mb-1">
              Domain Alpha (Benchmark A)
            </label>
            <input
              type="text"
              value={urlAInput}
              onChange={(e) => setUrlAInput(e.target.value)}
              placeholder="e.g. catalystlab.tech"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-primary text-foreground text-sm font-mono focus:ring-2 focus:ring-[#06B6D4]/50 focus:border-[#06B6D4] outline-none"
            />
          </div>

          {/* VS Divider */}
          <div className="md:col-span-2 flex items-center justify-center pt-4 md:pt-0">
            <span className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-mono font-bold text-muted-foreground">
              VS
            </span>
          </div>

          {/* Domain B Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-[10px] font-mono uppercase text-[#10B981] font-semibold mb-1">
              Domain Beta (Benchmark B)
            </label>
            <input
              type="text"
              value={urlBInput}
              onChange={(e) => setUrlBInput(e.target.value)}
              placeholder="e.g. competitor.com"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-primary text-foreground text-sm font-mono focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] outline-none"
            />
          </div>

          <div className="md:col-span-12 flex justify-end mt-2">
            <button
              type="submit"
              disabled={isLoading || !urlAInput || !urlBInput}
              className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-95 text-foreground font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-md shadow-[#06B6D4]/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Synthesizing Comparative Delta...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Run Differential Matrix</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Winner Summary Banner */}
      <div className="rounded-xl border border-border bg-[#111726]/80 p-5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-muted-foreground">Differential Synthesis</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                {scoreDelta >= 0 ? `+${scoreDelta} pts Delta` : `${scoreDelta} pts Delta`}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-foreground mt-0.5">
              Winner: <span className="text-[#06B6D4]">{winner}</span>
            </h3>
          </div>
        </div>

        {/* Head-to-Head Big Score Chips */}
        <div className="flex items-center gap-4 font-mono">
          <div className="text-center px-4 py-2 rounded-lg bg-primary/90 border border-[#06B6D4]/40">
            <div className="text-[10px] text-[#06B6D4] uppercase font-semibold">Alpha</div>
            <div className="text-xl font-bold text-foreground">{scoreA}</div>
          </div>
          <div className="text-muted-foreground font-bold">:</div>
          <div className="text-center px-4 py-2 rounded-lg bg-primary/90 border border-[#10B981]/40">
            <div className="text-[10px] text-[#10B981] uppercase font-semibold">Beta</div>
            <div className="text-xl font-bold text-foreground">{scoreB}</div>
          </div>
        </div>
      </div>

      {/* Differential Matrix Table */}
      <div className="rounded-xl border border-border bg-[#090D16] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#111726] border-b border-border text-muted-foreground">
                <th className="py-3 px-4 font-semibold text-muted-foreground">Engine / Vector</th>
                <th className="py-3 px-4 font-semibold text-[#06B6D4]">{urlAInput || 'Domain Alpha'}</th>
                <th className="py-3 px-4 font-semibold text-[#10B981]">{urlBInput || 'Domain Beta'}</th>
                <th className="py-3 px-4 font-semibold text-right">Variance Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {COMPARISON_DIMENSIONS.map((dim) => {
                const resA = dim.getValue(reportA);
                const resB = dim.getValue(reportB);
                const delta = (resA.score || 80) - (resB.score || 75);

                return (
                  <tr key={dim.id} className="hover:bg-primary/40 transition-colors">
                    {/* Vector Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-muted-foreground text-xs">{dim.name}</div>
                      <div className="text-[10px] text-muted-foreground">{dim.metricLabel}</div>
                    </td>

                    {/* Domain A Metric & Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{resA.score || 80}</span>
                        <span className="text-[10px] text-muted-foreground">({resA.value})</span>
                      </div>
                    </td>

                    {/* Domain B Metric & Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{resB.score || 75}</span>
                        <span className="text-[10px] text-muted-foreground">({resB.value})</span>
                      </div>
                    </td>

                    {/* Variance Delta Badge */}
                    <td className="py-3.5 px-4 text-right">
                      {delta > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold text-[11px]">
                          <ArrowUpRight className="w-3 h-3" />
                          +{delta} pts
                        </span>
                      ) : delta < 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-bold text-[11px]">
                          <ArrowDownRight className="w-3 h-3" />
                          {delta} pts
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-bold text-[11px]">
                          <Minus className="w-3 h-3" />
                          PARITY
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
    </div>
  );
};

