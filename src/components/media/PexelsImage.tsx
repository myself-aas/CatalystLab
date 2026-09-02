import React, { useState } from 'react';
import { getMediaAsset, MediaAsset, MediaTreatment, DEFAULT_BLUR_SHIMMER } from '../../lib/media/registry';
import { logger } from '../../lib/logger';

export interface PexelsImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  assetId?: string;
  sources?: string[];
  treatment?: MediaTreatment;
  priority?: boolean;
  isDecorative?: boolean;
  overlayScrim?: boolean;
  overlayVignette?: boolean;
  scanlines?: boolean;
  className?: string;
  containerClassName?: string;
  customAlt?: string;
  width?: number;
  height?: number;
}

export const PexelsImage: React.FC<PexelsImageProps> = ({
  assetId,
  sources: customSources,
  treatment,
  priority = false,
  isDecorative = false,
  overlayScrim = false,
  overlayVignette = false,
  scanlines = false,
  className = '',
  containerClassName = '',
  customAlt,
  src,
  alt,
  width,
  height,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isDegraded, setIsDegraded] = useState(false);

  const asset: MediaAsset | null = assetId ? getMediaAsset(assetId) : null;

  // Build the fallback chain: R3 contract
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

  const currentSrc = sourceList[sourceIndex] || src || asset?.url || '';
  const finalAlt = isDecorative ? '' : (customAlt || alt || asset?.alt || 'CatalystLab Telemetry Visual');
  const finalTreatment = treatment || asset?.treatment || 'catalyst-grade-neutral';
  const finalWidth = width || asset?.width || 1200;
  const finalHeight = height || asset?.height || 800;

  // R3 Fallback Chain: advance source on error, degrade if exhausted
  const handleError = () => {
    if (sourceIndex < sourceList.length - 1) {
      logger.warn(
        `[media] Source ${sourceIndex} failed for slot <${assetId || 'image'}>. Trying next fallback source ${sourceIndex + 1}...`
      );
      setSourceIndex((prev) => prev + 1);
    } else {
      setIsDegraded(true);
      logger.warn(`[media] slot <${assetId || 'image'}> degraded`);
    }
  };

  // Duotone class resolver
  const getDuotoneClass = (t: MediaTreatment) => {
    switch (t) {
      case 'catalyst-grade-cyan':
        return 'duotone-cyan';
      case 'catalyst-grade-green':
        return 'duotone-green';
      case 'catalyst-grade-crimson':
        return 'duotone-crimson';
      case 'catalyst-grade-purple':
        return 'duotone-purple';
      case 'catalyst-grade-amber':
        return 'duotone-amber';
      case 'catalyst-grade-hero':
        return 'duotone-hero';
      case 'catalyst-grade-neutral':
        return 'duotone-neutral';
      default:
        return 'bg-primary/40';
    }
  };

  const isDuotone = finalTreatment.startsWith('catalyst-grade');

  return (
    <div
      data-media-degraded={isDegraded ? 'true' : undefined}
      className={`relative overflow-hidden bg-[#060914] ${containerClassName}`}
      style={{ aspectRatio: `${finalWidth} / ${finalHeight}` }}
    >
      {/* 1. Low-opacity placeholder shimmer during image load (zero CLS) */}
      {!isLoaded && !isDegraded && (
        <div
          aria-hidden="true"
          style={{ backgroundImage: `url(${DEFAULT_BLUR_SHIMMER})` }}
          className="absolute inset-0 bg-[#0A0F20] animate-pulse z-0 bg-cover"
        />
      )}

      {/* 2. Main Normalized Image or Degraded Branded Fallback */}
      {!isDegraded && currentSrc ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={finalAlt}
          width={finalWidth}
          height={finalHeight}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...(priority ? { fetchpriority: 'high' } : {})}
          aria-hidden={isDecorative ? 'true' : undefined}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`w-full h-full object-cover catalyst-media-img ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...rest}
        />
      ) : (
        <div
          className="w-full h-full bg-gradient-to-br from-background via-[#0A0F20] to-[#04060E]"
          aria-label={finalAlt}
        />
      )}

      {/* 3. Catalyst-Grade Duotone Overlay Layer */}
      {isDuotone && !isDegraded && (
        <div
          aria-hidden="true"
          className={`catalyst-duotone-layer ${getDuotoneClass(finalTreatment)}`}
        />
      )}

      {/* 4. Text Contrast Scrim (WCAG AA Compliance) */}
      {overlayScrim && (
        <div aria-hidden="true" className="catalyst-scrim" />
      )}

      {/* 5. Contrast Vignette */}
      {overlayVignette && (
        <div aria-hidden="true" className="catalyst-vignette" />
      )}

      {/* 6. Scanlines */}
      {scanlines && (
        <div aria-hidden="true" className="catalyst-scanlines" />
      )}
    </div>
  );
};

export default PexelsImage;
