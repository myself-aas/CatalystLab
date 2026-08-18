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
  AlertTriangle
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#415a77]/40 bg-[#0b192c] p-6 shadow-2xl text-[#f8fafc]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#c5d3e8] hover:bg-[#152238] hover:text-[#f8fafc] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${
            status.isExceeded 
              ? 'border-rose-500/40 bg-rose-500/20 text-rose-400' 
              : 'border-[#415a77]/40 bg-[#415a77]/20 text-[#c5d3e8]'
          }`}>
            {status.isExceeded ? <AlertTriangle className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f8fafc]">
              {status.isExceeded 
                ? `${status.tierLabel} Limit Reached` 
                : 'Audit Rate Limit & Quota Matrix'}
            </h3>
            <p className="text-xs text-[#c5d3e8] mt-0.5">
              CatalystLab Precision Telemetry Engine Allocation
            </p>
          </div>
        </div>

        {/* Limit Warning (If Exceeded) */}
        {status.isExceeded && (
          <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-[#f8fafc] space-y-2">
            <div className="flex items-center justify-between text-rose-300 font-bold">
              <span>Daily Quota Exhausted: {status.used} / {status.limit} Audits</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="h-3.5 w-3.5" />
                <span>Resets in {status.formattedResetTime}</span>
              </span>
            </div>
            <p className="text-[#c5d3e8]">
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
              No rate limits. Dedicated priority engine queuing across all 8 diagnostic containers.
            </p>
          </div>

          {/* Registered Users Tier */}
          <div className={`rounded-xl border p-3.5 transition-colors ${
            status.tier === 'user' 
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
              Saved Firestore audit history, downloadable PDF dossiers, and custom uptime monitoring.
            </p>
          </div>

          {/* Guest Visitors Tier */}
          <div className={`rounded-xl border p-3.5 transition-colors ${
            status.tier === 'visitor' 
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
              Instant diagnostic scans with live telemetry feedback without requiring an account.
            </p>
          </div>

        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#415a77]/30">
          <div className="flex items-center gap-1.5 text-xs text-[#c5d3e8]">
            <Clock className="h-3.5 w-3.5 text-[#415a77]" />
            <span>Daily reset in <strong className="text-[#f8fafc]">{status.formattedResetTime}</strong></span>
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-4 py-2 text-xs font-bold text-white hover:bg-[#33475e] transition-all shadow-md"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In for 10/day</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl bg-[#152238] border border-[#415a77]/40 px-4 py-2 text-xs font-bold text-[#f8fafc] hover:bg-[#0d1b2a] transition-colors"
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
