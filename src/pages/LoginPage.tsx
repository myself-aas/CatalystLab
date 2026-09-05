import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Terminal, 
  RotateCw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { SEOHead } from '../components/common/SEOHead';
import { CopyButton } from '../components/ui/CopyButton';
import { errorMessage } from '../lib/utils';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || searchParams.get('from') || '/dashboard';

  const { 
    user, 
    loginWithGoogle, 
    loginWithGithub, 
    loginWithEmail, 
    loginWithLocalSession,
    authError, 
    clearAuthError,
    setShowDomainModal 
  } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepActive, setKeepActive] = useState(true);
  
  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'github' | 'email' | null>(null);
  const [localMessage, setLocalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (user && !isSubmitting) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath, isSubmitting]);

  useEffect(() => {
    clearAuthError();
    setLocalMessage(null);
  }, [clearAuthError]);

  const handleGoogleLogin = async () => {
    clearAuthError();
    setLocalMessage(null);
    setIsSubmitting(true);
    setAuthMethod('google');
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      setLocalMessage({ type: 'error', text: errorMessage(err) || 'Google sign-in failed.' });
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handleGithubLogin = async () => {
    clearAuthError();
    setLocalMessage(null);
    setIsSubmitting(true);
    setAuthMethod('github');
    try {
      const loggedUser = await loginWithGithub();
      if (loggedUser) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      setLocalMessage({ type: 'error', text: errorMessage(err) || 'GitHub sign-in failed.' });
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalMessage(null);

    if (!email.trim() || !password) {
      setLocalMessage({ type: 'error', text: 'Please enter both your work email and password.' });
      return;
    }

    setIsSubmitting(true);
    setAuthMethod('email');
    try {
      const loggedUser = await loginWithEmail(email.trim(), password);
      if (loggedUser) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      setLocalMessage({ type: 'error', text: errorMessage(err) || 'Invalid workspace credentials.' });
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handleSandboxLogin = (role: 'superadmin' | 'pro') => {
    clearAuthError();
    if (role === 'superadmin') {
      loginWithLocalSession({
        email: 'asifahmedshuvo.aa9@gmail.com',
        displayName: 'Asif Ahmed Shuvo (Superadmin)',
        isAdmin: true
      });
    } else {
      loginWithLocalSession({
        email: 'lead-architect@acme.corp',
        displayName: 'Lead Architect',
        isAdmin: false
      });
    }
    navigate(redirectPath, { replace: true });
  };

  const activeErrorMessage = localMessage?.type === 'error' ? localMessage.text : authError?.message;

  return (
    <div data-theme="dark" className="relative min-h-screen ds-page-top pb-16 flex flex-col items-center px-4 bg-background text-foreground">
      <SEOHead
        title="Sign In | CatalystLab Security Gateway"
        description="Authenticate into the CatalystLab telemetry console to access live edge dossiers, AST diffs, and autonomous PR branches."
        canonicalUrl="https://www.catalystlab.tech/login"
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
      <div className="relative z-10 w-full max-w-md mx-auto my-auto p-6 sm:p-8 ds-card bg-surface border-border rounded-2xl sm:rounded-3xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden">
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
        <div className="mb-5 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="size-3 text-emerald-400" />
          <span>TLS 1.3 &bull; Mutual TLS Auth Ready &bull; OWASP Compliant</span>
        </div>

        {/* Headlines */}
        <div className="space-y-1.5 mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] leading-tight text-white">
            Welcome back to CatalystLab.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Access real-time telemetry dossiers, autonomous patch branches, and edge nodes.
          </p>
        </div>

        {/* Error / Feedback Alert Banner */}
        {activeErrorMessage && (
          <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-rose-200 leading-snug">{activeErrorMessage}</p>
                {authError?.isUnauthorizedDomain && (
                  <button
                    type="button"
                    onClick={() => setShowDomainModal(true)}
                    className="font-bold underline text-rose-300 hover:text-white cursor-pointer text-[11px]"
                  >
                    Whitelist domain &lsquo;{authError.domain}&rsquo; in Firebase
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {localMessage?.type === 'success' && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="font-medium text-emerald-200 leading-snug">{localMessage.text}</p>
          </div>
        )}

        {/* Single Sign-On (SSO) Quick Actions */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={isSubmitting}
            className="ds-btn ds-btn-secondary w-full text-xs sm:text-sm font-medium"
          >
            {authMethod === 'github' ? (
              <RotateCw className="size-4 animate-spin text-white" />
            ) : (
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="ds-btn ds-btn-secondary w-full text-xs sm:text-sm font-medium"
          >
            {authMethod === 'google' ? (
              <RotateCw className="size-4 animate-spin text-white" />
            ) : (
              <svg className="size-4" viewBox="0 0 24 24">
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
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider">
            <span className="bg-surface px-2 text-muted-foreground">
              Or Authenticate via Workspace Credentials
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@acme.corp"
                required
                className="ds-input pl-10 bg-background border-border text-white placeholder-neutral-600 focus:border-primary focus:ring-primary"
              />
              <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="ds-input pl-10 pr-10 bg-background border-border text-white placeholder-neutral-600 focus:border-primary focus:ring-primary font-mono"
              />
              <Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={keepActive}
                onChange={(e) => setKeepActive(e.target.checked)}
                className="rounded bg-background border-border-strong text-[#0066FF] focus:ring-0 focus:ring-offset-0 size-3.5"
              />
              <span>Keep session active (30 days)</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-[#00D2FF] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="ds-btn w-full bg-white text-black hover:bg-neutral-200 text-xs sm:text-sm shadow-[0_0_24px_rgba(255,255,255,0.25)] active:scale-[0.98] mt-2"
          >
            {authMethod === 'email' ? (
              <>
                <RotateCw className="size-4 animate-spin text-black" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Authenticate &amp; Access Console &rarr;</span>
              </>
            )}
          </button>
        </form>

        {/* Passkey / CLI Terminal Runner */}
        <div className="mt-5 p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Terminal className="size-3.5 text-[#00D2FF] shrink-0" />
            <span className="truncate">npx catalystlab login</span>
          </div>
          <CopyButton
            text="npx catalystlab login"
            variant="terminal"
            label="Copy"
            copiedLabel="Copied"
            className="py-0.5 px-2 text-[10px]"
          />
        </div>

        {/* Dev Sandbox Preview Session Helper */}
        {import.meta.env.DEV && (
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground font-mono">Sandbox bypass:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSandboxLogin('superadmin')}
                className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all font-mono"
              >
                Superadmin
              </button>
              <button
                type="button"
                onClick={() => handleSandboxLogin('pro')}
                className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-all font-mono"
              >
                Team Pro
              </button>
            </div>
          </div>
        )}

        {/* Switch to Sign Up */}
        <div className="mt-5 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          Don&apos;t have an organization workspace yet?{' '}
          <Link to="/signup" className="text-white hover:text-[#00D2FF] font-medium transition-colors">
            Create an account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
