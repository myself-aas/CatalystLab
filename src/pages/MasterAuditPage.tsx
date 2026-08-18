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
<<<<<<< HEAD
=======
import { 
  Play, 
  Download, 
  Share2, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  ArrowRight,
  LogIn,
  FileText,
  AlertCircle
} from 'lucide-react';
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

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

<<<<<<< HEAD
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
=======
    // Execute all 8 engines in parallel
    const runSingleEngine = async (engineId: EngineType) => {
      try {
        const response = await fetch('/api/run-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: cleanUrl, 
            engine: engineId,
            userEmail: user?.email || undefined,
            userId: user?.uid || undefined,
            visitorId,
            auditSessionId
          })
        });
        const data = await response.json();

        if (response.status === 429 || data.rateLimitExceeded) {
          setRateLimitReason('limit_reached');
          setRateLimitModalOpen(true);
        }
        
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

    // Auto-save aggregated dossier to Firestore if user is authenticated
    if (user) {
      setIsSaving(true);
      try {
        let domain = cleanUrl;
        try {
          domain = new URL(cleanUrl).hostname;
        } catch {}

        const aggregatedOutputs = results
          .map(r => `=== Engine: ${ENGINES_MAP[r.engineId]?.name || r.engineId} ===\n${r.output}\n`)
          .join('\n');

        const docId = await saveReport(cleanUrl, 'master-audit', aggregatedOutputs, {
          title: `Master Audit: ${domain}`
        });
        setSavedReportId(docId);
      } catch (saveErr) {
        console.error("Auto-save to Firestore failed:", saveErr);
      } finally {
        setIsSaving(false);
      }
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
    }
  };

  const handleExportPdf = async () => {
<<<<<<< HEAD
    setIsExportingPdf(true);
    try {
      await exportReportToPdf('master-results-grid', `CatalystLab-MasterAudit-${Date.now()}.pdf`);
=======
    const resultsElement = document.getElementById('master-results-grid');
    if (!resultsElement) return;

    setIsExportingPdf(true);
    try {
      let domain = targetUrl;
      try {
        domain = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).hostname;
      } catch {}
      const safeDomain = domain.replace(/[^a-zA-Z0-9]/g, '_');
      await exportReportToPdf('master-results-grid', `CatalystLab-MasterAudit-${safeDomain}.pdf`);
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

<<<<<<< HEAD
  const permalinkUrl = savedReportId 
    ? `${window.location.origin}/report/${savedReportId}`
    : `${window.location.origin}/reports/${urlToDomainSlug(targetUrl)}`;
=======
  const permalinkUrl = targetUrl 
    ? `${window.location.origin}/reports/${urlToDomainSlug(targetUrl)}` 
    : (savedReportId ? `${window.location.origin}/reports/${savedReportId}` : '');
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

  const handleCopyPermalink = () => {
    if (!permalinkUrl) return;
    navigator.clipboard.writeText(permalinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const hasAnyOutput = engineKeys.some(k => Boolean(engineStates[k]?.output));

  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              AI Readiness Radar
            </span>
          </h1>

<<<<<<< HEAD
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#415a77] sm:text-lg">
=======
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Execute 8 specialized diagnostics across DOM depth, OWASP security headers, WCAG accessibility, AI crawler readiness, and edge latency.
          </p>

          {/* Audit URL Input Form */}
          <form onSubmit={handleRunAudit} className="mt-8 mx-auto max-w-2xl">
<<<<<<< HEAD
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-[#415a77]/25 bg-white p-2 shadow-xl backdrop-blur-xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#415a77]">
                  <span className="material-symbols-outlined text-base text-[#415a77]">search</span>
=======
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  🌐
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                </span>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com or github.com/owner/repo"
                  required
<<<<<<< HEAD
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-[#0b192c] placeholder:text-[#415a77]/60 focus:outline-none focus:ring-0 font-mono"
=======
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-0"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                />
              </div>

              <button
                type="submit"
                disabled={isAuditing}
<<<<<<< HEAD
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0b192c] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#152238] disabled:opacity-50 shrink-0 shadow-md"
              >
                {isAuditing ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
=======
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 disabled:opacity-50 shrink-0 shadow-lg shadow-cyan-500/20"
              >
                {isAuditing ? (
                  <>
                    <span className="animate-spin">⏳</span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                    <span>Orchestrating Scan...</span>
                  </>
                ) : (
                  <>
<<<<<<< HEAD
                    <span className="material-symbols-outlined text-base">play_arrow</span>
=======
                    <Play className="h-4 w-4 fill-current" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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

<<<<<<< HEAD
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-[#415a77] font-medium">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-emerald-600">check</span> 8 Parallel Engines</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-emerald-600">check</span> OWASP & WCAG Verified</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-emerald-600">check</span> Shareable Permalinks</span>
=======
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">✓ 8 Parallel Engines</span>
              <span className="flex items-center gap-1.5">✓ OWASP & WCAG Verified</span>
              <span className="flex items-center gap-1.5">✓ Shareable Permalinks</span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
<<<<<<< HEAD
          <div className="mb-8 rounded-2xl border border-[#415a77]/40 bg-[#0b192c] p-4 sm:p-6 text-[#f8fafc] shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl text-[#c5d3e8] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <h3 className="text-base font-bold text-[#f8fafc]">
                    Audit Successfully Committed to Firestore!
                  </h3>
                  <p className="text-xs text-[#c5d3e8] mt-1">
=======
          <div className="mb-8 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 sm:p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-emerald-300">
                    Audit Successfully Committed to Firestore!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                    An immutable telemetry record was created. Share this link with clients or engineering teams:
                  </p>
                  <a
                    href={permalinkUrl}
                    target="_blank"
                    rel="noreferrer"
<<<<<<< HEAD
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#c5d3e8] underline hover:text-white font-mono break-all"
                  >
                    {permalinkUrl}
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
=======
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-cyan-400 underline hover:text-cyan-300 font-mono break-all"
                  >
                    {permalinkUrl}
                    <ExternalLink className="h-3 w-3" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyPermalink}
<<<<<<< HEAD
                  className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/40 bg-[#152238] px-3.5 py-2 text-xs font-semibold text-[#f8fafc] hover:bg-[#415a77]/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#c5d3e8]">share</span>
=======
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5 text-cyan-400" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <Link
                  to={`/reports/${urlToDomainSlug(targetUrl)}`}
<<<<<<< HEAD
                  className="flex items-center gap-1.5 rounded-lg bg-[#415a77] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#33475e] transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  <span>Read Article Dossier</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
=======
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Read Article Dossier</span>
                  <ArrowRight className="h-3.5 w-3.5" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Not Logged In Save Invitation */}
        {!user && !isAuditing && hasAnyOutput && (
<<<<<<< HEAD
          <div className="mb-8 rounded-2xl border border-[#415a77]/20 bg-white p-4 sm:p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-[#415a77]">lock</span>
                <div>
                  <h3 className="text-sm font-bold text-[#0b192c]">
                    Want to save this master report to your personal dashboard?
                  </h3>
                  <p className="text-xs text-[#415a77] mt-0.5">
=======
          <div className="mb-8 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔐</span>
                <div>
                  <h3 className="text-sm font-bold text-cyan-300">
                    Want to save this master report to your personal dashboard?
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                    Sign in with Google to enable permanent Firestore history, PDF dossiers, and shareable permalinks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => login()}
<<<<<<< HEAD
                className="flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] transition-all shadow-md shrink-0"
              >
                <span className="material-symbols-outlined text-base">login</span>
=======
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 shrink-0"
              >
                <LogIn className="h-3.5 w-3.5" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                <span>Sign In with Google</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Toolbar above Grid */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
<<<<<<< HEAD
            <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#415a77]">monitoring</span>
              <span>Diagnostic Telemetry Grid</span>
              <span className="text-xs font-normal text-[#415a77]">
=======
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📊 Diagnostic Telemetry Grid</span>
              <span className="text-xs font-normal text-slate-400">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                ({engineKeys.length} Specialized Engines)
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {hasAnyOutput && (
              <Link
                to={`/reports/${urlToDomainSlug(targetUrl)}`}
<<<<<<< HEAD
                className="flex items-center gap-1.5 rounded-lg bg-[#415a77]/10 border border-[#415a77]/30 px-3.5 py-2 text-xs font-semibold text-[#0b192c] hover:bg-[#415a77]/20 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#415a77]">description</span>
=======
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                <span>Interactive Article View</span>
              </Link>
            )}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || !hasAnyOutput}
<<<<<<< HEAD
              className="flex items-center gap-1.5 rounded-lg border border-[#0b192c] bg-[#0b192c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#152238] disabled:opacity-40 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-base text-[#c5d3e8]">download</span>
=======
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
<<<<<<< HEAD
        <section className="mt-16 border-t border-[#415a77]/20 pt-12">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-[#0b192c]">Standalone Diagnostic Consoles</h2>
            <p className="text-sm text-[#415a77] mt-1">
=======
        <section className="mt-16 border-t border-slate-800 pt-12">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Standalone Diagnostic Consoles</h2>
            <p className="text-sm text-slate-400 mt-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                      {meta.description}
                    </p>
                  </div>

<<<<<<< HEAD
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0b192c] group-hover:text-[#415a77]">
                    <span>Launch Engine</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
=======
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                    <span>Launch Engine</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
