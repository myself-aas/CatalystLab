import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { UnsplashImage, UnsplashImageProps } from './UnsplashImage';
import { getMediaAsset, MediaAsset } from '../../lib/media/registry';

export interface ScanRevealFigureProps extends Partial<UnsplashImageProps> {
  assetId?: string;
  caption?: string;
  duration?: number;
  laserColor?: string;
  children?: React.ReactNode;
  aspectRatio?: string;
}

export const ScanRevealFigure: React.FC<ScanRevealFigureProps> = ({
  assetId,
  caption,
  duration = 0.9,
  laserColor = '#00F0FF',
  children,
  aspectRatio = '16/9',
  className = '',
  containerClassName = '',
  treatment,
  ...imageProps
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  const asset: MediaAsset | null = assetId ? getMediaAsset(assetId) : null;
  const finalTreatment = treatment || asset?.treatment || 'catalyst-grade-cyan';

  return (
    <figure
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-[#060914] group catalyst-media-interactive ${containerClassName}`}
    >
      {/* 1. Clipping Container with Scan Reveal Animation */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
        animate={
          isInView
            ? prefersReducedMotion
              ? { opacity: 1 }
              : { clipPath: 'inset(0 0 0% 0)' }
            : {}
        }
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-full overflow-hidden"
        style={{ aspectRatio }}
      >
        {/* Moving Laser Scanline */}
        {!prefersReducedMotion && isInView && (
          <motion.div
            initial={{ top: '0%', opacity: 1 }}
            animate={{ top: '100%', opacity: [1, 1, 0] }}
            transition={{ duration: duration * 1.1, ease: 'easeInOut' }}
            className="scan-reveal-bar"
            style={{
              background: `linear-gradient(90deg, transparent, ${laserColor}, transparent)`,
              boxShadow: `0 0 16px ${laserColor}`,
            }}
          />
        )}

        {/* Media or Custom Children */}
        {children ? (
          children
        ) : assetId ? (
          <UnsplashImage
            assetId={assetId}
            treatment={finalTreatment}
            overlayScrim
            overlayVignette
            containerClassName="w-full h-full"
            className={`w-full h-full object-cover ${className}`}
            {...imageProps}
          />
        ) : null}

        {/* Pointer Spotlight on Hover */}
        <div aria-hidden="true" className="catalyst-spotlight" />
      </motion.div>

      {/* 2. Optional Caption */}
      {caption && (
        <figcaption className="px-4 py-2.5 bg-[#0A0F20]/90 border-t border-slate-800/80 font-mono text-[11px] text-slate-400 flex items-center justify-between">
          <span className="truncate">{caption}</span>
          <span className="text-[#06B6D4] text-[10px] uppercase font-bold shrink-0 ml-2">
            [VERIFIED ASSET]
          </span>
        </figcaption>
      )}
    </figure>
  );
};

export default ScanRevealFigure;
