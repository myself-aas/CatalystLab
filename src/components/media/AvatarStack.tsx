import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getMediaAsset, MediaAsset } from '../../lib/media/registry';

export interface AvatarItem {
  id: string;
  name: string;
  role: string;
  company: string;
  assetId?: string;
  imageUrl?: string;
}

export interface AvatarStackProps {
  avatars?: AvatarItem[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DEFAULT_TESTIMONIAL_AVATARS: AvatarItem[] = [
  {
    id: 'elena',
    name: 'Elena Rostova',
    role: 'VP Platform Engineering',
    company: 'Veloce Network',
    assetId: 'avatar-elena-rostova',
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'Chief Architect',
    company: 'StrataScale Cloud',
    assetId: 'avatar-marcus-vance',
  },
  {
    id: 'sarah',
    name: 'Dr. Sarah Chen',
    role: 'Head of SecOps',
    company: 'Apex FinTech',
    assetId: 'avatar-dr-sarah-chen',
  },
  {
    id: 'david',
    name: 'David K. Lindqvist',
    role: 'Principal DevOps Lead',
    company: 'Nordic Quantum',
    assetId: 'avatar-david-lindqvist',
  },
];

export const AvatarStack: React.FC<AvatarStackProps> = ({
  avatars = DEFAULT_TESTIMONIAL_AVATARS,
  maxDisplay = 4,
  size = 'md',
  className = '',
}) => {
  const [hoveredAvatar, setHoveredAvatar] = useState<AvatarItem | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-7 h-7 -ml-2',
    md: 'w-9 h-9 -ml-2.5',
    lg: 'w-11 h-11 -ml-3',
  };

  const displayed = avatars.slice(0, maxDisplay);
  const remainder = Math.max(0, avatars.length - maxDisplay);

  return (
    <div className={`flex items-center relative ${className}`}>
      {displayed.map((avatar, idx) => {
        const asset: MediaAsset | null = avatar.assetId ? getMediaAsset(avatar.assetId) : null;
        const imgUrl = avatar.imageUrl || asset?.url || '';

        return (
          <div
            key={avatar.id}
            onMouseEnter={() => setHoveredAvatar(avatar)}
            onMouseLeave={() => setHoveredAvatar(null)}
            className={`relative ${idx === 0 ? 'ml-0' : sizeClasses[size]} transition-transform duration-300 hover:scale-115 hover:z-30 cursor-pointer`}
          >
            <div className="w-full h-full rounded-full border-2 border-[#030712] overflow-hidden bg-slate-800 shadow-md">
              <img
                src={imgUrl}
                alt={`${avatar.name} - ${avatar.role} at ${avatar.company}`}
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale-[0.2] contrast-[1.05] hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </div>
        );
      })}

      {remainder > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-[#030712] bg-[#0A0F20] flex items-center justify-center text-[10px] font-mono font-bold text-[#00F0FF] shadow-md z-10`}
        >
          +{remainder}
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredAvatar && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute -top-12 left-0 z-40 px-2.5 py-1.5 rounded-lg bg-[#0A0F20]/95 border border-slate-700 backdrop-blur-md shadow-2xl font-mono text-[11px] pointer-events-none whitespace-nowrap"
        >
          <div className="font-bold text-white leading-tight">{hoveredAvatar.name}</div>
          <div className="text-[10px] text-[#06B6D4] leading-tight mt-0.5">
            {hoveredAvatar.role} • {hoveredAvatar.company}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AvatarStack;
