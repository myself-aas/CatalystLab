import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { SUBSCRIPTION_PLANS } from '../../data/pricingData';
import { SubscriptionPlanId } from '../../types';
import { 
  fetchServerRateLimitStatus, 
  getRateLimitStatus, 
  RateLimitStatus, 
  MASTER_AUDIT_COST, 
  SINGLE_ENGINE_COST 
} from '../../utils/rateLimiter';
import { 
  Gauge, 
  Clock, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Info,
  Sliders,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../lib/utils';

export const UserRateLimitAllocationCard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { planId, isTrialActive, trialDaysRemaining, openTrialModal, currentPlan } = useSubscription();
  const [status, setStatus] = useState<RateLimitStatus>(() => getRateLimitStatus(user, isAdmin));
  const [loading, setLoading] = useState(false);
  const [testingUnit, setTestingUnit] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; remaining?: number } | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const serverStatus = await fetchServerRateLimitStatus(user);
      if (serverStatus) {
        setStatus(serverStatus);
      } else {
        setStatus(getRateLimitStatus(user, isAdmin));
      }
    } catch {
      setStatus(getRateLimitStatus(user, isAdmin));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const handleUpdate = (e: CustomEvent<RateLimitStatus>) => {
      if (e.detail) setStatus(e.detail);
    };
    window.addEventListener('catalyst-rate-limit-updated' as any, handleUpdate);
    return () => {
      window.removeEventListener('catalyst-rate-limit-updated' as any, handleUpdate);
    };
  }, [user, isAdmin]);

  const handleSimulateCheck = async (cost: number) => {
    setTestingUnit(cost);
    setTestResult(null);
    try {
      const res = await fetch('/api/rate-limit/status', {
        headers: {
          'x-user-email': user?.email || '',
          'x-user-id': user?.uid || ''
        }
      });
      const data = await res.json();
      if (data.success) {
        const canExecute = data.isUnlimited || data.unitsRemaining >= cost;
        if (canExecute) {
          setTestResult({
            success: true,
            message: `Quota Verification Passed: ${cost} unit(s) available for immediate execution.`,
            remaining: data.unitsRemaining
          });
        } else {
          setTestResult({
            success: false,
            message: `Rate Limit Restricted: Required ${cost} unit(s), but only ${data.unitsRemaining} unit(s) remain today. Resets in ${data.formattedResetTime}.`,
            remaining: data.unitsRemaining
          });
        }
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: `Network error verifying rate limits: ${errorMessage(err)}`
      });
    } finally {
      setTestingUnit(null);
    }
  };

  const curlExample = `curl -X POST https://catalystlab.ai/api/run-engine \\
  -H "Content-Type: application/json" \\
  -H "x-user-email: ${user?.email || 'developer@example.com'}" \\
  -d '{"url": "https://example.com", "engine": "health"}' -i`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const percentRemaining = status.isUnlimited 
    ? 100 
    : status.limit 
      ? Math.max(0, Math.min(100, Math.round((status.remaining / status.limit) * 100))) 
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Resource Allocation Banner */}
      <div className="ds-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/10 ds-muted">
                <Cpu className="h-4 w-4" />
              </span>
              <h3 className="text-xl font-bold text-foreground">Daily Compute Quota & Allocation</h3>
              <span className="rounded-md bg-muted border border-border px-2.5 py-0.5 ds-eyebrow">
                {status.tierLabel}
              </span>
            </div>
            <p className="text-sm ds-muted">
              Fair-share GPU & worker concurrency middleware with sliding burst regulation and zero-loss multi-engine deduplication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadStatus}
              disabled={loading}
              className="flex items-center gap-2 ds-card px-4 py-2 text-xs font-bold ds-muted hover:bg-background hover:border-border transition-all shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Middleware Active</span>
            </div>
          </div>
        </div>

        {/* Progress & Detailed Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          {/* Main Units Meter */}
          <div className="md:col-span-1 rounded-xl bg-background border border-border p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="ds-eyebrow">Units Remaining</span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {status.isUnlimited ? '∞ Unlimited' : `${status.remaining} / ${status.limit} Units`}
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-accent p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    percentRemaining > 40 ? 'bg-primary' : percentRemaining > 15 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${percentRemaining}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] ds-muted">
                <span>{status.used} Units Used Today</span>
                <span>{percentRemaining}% Available</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="ds-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 ds-muted" />
                Daily Reset In:
              </span>
              <span className="font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                {status.formattedResetTime} (Midnight UTC)
              </span>
            </div>
          </div>

          {/* Breakdown by Scan Types */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Master Audits Box */}
            <div className="rounded-xl bg-background border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Sparkles className="h-4 w-4 ds-muted" />
                  Master Audits (All 8 Engines)
                </span>
                <span className="rounded bg-foreground/10 px-2 py-0.5 text-[10px] font-mono font-bold ds-muted">
                  {MASTER_AUDIT_COST} Units / Run
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-foreground">
                  {status.isUnlimited ? '∞' : status.masterRemaining} <span className="text-xs font-normal ds-muted">available today</span>
                </div>
                <p className="mt-1 text-[11px] ds-muted leading-relaxed">
                  Triggers all 8 telemetry scanners concurrently. Deduplicated session keys ensure zero double-billing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] ds-muted">Total Limit: {status.isUnlimited ? '∞' : `${status.masterLimit} / day`}</span>
                <button
                  onClick={() => handleSimulateCheck(MASTER_AUDIT_COST)}
                  disabled={testingUnit !== null}
                  className="text-[11px] font-bold ds-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Verify Master Quota →
                </button>
              </div>
            </div>

            {/* Single Engines Box */}
            <div className="rounded-xl bg-background border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Layers className="h-4 w-4 ds-muted" />
                  Single Diagnostic Engines
                </span>
                <span className="rounded bg-foreground/10 px-2 py-0.5 text-[10px] font-mono font-bold ds-muted">
                  {SINGLE_ENGINE_COST} Unit / Run
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-foreground">
                  {status.isUnlimited ? '∞' : status.singleRemaining} <span className="text-xs font-normal ds-muted">available today</span>
                </div>
                <p className="mt-1 text-[11px] ds-muted leading-relaxed">
                  Individual scans for DOM Health, Edge TTFB Latency, /llms.txt AI crawler parity, SecOps, or ESG Carbon.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] ds-muted">Total Limit: {status.isUnlimited ? '∞' : `${status.singleLimit} / day`}</span>
                <button
                  onClick={() => handleSimulateCheck(SINGLE_ENGINE_COST)}
                  disabled={testingUnit !== null}
                  className="text-[11px] font-bold ds-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Verify Single Quota →
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Live Test Feedback Banner */}
        {testResult && (
          <div className={`mt-6 rounded-xl p-4 text-xs flex items-start gap-3 border animate-fade-in ${
            testResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold">{testResult.success ? 'Success: ' : 'Notice: '}</span>
              {testResult.message}
            </div>
            <button 
              onClick={() => setTestResult(null)}
              className="text-xs font-bold underline opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Middleware Architecture & Header Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rate Limiting Rules & Headers */}
        <div className="ds-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 ds-muted" />
              <h4 className="text-base font-bold text-foreground">HTTP Rate Limiting Standards</h4>
            </div>
            <p className="text-xs ds-muted mb-4 leading-relaxed">
              CatalystLab complies with IETF RateLimit Header specifications. Every response from <code className="text-foreground font-mono font-bold bg-muted px-1.5 py-0.5 rounded">/api/run-engine</code> and <code className="text-foreground font-mono font-bold bg-muted px-1.5 py-0.5 rounded">/api/v1/*</code> includes the following real-time rate headers:
            </p>

            <div className="space-y-2 rounded-xl bg-background border border-border p-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <span className="ds-muted">X-RateLimit-Limit:</span>
                <span className="font-bold text-foreground">{status.isUnlimited ? 'unlimited' : status.limit}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <span className="ds-muted">X-RateLimit-Remaining:</span>
                <span className="font-bold text-foreground">{status.isUnlimited ? 'unlimited' : status.remaining}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <span className="ds-muted">X-RateLimit-Used:</span>
                <span className="font-bold text-foreground">{status.used}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <span className="ds-muted">X-RateLimit-Tier:</span>
                <span className="font-bold text-foreground">{status.tier}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="ds-muted">RateLimit-Policy:</span>
                <span className="font-bold text-foreground">{status.isUnlimited ? 'none' : `${status.limit};w=86400`}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-[11px] ds-muted">
            <Info className="h-4 w-4 ds-muted shrink-0" />
            <span>Burst regulator allows up to 45 requests/min for registered developer accounts.</span>
          </div>
        </div>

        {/* Developer Integration & cURL */}
        <div className="ds-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 ds-muted" />
                <h4 className="text-base font-bold text-foreground">CI/CD & CLI Header Inspection</h4>
              </div>
              <button
                onClick={handleCopyCurl}
                className="flex items-center gap-1.5 ds-card px-3 py-1 text-xs font-bold ds-muted hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <p className="text-xs ds-muted mb-3 leading-relaxed">
              Inspect rate limit response headers directly from your terminal or continuous integration test workflows:
            </p>

            <pre className="rounded-xl bg-background p-4 text-[11px] font-mono text-emerald-600 overflow-x-auto scrollbar-none touch-pan-x leading-relaxed border border-border">
              <code>{curlExample}</code>
            </pre>
          </div>

          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="ds-muted">Need a dedicated Pro API key?</span>
            <a 
              href="/api-docs" 
              className="font-bold ds-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore API Catalog & Keys →
            </a>
          </div>
        </div>

      </div>

      {/* 5-Tier Subscription Plans & 7-Day Free Trial Tier Management */}
      <div className="ds-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 ds-muted" />
              <h4 className="text-lg font-bold text-foreground">Subscription &amp; Compute Tier</h4>
              {isTrialActive && (
                <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> 7-Day Trial ({trialDaysRemaining}d remaining)
                </span>
              )}
            </div>
            <p className="text-xs ds-muted mt-1">
              Current active plan: <strong className="text-foreground uppercase">{currentPlan.name}</strong> ({currentPlan.dailyComputeUnits} units/day). Upgrade anytime or activate a 7-day free trial without a credit card.
            </p>
          </div>

          <Link
            to="/pricing"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <span>View Full Pricing Matrix</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 5 Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-6">
          {(['free', 'starter', 'pro', 'team', 'enterprise'] as SubscriptionPlanId[]).map((tierKey) => {
            const item = SUBSCRIPTION_PLANS[tierKey];
            const isCurrent = planId === tierKey;

            return (
              <div 
                key={tierKey}
                className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                  isCurrent 
                    ? 'border-black bg-muted shadow-md ring-1 ring-black/40' 
                    : 'border-border bg-background hover:border-border'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{item.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xl font-black text-foreground">
                    ${item.priceMonthly}<span className="text-xs font-normal ds-muted">/mo</span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-emerald-700">
                    {item.dailyComputeUnits} units / day
                  </div>
                  <p className="mt-2 text-[11px] ds-muted line-clamp-2">
                    {item.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  {isCurrent ? (
                    <button 
                      disabled 
                      className="w-full py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-primary-foreground opacity-90 cursor-default"
                    >
                      Current Tier
                    </button>
                  ) : tierKey === 'free' ? (
                    <Link
                      to="/pricing"
                      className="block text-center w-full py-1.5 rounded-lg text-xs font-bold border border-border ds-muted hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Free Plan
                    </Link>
                  ) : (
                    <button
                      onClick={() => openTrialModal(tierKey)}
                      className="w-full py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    >
                      7-Day Free Trial
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
