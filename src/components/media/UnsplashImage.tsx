import React, { useState } from 'react';
import { getMediaAsset, MediaAsset, MediaTreatment } from '../../lib/media/registry';

export interface UnsplashImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  assetId?: string;
  treatment?: MediaTreatment;
  priority?: boolean;
  isDecorative?: boolean;
  overlayScrim?: boolean;
  overlayVignette?: boolean;
  className?: string;
  containerClassName?: string;
  customAlt?: string;
  width?: number;
  height?: number;
}

export const UnsplashImage: React.FC<UnsplashImageProps> = ({
  assetId,
  treatment,
  priority = false,
  isDecorative = false,
  overlayScrim = false,
  overlayVignette = false,
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
  const asset: MediaAsset | null = assetId ? getMediaAsset(assetId) : null;

  const finalSrc = src || asset?.url || '';
  const finalAlt = isDecorative ? '' : (customAlt || alt || asset?.alt || 'CatalystLab Telemetry Visual');
  const finalTreatment = treatment || asset?.treatment || 'catalyst-grade-neutral';
  const finalWidth = width || asset?.width || 1200;
  const finalHeight = height || asset?.height || 800;

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
      default:
        return 'bg-slate-900/40';
    }
  };

  const isDuotone = finalTreatment.startsWith('catalyst-grade');

  return (
    <div
      className={`relative overflow-hidden bg-[#060914] ${containerClassName}`}
      style={{ aspectRatio: `${finalWidth} / ${finalHeight}` }}
    >
      {/* 1. Low-opacity placeholder shimmer during image load (zero CLS) */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#0A0F20] animate-pulse z-0"
        />
      )}

      {/* 2. Main Normalized Image */}
      <img
        src={finalSrc}
        alt={finalAlt}
        width={finalWidth}
        height={finalHeight}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchpriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        aria-hidden={isDecorative ? 'true' : undefined}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover catalyst-media-img ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...rest}
      />

      {/* 3. Catalyst-Grade Duotone Overlay Layer */}
      {isDuotone && (
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
    </div>
  );
};

export default UnsplashImage;
