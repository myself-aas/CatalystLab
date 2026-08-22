import { EngineInput } from "../components/common/EngineInput";
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { RateLimitModal } from '../components/RateLimitModal';
import { LazyReveal } from '../components/common/LazyAnimate';
import { saveReport } from '../lib/firebase';
import { exportReportToPdf } from '../utils/pdfExport';
import { urlToDomainSlug } from '../utils/slugUtils';
import { getRateLimitStatus, recordAuditLaunch, getVisitorDeviceId } from '../utils/rateLimiter';
import type { EngineType } from '../types';
import {
  Terminal,
  RotateCw,
  Play,
  CheckCircle2,
  ExternalLink,
  Share2,
  ArrowRight,
  Activity,
  Download,
  FlaskConical,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  ShieldCheck,
  Globe,
  Cpu,
  Leaf,
  GitBranch,
  Gauge
} from 'lucide-react';

interface EngineState {
  output: string;
  loading: boolean;
  error?: string;
  success?: boolean;
}

export const MasterAuditExecutionPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const initialUrlFromQuery = searchParams.get('url') || '';

  const [targetUrl, setTargetUrl] = useState(initialUrlFromQuery);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'unreachable'>('idle');
  const [isAuditing, setIsAuditing] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [rateLimitReason, setRateLimitReason] = useState<'limit_reached' | 'info'>('info');

  const engineKeys = Object.keys(ENGINES_MAP) as EngineType[];
  const [activeEngineTab, setActiveEngineTab] = useState<EngineType>('health');
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [commandBlink, setCommandBlink] = useState(false);

  useEffect(() => {
    const fullText = "@catalystlab-search: (https://example.com)";
    let i = 0;
    const typing = setInterval(() => {
      if (i <= fullText.length) {
        setTypedPlaceholder(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 70);
    return () => clearInterval(typing);
  }, []);

  const triggerHaptic = (pattern: number | number[] = 12) => {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) { console.error("Ignored error:", e); }
  };

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
    } else {
      const timer = setTimeout(() => {
        const inputEl = document.getElementById('master-audit-execution-url-input') as HTMLInputElement | null;
        if (inputEl) {
          inputEl.focus({ preventScroll: true });
        }
      }, 100);
      return () => clearTimeout(timer);
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
        return;
      }
      
      const clean = normalizeUrl(targetUrl);
      try {
        const parsed = new URL(clean);
        if (!parsed.hostname.includes('.')) {
          throw new Error('Invalid host');
        }
      } catch {
        return;
      }
      
      setUrlStatus('validating');

      try {
        const res = await fetch('/api/check-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: clean })
        });
        const data = await res.json();
        if (data.reachable) {
          setUrlStatus('valid');
        } else {
          setUrlStatus('unreachable');
        }
      } catch (err) {
        setUrlStatus('unreachable');
      }
    };

    if (targetUrl.trim().length > 3) {
      const timer = setTimeout(checkConnectivity, 800);
      return () => clearTimeout(timer);
    } else {
      setUrlStatus('idle');
    }
  }, [targetUrl]);

  const handleRunAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    triggerHaptic([40, 60, 40]);
    setCommandBlink(true);
    setTimeout(() => setCommandBlink(false), 700);

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

    recordAuditLaunch(user, isAdmin, 'master');

    const auditSessionId = `master_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const visitorId = getVisitorDeviceId();

    const freshStates: Record<string, EngineState> = {};
    engineKeys.forEach((k) => {
      freshStates[k] = { output: '', loading: true };
    });
    setEngineStates(freshStates);

    try {
      const settledResults = await Promise.allSettled(
        engineKeys.map(async (key) => {
          try {
            const res = await fetch('/api/run-engine', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                engine: key,
                url: cleanUrl,
                options: { depth: 'deep', format: 'json' }
              })
            });
            const data = await res.json();
            const outputText = data.output || JSON.stringify(data, null, 2);
            setEngineStates(prev => ({
              ...prev,
              [key]: { output: outputText, loading: false, success: true }
            }));
            return { engine: key, output: outputText, success: true };
          } catch (err: unknown) {
            const errText = `Error executing ${key}: ${err.message || 'Unknown error'}`;
            setEngineStates(prev => ({
              ...prev,
              [key]: { output: errText, loading: false, error: errText }
            }));
            return { engine: key, output: errText, success: false };
          }
        })
      );
      
      const results = settledResults.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean);

      const combinedResults: Record<string, string> = {};
      results.forEach(r => {
        combinedResults[r.engine] = r.output;
      });

      const reportId = await saveReport({
        url: cleanUrl,
        engine: 'master-audit',
        output: JSON.stringify(combinedResults, null, 2),
        title: `Master Audit for ${cleanUrl}`,
        userId: user ? user.uid : undefined,
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
  const completedCount = engineKeys.filter(k => Boolean(engineStates[k]?.output && !engineStates[k]?.loading)).length;
  const progressPercent = Math.round((completedCount / engineKeys.length) * 100);

  return (
    <div className="min-h-screen bg-[#0b192c] text-white pb-24 selection:bg-[#415a77]/30 selection:text-white">
      
      {/* Dedicated Master Audit Launcher Header using Brand Navy & Oxford Palette */}
      <section className="relative overflow-hidden border-b border-[#415a77]/30 bg-[#0d1b2a] py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(65,90,119,0.2),rgba(11,25,44,0))] pointer-events-none"></div>
        <div className="mx-auto max-w-4xl text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/50 bg-[#0b192c] px-3.5 py-1 text-sm font-mono font-bold text-[#c5d3e8]">
            <span className="w-2 h-2 rounded-full bg-[#c5d3e8] animate-ping"></span>
            <span>Dedicated Master Audit Execution Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans">
            Launch 8 Parallel AI Telemetry Catalysts
          </h1>
          <p className="text-base sm:text-base text-[#c5d3e8] max-w-2xl mx-auto font-mono">
            Enter your target URL below to dispatch autonomous Python microagents across architecture, code hygiene, Core Web Vitals, and AI search discoverability.
          </p>

          {/* Master Audit Execution Form */}
          <div className="pt-4 max-w-2xl mx-auto flex justify-center w-full">
            <EngineInput 
              value={targetUrl}
              onChange={(val) => { triggerHaptic(12); setTargetUrl(val); }}
              onSubmit={handleRunAudit}
              isLoading={isAuditing}
              buttonText="Start Master Audit"
              loadingText={`Executing Pipeline (${completedCount}/8)...`}
              placeholder={typedPlaceholder || "@catalystlab-search: (https://"}
              disabled={false}
            />
          </div>
        </div>
      </section>

      {/* Main Results Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {savedReportId && (
          <LazyReveal direction="down" duration={0.35}>
            <div className="mb-8 rounded-2xl border border-[#415a77]/50 bg-[#0d1b2a] p-6 text-white shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Master Audit Successfully Committed to Firestore!
                    </h3>
                    <p className="text-sm text-[#c5d3e8] mt-1">
                      Immutable telemetry record created. Shareable permalink:
                    </p>
                    <a
                      href={permalinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-sm text-[#c5d3e8] underline hover:text-white font-mono break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      {permalinkUrl}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyPermalink}
                    className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/50 bg-[#0b192c] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#132742] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <Share2 className="h-4 w-4 text-[#c5d3e8]" />
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <Link
                    to={`/reports/${urlToDomainSlug(targetUrl)}`}
                    className="flex items-center gap-1.5 rounded-lg bg-[#c5d3e8] text-[#0b192c] px-3.5 py-2 text-sm font-bold hover:bg-white transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <span>Read Article Dossier</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </LazyReveal>
        )}

        {/* Real-time 8-Stage Pipeline Live Tracker (When auditing or has output) */}
        {(isAuditing || hasAnyOutput) && (
          <div className="mb-8 rounded-2xl border border-[#415a77]/40 bg-[#0d1b2a] p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-400 animate-pulse" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#c5d3e8]">
                  8-Stage Telemetry Pipeline Execution Status
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-[#c5d3e8]">
                  Completed: <strong className="text-white">{completedCount} / 8</strong> Catalysts ({progressPercent}%)
                </span>
                <div className="w-24 bg-[#0b192c] rounded-full h-2 overflow-hidden border border-[#415a77]/40">
                  <div 
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {engineKeys.map(key => {
                const meta = ENGINES_MAP[key];
                const state = engineStates[key];
                const isCurrentTab = activeEngineTab === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveEngineTab(key)}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrentTab 
                        ? 'border-sky-400 bg-[#152238] shadow-md ring-1 ring-sky-400/40' 
                        : 'border-[#415a77]/30 bg-[#0b192c] hover:border-[#415a77]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono text-[#c5d3e8] font-bold uppercase truncate">
                        {meta.shortCode || meta.name}
                      </span>
                      {state?.loading ? (
                        <RotateCw className="h-3 w-3 text-amber-400 animate-spin" />
                      ) : state?.success ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      ) : state?.error ? (
                        <AlertCircle className="h-3 w-3 text-rose-400" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-600" />
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {meta.catalystName || meta.name}
                    </div>
                    <div className="text-xs font-mono text-[#64748b] truncate mt-0.5">
                      {state?.loading ? 'Scanning...' : state?.success ? 'Indexed' : state?.error ? 'Failed' : 'Queued'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Grid / Active Workspace */}
        {(hasAnyOutput || isAuditing) && (
          <div id="master-results-grid" className="space-y-8">
            
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1b2a] p-4 rounded-2xl border border-[#415a77]/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#415a77]/20 border border-[#415a77]/50 flex items-center justify-center text-[#c5d3e8]">
                  <Activity className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Execution Workspace</h2>
                  <p className="text-sm text-[#c5d3e8] font-mono">Target: {targetUrl}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf || !hasAnyOutput}
                  className="flex items-center gap-1.5 rounded-xl border border-[#415a77]/50 bg-[#0b192c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#132742] disabled:opacity-40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Download className="h-4 w-4 text-[#c5d3e8]" />
                  <span>{isExportingPdf ? 'Compiling PDF...' : 'Export PDF Report'}</span>
                </button>
              </div>
            </div>

            {/* Catalyst Engine Selector Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1b2a] px-4 py-3 rounded-2xl border border-[#415a77]/40">
              <div className="flex items-center gap-2">
                <label htmlFor="master-engine-select" className="text-xs font-mono text-[#c5d3e8] uppercase font-bold">Terminal Feed:</label>
                <select
                  id="master-engine-select"
                  value={activeEngineTab}
                  onChange={(e) => setActiveEngineTab(e.target.value as EngineType)}
                  className="rounded-xl border border-[#415a77]/50 bg-[#0b192c] px-3 py-2 text-xs font-mono font-bold text-white focus:border-sky-400 focus:outline-none"
                >
                  {engineKeys.map(key => {
                    const meta = ENGINES_MAP[key];
                    const state = engineStates[key];
                    const statusText = state?.loading ? 'Scanning...' : state?.success ? 'Indexed' : state?.error ? 'Failed' : 'Queued';
                    return (
                      <option key={key} value={key}>
                        [{meta.shortCode || meta.name}] {meta.catalystName || meta.name} ({statusText})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="text-xs font-mono text-[#64748b]">
                Active Engine: <span className="text-sky-400 font-bold">{ENGINES_MAP[activeEngineTab].name}</span>
              </div>
            </div>

            {/* Active Terminal Output */}
            <div className="w-full">
              <TerminalOutput
                title={`${ENGINES_MAP[activeEngineTab].sdlcPhase || ENGINES_MAP[activeEngineTab].name}`}
                icon={ENGINES_MAP[activeEngineTab].icon}
                engine={ENGINES_MAP[activeEngineTab].id}
                output={engineStates[activeEngineTab]?.output || ''}
                loading={engineStates[activeEngineTab]?.loading}
                statusText={`Executing ${ENGINES_MAP[activeEngineTab].catalystName || ENGINES_MAP[activeEngineTab].name} in Python container...`}
              />
            </div>

          </div>
        )}

        {!hasAnyOutput && !isAuditing && (
          <div className="text-center py-20 bg-[#0d1b2a] rounded-3xl border border-[#415a77]/40 space-y-4 max-w-2xl mx-auto">
            <FlaskConical className="h-14 w-14 text-[#c5d3e8] mx-auto opacity-70" />
            <h3 className="text-xl font-bold text-white">Ready for Execution</h3>
            <p className="text-base text-[#c5d3e8] px-6">
              Enter a URL above and click "Start Master Audit" to initiate the 8 parallel telemetry microagents.
            </p>
          </div>
        )}

      </main>

      <RateLimitModal
        isOpen={rateLimitModalOpen}
        onClose={() => setRateLimitModalOpen(false)}
        reason={rateLimitReason}
      />
    </div>
  );
};

export default MasterAuditExecutionPage;
