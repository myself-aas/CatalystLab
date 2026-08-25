import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FullscreenCardProps {
  imageUrl: string;
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
}

export const FullscreenCard: React.FC<FullscreenCardProps> = ({
  imageUrl,
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
  imageBrightness = 'auto'
}) => {
  // Determine blur intensity class
  const blurClass = 
    glassmorphism === 'heavy' ? 'backdrop-blur-xl bg-slate-950/70 border-white/30' :
    glassmorphism === 'subtle' ? 'backdrop-blur-sm bg-black/30 border-white/15' :
    glassmorphism === 'medium' || glassmorphism === true ? 'backdrop-blur-md bg-slate-950/50 border-white/25' : 
    'bg-black/60';

  // Dynamic brightness adjustment
  const brightnessOverlay = 
    imageBrightness === 'light' ? 'bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-slate-950/50' :
    imageBrightness === 'dark' ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent' :
    'bg-gradient-to-t from-slate-950/80 via-slate-950/50 to-slate-950/20';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200/40 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] cursor-pointer text-white',
        aspectRatio,
        className
      )}
    >
      {/* 1. Fullscreen Background Image wrapped across the ENTIRE card */}
      <img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        referrerPolicy="no-referrer"
      />

      {/* 2. Dynamic Gradient & Glassmorphism Overlay */}
      <div className={cn("absolute inset-0 transition-all duration-500", brightnessOverlay)} />
      {glassmorphism && (
        <div className={cn("absolute inset-4 sm:inset-5 rounded-[1.5krem] border shadow-2xl transition-all duration-500 pointer-events-none", blurClass)} style={{ borderRadius: '1.75rem' }} />
      )}

      {/* 3. All Texts, Links, Components, UI, Layouts, and Buttons positioned precisely above the BG image */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {badge}
              </span>
            )}
          </div>
          {score && (
            <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-xs font-mono font-extrabold text-white shadow-md">
              {score}
            </div>
          )}
        </div>

        {/* Middle Content Section */}
        <div className="my-auto py-4 space-y-3">
          {subtitle && (
            <div className="text-xs font-mono uppercase tracking-widest text-white/80 font-bold">
              {subtitle}
            </div>
          )}

          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            {title}
          </div>

          {(metric || metricLabel) && (
            <div className="flex items-baseline gap-2 pt-1">
              {metric && <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">{metric}</div>}
              {metricLabel && <div className="text-xs text-white/80 font-mono font-bold uppercase tracking-wider">{metricLabel}</div>}
            </div>
          )}

          {description && (
            <p className="text-xs sm:text-sm text-white/90 line-clamp-3 leading-relaxed font-sans font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Bottom Action & Footer Row */}
        <div className="pt-4 border-t border-white/20 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs font-mono text-white/80 font-bold truncate">
            {footer || 'CatalystLab Engine'}
          </div>

          <div className="shrink-0">
            {action || (
              <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition-all border border-white/30 shadow-md">
                <span>Run Audit</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FullscreenCard;

