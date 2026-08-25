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
  sources?: string[];
}

export interface AvatarStackProps {
  avatars?: AvatarItem[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DEFAULT_TESTIMONIAL_AVATARS: AvatarItem[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    role: 'VP Infrastructure',
    company: 'NexusWave',
    assetId: 'avatar-sarah-chen',
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'Chief Architect',
    company: 'StrataCore Global',
    assetId: 'avatar-marcus-vance',
  },
  {
    id: 'elena',
    name: 'Elena Rostova',
    role: 'Head of Edge Engineering',
    company: 'HyperScale Media',
    assetId: 'avatar-elena-rostova',
  },
  {
    id: 'david',
    name: 'David Kim',
    role: 'Principal SRE',
    company: 'FinGrid Financial',
    assetId: 'avatar-david-kim',
  },
];

const AvatarSingle: React.FC<{
  avatar: AvatarItem;
  sizeClasses: string;
  isFirst: boolean;
  onHover: (av: AvatarItem | null) => void;
}> = ({ avatar, sizeClasses, isFirst, onHover }) => {
  const asset: MediaAsset | null = avatar.assetId ? getMediaAsset(avatar.assetId) : null;
  const sources: string[] =
    avatar.sources && avatar.sources.length > 0
      ? avatar.sources
      : avatar.imageUrl
      ? [avatar.imageUrl, ...(asset?.sources || [])]
      : asset?.sources && asset.sources.length > 0
      ? asset.sources
      : asset?.url
      ? [asset.url]
      : [];

  const [sourceIdx, setSourceIdx] = useState(0);
  const [isDegraded, setIsDegraded] = useState(false);

  const handleError = () => {
    if (sourceIdx < sources.length - 1) {
      console.warn(
        `[media] Avatar source ${sourceIdx} failed for <${avatar.name}>. Trying next fallback source ${sourceIdx + 1}...`
      );
      setSourceIdx((prev) => prev + 1);
    } else {
      setIsDegraded(true);
      console.warn(`[media] slot <avatar-${avatar.id}> degraded`);
    }
  };

  const currentSrc = sources[sourceIdx] || avatar.imageUrl || asset?.url || '';

  return (
    <div
      onMouseEnter={() => onHover(avatar)}
      onMouseLeave={() => onHover(null)}
      className={`relative ${isFirst ? 'ml-0' : sizeClasses} transition-transform duration-300 hover:scale-115 hover:z-30 cursor-pointer`}
    >
      <div className="w-full h-full rounded-full border-2 border-[#030712] overflow-hidden bg-slate-800 shadow-md">
        {!isDegraded && currentSrc ? (
          <img
            src={currentSrc}
            alt={`${avatar.name} - ${avatar.role} at ${avatar.company}`}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            
            onError={handleError}
            className="w-full h-full object-cover grayscale-[0.2] contrast-[1.05] hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-slate-900 flex items-center justify-center text-[10px] font-bold text-cyan-200">
            {avatar.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

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
      {displayed.map((avatar, idx) => (
        <AvatarSingle
          key={avatar.id}
          avatar={avatar}
          sizeClasses={sizeClasses[size]}
          isFirst={idx === 0}
          onHover={setHoveredAvatar}
        />
      ))}

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
