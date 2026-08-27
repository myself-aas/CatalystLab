import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export interface CobeGlobeCdnProps {
  className?: string;
  phi?: number;
  theta?: number;
  dark?: number;
  scale?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: Array<{ location: [number, number]; size: number }>;
  onRender?: (state: Record<string, any>) => void;
}

/**
 * Baseline Reference Cobe Globe CDN Component
 */
export function CobeGlobeCdn({
  className = 'w-full h-full min-h-[350px]',
  phi = 0,
  theta = 0.3,
  dark = 0,
  scale = 1,
  diffuse = 1.2,
  mapSamples = 16000,
  mapBrightness = 6,
  baseColor = [1, 1, 1],
  markerColor = [0.1, 0.8, 1],
  glowColor = [1, 1, 1],
  markers = [
    { location: [37.7595, -122.4367], size: 0.03 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [51.5074, -0.1278], size: 0.05 },
    { location: [35.6762, 139.6503], size: 0.07 },
    { location: [1.3521, 103.8198], size: 0.06 },
    { location: [-33.8688, 151.2093], size: 0.05 },
    { location: [50.1109, 8.6821], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.05 },
    { location: [25.2048, 55.2708], size: 0.06 },
    { location: [19.0760, 72.8777], size: 0.07 },
  ],
  onRender,
}: CobeGlobeCdnProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  useEffect(() => {
    let width = 0;
    let currentPhi = phi;
    let currentTheta = theta;
    const doublePi = Math.PI * 2;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: Math.min(2, window.devicePixelRatio || 1),
      width: width * 2,
      height: width * 2,
      phi: currentPhi,
      theta: currentTheta,
      dark,
      diffuse,
      mapSamples,
      mapBrightness,
      baseColor,
      markerColor,
      glowColor,
      opacity: 1,
      offset: [0, 0],
      markers,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          currentPhi += 0.003;
        }
        state.phi = currentPhi + pointerInteractionMovement.current;
        state.theta = currentTheta;
        state.width = width * 2;
        state.height = width * 2;
        if (onRender) onRender(state);
      },
    });

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
    }, 100);

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [dark, diffuse, mapSamples, mapBrightness, baseColor, markerColor, glowColor, markers, phi, theta, onRender]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-0 transition-opacity duration-700 cursor-grab active:cursor-grabbing"
        style={{
          width: '100%',
          height: '100%',
          contain: 'layout paint size',
          maxWidth: '100%',
          aspectRatio: '1',
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.01;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.01;
          }
        }}
      />
    </div>
  );
}

export default CobeGlobeCdn;
