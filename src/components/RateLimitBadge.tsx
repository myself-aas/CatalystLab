import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getRateLimitStatus } from '../utils/rateLimiter';
import { Zap, Crown, Clock, LogIn, Info } from 'lucide-react';

interface RateLimitBadgeProps {
  compact?: boolean;
  onOpenInfo?: () => void;
}

export const RateLimitBadge: React.FC<RateLimitBadgeProps> = ({ compact = false, onOpenInfo }) => {
  const { user, isAdmin, login } = useAuth();
  const status = getRateLimitStatus(user, isAdmin);

  if (status.isUnlimited) {
    return (
      <div 
        onClick={onOpenInfo}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm cursor-pointer hover:border-[#415a77] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        title="Primary Superadmin - Unlimited Audits"
      >
        <Crown className="h-3.5 w-3.5 text-gray-600" />
        <span>Superadmin: Unlimited Audits</span>
      </div>
    );
  }

  const isWarning = status.remaining <= 1;
  const isDanger = status.remaining === 0;

  const badgeColor = isDanger 
    ? 'border-rose-300 bg-rose-50 text-rose-700 font-semibold' 
    : isWarning 
    ? 'border-amber-300 bg-amber-50 text-amber-800 font-semibold' 
    : 'border-black/30 bg-black/10 text-black font-semibold';

  if (compact) {
    return (
      <div 
        onClick={onOpenInfo}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-mono font-medium cursor-pointer transition-colors ${badgeColor}`}
        title={`Daily quota: ${status.used}/${status.limit} units used. Resets in ${status.formattedResetTime}`}
      >
        <Zap className="h-3 w-3" />
        <span>{status.singleRemaining}/{status.singleLimit} Audits Left</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-black/20 bg-white/90 px-3.5 py-2 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs ${badgeColor}`}>
          <Zap className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-black">
              {status.tierLabel} Quota
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
              {status.singleRemaining} / {status.singleLimit} Remaining Today
            </span>
          </div>
          <p className="text-[11px] text-black flex items-center gap-1 mt-0.5 font-medium">
            <Clock className="h-3 w-3 text-black" />
            <span>Resets in {status.formattedResetTime}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!user && (
          <button
            type="button"
            onClick={() => login()}
            className="flex items-center gap-1 rounded-lg bg-black hover:bg-black-hover border border-slate-500/30 px-2.5 py-1 text-[11px] font-bold text-white transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Sign in for 10 audits per day"
          >
            <LogIn className="h-3 w-3" />
            <span>Get 10/day (Sign In)</span>
          </button>
        )}

        {onOpenInfo && (
          <button
            type="button"
            onClick={onOpenInfo}
            className="text-black hover:text-black p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="View Rate Limit Tiers"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
