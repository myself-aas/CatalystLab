import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useReducedMotion } from 'framer-motion';
import { CardMediaProps, AspectPreset, EnzymeHue } from '../types';
import { useCardContext } from './CardContext';
import { getMediaAsset, MediaAsset } from '../../../lib/media/registry';

const aspectMap: Record<AspectPreset, string> = {
  '16/9': 'aspect-[16/9]',
  '3/4': 'aspect-[3/4]',
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  auto: '',
};

export const CardMedia: React.FC<CardMediaProps> = ({
  assetId,
  sources: customSources,
  src,
  alt,
  aspect = 'auto',
  aspectClassName,
  scrim,
  enableHoverZoom = true,
  enableDuotone = true,
  priority = false,
  className,
  children,
  ...props
}) => {
  const context = useCardContext();
  const prefersReducedMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [isDegraded, setIsDegraded] = useState(false);

  const asset: MediaAsset | null = assetId ? getMediaAsset(assetId) : null;
  const finalAlt = alt || asset?.alt || 'CatalystLab Visual Asset';

  const sourceList: string[] =
    customSources && customSources.length > 0
      ? customSources
      : src
      ? [src, ...(asset?.sources || [])]
      : asset?.sources && asset.sources.length > 0
      ? asset.sources
      : asset?.url
      ? [asset.url]
      : [];

  const currentSrc = sourceList[sourceIdx] || src || asset?.url || '';

  const handleError = () => {
    if (sourceIdx < sourceList.length - 1) {
      console.warn(`[media] CardMedia source ${sourceIdx} failed. Trying fallback ${sourceIdx + 1}...`);
      setSourceIdx((prev) => prev + 1);
    } else {
      setIsDegraded(true);
      console.warn(`[media] slot <${assetId || 'card-media'}> degraded`);
    }
  };

  const isSurface = context.variant === 'surface';
  const isImmersive = context.variant === 'immersive';
  const activeHue: EnzymeHue = context.hue || 'neutral';

  // Determine scrim based on prop or context
  const activeScrim =
    scrim ||
    (isImmersive ? 'immersive' : isSurface ? 'none' : 'immersive');

  const getScrimGradient = () => {
    switch (activeScrim) {
      case 'immersive':
        return 'bg-gradient-to-t from-[hsl(240_12%_4%/0.98)] via-[hsl(240_12%_4%/0.85)] via-55% to-transparent';
      case 'destination':
        return 'bg-gradient-to-t from-[hsl(240_14%_5%/0.98)] via-[hsl(240_14%_5%/0.85)] via-55% to-transparent';
      case 'event':
        return 'bg-gradient-to-t from-[hsl(240_14%_5%/0.99)] via-[hsl(240_14%_5%/0.90)] via-50% to-transparent';
      case 'listing':
        return 'bg-gradient-to-t from-[hsl(240_14%_4%/0.98)] via-[hsl(240_14%_4%/0.85)] via-55% to-transparent';
      case 'none':
      default:
        return '';
    }
  };

  const getEnzymeDuotoneClass = (hue: EnzymeHue) => {
    switch (hue) {
      case 'vitalzyme':
      case 'ecoholo':
        return 'bg-emerald-900/30 mix-blend-color';
      case 'riskprotease':
        return 'bg-rose-900/35 mix-blend-color';
      case 'llmkinase':
        return 'bg-purple-900/35 mix-blend-color';
      case 'edgevmax':
        return 'bg-cyan-900/30 mix-blend-color';
      case 'synthshift':
        return 'bg-amber-900/35 mix-blend-color';
      case 'gitlygase':
        return 'bg-blue-900/35 mix-blend-color';
      case 'alloster':
        return 'bg-fuchsia-900/35 mix-blend-color';
      case 'neutral':
      default:
        return 'bg-slate-900/25 mix-blend-color';
    }
  };

  return (
    <figure
      data-media-degraded={isDegraded ? 'true' : undefined}
      className={twMerge(
        clsx(
          'relative overflow-hidden w-full select-none bg-slate-950',
          isSurface && 'rounded-[14px] ring-1 ring-black/5 dark:ring-white/10 shadow-sm',
          isImmersive && 'absolute inset-0 z-0 h-full',
          aspectClassName || aspectMap[aspect],
          className
        )
      )}
      {...props}
    >
      {/* 1. Shimmer Placeholder to guarantee 0 CLS */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-slate-900/90 animate-pulse z-0 flex items-center justify-center"
        >
          <div className="w-8 h-8 rounded-full border border-slate-700/40 border-t-cyan-400 animate-spin opacity-40" />
        </div>
      )}

      {/* 2. Image Media with Normalized Grayscale & Hover Colorize */}
      {!isDegraded && currentSrc ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={finalAlt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={twMerge(
            clsx(
              'w-full h-full object-cover transition-all duration-700 ease-out',
              isLoaded ? 'opacity-100' : 'opacity-0',
              enableHoverZoom && !prefersReducedMotion && 'group-hover:scale-105',
              enableDuotone && 'grayscale-[65%] contrast-[1.1] brightness-[0.88] group-hover:grayscale-0 group-hover:brightness-95'
            )
          )}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-950 via-[#0A0F20] to-[#04060E]" aria-label={finalAlt} />
      )}

      {/* 3. Enzyme Biochemical Duotone Color Overlay Layer */}
      {enableDuotone && (
        <div
          aria-hidden="true"
          className={clsx(
            'absolute inset-0 pointer-events-none transition-opacity duration-600',
            getEnzymeDuotoneClass(activeHue),
            'opacity-75 group-hover:opacity-20'
          )}
        />
      )}

      {/* 4. Fine Matrix Scanline Texture for Terminal feel */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-25 pointer-events-none z-[1]"
      />

      {/* 5. Deep Multi-Stop Scrim (WCAG AA Text Contrast Guarantee) */}
      {activeScrim !== 'none' && (
        <div
          aria-hidden="true"
          className={clsx(
            'absolute inset-0 pointer-events-none z-[2]',
            getScrimGradient()
          )}
        />
      )}

      {/* Optional Inset Media Content/Slots */}
      {children && (
        <div className="absolute inset-0 z-[3] flex flex-col justify-between p-4 pointer-events-none">
          {children}
        </div>
      )}
    </figure>
  );
};
