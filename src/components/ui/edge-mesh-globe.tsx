import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useId,
} from 'react';
import createGlobe from 'cobe';
import { logger } from '../../lib/logger';

// cobe's shipped COBEOptions type predates the onRender callback option.
type CobeOptionsWithRender = import('cobe').COBEOptions & {
  onRender?: (state: Record<string, number> & { phi: number; theta: number; width: number; height: number }) => void;
};

import {
  Globe2,
  Activity,
  Radar,
  Crosshair,
  ShieldCheck,
  Zap,
  Radio,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Lock,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Move3d,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  EdgePoP,
  EDGE_POPS,
  getPoPsByPlan,
  findPoPById,
  PoPTier,
  PoPStatus,
} from '@/lib/edge/pops';
import { useTelemetryHUDStore, PlanTier, GlobeScanState } from '@/store/useTelemetryHUDStore';

export type GlobeVariant = 'hero' | 'panel' | 'live' | 'static' | 'thumb';

export interface EdgeMeshGlobeProps {
  variant?: GlobeVariant;
  className?: string;
  /** Optional engine focus hint (dashboard HUD cross-highlighting). */
  focusedEngine?: string | null;
  planTier?: PlanTier;
  filterTiers?: PoPTier[];
  interactive?: boolean;
  autoSpin?: boolean;
  showInspector?: boolean;
  showChips?: boolean;
  showControls?: boolean;
  originPoPId?: string;
  customTargets?: Array<{
    id: string;
    name: string;
    coordinates: [number, number];
    type?: 'integration' | 'service';
  }>;
  onSelectPoP?: (pop: EdgePoP) => void;
  dark?: boolean;
}

/**
 * 3D Orthographic projection helper: converts [lat, lon] to 2D screen coordinates
 * given sphere center, radius, phi (longitude rotation), and theta (tilt).
 */
export function projectCoordinates(
  lat: number,
  lon: number,
  phi: number,
  theta: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number; visible: boolean; z: number } {
  // Convert lat/lon degrees to radians
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  // 3D sphere coordinates
  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);
  const cosLon = Math.cos(lonRad);
  const sinLon = Math.sin(lonRad);

  // Unrotated vector (Y-up, Z-forward, X-right)
  const x0 = cosLat * sinLon;
  const y0 = sinLat;
  const z0 = cosLat * cosLon;

  // Rotate by theta around X axis (tilt)
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const y1 = y0 * cosTheta - z0 * sinTheta;
  const z1 = y0 * sinTheta + z0 * cosTheta;

  // Rotate by phi around Y axis
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const x2 = x0 * cosPhi + z1 * sinPhi;
  const z2 = -x0 * sinPhi + z1 * cosPhi;
  const y2 = y1;

  // z2 > 0 is front-facing hemisphere
  const visible = z2 > 0.05;
  const x = centerX + x2 * radius;
  const y = centerY - y2 * radius;

  return { x, y, visible, z: z2 };
}

/**
 * PoP Inspector Drawer / Floating Card
 */
export function PoPInspectorPanel({
  pop,
  onClose,
  onTriggerProbe,
}: {
  pop: EdgePoP | null;
  onClose: () => void;
  onTriggerProbe?: (pop: EdgePoP) => void;
}) {
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<string | null>(null);

  if (!pop) return null;

  const handleProbe = () => {
    setProbing(true);
    setProbeResult(null);
    setTimeout(() => {
      setProbing(false);
      setProbeResult(
        `Synchronous handshake OK: ${pop.ttfbMs.toFixed(1)}ms via Anycast ${pop.code}`
      );
      if (onTriggerProbe) onTriggerProbe(pop);
    }, 600);
  };

  const statusColor =
    pop.status === 'optimal'
      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
      : pop.status === 'degraded'
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-500 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="absolute right-3 top-3 z-30 w-72 sm:w-80 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl text-white font-sans transition-all animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-sm">
            {pop.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold leading-none text-slate-100">
                {pop.location}
              </h4>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-mono uppercase font-bold border',
                  statusColor
                )}
              >
                {pop.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{pop.region}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          aria-label="Close Inspector"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2.5 text-xs font-mono">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5">TTFB LATENCY</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              {pop.ttfbMs} ms
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5">TLS HANDSHAKE</span>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 truncate">
              <Lock className="h-3 w-3 text-cyan-400 shrink-0" />
              <span className="truncate">{pop.tlsRtt}</span>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">HTTP/3 QUIC:</span>
            <span
              className={
                pop.http3 ? 'text-emerald-400 font-bold' : 'text-slate-500'
              }
            >
              {pop.http3 ? 'ACTIVE (0-RTT)' : 'DISABLED'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Anycast IP:</span>
            <span className="text-slate-200">{pop.ipPrefix}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Live Traffic:</span>
            <span className="text-slate-200">
              {pop.requestsPerSec.toLocaleString()} req/s
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Carbon Intensity:</span>
            <span className="text-slate-200">{pop.carbonIntensity} gCO₂/kWh</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Tier Classification:</span>
            <span className="text-blue-400 font-bold">Tier {pop.tier} Core Hub</span>
          </div>
        </div>

        {probeResult && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300 text-[11px] flex items-center gap-1.5 animate-in fade-in duration-200">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span>{probeResult}</span>
          </div>
        )}

        <div className="pt-1">
          <button
            onClick={handleProbe}
            disabled={probing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', probing && 'animate-spin')}
            />
            <span>{probing ? 'Synthesizing Anycast Probe...' : 'Dispatch Live Probe'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * CatalystLab Edge Mesh Globe Component
 */
export function EdgeMeshGlobe({
  variant = 'panel',
  className = '',
  planTier,
  filterTiers,
  interactive = true,
  autoSpin = true,
  showInspector = true,
  showChips = true,
  showControls = true,
  originPoPId = 'pop-iad',
  customTargets,
  onSelectPoP,
  dark = true,
}: EdgeMeshGlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shockwaveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store bindings
  const focusedPoP = useTelemetryHUDStore((s) => s.focusedPoP);
  const setFocusedPoP = useTelemetryHUDStore((s) => s.setFocusedPoP);
  const scanState = useTelemetryHUDStore((s) => s.scanState);
  const storePlanTier = useTelemetryHUDStore((s) => s.planTier);
  const targetLocation = useTelemetryHUDStore((s) => s.targetLocation);

  const activePlanTier = planTier || storePlanTier;

  // Interaction refs
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const globeInstanceRef = useRef<{ destroy: () => void } | null>(null);

  // Component state
  const [hoveredPoP, setHoveredPoP] = useState<EdgePoP | null>(null);
  const [grabMode, setGrabMode] = useState(false);
  const [projectedPoPs, setProjectedPoPs] = useState<
    Array<{ pop: EdgePoP; x: number; y: number; visible: boolean; z: number }>
  >([]);
  const [trafficRate, setTrafficRate] = useState(14820);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const elementId = useId();

  // Determine active PoPs according to plan/tier filter
  const activePoPs = React.useMemo(() => {
    let list = getPoPsByPlan(activePlanTier);
    if (filterTiers && filterTiers.length > 0) {
      list = list.filter((p) => filterTiers.includes(p.tier));
    }
    return list;
  }, [activePlanTier, filterTiers]);

  // Reduced motion detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver to pause rendering when off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Live traffic rate jitter loop (Only for hero and live variants)
  useEffect(() => {
    if (variant !== 'hero' && variant !== 'live') return;
    if (!isIntersecting || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setTrafficRate((prev) => {
        const delta = Math.floor(Math.random() * 600) - 280;
        return Math.max(8500, Math.min(24000, prev + delta));
      });
    }, 250);

    return () => clearInterval(interval);
  }, [variant, isIntersecting, prefersReducedMotion]);

  // One-shot shockwave animation when scanState === 'done'
  useEffect(() => {
    if (scanState !== 'done') return;
    const canvas = shockwaveCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const maxFrames = 45;
    let animId: number;

    const animateShockwave = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const progress = frame / maxFrames;
      const radius = progress * (canvas.width * 0.48);
      const alpha = Math.max(0, 1 - progress);

      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      ctx.lineWidth = 4 * (1 - progress) + 1;
      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Secondary ring
      if (progress > 0.15) {
        const p2 = (progress - 0.15) / 0.85;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius * 0.75, 0, Math.PI * 2);
        ctx.lineWidth = 2 * (1 - p2);
        ctx.strokeStyle = `rgba(37, 255, 140, ${alpha * 0.8})`;
        ctx.stroke();
      }

      ctx.restore();

      if (frame < maxFrames) {
        animId = requestAnimationFrame(animateShockwave);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animId = requestAnimationFrame(animateShockwave);
    return () => cancelAnimationFrame(animId);
  }, [scanState]);

  // WebGL Globe Initialization & Continuous Render Loop
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    if (!isIntersecting) return;

    let width = Math.max(containerRef.current.getBoundingClientRect().width, 1);
    let phi = 0;
    let theta = 0.25;

    // Center on focused PoP if defined
    if (focusedPoP) {
      phi = ((-focusedPoP.coordinates[1] - 90) * Math.PI) / 180;
      theta = (focusedPoP.coordinates[0] * Math.PI) / 180 * 0.5;
    }

    const onResize = () => {
      if (containerRef.current && canvasRef.current) {
        width = Math.max(containerRef.current.getBoundingClientRect().width, 1);
        if (shockwaveCanvasRef.current) {
          shockwaveCanvasRef.current.width = width;
          shockwaveCanvasRef.current.height = width;
        }
      }
    };
    window.addEventListener('resize', onResize);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(containerRef.current);
    onResize();

    // Palette definition according to theme requirements
    // Dark: dark:1, baseColor:[0.07,0.08,0.09], mapBrightness:1.4, markerColor:[0.25,1,0.55], glowColor:[0.01,0.06,0.05]
    // Light: dark:0, baseColor:[0.95,0.96,0.98], mapBrightness:6, markerColor:[0.05,0.5,1], glowColor:[0.9,0.95,1]
    const globeDark = dark ? 1 : 0;
    const baseColor: [number, number, number] = dark
      ? [0.07, 0.08, 0.09]
      : [0.94, 0.95, 0.98];
    const mapBrightness = dark ? 1.4 : 5.5;
    const markerColor: [number, number, number] = dark
      ? [0.25, 1, 0.55]
      : [0.05, 0.5, 1];
    const glowColor: [number, number, number] = dark
      ? [0.01, 0.06, 0.05]
      : [0.9, 0.95, 1];

    // Marker geometry generation from PoP registry & state
    const markers = activePoPs.map((pop) => {
      let size = pop.tier === 1 ? 0.08 : pop.tier === 2 ? 0.055 : 0.04;
      if (focusedPoP && focusedPoP.id === pop.id) {
        size = 0.12;
      }
      return {
        location: pop.coordinates as [number, number],
        size,
      };
    });

    // If scanning, add target location marker
    if (scanState === 'running' && targetLocation) {
      markers.push({
        location: targetLocation,
        size: 0.14,
      });
    }

    // Static/thumb modes don't spin continuously
    const isStatic = variant === 'static' || variant === 'thumb' || prefersReducedMotion;
    const spinSpeed = isStatic || !autoSpin ? 0 : 0.003;

    try {
      const globe = createGlobe(canvasRef.current, {
        devicePixelRatio: Math.min(2, window.devicePixelRatio || 1),
        width: width * 2,
        height: width * 2,
        phi,
        theta,
        dark: globeDark,
        diffuse: 1.2,
        mapSamples: variant === 'thumb' ? 8000 : 16000,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        opacity: 1,
        offset: [0, 0],
        markers,
        onRender: (state: Record<string, number> & { phi: number; theta: number; width: number; height: number }) => {
          if (!pointerInteracting.current && !isStatic) {
            phi += spinSpeed;
          }
          state.phi = phi + pointerInteractionMovement.current;
          state.theta = theta;
          state.width = width * 2;
          state.height = width * 2;

          // Compute orthographic projection for overlay chips and labels
          if (showChips || interactive) {
            const centerX = width / 2;
            const centerY = width / 2;
            const radius = width * 0.45;

            const projected = activePoPs.map((pop) => {
              const proj = projectCoordinates(
                pop.coordinates[0],
                pop.coordinates[1],
                state.phi,
                state.theta,
                centerX,
                centerY,
                radius
              );
              return {
                pop,
                ...proj,
              };
            });

            setProjectedPoPs(projected);
          }
        },
      } as CobeOptionsWithRender);

      globeInstanceRef.current = globe;

      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
    } catch (err) {
      logger.warn('WebGL / Cobe initialization fallback:', err);
    }

    return () => {
      if (globeInstanceRef.current) {
        globeInstanceRef.current.destroy();
        globeInstanceRef.current = null;
      }
      window.removeEventListener('resize', onResize);
      resizeObserver.disconnect();
    };
  }, [
    activePoPs,
    focusedPoP,
    scanState,
    targetLocation,
    dark,
    variant,
    autoSpin,
    interactive,
    showChips,
    isIntersecting,
    prefersReducedMotion,
  ]);

  // Keyboard navigation support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!interactive) return;
      if (e.key === 'ArrowLeft') {
        pointerInteractionMovement.current -= 0.05;
      } else if (e.key === 'ArrowRight') {
        pointerInteractionMovement.current += 0.05;
      }
    },
    [interactive]
  );

  // PoP selection handler
  const handleSelectPoP = (pop: EdgePoP) => {
    setFocusedPoP(pop);
    if (onSelectPoP) onSelectPoP(pop);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    // For coarse pointers (mobile), only drag if grabMode is enabled
    if (e.pointerType === 'touch' && !grabMode) {
      return;
    }
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta * 0.008;
    }
  };

  return (
    <div
      ref={containerRef}
      id={`edge-globe-container-${elementId}`}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={handleKeyDown}
      role="img"
      aria-label={`Interactive 3D CatalystLab Edge Mesh Globe displaying ${activePoPs.length} Anycast Points of Presence across global cloud regions`}
      className={cn(
        'relative flex items-center justify-center select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-3xl overflow-hidden',
        variant === 'hero' && 'w-full aspect-square max-w-[560px] lg:max-w-[640px]',
        variant === 'panel' && 'w-full aspect-square max-w-[480px]',
        variant === 'live' && 'w-full aspect-square max-w-[520px]',
        variant === 'static' && 'w-full aspect-square max-w-[360px]',
        variant === 'thumb' && 'w-full aspect-square max-w-[200px]',
        className
      )}
      style={{ touchAction: grabMode ? 'none' : 'pan-y' }}
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Primary WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10 h-full w-full opacity-100 transition-opacity duration-700 cursor-grab active:cursor-grabbing"
        style={{
          width: '100%',
          height: '100%',
          contain: 'layout paint size',
          aspectRatio: '1',
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
      />

      {/* One-Shot Shockwave Overlay Canvas */}
      <canvas
        ref={shockwaveCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* Orthographic Projection Traffic & Region Chips Overlay */}
      {showChips && variant !== 'thumb' && (
        <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
          {projectedPoPs
            .filter((item) => item.visible && item.pop.tier <= 2)
            .slice(0, 10)
            .map(({ pop, x, y }) => {
              const isSelected = focusedPoP?.id === pop.id;
              const isHovered = hoveredPoP?.id === pop.id;

              return (
                <div
                  key={pop.id}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`,
                  }}
                  className={cn(
                    'absolute transition-opacity duration-200 pointer-events-auto',
                    isSelected || isHovered ? 'z-30 scale-105' : 'z-20 opacity-85 hover:opacity-100'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectPoP(pop)}
                    onMouseEnter={() => setHoveredPoP(pop)}
                    onMouseLeave={() => setHoveredPoP(null)}
                    aria-label={`PoP ${pop.code} in ${pop.location}`}
                    className={cn(
                      'group flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono backdrop-blur-md shadow-md transition-all cursor-pointer whitespace-nowrap',
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/90 text-cyan-200 ring-2 ring-cyan-400/40'
                        : pop.status === 'optimal'
                        ? 'border-emerald-500/40 bg-slate-950/80 text-emerald-400 hover:border-emerald-400'
                        : 'border-amber-500/40 bg-slate-950/80 text-amber-400 hover:border-amber-400'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        pop.status === 'optimal'
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-amber-400'
                      )}
                    />
                    <span className="font-bold">{pop.code}</span>
                    <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                      {pop.ttfbMs}ms
                    </span>
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* Floating Audit Beam / Scan State Indicator */}
      {scanState === 'running' && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/90 px-3.5 py-1.5 text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md animate-pulse">
          <Radar className="h-4 w-4 animate-spin text-cyan-400" />
          <span className="font-bold">AUDIT BEAM CONVERGING (42 PoPs)</span>
        </div>
      )}

      {/* Live HUD Telemetry Badge (Hero & Live variants) */}
      {(variant === 'hero' || variant === 'live') && (
        <div className="absolute bottom-3 left-3 z-30 flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/85 px-3 py-1.5 text-xs font-mono text-slate-300 backdrop-blur-md shadow-lg">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-100">
              {trafficRate.toLocaleString()}
            </span>
            <span className="text-slate-500 text-[10px]">req/s</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/85 px-2.5 py-1.5 text-xs font-mono text-slate-400 backdrop-blur-md">
            <Server className="h-3.5 w-3.5 text-blue-400" />
            <span>{activePoPs.length} PoPs Mesh</span>
          </div>
        </div>
      )}

      {/* Coarse pointer mobile grab toggle & controls */}
      {showControls && interactive && variant !== 'thumb' && (
        <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setGrabMode(!grabMode)}
            aria-label="Toggle Globe Drag Mode"
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-mono backdrop-blur-md transition-all cursor-pointer shadow-md',
              grabMode
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:text-white'
            )}
          >
            <Move3d className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{grabMode ? 'Drag Active' : 'Drag to Rotate'}</span>
          </button>
        </div>
      )}

      {/* Selected PoP Inspector Panel */}
      {showInspector && focusedPoP && variant !== 'thumb' && (
        <PoPInspectorPanel
          pop={focusedPoP}
          onClose={() => setFocusedPoP(null)}
          onTriggerProbe={(pop) => {
            // Signal to parent or store
          }}
        />
      )}

      {/* Visually Hidden Screen Reader Data Table Fallback (A11y Requirement) */}
      <div className="sr-only">
        <table>
          <caption>CatalystLab Anycast Edge PoPs Status and Latency Matrix</caption>
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Location</th>
              <th scope="col">Region</th>
              <th scope="col">Tier</th>
              <th scope="col">Status</th>
              <th scope="col">TTFB Latency</th>
              <th scope="col">TLS Handshake</th>
              <th scope="col">HTTP/3 QUIC</th>
            </tr>
          </thead>
          <tbody>
            {activePoPs.map((pop) => (
              <tr key={pop.id}>
                <td>{pop.code}</td>
                <td>{pop.location}</td>
                <td>{pop.region}</td>
                <td>Tier {pop.tier}</td>
                <td>{pop.status}</td>
                <td>{pop.ttfbMs} ms</td>
                <td>{pop.tlsRtt}</td>
                <td>{pop.http3 ? 'Enabled' : 'Disabled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EdgeMeshGlobe;
