import React from 'react';
import { TrailCardProps } from '../../types/card';
import { TrailCardHeader } from './atomic/TrailCardHeader';
import { TrailCardMiddleRow } from './atomic/TrailCardMiddleRow';
import { TrailCardMetricsGrid } from './atomic/TrailCardMetricsGrid';

export const TrailCard: React.FC<TrailCardProps> = ({
  id,
  title,
  subtitle,
  imageUrl,
  imageAltText,
  difficulty,
  metadataSubtext,
  mapIconUrl,
  metrics,
  onCardPress,
  onMapIconPress,
  className = '',
}) => {
  const handleCardClick = () => {
    if (onCardPress) {
      onCardPress(id);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Avoid triggering if child button was the target
      if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') return;
      e.preventDefault();
      if (onCardPress) {
        onCardPress(id);
      }
    }
  };

  const handleMapPress = () => {
    if (onMapIconPress) {
      onMapIconPress(id);
    } else if (onCardPress) {
      onCardPress(id);
    }
  };

  return (
    <div
      id={`trail-card-${id}`}
      role="region"
      tabIndex={onCardPress ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`Trail card: ${title}, ${subtitle}. Difficulty: ${difficulty}.`}
      className={`group relative flex flex-col w-full rounded-2xl bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-500 ease-out shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
        onCardPress ? 'cursor-pointer hover:-translate-y-1.5' : ''
      } ${className}`}
    >
      {/* 1. Header Image Area (4:3 aspect ratio, linear gradient scrim, Title & Subtitle) */}
      <TrailCardHeader
        title={title}
        subtitle={subtitle}
        imageUrl={imageUrl}
        imageAltText={imageAltText}
      />

      {/* 2. Middle Context Row (Difficulty badge, creation/authoring subtext, Map Action Icon) */}
      <TrailCardMiddleRow
        difficulty={difficulty}
        metadataSubtext={metadataSubtext}
        mapIconUrl={mapIconUrl}
        onMapIconPress={handleMapPress}
      />

      {/* 3. Bottom Metrics Grid (3-column split with Distance, Elevation, Duration) */}
      <TrailCardMetricsGrid metrics={metrics} />
    </div>
  );
};

export default TrailCard;
