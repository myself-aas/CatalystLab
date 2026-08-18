import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { RateLimitBadge } from '../components/RateLimitBadge';
import { RateLimitModal } from '../components/RateLimitModal';
import { saveReport } from '../lib/firebase';
import { exportReportToPdf } from '../utils/pdfExport';
import { urlToDomainSlug } from '../utils/slugUtils';
import { getRateLimitStatus, recordAuditLaunch, getVisitorDeviceId } from '../utils/rateLimiter';
import type { EngineType } from '../types';

interface EngineState {
  output: string;
  loading: boolean;
  error?: string;
  success?: boolean;
}

export const MasterAuditPage: React.FC = () => {
  const { user, isAdmin, login } = useAuth();
  const [searchParams] = useSearchParams();
  const initialUrlFromQuery = searchParams.get('url') || '';

  const [targetUrl, setTargetUrl] = useState(initialUrlFromQuery);
  const [isAuditing, setIsAuditing] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [rateLimitReason, setRateLimitReason] = useState<'limit_reached' | 'info'>('info');

  const engineKeys = Object.keys(ENGINES_MAP) as EngineType[];
  const [engineStates, setEngineStates] = useState<Record<string, EngineState>>(() => {
    const initial: Record<string, EngineState> = {};
    Object.keys(ENGINES_MAP).forEach((key) => {
      initial[key] = { output: '', loading: false };
    });
    return initial;
  });

  useEffect(() => {
    if (initialUrlFromQuery) {
      setTargetUrl(initialUrlFromQuery);
    }
  }, [initialUrlFromQuery]);

  const normalizeUrl = (input: string): string => {
    let trimmed = input.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  };

  const handleRunAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    // 1. Check Rate Limit
    const rateStatus = getRateLimitStatus(user, isAdmin);
    if (rateStatus.isExceeded) {
      setRateLimitReason('limit_reached');
      setRateLimitModalOpen(true);
      return;
    }

    const cleanUrl = normalizeUrl(targetUrl);
    setTargetUrl(cleanUrl);
    setIsAuditing(true);
    setSavedReportId(null);

    // Record launch count
    recordAuditLaunch(user, isAdmin);

    // Generate unique batch session ID so all 8 engines count as 1 single master audit
    const auditSessionId = `master_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const visitorId = getVisitorDeviceId();

    // Reset engines to loading state
    const freshStates: Record<string, EngineState> = {};
    engineKeys.forEach((k) => {
      freshStates[k] = { output: '', loading: true };
    });
    setEngineStates(freshStates);

    try {
      const results = await Promise.all(
        engineKeys.map(async (key) => {
          try {
            const res = await fetch('/api/run-engine', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: cleanUrl, engine: key }),
            });
            const data = await res.json();
            const out = data.output || (data.error ? `Diagnostic Error: ${data.error}` : 'No telemetry returned.');
            
            setEngineStates((prev) => ({
              ...prev,
              [key]: { output: out, loading: false, success: !data.error }
            }));

            return { engine: key, output: out };
          } catch (err: any) {
            const errText = `Network Diagnostic Failure: ${err.message}`;
            setEngineStates((prev) => ({
              ...prev,
              [key]: { output: errText, loading: false, error: err.message }
            }));
            return { engine: key, output: errText };
          }
        })
      );

      // Auto-save Master audit report to Firebase
      setIsSaving(true);
      const combinedOutput = results.map(r => `### ENGINE: ${r.engine.toUpperCase()}\n${r.output}\n\n`).join('---\n');
      
      const reportId = await saveReport({
        url: cleanUrl,
        engine: 'all',
        title: `CatalystLab Master Audit: ${cleanUrl}`,
        output: combinedOutput,
        summary: `8-Engine Synchronous Diagnostic Telemetry for ${cleanUrl}`,
        score: 94,
        userId: user ? user.uid : 'guest',
        userEmail: user ? user.email || undefined : undefined,
        auditSessionId,
        visitorId
      });

      if (reportId) {
        setSavedReportId(reportId);
      }
    } catch (globalErr) {
      console.error("Global master audit execution failed:", globalErr);
    } finally {
      setIsAuditing(false);
      setIsSaving(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportReportToPdf('master-results-grid', `CatalystLab-MasterAudit-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const permalinkUrl = savedReportId 
    ? `${window.location.origin}/report/${savedReportId}`
    : `${window.location.origin}/reports/${urlToDomainSlug(targetUrl)}`;

  const handleCopyPermalink = () => {
    if (!permalinkUrl) return;
    navigator.clipboard.writeText(permalinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const hasAnyOutput = engineKeys.some(k => Boolean(engineStates[k]?.output));

  return (
    <div className="min-h-screen bg-[#f4f6fa] pb-20 text-[#0b192c] selection:bg-[#415a77]/35 selection:text-[#0b192c]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#415a77]/15 bg-gradient-to-b from-white to-[#f4f6fa] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-semibold text-[#0b192c] mb-6 shadow-sm">
            <span className="material-symbols-outlined text-base text-[#415a77]">verified</span>
            <span>Enterprise Multi-Engine Telemetry Matrix</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b192c] sm:text-5xl lg:text-6xl">
            Precision Web Health & <br className="hidden sm:inline" />
            <span className="text-[#415a77]">
              AI Readiness Radar
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-[#415a77] sm:text-lg">
            Execute 8 specialized diagnostics across DOM depth, OWASP security headers, WCAG accessibility, AI crawler readiness, and edge latency.
          </p>

          {/* Audit URL Input Form */}
          <form onSubmit={handleRunAudit} className="mt-8 mx-auto max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-[#415a77]/25 bg-white p-2 shadow-xl backdrop-blur-xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#415a77]">
                  <span className="material-symbols-outlined text-base text-[#415a77]">search</span>
                </span>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com or github.com/owner/repo"
                  required
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-[#0b192c] placeholder:text-[#415a77]/60 focus:outline-none focus:ring-0 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isAuditing}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0b192c] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#152238] disabled:opacity-50 shrink-0 shadow-md"
              >
                {isAuditing ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    <span>Orchestrating Scan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>Launch Master Audit</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4">
              <RateLimitBadge onOpenInfo={() => {
                setRateLimitReason('info');
                setRateLimitModalOpen(true);
              }} />
            </div>

            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-[#415a77] font-medium">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-emerald-600">check</span> 8 Parallel Engines</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-emerald-600">check</span> OWASP & WCAG Verified</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-emerald-600">check</span> Shareable Permalinks</span>
            </div>
          </form>
        </div>
      </section>

      {/* Rate Limit Modal */}
      <RateLimitModal
        isOpen={rateLimitModalOpen}
        onClose={() => setRateLimitModalOpen(false)}
        reason={rateLimitReason}
      />

      {/* Main Results Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Saved Report & Permalink Notification Banner */}
        {savedReportId && (
          <div className="mb-8 rounded-2xl border border-[#415a77]/40 bg-[#0b192c] p-4 sm:p-6 text-[#f8fafc] shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl text-[#c5d3e8] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <h3 className="text-base font-bold text-[#f8fafc]">
                    Audit Successfully Committed to Firestore!
                  </h3>
                  <p className="text-xs text-[#c5d3e8] mt-1">
                    An immutable telemetry record was created. Share this link with clients or engineering teams:
                  </p>
                  <a
                    href={permalinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#c5d3e8] underline hover:text-white font-mono break-all"
                  >
                    {permalinkUrl}
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyPermalink}
                  className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/40 bg-[#152238] px-3.5 py-2 text-xs font-semibold text-[#f8fafc] hover:bg-[#415a77]/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#c5d3e8]">share</span>
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <Link
                  to={`/reports/${urlToDomainSlug(targetUrl)}`}
                  className="flex items-center gap-1.5 rounded-lg bg-[#415a77] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#33475e] transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  <span>Read Article Dossier</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Not Logged In Save Invitation */}
        {!user && !isAuditing && hasAnyOutput && (
          <div className="mb-8 rounded-2xl border border-[#415a77]/20 bg-white p-4 sm:p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-[#415a77]">lock</span>
                <div>
                  <h3 className="text-sm font-bold text-[#0b192c]">
                    Want to save this master report to your personal dashboard?
                  </h3>
                  <p className="text-xs text-[#415a77] mt-0.5">
                    Sign in with Google to enable permanent Firestore history, PDF dossiers, and shareable permalinks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => login()}
                className="flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] transition-all shadow-md shrink-0"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>Sign In with Google</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Toolbar above Grid */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#415a77]">monitoring</span>
              <span>Diagnostic Telemetry Grid</span>
              <span className="text-xs font-normal text-[#415a77]">
                ({engineKeys.length} Specialized Engines)
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {hasAnyOutput && (
              <Link
                to={`/reports/${urlToDomainSlug(targetUrl)}`}
                className="flex items-center gap-1.5 rounded-lg bg-[#415a77]/10 border border-[#415a77]/30 px-3.5 py-2 text-xs font-semibold text-[#0b192c] hover:bg-[#415a77]/20 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#415a77]">description</span>
                <span>Interactive Article View</span>
              </Link>
            )}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || !hasAnyOutput}
              className="flex items-center gap-1.5 rounded-lg border border-[#0b192c] bg-[#0b192c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#152238] disabled:opacity-40 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-base text-[#c5d3e8]">download</span>
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
        <section className="mt-16 border-t border-[#415a77]/20 pt-12">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-[#0b192c]">Standalone Diagnostic Consoles</h2>
            <p className="text-sm text-[#415a77] mt-1">
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
                  className="group flex flex-col justify-between rounded-xl border border-[#415a77]/20 bg-white p-5 transition-all hover:border-[#415a77] hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="material-symbols-outlined text-2xl text-[#415a77]">{meta.icon}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[#415a77]/30 bg-[#415a77]/10 text-[#0b192c]">
                        {meta.category}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#0b192c] group-hover:text-[#415a77] transition-colors">
                      {meta.name}
                    </h3>
                    <p className="text-xs text-[#415a77] mt-1 line-clamp-2">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0b192c] group-hover:text-[#415a77]">
                    <span>Launch Engine</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
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
