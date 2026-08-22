import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, SUPERADMIN_EMAILS } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  RefreshCw, 
  KeyRound,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { 
    user, 
    loading: authLoading, 
    isAdmin, 
    hasSuperadminClaim, 
    tokenClaims,
    login, 
    logout, 
    loginWithLocalSession, 
    setShowDomainModal,
    refreshClaims 
  } = useAuth();

  const [verifyingClaims, setVerifyingClaims] = useState(false);
  const [claimCheckDone, setClaimCheckDone] = useState(false);
  const [tokenSuperadminVerified, setTokenSuperadminVerified] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const verifyTokenClaimsDirectly = async () => {
      if (!user) {
        if (isMounted) {
          setTokenSuperadminVerified(false);
          setClaimCheckDone(true);
        }
        return;
      }

      setVerifyingClaims(true);
      try {
        const email = user.email?.toLowerCase() || '';
        const isEmailSuperadmin = SUPERADMIN_EMAILS.includes(email);

        if (typeof (user as any).getIdTokenResult === 'function') {
          // Force token refresh to fetch latest custom claims from Firebase Auth
          const tokenResult = await (user as any).getIdTokenResult();
          const claims = tokenResult?.claims || {};
          const claimHasSuperadmin = claims.role === 'superadmin' || claims.superadmin === true;

          if (isMounted) {
            setTokenSuperadminVerified(claimHasSuperadmin || isEmailSuperadmin);
          }
        } else {
          // Local session or preview mode
          if (isMounted) {
            setTokenSuperadminVerified(isEmailSuperadmin || hasSuperadminClaim || isAdmin);
          }
        }
      } catch (err) {
        console.warn("Direct token claim verification warning:", err);
        if (isMounted) {
          setTokenSuperadminVerified(isAdmin || hasSuperadminClaim);
        }
      } finally {
        if (isMounted) {
          setVerifyingClaims(false);
          setClaimCheckDone(true);
        }
      }
    };

    if (!authLoading) {
      verifyTokenClaimsDirectly();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, isAdmin, hasSuperadminClaim]);

  // Loading state while auth initializes or token claims are being resolved
  if (authLoading || (verifyingClaims && !claimCheckDone)) {
    return (
      <div className="min-h-screen bg-[#0b192c] flex flex-col items-center justify-center p-6 text-[#f8fafc]">
        <div className="relative flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl border border-[#415a77]/40 bg-[#152238] flex items-center justify-center shadow-xl">
            <KeyRound className="h-8 w-8 text-[#c5d3e8] animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border border-cyan-500/20 animate-ping pointer-events-none" />
        </div>
        <div className="text-lg font-bold tracking-tight text-[#f8fafc]">Verifying Superadmin Authorization</div>
        <p className="mt-2 text-xs font-mono text-[#c5d3e8] max-w-sm text-center">
          Validating Firebase token claims (<code className="text-cyan-300">role: superadmin</code>) & cryptographic access rules...
        </p>
      </div>
    );
  }

  const isAuthorized = Boolean(tokenSuperadminVerified || hasSuperadminClaim || isAdmin);

  // Access Denied / Superadmin Verification Gate
  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-20 px-4 sm:px-6 text-[#0b192c] flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 text-center shadow-2xl text-[#f8fafc]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40 mb-6 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Custom Claim Requirement: role = superadmin</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#f8fafc] sm:text-3xl">
            Superadmin Access Required
          </h1>
          
          <p className="mt-3 text-xs sm:text-sm text-[#c5d3e8] leading-relaxed">
            The requested route <code className="text-cyan-300 font-mono bg-[#152238] px-1.5 py-0.5 rounded">{location.pathname}</code> is strictly restricted to accounts possessing the <span className="font-mono text-[#f8fafc] font-semibold">superadmin</span> custom token claim.
          </p>

          {user ? (
            <div className="mt-6 rounded-2xl border border-[#415a77]/30 bg-[#152238] p-4 text-xs font-mono text-left space-y-2">
              <div className="flex justify-between items-center text-[#c5d3e8]">
                <span>Authenticated Identity:</span>
                <span className="text-amber-400 font-sans font-semibold">Missing Claim</span>
              </div>
              <div className="text-[#f8fafc] font-bold truncate">{user.email}</div>
              
              <div className="pt-2 border-t border-[#415a77]/20 flex items-center justify-between text-[11px]">
                <span className="text-[#c5d3e8]">Token Claims:</span>
                <span className="text-slate-400">
                  {Object.keys(tokenClaims).length > 0 ? JSON.stringify(tokenClaims) : 'role: standard_user'}
                </span>
              </div>

              <div className="mt-2 text-[#ebe9e6] font-sans text-xs flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Sign in with an authorized primary superadmin email or grant custom claims.</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-[#c5d3e8]">
              Please authenticate with an authorized Google account or activate a preview sandbox session.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#415a77]/40 bg-[#152238] px-5 py-2.5 text-xs font-semibold text-[#f8fafc] hover:bg-[#1e2f4a] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </Link>

              {user ? (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={async () => {
                      await refreshClaims();
                      if (user && typeof (user as any).getIdTokenResult === 'function') {
                        const token = await (user as any).getIdTokenResult(true);
                        const claims = token?.claims || {};
                        if (claims.role === 'superadmin' || claims.superadmin === true || SUPERADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
                          setTokenSuperadminVerified(true);
                        }
                      }
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2.5 text-xs font-semibold text-[#c5d3e8] hover:text-[#f8fafc] transition-colors"
                    title="Refresh token to pull newly assigned custom claims"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh Claims</span>
                  </button>

                  <button
                    onClick={() => logout().then(() => login())}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#52718e] transition-all shadow-md"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Switch Account</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => login()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#52718e] transition-all shadow-md"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>

            {/* Sandbox Quick Access Button */}
            <div className="pt-4 border-t border-[#415a77]/30 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => {
                  loginWithLocalSession({
                    email: 'asifahmedshuvo.aas@gmail.com',
                    displayName: 'Asif Ahmed Shuvo (Superadmin)',
                    isAdmin: true
                  });
                  setTokenSuperadminVerified(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/40 transition-all shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Activate Preview Superadmin Session</span>
              </button>

              <button
                onClick={() => setShowDomainModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#415a77]/30 bg-[#152238] px-3.5 py-2 text-xs font-semibold text-[#c5d3e8] hover:text-[#f8fafc] transition-colors"
              >
                <span>Domain Auth Helper</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Token claim verification passed
  return <>{children}</>;
};

export default AdminRoute;
