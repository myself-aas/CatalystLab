import React from 'react';
import { TrailCardMiddleRowProps } from '../../../types/card';
import { getDifficultyTheme } from '../../../utils/cardUtils';
import { MapPin, Navigation } from 'lucide-react';

export const TrailCardMiddleRow: React.FC<TrailCardMiddleRowProps> = ({
  difficulty,
  metadataSubtext,
  mapIconUrl,
  onMapIconPress,
}) => {
  const theme = getDifficultyTheme(difficulty);

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMapIconPress) {
      onMapIconPress();
    }
  };

  const handleMapKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      if (onMapIconPress) {
        onMapIconPress();
      }
    }
  };

  return (
    <div className="flex flex-row items-center justify-between px-4 pt-3 pb-2 gap-3">
      {/* Left Column: Difficulty Indicator & Metadata Subtext */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase border ${theme.bgClass} ${theme.colorClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${theme.dotColor} animate-pulse`} />
            <span>{theme.label}</span>
          </span>
        </div>

        {metadataSubtext && (
          <p 
            className="text-xs font-normal text-zinc-400 mt-1.5 line-clamp-1 leading-snug"
            title={metadataSubtext}
          >
            {metadataSubtext}
          </p>
        )}
      </div>

      {/* Right Column: High-contrast Map Location Pin / Floating Action Element */}
      <button
        type="button"
        onClick={handleMapClick}
        onKeyDown={handleMapKeyDown}
        className="shrink-0 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 hover:border-cyan-500/50 text-zinc-200 hover:text-cyan-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-zinc-950 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] group/btn"
        aria-label="View map route and coordinates"
        title="View trail on map"
      >
        {mapIconUrl ? (
          <img 
            src={mapIconUrl} 
            alt="Map icon" 
            className="w-4 h-4 object-contain" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <MapPin className="w-4 h-4 text-cyan-400 group-hover/btn:scale-110 group-hover/btn:text-cyan-300 transition-transform" />
        )}
      </button>
    </div>
  );
};
