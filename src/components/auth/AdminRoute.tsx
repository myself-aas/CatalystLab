import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSuperadminClaim } from '../../lib/authClaims';
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
import { logger } from '../../lib/logger';

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
        if (typeof (user as any).getIdTokenResult === 'function') {
          const tokenResult = await (user as any).getIdTokenResult();
          const claims = tokenResult?.claims || {};
          if (isMounted) {
            setTokenSuperadminVerified(isSuperadminClaim(claims));
          }
        } else if (isMounted) {
          setTokenSuperadminVerified(hasSuperadminClaim || isAdmin);
        }
      } catch (err) {
        logger.warn("Direct token claim verification warning:", err);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
        <div className="relative flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl border border-border bg-muted flex items-center justify-center shadow-xl">
            <KeyRound className="h-8 w-8 text-muted-foreground animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border border-cyan-500/20 animate-ping pointer-events-none" />
        </div>
        <div className="text-lg font-bold tracking-tight text-foreground">Verifying Superadmin Authorization</div>
        <p className="mt-2 text-xs font-mono text-muted-foreground max-w-sm text-center">
          Validating Firebase token claims (<code className="text-cyan-300">role: superadmin</code>) & cryptographic access rules...
        </p>
      </div>
    );
  }

  const isAuthorized = Boolean(tokenSuperadminVerified || hasSuperadminClaim || isAdmin);

  // Access Denied / Superadmin Verification Gate
  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-background py-20 px-4 sm:px-6 text-foreground flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-8 text-center shadow-2xl text-foreground">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border mb-6 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Custom Claim Requirement: role = superadmin</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Superadmin Access Required
          </h1>
          
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The requested route <code className="text-cyan-300 font-mono bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code> is strictly restricted to accounts possessing the <span className="font-mono text-foreground font-semibold">superadmin</span> custom token claim.
          </p>

          {user ? (
            <div className="mt-6 rounded-2xl border border-border bg-muted p-4 text-xs font-mono text-left space-y-2">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Authenticated Identity:</span>
                <span className="text-amber-400 font-sans font-semibold">Missing Claim</span>
              </div>
              <div className="text-foreground font-bold truncate">{user.email}</div>
              
              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Token Claims:</span>
                <span className="text-muted-foreground">
                  {Object.keys(tokenClaims).length > 0 ? JSON.stringify(tokenClaims) : 'role: standard_user'}
                </span>
              </div>

              <div className="mt-2 text-[#ebe9e6] font-sans text-xs flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Sign in with an authorized primary superadmin email or grant custom claims.</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              Please authenticate with an authorized Google account or activate a preview sandbox session.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-[#1e2f4a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                        if (isSuperadminClaim(claims)) {
                          setTokenSuperadminVerified(true);
                        }
                      }
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Refresh token to pull newly assigned custom claims"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh Claims</span>
                  </button>

                  <button
                    onClick={() => logout().then(() => login())}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-foreground hover:bg-[#52718e] transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Switch Account</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => login()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-foreground hover:bg-[#52718e] transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>

            {import.meta.env.DEV && (
            <div className="flex flex-col items-center justify-center gap-2 border-t border-white/[0.06] pt-4 sm:flex-row">
              <button
                onClick={() => {
                  loginWithLocalSession({
                    email: 'asifahmedshuvo.aas@gmail.com',
                    displayName: 'Asif Ahmed Shuvo (Superadmin)',
                    isAdmin: true
                  });
                  setTokenSuperadminVerified(true);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2 text-xs font-bold text-emerald-300 shadow-sm transition-all hover:bg-emerald-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Dev-only superadmin session</span>
              </button>

              <button
                onClick={() => setShowDomainModal(true)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-muted px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
              >
                <span>Domain Auth Helper</span>
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Token claim verification passed
  return <>{children}</>;
};

export default AdminRoute;
