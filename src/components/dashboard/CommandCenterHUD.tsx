import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Server, 
  Globe, 
  Terminal, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Crosshair, 
  Sparkles, 
  Radio, 
  Layers,
  BarChart3,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useTelemetryHUDStore } from '../../store/useTelemetryHUDStore';
import { LiveCronLogStream } from './LiveCronLogStream';
import { EngineType } from '../../types';
import { ENGINES_MAP } from '../../data/engines';
import { motion, AnimatePresence } from 'motion/react';

interface SubVector {
  name: string;
  value: string;
  benchmark: string;
  status: 'optimal' | 'warning' | 'critical';
}

interface CatalystEngineData {
  id: EngineType;
  name: string;
  techTranslation: string;
  phase: string;
  primaryMetric: string;
  primaryLabel: string;
  score: number;
  route: string;
  icon: string;
  colorClass: string;
  subVectors: SubVector[];
}

const CATALYST_ENGINES: CatalystEngineData[] = [
  {
    id: 'health',
    name: 'VitalZyme',
    techTranslation: 'Core Web Vitals & Hydration Profiler',
    phase: 'Phase 4',
    primaryMetric: '840ms',
    primaryLabel: 'Largest Contentful Paint (LCP)',
    score: 98,
    route: '/health',
    icon: 'Activity',
    colorClass: 'text-[#00FF66]',
    subVectors: [
      { name: 'LCP (Largest Contentful Paint)', value: '840ms', benchmark: '< 2.5s', status: 'optimal' },
      { name: 'INP (Interaction to Next Paint)', value: '42ms', benchmark: '< 200ms', status: 'optimal' },
      { name: 'CLS (Cumulative Layout Shift)', value: '0.012', benchmark: '< 0.1', status: 'optimal' },
      { name: 'FCP (First Contentful Paint)', value: '420ms', benchmark: '< 1.8s', status: 'optimal' },
      { name: 'Total Blocking Time (TBT)', value: '65ms', benchmark: '< 200ms', status: 'optimal' },
      { name: 'Speed Index (SI)', value: '1.1s', benchmark: '< 3.4s', status: 'optimal' },
    ]
  },
  {
    id: 'latency',
    name: 'EdgeVmax',
    techTranslation: 'Global Multi-Region Edge Latency',
    phase: 'Phase 5',
    primaryMetric: '18.4ms',
    primaryLabel: 'Global Mean TTFB Across 42 PoPs',
    score: 99,
    route: '/latency',
    icon: 'Zap',
    colorClass: 'text-[#00F0FF]',
    subVectors: [
      { name: 'DNS Resolution Time', value: '3.2ms', benchmark: '< 10ms', status: 'optimal' },
      { name: 'TCP + TLS 1.3 Handshake', value: '8.4ms', benchmark: '< 25ms', status: 'optimal' },
      { name: 'Edge Cache Hit Ratio', value: '96.8%', benchmark: '> 90%', status: 'optimal' },
      { name: 'IPv6 Routing Latency', value: '14.2ms', benchmark: '< 30ms', status: 'optimal' },
      { name: 'Anycast Jitter Variation', value: '1.1ms', benchmark: '< 5ms', status: 'optimal' },
      { name: 'Cold Start Penalty', value: '28ms', benchmark: '< 50ms', status: 'optimal' },
    ]
  },
  {
    id: 'compliance',
    name: 'RiskProtease',
    techTranslation: 'OWASP & CSP Header Sandbox Compliance',
    phase: 'Phase 6',
    primaryMetric: '100/100',
    primaryLabel: 'Security Headers & Zero-Trust Score',
    score: 96,
    route: '/compliance',
    icon: 'ShieldCheck',
    colorClass: 'text-[#00FF66]',
    subVectors: [
      { name: 'Content-Security-Policy (CSP)', value: 'Enforced', benchmark: 'Strict Nonce', status: 'optimal' },
      { name: 'HSTS (Strict-Transport-Security)', value: 'max-age=63072000', benchmark: 'Preload', status: 'optimal' },
      { name: 'X-Frame-Options / Frame-Ancestors', value: 'DENY', benchmark: 'DENY', status: 'optimal' },
      { name: 'Permissions-Policy (Sensors)', value: 'Strict Zero', benchmark: 'Restricted', status: 'optimal' },
      { name: 'Cross-Origin-Opener-Policy (COOP)', value: 'same-origin', benchmark: 'same-origin', status: 'optimal' },
      { name: 'Cookie SameSite & Secure Flags', value: '100% Compliant', benchmark: 'Strict', status: 'optimal' },
    ]
  },
  {
    id: 'ai_ready',
    name: 'LLM-Kinase',
    techTranslation: 'AI Readiness & /llms.txt Parser',
    phase: 'Phase 7',
    primaryMetric: '94/100',
    primaryLabel: 'Semantic Accessibility for LLM Agents',
    score: 94,
    route: '/ai-readiness',
    icon: 'Cpu',
    colorClass: 'text-[#00F0FF]',
    subVectors: [
      { name: '/llms.txt Protocol Manifest', value: 'Present & Valid', benchmark: 'RFC draft', status: 'optimal' },
      { name: 'Semantic Markdown Extraction', value: '98.4% Clean', benchmark: '> 90%', status: 'optimal' },
      { name: 'AI Crawler User-Agent Policy', value: 'GPTBot/Perplexity OK', benchmark: 'Explicit', status: 'optimal' },
      { name: 'Schema.org JSON-LD Entities', value: '6 Types Linked', benchmark: '> 3 Types', status: 'optimal' },
      { name: 'Token Consumption Ratio', value: '1.2kb / page', benchmark: '< 4kb', status: 'optimal' },
      { name: 'API Discovery Endpoint', value: 'OpenAPI v3.1', benchmark: 'Accessible', status: 'optimal' },
    ]
  },
  {
    id: 'repo',
    name: 'GitLygase',
    techTranslation: 'Repository Hygiene & CI/CD Gatekeeper',
    phase: 'Phase 2',
    primaryMetric: '0 Failures',
    primaryLabel: 'Deterministic CI/CD Merge Blocker',
    score: 95,
    route: '/repo-scanner',
    icon: 'Layers',
    colorClass: 'text-[#00FF66]',
    subVectors: [
      { name: 'License Compliance (SPDX)', value: 'MIT / Apache-2.0', benchmark: 'No GPL Leak', status: 'optimal' },
      { name: 'Vulnerability Dependencies (CVE)', value: '0 Critical / 0 High', benchmark: '0 Vulns', status: 'optimal' },
      { name: 'Dead Code & Unused Exports', value: '< 2.1%', benchmark: '< 5%', status: 'optimal' },
      { name: 'Bundle Chunk Size Threshold', value: '142kb main bundle', benchmark: '< 200kb', status: 'optimal' },
      { name: 'Branch Protection Rules', value: 'Strict 2 Approvals', benchmark: 'Required', status: 'optimal' },
      { name: 'Automated Lockfile Hash Sync', value: 'Verified Green', benchmark: 'Bit-identical', status: 'optimal' },
    ]
  },
  {
    id: 'eco',
    name: 'EcoHolo',
    techTranslation: 'Green Web Foundation & Carbon Footprint',
    phase: 'Phase 3',
    primaryMetric: '0.12g',
    primaryLabel: 'CO2e / Pageview (Hydroelectric Edge)',
    score: 97,
    route: '/eco-audit',
    icon: 'Sparkles',
    colorClass: 'text-[#00FF66]',
    subVectors: [
      { name: 'Estimated Energy Per View', value: '0.18 mWh', benchmark: '< 0.5 mWh', status: 'optimal' },
      { name: 'Green Web Hosting Registry', value: '100% Certified', benchmark: 'Renewable', status: 'optimal' },
      { name: 'Data Transfer Over-the-wire', value: '312 KB gzip', benchmark: '< 500 KB', status: 'optimal' },
      { name: 'Dark Mode Power Saving', value: '62% Less OLED Draw', benchmark: 'Supported', status: 'optimal' },
      { name: 'Font Subsetting Efficiency', value: '88% Glyph Pruning', benchmark: '> 75%', status: 'optimal' },
      { name: 'Cache Header TTL Lifetime', value: '31536000s Immutable', benchmark: '> 1 Year', status: 'optimal' },
    ]
  },
  {
    id: 'migration',
    name: 'SynthShift',
    techTranslation: 'AST Code Synthesis & Framework Migration',
    phase: 'Phase 1',
    primaryMetric: '100%',
    primaryLabel: 'TypeScript Strict & AST Safety',
    score: 93,
    route: '/migration',
    icon: 'Sliders',
    colorClass: 'text-[#00F0FF]',
    subVectors: [
      { name: 'TypeScript Strict Mode Passing', value: '100% No Any', benchmark: 'Zero Errors', status: 'optimal' },
      { name: 'ESM / CJS Interop Cleanliness', value: 'Zero Require leaks', benchmark: 'Native ESM', status: 'optimal' },
      { name: 'CSS Purging & Unused Classes', value: '99.1% Purged', benchmark: '> 95%', status: 'optimal' },
      { name: 'Async Hydration Boundary Count', value: '8 Suspense Blocks', benchmark: 'Granular', status: 'optimal' },
      { name: 'Polyfill Overhead Footprint', value: '0 KB (Modern Baseline)', benchmark: '< 5 KB', status: 'optimal' },
      { name: 'Build Execution Latency', value: '2.4s Turbopack', benchmark: '< 5s', status: 'optimal' },
    ]
  },
  {
    id: 'llmo',
    name: 'AllosterSearch',
    techTranslation: 'Answer Engine Optimization & LLMO Indexing',
    phase: 'Phase 8',
    primaryMetric: '96/100',
    primaryLabel: 'Perplexity & SearchGPT Visibility Index',
    score: 96,
    route: '/llmo',
    icon: 'Search',
    colorClass: 'text-[#00FF66]',
    subVectors: [
      { name: 'Citation Retrieval Probability', value: '88.4%', benchmark: '> 70%', status: 'optimal' },
      { name: 'Direct Answer Extraction Score', value: '96.2%', benchmark: '> 85%', status: 'optimal' },
      { name: 'Disinformation Immunity Check', value: 'Verified Authoritative', benchmark: 'Strict', status: 'optimal' },
      { name: 'Context Window Density', value: '0.84 Tokens / Bit', benchmark: '> 0.7', status: 'optimal' },
      { name: 'JSON-LD Structured Facts', value: '24 Entities Grounded', benchmark: '> 15 Facts', status: 'optimal' },
      { name: 'AI Crawler Latency Response', value: '28ms (Streaming Ready)', benchmark: '< 50ms', status: 'optimal' },
    ]
  },
];

export const CommandCenterHUD: React.FC = () => {
  const { 
    focusEngine, 
    setFocusEngine, 
    toggleFocusEngine, 
    activeDomain, 
    setActiveDomain,
    systemLoad,
    edgePopCount,
    averageLatencyMs,
    triggerSyntheticProbe
  } = useTelemetryHUDStore();

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [domainInputValue, setDomainInputValue] = useState(activeDomain);
  const [activeTab, setActiveTab] = useState<'hud' | 'waterfall' | 'benchmark'>('hud');

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domainInputValue.trim()) {
      setActiveDomain(domainInputValue.trim().replace(/^https?:\/\//, ''));
      triggerSyntheticProbe();
    }
  };

  return (
    <div className="min-h-screen bg-[#060912] text-slate-100 font-sans selection:bg-[#06B6D4]/30 selection:text-white pb-16">
      {/* Top Telemetry Ticker */}
      <div className="w-full bg-[#080D1A] border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#06B6D4]/10 text-[#00F0FF] border border-[#06B6D4]/30 font-bold">
              <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-pulse" />
              COMMAND CENTER HUD
            </span>
            <span className="hidden sm:inline text-slate-400">
              Active Telemetry Node: <strong className="text-white">{activeDomain}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">System Load:</span>
              <span className="text-[#00FF66] font-bold">{systemLoad}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Global Edge PoPs:</span>
              <span className="text-[#00F0FF] font-bold">{edgePopCount} active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Mean Latency:</span>
              <span className="text-emerald-400 font-bold">{averageLatencyMs}ms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= COLUMN 1: CONTROLS & TARGET RADAR (3 COLS) ================= */}
          <div className="lg:col-span-3 space-y-5">
            {/* Domain Target Console */}
            <div className="bg-[#080D1A] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Crosshair className="h-3.5 w-3.5 text-[#00F0FF]" />
                  TARGET HOST
                </span>
                <span className="text-[10px] text-[#00FF66] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 font-bold">
                  PROBE READY
                </span>
              </div>

              <form onSubmit={handleDomainSubmit} className="space-y-2">
                <label className="text-[11px] text-slate-400 block font-sans">
                  Inspect URL or Edge Hostname
                </label>
                <div className="flex items-center bg-[#060912] border border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-[#06B6D4] transition-colors">
                  <span className="text-slate-500 mr-1.5">&gt;</span>
                  <input
                    type="text"
                    value={domainInputValue}
                    onChange={(e) => setDomainInputValue(e.target.value)}
                    placeholder="example.com"
                    className="w-full bg-transparent text-white focus:outline-none text-xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-[#06B6D4] text-slate-950 font-bold hover:bg-[#00F0FF] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  <span>Sync Telemetry</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 block mb-1.5 uppercase font-bold tracking-wider">
                  Quick Benchmark Targets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {['catalystlab.tech', 'github.com', 'stripe.com', 'linear.app'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDomainInputValue(d);
                        setActiveDomain(d);
                        triggerSyntheticProbe();
                      }}
                      className={`px-2 py-0.5 rounded border text-[10px] transition-colors cursor-pointer ${
                        activeDomain === d
                          ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#00F0FF] font-bold'
                          : 'bg-[#0E1526] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Focus Modes Isolator */}
            <div className="bg-[#080D1A] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#00FF66]" />
                  FOCUS MODES
                </span>
                {focusEngine && (
                  <button
                    type="button"
                    onClick={() => setFocusEngine(null)}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset (Show All)
                  </button>
                )}
              </div>

              <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                Click any catalyst engine below to isolate and illuminate its telemetry metrics across the HUD.
              </p>

              <div className="space-y-1">
                {CATALYST_ENGINES.map((engine) => {
                  const isFocused = focusEngine === engine.id;
                  return (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => toggleFocusEngine(engine.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left cursor-pointer ${
                        isFocused
                          ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-white shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold'
                          : 'bg-[#0B101D] border-slate-800/80 text-slate-300 hover:bg-[#0E1526] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`h-1.5 w-1.5 rounded-full ${isFocused ? 'bg-[#00F0FF] animate-ping' : 'bg-slate-600'}`} />
                        <span className="truncate">{engine.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                        <span className="text-slate-400">{engine.phase}</span>
                        <span className="text-[#00FF66] font-bold">[{engine.score}]</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global Edge Node Health Status */}
            <div className="bg-[#080D1A] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#00F0FF]" />
                  SYNTHETIC PROBE PoPs
                </span>
                <span className="text-[10px] text-[#00FF66]">42 / 42 ONLINE</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-[#060912] p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500">IAD • US-East</div>
                  <div className="text-white font-bold mt-0.5">12.4ms • 100%</div>
                </div>
                <div className="bg-[#060912] p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500">FRA • EU-Central</div>
                  <div className="text-white font-bold mt-0.5">14.1ms • 100%</div>
                </div>
                <div className="bg-[#060912] p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500">NRT • Tokyo</div>
                  <div className="text-white font-bold mt-0.5">18.6ms • 100%</div>
                </div>
                <div className="bg-[#060912] p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500">SJC • US-West</div>
                  <div className="text-white font-bold mt-0.5">15.2ms • 100%</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2: 8 ENZYME TELEMETRY HUD (6 COLS) ================= */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* View Mode Bar */}
            <div className="flex items-center justify-between bg-[#080D1A] border border-slate-800 rounded-2xl p-2.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-sans text-xs">Telemetry Matrix:</span>
                {focusEngine ? (
                  <span className="px-2 py-0.5 rounded bg-[#06B6D4]/10 text-[#00F0FF] border border-[#06B6D4]/30 font-bold">
                    Focus Mode: {focusEngine.toUpperCase()}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    All 8 Engines Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('hud')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'hud'
                      ? 'bg-[#06B6D4] text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('waterfall')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'waterfall'
                      ? 'bg-[#06B6D4] text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Radar
                </button>
              </div>
            </div>

            {/* Tab: HUD Telemetry Cards */}
            {activeTab === 'hud' && (
              <div className="space-y-3">
                {CATALYST_ENGINES.map((engine) => {
                  const isFocused = focusEngine === engine.id;
                  const isAnyFocused = focusEngine !== null;
                  const isDimmed = isAnyFocused && !isFocused;
                  const isExpanded = !!expandedCards[engine.id];

                  return (
                    <motion.div
                      key={engine.id}
                      layout
                      transition={{ duration: 0.2 }}
                      className={`relative rounded-2xl border transition-all overflow-hidden ${
                        isFocused
                          ? 'bg-[#0B101D] border-[#06B6D4] ring-2 ring-[#06B6D4]/50 shadow-[0_0_24px_rgba(6,182,212,0.3)] z-10'
                          : isDimmed
                          ? 'bg-[#080D1A]/50 border-slate-800/40 opacity-30 grayscale-40'
                          : 'bg-[#080D1A] border-slate-800 hover:border-slate-700 shadow-xl'
                      }`}
                    >
                      {/* Card Header Bar */}
                      <div className="p-4 flex items-center justify-between gap-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-[#060912] border border-slate-800 ${engine.colorClass}`}>
                            <Activity className="h-4 w-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-base tracking-tight">
                                {engine.name}
                              </h3>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-[#00F0FF] border border-slate-700">
                                {engine.phase}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-sans mt-0.5">
                              {engine.techTranslation}
                            </p>
                          </div>
                        </div>

                        {/* Health Score Pill */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right font-mono">
                            <div className="text-lg font-black text-white">{engine.score}</div>
                            <div className="text-[10px] text-[#00FF66] uppercase font-bold">● Healthy</div>
                          </div>
                        </div>
                      </div>

                      {/* Primary Telemetry Metric Value */}
                      <div className="p-4 bg-[#060912]/50 flex items-center justify-between gap-4 font-mono">
                        <div>
                          <div className="text-2xl font-black text-white tracking-tight">
                            {engine.primaryMetric}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-sans">
                            {engine.primaryLabel}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(engine.id)}
                            className="flex items-center gap-1 text-xs text-slate-300 hover:text-[#00F0FF] bg-[#0B101D] border border-slate-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Vectors' : '6 Sub-Vectors'}</span>
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          <Link
                            to={engine.route}
                            className="p-1.5 rounded-xl bg-[#06B6D4] text-slate-950 hover:bg-[#00F0FF] transition-colors"
                            title="Run targeted audit"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Expandable 6 Sub-Vectors Accordion */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-800 p-4 bg-[#060912] font-mono text-xs space-y-2"
                          >
                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                              Synthesized Vector Measurements (Pass threshold):
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {engine.subVectors.map((vec, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-[#0B101D] border border-slate-800/80 flex items-center justify-between gap-2">
                                  <div className="truncate">
                                    <div className="text-slate-300 truncate text-[11px]">{vec.name}</div>
                                    <div className="text-[10px] text-slate-500">Benchmark: {vec.benchmark}</div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="text-white font-bold">{vec.value}</div>
                                    <div className="text-[10px] text-[#00FF66]">● Pass</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Tab: Real-Time Multi-Region Waterfall Radar */}
            {activeTab === 'waterfall' && (
              <div className="bg-[#080D1A] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#00F0FF]" />
                    Multi-Region Latency & TTFB Distribution
                  </span>
                  <span className="text-slate-400 text-[11px]">42 PoP Aggregate</span>
                </div>

                <div className="space-y-3">
                  {[
                    { region: 'North America (IAD, SJC, ORD, DFW)', ms: 14.2, percentage: 88, status: 'Ultra-Fast' },
                    { region: 'Europe (FRA, LHR, AMS, CDG)', ms: 16.8, percentage: 82, status: 'Ultra-Fast' },
                    { region: 'Asia-Pacific (NRT, SIN, HKG, SYD)', ms: 22.4, percentage: 74, status: 'Fast' },
                    { region: 'South America (GRU, SCL)', ms: 38.1, percentage: 60, status: 'Standard' },
                  ].map((pop, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-sans">{pop.region}</span>
                        <span className="text-[#00FF66] font-bold">{pop.ms}ms</span>
                      </div>
                      <div className="w-full bg-[#060912] h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-[#06B6D4] to-[#00FF66] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                          style={{ width: `${pop.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#060912] border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
                  Edge routing dynamically proxies probes via Cloudflare, Fastly, and AWS CloudFront Anycast networks. 0-RTT TLS session resumption is active across all endpoints.
                </div>
              </div>
            )}
          </div>

          {/* ================= COLUMN 3: LIVE CRON LOG STREAM (4 COLS) ================= */}
          <div className="lg:col-span-4 sticky top-6">
            <LiveCronLogStream />
          </div>

        </div>
      </div>
    </div>
  );
};
