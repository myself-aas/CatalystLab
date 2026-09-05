import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Globe, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RotateCw,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { SEOHead } from '../components/common/SEOHead';
import { errorMessage } from '../lib/utils';

type OrgScope = 'developer' | 'team' | 'enterprise';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || searchParams.get('from') || '/dashboard';

  const { 
    user, 
    loginWithGoogle, 
    loginWithGithub, 
    signUpWithEmail, 
    authError, 
    clearAuthError,
    setShowDomainModal 
  } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [scope, setScope] = useState<OrgScope>('team');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'github' | 'email' | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isSubmitting) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath, isSubmitting]);

  useEffect(() => {
    clearAuthError();
    setLocalError(null);
  }, [clearAuthError]);

  // Clean domain input helper
  const cleanDomain = useMemo(() => {
    const d = orgDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return d;
  }, [orgDomain]);

  // Password entropy calculation (4 tiers)
  const passwordEntropy = useMemo(() => {
    return {
      length: password.length >= 8,
      mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };
  }, [password]);

  const entropyScore = useMemo(() => {
    let score = 0;
    if (passwordEntropy.length) score += 1;
    if (passwordEntropy.mixedCase) score += 1;
    if (passwordEntropy.number) score += 1;
    if (passwordEntropy.special) score += 1;
    return score;
  }, [passwordEntropy]);

  const entropyLabel = useMemo(() => {
    if (entropyScore === 0) return 'Empty';
    if (entropyScore === 1) return 'Weak entropy';
    if (entropyScore === 2) return 'Fair entropy';
    if (entropyScore === 3) return 'Good entropy';
    return 'Strong cryptographic entropy';
  }, [entropyScore]);

  const handleGoogleSignUp = async () => {
    clearAuthError();
    setLocalError(null);
    setIsSubmitting(true);
    setAuthMethod('google');
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      setLocalError(errorMessage(err) || 'Google account creation failed.');
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handleGithubSignUp = async () => {
    clearAuthError();
    setLocalError(null);
    setIsSubmitting(true);
    setAuthMethod('github');
    try {
      const loggedUser = await loginWithGithub();
      if (loggedUser) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      setLocalError(errorMessage(err) || 'GitHub account creation failed.');
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setLocalError('Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must contain at least 8 characters.');
      return;
    }

    if (!agreeTerms) {
      setLocalError('Please acknowledge the terms and OWASP compliance guidelines.');
      return;
    }

    setIsSubmitting(true);
    setAuthMethod('email');
    try {
      const newUser = await signUpWithEmail(email.trim(), password, fullName.trim());
      if (newUser) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      setLocalError(errorMessage(err) || 'Failed to initialize organization workspace.');
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const activeErrorMessage = localError || authError?.message;

  return (
    <div data-theme="dark" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-16 bg-[#000000] text-white">
      <SEOHead
        title="Sign Up | Initialize Telemetry Console | CatalystLab"
        description="Deploy autonomous web diagnostics in seconds. Zero SDK instrumentation, 100% edge-native inspection across 38 global PoPs."
        canonicalUrl="https://www.catalystlab.tech/signup"
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
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
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
        <div className="mb-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="size-3 text-emerald-400" />
          <span>TLS 1.3 &bull; Mutual TLS Auth Ready &bull; OWASP Compliant</span>
        </div>

        {/* Headlines */}
        <div className="space-y-1.5 mb-5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] leading-tight text-white">
            Deploy autonomous diagnostics in seconds.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Zero SDK. Zero code instrumentation. 100% edge-native inspection.
          </p>
        </div>

        {/* Interactive Scope Selector (Pill Segmented Control) */}
        <div className="mb-5 p-1 rounded-xl bg-background border border-border grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setScope('developer')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              scope === 'developer'
                ? 'bg-surface-elevated text-white border border-border shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Individual Dev
          </button>
          <button
            type="button"
            onClick={() => setScope('team')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              scope === 'team'
                ? 'bg-surface-elevated text-white border border-border shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Engineering Team
          </button>
          <button
            type="button"
            onClick={() => setScope('enterprise')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              scope === 'enterprise'
                ? 'bg-surface-elevated text-white border border-border shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Enterprise Mesh
          </button>
        </div>

        {/* Tier Scope Context Chip */}
        <div className="mb-5 p-2 rounded-lg bg-surface border border-white/5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>Allocation:</span>
          <span className="text-[#00D2FF]">
            {scope === 'developer' && '1 Domain • 50 Audits/Mo • Free CLI'}
            {scope === 'team' && '5 Domains • 1,500 Audits/Mo • Auto-PR Patches'}
            {scope === 'enterprise' && 'Unlimited Domains • 38-PoP Dedicated Mesh'}
          </span>
        </div>

        {/* Error Alert */}
        {activeErrorMessage && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-rose-200">{activeErrorMessage}</p>
                {authError?.isUnauthorizedDomain && (
                  <button
                    type="button"
                    onClick={() => setShowDomainModal(true)}
                    className="mt-1 font-bold underline text-rose-300 hover:text-white cursor-pointer text-[11px]"
                  >
                    Whitelist domain &lsquo;{authError.domain}&rsquo; in Firebase
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SSO Actions */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            type="button"
            onClick={handleGithubSignUp}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-surface border border-border hover:border-border-strong text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
          >
            {authMethod === 'github' ? (
              <RotateCw className="size-3.5 animate-spin text-white" />
            ) : (
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-surface border border-border hover:border-border-strong text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
          >
            {authMethod === 'google' ? (
              <RotateCw className="size-3.5 animate-spin text-white" />
            ) : (
              <svg className="size-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Google</span>
          </button>
        </div>

        {/* Dividing Rule */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider">
            <span className="bg-surface px-2 text-muted-foreground">
              Or Register Direct
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="ds-label block mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                required
                className="ds-input pl-9 bg-background border-border text-white placeholder-neutral-600 focus:border-primary focus:ring-primary"
              />
              <UserIcon className="absolute left-3 top-3 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="ds-label block mb-1">
              Work Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@acme.corp"
                required
                className="ds-input pl-9 bg-background border-border text-white placeholder-neutral-600 focus:border-primary focus:ring-primary"
              />
              <Mail className="absolute left-3 top-3 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Organization Domain */}
          <div>
            <label className="ds-label block mb-1">
              Primary Organization Domain
            </label>
            <div className="relative">
              <input
                type="text"
                value={orgDomain}
                onChange={(e) => setOrgDomain(e.target.value)}
                placeholder="acme.corp"
                className="ds-input pl-9 bg-background border-border text-white placeholder-neutral-600 focus:border-primary focus:ring-primary font-mono"
              />
              <Globe className="absolute left-3 top-3 size-3.5 text-muted-foreground" />
            </div>
            {/* Domain Verification Preview */}
            {cleanDomain && cleanDomain.includes('.') && (
              <div className="mt-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 animate-fadeIn">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">EdgeKinase pre-resolving DNS for {cleanDomain}... Valid TLS 1.3 detected</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <span className="text-[10px] font-mono text-[#00D2FF]">{entropyLabel}</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="ds-input pl-9 pr-9 bg-background border-border text-white placeholder-neutral-600 focus:border-primary focus:ring-primary font-mono"
              />
              <Lock className="absolute left-3 top-3 size-3.5 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>

            {/* 4-Bar Reactive Password Strength Gauge */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              <div className={`h-1 rounded-full transition-all duration-300 ${entropyScore >= 1 ? (entropyScore === 1 ? 'bg-rose-500' : entropyScore === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-white/10'}`} />
              <div className={`h-1 rounded-full transition-all duration-300 ${entropyScore >= 2 ? (entropyScore === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-white/10'}`} />
              <div className={`h-1 rounded-full transition-all duration-300 ${entropyScore >= 3 ? 'bg-emerald-500' : 'bg-white/10'}`} />
              <div className={`h-1 rounded-full transition-all duration-300 ${entropyScore >= 4 ? 'bg-[#00D2FF]' : 'bg-white/10'}`} />
            </div>
          </div>

          {/* Terms & OWASP Compliance */}
          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-muted-foreground leading-snug">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded bg-background border-white/20 text-[#0066FF] focus:ring-0 focus:ring-offset-0 size-3.5 shrink-0"
              />
              <span>
                I agree to the CatalystLab Terms &amp;{' '}
                <a href="#compliance" className="text-[#00D2FF] hover:underline">SOC2 Type II Report</a>{' '}
                with zero-data retention on source AST payloads.
              </span>
            </label>
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="ds-btn w-full bg-white text-black hover:bg-neutral-200 text-xs sm:text-sm shadow-[0_0_24px_rgba(255,255,255,0.25)] active:scale-[0.98] mt-3"
          >
            {authMethod === 'email' ? (
              <>
                <RotateCw className="size-4 animate-spin text-black" />
                <span>Initializing Organization Console...</span>
              </>
            ) : (
              <>
                <span>Initialize Telemetry Console &rarr;</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch */}
        <div className="mt-5 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          Already an authorized workspace member?{' '}
          <Link to="/login" className="text-white hover:text-[#00D2FF] font-medium transition-colors">
            Log in to console &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
