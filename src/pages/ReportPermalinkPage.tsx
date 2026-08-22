import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
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
  ExternalLink, 
  RotateCw, 
  Check, 
  Globe, 
  ShieldCheck,
  AlertCircle,
  Printer
} from 'lucide-react';

export const ReportPermalinkPage: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const reportId = paramId || searchParams.get('id');
  const navigate = useNavigate();

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
        console.error("Failed to load audit report:", err);
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
      } catch (e) { console.error("Ignored error:", e); }
      const safeDomain = domain.replace(/[^a-zA-Z0-9]/g, '_');
      await exportReportToPdf('report-dossier-content', `CatalystLab-${safeDomain}-${report?.engine || 'audit'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#415a77] border-t-transparent" />
          <span className="text-sm text-[#415a77] font-mono">Retrieving immutable audit dossier from Firestore...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center bg-[#f8fafc] min-h-[70vh]">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 text-[#f8fafc] shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl text-rose-300 mb-4 border border-rose-500/30">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#f8fafc]">Report Not Found</h2>
          <p className="mt-2 text-sm text-[#c5d3e8]">{error || "The requested audit dossier does not exist."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-xl border border-[#415a77]/40 bg-[#152238] px-4 py-2.5 text-sm font-semibold text-[#f8fafc] hover:bg-[#1f314d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/"
              className="rounded-xl bg-[#415a77] px-4 py-2.5 text-sm font-bold text-[#f8fafc] hover:bg-[#52718e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
    badgeClass: 'bg-[#415a77]/30 text-[#c5d3e8] border-[#415a77]/40'
  };

  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Unknown Date';

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      
      {/* Top Bar Navigation */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#415a77] hover:text-[#0b192c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-[#415a77]/30 bg-[#0b192c] px-3.5 py-1.5 text-sm font-medium text-[#c5d3e8] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Copy Share Link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#c5d3e8]" /> : <Share2 className="h-3.5 w-3.5 text-[#c5d3e8]" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleBrowserPrint}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#415a77]/30 bg-[#0b192c] px-3.5 py-1.5 text-sm font-medium text-[#c5d3e8] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Print via Browser Utility"
            >
              <Printer className="h-3.5 w-3.5 text-[#c5d3e8]" />
              <span>Print</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#152238] transition-colors disabled:opacity-50 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Export Current Audit Results as PDF"
            >
              <Download className="h-3.5 w-3.5 text-[#c5d3e8]" />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Dossier Content Container */}
      <main id="report-dossier-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Information Banner */}
        <div className="mb-6 rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 shadow-2xl text-[#f8fafc]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="material-symbols-outlined text-2xl text-[#c5d3e8]">{meta.icon}</span>
                <span className={`text-sm uppercase font-bold px-2.5 py-0.5 rounded-lg border ${meta.badgeClass}`}>
                  {meta.name}
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-[#152238] px-2.5 py-0.5 text-xs text-[#c5d3e8] font-mono border border-[#415a77]/40">
                  <ShieldCheck className="h-3 w-3 text-[#c5d3e8]" />
                  Immutable Permalink
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#f8fafc] break-all">
                {report.url}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#c5d3e8]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#c5d3e8]" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="font-mono text-[#c5d3e8]">ID: {report.id}</span>
                {report.ownerEmail && (
                  <>
                    <span>•</span>
                    <span className="text-[#c5d3e8]">Audited by: {report.ownerEmail}</span>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Link
                to={`/?url=${encodeURIComponent(report.url)}`}
                className="flex items-center gap-1.5 rounded-xl border border-[#415a77]/40 bg-[#152238] px-4 py-2.5 text-sm font-semibold text-[#f8fafc] hover:bg-[#1f314d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <RotateCw className="h-3.5 w-3.5 text-[#c5d3e8]" />
                <span>Re-run Audit</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Output Terminal View */}
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-2 shadow-2xl overflow-hidden">
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

