import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  RotateCw,
  ShieldCheck,
  Radio,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { SEOHead } from '../components/common/SEOHead';
import { CopyButton } from '../components/ui/CopyButton';
import { errorMessage } from '../lib/utils';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSent, countdown]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const maskEmail = (val: string) => {
    if (!val || !val.includes('@')) return 'e***r@acme.corp';
    const [user, domain] = val.split('@');
    if (user.length <= 2) return `${user[0]}***@${domain}`;
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please provide a valid authorized workspace email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setIsSent(true);
      setCountdown(900);
    } catch (err) {
      setLocalError(errorMessage(err) || 'Failed to dispatch recovery token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setCountdown(900);
    } catch (err) {
      setLocalError(errorMessage(err) || 'Failed to resend recovery token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const terminalCommand = `catalystlab auth recover --email ${email.trim() || 'engineer@acme.corp'} --vault`;

  return (
    <div data-theme="dark" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-16 bg-background text-foreground">
      <SEOHead
        title="Recover Access Key | CatalystLab"
        description="Dispatch a cryptographically signed magic login link or recover workspace credentials via Catalyst CLI."
        canonicalUrl="https://www.catalystlab.tech/forgot-password"
      />

      {/* Subsurface Radial Radiance & Dot Matrix */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle 650px at 50% 10%, rgba(0, 102, 255, 0.16), transparent 70%)'
        }}
      />
      <div 
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#222 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Centered Floating Glass Modal Frame */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6 sm:p-8 ds-card bg-surface border-border rounded-2xl sm:rounded-3xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden">
        {/* Top Brand Anchor */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none">
            <BrandLogo size="sm" />
            <span className="text-xs font-semibold tracking-[-0.02em] text-white">
              Catalyst<span className="text-[#00D2FF]">Lab</span>
            </span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Security Gateway
          </span>
        </div>

        {/* Live Ingress Badge */}
        <div className="mb-5 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="size-3 text-emerald-400" />
          <span>TLS 1.3 &bull; Mutual TLS Auth Ready &bull; OWASP Compliant</span>
        </div>

        {!isSent ? (
          <>
            {/* Headlines */}
            <div className="space-y-1.5 mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] leading-tight text-white">
                Recover your access key.
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Enter your authorized workspace email. We&apos;ll dispatch a cryptographically signed magic login link and token.
              </p>
            </div>

            {/* Error Display */}
            {(localError || authError?.message) && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{localError || authError?.message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Authorized Workspace Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@acme.corp"
                    required
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-neutral-600 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] outline-none transition-all"
                  />
                  <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-semibold hover:bg-neutral-200 rounded-xl py-3 px-4 text-xs sm:text-sm shadow-[0_0_24px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="size-4 animate-spin text-black" />
                    <span>Signing Cryptographic Token...</span>
                  </>
                ) : (
                  <>
                    <span>Dispatch Recovery Link &rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* Alternative Terminal Recovery */}
            <div className="mt-6 pt-5 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-[#00D2FF]" />
                  <span>Terminal Recovery</span>
                </span>
                <span>Catalyst CLI</span>
              </div>
              <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2 font-mono text-[11px] text-[#00D2FF]">
                <span className="truncate">$ {terminalCommand}</span>
                <CopyButton
                  text={`npx ${terminalCommand}`}
                  variant="terminal"
                  label="Copy"
                  copiedLabel="Copied"
                  className="py-0.5 px-2 text-[10px] shrink-0"
                />
              </div>
            </div>
          </>
        ) : (
          /* Confirmation State */
          <div className="py-4 text-center space-y-5">
            {/* Animated Green Radar Pulse */}
            <div className="relative mx-auto size-16 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20" />
              <div className="relative size-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="size-7" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-white">
                Secure Token Dispatched
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                We sent a signed access token and magic link to{' '}
                <span className="text-white font-mono">{maskEmail(email)}</span>.
              </p>
            </div>

            {/* Expiration Countdown */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border font-mono text-xs text-muted-foreground">
              <Clock className="size-3.5 text-[#00D2FF]" />
              <span>Token expires in: <strong className="text-white">{formatCountdown(countdown)}</strong></span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting || countdown > 840}
                className="w-full bg-surface hover:bg-surface border border-border hover:border-border-strong text-white text-xs font-medium py-2.5 px-4 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
              >
                {countdown > 840 ? `Resend Available in ${countdown - 840}s` : 'Resend Recovery Link'}
              </button>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Login</span>
          </Link>
          <Link
            to="/signup"
            className="text-[#00D2FF] hover:underline"
          >
            Create New Account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
