import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface ParallaxSectionProps {
  children: React.ReactNode;
  bgImage?: string;
  bgVideo?: string;
  overlayOpacity?: number;
  className?: string;
  speed?: number; // Parallax speed multiplier (-0.5 to 0.5)
  height?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  bgImage,
  bgVideo,
  overlayOpacity = 0.85,
  className = "",
  speed = 0.2,
  height = "min-h-[500px]",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1.1, 1.05]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden flex items-center justify-center ${height} ${className}`}
    >
      {/* Background Media with Parallax Transform */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 -z-10 w-full h-full pointer-events-none"
      >
        {bgVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter brightness-90 contrast-105"
          >
            <source src={bgVideo} type="video/mp4" />
          </video>
        ) : bgImage ? (
          <img
            src={bgImage}
            alt="Unsplash Parallax Background"
            className="w-full h-full object-cover filter brightness-95 contrast-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-gray-100" />
        )}
      </motion.div>

      {/* Backdrop overlay for supreme legibility */}
      <div
        className="absolute inset-0 -z-10 bg-white"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
