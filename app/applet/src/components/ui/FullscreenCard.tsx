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
  // Determine blur intensity class with increased transparency to view the image clearly
  const blurClass = 
    glassmorphism === 'heavy' ? 'backdrop-blur-md bg-slate-950/40 border-white/20' :
    glassmorphism === 'subtle' || glassmorphism === 'ultra-subtle' ? 'backdrop-blur-[2px] bg-black/15 border-white/10' :
    glassmorphism === 'transparent' ? 'backdrop-blur-[1px] bg-transparent border-white/5' :
    glassmorphism === 'medium' || glassmorphism === true ? 'backdrop-blur-sm bg-slate-950/25 border-white/15' : 
    'bg-black/20';

  // Dynamic lightweight brightness adjustment so image shines through
  const brightnessOverlay = 
    imageBrightness === 'light' ? 'bg-slate-950/40' :
    imageBrightness === 'dark' ? 'bg-black/30' :
    'bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent';

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
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-extrabold drop-shadow">
              {subtitle}
            </div>
          )}

          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {title}
          </div>

          {(metric || metricLabel) && (
            <div className="flex items-baseline gap-2.5 pt-1">
              {metric && <div className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono tracking-tight drop-shadow">{metric}</div>}
              {metricLabel && <div className="text-xs text-white/90 font-mono font-bold uppercase tracking-wider drop-shadow">{metricLabel}</div>}
            </div>
          )}

          {description && (
            <p className="text-xs sm:text-sm text-slate-100 line-clamp-3 leading-relaxed font-sans font-medium drop-shadow">
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

