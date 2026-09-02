import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { CardBadgeProps } from '../types';

export const CardBadge: React.FC<CardBadgeProps> = ({
  variant = 'amber',
  icon,
  label,
  className,
  ...props
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'amber':
        return 'bg-background text-foreground shadow-md border border-border';
      case 'emerald':
        return 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-emerald-900/30';
      case 'cyan':
        return 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-cyan-900/30';
      case 'purple':
        return 'bg-purple-950/90 text-purple-300 border border-purple-500/40 shadow-purple-900/30';
      case 'red':
        return 'bg-rose-950/90 text-rose-300 border border-rose-500/40 shadow-rose-900/30';
      case 'neutral':
      default:
        return 'bg-primary/90 text-muted-foreground border border-border/80 shadow-md';
    }
  };

  const defaultIcon = () => {
    switch (variant) {
      case 'amber':
        return <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />;
      case 'emerald':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cyan':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      case 'purple':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm backdrop-blur-md select-none',
          getBadgeStyle(),
          className
        )
      )}
      {...props}
    >
      {icon ? icon : defaultIcon()}
      <span className="truncate">{label}</span>
    </div>
  );
};
