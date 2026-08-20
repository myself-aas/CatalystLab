import React, { useState } from 'react';
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
  Code
} from 'lucide-react';

interface ToolPageProps {
  engineType: EngineType;
}

export const ToolPage: React.FC<ToolPageProps> = ({ engineType }) => {
  const meta = ENGINES_MAP[engineType];
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

  const normalizeUrl = (input: string): string => {
    let trimmed = input.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  };

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    // Check rate limit
    const rateStatus = getRateLimitStatus(user, isAdmin);
    if (rateStatus.isSingleExceeded) {
      setRateLimitReason('limit_reached');
      setRateLimitModalOpen(true);
      return;
    }

    let cleanUrl = targetUrl.trim();
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
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#415a77] hover:text-[#0b192c] mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Master Audit</span>
          </Link>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b192c] text-[#c5d3e8] text-3xl shadow-lg mb-4 border border-[#415a77]/40">
            <span className="material-symbols-outlined text-3xl">{meta.icon}</span>
          </div>

          <h1 className="text-3xl font-extrabold text-[#0b192c] sm:text-4xl">
            {meta.name}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-[#415a77]">
            {meta.description}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 mx-auto max-w-xl">
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-[#415a77]/30 bg-white p-2 shadow-xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#415a77]">
                  <span className="material-symbols-outlined text-base">{meta.icon}</span>
                </span>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder={
                    isRepoEngine 
                      ? "https://github.com/owner/repo or gitlab.com/..." 
                      : "https://example.com"
                  }
                  required
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-[#0b192c] placeholder:text-[#415a77]/60 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-6 py-3 text-sm font-bold text-white hover:bg-[#33475e] disabled:opacity-50 shrink-0 shadow-md transition-all"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Run Diagnostic</span>
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
          </form>
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
                  <h3 className="text-sm font-bold text-white">
                    Audit Saved to Your User Dashboard!
                  </h3>
                  <div className="text-xs text-[#c5d3e8] mt-0.5">
                    Shareable Permalink: <a href={permalinkUrl} target="_blank" rel="noreferrer" className="text-white underline">{permalinkUrl}</a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1f314d] transition-colors"
                >
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
                <Link
                  to={`/reports/${urlToDomainSlug(targetUrl)}`}
                  className="flex items-center gap-1 rounded-xl bg-[#415a77] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#33475e] transition-colors shadow-md"
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
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                viewMode === 'dashboard'
                  ? 'border-[#0b192c] text-[#0b192c]'
                  : 'border-transparent text-[#415a77] hover:text-[#0b192c]'
              }`}
            >
              <Activity className="h-4 w-4" />
              Executive Dashboard
            </button>
            <button
              onClick={() => setViewMode('terminal')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
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
            <p className="text-xs text-[#415a77] flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-base text-amber-500">lightbulb</span>
              <span><strong>Want to save this report to your history?</strong> Sign in with Google to enable permanent cloud storage and permalinks.</span>
            </p>
            <button
              onClick={() => login()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] border border-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] transition-colors shadow-md"
            >
              Sign In with Google
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
