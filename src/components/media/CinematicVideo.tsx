import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { getMediaAsset, MediaAsset, MediaTreatment, DEFAULT_BLUR_SHIMMER } from '../../lib/media/registry';

export interface CinematicVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  assetId?: string;
  sources?: string[];
  poster?: string;
  treatment?: MediaTreatment;
  overlayScrim?: boolean;
  overlayVignette?: boolean;
  scanlines?: boolean;
  containerClassName?: string;
  className?: string;
  alt?: string;
}

export const CinematicVideo: React.FC<CinematicVideoProps> = ({
  assetId,
  sources: customSources,
  poster: customPoster,
  treatment,
  overlayScrim = true,
  overlayVignette = true,
  scanlines = false,
  containerClassName = '',
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  alt,
  ...videoProps
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const asset: MediaAsset | null = assetId ? getMediaAsset(assetId) : null;
  const sourceList: string[] =
    customSources && customSources.length > 0
      ? customSources
      : asset?.sources && asset.sources.length > 0
      ? asset.sources
      : asset?.url
      ? [asset.url]
      : [];

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isDegraded, setIsDegraded] = useState(false);

  const finalPoster = customPoster || asset?.poster || asset?.url;
  const finalTreatment = treatment || asset?.treatment || 'catalyst-grade-hero';
  const finalAlt = alt || asset?.alt || 'CatalystLab Telemetry Video Stream';

  // R3: Advance source chain on error
  const handleVideoError = () => {
    if (currentSourceIndex < sourceList.length - 1) {
      console.warn(
        `[media] Video source ${currentSourceIndex} failed for slot <${assetId || 'unknown'}>. Trying fallback source ${currentSourceIndex + 1}...`
      );
      setCurrentSourceIndex((prev) => prev + 1);
    } else {
      setIsDegraded(true);
      console.warn(`[media] slot <${assetId || 'cinematic-video'}> degraded: all video sources failed`);
    }
  };

  // IntersectionObserver to pause off-screen video for battery & CPU performance
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay policy muted playback guard
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion, currentSourceIndex]);

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

  // Fallback to static poster if reduced motion is requested or all video sources failed
  if (prefersReducedMotion || isDegraded) {
    return (
      <div
        ref={containerRef}
        data-media-degraded={isDegraded ? 'true' : undefined}
        className={`relative overflow-hidden bg-[#060914] ${containerClassName}`}
      >
        {finalPoster ? (
          <img
            src={finalPoster}
            alt={finalAlt}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover catalyst-media-img ${className}`}
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-slate-950 via-[#0A0F20] to-[#04060E]"
            aria-label={finalAlt}
          />
        )}

        {isDuotone && (
          <div
            aria-hidden="true"
            className={`catalyst-duotone-layer ${getDuotoneClass(finalTreatment)}`}
          />
        )}

        {overlayScrim && <div aria-hidden="true" className="catalyst-scrim" />}
        {overlayVignette && <div aria-hidden="true" className="catalyst-vignette" />}
        {scanlines && <div aria-hidden="true" className="catalyst-scanlines" />}
      </div>
    );
  }

  const currentSrc = sourceList[currentSourceIndex] || '';

  return (
    <div
      ref={containerRef}
      data-media-degraded={isDegraded ? 'true' : undefined}
      className={`relative overflow-hidden bg-[#060914] ${containerClassName}`}
    >
      {/* 1. Low-opacity placeholder shimmer until video is ready */}
      {!isVideoLoaded && (
        <div
          aria-hidden="true"
          style={{ backgroundImage: `url(${DEFAULT_BLUR_SHIMMER})` }}
          className="absolute inset-0 bg-[#0A0F20] animate-pulse z-0 bg-cover"
        />
      )}

      {/* 2. Main HTML5 Video element */}
      <video
        ref={videoRef}
        src={currentSrc}
        poster={finalPoster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        onLoadedData={() => setIsVideoLoaded(true)}
        onError={handleVideoError}
        aria-label={finalAlt}
        className={`w-full h-full object-cover catalyst-media-img ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...videoProps}
      >
        <track kind="captions" />
      </video>

      {/* 3. Catalyst-Grade Duotone Overlay */}
      {isDuotone && (
        <div
          aria-hidden="true"
          className={`catalyst-duotone-layer ${getDuotoneClass(finalTreatment)}`}
        />
      )}

      {/* 4. Text Contrast Scrim (WCAG AA) */}
      {overlayScrim && <div aria-hidden="true" className="catalyst-scrim" />}

      {/* 5. Contrast Vignette */}
      {overlayVignette && <div aria-hidden="true" className="catalyst-vignette" />}

      {/* 6. Scanlines */}
      {scanlines && <div aria-hidden="true" className="catalyst-scanlines" />}
    </div>
  );
};

export default CinematicVideo;
