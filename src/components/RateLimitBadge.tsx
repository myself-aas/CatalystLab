import React from 'react';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
import { getRateLimitStatus } from '../utils/rateLimiter';
import { Zap, Crown, Clock, LogIn, Info } from 'lucide-react';
=======
import { getRateLimitStatus, VISITOR_DAILY_LIMIT, USER_DAILY_LIMIT } from '../utils/rateLimiter';
import { Zap, Crown, Shield, Clock, LogIn, Info } from 'lucide-react';
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

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
<<<<<<< HEAD
        className="inline-flex items-center gap-1.5 rounded-full border border-[#415a77]/40 bg-[#0b192c] px-3 py-1 text-xs font-semibold text-[#f8fafc] shadow-sm cursor-pointer hover:border-[#415a77] transition-colors"
        title="Primary Superadmin - Unlimited Audits"
      >
        <Crown className="h-3.5 w-3.5 text-[#c5d3e8]" />
=======
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-cyan-500/10 px-3 py-1 text-xs font-semibold text-amber-300 shadow-sm cursor-pointer hover:border-amber-500/50 transition-colors"
        title="Primary Superadmin - Unlimited Audits"
      >
        <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        <span>Superadmin: Unlimited Audits</span>
      </div>
    );
  }

  const isWarning = status.remaining <= 1;
  const isDanger = status.remaining === 0;

  const badgeColor = isDanger 
<<<<<<< HEAD
    ? 'border-rose-500/40 bg-rose-500/10 text-rose-700 font-semibold' 
    : isWarning 
    ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 font-semibold' 
    : 'border-[#415a77]/30 bg-[#415a77]/10 text-[#0b192c] font-semibold';
=======
    ? 'border-rose-500/40 bg-rose-500/10 text-rose-300' 
    : isWarning 
    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' 
    : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';

  const progressPct = status.limit ? Math.min(100, Math.round((status.used / status.limit) * 100)) : 0;
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

  if (compact) {
    return (
      <div 
        onClick={onOpenInfo}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-mono font-medium cursor-pointer transition-colors ${badgeColor}`}
        title={`Daily quota: ${status.used}/${status.limit} used. Resets in ${status.formattedResetTime}`}
      >
        <Zap className="h-3 w-3" />
        <span>{status.remaining}/{status.limit} Audits Left</span>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[#415a77]/20 bg-white/80 px-3.5 py-2 backdrop-blur-md shadow-sm">
=======
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 backdrop-blur-md">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
      <div className="flex items-center gap-2.5">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs ${badgeColor}`}>
          <Zap className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
<<<<<<< HEAD
            <span className="text-xs font-bold text-[#0b192c]">
=======
            <span className="text-xs font-bold text-white">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              {status.tierLabel} Quota
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
              {status.remaining} / {status.limit} Remaining Today
            </span>
          </div>
<<<<<<< HEAD
          <p className="text-[11px] text-[#415a77] flex items-center gap-1 mt-0.5 font-medium">
            <Clock className="h-3 w-3 text-[#415a77]" />
=======
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-slate-500" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            <span>Resets in {status.formattedResetTime}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!user && (
          <button
            type="button"
            onClick={() => login()}
<<<<<<< HEAD
            className="flex items-center gap-1 rounded-lg bg-[#0b192c] border border-[#0b192c] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#152238] transition-colors shadow-sm"
=======
            className="flex items-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
<<<<<<< HEAD
            className="text-[#415a77] hover:text-[#0b192c] p-1 transition-colors"
=======
            className="text-slate-500 hover:text-slate-300 p-1"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            title="View Rate Limit Tiers"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
