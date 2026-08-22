import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  KeyRound,
  Cpu,
  Layers,
  Terminal,
  RotateCw,
  ExternalLink,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useAuth, SUPERADMIN_EMAILS } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { SEOHead } from '../components/common/SEOHead';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || searchParams.get('from') || '/dashboard';

  const { 
    user, 
    loginWithGoogle, 
    loginWithGithub, 
    loginWithEmail, 
    sendPasswordReset, 
    loginWithLocalSession,
    authError, 
    clearAuthError,
    setShowDomainModal 
  } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'github' | 'email' | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localMessage, setLocalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // If already authenticated, redirect smoothly
  useEffect(() => {
    if (user && !isSubmitting) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath, isSubmitting]);

  // Clean error when switching modes
  useEffect(() => {
    clearAuthError();
    setLocalMessage(null);
  }, [isResetMode]);

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
      setLocalMessage({ type: 'error', text: err?.message || 'Google sign-in failed.' });
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
      setLocalMessage({ type: 'error', text: err?.message || 'GitHub sign-in failed.' });
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalMessage(null);

    if (!email.trim()) {
      setLocalMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    if (!password) {
      setLocalMessage({ type: 'error', text: 'Please enter your password.' });
      return;
    }

    setIsSubmitting(true);
    setAuthMethod('email');
    try {
      const loggedUser = await loginWithEmail(email, password);
      if (loggedUser) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      setLocalMessage({ type: 'error', text: err?.message || 'Invalid credentials or login failed.' });
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalMessage(null);

    if (!email.trim()) {
      setLocalMessage({ type: 'error', text: 'Please enter your email address to receive recovery instructions.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
      setLocalMessage({ 
        type: 'success', 
        text: `Password recovery email dispatched to ${email}. Check your inbox and spam folder.` 
      });
    } catch (err: unknown) {
      setLocalMessage({ type: 'error', text: err?.message || 'Failed to dispatch password recovery email.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxLogin = (role: 'superadmin' | 'pro') => {
    clearAuthError();
    if (role === 'superadmin') {
      loginWithLocalSession({
        email: 'shuvo.1807016@bau.edu.bd',
        displayName: 'Asif Ahmed Shuvo (Superadmin)',
        isAdmin: true
      });
    } else {
      loginWithLocalSession({
        email: 'developer@catalystlab.io',
        displayName: 'Dev Pro User',
        isAdmin: false
      });
    }
    navigate(redirectPath, { replace: true });
  };

  const activeErrorMessage = localMessage?.type === 'error' ? localMessage.text : authError?.message;

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center bg-[#07111e] text-white selection:bg-cyan-500 selection:text-[#07111e] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEOHead
        title="Sign In to CatalystLab | Access Diagnostic Telemetry & API Tokens"
        description="Sign in to your CatalystLab account using Email, Google (Gmail), or GitHub to manage web health dossiers, REST API keys, and automated site monitoring."
        keywords={['CatalystLab login', 'sign in', 'telemetry auth', 'Google OAuth', 'GitHub login', 'web audit dashboard']}
        canonicalUrl="https://www.catalystlab.tech/login"
      />

      {/* Atmospheric Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] bg-blue-600/5 blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
            <BrandLogo size="lg" />
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isResetMode ? 'Reset your password' : 'Sign in to CatalystLab'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm">
            {isResetMode
              ? 'Enter your registered email address and we will dispatch a secure reset link.'
              : 'Precision web diagnostics, continuous watchdog monitoring, and developer API keys.'}
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 rounded-2xl border border-brand-border/80 bg-[#0c1a2c] p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          
          {/* Error / Feedback Alert Banner */}
          {activeErrorMessage && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-200 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <p className="font-semibold text-red-200 leading-snug">{activeErrorMessage}</p>
                  {authError?.isUnauthorizedDomain && (
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDomainModal(true)}
                        className="font-bold underline text-red-300 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        Whitelist domain &lsquo;{authError.domain}&rsquo; in Firebase
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {localMessage?.type === 'success' && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-200 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="font-medium text-emerald-200 leading-snug">{localMessage.text}</p>
              </div>
            </div>
          )}

          {!isResetMode ? (
            <div className="space-y-6">
              {/* 1-Click Social Sign-in Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google / Gmail Auth Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-[#13243a] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#1a314f] hover:border-cyan-500/40 active:scale-98 disabled:opacity-60 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {authMethod === 'google' ? (
                    <RotateCw className="h-4 w-4 animate-spin text-cyan-400" />
                  ) : (
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Google / Gmail</span>
                </button>

                {/* GitHub Auth Button */}
                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-[#13243a] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#1a314f] hover:border-cyan-500/40 active:scale-98 disabled:opacity-60 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {authMethod === 'github' ? (
                    <RotateCw className="h-4 w-4 animate-spin text-cyan-400" />
                  ) : (
                    <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  )}
                  <span>GitHub</span>
                </button>
              </div>

              {/* Or Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-700/80" />
                <span className="bg-[#0c1a2c] px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  or continue with email
                </span>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="block w-full rounded-xl border border-slate-700 bg-[#081322] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full rounded-xl border border-slate-700 bg-[#081322] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <fieldset className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <legend className="sr-only">Login Options</legend>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-[#081322] text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </fieldset>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs sm:text-sm font-extrabold text-[#07111e] shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {authMethod === 'email' && isSubmitting ? (
                    <RotateCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign in with Email</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handlePasswordReset} className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Account Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full rounded-xl border border-slate-700 bg-[#081322] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-2.5 text-xs sm:text-sm font-extrabold text-[#07111e] shadow-md hover:bg-cyan-300 active:scale-98 transition-all disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {isSubmitting ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Send Password Recovery Email</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetMode(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  &larr; Back to sign in
                </button>
              </div>
            </form>
          )}

          {/* Sandbox Developer Demo Bypass (Useful in preview sandboxes) */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Terminal className="h-3 w-3 text-cyan-400" />
                <span>Instant Developer Preview:</span>
              </span>
              <span className="text-[10px] text-slate-500">1-click sandbox session</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSandboxLogin('pro')}
                className="rounded-lg border border-slate-700/70 bg-[#081322] px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-[#13243a] hover:text-white hover:border-slate-500 transition-all text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Dev User Preview
              </button>
              <button
                type="button"
                onClick={() => handleSandboxLogin('superadmin')}
                className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-900/40 hover:text-white hover:border-amber-500/60 transition-all text-center cursor-pointer flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Shield className="h-3 w-3" />
                <span>Superadmin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Switch to Sign Up */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Don&rsquo;t have a CatalystLab account yet? </span>
          <Link
            to={`/signup${location.search}`}
            className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Create free account &rarr;
          </Link>
        </div>

        {/* Trust & Compliance Badge */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>256-Bit TLS Encryption</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>50 Free Units Daily</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
