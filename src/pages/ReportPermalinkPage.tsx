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
      <div className="mx-auto max-w-lg px-4 py-20 text-center bg-background min-h-[70vh] font-mono">
        <div className="rounded-2xl border border-border bg-background p-8 text-foreground shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 mb-3 border border-red-200">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Report Not Found</h2>
          <p className="mt-2 text-xs text-muted-foreground">{error || "The requested audit dossier does not exist."}</p>
          <div className="mt-5 flex justify-center gap-2.5">
            <Link
              to="/dashboard"
              className="rounded-xl border border-border bg-accent px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/master-audit"
              className="rounded-xl bg-primary hover:bg-primary-hover border border-border px-4 py-2 text-xs font-bold text-primary-foreground"
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
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Unknown Date';

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground selection:bg-primary selection:text-primary-foreground font-mono">
      <SEOHead
        title={`Audit Report: ${report.url}`}
        description={`Diagnostic telemetry trace for ${report.url} on CatalystLab.`}
        canonicalUrl={`https://www.catalystlab.tech/report?id=${report.id}`}
      />
      
      {/* Top Bar Navigation */}
      <section className="border-b border-border bg-muted px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Copy Share Link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5 text-amber-600" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleBrowserPrint}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Print via Browser Utility"
            >
              <Printer className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Print</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover border border-border px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              title="Export Current Audit Results as PDF"
            >
              <Download className="h-3.5 w-3.5 text-amber-400" />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Dossier Content Container */}
      <main id="report-dossier-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Information Banner */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm text-foreground">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs uppercase font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
                  {meta.name}
                </span>
                <span className="flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-[11px] text-muted-foreground border border-border">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Immutable Permalink
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-extrabold text-foreground break-all">
                {report.url}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
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
                className="flex items-center gap-1.5 rounded-xl border border-border bg-accent px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                <RotateCw className="h-3 w-3 text-amber-600" />
                <span>Re-run Audit</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Output Terminal View */}
        <div className="rounded-2xl border border-border bg-background p-2 shadow-sm overflow-hidden">
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
