import React from 'react';
import { PLATE, asPlate } from '../../../lib/media/plates';
import { motion } from 'motion/react';
import { TrailCardHeaderProps } from '../../../types/card';

export const TrailCardHeader: React.FC<TrailCardHeaderProps> = ({
  title,
  subtitle,
  imageUrl,
  imageAltText,
}) => {
  const altText = imageAltText || `${title} trail landscape in ${subtitle}`;
  const plate = asPlate(imageUrl || PLATE.heroNetwork);
  const [failed, setFailed] = React.useState(false);

  return (
    <div 
      className="relative w-full aspect-[4/3] overflow-hidden rounded-t-[16px] bg-card select-none"
      id={`trail-header-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      {/* Background Image with smooth scaling on parent hover */}
      {failed || (!plate.avif && !plate.webp) ? (
        <motion.img
          src={failed ? PLATE.heroNetwork.src : plate.src}
          alt={altText}
          loading="lazy"
          referrerPolicy="no-referrer"
          whileHover={{ scale: 1.035 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover"
        />
      ) : (
        <picture>
          {plate.avif && <source srcSet={plate.avif} type="image/avif" />}
          {plate.webp && <source srcSet={plate.webp} type="image/webp" />}
          <motion.img
            src={plate.src}
            alt={altText}
            loading="lazy"
            referrerPolicy="no-referrer"
            whileHover={{ scale: 1.035 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover"
            onError={() => setFailed(true)}
          />
        </picture>
      )}

      {/* Seamless Scrim Overlay: Transparent top -> Deep Black -> Ink Navy at bottom */}
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
        <p className="text-sm font-medium font-sans text-muted-foreground mt-0.5 line-clamp-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
