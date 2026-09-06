import React, { useState, useMemo } from 'react';
import {
  Activity,
  Sparkles,
  GitBranch,
  Globe2,
  Leaf,
  ShieldCheck,
  Cpu,
  Search,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Target
} from 'lucide-react';
import type { DiagnosticEngineId, MasterTelemetryReport } from '../../types/telemetry';

export interface AuditScoreMatrixRadarProps {
  report?: MasterTelemetryReport | null;
  activeEngines?: DiagnosticEngineId[];
  isScanning?: boolean;
  onSelectEngine?: (engineId: DiagnosticEngineId) => void;
  className?: string;
}

interface RadarDimension {
  id: DiagnosticEngineId;
  name: string;
  shortLabel: string;
  category: 'Performance' | 'Intelligence' | 'Security' | 'Architecture';
  sdlcPhase: string;
  icon: React.ElementType;
  score: number;
  benchmark: number;
  color: string;
  status: 'OPTIMAL' | 'COMPLIANT' | 'MODERATE' | 'CRITICAL';
  details: string;
}

export const AuditScoreMatrixRadar: React.FC<AuditScoreMatrixRadarProps> = ({
  report,
  activeEngines = [],
  isScanning = false,
  onSelectEngine,
  className = ''
}) => {
  const [hoveredAxis, setHoveredAxis] = useState<DiagnosticEngineId | null>(null);
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Dimension Configuration for the 8 Specialized Diagnostic Engines
  const dimensions: RadarDimension[] = useMemo(() => {
    const getScore = (id: DiagnosticEngineId, fallback: number): number => {
      if (report?.engines?.[id]?.score !== undefined) {
        return Math.max(0, Math.min(100, Math.round(report.engines[id].score)));
      }
      return fallback;
    };

    const getStatus = (score: number): 'OPTIMAL' | 'COMPLIANT' | 'MODERATE' | 'CRITICAL' => {
      if (score >= 90) return 'OPTIMAL';
      if (score >= 80) return 'COMPLIANT';
      if (score >= 60) return 'MODERATE';
      return 'CRITICAL';
    };

    const d: Array<{
      id: DiagnosticEngineId;
      name: string;
      shortLabel: string;
      category: 'Performance' | 'Intelligence' | 'Security' | 'Architecture';
      sdlcPhase: string;
      icon: React.ElementType;
      fallbackScore: number;
      benchmark: number;
      color: string;
      details: string;
    }> = [
      {
        id: 'health',
        name: 'Core Web Vitals & DOM Depth',
        shortLabel: 'Core Vitals',
        category: 'Performance',
        sdlcPhase: 'Testing & Vitals',
        icon: Activity,
        fallbackScore: 88,
        benchmark: 82,
        color: '#10B981',
        details: 'TTFB, FCP, LCP, INP & DOM nesting depth'
      },
      {
        id: 'ai_ready',
        name: 'AI Agent & LLM Readiness',
        shortLabel: 'AI Crawler',
        category: 'Intelligence',
        sdlcPhase: 'Operations & RAG',
        icon: Sparkles,
        fallbackScore: 92,
        benchmark: 75,
        color: '#06B6D4',
        details: '/llms.txt, Schema.org, GPTBot, ClaudeBot policies'
      },
      {
        id: 'repo',
        name: 'Repo Hygiene & Supply Chain',
        shortLabel: 'Supply Chain',
        category: 'Architecture',
        sdlcPhase: 'Code Quality',
        icon: GitBranch,
        fallbackScore: 85,
        benchmark: 78,
        color: '#8B5CF6',
        details: 'Dependency drift, open vulnerabilities & license check'
      },
      {
        id: 'latency',
        name: 'Global Edge Network Latency',
        shortLabel: 'Edge Latency',
        category: 'Performance',
        sdlcPhase: 'Release & Edge',
        icon: Globe2,
        fallbackScore: 84,
        benchmark: 80,
        color: '#0EA5E9',
        details: 'Multi-region CDN roundtrip & TTFB latency'
      },
      {
        id: 'eco',
        name: 'Eco Carbon & SWD Rating',
        shortLabel: 'Eco SWD',
        category: 'Performance',
        sdlcPhase: 'Build & Asset SWD',
        icon: Leaf,
        fallbackScore: 94,
        benchmark: 76,
        color: '#84CC16',
        details: 'Sustainable Web Design v4, CO2/pageview emissions'
      },
      {
        id: 'compliance',
        name: 'OWASP & DevSecOps Security',
        shortLabel: 'DevSecOps',
        category: 'Security',
        sdlcPhase: 'DevSecOps & OWASP',
        icon: ShieldCheck,
        fallbackScore: 89,
        benchmark: 82,
        color: '#F59E0B',
        details: 'HSTS, CSP headers, SSL cert validity & CVEs'
      },
      {
        id: 'migration',
        name: 'Platform Migration AST',
        shortLabel: 'Migration AST',
        category: 'Architecture',
        sdlcPhase: 'Planning & AST',
        icon: Cpu,
        fallbackScore: 80,
        benchmark: 70,
        color: '#EC4899',
        details: 'Framework lock-in risk & AST compatibility score'
      },
      {
        id: 'ai_search',
        name: 'AI Search Optimization (LLMO)',
        shortLabel: 'LLMO Search',
        category: 'Intelligence',
        sdlcPhase: 'Evolution & LLMO',
        icon: Search,
        fallbackScore: 86,
        benchmark: 74,
        color: '#14B8A6',
        details: 'Perplexity & SearchGPT semantic synthesizability'
      }
    ];

    return d.map(item => {
      const score = getScore(item.id, item.fallbackScore);
      return {
        ...item,
        score,
        status: getStatus(score)
      };
    });
  }, [report]);

  // Radar geometry calculations (Center: 240, 240; Max Radius: 160)
  const cx = 240;
  const cy = 240;
  const radius = 160;
  const totalAxes = dimensions.length;

  const getCoordinates = (index: number, value: number, maxRadius: number = radius) => {
    const angle = (index * 2 * Math.PI) / totalAxes - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric polygon rings (20%, 40%, 60%, 80%, 100%)
  const rings = [20, 40, 60, 80, 100];

  const getPolygonPoints = (values: number[]) => {
    return values
      .map((val, idx) => {
        const { x, y } = getCoordinates(idx, val);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const currentPoints = useMemo(() => {
    return getPolygonPoints(dimensions.map(d => d.score));
  }, [dimensions]);

  const benchmarkPoints = useMemo(() => {
    return getPolygonPoints(dimensions.map(d => d.benchmark));
  }, [dimensions]);

  const averageScore = useMemo(() => {
    if (report?.overallScore) return report.overallScore;
    const sum = dimensions.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / dimensions.length);
  }, [dimensions, report]);

  const filteredMatrix = useMemo(() => {
    if (categoryFilter === 'ALL') return dimensions;
    return dimensions.filter(d => d.category.toUpperCase() === categoryFilter);
  }, [dimensions, categoryFilter]);

  const getStatusBadge = (status: 'OPTIMAL' | 'COMPLIANT' | 'MODERATE' | 'CRITICAL') => {
    switch (status) {
      case 'OPTIMAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            OPTIMAL
          </span>
        );
      case 'COMPLIANT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            COMPLIANT
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            MODERATE
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            CRITICAL
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-2xl p-5 sm:p-6 text-foreground backdrop-blur-xl ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-cyan-300">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>8-Engine Telemetry Matrix & Multi-Axis Radar</span>
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Multi-Vector Diagnostic Spectrum
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl font-sans">
            Calibrated polygon projection across core frontend vitals, autonomous AI agent accessibility, edge delivery latency, and OWASP compliance.
          </p>
        </div>

        {/* Global Composite Indicator & Controls */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all active:scale-95 ${
              showBenchmark
                ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                : 'border-border bg-primary text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showBenchmark ? 'bg-indigo-400' : 'bg-muted'
              }`}
            />
            <span>Industry Benchmark</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-primary/90 font-mono">
            <span className="text-[11px] text-muted-foreground">Composite:</span>
            <span className="text-base font-bold text-foreground">{averageScore}/100</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
              {report?.grade || (averageScore >= 90 ? 'A' : averageScore >= 80 ? 'B' : 'C')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual-Cockpit Body: Left Radar Visualizer | Right Score Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
        {/* LEFT: Multi-Axis SVG Radar (Columns 1-6) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
            {/* Ambient Backlight */}
            <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

            <svg
              viewBox="0 0 480 480"
              className="w-full h-full overflow-visible"
              aria-label="Multi-axis radar chart showing 8 engine scores"
              role="img"
            >
              <defs>
                {/* Radar Fill Gradient */}
                <linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#10B981" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.35" />
                </linearGradient>

                {/* Benchmark Fill Gradient */}
                <linearGradient id="benchmarkFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4338CA" stopOpacity="0.05" />
                </linearGradient>

                {/* Node Glow Filter */}
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.7" />
                </filter>
              </defs>

              {/* Concentric Reference Rings */}
              {rings.map((ringValue) => {
                const ringRadius = (ringValue / 100) * radius;
                const ringPoints = getPolygonPoints(Array(totalAxes).fill(ringValue));
                return (
                  <g key={`ring-${ringValue}`}>
                    <polygon
                      points={ringPoints}
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth={ringValue === 100 ? '1.5' : '1'}
                      strokeDasharray={ringValue === 100 ? undefined : '3 3'}
                    />
                    {/* Ring score label */}
                    <text
                      x={cx + 3}
                      y={cy - ringRadius + 9}
                      fill="#475569"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {ringValue}
                    </text>
                  </g>
                );
              })}

              {/* Axis Spokes from Center to Outer Radius */}
              {dimensions.map((dim, idx) => {
                const outer = getCoordinates(idx, 100);
                const isHovered = hoveredAxis === dim.id;

                return (
                  <line
                    key={`spoke-${dim.id}`}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke={isHovered ? '#06B6D4' : '#334155'}
                    strokeWidth={isHovered ? '2' : '1'}
                    strokeDasharray="2 2"
                    className="transition-all duration-200"
                  />
                );
              })}

              {/* Benchmark Polygon Overlay */}
              {showBenchmark && (
                <polygon
                  points={benchmarkPoints}
                  fill="url(#benchmarkFillGradient)"
                  stroke="#6366F1"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  className="transition-all duration-300"
                />
              )}

              {/* Active Telemetry Score Polygon */}
              <polygon
                points={currentPoints}
                fill="url(#radarFillGradient)"
                stroke="#06B6D4"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-out drop-shadow-md"
              />

              {/* Interactive Nodes on Score Vertices */}
              {dimensions.map((dim, idx) => {
                const coords = getCoordinates(idx, dim.score);
                const isHovered = hoveredAxis === dim.id;
                const isScanningActive = activeEngines.includes(dim.id) && isScanning;

                return (
                  <g
                    key={`node-${dim.id}`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredAxis(dim.id)}
                    onMouseLeave={() => setHoveredAxis(null)}
                    onClick={() => onSelectEngine && onSelectEngine(dim.id)}
                  >
                    {/* Pulse ring if active engine scanning */}
                    {isScanningActive && (
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="10"
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer glow circle */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isHovered ? 7 : 5}
                      fill={dim.color}
                      stroke="#090D16"
                      strokeWidth="2"
                      filter={isHovered ? 'url(#nodeGlow)' : undefined}
                      className="transition-all duration-200"
                    />

                    {/* Node Core */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="2.5"
                      fill="#FFFFFF"
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}

              {/* Axis Labels and Badges around the Perimeter */}
              {dimensions.map((dim, idx) => {
                const labelRadius = radius + 34;
                const { x, y, angle } = getCoordinates(idx, 100, labelRadius);
                const isHovered = hoveredAxis === dim.id;

                // Determine text-anchor based on horizontal position
                let textAnchor: 'inherit' | 'end' | 'start' | 'middle' = 'middle';
                if (Math.cos(angle) > 0.3) textAnchor = 'start';
                else if (Math.cos(angle) < -0.3) textAnchor = 'end';

                return (
                  <g
                    key={`label-${dim.id}`}
                    className="cursor-pointer transition-transform duration-200 select-none"
                    onMouseEnter={() => setHoveredAxis(dim.id)}
                    onMouseLeave={() => setHoveredAxis(null)}
                    onClick={() => onSelectEngine && onSelectEngine(dim.id)}
                  >
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      fill={isHovered ? '#38BDF8' : '#CBD5E1'}
                      fontSize="11"
                      fontWeight={isHovered ? 'bold' : '600'}
                      fontFamily="system-ui, sans-serif"
                      className="transition-colors duration-200"
                    >
                      {dim.shortLabel}
                    </text>
                    <text
                      x={x}
                      y={y + 13}
                      textAnchor={textAnchor}
                      fill={isHovered ? dim.color : '#94A3B8'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {dim.score}/100
                    </text>
                  </g>
                );
              })}

              {/* Center Composite Target Icon */}
              <circle cx={cx} cy={cy} r="18" fill="#111726" stroke="#334155" strokeWidth="1.5" />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fill="#38BDF8"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {report?.grade || 'A'}
              </text>
            </svg>
          </div>

          {/* Active Hover Inspection Popover */}
          <div className="h-14 mt-1 flex items-center justify-center text-center px-4 w-full">
            {hoveredAxis ? (
              (() => {
                const dim = dimensions.find(d => d.id === hoveredAxis);
                if (!dim) return null;
                const Icon = dim.icon;
                return (
                  <div className="flex items-center gap-3 rounded-xl border border-cyan-500/40 bg-primary/95 px-4 py-2 text-xs font-mono shadow-xl animate-fadeIn">
                    <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="text-left">
                      <div className="text-foreground font-bold">{dim.name}</div>
                      <div className="text-[11px] text-muted-foreground">{dim.details}</div>
                    </div>
                    <div className="h-5 w-px bg-muted mx-1" />
                    <div className="text-right">
                      <div className="text-cyan-300 font-bold">{dim.score}/100</div>
                      <div className="text-[10px] text-muted-foreground">Benchmark: {dim.benchmark}</div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-muted-foreground text-xs font-mono flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Hover any axis node to inspect engine vector and telemetry calibration.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: 8-Engine Score Matrix Breakdown (Columns 7-12) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {(['ALL', 'PERFORMANCE', 'INTELLIGENCE', 'SECURITY', 'ARCHITECTURE'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                      categoryFilter === cat
                        ? 'bg-muted text-cyan-300 font-bold border border-border'
                        : 'text-muted-foreground hover:text-muted-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
              {filteredMatrix.length} Engines
            </span>
          </div>

          {/* Matrix Rows */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
            {filteredMatrix.map((dim) => {
              const Icon = dim.icon;
              const isHovered = hoveredAxis === dim.id;

              return (
                <div
                  key={dim.id}
                  onMouseEnter={() => setHoveredAxis(dim.id)}
                  onMouseLeave={() => setHoveredAxis(null)}
                  onClick={() => onSelectEngine && onSelectEngine(dim.id)}
                  className={`group flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'border-cyan-500/50 bg-primary/90 shadow-lg shadow-cyan-500/5'
                      : 'border-border/80 bg-foreground/60 hover:border-border hover:bg-primary/50'
                  }`}
                >
                  {/* Left: Icon and Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="p-2 rounded-lg border shrink-0"
                      style={{
                        backgroundColor: `${dim.color}15`,
                        borderColor: `${dim.color}40`,
                        color: dim.color
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground truncate group-hover:text-cyan-300 transition-colors">
                          {dim.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono hidden sm:inline">
                          {dim.sdlcPhase}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {dim.details}
                      </p>
                    </div>
                  </div>

                  {/* Right: Score, Progress bar, Status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-foreground">
                        {dim.score}
                        <span className="text-muted-foreground text-[10px]">/100</span>
                      </div>
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden mt-1 border border-border">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${dim.score}%`,
                            backgroundColor: dim.color
                          }}
                        />
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      {getStatusBadge(dim.status)}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectEngine) onSelectEngine(dim.id);
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-cyan-300 hover:bg-primary-hover transition-colors"
                      title="Inspect engine telemetry card"
                      aria-label={`Inspect ${dim.name}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matrix Footer Insight */}
          <div className="flex items-center justify-between pt-2 border-t border-border/80 text-[11px] font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Full compliance &gt;= 80</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Audit advisory &lt; 70</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
