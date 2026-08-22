import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User as UserIcon,
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
  Check,
  X,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { SEOHead } from '../components/common/SEOHead';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || searchParams.get('from') || '/dashboard';

  const { 
    user, 
    loginWithGoogle, 
    loginWithGithub, 
    signUpWithEmail, 
    loginWithLocalSession,
    authError, 
    clearAuthError,
    setShowDomainModal 
  } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'github' | 'email' | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isSubmitting) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath, isSubmitting]);

  // Real-time password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 25;
    if (passwordCriteria.hasNumber) score += 25;
    if (passwordCriteria.hasUppercase) score += 25;
    if (passwordCriteria.hasSpecial) score += 25;
    return score;
  }, [passwordCriteria]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

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
      setLocalError(err?.message || 'Google account creation failed.');
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
      setLocalError(err?.message || 'GitHub account creation failed.');
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalError(null);

    if (!fullName.trim()) {
      setLocalError('Please provide your name or developer handle.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setLocalError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    setAuthMethod('email');
    try {
      const loggedUser = await signUpWithEmail(email, password, fullName);
      if (loggedUser) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      setLocalError(err?.message || 'Account registration failed.');
    } finally {
      setIsSubmitting(false);
      setAuthMethod(null);
    }
  };

  const handleSandboxSignUp = () => {
    clearAuthError();
    loginWithLocalSession({
      email: email.trim() || 'new-developer@catalystlab.io',
      displayName: fullName.trim() || 'New Developer',
      isAdmin: false
    });
    navigate(redirectPath, { replace: true });
  };

  const activeErrorMessage = localError || authError?.message;

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center bg-[#07111e] text-white selection:bg-cyan-500 selection:text-[#07111e] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEOHead
        title="Sign Up for CatalystLab | Free Developer Telemetry & Forensic Audit Account"
        description="Create your free CatalystLab account to run 8 specialized web diagnostic engines, obtain REST API tokens, and monitor production sites with automated watchdogs."
        keywords={['CatalystLab sign up', 'create account', 'web audit registration', 'developer telemetry account', 'free trial']}
        canonicalUrl="https://www.catalystlab.tech/signup"
      />

      {/* Atmospheric Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[250px] bg-blue-600/5 blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
            <BrandLogo size="lg" />
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Create your CatalystLab account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md">
            Unlock 50 free daily diagnostic units, continuous health monitoring, and instant REST API access keys.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="rounded-xl border border-slate-800 bg-[#0b1728]/80 p-2.5">
            <Zap className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">50 Free Units</div>
            <div className="text-[9px] text-slate-400">Refreshed daily</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0b1728]/80 p-2.5">
            <Layers className="h-4 w-4 text-blue-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">8 Engines</div>
            <div className="text-[9px] text-slate-400">Deep telemetry</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0b1728]/80 p-2.5">
            <KeyRound className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">REST API</div>
            <div className="text-[9px] text-slate-400">CI/CD hooks</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0b1728]/80 p-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">Zero Risk</div>
            <div className="text-[9px] text-slate-400">No card required</div>
          </div>
        </div>

        {/* Card Container */}
        <div className="mt-6 rounded-2xl border border-brand-border/80 bg-[#0c1a2c] p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          
          {/* Error Alert Banner */}
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

          <div className="space-y-6">
            {/* 1-Click Social Sign-Up Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Google / Gmail Auth Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                <span>Sign up with Google</span>
              </button>

              {/* GitHub Auth Button */}
              <button
                type="button"
                onClick={handleGithubSignUp}
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
                <span>Sign up with GitHub</span>
              </button>
            </div>

            {/* Or Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-700/80" />
              <span className="bg-[#0c1a2c] px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                or register with email
              </span>
            </div>

            {/* Email Registration Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Full Name / Handle
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="block w-full rounded-xl border border-slate-700 bg-[#081322] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Work or Personal Email
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
                    placeholder="alex@company.com"
                    className="block w-full rounded-xl border border-slate-700 bg-[#081322] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
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

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          strengthScore <= 25 ? 'bg-red-500 w-1/4' :
                          strengthScore <= 50 ? 'bg-amber-500 w-2/4' :
                          strengthScore <= 75 ? 'bg-blue-400 w-3/4' :
                          'bg-emerald-400 w-full'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                      <div className={`flex items-center gap-1 ${passwordCriteria.minLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {passwordCriteria.minLength ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />}
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {passwordCriteria.hasUppercase ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />}
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {passwordCriteria.hasNumber ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />}
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {passwordCriteria.hasSpecial ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />}
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`block w-full rounded-xl border ${
                      !passwordsMatch ? 'border-red-500 bg-red-950/20' : 'border-slate-700 bg-[#081322]'
                    } pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors`}
                  />
                </div>
                {!passwordsMatch && confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-400">Passwords do not match.</p>
                )}
              </div>

              <fieldset className="pt-1">
                <legend className="sr-only">Terms and Conditions</legend>
                <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="h-4 w-4 mt-0.5 rounded border-slate-700 bg-[#081322] text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-cyan-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-cyan-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </fieldset>

              <button
                type="submit"
                disabled={isSubmitting || !agreeTerms || (!passwordsMatch && Boolean(confirmPassword))}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs sm:text-sm font-extrabold text-[#07111e] shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {authMethod === 'email' && isSubmitting ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Free Developer Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sandbox Developer Demo Bypass (Useful in preview sandboxes) */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Terminal className="h-3 w-3 text-cyan-400" />
                <span>Instant Sandbox Onboarding:</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleSandboxSignUp}
              className="w-full rounded-lg border border-slate-700/70 bg-[#081322] px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-[#13243a] hover:text-white hover:border-slate-500 transition-all text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Test Onboarding in Sandbox Mode (1-Click)
            </button>
          </div>
        </div>

        {/* Switch to Sign In */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Already have a CatalystLab account? </span>
          <Link
            to={`/login${location.search}`}
            className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Sign in &rarr;
          </Link>
        </div>

        {/* Trust & Compliance Badge */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>SOC2 Type II & GDPR Compliant</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>No Credit Card Needed</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUpPage;
