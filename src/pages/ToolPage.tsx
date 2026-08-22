import { EngineInput } from "../components/common/EngineInput";
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { RateLimitBadge } from '../components/RateLimitBadge';
import { RateLimitModal } from '../components/RateLimitModal';
import { EngineReportDashboard } from '../components/tool/EngineReportDashboard';
import { saveReport } from '../lib/firebase';
import { urlToDomainSlug } from '../utils/slugUtils';
import { getRateLimitStatus, recordAuditLaunch, getVisitorDeviceId } from '../utils/rateLimiter';
import type { EngineType } from '../types';
import { 
  Play, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  FileText,
  Activity,
  Code,
  Tag,
  Compass,
  BookOpen
} from 'lucide-react';

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

  // Inspect URL search params for quick testing / cross-engine runs
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryUrl = searchParams.get('url');
    if (queryUrl && queryUrl !== targetUrl) {
      setTargetUrl(queryUrl);
      if (!autoLaunchedRef.current && !output && !loading) {
        autoLaunchedRef.current = true;
        // Trigger auto-scan
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

    // Check rate limit
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

    // Record launch count
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

      // Auto-save if user authenticated
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
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      
      {/* Header Banner */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#415a77] hover:text-[#0b192c] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Master Audit</span>
            </Link>

            <Link
              to={`/docs#${meta.docsAnchor || 'overview'}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#38bdf8] hover:text-[#0b192c] transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Engine Documentation</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col items-center mb-4">
            {meta.image ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 mb-4 rounded-2xl overflow-hidden shadow-lg border border-[#e2e8f0]">
                <img 
                  src={meta.image} 
                  alt={meta.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0b192c] text-[#38bdf8] text-3xl shadow-xl mb-4 border border-[#415a77]/40">
                <span className="material-symbols-outlined text-4xl">{meta.icon}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="text-sm font-bold px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600">
              {meta.sdlcPhase || `SDLC Phase ${meta.sdlcPhaseNumber}`}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Replaces: {meta.departmentReplaced}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-mono font-bold text-[#415a77] bg-[#f1f5f9] px-3 py-1 rounded-full border border-[#e2e8f0]">
              <Code className="h-3 w-3 text-[#38bdf8]" />
              <span>runtime: Python 3.11 ({meta.pythonScript})</span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-[#0b192c] sm:text-4xl">
            {meta.catalystName || `${meta.name} Catalyst`}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base text-[#415a77] leading-relaxed">
            {meta.description}
          </p>

          {/* Form */}
          <div className="mt-8 mx-auto max-w-xl">
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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Saved Permalink Banner */}
        {savedReportId && (
          <div className="mb-6 rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-4 sm:p-5 shadow-lg text-[#f8fafc]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#c5d3e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Audit Saved to Your User Dashboard!
                  </h3>
                  <div className="text-sm text-[#c5d3e8] mt-0.5">
                    Shareable Permalink: <a href={permalinkUrl} target="_blank" rel="noreferrer" className="text-white underline">{permalinkUrl}</a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1f314d] transition-colors"
                >
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
                <Link
                  to={`/reports/${urlToDomainSlug(targetUrl)}`}
                  className="flex items-center gap-1 rounded-xl bg-[#415a77] px-3.5 py-2 text-sm font-bold text-white hover:bg-[#33475e] transition-colors shadow-md"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Read Article Dossier</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {(output || loading) && (
          <div className="mt-8 flex gap-4 border-b border-[#e2e8f0]">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 text-base font-bold border-b-2 transition-colors ${
                viewMode === 'dashboard'
                  ? 'border-[#0b192c] text-[#0b192c]'
                  : 'border-transparent text-[#415a77] hover:text-[#0b192c]'
              }`}
            >
              <Activity className="h-4 w-4" />
              Executive Visual Dashboard
            </button>
            <button
              onClick={() => setViewMode('terminal')}
              className={`flex items-center gap-2 px-4 py-3 text-base font-bold border-b-2 transition-colors ${
                viewMode === 'terminal'
                  ? 'border-[#0b192c] text-[#0b192c]'
                  : 'border-transparent text-[#415a77] hover:text-[#0b192c]'
              }`}
            >
              <Code className="h-4 w-4" />
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
          <div className="mt-8">
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
          <div className="mt-6 rounded-2xl border border-[#415a77]/30 bg-white p-5 text-center shadow-md max-w-4xl mx-auto">
            <p className="text-sm text-[#415a77] flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-base text-amber-500">lightbulb</span>
              <span><strong>Want to save this report to your history?</strong> Sign in with Google to enable permanent cloud storage and permalinks.</span>
            </p>
            <button
              onClick={() => login()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] border border-[#0b192c] px-4 py-2 text-sm font-bold text-white hover:bg-[#152238] transition-colors shadow-md"
            >
              Sign In with Google
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
