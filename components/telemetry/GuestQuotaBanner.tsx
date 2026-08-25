import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Clock, Sparkles, ChevronRight, Lock } from 'lucide-react';
import type { GuestQuotaStatus } from '../../types/telemetry';

interface GuestQuotaBannerProps {
  quota: GuestQuotaStatus;
  onUpgradeClick?: () => void;
  onSignInClick?: () => void;
}

export const GuestQuotaBanner: React.FC<GuestQuotaBannerProps> = ({
  quota,
  onUpgradeClick,
  onSignInClick,
}) => {
  const percentage = Math.min(100, Math.max(0, (quota.remaining / Math.max(1, quota.limit)) * 100));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isCritical = quota.remaining <= 1;
  const isExhausted = quota.remaining === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border p-4 backdrop-blur-md overflow-hidden transition-all duration-300 ${
        isExhausted
          ? 'bg-[#111726]/95 border-[#EF4444]/40 shadow-lg shadow-[#EF4444]/10'
          : isCritical
          ? 'bg-[#111726]/90 border-[#F59E0B]/40 shadow-md'
          : 'bg-[#111726]/80 border-slate-800'
      }`}
    >
      {/* Background Ambience */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r ${
          isExhausted
            ? 'from-[#EF4444]/30 to-transparent'
            : isCritical
            ? 'from-[#F59E0B]/20 to-transparent'
            : 'from-[#06B6D4]/20 via-[#10B981]/10 to-transparent'
        }`}
      />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Section: Progress Ring + Info */}
        <div className="flex items-center gap-3.5">
          {/* Circular Progress Ring */}
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="3.5"
                fill="transparent"
              />
              <motion.circle
                cx="24"
                cy="24"
                r={radius}
                stroke={isExhausted ? '#EF4444' : isCritical ? '#F59E0B' : '#06B6D4'}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-slate-100">
              {quota.remaining}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">
                {isExhausted
                  ? 'Daily Guest Telemetry Quota Exhausted'
                  : `${quota.remaining} of ${quota.limit} Scans Remaining Today`}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                  quota.tier === 'visitor'
                    ? 'bg-slate-800/80 text-slate-300 border-slate-700'
                    : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                }`}
              >
                {quota.tier} Tier
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                Resets at 00:00 UTC ({quota.formattedResetTime})
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">Sliding Window Protection</span>
            </p>
          </div>
        </div>

        {/* Right Section: CTAs */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {quota.tier === 'visitor' && onSignInClick && (
            <button
              onClick={onSignInClick}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Sign In (50/Day)</span>
            </button>
          )}

          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-90 text-slate-950 font-bold text-xs font-mono transition-opacity flex items-center gap-1.5 shadow-md shadow-[#06B6D4]/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock Unlimited</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
