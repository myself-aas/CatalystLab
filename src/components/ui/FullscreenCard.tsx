import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface FullscreenCardProps {
  imageUrl?: string;
  imageAlt?: string;
  badge?: React.ReactNode;
  score?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  metric?: React.ReactNode;
  metricLabel?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  aspectRatio?: string;
  onClick?: () => void;
  glassmorphism?: boolean | 'subtle' | 'medium' | 'heavy';
  imageBrightness?: 'dark' | 'light' | 'auto';
  enableParallax?: boolean;
  maxTilt?: number;
}

export const FullscreenCard: React.FC<FullscreenCardProps> = ({
  imageUrl = 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1200',
  imageAlt = 'Card background',
  badge,
  score,
  title,
  subtitle,
  description,
  metric,
  metricLabel,
  action,
  footer,
  className,
  aspectRatio = 'min-h-[420px] w-full',
  onClick,
  glassmorphism = true,
  imageBrightness = 'auto',
  enableParallax = true,
  maxTilt = 6
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 260, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [maxTilt, -maxTilt]
  );
  const rotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-maxTilt, maxTilt]
  );

  const hoverProgress = useMotionValue(0);
  const smoothHover = useSpring(hoverProgress, { damping: 20, stiffness: 240 });

  React.useEffect(() => {
    hoverProgress.set(isHovered ? 1 : 0);
  }, [isHovered, hoverProgress]);

  const imgX = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-12, 12]
  );
  const imgY = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-12, 12]
  );

  const badgeX = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [14, -14]
  );
  const badgeY = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [10, -10]
  );
  const badgeRotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [maxTilt * 0.85, -maxTilt * 0.85]
  );
  const badgeRotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-maxTilt * 0.85, maxTilt * 0.85]
  );
  const badgeZ = useTransform(
    smoothHover,
    [0, 1],
    prefersReducedMotion || !enableParallax ? [0, 0] : [24, 52]
  );
  const scoreZ = useTransform(
    smoothHover,
    [0, 1],
    prefersReducedMotion || !enableParallax ? [0, 0] : [20, 44]
  );

  const titleX = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [8, -8]
  );
  const titleY = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [6, -6]
  );
  const titleRotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [maxTilt * 0.7, -maxTilt * 0.7]
  );
  const titleRotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-maxTilt * 0.7, maxTilt * 0.7]
  );
  const titleZ = useTransform(
    smoothHover,
    [0, 1],
    prefersReducedMotion || !enableParallax ? [0, 0] : [18, 42]
  );

  const contentX = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [4, -4]
  );
  const contentY = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [3, -3]
  );
  const subtitleRotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [maxTilt * 0.5, -maxTilt * 0.5]
  );
  const subtitleRotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-maxTilt * 0.5, maxTilt * 0.5]
  );
  const subtitleZ = useTransform(
    smoothHover,
    [0, 1],
    prefersReducedMotion || !enableParallax ? [0, 0] : [12, 28]
  );

  const metricRotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [maxTilt * 0.6, -maxTilt * 0.6]
  );
  const metricRotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-maxTilt * 0.6, maxTilt * 0.6]
  );
  const metricZ = useTransform(
    smoothHover,
    [0, 1],
    prefersReducedMotion || !enableParallax ? [0, 0] : [16, 36]
  );

  const descRotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [maxTilt * 0.4, -maxTilt * 0.4]
  );
  const descRotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-maxTilt * 0.4, maxTilt * 0.4]
  );
  const descZ = useTransform(
    smoothHover,
    [0, 1],
    prefersReducedMotion || !enableParallax ? [0, 0] : [8, 22]
  );

  const actionRotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [maxTilt * 0.65, -maxTilt * 0.65]
  );
  const actionRotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    prefersReducedMotion || !enableParallax ? [0, 0] : [-maxTilt * 0.65, maxTilt * 0.65]
  );
  const actionZ = useTransform(
    smoothHover,
    [0, 1],
    prefersReducedMotion || !enableParallax ? [0, 0] : [14, 36]
  );
  const footerZ = useTransform(
    smoothHover,
    [0, 1],
    prefersReducedMotion || !enableParallax ? [0, 0] : [10, 24]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReducedMotion || !enableParallax) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const blurClass =
    glassmorphism === 'heavy' ? 'backdrop-blur-xl bg-slate-950/70 border-white/30' :
    glassmorphism === 'subtle' ? 'backdrop-blur-sm bg-black/30 border-white/15' :
    glassmorphism === 'medium' || glassmorphism === true ? 'backdrop-blur-md bg-slate-950/50 border-white/25' :
    'bg-black/60';

  return (
    <div style={{ perspective: 1200 }} className="w-full">
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={prefersReducedMotion ? undefined : { y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          'group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200/40 shadow-xl transition-shadow duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] cursor-pointer text-white will-change-transform',
          aspectRatio,
          className
        )}
      >
        <motion.div
          className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden"
          style={{
            x: imgX,
            y: imgY,
            scale: prefersReducedMotion ? 1 : isHovered ? 1.08 : 1.0,
            transformStyle: 'preserve-3d',
          }}
          transition={{
            scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover object-center"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </motion.div>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-500 pointer-events-none z-[1]"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
        />
        {glassmorphism && (
          <div
            className={cn("absolute inset-4 sm:inset-5 border shadow-2xl transition-all duration-500 pointer-events-none z-[1]", blurClass)}
            style={{ borderRadius: '1.75rem' }}
          />
        )}

        <div
          className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-8 bg-gradient-to-t from-black/80 to-transparent"
          style={{
            transformStyle: 'preserve-3d',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          }}
        >
          <div className="flex items-center justify-between gap-3" style={{ transformStyle: 'preserve-3d' }}>
            <motion.div
              style={{
                x: badgeX,
                y: badgeY,
                z: badgeZ,
                rotateX: badgeRotateX,
                rotateY: badgeRotateY,
                transformStyle: 'preserve-3d',
              }}
              className="flex items-center gap-2 flex-wrap"
            >
              {badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg transition-colors group-hover:bg-white/35">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  {badge}
                </span>
              )}
            </motion.div>

            {score && (
              <motion.div
                style={{
                  x: badgeX,
                  y: badgeY,
                  z: scoreZ,
                  rotateX: badgeRotateX,
                  rotateY: badgeRotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-xs font-mono font-extrabold text-white shadow-md"
              >
                {score}
              </motion.div>
            )}
          </div>

          <div className="my-auto py-4 space-y-3" style={{ transformStyle: 'preserve-3d' }}>
            {subtitle && (
              <motion.div
                style={{
                  x: contentX,
                  y: contentY,
                  z: subtitleZ,
                  rotateX: subtitleRotateX,
                  rotateY: subtitleRotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="text-xs font-mono uppercase tracking-widest text-white/80 font-bold drop-shadow-sm"
              >
                {subtitle}
              </motion.div>
            )}

            <motion.div
              style={{
                x: titleX,
                y: titleY,
                z: titleZ,
                rotateX: titleRotateX,
                rotateY: titleRotateY,
                transformStyle: 'preserve-3d',
              }}
              className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-md"
            >
              {title}
            </motion.div>

            {(metric || metricLabel) && (
              <motion.div
                style={{
                  x: contentX,
                  y: contentY,
                  z: metricZ,
                  rotateX: metricRotateX,
                  rotateY: metricRotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="flex items-baseline gap-2 pt-1"
              >
                {metric && (
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-sm">
                    {metric}
                  </div>
                )}
                {metricLabel && (
                  <div className="text-xs text-white/80 font-mono font-bold uppercase tracking-wider">
                    {metricLabel}
                  </div>
                )}
              </motion.div>
            )}

            {description && (
              <motion.p
                style={{
                  x: contentX,
                  y: contentY,
                  z: descZ,
                  rotateX: descRotateX,
                  rotateY: descRotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="text-xs sm:text-sm text-white/90 line-clamp-3 leading-relaxed font-sans font-normal drop-shadow-sm"
              >
                {description}
              </motion.p>
            )}
          </div>

          <div
            style={{ transformStyle: 'preserve-3d' }}
            className="pt-4 border-t border-white/20 flex items-center justify-between gap-3 mt-auto"
          >
            <motion.div
              style={{
                x: contentX,
                y: contentY,
                z: footerZ,
                rotateX: subtitleRotateX,
                rotateY: subtitleRotateY,
                transformStyle: 'preserve-3d',
              }}
              className="text-xs font-mono text-white/80 font-bold truncate"
            >
              {footer || 'CatalystLab Engine'}
            </motion.div>

            <motion.div
              style={{
                x: contentX,
                y: contentY,
                z: actionZ,
                rotateX: actionRotateX,
                rotateY: actionRotateY,
                transformStyle: 'preserve-3d',
              }}
              className="shrink-0"
            >
              {action || (
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition-all border border-white/30 shadow-md">
                  <span>Run Audit</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FullscreenCard;
