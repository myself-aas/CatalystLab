import React from 'react';
import { Loader2 } from 'lucide-react';

export const RouteLoadingSkeleton: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#415a77]/30 bg-[#0b192c]/90 px-8 py-10 shadow-2xl backdrop-blur-md">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#415a77]/20" />
          <Loader2 className="h-8 w-8 animate-spin text-[#c5d3e8]" />
        </div>
        <div className="text-center">
          <p className="font-mono text-sm font-semibold tracking-wide text-[#f8fafc]">
            Loading CatalystLab Module...
          </p>
          <p className="mt-1 text-xs text-[#c5d3e8]">
            Hydrating high-precision telemetry interfaces
          </p>
        </div>
      </div>
    </div>
  );
};
