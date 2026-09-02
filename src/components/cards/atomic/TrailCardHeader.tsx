import React from 'react';
import { TrailCardHeaderProps } from '../../../types/card';

export const TrailCardHeader: React.FC<TrailCardHeaderProps> = ({
  title,
  subtitle,
  imageUrl,
  imageAltText,
}) => {
  const altText = imageAltText || `${title} trail landscape in ${subtitle}`;

  return (
    <div 
      className="relative w-full aspect-[4/3] overflow-hidden rounded-t-[16px] bg-[#0D0D0D] select-none"
      id={`trail-header-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      {/* Background Image with smooth scaling on parent hover */}
      <img
        src={imageUrl}
        alt={altText}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        onError={(e) => {
          // Fallback image if source fails
          (e.currentTarget as HTMLImageElement).src =
            'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1';
        }}
      />

      {/* Seamless Scrim Overlay: Transparent top -> Deep Black -> Dark Charcoal #1A1A1A at bottom */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 35%, rgba(9, 9, 11, 0.6) 65%, rgba(9, 9, 11, 0.9) 90%, transparent 100%)',
        }}
      />

      {/* Title & Subtitle absolute positioning at lower edge */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-col justify-end">
        <h3 
          className="text-xl sm:text-2xl font-bold font-sans text-primary-foreground tracking-tight leading-tight line-clamp-1 drop-shadow-md transition-colors group-hover:text-cyan-400"
          title={title}
        >
          {title}
        </h3>
        <p className="text-sm font-medium font-sans text-zinc-400 mt-0.5 line-clamp-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
