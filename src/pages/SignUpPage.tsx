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
  Sparkles, 
  KeyRound,
  Layers,
  Terminal,
  RotateCw,
  Check,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { SEOHead } from '../components/common/SEOHead';
import { errorMessage } from '../lib/utils';

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
      setLocalError(errorMessage(err) || 'Account registration failed.');
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
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center bg-white text-slate-900 selection:bg-slate-900 selection:text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEOHead
        title="Sign Up for CatalystLab | Free Developer Telemetry & Forensic Audit Account"
        description="Create your free CatalystLab account to run 8 specialized web diagnostic engines, obtain REST API tokens, and monitor production sites with automated watchdogs."
        keywords={['CatalystLab sign up', 'create account', 'web audit registration', 'developer telemetry account', 'free trial']}
        canonicalUrl="https://www.catalystlab.tech/signup"
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="inline-block transition-transform hover:scale-105 mb-4" aria-label="Home">
            <BrandLogo size="lg" />
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Create your CatalystLab account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md">
            Unlock 50 free daily diagnostic units, continuous health monitoring, and instant REST API access keys.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <Zap className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-900">50 Free Units</div>
            <div className="text-[10px] text-slate-500">Refreshed daily</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <Layers className="h-4 w-4 text-slate-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-900">8 Engines</div>
            <div className="text-[10px] text-slate-500">Deep telemetry</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <KeyRound className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-900">REST API</div>
            <div className="text-[10px] text-slate-500">CI/CD hooks</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-amber-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-900">Zero Risk</div>
            <div className="text-[10px] text-slate-500">No card required</div>
          </div>
        </div>

        {/* Card Container */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          
          {/* Error Alert Banner */}
          {activeErrorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-red-800 leading-snug">{activeErrorMessage}</p>
                  {authError?.isUnauthorizedDomain && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowDomainModal(true)}
                        className="font-bold underline text-red-700 hover:text-red-900 cursor-pointer"
                      >
                        Whitelist domain &lsquo;{authError.domain}&rsquo; in Firebase
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* 1-Click Social Sign-Up Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Google / Gmail Auth Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {authMethod === 'google' ? (
                  <RotateCw className="h-4 w-4 animate-spin text-amber-500" />
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
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {authMethod === 'github' ? (
                  <RotateCw className="h-4 w-4 animate-spin text-amber-500" />
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
              <div className="w-full border-t border-slate-200" />
              <span className="bg-white px-3 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                or register with email
              </span>
            </div>

            {/* Email Registration Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-3.5">
              <div>
                <label htmlFor="fullName" className="block text-xs font-mono font-bold text-slate-700 mb-1">
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
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-mono font-bold text-slate-700 mb-1">
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
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-mono font-bold text-slate-700 mb-1">
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
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          strengthScore <= 25 ? 'bg-red-500 w-1/4' :
                          strengthScore <= 50 ? 'bg-amber-500 w-2/4' :
                          strengthScore <= 75 ? 'bg-amber-600 w-3/4' :
                          'bg-emerald-500 w-full'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono">
                      <div className={`flex items-center gap-1 ${passwordCriteria.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {passwordCriteria.minLength ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {passwordCriteria.hasUppercase ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {passwordCriteria.hasNumber ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {passwordCriteria.hasSpecial ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-mono font-bold text-slate-700 mb-1">
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
                      !passwordsMatch ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'
                    } pl-9 pr-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none transition-colors`}
                  />
                </div>
                {!passwordsMatch && confirmPassword && (
                  <p className="mt-1 text-[11px] font-mono text-red-600">Passwords do not match.</p>
                )}
              </div>

              <div className="pt-0.5">
                <label className="flex items-start gap-2 cursor-pointer select-none text-xs font-mono text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="h-3.5 w-3.5 mt-0.5 rounded border-slate-300 bg-white text-slate-900 focus:ring-0"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-amber-600 hover:underline font-semibold">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-amber-600 hover:underline font-semibold">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !agreeTerms || (!passwordsMatch && Boolean(confirmPassword))}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 py-2.5 text-xs font-mono font-bold text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
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

          {/* Sandbox Developer Demo Bypass */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Terminal className="h-3 w-3 text-amber-600" />
                <span>Instant Sandbox Onboarding:</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleSandboxSignUp}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-mono font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-center cursor-pointer"
            >
              Test Onboarding in Sandbox Mode (1-Click)
            </button>
          </div>
        </div>

        {/* Switch to Sign In */}
        <div className="mt-5 text-center text-xs font-mono text-slate-500">
          <span>Already have a CatalystLab account? </span>
          <Link
            to={`/login${location.search}`}
            className="font-bold text-amber-600 hover:underline ml-1"
          >
            Sign in &rarr;
          </Link>
        </div>

        {/* Trust & Compliance Badge */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>SOC2 Type II &amp; GDPR Compliant</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>No Credit Card Needed</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUpPage;
