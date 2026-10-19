import React from 'react';

/**
 * Linear canvas behind the dark-theme shell: radial deep-space gradient, floating
 * light pools, and a 64px structural grid. Fixed behind the shell (z-0) so marketing
 * and product surfaces share one atmosphere.
 *
 * Performance: the light pools are radial gradients instead of `blur-[...]` filters,
 * and the full-viewport SVG noise filter is gone. Blur and SVG filters on a fixed,
 * full-viewport layer were the main scroll cost of this component
 * (docs/audit/perf-rendering-2026-10/02-client-rendering.md, C3). The pools keep their
 * colour, size, and position; only the falloff is a gradient instead of a Gaussian blur.
 */

const pool = (alpha: number): React.CSSProperties => ({
  background: `radial-gradient(closest-side, rgba(240, 250, 255, ${alpha}), rgba(240, 250, 255, 0))`,
});

export const LinearAmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#2C3032_0%,#2C2F32_55%,#1F2223_100%)]" />

      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2">
        <div
          className="h-[550px] w-[900px] will-change-transform animate-linear-blob motion-reduce:animate-none"
          style={pool(0.22)}
        />
      </div>
      <div
        className="absolute top-[20%] left-[-10%] h-[480px] w-[650px] will-change-transform animate-linear-blob-delayed motion-reduce:animate-none"
        style={pool(0.06)}
      />
      <div
        className="absolute top-[35%] right-[-10%] h-[420px] w-[550px] will-change-transform animate-linear-blob-slow motion-reduce:animate-none"
        style={pool(0.05)}
      />
      <div
        className="absolute bottom-[-10%] left-1/2 h-[350px] w-[1000px] -translate-x-1/2"
        style={pool(0.1)}
      />

      <div className="linear-grid-overlay absolute inset-0 opacity-60" />
    </div>
  );
};

export default LinearAmbientBackground;
