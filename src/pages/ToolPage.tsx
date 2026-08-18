import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { RateLimitBadge } from '../components/RateLimitBadge';
import { RateLimitModal } from '../components/RateLimitModal';
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
  FileText
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

  const isRepoEngine = engineType === 'repo';

  const normalizeUrl = (input: string): string => {
    let trimmed = input.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    // Check rate limit
    const rateStatus = getRateLimitStatus(user, isAdmin);
    if (rateStatus.isExceeded) {
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

    // Record launch count
    recordAuditLaunch(user, isAdmin);
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
          const docId = await saveReport(cleanUrl, engineType, finalOutput, {
            title: `${meta.name}: ${cleanUrl}`
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
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Header Banner */}
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Master Audit</span>
          </Link>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-3xl shadow-lg mb-4 border border-slate-700">
            {meta.icon}
          </div>

          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            {meta.name}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            {meta.description}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 mx-auto max-w-xl">
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  {meta.icon}
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
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 shrink-0 shadow-lg shadow-cyan-500/20 transition-all"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
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
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Saved Permalink Banner */}
        {savedReportId && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">
                    Audit Saved to Your User Dashboard!
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Shareable Permalink: <a href={permalinkUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{permalinkUrl}</a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                >
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
                <Link
                  to={`/reports/${urlToDomainSlug(targetUrl)}`}
                  className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Read Article Dossier</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Terminal output */}
        <TerminalOutput
          title={`${meta.name} Console Output`}
          icon={meta.icon}
          output={output}
          loading={loading}
          statusText={`Executing ${meta.pythonScript} in Python runtime...`}
          maxHeight="max-h-[600px]"
        />

        {/* Auth prompt if not logged in */}
        {!user && !loading && output && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
            <p className="text-xs text-slate-400">
              💡 <strong>Want to save this report to your history?</strong> Sign in with Google to enable permanent cloud storage and permalinks.
            </p>
            <button
              onClick={() => login()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20"
            >
              Sign In with Google
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
