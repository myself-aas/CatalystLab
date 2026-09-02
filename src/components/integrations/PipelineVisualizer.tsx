import React, { useState } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  GitMerge,
  RotateCcw,
  Sparkles,
  Lock,
  Terminal as TerminalIcon
} from 'lucide-react';
import { motion } from 'motion/react';

export interface PipelineStage {
  id: string;
  name: string;
  engine: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  score: number;
  threshold: number;
  durationMs: number;
  details: string;
}

export const PipelineVisualizer: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      id: 'ast-hygiene',
      name: 'GitLygase (AST Hygiene & CVEs)',
      engine: 'gitlygase',
      status: 'passed',
      score: 100,
      threshold: 90,
      durationMs: 42,
      details: '0 high/crit CVEs, 100% permissive licenses verified',
    },
    {
      id: 'vitalzyme',
      name: 'VitalZyme (CrUX Web Vitals Gate)',
      engine: 'vitalzyme',
      status: 'passed',
      score: 98,
      threshold: 85,
      durationMs: 840,
      details: 'LCP 840ms, CLS 0.012, INP 42ms (Zero CLS shift)',
    },
    {
      id: 'riskprotease',
      name: 'RiskProtease (CSP & Zero-Trust)',
      engine: 'riskprotease',
      status: 'passed',
      score: 96,
      threshold: 90,
      durationMs: 118,
      details: 'Strict CSP nonce detected, HSTS Preloaded (2y)',
    },
    {
      id: 'edgevmax',
      name: 'EdgeVmax (Global TTFB < 50ms)',
      engine: 'edgevmax',
      status: 'passed',
      score: 99,
      threshold: 80,
      durationMs: 18,
      details: 'Mean TTFB 18.4ms across 42 Anycast PoPs',
    },
  ]);

  const [prStatus, setPrStatus] = useState<'mergeable' | 'blocked'>('mergeable');

  const runFailingSimulation = () => {
    setIsSimulating(true);
    setStages(prev => prev.map(s => ({ ...s, status: 'running' })));

    setTimeout(() => {
      setStages([
        {
          id: 'ast-hygiene',
          name: 'GitLygase (AST Hygiene & CVEs)',
          engine: 'gitlygase',
          status: 'passed',
          score: 100,
          threshold: 90,
          durationMs: 45,
          details: '0 high/crit CVEs verified',
        },
        {
          id: 'vitalzyme',
          name: 'VitalZyme (CrUX Web Vitals Gate)',
          engine: 'vitalzyme',
          status: 'failed',
          score: 62,
          threshold: 85,
          durationMs: 3400,
          details: 'LCP 3,420ms > 2500ms limit! (Uncompressed hero banner)',
        },
        {
          id: 'riskprotease',
          name: 'RiskProtease (CSP & Zero-Trust)',
          engine: 'riskprotease',
          status: 'failed',
          score: 55,
          threshold: 90,
          durationMs: 110,
          details: 'Unsafe-inline script tag introduced without nonce!',
        },
        {
          id: 'edgevmax',
          name: 'EdgeVmax (Global TTFB < 50ms)',
          engine: 'edgevmax',
          status: 'passed',
          score: 98,
          threshold: 80,
          durationMs: 22,
          details: 'Mean TTFB 21.2ms',
        },
      ]);
      setPrStatus('blocked');
      setIsSimulating(false);
    }, 900);
  };

  const runPassingSimulation = () => {
    setIsSimulating(true);
    setStages(prev => prev.map(s => ({ ...s, status: 'running' })));

    setTimeout(() => {
      setStages([
        {
          id: 'ast-hygiene',
          name: 'GitLygase (AST Hygiene & CVEs)',
          engine: 'gitlygase',
          status: 'passed',
          score: 100,
          threshold: 90,
          durationMs: 42,
          details: '0 high/crit CVEs, 100% permissive licenses verified',
        },
        {
          id: 'vitalzyme',
          name: 'VitalZyme (CrUX Web Vitals Gate)',
          engine: 'vitalzyme',
          status: 'passed',
          score: 98,
          threshold: 85,
          durationMs: 840,
          details: 'LCP 840ms, CLS 0.012, INP 42ms',
        },
        {
          id: 'riskprotease',
          name: 'RiskProtease (CSP & Zero-Trust)',
          engine: 'riskprotease',
          status: 'passed',
          score: 96,
          threshold: 90,
          durationMs: 118,
          details: 'Strict CSP nonce detected, HSTS Preloaded (2y)',
        },
        {
          id: 'edgevmax',
          name: 'EdgeVmax (Global TTFB < 50ms)',
          engine: 'edgevmax',
          status: 'passed',
          score: 99,
          threshold: 80,
          durationMs: 18,
          details: 'Mean TTFB 18.4ms across 42 Anycast PoPs',
        },
      ]);
      setPrStatus('mergeable');
      setIsSimulating(false);
    }, 900);
  };

  return (
    <div className="rounded-2xl border border-border bg-[#080D1A] p-5 sm:p-6 shadow-2xl font-mono text-foreground space-y-6">
      {/* Visualizer Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#00F0FF] text-[11px] font-bold">
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>CI/CD PIPELINE MERGE-BLOCKER VISUALIZER</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-primary-foreground tracking-tight font-sans">
            Pull Request #412: <span className="font-mono text-[#00F0FF]">feat/optimize-edge-bundle</span>
          </h3>
        </div>

        {/* Simulation Triggers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runPassingSimulation}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[#00FF66] hover:bg-emerald-900/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Simulate Pass</span>
          </button>

          <button
            type="button"
            onClick={runFailingSimulation}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 hover:bg-rose-900/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Simulate Regression</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stage Check Runs */}
      <div className="space-y-2.5">
        {stages.map((stage) => {
          const isPassed = stage.status === 'passed';
          const isFailed = stage.status === 'failed';
          const isRunning = stage.status === 'running';

          return (
            <div 
              key={stage.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isFailed
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isPassed
                  ? 'bg-[#060912] border-border/80 hover:border-border'
                  : 'bg-[#0B101D] border-border animate-pulse'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {isPassed && <CheckCircle2 className="h-5 w-5 text-[#00FF66]" />}
                  {isFailed && <XCircle className="h-5 w-5 text-rose-500" />}
                  {isRunning && <span className="h-5 w-5 rounded-full border-2 border-[#00F0FF] border-t-transparent animate-spin block" />}
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-primary-foreground flex items-center gap-2">
                    <span>{stage.name}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">({stage.durationMs}ms)</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-sans">
                    {stage.details}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block uppercase">Gate Score / Req</span>
                  <span className={`text-xs font-bold ${isFailed ? 'text-rose-400' : 'text-[#00FF66]'}`}>
                    {stage.score}/100 <span className="text-muted-foreground font-normal">(min {stage.threshold})</span>
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isFailed
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-600/40'
                    : isPassed
                    ? 'bg-emerald-900/40 text-[#00FF66] border border-emerald-600/40'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stage.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub PR Bottom Merge Status Box */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        prStatus === 'mergeable'
          ? 'bg-emerald-950/20 border-emerald-500/40'
          : 'bg-rose-950/30 border-rose-500/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            prStatus === 'mergeable'
              ? 'bg-emerald-900/40 border-emerald-500/40 text-[#00FF66]'
              : 'bg-rose-900/40 border-rose-500/40 text-rose-400'
          }`}>
            {prStatus === 'mergeable' ? <GitMerge className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </div>

          <div>
            <div className="text-xs font-bold text-primary-foreground">
              {prStatus === 'mergeable' 
                ? 'All 4 Quality Gates Passed — PR is Mergeable' 
                : 'Merge Blocked: Quality Gate Regressions Detected'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 font-sans">
              {prStatus === 'mergeable'
                ? 'No Core Web Vitals or SecOps regressions found. CI exit code 0.'
                : 'Failing thresholds block automated production deploys until resolved.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={prStatus === 'blocked'}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            prStatus === 'mergeable'
              ? 'bg-[#00FF66] text-foreground hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.3)]'
              : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
          }`}
        >
          <GitMerge className="h-3.5 w-3.5" />
          <span>{prStatus === 'mergeable' ? 'Confirm Merge (Squash)' : 'Merge Blocked'}</span>
        </button>
      </div>
    </div>
  );
};
