'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OrchestrationTickerProps {
  status: string;
  stats?: Record<string, number>;
}

export const OrchestrationTicker = ({ status, stats }: OrchestrationTickerProps) => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-[#F4F9F5] rounded-3xl border border-[#68BA7F]/20 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E6F40] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2E6F40]"></span>
        </span>
        <p className="text-sm font-bold text-[#1E4D2B]">{status}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.entries(stats).map(([source, count]) => (
            <div key={source} className="text-xs text-[#434842]">
              {source}: <span className="font-mono font-semibold">{count} relevant</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default OrchestrationTicker;
