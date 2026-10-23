import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReport, saveReport } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { parseTelemetryOutput, type ParsedTelemetryData } from '../utils/telemetryParser';
import { urlToDomainSlug, slugToDisplayDomain, extractDomainFromUrl } from '../utils/slugUtils';
import { VitalsRadarOverview } from '../components/charts/VitalsRadarOverview';
import { DOMDepthChart } from '../components/charts/DOMDepthChart';
import { OWASPSecurityMatrixChart } from '../components/charts/OWASPSecurityMatrixChart';
import { WCAGAccessibilityGauge } from '../components/charts/WCAGAccessibilityGauge';
import { AIRadarChart } from '../components/charts/AIRadarChart';
import { EdgeLatencyRadarChart } from '../components/charts/EdgeLatencyRadarChart';
import { EcoCarbonComparisonChart } from '../components/charts/EcoCarbonComparisonChart';
import { LLMOCitationScorecard } from '../components/charts/LLMOCitationScorecard';
import { TerminalOutput } from '../components/TerminalOutput';
import type { AuditReport } from '../types';
import { 

 Printer,
 Share2, 
 RotateCw, 
 Check, 
 ExternalLink, 
 Calendar, 


 ArrowLeft,
 Terminal,




 AlertTriangle
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { authorizedFetch } from '../lib/authHeaders';
import { logger } from '../lib/logger';
import { DomainReportSkeleton } from '../components/skeleton';

/** Shown when the engine behind a section never ran for this report. */
const NotMeasured: React.FC<{ engine: string }> = ({ engine }) => {
 const meta = ENGINES_MAP[engine as keyof typeof ENGINES_MAP];
 return (
 <div className="rounded-xl border border-border bg-surface p-6">
 <p className="text-sm font-medium text-foreground">Not measured</p>
 <p className="mt-1 max-w-prose text-sm text-muted-foreground">
 This run has no {meta?.name?.toLowerCase() || engine} section: the engine either did not run or
 returned no readings. Run a new audit to collect it.
 </p>
 </div>
 );
};

export const DomainReportArticlePage: React.FC = () => {
 const { slug, id } = useParams<{ slug?: string; id?: string }>();
 const { user } = useAuth();

 const reportIdentifier = slug || id || '';
 
 const [report, setReport] = useState<AuditReport | null>(null);
 const [telemetry, setTelemetry] = useState<ParsedTelemetryData | null>(null);
 const [loading, setLoading] = useState(true);
 const [isAuditingLive, setIsAuditingLive] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [copied, setCopied] = useState(false);
 const [showRawTerminal, setShowRawTerminal] = useState(false);

 const displayDomain = report ? extractDomainFromUrl(report.url) : slugToDisplayDomain(reportIdentifier);
 const targetUrl = report?.url || (reportIdentifier.startsWith('http') ? reportIdentifier : `https://${displayDomain}`);
 const canonicalDomainSlug = urlToDomainSlug(targetUrl);

 const runLiveAuditForDomain = async (domainToScan: string) => {
 setIsAuditingLive(true);
 setLoading(true);
 setError(null);

 let cleanUrl = domainToScan.trim();
 if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
 cleanUrl = 'https://' + cleanUrl;
 }

 try {
 const engineKeys = Object.keys(ENGINES_MAP);
 const settledResponses = await Promise.allSettled(
 engineKeys.map(async (engineKey) => {
 try {
 const res = await authorizedFetch('/api/run-engine', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ url: cleanUrl, engine: engineKey })
 });
 const data = await res.json();
 return {
 engine: engineKey,
 output: data.output || (data.error ? `Error: ${data.error}` : 'No output')
 };
 } catch (e: any) {
 return {
 engine: engineKey,
 output: `Diagnostic error: ${e.message}`
 };
 }
 })
 );
 const responses = settledResponses.map(r => r.status === 'fulfilled' ? r.value : { engine: 'unknown', output: 'Task rejected' });

 const aggregatedOutput = responses
 .map(r => `=== Engine: ${ENGINES_MAP[r.engine]?.name || r.engine} ===\n${r.output}\n`)
 .join('\n');

 const parsed = parseTelemetryOutput(aggregatedOutput, cleanUrl);
 const newReport: AuditReport = {
 url: cleanUrl,
 engine: 'master-audit',
 output: aggregatedOutput,
 createdAt: Date.now(),
 ownerId: user?.uid || 'guest-telemetry',
 title: `Master Audit: ${extractDomainFromUrl(cleanUrl)}`,
 score: parsed.overallScore ?? undefined
 };

 setReport(newReport);
 setTelemetry(parsed);

 if (user) {
 try {
 const docId = await saveReport({
 url: cleanUrl,
 engine: 'master-audit',
 output: aggregatedOutput,
 title: `Master Audit: ${extractDomainFromUrl(cleanUrl)}`
 });
 newReport.id = docId;
 } catch (saveErr) {
 logger.error("Auto-saving generated report failed:", saveErr);
 }
 }
 } catch (err: any) {
 logger.error("Live audit execution failed:", err);
 setError(err.message || 'Failed to complete diagnostic scan for domain.');
 } finally {
 setIsAuditingLive(false);
 setLoading(false);
 }
 };

 useEffect(() => {
 const loadReportData = async () => {
 if (!reportIdentifier) {
 setError("Missing report domain or ID in URL.");
 setLoading(false);
 return;
 }

 setLoading(true);
 setError(null);

 try {
 const docData = await getReport(reportIdentifier);
 if (docData) {
 setReport(docData);
 setTelemetry(parseTelemetryOutput(docData.output, docData.url));
 setLoading(false);
 return;
 }

 // Owner decision (2026-10-19, server/routes/reports.ts): no fabricated
 // catalogues. An unknown slug shows the honest empty state and offers a real
 // audit instead of inventing a benchmark for the domain in the URL.
 setReport(null);
 setTelemetry(null);
 setError(`No dossier is stored for ${slugToDisplayDomain(reportIdentifier)} yet.`);
 setLoading(false);
 } catch (err: unknown) {
 logger.error("Failed to load audit article:", err);
 setReport(null);
 setTelemetry(null);
 setError('We could not load this dossier. It may have been deleted, or the link may be mistyped.');
 setLoading(false);
 }
 };

 loadReportData();
 }, [reportIdentifier, user]);

 const handleCopyLink = () => {
 const fullUrl = `${window.location.origin}/reports/${canonicalDomainSlug}`;
 navigator.clipboard.writeText(fullUrl);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 const handleExportPdf = () => {
 // No server-side PDF renderer exists, so this opens the browser print dialog
 // (where "Save as PDF" is available) rather than producing a file itself.
 window.print();
 };

 if (loading) {
 return <DomainReportSkeleton />;
 }

 if (error || !telemetry || !report) {
 return (
 <div className="ds-page-shell py-16">
 <div className="ds-card mx-auto max-w-xl p-8 text-center">
 <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
 <AlertTriangle className="size-6" aria-hidden="true" />
 </div>
 <SEOHead
 title="Report not found | CatalystLab"
 description="No stored audit exists at this address. Run an audit to create one."
 canonicalPath="/reports"
 robots="noindex, nofollow"
 />
 <h1 className="text-lg font-semibold text-foreground">No report stored for {displayDomain}</h1>
 <p className="mt-2 text-sm text-muted-foreground">
 {error || 'This domain has no saved audit under this link.'} Run an audit to create one; it
 will be stored under your account if you are signed in.
 </p>
 <div className="mt-6 flex flex-wrap justify-center gap-3">
 <button
 type="button"
 onClick={() => runLiveAuditForDomain(displayDomain)}
 className="ds-btn ds-btn-primary h-11 text-sm"
 >
 <RotateCw className="size-4" aria-hidden="true" />
 <span>Audit this domain now</span>
 </button>
 <Link to="/reports" className="ds-btn ds-btn-secondary h-11 text-sm">
 <ArrowLeft className="size-4" aria-hidden="true" />
 <span>All reports</span>
 </Link>
 </div>
 </div>
 </div>
 );
 }

 const formattedDate = report.createdAt
 ? new Date(report.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
 : 'Date not recorded';

 return (
 <article id="article-dossier-root" className="min-h-screen ds-page-top bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-mono">
 <SEOHead
 title={`Audit report for ${displayDomain}`}
 description={`The stored CatalystLab audit readings for ${displayDomain}, one section per engine.`}
 canonicalUrl={`https://www.catalystlab.tech/reports/${canonicalDomainSlug}`}
 />
 
 {/* Main Hero Header */}
 <header className="border-b border-border ds-section sm:px-6 lg:px-8">
 <div className="ds-page-shell space-y-4">
 <Link
 to="/reports"
 className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
 >
 <ArrowLeft className="size-4" aria-hidden="true" />
 <span>All reports</span>
 </Link>

 <h1 className="framer-hero-title text-foreground">{displayDomain}</h1>

 <p className="max-w-2xl framer-body-text">
 Engine-by-engine readings for this domain.{' '}
 {telemetry.overallScore !== null ? (
 <>
 Mean score of the {telemetry.scoredSections}{' '}
 {telemetry.scoredSections === 1 ? 'engine' : 'engines'} that returned one:{' '}
 <span className="font-mono text-foreground">{telemetry.overallScore}/100</span>, grade{' '}
 <span className="font-mono text-foreground">{telemetry.grade}</span>.
 </>
 ) : (
 'No engine returned a score for this run, so there is no composite score.'
 )}
 </p>

 {/* Metadata & Actions Bar */}
 <div className="flex flex-col justify-between gap-4 border-t border-border pt-4 lg:flex-row lg:items-center">
 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
 <span className="flex items-center gap-1.5">
 <Calendar className="size-3.5" aria-hidden="true" />
 {formattedDate}
 </span>
 <a
 href={targetUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1.5 text-foreground hover:underline"
 >
 <span>{displayDomain}</span>
 <ExternalLink className="size-3.5" aria-hidden="true" />
 </a>
 </div>

 {/* Actions */}
 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={handleExportPdf}
 className="ds-btn ds-btn-primary h-11 text-sm disabled:opacity-50"
 >
 <Printer className="size-4" aria-hidden="true" />
 <span>Print or save as PDF</span>
 </button>

 <button
 type="button"
 onClick={handleCopyLink}
 className="ds-btn ds-btn-secondary h-11 text-sm"
 >
 {copied ? <Check className="size-4 text-success" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
 <span>{copied ? 'Link copied' : 'Copy link'}</span>
 </button>

 <button
 type="button"
 onClick={() => runLiveAuditForDomain(displayDomain)}
 disabled={isAuditingLive}
 className="ds-btn ds-btn-secondary h-11 text-sm disabled:opacity-50"
 >
 <RotateCw className={`size-4 ${isAuditingLive ? 'animate-spin' : ''}`} aria-hidden="true" />
 <span>{isAuditingLive ? 'Auditing…' : 'Audit again'}</span>
 </button>
 </div>

 </div>

 </div>
 </header>

 <main className="ds-page-shell space-y-10 py-10">

 <section className="space-y-3">
 <h2 className="framer-card-title text-foreground">Composite score</h2>

 <VitalsRadarOverview telemetry={telemetry} targetDomain={displayDomain} />
 </section>

 {/* Section 2: DOM Depth & Rendering Tree */}
 <section className="space-y-3 pt-4 border-t border-border">
 <h2 className="framer-card-title text-foreground">Health: DOM, payload and blocking scripts</h2>

 {telemetry.health ? (
 <DOMDepthChart health={telemetry.health} />
 ) : (
 <NotMeasured engine="health" />
 )}
 </section>

 {/* Section 3: OWASP Top 10 Security Headers */}
 <section className="space-y-3 pt-4 border-t border-border">
 <h2 className="framer-card-title text-foreground">Security headers</h2>

 {telemetry.security ? (
 <OWASPSecurityMatrixChart security={telemetry.security} />
 ) : (
 <NotMeasured engine="compliance" />
 )}
 </section>

 {/* Section 4: WCAG 2.2 Accessibility */}
 <section className="space-y-3 pt-4 border-t border-border">
 <h2 className="framer-card-title text-foreground">Accessibility</h2>

 {telemetry.accessibility ? (
 <WCAGAccessibilityGauge accessibility={telemetry.accessibility} />
 ) : (
 <NotMeasured engine="compliance" />
 )}
 </section>

 {/* Section 5: AI Agent & LLM Crawler Readiness */}
 <section className="space-y-3 pt-4 border-t border-border">
 <h2 className="framer-card-title text-foreground">AI crawler readiness</h2>

 {telemetry.aiReadiness ? (
 <AIRadarChart aiReadiness={telemetry.aiReadiness} />
 ) : (
 <NotMeasured engine="ai_ready" />
 )}
 </section>

 {/* Section 6: Global Edge Latency */}
 <section className="space-y-3 pt-4 border-t border-border">
 <h2 className="framer-card-title text-foreground">Edge latency</h2>

 {telemetry.latency ? (
 <EdgeLatencyRadarChart latency={telemetry.latency} />
 ) : (
 <NotMeasured engine="latency" />
 )}
 </section>

 {/* Section 7: Sustainable Web Design Eco-Carbon Footprint */}
 <section className="space-y-3 pt-4 border-t border-border">
 <h2 className="framer-card-title text-foreground">Carbon footprint</h2>

 {telemetry.eco ? (
 <EcoCarbonComparisonChart eco={telemetry.eco} />
 ) : (
 <NotMeasured engine="eco" />
 )}
 </section>

 {/* Section 8: LLMO Citations */}
 <section className="space-y-3 pt-4 border-t border-border">
 <h2 className="framer-card-title text-foreground">LLM citation readiness</h2>

 {telemetry.llmo ? (
 <LLMOCitationScorecard llmo={telemetry.llmo} />
 ) : (
 <NotMeasured engine="llmo" />
 )}
 </section>

 {/* Raw engine output */}
 <section className="space-y-3 border-t border-border pt-4">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <h2 className="framer-card-title text-foreground">Raw engine output</h2>
 <button
 type="button"
 aria-expanded={showRawTerminal}
 onClick={() => setShowRawTerminal(!showRawTerminal)}
 className="ds-btn ds-btn-secondary h-11 text-sm"
 >
 <Terminal className="size-4" aria-hidden="true" />
 <span>{showRawTerminal ? 'Hide output' : 'Show output'}</span>
 </button>
 </div>
 <p className="text-sm text-muted-foreground">
 Exactly what the engines printed for this run, so every chart above can be checked against it.
 </p>

 {showRawTerminal && (
 <TerminalOutput
 title={`Engine output: ${displayDomain}`}
 icon="bolt"
 output={report.output}
 maxHeight="max-h-[600px]"
 />
 )}
 </section>

 </main>
 </article>
 );
};

export default DomainReportArticlePage;
