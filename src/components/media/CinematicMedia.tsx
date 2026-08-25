import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { UnsplashImage, UnsplashImageProps } from './UnsplashImage';
import { getMediaAsset, MediaAsset } from '../../lib/media/registry';

export interface CinematicMediaProps extends Omit<UnsplashImageProps, 'src' | 'alt'> {
  assetId: string;
  mode?: 'ken-burns' | 'parallax-band' | 'static' | 'spotlight';
  speed?: number; // parallax intensity or ken-burns duration
  videoSlot?: React.ReactNode; // Optional CC0 video slot with identical treatment
  children?: React.ReactNode;
  showSpotlight?: boolean;
  scanlineOverlay?: boolean;
  className?: string;
  containerClassName?: string;
}

export const CinematicMedia: React.FC<CinematicMediaProps> = ({
  assetId,
  mode = 'ken-burns',
  speed = 22,
  videoSlot,
  children,
  showSpotlight = true,
  scanlineOverlay = false,
  className = '',
  containerClassName = '',
  overlayScrim = true,
  overlayVignette = true,
  treatment,
  priority = false,
  isDecorative = false,
  ...imageProps
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const asset: MediaAsset = getMediaAsset(assetId);

  // Parallax scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['-8%', '8%']
  );

  // Pointer spotlight coordinates update
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !showSpotlight || prefersReducedMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    containerRef.current.style.setProperty('--mouse-x', `${x}%`);
    containerRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group catalyst-media-interactive ${containerClassName}`}
    >
      {/* 1. Underlying Cinematic Visual Layer (Video or Framer Motion Animated Image) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {videoSlot ? (
          <div className="w-full h-full catalyst-media-img object-cover">
            {videoSlot}
          </div>
        ) : mode === 'parallax-band' ? (
          <motion.div
            style={{ y: parallaxY, scale: 1.12 }}
            className="w-full h-[120%] -top-[10%] relative"
          >
            <UnsplashImage
              assetId={assetId}
              treatment={treatment || asset.treatment}
              priority={priority}
              isDecorative={isDecorative}
              overlayScrim={false}
              overlayVignette={false}
              containerClassName="w-full h-full"
              className={`w-full h-full object-cover ${className}`}
              {...imageProps}
            />
          </motion.div>
        ) : mode === 'ken-burns' && !prefersReducedMotion ? (
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: speed,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
            className="w-full h-full"
          >
            <UnsplashImage
              assetId={assetId}
              treatment={treatment || asset.treatment}
              priority={priority}
              isDecorative={isDecorative}
              overlayScrim={false}
              overlayVignette={false}
              containerClassName="w-full h-full"
              className={`w-full h-full object-cover ${className}`}
              {...imageProps}
            />
          </motion.div>
        ) : (
          <UnsplashImage
            assetId={assetId}
            treatment={treatment || asset.treatment}
            priority={priority}
            isDecorative={isDecorative}
            overlayScrim={false}
            overlayVignette={false}
            containerClassName="w-full h-full"
            className={`w-full h-full object-cover ${className}`}
            {...imageProps}
          />
        )}
      </div>

      {/* 2. Text Contrast Scrim (Guaranteed WCAG AA) */}
      {overlayScrim && <div aria-hidden="true" className="catalyst-scrim" />}

      {/* 3. Vignette */}
      {overlayVignette && <div aria-hidden="true" className="catalyst-vignette" />}

      {/* 4. Pointer-Tracked Radial Spotlight */}
      {showSpotlight && <div aria-hidden="true" className="catalyst-spotlight" />}

      {/* 5. Optional Scanline Band Texture */}
      {scanlineOverlay && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] z-10"
        />
      )}

      {/* 6. Foreground Content Slot */}
      {children && <div className="relative z-20 w-full h-full">{children}</div>}
    </div>
  );
};

export default CinematicMedia;
