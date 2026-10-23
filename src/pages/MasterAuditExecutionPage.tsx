import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/common/SEOHead';
import { EngineInput } from '../components/common/EngineInput';
import { RateLimitModal } from '../components/RateLimitModal';
import { LinearCard } from '../components/ui/LinearCard';
import { TerminalOutput } from '../components/TerminalOutput';
import { ENGINES_MAP, ENGINE_ORDER } from '../data/engines';
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

/** The orchestrator's own order, shared with the hub and the dashboard. */
const MASTER_ENGINES: EngineType[] = [...ENGINE_ORDER];

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
 const failedCount = runs.filter((r) => r.status === 'error').length;
 const scoredCount = runs.filter((r) => r.status === 'complete' && r.score > 0).length;
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
 // An engine can answer 200 while its own log reports that the scan never
 // completed (TLS reset, DNS failure). That run has no score to report.
 const reportedFailure = /Failed to complete|\[!\] CRITICAL/i.test(output);
 const next: EngineRun = {
 id: engine,
 status: data.success === false || reportedFailure ? 'error' : 'complete',
 output,
 error: data.success === false ? data.error : reportedFailure ? 'The engine could not reach the target.' : undefined,
 score: data.success === false || reportedFailure ? 0 : parsed.healthScore,
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
 <div className="min-h-screen ds-page-top-hero bg-background text-foreground font-sans">
 <SEOHead
 title="Master Audit Orchestrator"
 description="Run all eight CatalystLab engines against one URL, engine by engine, and read the composite score."
 canonicalUrl="https://www.catalystlab.tech/master-audit"
 />

 <section className="w-full border-b border-border ds-section">
 <div className="ds-page-shell">
 <div className="mb-8 flex items-center justify-between">
 <Link to="/" className="ds-btn ds-btn-secondary text-sm">
 <ArrowLeft className="size-4 shrink-0"/>
 Back to home
 </Link>
 <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
 <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true"/>
 Eight engines, one report
 </span>
 </div>

 <div className="mx-auto max-w-3xl space-y-3 text-center">
 <h1 className="framer-hero-title text-foreground">Run all eight engines</h1>
 <p className="framer-body-text">
 Enter a domain and CatalystLab runs every engine against it, one after another. The
 composite score is the average of the engines that returned a score.
 </p>
 </div>

 <div className="mx-auto mt-8 max-w-3xl text-left">
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

 <main className="ds-page-shell space-y-6 ds-section">
 {(loading || completedCount > 0) && (
 <LinearCard className="p-5" lift={false}>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-2 text-sm text-foreground" role="status" aria-live="polite">
 <Activity className="size-4 text-foreground shrink-0" aria-hidden="true"/>
 {loading
 ? `Running engine ${Math.min(completedCount + 1, MASTER_ENGINES.length)} of ${MASTER_ENGINES.length}`
 : `${completedCount} of ${MASTER_ENGINES.length} engines finished${failedCount > 0 ? `, ${failedCount} failed` : ''}`}
 </div>
 {compositeScore !== null && (
 <div className="font-mono text-sm text-foreground">
 Composite score <span className="font-semibold">{compositeScore}</span>/100
 {scoredCount < MASTER_ENGINES.length && (
 <span className="ml-2 text-muted-foreground">
 (mean of {scoredCount} {scoredCount === 1 ? 'engine' : 'engines'})
 </span>
 )}
 </div>
 )}
 </div>
 <div
 className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
 role="progressbar"
 aria-label="Engines finished"
 aria-valuemin={0}
 aria-valuemax={MASTER_ENGINES.length}
 aria-valuenow={completedCount}
 >
 <div
 className="h-full rounded-full bg-foreground transition-[width] duration-300"
 style={{ width: `${progressPct}%` }}
 />
 </div>
 </LinearCard>
 )}

 {error && (
 <LinearCard className="flex items-start gap-2 p-4 text-sm" lift={false}>
 <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true"/>
 <div>
 <p className="font-medium text-foreground">The audit stopped early</p>
 <p className="mt-0.5 text-muted-foreground">
 {error} Nothing was saved. Check that the domain is publicly reachable, then run it again.
 </p>
 </div>
 </LinearCard>
 )}

 {savedReportId && (
 <LinearCard className="flex items-start gap-2 p-4 text-sm" lift={false}>
 <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true"/>
 <div>
 <p className="font-medium text-foreground">Saved to your account</p>
 <p className="mt-0.5 text-muted-foreground">
 Open it any time from <Link to={`/reports/${savedReportId}`} className="underline underline-offset-4">your reports</Link>.
 </p>
 </div>
 </LinearCard>
 )}

 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
 {runs.map((run) => {
 const meta = ENGINES_MAP[run.id];
 return (
 <LinearCard key={run.id} className="p-4"lift={false}>
 <div className="flex items-center justify-between gap-2">
 <span className="text-sm font-medium text-foreground">{meta?.catalystName || run.id}</span>
 {run.status === 'running' && <Loader2 className="size-3.5 animate-spin text-primary"/>}
 {run.status === 'complete' && <CheckCircle2 className="size-3.5 text-success"/>}
 {run.status === 'error' && <AlertCircle className="size-3.5 text-danger"/>}
 </div>
 <p className="mt-1 text-sm ds-muted">
 {run.status === 'queued' && 'Waiting'}
 {run.status === 'running' && 'Measuring…'}
 {run.status === 'complete' && (run.score > 0 ? `Score ${run.score}/100` : 'Finished, no score')}
 {run.status === 'error' && 'Failed'}
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
