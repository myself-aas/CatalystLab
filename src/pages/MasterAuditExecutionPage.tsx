import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/common/SEOHead';
import { EngineInput } from '../components/common/EngineInput';
import { RateLimitModal } from '../components/RateLimitModal';
import { LinearCard } from '../components/ui/LinearCard';
import { TerminalOutput } from '../components/TerminalOutput';
import { ENGINES_MAP } from '../data/engines';
import { authorizedFetch } from '../lib/authHeaders';
import { saveReport } from '../lib/firebase';
import { logger } from '../lib/logger';
import { parseEngineOutput } from '../utils/parseEngineOutput';
import { getRateLimitStatus, recordAuditLaunch, getVisitorDeviceId } from '../utils/rateLimiter';
import type { EngineType } from '../types';
import {
  Activity,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

const MASTER_ENGINES: EngineType[] = [
  'health',
  'compliance',
  'ai_ready',
  'latency',
  'eco',
  'migration',
  'llmo',
  'repo',
];

type EngineRunStatus = 'queued' | 'running' | 'complete' | 'error';

interface EngineRun {
  id: EngineType;
  status: EngineRunStatus;
  output: string;
  error?: string;
  score: number;
}

function emptyRuns(): EngineRun[] {
  return MASTER_ENGINES.map((id) => ({
    id,
    status: 'queued',
    output: '',
    score: 0,
  }));
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export const MasterAuditExecutionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const queryUrl = searchParams.get('url') || '';

  const [targetUrl, setTargetUrl] = useState(queryUrl);
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<EngineRun[]>(emptyRuns);
  const [compositeScore, setCompositeScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const autoLaunchedRef = useRef(false);

  const completedCount = runs.filter((r) => r.status === 'complete' || r.status === 'error').length;
  const runningEngine = runs.find((r) => r.status === 'running');

  const updateRun = (id: EngineType, patch: Partial<EngineRun>) => {
    setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const triggerAudit = async (rawUrl: string) => {
    const cleanUrl = normalizeUrl(rawUrl);
    if (!cleanUrl) return;

    const rateStatus = getRateLimitStatus(user, isAdmin);
    if (rateStatus.isMasterExceeded) {
      setRateLimitModalOpen(true);
      return;
    }

    setTargetUrl(cleanUrl);
    setSearchParams({ url: cleanUrl }, { replace: true });
    setLoading(true);
    setError(null);
    setSavedReportId(null);
    setCompositeScore(null);
    setRuns(emptyRuns());

    recordAuditLaunch(user, isAdmin, 'master');
    const auditSessionId = `master_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const visitorId = getVisitorDeviceId();
    const collected: EngineRun[] = emptyRuns();

    try {
      for (const engine of MASTER_ENGINES) {
        updateRun(engine, { status: 'running' });
        try {
          const response = await authorizedFetch('/api/run-engine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: cleanUrl,
              engine,
              userEmail: user?.email || undefined,
              userId: user?.uid || undefined,
              visitorId,
              auditSessionId,
            }),
          });
          const data = await response.json();
          if (response.status === 429 || data.rateLimitExceeded) {
            setRateLimitModalOpen(true);
            updateRun(engine, { status: 'error', error: 'Rate limit exceeded' });
            break;
          }
          const output = String(data.output || data.error || 'No output returned.');
          const parsed = parseEngineOutput(output);
          const next: EngineRun = {
            id: engine,
            status: data.success === false ? 'error' : 'complete',
            output,
            error: data.success === false ? data.error : undefined,
            score: parsed.healthScore,
          };
          collected[MASTER_ENGINES.indexOf(engine)] = next;
          updateRun(engine, next);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Network failure';
          const failed: EngineRun = {
            id: engine,
            status: 'error',
            output: '',
            error: message,
            score: 0,
          };
          collected[MASTER_ENGINES.indexOf(engine)] = failed;
          updateRun(engine, failed);
        }
      }

      const scored = collected.filter((r) => r.status === 'complete' && r.score > 0);
      const avg = scored.length
        ? Math.round(scored.reduce((acc, r) => acc + r.score, 0) / scored.length)
        : null;
      setCompositeScore(avg);

      const combinedOutput = collected
        .map((r) => {
          const meta = ENGINES_MAP[r.id];
          return `===== ${meta?.catalystName || r.id} (${r.status}) =====\n${r.output || r.error || ''}`;
        })
        .join('\n\n');

      if (user && scored.length > 0) {
        try {
          const docId = await saveReport({
            url: cleanUrl,
            engine: 'master-audit',
            title: `Master Audit: ${cleanUrl}`,
            output: combinedOutput,
            summary: `8-engine master audit for ${cleanUrl}`,
            score: avg ?? undefined,
            userId: user.uid,
            userEmail: user.email || undefined,
            auditSessionId,
            visitorId,
          });
          setSavedReportId(docId);
        } catch (saveErr) {
          logger.error('Master audit save failed:', saveErr);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Master audit failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryUrl && !autoLaunchedRef.current) {
      autoLaunchedRef.current = true;
      triggerAudit(queryUrl);
    }
  }, [queryUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAudit(targetUrl);
  };

  const progressPct = Math.round((completedCount / MASTER_ENGINES.length) * 100);

  return (
    <div className="min-h-screen bg-transparent pb-20 font-sans text-[#EDEDEF]">
      <SEOHead
        title="Master Audit Orchestrator"
        description="Run all eight CatalystLab diagnostic engines against a target URL and review the composite telemetry dossier."
        canonicalUrl="https://www.catalystlab.tech/master-audit"
      />

      <section className="relative overflow-hidden border-b border-white/[0.06] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#5E6AD2]/15 blur-[140px]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-[#8A8F98] transition-colors hover:text-[#EDEDEF]"
            >
              <ArrowLeft className="size-3.5" />
              Back to home
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 px-3 py-1 font-mono text-[11px] text-[#6872D9]">
              <ShieldCheck className="size-3.5" />
              8-engine orchestrator
            </span>
          </div>

          <h1 className="text-gradient-linear text-3xl font-semibold tracking-tight sm:text-5xl">
            Master Audit
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#8A8F98] sm:text-base">
            Dispatch every Catalyst sequentially through the same engine runtime as single-tool scans.
            Composite score is the mean of completed engines.
          </p>

          <div className="mx-auto mt-8 max-w-xl text-left">
            <EngineInput
              value={targetUrl}
              onChange={setTargetUrl}
              onSubmit={handleSubmit}
              isLoading={loading}
              buttonText="Run master audit"
              loadingText={runningEngine ? `Scanning ${ENGINES_MAP[runningEngine.id]?.name || runningEngine.id}…` : 'Orchestrating…'}
              placeholder="https://your-domain.com"
              inputId="master-audit-url-input"
            />
          </div>
        </div>
      </section>

      <RateLimitModal
        isOpen={rateLimitModalOpen}
        onClose={() => setRateLimitModalOpen(false)}
        reason="limit_reached"
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {(loading || completedCount > 0) && (
          <LinearCard className="p-5" lift={false}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-[#EDEDEF]">
                <Activity className="size-4 text-[#5E6AD2]" />
                {loading
                  ? `Engine ${Math.min(completedCount + 1, MASTER_ENGINES.length)} of ${MASTER_ENGINES.length}`
                  : `${completedCount} of ${MASTER_ENGINES.length} engines finished`}
              </div>
              {compositeScore !== null && (
                <div className="font-mono text-sm text-[#6872D9]">
                  Composite {compositeScore}/100
                </div>
              )}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#5E6AD2] transition-all"
                style={{ width: `${loading ? Math.max(progressPct, 8) : progressPct}%` }}
              />
            </div>
          </LinearCard>
        )}

        {error && (
          <LinearCard className="flex items-start gap-2 p-4 text-sm text-rose-300" lift={false}>
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </LinearCard>
        )}

        {savedReportId && (
          <LinearCard className="flex items-center gap-2 p-4 text-sm text-[#8A8F98]" lift={false}>
            <CheckCircle2 className="size-4 text-[#5E6AD2]" />
            Saved to your dashboard as report {savedReportId}.
          </LinearCard>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {runs.map((run) => {
            const meta = ENGINES_MAP[run.id];
            return (
              <LinearCard key={run.id} className="p-4" lift={false}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[#EDEDEF]">{meta?.catalystName || run.id}</span>
                  {run.status === 'running' && <Loader2 className="size-3.5 animate-spin text-[#5E6AD2]" />}
                  {run.status === 'complete' && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                  {run.status === 'error' && <AlertCircle className="size-3.5 text-rose-400" />}
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#8A8F98]">
                  {run.status}
                  {run.status === 'complete' ? ` · ${run.score}/100` : ''}
                </p>
              </LinearCard>
            );
          })}
        </div>

        {runs
          .filter((r) => r.output)
          .map((run) => (
            <TerminalOutput
              key={run.id}
              title={`${ENGINES_MAP[run.id]?.name || run.id} console`}
              icon={ENGINES_MAP[run.id]?.icon}
              engine={run.id}
              output={run.output}
              loading={run.status === 'running'}
              statusText={run.error || `python ${ENGINES_MAP[run.id]?.pythonScript || run.id}`}
              maxHeight="max-h-[280px]"
            />
          ))}
      </main>
    </div>
  );
};

export default MasterAuditExecutionPage;
