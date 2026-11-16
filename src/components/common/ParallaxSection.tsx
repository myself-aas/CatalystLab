import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ParallaxSectionProps {
  bgImage?: string;
  bgVideo?: string;
  overlayOpacity?: number;
  height?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  bgImage,
  bgVideo,
  overlayOpacity = 0.75,
  height = 'min-h-[400px]',
  className = '',
  children
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  return (
    <div ref={ref} className={`relative overflow-hidden ${height} ${className}`}>
      {/* Parallax Background Layer */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 -inset-y-12 z-0 will-change-transform pointer-events-none"
      >
        {bgVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover scale-110"
          >
            <source src={bgVideo} type="video/mp4" />
          </video>
        ) : bgImage ? (
          <img
            src={bgImage}
            alt="Parallax background"
            className="w-full h-full object-cover scale-110"
            
          loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300" />
        )}
      </motion.div>

      {/* Theme-aware veil over the media: the page background at overlayOpacity
          (white in light, ink in dark). Opts out of patch.css's drawer-scrim rule. */}
      <div
        data-scrim="none"
        className="absolute inset-0 z-10 pointer-events-none backdrop-blur-[2px]"
        style={{ backgroundColor: `color-mix(in srgb, var(--app-background) ${Math.round(overlayOpacity * 100)}%, transparent)` }}
      />

      {/* Content Container */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};
