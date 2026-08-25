import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

export interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number; // default 6 degrees
  className?: string;
  containerClassName?: string;
  glowColor?: string;
  showSpotlight?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 6,
  className = '',
  containerClassName = '',
  glowColor = 'rgba(6, 182, 212, 0.25)',
  showSpotlight = true,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Raw cursor position motion values (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation damping
  const springConfig = { damping: 20, stiffness: 220, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Calculate rotation angles
  const rotateX = useTransform(smoothY, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReducedMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;

    x.set(mouseX - 0.5);
    y.set(mouseY - 0.5);

    if (showSpotlight) {
      cardRef.current.style.setProperty('--mouse-x', `${mouseX * 100}%`);
      cardRef.current.style.setProperty('--mouse-y', `${mouseY * 100}%`);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className={`relative ${containerClassName}`}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden group catalyst-media-interactive transition-shadow duration-500 hover:shadow-[0_20px_50px_${glowColor}] ${className}`}
      >
        {/* Radial Spotlight Follower */}
        {showSpotlight && !prefersReducedMotion && (
          <div aria-hidden="true" className="catalyst-spotlight" />
        )}

        {/* Content */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default TiltCard;
