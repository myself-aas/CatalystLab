import { EngineInput } from "../components/common/EngineInput";
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { RateLimitModal } from '../components/RateLimitModal';
import { EngineReportDashboard } from '../components/tool/EngineReportDashboard';
import { saveReport } from '../lib/firebase';
import { urlToDomainSlug } from '../utils/slugUtils';
import { getRateLimitStatus, recordAuditLaunch, getVisitorDeviceId } from '../utils/rateLimiter';
import type { EngineType } from '../types';
import { 
  ExternalLink, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Code, 
  BookOpen 
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface ToolPageProps {
  engineType: EngineType;
}

export const ToolPage: React.FC<ToolPageProps> = ({ engineType }) => {
  const meta = ENGINES_MAP[engineType];
  const location = useLocation();
  const { user, isAdmin, login } = useAuth();
  
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [rateLimitReason, setRateLimitReason] = useState<'limit_reached' | 'info'>('info');
  const [viewMode, setViewMode] = useState<'dashboard' | 'terminal'>('dashboard');

  const isRepoEngine = engineType === 'repo';
  const autoLaunchedRef = useRef(false);

  const normalizeUrl = (input: string): string => {
    let trimmed = input.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryUrl = searchParams.get('url');
    if (queryUrl && queryUrl !== targetUrl) {
      setTargetUrl(queryUrl);
      if (!autoLaunchedRef.current && !output && !loading) {
        autoLaunchedRef.current = true;
        triggerAudit(queryUrl);
      }
    }
  }, [location.search, engineType]);

  const handleManualSave = async () => {
    if (!user || savedReportId || !output) return;
    try {
      const auditSessionId = `tool_${engineType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const visitorId = getVisitorDeviceId();
      const cleanUrl = isRepoEngine ? targetUrl.trim() : normalizeUrl(targetUrl.trim());
      const docId = await saveReport({
        url: cleanUrl,
        engine: engineType,
        title: `${meta.name}: ${cleanUrl}`,
        output,
        summary: `Automated ${meta.name} diagnostic run for ${cleanUrl}`,
        score: 92,
        userId: user.uid,
        userEmail: user.email || undefined,
        auditSessionId,
        visitorId
      });
      setSavedReportId(docId);
    } catch (saveErr) {
      console.error("Firestore manual save error:", saveErr);
    }
  };

  const triggerAudit = async (rawUrl: string) => {
    if (!rawUrl.trim()) return;

    const rateStatus = getRateLimitStatus(user, isAdmin);
    if (rateStatus.isSingleExceeded) {
      setRateLimitReason('limit_reached');
      setRateLimitModalOpen(true);
      return;
    }

    let cleanUrl = rawUrl.trim();
    if (!isRepoEngine) {
      cleanUrl = normalizeUrl(cleanUrl);
      setTargetUrl(cleanUrl);
    }

    setLoading(true);
    setOutput('');
    setSavedReportId(null);
    setViewMode('dashboard');

    recordAuditLaunch(user, isAdmin, 'single');
    const auditSessionId = `tool_${engineType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const visitorId = getVisitorDeviceId();

    try {
      const response = await fetch('/api/run-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: cleanUrl, 
          engine: engineType,
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

      const finalOutput = data.output || (data.error ? `Error: ${data.error}` : 'No output returned.');
      setOutput(finalOutput);

      if (user && data.success) {
        try {
          const docId = await saveReport({
            url: cleanUrl,
            engine: engineType,
            title: `${meta.name}: ${cleanUrl}`,
            output: finalOutput,
            summary: `Automated ${meta.name} diagnostic run for ${cleanUrl}`,
            score: 92,
            userId: user.uid,
            userEmail: user.email || undefined,
            auditSessionId,
            visitorId
          });
          setSavedReportId(docId);
        } catch (saveErr) {
          console.error("Firestore auto-save error:", saveErr);
        }
      }
    } catch (err: any) {
      setOutput(`[!] Error: Network communication failure (${err.message}).`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerAudit(targetUrl);
  };

  const permalinkUrl = targetUrl 
    ? `${window.location.origin}/reports/${urlToDomainSlug(targetUrl)}` 
    : (savedReportId ? `${window.location.origin}/reports/${savedReportId}` : '');

  const handleCopy = () => {
    if (!permalinkUrl) return;
    navigator.clipboard.writeText(permalinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900 selection:bg-slate-900 selection:text-white font-mono">
      <SEOHead
        title={`${meta.catalystName || meta.name} Catalyst`}
        description={meta.description}
        canonicalUrl={`https://www.catalystlab.tech/tool/${engineType}`}
      />
      
      {/* Header Banner */}
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/master-audit"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Master Audit</span>
            </Link>

            <Link
              to={`/docs#${meta.docsAnchor || 'overview'}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Engine Documentation</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>

          <div className="flex flex-col items-center mb-3">
            {meta.image ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <img 
                  src={meta.image} 
                  alt={meta.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-900 text-2xl shadow-sm mb-3 border border-slate-200">
                <span className="material-symbols-outlined text-3xl">{meta.icon}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded border border-slate-200 bg-white text-slate-900">
              {meta.sdlcPhase || `SDLC Phase ${meta.sdlcPhaseNumber}`}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Replaces: {meta.departmentReplaced}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded border border-slate-200">
              <Code className="h-3 w-3 text-amber-600" />
              <span>runtime: Python 3.11 ({meta.pythonScript})</span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl font-sans">
            {meta.catalystName || `${meta.name} Catalyst`}
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            {meta.description}
          </p>

          {/* Form */}
          <div className="mt-6 mx-auto max-w-xl">
            <EngineInput 
              value={targetUrl}
              onChange={setTargetUrl}
              onSubmit={handleSubmit}
              isLoading={loading}
              buttonText="Run Scan"
              loadingText="Scanning..."
              placeholder={isRepoEngine ? "@catalystlab-search: (https://github.com/..." : "@catalystlab-search: (https://..."}
            />
          </div>
        </div>
      </section>

      {/* Rate Limit Modal */}
      <RateLimitModal
        isOpen={rateLimitModalOpen}
        onClose={() => setRateLimitModalOpen(false)}
        reason={rateLimitReason}
      />

      {/* Results Section */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Saved Permalink Banner */}
        {savedReportId && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Audit Saved to Your User Dashboard!
                  </h3>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Shareable Permalink: <a href={permalinkUrl} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline">{permalinkUrl}</a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
                <Link
                  to={`/reports/${urlToDomainSlug(targetUrl)}`}
                  className="flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
                >
                  <FileText className="h-3 w-3 text-amber-400" />
                  <span>Read Article Dossier</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {(output || loading) && (
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'dashboard'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Executive Visual Dashboard
            </button>
            <button
              onClick={() => setViewMode('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'terminal'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              Raw Terminal Output
            </button>
          </div>
        )}

        {viewMode === 'dashboard' && output && !loading && !output.startsWith('[!] Error') && (
          <EngineReportDashboard 
            engineType={engineType}
            targetUrl={targetUrl}
            output={output}
            onRelaunch={() => handleSubmit()}
            onSave={handleManualSave}
            savedReportId={savedReportId}
          />
        )}

        {(viewMode === 'terminal' || loading || output.startsWith('[!] Error')) && (
          <div className="mt-4">
            <TerminalOutput
              title={`${meta.name} Console Output`}
              icon={meta.icon}
              engine={meta.id}
              output={output}
              loading={loading}
              statusText={`Executing ${meta.pythonScript} in Python runtime...`}
              maxHeight="max-h-[600px]"
            />
          </div>
        )}

        {/* Auth prompt if not logged in */}
        {!user && !loading && output && !output.startsWith('[!] Error') && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm max-w-2xl mx-auto">
            <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5 font-sans">
              <span className="material-symbols-outlined text-sm text-amber-600">lightbulb</span>
              <span><strong>Want to save this report to your history?</strong> Sign in with Google to enable permanent cloud storage and permalinks.</span>
            </p>
            <button
              onClick={() => login()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
            >
              Sign In with Google
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default ToolPage;
