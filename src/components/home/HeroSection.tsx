import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalInput } from '../ui/TerminalInput';
import { LazyReveal } from '../common/LazyAnimate';
import { CinematicMedia } from '../media/CinematicMedia';
import { useTelemetryHUDStore } from '../../store/useTelemetryHUDStore';
import {
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Cpu,
  Activity,
  Terminal,
  Radio,
  Sparkles,
  Bot,
  Leaf,
  Layers,
  ChevronRight,
  Play,
  RotateCcw,
} from 'lucide-react';

interface PoPNode {
  city: string;
  region: string;
  country: string;
  ttfb: string;
  status: 'optimal' | 'pass' | 'warn';
  ip: string;
}

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [heroUrl, setHeroUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeMonitorTab, setActiveMonitorTab] = useState<'stream' | 'pops' | 'vectors'>('stream');

  // Simulated live telemetry metrics
  const [liveMetrics, setLiveMetrics] = useState({
    ttfb: 16.4,
    owaspScore: '6/6',
    aiScore: 98,
    carbon: 0.12,
    astDepth: 14,
    globalP95: '24.8ms',
  });

  const [simulationLogs, setSimulationLogs] = useState<Array<{ id: string; time: string; text: string; tag: string; level: 'info' | 'success' | 'warn' }>>([
    { id: '1', time: '00:00:01', tag: 'DNS', text: 'TLS 1.3 0-RTT Handshake verified (14ms)', level: 'success' },
    { id: '2', time: '00:00:02', tag: 'VITAL', text: 'VitalZyme parsed DOM tree: 420 nodes depth 14', level: 'info' },
    { id: '3', time: '00:00:03', tag: 'AI_RAG', text: '/llms.txt manifest parsed: 24.8k tokens indexable', level: 'success' },
    { id: '4', time: '00:00:04', tag: 'SECOPS', text: 'OWASP Transport: 6/6 strict security headers verified', level: 'success' },
  ]);

  const globalPoPs: PoPNode[] = [
    { city: 'San Jose', region: 'US-West', country: 'US', ttfb: '14.2ms', status: 'optimal', ip: '198.51.100.24' },
    { city: 'Frankfurt', region: 'EU-Central', country: 'DE', ttfb: '17.8ms', status: 'optimal', ip: '198.51.100.88' },
    { city: 'Tokyo', region: 'AP-Northeast', country: 'JP', ttfb: '19.4ms', status: 'optimal', ip: '198.51.100.12' },
    { city: 'London', region: 'EU-West', country: 'GB', ttfb: '15.6ms', status: 'optimal', ip: '198.51.100.55' },
    { city: 'Singapore', region: 'AP-Southeast', country: 'SG', ttfb: '21.1ms', status: 'pass', ip: '198.51.100.91' },
    { city: 'São Paulo', region: 'SA-East', country: 'BR', ttfb: '34.5ms', status: 'pass', ip: '198.51.100.43' },
  ];

  // Dynamic telemetry log generator loop
  useEffect(() => {
    const streamPool = [
      { tag: 'VITAL', text: 'LCP Hero Paint validated in 1.12s across Chromium edge', level: 'success' as const },
      { tag: 'AI_RAG', text: 'JSON-LD Schema graph validated: 18 structured entities parsed', level: 'info' as const },
      { tag: 'ECO', text: 'SWD v4 Carbon: 0.12g CO2 per view (Green CDN verified)', level: 'success' as const },
      { tag: 'SECOPS', text: 'Strict-Transport-Security: max-age=63072000; includeSubDomains', level: 'success' as const },
      { tag: 'EDGE', text: 'Anycast routing optimized across 42 global edge PoPs', level: 'info' as const },
      { tag: 'AST', text: 'AST Tree Parser: 0 circular client redirects detected', level: 'success' as const },
      { tag: 'REPO', text: 'GitLygase: Pre-commit secret scanning policy clean', level: 'info' as const },
      { tag: 'TLS', text: 'ALPN negotiated: HTTP/3 QUIC stream connection alive', level: 'success' as const },
    ];

    const interval = setInterval(() => {
      const randomItem = streamPool[Math.floor(Math.random() * streamPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);

      setSimulationLogs((prev) => [
        {
          id: String(Date.now()),
          time: timeStr,
          tag: randomItem.tag,
          text: randomItem.text,
          level: randomItem.level,
        },
        ...prev.slice(0, 5),
      ]);

      // Minor jitter on live metrics for organic feel
      setLiveMetrics((prev) => ({
        ...prev,
        ttfb: Number((15 + Math.random() * 3.5).toFixed(1)),
        carbon: Number((0.11 + Math.random() * 0.03).toFixed(2)),
      }));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const { setActiveDomain } = useTelemetryHUDStore();

  const handleLaunchAudit = (targetUrl: string) => {
    setIsScanning(true);
    const domain = targetUrl.trim() || 'catalystlab.tech';
    const cleanDomain = domain.replace(/^https?:\/\//, '');
    setActiveDomain(cleanDomain);

    setTimeout(() => {
      navigate(`/launch-audit?url=${encodeURIComponent(cleanDomain)}`);
    }, 450);
  };

  const activeDisplayTarget = heroUrl.trim() || 'catalystlab.tech';

  return (
    <section
      id="hero-section"
      className="relative overflow-hidden bg-gradient-to-b from-[#060911] via-[#080D1A] to-[#0B101D] text-slate-100 py-16 lg:py-24 border-b border-slate-800"
    >
      {/* Catalyst-Grade Cinematic Media Background */}
      <CinematicMedia 
        assetId="hero-datacenter-bg" 
        mode="ken-burns" 
        containerClassName="absolute inset-0 opacity-[0.14] pointer-events-none z-0" 
      />

      {/* Background Decorative Tech Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#06B6D4]/15 via-[#00F0FF]/10 to-[#10B981]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Strategic Positioning & Terminal Input */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <LazyReveal direction="up" delay={0.1}>
              {/* Cyberpunk Terminal Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3.5 py-1 text-xs font-mono font-medium text-[#00F0FF] shadow-[0_0_15px_rgba(6,182,212,0.15)] mb-6 w-fit backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-[#00FF66] animate-pulse" />
                <span className="tracking-wider">SYNCHRONOUS TELEMETRY OS • v2.4</span>
              </div>

              {/* High-Impact Hero Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.04] text-white">
                Precision Telemetry. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#06B6D4] to-[#00FF66]">
                  Autonomous Auditing.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Execute 8 synchronous diagnostic micro-engines against any production domain. Audit Core Web Vitals, OWASP zero-trust transport, and LLM RAG discoverability in under 2 seconds.
              </p>
            </LazyReveal>

            {/* Interactive Terminal Domain Input */}
            <LazyReveal direction="up" delay={0.2}>
              <div className="mt-8 max-w-2xl">
                <TerminalInput
                  value={heroUrl}
                  onChange={setHeroUrl}
                  onSubmit={(url) => handleLaunchAudit(url)}
                  placeholder="domain.com"
                  buttonText="Execute Audit"
                  loadingText="DISPATCHING ENGINES..."
                  isLoading={isScanning}
                  presetDomains={['catalystlab.tech', 'stripe.com', 'github.com', 'vercel.com']}
                  enableGlow={true}
                  id="hero-telemetry-terminal-input"
                />

                {/* Sub-Banner Micro Specs */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                    <span>42 Global PoPs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                    <span>&lt; 2s Execution Latency</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                    <span>Zero Agents Required</span>
                  </div>
                </div>
              </div>
            </LazyReveal>
          </div>

          {/* RIGHT COLUMN: Live Telemetry HUD Console */}
          <div className="lg:col-span-5 relative w-full">
            <LazyReveal direction="scale" delay={0.3}>
              <div className="relative rounded-2xl border border-slate-800 bg-[#0B101D]/95 backdrop-blur-xl shadow-[0_12px_48px_rgba(0,0,0,0.7)] overflow-hidden">
                
                {/* Console Top Chrome */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#070B14] border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-300 ml-1.5 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-[#00FF66] animate-pulse" />
                      <span>LIVE TELEMETRY STREAM</span>
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      id="hero-tab-stream"
                      onClick={() => setActiveMonitorTab('stream')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                        activeMonitorTab === 'stream'
                          ? 'bg-[#06B6D4] text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Stream
                    </button>
                    <button
                      type="button"
                      id="hero-tab-pops"
                      onClick={() => setActiveMonitorTab('pops')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                        activeMonitorTab === 'pops'
                          ? 'bg-[#06B6D4] text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      PoPs
                    </button>
                    <button
                      type="button"
                      id="hero-tab-vectors"
                      onClick={() => setActiveMonitorTab('vectors')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                        activeMonitorTab === 'vectors'
                          ? 'bg-[#06B6D4] text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Vectors
                    </button>
                  </div>
                </div>

                {/* Target Domain Bar */}
                <div className="px-4 py-3 bg-[#080E1C] border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#00F0FF] shrink-0">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        ACTIVE PROBE TARGET
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-100 truncate block">
                        {activeDisplayTarget}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#10B981]/15 text-[#00FF66] border border-[#10B981]/30 text-[11px] font-mono font-bold">
                    <Activity className="w-3 h-3 animate-spin" />
                    <span>SYNCHRONOUS</span>
                  </div>
                </div>

                {/* TAB 1: Live Stream */}
                {activeMonitorTab === 'stream' && (
                  <div className="p-4 space-y-3.5">
                    {/* 3 Metric Mini Cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-lg bg-[#070A12] border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <Zap className="w-3 h-3 text-[#00F0FF]" />
                          <span>TTFB</span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-0.5">
                          <span className="text-base font-bold font-mono text-[#00F0FF]">
                            {liveMetrics.ttfb}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">ms</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#070A12] border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <ShieldCheck className="w-3 h-3 text-[#00FF66]" />
                          <span>OWASP</span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-0.5">
                          <span className="text-base font-bold font-mono text-[#00FF66]">
                            {liveMetrics.owaspScore}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Pass</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#070A12] border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <Bot className="w-3 h-3 text-[#A855F7]" />
                          <span>LLM-RAG</span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-0.5">
                          <span className="text-base font-bold font-mono text-[#A855F7]">
                            {liveMetrics.aiScore}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Simulated Stream Log Box */}
                    <div className="rounded-lg bg-[#05080F] border border-slate-800/90 p-3 font-mono text-[11px] space-y-2 h-[175px] overflow-hidden flex flex-col justify-end shadow-inner">
                      {simulationLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-slate-600 text-[10px] select-none tabular-nums shrink-0">
                            {log.time}
                          </span>
                          <span
                            className={`px-1 rounded text-[9px] font-bold border shrink-0 ${
                              log.tag === 'VITAL'
                                ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                                : log.tag === 'AI_RAG'
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                : log.tag === 'SECOPS'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            }`}
                          >
                            {log.tag}
                          </span>
                          <span className="text-slate-300 truncate">{log.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: Global PoPs List */}
                {activeMonitorTab === 'pops' && (
                  <div className="p-4 space-y-2.5 h-[260px] overflow-y-auto font-mono text-xs">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between pb-1 border-b border-slate-800">
                      <span>Edge Node Region</span>
                      <span>Handshake TTFB</span>
                    </div>

                    {globalPoPs.map((pop) => (
                      <div
                        key={pop.city}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#070A12] border border-slate-800/70"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                          <div>
                            <span className="font-bold text-slate-200">{pop.city}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5">({pop.region})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{pop.ip}</span>
                          <span className="font-bold text-[#00F0FF]">{pop.ttfb}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: Diagnostic Vectors */}
                {activeMonitorTab === 'vectors' && (
                  <div className="p-4 space-y-2 h-[260px] overflow-y-auto font-mono text-xs">
                    {[
                      { name: 'Core Web Vitals AST', score: '99.4/100', icon: Zap, status: 'Optimal' },
                      { name: 'OWASP Transport Matrix', score: '6/6 Passed', icon: ShieldCheck, status: 'Optimal' },
                      { name: '/llms.txt AI Semantic', score: '98/100', icon: Bot, status: 'Optimal' },
                      { name: 'SWD v4 Carbon Budget', score: '0.12g CO2', icon: Leaf, status: 'Optimal' },
                      { name: 'DOM Tree Hydration', score: '420 nodes', icon: Layers, status: 'Optimal' },
                    ].map((vec, i) => {
                      const Icon = vec.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#070A12] border border-slate-800/70"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#06B6D4]" />
                            <span className="text-slate-200">{vec.name}</span>
                          </div>
                          <span className="font-bold text-[#00FF66]">{vec.score}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bottom Footer Launch Bar */}
                <div className="p-3 bg-[#070B14] border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-[#06B6D4]" />
                    <span>8-ENGINE REEL READY</span>
                  </span>
                  <button
                    type="button"
                    id="hero-launch-full-dossier"
                    onClick={() => handleLaunchAudit(activeDisplayTarget)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#00F0FF] border border-[#06B6D4]/40 font-bold transition-all"
                  >
                    <span>Launch Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </LazyReveal>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
