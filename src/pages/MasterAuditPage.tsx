import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { RateLimitBadge } from '../components/RateLimitBadge';
import { RateLimitModal } from '../components/RateLimitModal';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem, LazyCard } from '../components/common/LazyAnimate';
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
  const [urlStatus, setUrlStatus] = useState<'idle' | 'validating' | 'invalid' | 'unreachable' | 'valid'>('idle');
  const [urlStatusMessage, setUrlStatusMessage] = useState('');
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

  useEffect(() => {
    const checkConnectivity = async () => {
      if (!targetUrl.trim()) {
        setUrlStatus('idle');
        setUrlStatusMessage('');
        return;
      }
      
      const clean = normalizeUrl(targetUrl);
      try {
        new URL(clean);
        // Ensure it has a valid hostname with at least a dot (basic check)
        const parsed = new URL(clean);
        if (!parsed.hostname.includes('.')) {
          throw new Error('Invalid host');
        }
      } catch {
        setUrlStatus('invalid');
        setUrlStatusMessage('Invalid URL syntax');
        return;
      }
      
      setUrlStatus('validating');
      setUrlStatusMessage('Checking connectivity...');

      try {
        const res = await fetch('/api/check-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: clean })
        });
        const data = await res.json();
        if (data.reachable) {
          setUrlStatus('valid');
          setUrlStatusMessage('URL reachable');
        } else {
          setUrlStatus('unreachable');
          setUrlStatusMessage('URL may be unreachable');
        }
      } catch (err) {
        setUrlStatus('unreachable');
        setUrlStatusMessage('Network error checking URL');
      }
    };

    if (targetUrl.trim().length > 3) {
      const timer = setTimeout(checkConnectivity, 800);
      return () => clearTimeout(timer);
    } else {
      setUrlStatus('idle');
      setUrlStatusMessage('');
    }
  }, [targetUrl]);

  const handleRunAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    // 1. Check Rate Limit
    const rateStatus = getRateLimitStatus(user, isAdmin);
    if (rateStatus.isMasterExceeded) {
      setRateLimitReason('limit_reached');
      setRateLimitModalOpen(true);
      return;
    }

    const cleanUrl = normalizeUrl(targetUrl);
    setTargetUrl(cleanUrl);
    setIsAuditing(true);
    setSavedReportId(null);

    // Record launch count
    recordAuditLaunch(user, isAdmin, 'master');

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
  const currentRateStatus = getRateLimitStatus(user, isAdmin);

  return (
    <div className="min-h-screen bg-[#f4f6fa] pb-20 text-[#0b192c] selection:bg-[#415a77]/35 selection:text-[#0b192c]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#415a77]/15 bg-gradient-to-b from-white to-[#f4f6fa] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          
          <LazyReveal direction="down" delay={0.05}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-semibold text-[#0b192c] mb-6 shadow-sm">
              <span className="material-symbols-outlined text-base text-[#415a77]">verified</span>
              <span>Enterprise Multi-Engine Telemetry Matrix</span>
            </div>
          </LazyReveal>

          <LazyReveal direction="up" delay={0.1}>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b192c] sm:text-5xl lg:text-6xl">
              Precision Web Health & <br className="hidden sm:inline" />
              <span className="text-[#415a77]">
                AI Readiness Radar
              </span>
            </h1>
          </LazyReveal>

          <LazyReveal direction="up" delay={0.18}>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#415a77] sm:text-lg">
              Execute 8 specialized diagnostics across DOM depth, OWASP security headers, WCAG accessibility, AI crawler readiness, and edge latency.
            </p>
          </LazyReveal>

          {/* Unified Expressive Audit Card */}
          <LazyReveal direction="scale" delay={0.25}>
            <form onSubmit={handleRunAudit} className="mt-8 mx-auto max-w-4xl relative group">
              {/* Outer Island Container */}
              <div className="relative flex flex-col bg-[#09090b] border border-[#27272a] rounded-[32px] p-2 shadow-2xl transition-all duration-500 hover:border-[#3f3f46] hover:shadow-[0_8px_30px_rgba(0,217,90,0.08)] group/card">
                
                {/* Modern Border Glow Effect (Focus State) */}
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-[#00d95a]/0 via-[#00d95a]/0 to-[#00d95a]/0 group-focus-within/card:from-[#00d95a]/20 group-focus-within/card:via-[#00ff6a]/30 group-focus-within/card:to-[#00d95a]/20 blur-xl transition-all duration-700 opacity-0 group-focus-within/card:opacity-100 pointer-events-none -z-10"></div>
                <div className="absolute inset-0 rounded-[32px] ring-1 ring-transparent group-focus-within/card:ring-[#00d95a]/40 transition-all duration-500 pointer-events-none z-10"></div>

                {/* Primary Interaction Row (Input + Button) */}
                <div className="relative flex flex-col sm:flex-row items-center gap-3 bg-[#18181b]/80 rounded-[24px] p-2 transition-all duration-500 group-hover/card:bg-[#1f1f22] group-focus-within/card:bg-[#18181b] group-focus-within/card:shadow-[inset_0_0_40px_rgba(0,217,90,0.05)] overflow-hidden z-20">
                  
                  {/* Search Icon & Input (Larger Hit Area) */}
                  <div className="relative flex-1 w-full flex items-center pl-5 pr-3 group/input cursor-text rounded-[20px] transition-all duration-500 hover:bg-[#27272a]/30 overflow-hidden" onClick={() => document.getElementById('audit-url-input')?.focus()}>
                    {/* Hover Glow Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00d95a]/[0.03] via-transparent to-transparent opacity-0 group-hover/input:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <span className="relative z-10 material-symbols-outlined text-[#00d95a] text-[32px] shrink-0 drop-shadow-[0_0_12px_rgba(0,217,90,0.6)] transition-all duration-500 group-hover/input:scale-110 group-hover/input:text-[#00ff6a] group-hover/input:-rotate-3 group-focus-within/card:scale-110 group-focus-within/card:text-[#00ff6a] group-focus-within/card:rotate-[-5deg]">search</span>
                    <input
                      id="audit-url-input"
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://example.com or github.com/owner/repo"
                      required
                      className="relative z-10 w-full bg-transparent py-5 pl-5 pr-32 text-lg sm:text-xl font-mono text-white placeholder:text-[#a1a1aa]/50 group-hover/input:placeholder:text-[#a1a1aa]/80 focus:placeholder:text-[#a1a1aa]/20 focus:outline-none focus:ring-0 transition-all duration-300 selection:bg-[#00d95a]/30"
                    />
                    
                    {/* URL Status Badge */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center transition-all duration-300">
                      {urlStatus === 'validating' && (
                        <div className="flex items-center gap-1.5 text-[#00d95a] px-2 py-1">
                          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Checking...</span>
                        </div>
                      )}
                      {urlStatus === 'invalid' && (
                        <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Invalid</span>
                        </div>
                      )}
                      {urlStatus === 'unreachable' && (
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Check Connectivity</span>
                        </div>
                      )}
                      {urlStatus === 'valid' && (
                        <div className="flex items-center gap-1 text-[#00d95a] bg-[#00d95a]/10 px-2 py-1 rounded-md">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Ready</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Integrated Reset Timer (Desktop) */}
                  <div className="hidden lg:flex flex-col items-end pr-6 border-r border-[#27272a] shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setRateLimitReason('info'); setRateLimitModalOpen(true); }}>
                    <span className="text-[9px] text-[#a1a1aa] uppercase tracking-wider font-bold mb-0.5">Resets In</span>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#00d95a] text-[12px]">timer</span>
                      <span className="text-[11px] font-bold text-[#00d95a] tabular-nums">{currentRateStatus.formattedResetTime}</span>
                    </div>
                  </div>

                  {/* Launch Button (Seamless Integration & Expressive Animation) */}
                  <button
                    type="submit"
                    disabled={isAuditing || urlStatus === 'invalid'}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-[20px] bg-gradient-to-r from-[#00d95a] to-[#00ff6a] px-8 py-5 text-sm font-extrabold text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,217,90,0.4)] hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <div className="relative flex items-center gap-2 z-10">
                      {isAuditing ? (
                        <>
                          <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                          <span>Orchestrating...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[22px] group-hover/btn:translate-x-1 transition-transform duration-300 ease-out">play_arrow</span>
                          <span>Launch Master Audit</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Secondary Information Row (Quota + Features) */}
                <div 
                  className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-4 gap-x-6 pt-4 pb-3 px-6 cursor-pointer"
                  onClick={() => {
                    setRateLimitReason('info');
                    setRateLimitModalOpen(true);
                  }}
                >
                  {/* Quota Status */}
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-black border border-[#27272a] flex items-center justify-center group-hover:border-[#00d95a]/30 transition-colors">
                        <span className="material-symbols-outlined text-[#00d95a] text-[10px]">verified_user</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">{currentRateStatus.tierLabel} Quota</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-extrabold text-white bg-[#27272a] px-2 py-0.5 rounded-full">{currentRateStatus.masterRemaining} / {currentRateStatus.masterLimit} Left</span>
                       {/* Mobile Reset Timer */}
                       <div className="flex lg:hidden items-center gap-1 ml-1.5">
                         <span className="material-symbols-outlined text-[#00d95a] text-[12px]">timer</span>
                         <span className="text-[11px] font-bold text-[#00d95a] tabular-nums">{currentRateStatus.formattedResetTime}</span>
                       </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 w-full lg:w-auto">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#82828b] group-hover:text-[#e4e4e7] transition-colors duration-300">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#27272a] group-hover:bg-[#00d95a]/10 flex items-center justify-center shrink-0 transition-colors">
                        <span className="material-symbols-outlined text-[9px] text-[#a1a1aa] group-hover:text-[#00d95a] font-bold transition-colors">check</span>
                      </div>
                      Dev Engines
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#82828b] group-hover:text-[#e4e4e7] transition-colors duration-300">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#27272a] group-hover:bg-[#00d95a]/10 flex items-center justify-center shrink-0 transition-colors">
                        <span className="material-symbols-outlined text-[9px] text-[#a1a1aa] group-hover:text-[#00d95a] font-bold transition-colors">check</span>
                      </div>
                      OWASP & WCAG Verified
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#82828b] group-hover:text-[#e4e4e7] transition-colors duration-300">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#27272a] group-hover:bg-[#00d95a]/10 flex items-center justify-center shrink-0 transition-colors">
                        <span className="material-symbols-outlined text-[9px] text-[#a1a1aa] group-hover:text-[#00d95a] font-bold transition-colors">check</span>
                      </div>
                      Shareable Permalinks
                    </div>
                  </div>

                  {/* Get More Quota Call-to-Action */}
                  {!user && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        login();
                      }}
                      className="w-full lg:w-auto rounded-full bg-transparent border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#00d95a] px-4 py-1.5 text-[11px] font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">login</span>
                      Get 10/day (Sign In)
                    </button>
                  )}
                </div>
              </div>
            </form>
          </LazyReveal>
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
          <LazyReveal direction="down" duration={0.35}>
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
                    className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/40 bg-[#152238] px-3.5 py-2 text-xs font-semibold text-[#f8fafc] hover:bg-[#415a77]/30 transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base text-[#c5d3e8]">share</span>
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <Link
                    to={`/reports/${urlToDomainSlug(targetUrl)}`}
                    className="flex items-center gap-1.5 rounded-lg bg-[#415a77] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#33475e] transition-colors shadow-md active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">description</span>
                    <span>Read Article Dossier</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </LazyReveal>
        )}

        {/* Not Logged In Save Invitation */}
        {!user && !isAuditing && hasAnyOutput && (
          <LazyReveal direction="up" delay={0.1}>
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
                  className="flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] transition-all shadow-md shrink-0 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Sign In with Google</span>
                </button>
              </div>
            </div>
          </LazyReveal>
        )}

        {/* Action Toolbar above Grid */}
        <LazyReveal direction="fade" delay={0.05}>
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
                className="flex items-center gap-1.5 rounded-lg border border-[#0b192c] bg-[#0b192c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#152238] disabled:opacity-40 transition-colors shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-base text-[#c5d3e8]">download</span>
                <span>{isExportingPdf ? 'Compiling PDF...' : 'Export PDF Report'}</span>
              </button>
            </div>
          </div>
        </LazyReveal>

        {/* 8-Engine Grid with Lazy Staggering */}
        <LazyStaggerContainer
          id="master-results-grid"
          staggerDelay={0.07}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {engineKeys.map((key) => {
            const meta = ENGINES_MAP[key];
            const state = engineStates[key];

            return (
              <LazyStaggerItem key={key} direction="up" distance={18} className="flex flex-col">
                <TerminalOutput
                  title={`${meta.name}`}
                  icon={meta.icon}
                  engine={meta.id}
                  output={state?.output || ''}
                  loading={state?.loading}
                  statusText={`Executing ${meta.name} diagnostic container...`}
                />
              </LazyStaggerItem>
            );
          })}
        </LazyStaggerContainer>

        {/* Deep Dive Cards with Lazy Stagger */}
        <section className="mt-16 border-t border-[#415a77]/20 pt-12">
          <LazyReveal direction="up" delay={0.05} className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-[#0b192c]">Standalone Diagnostic Consoles</h2>
            <p className="text-sm text-[#415a77] mt-1">
              Need targeted analysis on a single vector? Access dedicated consoles with deeper drill-downs.
            </p>
          </LazyReveal>

          <LazyStaggerContainer staggerDelay={0.06} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {engineKeys.map((key) => {
              const meta = ENGINES_MAP[key];
              return (
                <LazyStaggerItem key={key} direction="scale">
                  <Link
                    to={meta.route}
                    className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#415a77]/60 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#415a77] focus-visible:outline-none"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#415a77]/10 text-[#415a77] border border-[#415a77]/20 shadow-sm transition-all duration-300 group-hover:bg-[#0b192c] group-hover:text-[#c5d3e8] group-hover:scale-105">
                          <span className="material-symbols-outlined text-2xl">{meta.icon}</span>
                        </div>
                        <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border border-[#415a77]/20 bg-[#f4f6fa] text-[#415a77] tracking-wider">
                          {meta.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0b192c] group-hover:text-[#415a77] transition-colors">
                        {meta.name}
                      </h3>
                      <p className="text-xs text-[#415a77] mt-1.5 leading-relaxed line-clamp-2">
                        {meta.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[#e2e8f0] flex items-center justify-between text-xs font-bold text-[#0b192c] group-hover:text-[#415a77] transition-colors">
                      <span>Launch Engine</span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f6fa] text-[#415a77] group-hover:bg-[#0b192c] group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                </LazyStaggerItem>
              );
            })}
          </LazyStaggerContainer>
        </section>

      </main>
    </div>
  );
};
