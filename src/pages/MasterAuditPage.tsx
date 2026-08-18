import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { saveReport } from '../lib/firebase';
import type { EngineType } from '../types';
import { 
  Play, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  Lock,
  ArrowRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface EngineState {
  output: string;
  loading: boolean;
  error?: string;
  success?: boolean;
}

export const MasterAuditPage: React.FC = () => {
  const { user, login } = useAuth();
  const [targetUrl, setTargetUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const engineKeys = Object.keys(ENGINES_MAP) as EngineType[];
  const [engineStates, setEngineStates] = useState<Record<string, EngineState>>(() => {
    const initial: Record<string, EngineState> = {};
    Object.keys(ENGINES_MAP).forEach((key) => {
      initial[key] = { output: '', loading: false };
    });
    return initial;
  });

  const normalizeUrl = (input: string): string => {
    let trimmed = input.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    if (!user) {
      const proceed = confirm("Authentication Required: Sign in with Google to run the full Master 8-Engine Audit and save your results.");
      if (proceed) {
        try {
          await login();
        } catch (err) {
          return;
        }
      } else {
        return;
      }
    }

    const cleanUrl = normalizeUrl(targetUrl);
    setTargetUrl(cleanUrl);
    setIsAuditing(true);
    setSavedReportId(null);

    // Reset engines
    const freshStates: Record<string, EngineState> = {};
    engineKeys.forEach((k) => {
      freshStates[k] = { output: '', loading: true };
    });
    setEngineStates(freshStates);

    // Execute all 8 engines in parallel
    const runSingleEngine = async (engineId: EngineType) => {
      try {
        const response = await fetch('/api/run-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl, engine: engineId })
        });
        const data = await response.json();
        
        setEngineStates((prev) => ({
          ...prev,
          [engineId]: {
            output: data.output || (data.error ? `Error: ${data.error}` : 'No output returned.'),
            loading: false,
            success: data.success,
            error: data.error
          }
        }));
        return { engineId, output: data.output || '', success: data.success };
      } catch (err: any) {
        setEngineStates((prev) => ({
          ...prev,
          [engineId]: {
            output: `[!] Connection Failure: Could not reach diagnostic engine container (${err.message}).`,
            loading: false,
            success: false,
            error: err.message
          }
        }));
        return { engineId, output: err.message, success: false };
      }
    };

    const results = await Promise.all(engineKeys.map(runSingleEngine));
    setIsAuditing(false);

    // Auto-save aggregated dossier to Firestore if user logged in
    if (user) {
      setIsSaving(true);
      try {
        const aggregatedOutputs = results
          .map(r => `=== Engine: ${ENGINES_MAP[r.engineId]?.name || r.engineId} ===\n${r.output}\n`)
          .join('\n');

        const docId = await saveReport(cleanUrl, 'master-audit', aggregatedOutputs, {
          title: `Master Audit: ${new URL(cleanUrl).hostname}`
        });
        setSavedReportId(docId);
      } catch (saveErr) {
        console.error("Auto-save to Firestore failed:", saveErr);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleExportPdf = async () => {
    const resultsElement = document.getElementById('master-results-grid');
    if (!resultsElement) return;

    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(resultsElement, {
        scale: 1.5,
        backgroundColor: '#020617',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CatalystLab-Audit-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to compile PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const permalinkUrl = savedReportId ? `${window.location.origin}/report/${savedReportId}` : '';

  const handleCopyPermalink = () => {
    if (!permalinkUrl) return;
    navigator.clipboard.writeText(permalinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-radial-[at_top] from-slate-900 to-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Enterprise Multi-Engine Telemetry Matrix</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Precision Web Health & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              AI Readiness Radar
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
            Execute 8 specialized diagnostics across DOM depth, OWASP security headers, WCAG accessibility, AI crawler readiness, and edge latency.
          </p>

          {/* Audit URL Input Form */}
          <form onSubmit={handleRunAudit} className="mt-8 mx-auto max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  🌐
                </span>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com or github.com/owner/repo"
                  required
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-0"
                />
              </div>

              <button
                type="submit"
                disabled={isAuditing}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 disabled:opacity-50 shrink-0 shadow-lg shadow-cyan-500/20"
              >
                {isAuditing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Orchestrating Scan...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Launch Master Audit</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">✓ 8 Parallel Engines</span>
              <span className="flex items-center gap-1.5">✓ OWASP & WCAG Verified</span>
              <span className="flex items-center gap-1.5">✓ Shareable Permalinks</span>
            </div>
          </form>
        </div>
      </section>

      {/* Main Results Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Saved Report & Permalink Notification Banner */}
        {savedReportId && (
          <div className="mb-8 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 sm:p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-emerald-300">
                    Audit Successfully Committed to Firestore!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    An immutable telemetry record was created. Share this link with clients or engineering teams:
                  </p>
                  <a
                    href={permalinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-cyan-400 underline hover:text-cyan-300 font-mono break-all"
                  >
                    {permalinkUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyPermalink}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  <span>View in Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Action Toolbar above Grid */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📊 Diagnostic Telemetry Grid</span>
              <span className="text-xs font-normal text-slate-400">
                ({engineKeys.length} Specialized Engines)
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || !engineKeys.some(k => engineStates[k]?.output)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isExportingPdf ? 'Compiling PDF...' : 'Export PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* 8-Engine Grid */}
        <div id="master-results-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {engineKeys.map((key) => {
            const meta = ENGINES_MAP[key];
            const state = engineStates[key];

            return (
              <div key={key} className="flex flex-col">
                <TerminalOutput
                  title={`${meta.name}`}
                  icon={meta.icon}
                  engine={meta.id}
                  output={state?.output || ''}
                  loading={state?.loading}
                  statusText={`Executing ${meta.name} diagnostic container...`}
                />
              </div>
            );
          })}
        </div>

        {/* Deep Dive Cards */}
        <section className="mt-16 border-t border-slate-800 pt-12">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Standalone Diagnostic Consoles</h2>
            <p className="text-sm text-slate-400 mt-1">
              Need targeted analysis on a single vector? Access dedicated consoles with deeper drill-downs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {engineKeys.map((key) => {
              const meta = ENGINES_MAP[key];
              return (
                <Link
                  key={key}
                  to={meta.route}
                  className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-cyan-500/40 hover:bg-slate-900 hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{meta.icon}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${meta.badgeClass}`}>
                        {meta.category}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {meta.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                    <span>Launch Engine</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
};
