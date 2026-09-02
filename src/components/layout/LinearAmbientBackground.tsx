import React from 'react';

/**
 * LinearAmbientBackground
 * 
 * Implements the Linear / Modern multi-layer ambient lighting background system:
 * Layer 1: Base dark radial gradient (Deep Space canvas #020203 -> #050506 -> #0a0a0f)
 * Layer 2: Micro SVG noise grain texture at ~1.5% opacity for tactile surface depth
 * Layer 3: Dynamic floating ambient lighting blobs (Indigo #5E6AD2 primary, violet & electric blue satellites)
 * Layer 4: Subtle 64px geometric structural grid overlay at 2% opacity
 */
export const LinearAmbientBackground: React.FC = () => {
  return (
    <div 
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden -z-10 select-none"
    >
      {/* Layer 1: Deep Space Radial Foundation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#0e0e17_0%,#050506_55%,#020203_100%)] opacity-100" />

      {/* Layer 2: Micro Noise Texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.022] mix-blend-overlay">
        <filter id="linear-noise">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.8" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#linear-noise)" />
      </svg>

      {/* Layer 3: Ambient Gradient Blobs (Indigo Accent System) */}
      {/* Primary Blob: Top-Center Hero Core (#5E6AD2) */}
      <div 
        className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full bg-[#5E6AD2]/22 blur-[140px] animate-linear-blob will-change-transform"
      />

      {/* Secondary Blob: Left Flank Atmospheric Glow (Indigo-Violet) */}
      <div 
        className="absolute top-[20%] left-[-10%] w-[650px] h-[480px] rounded-full bg-[#7c3aed]/14 blur-[120px] animate-linear-blob-delayed will-change-transform"
      />

      {/* Tertiary Blob: Right Flank Azure Accent Glow */}
      <div 
        className="absolute top-[35%] right-[-10%] w-[550px] h-[420px] rounded-full bg-[#4338ca]/12 blur-[110px] animate-linear-blob-slow will-change-transform"
      />

      {/* Lower Horizon Ambient Glow */}
      <div 
        className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[350px] rounded-full bg-[#5E6AD2]/10 blur-[130px]"
      />

      {/* Layer 4: Architectural 64px Grid Overlay */}
      <div className="absolute inset-0 linear-grid-overlay opacity-60" />
    </div>
  );
};

export default LinearAmbientBackground;
