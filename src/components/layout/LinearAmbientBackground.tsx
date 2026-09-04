import React from 'react';

/**
 * Four-layer Linear canvas: radial deep-space gradient, grain, floating
 * indigo light pools, and a 64px structural grid. Fixed behind the shell
 * (z-0) so marketing and product surfaces share one atmosphere.
 */
export const LinearAmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#0e0e17_0%,#050506_55%,#020203_100%)]" />

      <svg className="absolute inset-0 h-full w-full opacity-[0.022] mix-blend-overlay">
        <filter id="linear-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#linear-noise)" />
      </svg>

      <div className="absolute top-[-15%] left-1/2 h-[550px] w-[900px] -translate-x-1/2 rounded-full bg-primary/22 blur-[140px] will-change-transform animate-linear-blob motion-reduce:animate-none" />
      <div className="absolute top-[20%] left-[-10%] h-[480px] w-[650px] rounded-full bg-purple-600/14 blur-[120px] will-change-transform animate-linear-blob-delayed motion-reduce:animate-none" />
      <div className="absolute top-[35%] right-[-10%] h-[420px] w-[550px] rounded-full bg-indigo-700/12 blur-[110px] will-change-transform animate-linear-blob-slow motion-reduce:animate-none" />
      <div className="absolute bottom-[-10%] left-1/2 h-[350px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <div className="linear-grid-overlay absolute inset-0 opacity-60" />
    </div>
  );
};

export default LinearAmbientBackground;
