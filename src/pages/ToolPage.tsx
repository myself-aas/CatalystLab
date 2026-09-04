import { EngineInput } from '../components/common/EngineInput';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { RateLimitModal } from '../components/RateLimitModal';
import { EngineReportDashboard } from '../components/tool/EngineReportDashboard';
import { saveReport } from '../lib/firebase';
import { urlToDomainSlug } from '../utils/slugUtils';
import { getRateLimitStatus, recordAuditLaunch, getVisitorDeviceId } from '../utils/rateLimiter';
import type { EngineType } from '../types';
import {
 ExternalLink,
 CheckCircle2,
 ArrowLeft,
 ShieldCheck,
 FileText,
 Activity,
 Code,
 BookOpen,
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LinearCard } from '../components/ui/LinearCard';
import { authorizedFetch } from '../lib/authHeaders';
import { logger } from '../lib/logger';

interface ToolPageProps {
 engineType: EngineType;
}

export const ToolPage: React.FC<ToolPageProps> = ({ engineType }) => {
 const meta = ENGINES_MAP[engineType];
 const location = useLocation();
 const { user, isAdmin, login } = useAuth();

 const [targetUrl, setTargetUrl] = useState('');
 const [loading, setLoading] = useState(false);
 const [output, setOutput] = useState('');
 const [savedReportId, setSavedReportId] = useState<string | null>(null);
 const [copiedLink, setCopiedLink] = useState(false);
 const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
 const [rateLimitReason, setRateLimitReason] = useState<'limit_reached' | 'info'>('info');
 const [viewMode, setViewMode] = useState<'dashboard' | 'terminal'>('dashboard');

 const isRepoEngine = engineType === 'repo';
 const autoLaunchedRef = useRef(false);

 const normalizeUrl = (input: string): string => {
 let trimmed = input.trim();
 if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
 trimmed = 'https://' + trimmed;
 }
 return trimmed;
 };

 useEffect(() => {
 const searchParams = new URLSearchParams(location.search);
 const queryUrl = searchParams.get('url');
 if (queryUrl && queryUrl !== targetUrl) {
 setTargetUrl(queryUrl);
 if (!autoLaunchedRef.current && !output && !loading) {
 autoLaunchedRef.current = true;
 triggerAudit(queryUrl);
 }
 }
 }, [location.search, engineType]);

 const handleManualSave = async () => {
 if (!user || savedReportId || !output) return;
 try {
 const auditSessionId = `tool_${engineType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
 const visitorId = getVisitorDeviceId();
 const cleanUrl = isRepoEngine ? targetUrl.trim() : normalizeUrl(targetUrl.trim());
 const docId = await saveReport({
 url: cleanUrl,
 engine: engineType,
 title: `${meta.name}: ${cleanUrl}`,
 output,
 summary: `Automated ${meta.name} diagnostic run for ${cleanUrl}`,
 score: 92,
 userId: user.uid,
 userEmail: user.email || undefined,
 auditSessionId,
 visitorId,
 });
 setSavedReportId(docId);
 } catch (saveErr) {
 logger.error('Firestore manual save error:', saveErr);
 }
 };

 const triggerAudit = async (rawUrl: string) => {
 if (!rawUrl.trim()) return;

 const rateStatus = getRateLimitStatus(user, isAdmin);
 if (rateStatus.isSingleExceeded) {
 setRateLimitReason('limit_reached');
 setRateLimitModalOpen(true);
 return;
 }

 let cleanUrl = rawUrl.trim();
 if (!isRepoEngine) {
 cleanUrl = normalizeUrl(cleanUrl);
 setTargetUrl(cleanUrl);
 }

 setLoading(true);
 setOutput('');
 setSavedReportId(null);
 setViewMode('dashboard');

 recordAuditLaunch(user, isAdmin, 'single');
 const auditSessionId = `tool_${engineType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
 const visitorId = getVisitorDeviceId();

 try {
 const response = await authorizedFetch('/api/run-engine', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 url: cleanUrl,
 engine: engineType,
 userEmail: user?.email || undefined,
 userId: user?.uid || undefined,
 visitorId,
 auditSessionId,
 }),
 });
 const data = await response.json();

 if (response.status === 429 || data.rateLimitExceeded) {
 setRateLimitReason('limit_reached');
 setRateLimitModalOpen(true);
 }

 const finalOutput = data.output || (data.error ? `Error: ${data.error}` : 'No output returned.');
 setOutput(finalOutput);

 if (user && data.success) {
 try {
 const docId = await saveReport({
 url: cleanUrl,
 engine: engineType,
 title: `${meta.name}: ${cleanUrl}`,
 output: finalOutput,
 summary: `Automated ${meta.name} diagnostic run for ${cleanUrl}`,
 score: 92,
 userId: user.uid,
 userEmail: user.email || undefined,
 auditSessionId,
 visitorId,
 });
 setSavedReportId(docId);
 } catch (saveErr) {
 logger.error('Firestore auto-save error:', saveErr);
 }
 }
 } catch (err: unknown) {
 const message = err instanceof Error ? err.message : 'unknown';
 setOutput(`[!] Error: Network communication failure (${message}).`);
 } finally {
 setLoading(false);
 }
 };

 const handleSubmit = async (e?: React.FormEvent) => {
 if (e) e.preventDefault();
 triggerAudit(targetUrl);
 };

 const permalinkUrl = targetUrl
 ? `${window.location.origin}/reports/${urlToDomainSlug(targetUrl)}`
 : savedReportId
 ? `${window.location.origin}/reports/${savedReportId}`
 : '';

 const handleCopy = () => {
 if (!permalinkUrl) return;
 navigator.clipboard.writeText(permalinkUrl);
 setCopiedLink(true);
 setTimeout(() => setCopiedLink(false), 2000);
 };

 return (
 <div className="min-h-screen bg-transparent pb-20 font-sans text-foreground">
 <SEOHead
 title={`${meta.catalystName || meta.name} Catalyst`}
 description={meta.description}
 canonicalUrl={`https://www.catalystlab.tech/tool/${engineType}`}
 />
 <section className="relative overflow-hidden border-b border-border ds-section w-full">
 <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]"/>
 <div className="relative z-10 ds-page-shell text-center">
 <div className="mb-8 flex justify-end">
 <Link
 to={`/docs#${meta.docsAnchor || 'overview'}`}
 className="ds-card items-center gap-1.5 font-mono text-xs ds-muted ds-card-interactive p-4"
 >
 <BookOpen className="size-3.5 text-primary"/>
 <span>Engine docs</span>
 <ExternalLink className="size-3"/>
 </Link>
 </div>

 <div
 className="ds-card flex items-center p-4"
 style={{ color: meta.color, borderColor: `${meta.color}40` }}
 >
 <span aria-hidden="true"className="material-symbols-outlined text-3xl">
 {meta.icon}
 </span>
 </div>

 <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
 <span className="rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] uppercase tracking-widest ds-muted">
 {meta.sdlcPhase || `SDLC Phase ${meta.sdlcPhaseNumber}`}
 </span>
 <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary">
 <ShieldCheck className="size-3.5"/>
 Replaces {meta.departmentReplaced}
 </span>
 </div>

 <h1 className="text-gradient-linear text-3xl font-semibold tracking-tight sm:text-5xl">
 {meta.catalystName || `${meta.name} Catalyst`}
 </h1>
 <p className="mx-auto mt-3 max-w-3xl mx-auto text-sm leading-relaxed ds-muted sm:text-base">
 {meta.description}
 </p>

 <div className="mx-auto mt-8 max-w-3xl mx-auto text-left">
 <EngineInput
 value={targetUrl}
 onChange={setTargetUrl}
 onSubmit={handleSubmit}
 isLoading={loading}
 buttonText="Run Scan"
 loadingText="Scanning..."
 placeholder={
 isRepoEngine ? 'https://github.com/org/repo' : 'https://your-domain.com'
 }
 inputId="hero-audit-url-input"
 />
 </div>
 </div>
 </section>

 <RateLimitModal
 isOpen={rateLimitModalOpen}
 onClose={() => setRateLimitModalOpen(false)}
 reason={rateLimitReason}
 />

 <main className="ds-page-shell space-y-6 py-8 sm:px-6 lg:px-8">
 {savedReportId && (
 <LinearCard className="p-4 sm:p-5"lift={false}>
 <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
 <div className="flex items-start gap-3">
 <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary"/>
 <div>
 <h3 className="text-sm font-semibold text-foreground">Saved to your dashboard</h3>
 <p className="mt-0.5 text-xs ds-muted">
 Permalink:{' '}
 <a href={permalinkUrl} target="_blank"rel="noreferrer"className="text-primary hover:underline">
 {permalinkUrl}
 </a>
 </p>
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <button
 onClick={handleCopy}
 className="ds-card text-xs font-medium ds-card-interactive p-4"
 >
 {copiedLink ? 'Copied' : 'Copy link'}
 </button>
 <Link
 to={`/reports/${urlToDomainSlug(targetUrl)}`}
 className="inline-flex items-center gap-1 rounded-lg bg-primary py-1.5 text-xs font-medium text-primary-foreground shadow-linear-cta hover:bg-primary/90"
 >
 <FileText className="size-3"/>
 Read dossier
 </Link>
 </div>
 </div>
 </LinearCard>
 )}

 {(output || loading) && (
 <div className="flex gap-2 border-b border-border pb-2">
 <button
 onClick={() => setViewMode('dashboard')}
 className={`inline-flex items-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
 viewMode === 'dashboard'
 ? 'bg-primary text-primary-foreground shadow-linear-cta'
 : 'border border-border bg-card ds-muted hover:text-foreground'
 }`}
 >
 <Activity className="size-3.5"/>
 Executive dashboard
 </button>
 <button
 onClick={() => setViewMode('terminal')}
 className={`inline-flex items-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
 viewMode === 'terminal'
 ? 'bg-primary text-primary-foreground shadow-linear-cta'
 : 'border border-border bg-card ds-muted hover:text-foreground'
 }`}
 >
 <Code className="size-3.5"/>
 Raw terminal
 </button>
 </div>
 )}

 {viewMode === 'dashboard' && output && !loading && !output.startsWith('[!] Error') && (
 <EngineReportDashboard
 engineType={engineType}
 targetUrl={targetUrl}
 output={output}
 onRelaunch={() => handleSubmit()}
 onSave={handleManualSave}
 savedReportId={savedReportId}
 />
 )}

 {(viewMode === 'terminal' || loading || output.startsWith('[!] Error')) && (
 <div className="mt-4">
 <TerminalOutput
 title={`${meta.name} Console Output`}
 icon={meta.icon}
 engine={meta.id}
 output={output}
 loading={loading}
 statusText={`Executing ${meta.pythonScript} in Python runtime...`}
 maxHeight="max-h-[600px]"
 />
 </div>
 )}

 {!user && !loading && output && !output.startsWith('[!] Error') && (
 <LinearCard className="ds-page-shell p-5 text-center"lift={false}>
 <p className="text-sm ds-muted">
 <strong className="text-foreground">Want this in your history?</strong> Sign in to keep the dossier and permalink.
 </p>
 <button
 onClick={() => login()}
 className="mt-3 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-linear-cta hover:bg-primary/90"
 >
 Sign in with Google
 </button>
 </LinearCard>
 )}
 </main>
 </div>
 );
};

export default ToolPage;
