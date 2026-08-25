import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2 } from 'lucide-react';
import { CardBylineProps } from '../types';
import { getMediaAsset } from '../../../lib/media/registry';

export const CardByline: React.FC<CardBylineProps> = ({
  author,
  authorUrl,
  avatarUrl,
  avatarAssetId,
  avatarAlt,
  role,
  userRole,
  timestamp,
  verified = false,
  className,
  ...props
}) => {
  const displayRole = userRole || role;
  const resolvedAvatarUrl = avatarUrl || (avatarAssetId ? getMediaAsset(avatarAssetId)?.url : undefined);

  return (
    <div
      className={twMerge(
        clsx('flex items-center gap-2.5 text-xs text-slate-300 select-none', className)
      )}
      {...props}
    >
      {resolvedAvatarUrl && (
        <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-white/20 bg-slate-800">
          <img
            src={resolvedAvatarUrl}
            alt={avatarAlt || author}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex items-center gap-1.5 flex-wrap truncate">
        <span className="text-slate-400 font-normal">By</span>
        {authorUrl ? (
          <a
            href={authorUrl}
            className="font-medium text-white hover:text-cyan-300 underline underline-offset-2 decoration-slate-500 hover:decoration-cyan-300 transition-colors truncate"
          >
            {author}
          </a>
        ) : (
          <span className="font-medium text-white underline underline-offset-2 decoration-slate-500 truncate">
            {author}
          </span>
        )}
        {verified && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline-block shrink-0" />
        )}
        {displayRole && (
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            ({displayRole})
          </span>
        )}
        {timestamp && (
          <>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono text-[11px]">{timestamp}</span>
          </>
        )}
      </div>
    </div>
  );
};
