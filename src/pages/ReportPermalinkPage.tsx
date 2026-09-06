import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getReport } from '../lib/firebase';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { exportReportToPdf } from '../utils/pdfExport';
import type { AuditReport } from '../types';
import { 
 Download, 
 Share2, 
 ArrowLeft, 
 Calendar, 
 RotateCw, 
 Check, 
 ShieldCheck,
 AlertCircle,
 Printer
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { logger } from '../lib/logger';
import { ReportPermalinkSkeleton } from '../components/skeleton';

export const ReportPermalinkPage: React.FC = () => {
 const { id: paramId } = useParams<{ id: string }>();
 const [searchParams] = useSearchParams();
 const reportId = paramId || searchParams.get('id');

 const [report, setReport] = useState<AuditReport | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [copied, setCopied] = useState(false);
 const [isExportingPdf, setIsExportingPdf] = useState(false);

 useEffect(() => {
 const fetchDoc = async () => {
 if (!reportId) {
 setError("Missing report ID in URL.");
 setLoading(false);
 return;
 }

 try {
 setLoading(true);
 const data = await getReport(reportId);
 if (data) {
 setReport(data);
 } else {
 setError("Audit record not found or was removed.");
 }
 } catch (err: unknown) {
 logger.error("Failed to load audit report:", err);
 setError("Audit record not found or was removed.");
 } finally {
 setLoading(false);
 }
 };

 fetchDoc();
 }, [reportId]);

 const handleCopy = () => {
 navigator.clipboard.writeText(window.location.href);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 const handleExportPdf = async () => {
 if (!reportId) return;
 setIsExportingPdf(true);
 try {
 let domain = report?.url || 'domain';
 try {
 domain = new URL(report?.url.startsWith('http') ? report!.url : `https://${report!.url}`).hostname;
 } catch (e) { logger.error("Ignored error:", e); }
 const safeDomain = domain.replace(/[^a-zA-Z0-9]/g, '_');
 await exportReportToPdf('report-dossier-content', `CatalystLab-${safeDomain}-${report?.engine || 'audit'}.pdf`);
 } catch (err) {
 logger.error("PDF generation failed:", err);
 window.print();
 } finally {
 setIsExportingPdf(false);
 }
 };

 const handleBrowserPrint = () => {
 window.print();
 };

 if (loading) {
 return <ReportPermalinkSkeleton />;
 }

 if (error || !report) {
 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background text-foreground flex items-center justify-center p-4">
 <div className="ds-card p-8 max-w-md w-full text-center">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 mb-3 border border-red-500/20">
 <AlertCircle className="h-6 w-6"/>
 </div>
 <h2 className="framer-card-title text-foreground">Report Not Found</h2>
 <p className="mt-2 framer-body-text text-xs">{error || "The requested audit dossier does not exist."}</p>
 <div className="mt-5 flex justify-center gap-2.5">
 <Link
 to="/dashboard"
 className="ds-btn ds-btn-secondary text-xs"
 >
 Go to Dashboard
 </Link>
 <Link
 to="/master-audit"
 className="ds-btn ds-btn-primary text-xs"
 >
 Run New Audit
 </Link>
 </div>
 </div>
 </div>
 );
 }

 const meta = ENGINES_MAP[report.engine] || {
 name: report.engine,
 icon: 'bolt',
 badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
 };

 const formattedDate = report.createdAt
 ? new Date(report.createdAt).toLocaleString(undefined, {
 dateStyle: 'medium',
 timeStyle: 'short'
 })
 : 'Unknown Date';

 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-20 text-foreground font-mono">
 <SEOHead
 title={`Audit Report: ${report.url}`}
 description={`Diagnostic telemetry trace for ${report.url} on CatalystLab.`}
 canonicalUrl={`https://www.catalystlab.tech/report?id=${report.id}`}
 />
 
 {/* Top Bar Navigation */}
 <section className="border-b border-border py-3 sm:px-6 lg:px-8">
 <div className="mx-auto flex max-w-3xl items-center justify-between">
 <Link
 to="/dashboard"
 className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
 >
 <ArrowLeft className="h-3.5 w-3.5 shrink-0"/>
 <span>Back to Dashboard</span>
 </Link>

 <div className="flex items-center gap-2">
 <button
 onClick={handleCopy}
 className="ds-btn ds-btn-secondary text-xs"
 title="Copy Share Link"
 >
 {copied ? <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0"/> : <Share2 className="h-3.5 w-3.5 text-[#0066FF] shrink-0"/>}
 <span>{copied ? 'Copied' : 'Share'}</span>
 </button>

 <button
 onClick={handleBrowserPrint}
 className="ds-btn ds-btn-secondary text-xs"
 title="Print via Browser Utility"
 >
 <Printer className="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
 <span>Print</span>
 </button>

 <button
 onClick={handleExportPdf}
 disabled={isExportingPdf}
 className="ds-btn ds-btn-primary text-xs disabled:opacity-50"
 title="Export Current Audit Results as PDF"
 >
 <Download className="h-3.5 w-3.5 text-amber-300 shrink-0"/>
 <span>{isExportingPdf ? 'Exporting PDF...' : 'Export PDF'}</span>
 </button>
 </div>
 </div>
 </section>

 {/* Main Dossier Content Container */}
 <main id="report-dossier-content" className="ds-page-shell space-y-6">
 
 {/* Header Information Banner */}
 <div className="ds-card p-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <div className="flex items-center gap-2 mb-2 flex-wrap">
 <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-[#0066FF]">
 {meta.name}
 </span>
 <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
 <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0"/>
 Immutable Permalink
 </span>
 </div>

 <h1 className="framer-card-title text-lg sm:text-xl text-foreground break-all">
 {report.url}
 </h1>

 <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
 <span className="flex items-center gap-1">
 <Calendar className="h-3 w-3 text-muted-foreground shrink-0"/>
 {formattedDate}
 </span>
 <span>•</span>
 <span className="text-muted-foreground">ID: {report.id}</span>
 {report.ownerEmail && (
 <>
 <span>•</span>
 <span className="text-muted-foreground">Audited by: {report.ownerEmail}</span>
 </>
 )}
 </div>
 </div>

 <div className="shrink-0 flex items-center gap-2">
 <Link
 to={`/master-audit?url=${encodeURIComponent(report.url)}`}
 className="ds-btn ds-btn-secondary text-xs"
 >
 <RotateCw className="h-3 w-3 text-[#0066FF] shrink-0"/>
 <span>Re-run Audit</span>
 </Link>
 </div>
 </div>
 </div>

 {/* Output Terminal View */}
 <div className="ds-card p-2">
 <TerminalOutput
 title={`Full Diagnostic Trace: ${meta.name}`}
 icon={meta.icon}
 engine={report.engine}
 output={report.output}
 maxHeight="max-h-[700px]"
 />
 </div>

 </main>
 </div>
 );
};

export default ReportPermalinkPage;
