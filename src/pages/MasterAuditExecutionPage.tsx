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
  RotateCw,
  CheckCircle2,
  ExternalLink,
  Share2,
  ArrowRight,
  Activity,
  Download,
  FlaskConical,
  AlertCircle
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

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
  const [, setUrlStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'unreachable'>('idle');
  const [isAuditing, setIsAuditing] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [rateLimitReason, setRateLimitReason] = useState<'limit_reached' | 'info'>('info');

  const engineKeys = Object.keys(ENGINES_MAP) as EngineType[];
  const [activeEngineTab, setActiveEngineTab] = useState<EngineType>('health');
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [, setCommandBlink] = useState(false);

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
      } catch {
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
          } catch (err: any) {
            const errText = `Error executing ${key}: ${err.message || 'Unknown error'}`;
            setEngineStates(prev => ({
              ...prev,
              [key]: { output: errText, loading: false, error: errText }
            }));
            return { engine: key, output: errText, success: false };
          }
        })
      );
      
      const results = settledResults
        .map(r => (r.status === 'fulfilled' ? r.value : null))
        .filter((r): r is { engine: EngineType; output: any; success: boolean } => r !== null);

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
    <div className="min-h-screen bg-white text-black pb-24 selection:bg-black selection:text-white font-mono">
      <SEOHead
        title="Master Audit Execution Hub"
        description="Launch 8 parallel AI diagnostic microagents across architecture, code hygiene, Core Web Vitals, and AI search discoverability."
        keywords={['master audit', '8 engine audit', 'web health radar', 'architecture diagnostics']}
        canonicalUrl="https://www.catalystlab.tech/master-audit"
      />
      
      {/* Dedicated Master Audit Launcher Header */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-accent-cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping" />
            <span>Dedicated Master Audit Execution Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans text-black">
            Launch 8 Parallel AI Telemetry Catalysts
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Enter your target URL below to dispatch autonomous Python microagents across architecture, code hygiene, Core Web Vitals, and AI search discoverability.
          </p>

          {/* Master Audit Execution Form */}
          <div className="pt-3 max-w-2xl mx-auto flex justify-center w-full">
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {savedReportId && (
          <LazyReveal direction="down" duration={0.35}>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-black shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-emerald shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-black">
                      Master Audit Successfully Committed to Firestore!
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Immutable telemetry record created. Shareable permalink:
                    </p>
                    <a
                      href={permalinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-accent-cyan underline hover:text-white break-all"
                    >
                      {permalinkUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyPermalink}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-black hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5 text-accent-cyan" />
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <Link
                    to={`/reports/${urlToDomainSlug(targetUrl)}`}
                    className="flex items-center gap-1.5 rounded-lg bg-black hover:bg-black-hover border border-brand-periwinkle/30 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
                  >
                    <span>Read Article Dossier</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </LazyReveal>
        )}

        {/* Real-time 8-Stage Pipeline Live Tracker */}
        {(isAuditing || hasAnyOutput) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-accent-cyan animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                  8-Stage Telemetry Pipeline Execution Status
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">
                  Completed: <strong className="text-black">{completedCount} / 8</strong> ({progressPercent}%)
                </span>
                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden border border-gray-200">
                  <div 
                    className="bg-accent-emerald h-1.5 rounded-full transition-all duration-300"
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
                    className={`flex flex-col p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrentTab 
                        ? 'border-gray-200 bg-black text-white shadow-sm' 
                        : 'border-gray-200 bg-gray-100 text-gray-600 hover:text-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase truncate">
                        {meta.shortCode || meta.name}
                      </span>
                      {state?.loading ? (
                        <RotateCw className="h-2.5 w-2.5 text-accent-amber animate-spin" />
                      ) : state?.success ? (
                        <CheckCircle2 className="h-2.5 w-2.5 text-accent-emerald" />
                      ) : state?.error ? (
                        <AlertCircle className="h-2.5 w-2.5 text-rose-400" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-black-light" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-black truncate">
                      {meta.catalystName || meta.name}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate mt-0.5">
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
          <div id="master-results-grid" className="space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-accent-cyan">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">Execution Workspace</h2>
                  <p className="text-xs text-gray-600">Target: {targetUrl}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf || !hasAnyOutput}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-accent-cyan" />
                  <span>{isExportingPdf ? 'Compiling PDF...' : 'Export PDF Report'}</span>
                </button>
              </div>
            </div>

            {/* Catalyst Engine Selector Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-3.5 py-2.5 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2">
                <label htmlFor="master-engine-select" className="text-xs text-gray-600 uppercase font-bold">Terminal Feed:</label>
                <select
                  id="master-engine-select"
                  value={activeEngineTab}
                  onChange={(e) => setActiveEngineTab(e.target.value as EngineType)}
                  className="rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-bold text-black focus:border-gray-200 focus:outline-none cursor-pointer"
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

              <div className="text-xs text-gray-500">
                Active Engine: <span className="text-accent-cyan font-bold">{ENGINES_MAP[activeEngineTab].name}</span>
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
                statusText={`Executing ${ENGINES_MAP[activeEngineTab].catalystName || ENGINES_MAP[activeEngineTab].name} in container...`}
              />
            </div>

          </div>
        )}

        {!hasAnyOutput && !isAuditing && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 space-y-3 max-w-xl mx-auto p-6">
            <FlaskConical className="h-10 w-10 text-gray-500 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-black">Ready for Execution</h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto font-sans leading-relaxed">
              Enter a URL above and click &quot;Start Master Audit&quot; to initiate the 8 parallel telemetry microagents.
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
