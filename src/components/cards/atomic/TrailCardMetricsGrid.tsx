import React from 'react';
import { TrailCardMetricsGridProps } from '../../../types/card';
import { formatDistance, formatElevation, formatDuration } from '../../../utils/cardUtils';

export const TrailCardMetricsGrid: React.FC<TrailCardMetricsGridProps> = ({ metrics }) => {
  const { distanceKm, elevationMeters, durationMinutes } = metrics;

  return (
    <div className="px-4 pb-4 pt-1">
      {/* Horizontal Divider Line */}
      <div className="h-[1px] w-full bg-zinc-800/60 mb-3" />

      {/* 3-Column Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Distance Column */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50 group-hover:bg-zinc-800/40 transition-colors">
          <span className="text-sm sm:text-base font-bold font-mono text-zinc-100 tracking-tight leading-none group-hover:text-cyan-400 transition-colors">
            {formatDistance(distanceKm)}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">
            Distance
          </span>
        </div>

        {/* Elevation Column */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50 group-hover:bg-zinc-800/40 transition-colors">
          <span className="text-sm sm:text-base font-bold font-mono text-zinc-100 tracking-tight leading-none group-hover:text-cyan-400 transition-colors">
            {formatElevation(elevationMeters)}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">
            Elevation
          </span>
        </div>

        {/* Duration Column */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50 group-hover:bg-zinc-800/40 transition-colors">
          <span className="text-sm sm:text-base font-bold font-mono text-zinc-100 tracking-tight leading-none group-hover:text-cyan-400 transition-colors">
            {formatDuration(durationMinutes)}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">
            Duration
          </span>
        </div>
      </div>
    </div>
  );
};
