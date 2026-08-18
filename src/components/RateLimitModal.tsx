import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getRateLimitStatus, VISITOR_DAILY_LIMIT, USER_DAILY_LIMIT } from '../utils/rateLimiter';
import { 
  X, 
  Zap, 
  Crown, 
  User as UserIcon, 
  Globe, 
  Clock, 
  LogIn, 
<<<<<<< HEAD
  AlertTriangle
=======
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Shield
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
} from 'lucide-react';

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'limit_reached' | 'info';
}

export const RateLimitModal: React.FC<RateLimitModalProps> = ({ 
  isOpen, 
  onClose,
  reason = 'info' 
}) => {
  const { user, isAdmin, login } = useAuth();
  const status = getRateLimitStatus(user, isAdmin);

  if (!isOpen) return null;

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#415a77]/40 bg-[#0b192c] p-6 shadow-2xl text-[#f8fafc]">
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        
        {/* Close Button */}
        <button
          onClick={onClose}
<<<<<<< HEAD
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#c5d3e8] hover:bg-[#152238] hover:text-[#f8fafc] transition-colors"
=======
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${
            status.isExceeded 
<<<<<<< HEAD
              ? 'border-rose-500/40 bg-rose-500/20 text-rose-400' 
              : 'border-[#415a77]/40 bg-[#415a77]/20 text-[#c5d3e8]'
=======
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' 
              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          }`}>
            {status.isExceeded ? <AlertTriangle className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          </div>
          <div>
<<<<<<< HEAD
            <h3 className="text-lg font-bold text-[#f8fafc]">
=======
            <h3 className="text-lg font-bold text-white">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              {status.isExceeded 
                ? `${status.tierLabel} Limit Reached` 
                : 'Audit Rate Limit & Quota Matrix'}
            </h3>
<<<<<<< HEAD
            <p className="text-xs text-[#c5d3e8] mt-0.5">
=======
            <p className="text-xs text-slate-400 mt-0.5">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              CatalystLab Precision Telemetry Engine Allocation
            </p>
          </div>
        </div>

        {/* Limit Warning (If Exceeded) */}
        {status.isExceeded && (
<<<<<<< HEAD
          <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-[#f8fafc] space-y-2">
=======
          <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-slate-300 space-y-2">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            <div className="flex items-center justify-between text-rose-300 font-bold">
              <span>Daily Quota Exhausted: {status.used} / {status.limit} Audits</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="h-3.5 w-3.5" />
                <span>Resets in {status.formattedResetTime}</span>
              </span>
            </div>
<<<<<<< HEAD
            <p className="text-[#c5d3e8]">
=======
            <p className="text-slate-400">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              {user 
                ? 'You have used all 10 daily master audits allocated for registered accounts. Your quota will automatically replenish at midnight.'
                : 'You have used all 5 complimentary audits allocated for guest visitors. Sign in with Google to immediately unlock 10 audits per day.'}
            </p>
          </div>
        )}

        {/* Tier Breakdown Cards */}
        <div className="space-y-3 mb-6">
          
          {/* Superadmin Tier */}
          <div className={`rounded-xl border p-3.5 transition-colors ${
            status.tier === 'superadmin' 
<<<<<<< HEAD
              ? 'border-[#c5d3e8]/60 bg-[#152238] shadow-md' 
              : 'border-[#415a77]/30 bg-[#0d1b2a]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="h-4 w-4 text-[#c5d3e8]" />
                <span className="text-xs font-bold text-[#f8fafc]">1. Primary Superadmins</span>
              </div>
              <span className="rounded-md bg-[#415a77]/40 border border-[#415a77]/60 px-2 py-0.5 text-[10px] font-mono font-bold text-[#f8fafc]">
                Unlimited Audits
              </span>
            </div>
            <p className="text-[11px] text-[#c5d3e8] mt-1 pl-6">
=======
              ? 'border-amber-500/50 bg-amber-950/20 shadow-md shadow-amber-950/20' 
              : 'border-slate-800 bg-slate-900/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-white">1. Primary Superadmins</span>
              </div>
              <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                Unlimited Audits
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pl-6">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              No rate limits. Dedicated priority engine queuing across all 8 diagnostic containers.
            </p>
          </div>

          {/* Registered Users Tier */}
          <div className={`rounded-xl border p-3.5 transition-colors ${
            status.tier === 'user' 
<<<<<<< HEAD
              ? 'border-[#415a77] bg-[#152238] shadow-md' 
              : 'border-[#415a77]/30 bg-[#0d1b2a]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserIcon className="h-4 w-4 text-[#c5d3e8]" />
                <span className="text-xs font-bold text-[#f8fafc]">2. Registered Users</span>
              </div>
              <span className="rounded-md bg-[#415a77]/40 border border-[#415a77]/60 px-2 py-0.5 text-[10px] font-mono font-bold text-[#c5d3e8]">
                {USER_DAILY_LIMIT} Audits / Day
              </span>
            </div>
            <p className="text-[11px] text-[#c5d3e8] mt-1 pl-6">
=======
              ? 'border-cyan-500/50 bg-cyan-950/20 shadow-md shadow-cyan-950/20' 
              : 'border-slate-800 bg-slate-900/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserIcon className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">2. Registered Users</span>
              </div>
              <span className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                {USER_DAILY_LIMIT} Audits / Day
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pl-6">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              Saved Firestore audit history, downloadable PDF dossiers, and custom uptime monitoring.
            </p>
          </div>

          {/* Guest Visitors Tier */}
          <div className={`rounded-xl border p-3.5 transition-colors ${
            status.tier === 'visitor' 
<<<<<<< HEAD
              ? 'border-[#415a77] bg-[#152238] shadow-md' 
              : 'border-[#415a77]/30 bg-[#0d1b2a]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-[#c5d3e8]" />
                <span className="text-xs font-bold text-[#f8fafc]">3. Public Visitors</span>
              </div>
              <span className="rounded-md bg-[#0d1b2a] border border-[#415a77]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#c5d3e8]">
                {VISITOR_DAILY_LIMIT} Audits / Day
              </span>
            </div>
            <p className="text-[11px] text-[#c5d3e8] mt-1 pl-6">
=======
              ? 'border-indigo-500/50 bg-indigo-950/20 shadow-md shadow-indigo-950/20' 
              : 'border-slate-800 bg-slate-900/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">3. Public Visitors</span>
              </div>
              <span className="rounded-md bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                {VISITOR_DAILY_LIMIT} Audits / Day
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pl-6">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              Instant diagnostic scans with live telemetry feedback without requiring an account.
            </p>
          </div>

        </div>

        {/* Action Footer */}
<<<<<<< HEAD
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#415a77]/30">
          <div className="flex items-center gap-1.5 text-xs text-[#c5d3e8]">
            <Clock className="h-3.5 w-3.5 text-[#415a77]" />
            <span>Daily reset in <strong className="text-[#f8fafc]">{status.formattedResetTime}</strong></span>
=======
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Daily reset in <strong className="text-slate-200">{status.formattedResetTime}</strong></span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!user ? (
              <button
                onClick={async () => {
                  try {
                    await login();
                    onClose();
                  } catch {}
                }}
<<<<<<< HEAD
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-4 py-2 text-xs font-bold text-white hover:bg-[#33475e] transition-all shadow-md"
=======
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In for 10/day</span>
              </button>
            ) : (
              <button
                onClick={onClose}
<<<<<<< HEAD
                className="w-full sm:w-auto rounded-xl bg-[#152238] border border-[#415a77]/40 px-4 py-2 text-xs font-bold text-[#f8fafc] hover:bg-[#0d1b2a] transition-colors"
=======
                className="w-full sm:w-auto rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
