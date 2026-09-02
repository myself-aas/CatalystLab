import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDomainSettings } from '../../lib/firebase';
import { 
  ShieldAlert, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  X, 
  Globe, 
  UserCheck,
  ShieldCheck,
  Key,
  Info
} from 'lucide-react';

export const AuthDomainModal: React.FC = () => {
  const { showDomainModal, setShowDomainModal, authError, loginWithLocalSession, clearAuthError } = useAuth();
  const [copied, setCopied] = useState(false);
  const domainConfig = getFirebaseDomainSettings();
  const currentHostname = domainConfig.currentHostname || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

  if (!showDomainModal) return null;

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setShowDomainModal(false);
    clearAuthError();
  };

  const handleSignInAsSuperadmin = () => {
    loginWithLocalSession({
      email: 'asifahmedshuvo.aas@gmail.com',
      displayName: 'Asif Ahmed Shuvo (Superadmin)',
      isAdmin: true
    });
    handleClose();
  };

  const handleSignInAsDeveloper = () => {
    loginWithLocalSession({
      email: 'developer@catalystlab.io',
      displayName: 'CatalystLab Developer',
      isAdmin: false
    });
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-domain-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[#415a77]/40 bg-[#0b192c] p-6 sm:p-7 shadow-2xl text-[#f8fafc]">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[#c5d3e8] hover:bg-[#152238] hover:text-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 id="auth-domain-title" className="text-lg font-bold text-[#f8fafc]">
              Firebase Auth Domain Whitelist Required
            </h3>
            <p className="text-xs text-[#c5d3e8] mt-1 leading-relaxed">
              Google Sign-In requires your current Cloud Run preview domain to be registered in your Firebase project authorized domains list.
            </p>
          </div>
        </div>

        {/* Domain Display & Copy Box */}
        <div className="mb-5 rounded-xl border border-[#415a77]/40 bg-[#152238] p-3.5">
          <div className="flex items-center justify-between text-xs text-[#c5d3e8] mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#8ea8c3]">Current Host Domain</span>
            <span className="font-mono text-[10px] text-amber-300 font-bold">Action Required in Firebase</span>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-[#0b192c] border border-[#415a77]/30 px-3 py-2">
            <div className="flex items-center gap-2 truncate">
              <Globe className="h-4 w-4 shrink-0 text-[#38bdf8]" />
              <span className="font-mono text-xs font-bold text-[#f8fafc] truncate select-all">
                {currentHostname}
              </span>
            </div>
            <button
              onClick={handleCopyDomain}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all shrink-0 ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#415a77] text-white hover:bg-[#52718e]'
              }`}
              title="Copy hostname to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Domain</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="mb-5 rounded-xl border border-[#415a77]/30 bg-[#0d1b2a] p-4 text-xs text-[#c5d3e8] space-y-2.5">
          <div className="font-bold text-[#f8fafc] flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span>How to Authorize This Domain in Firebase Console:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[#c5d3e8] text-[11px] leading-relaxed">
            <li>
              Open <a 
                href={domainConfig.consoleAuthUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-[#38bdf8] hover:underline inline-flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Firebase Console Settings <ExternalLink className="h-3 w-3 inline" />
              </a> (Project: <code className="text-[#f8fafc]">{domainConfig.projectId}</code>).
            </li>
            <li>Scroll down to the <strong>Authorized domains</strong> section and click <strong>Add domain</strong>.</li>
            <li>Paste <code className="rounded bg-[#152238] px-1 py-0.5 text-[#f8fafc] font-mono">{currentHostname}</code> and click <strong>Save</strong>.</li>
          </ol>
        </div>

        {/* Sandbox Quick Access Mode */}
        <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#38bdf8] mb-2">
            <Sparkles className="h-4 w-4 text-[#38bdf8]" />
            <span>Preview Sandbox Session (Instant Testing)</span>
          </div>
          <p className="text-[11px] text-[#c5d3e8] mb-3 leading-relaxed">
            You can also immediately test and verify all platform capabilities (including Superadmin Command Center, Site Probes, User Quotas, and Audit Dossiers) using a local preview session:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleSignInAsSuperadmin}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-3.5 py-2.5 text-xs font-bold text-white hover:bg-[#52718e] transition-all shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Sign In as Superadmin</span>
            </button>

            <button
              onClick={handleSignInAsDeveloper}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#415a77]/50 bg-[#152238] px-3.5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#1a2d48] transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <UserCheck className="h-4 w-4 text-[#38bdf8]" />
              <span>Sign In as Developer</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#415a77]/30 text-xs">
          <a
            href={domainConfig.consoleAuthUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#c5d3e8] hover:text-white transition-colors flex items-center gap-1 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>Open Firebase Settings</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            onClick={handleClose}
            className="rounded-xl border border-[#415a77]/40 bg-[#152238] px-4 py-2 text-xs font-bold text-[#f8fafc] hover:bg-[#0d1b2a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Continue as Guest
          </button>
        </div>

      </div>
    </div>
  );
};
export default AuthDomainModal;
