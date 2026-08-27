import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalInput } from '../ui/TerminalInput';
import { LazyReveal } from '../common/LazyAnimate';
import { CinematicVideo } from '../media/CinematicVideo';
import { useTelemetryHUDStore } from '../../store/useTelemetryHUDStore';
import { PresetChip } from '../cards/marketing/PresetChip';
import {
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Cpu,
  Activity,
  Terminal,
  Radio,
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

const LIVE_STREAM_POOL = [
  { tag: 'VITAL', text: 'LCP Hero Paint validated in 1.12s across Chromium edge', level: 'success' as const },
  { tag: 'AI_RAG', text: 'JSON-LD Schema graph validated: 18 structured entities parsed', level: 'info' as const },
  { tag: 'ECO', text: 'SWD v4 Carbon: 0.12g CO2 per view (Green CDN verified)', level: 'success' as const },
  { tag: 'SECOPS', text: 'Strict-Transport-Security: max-age=63072000; includeSubDomains', level: 'success' as const },
  { tag: 'EDGE', text: 'Anycast routing optimized across 42 global edge PoPs', level: 'info' as const },
  { tag: 'AST', text: 'AST Tree Parser: 0 circular client redirects detected', level: 'success' as const },
  { tag: 'REPO', text: 'GitLygase: Pre-commit secret scanning policy clean', level: 'info' as const },
  { tag: 'TLS', text: 'ALPN negotiated: HTTP/3 QUIC stream connection alive', level: 'success' as const },
];

const GLOBAL_POPS: PoPNode[] = [
  { city: 'San Jose', region: 'US-West', country: 'US', ttfb: '14.2ms', status: 'optimal', ip: '198.51.100.24' },
  { city: 'Frankfurt', region: 'EU-Central', country: 'DE', ttfb: '17.8ms', status: 'optimal', ip: '198.51.100.88' },
  { city: 'Tokyo', region: 'AP-Northeast', country: 'JP', ttfb: '19.4ms', status: 'optimal', ip: '198.51.100.12' },
  { city: 'London', region: 'EU-West', country: 'GB', ttfb: '15.6ms', status: 'optimal', ip: '198.51.100.55' },
  { city: 'Singapore', region: 'AP-Southeast', country: 'SG', ttfb: '21.1ms', status: 'pass', ip: '198.51.100.91' },
  { city: 'São Paulo', region: 'SA-East', country: 'BR', ttfb: '34.5ms', status: 'pass', ip: '198.51.100.43' },
];

const PRESET_DOMAINS = ['catalystlab.tech', 'stripe.com', 'github.com', 'vercel.com'] as const;

const TAG_STYLES: Record<string, string> = {
  VITAL: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  AI_RAG: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  SECOPS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ECO: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  EDGE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  AST: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REPO: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  TLS: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [heroUrl, setHeroUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeMonitorTab, setActiveMonitorTab] = useState<'stream' | 'pops' | 'vectors'>('stream');

  const [liveMetrics, setLiveMetrics] = useState({
    ttfb: 16.4,
    owaspScore: '6/6',
    aiScore: 98,
    carbon: 0.12,
    astDepth: 14,
    globalP95: '24.8ms',
  });

  const [simulationLogs, setSimulationLogs] = useState<
    Array<{ id: string; time: string; text: string; tag: string; level: 'info' | 'success' | 'warn' }>
  >([
    { id: '1', time: '00:00:01', tag: 'DNS', text: 'TLS 1.3 0-RTT Handshake verified (14ms)', level: 'success' },
    { id: '2', time: '00:00:02', tag: 'VITAL', text: 'VitalZyme parsed DOM tree: 420 nodes depth 14', level: 'info' },
    { id: '3', time: '00:00:03', tag: 'AI_RAG', text: '/llms.txt manifest parsed: 24.8k tokens indexable', level: 'success' },
    { id: '4', time: '00:00:04', tag: 'SECOPS', text: 'OWASP Transport: 6/6 strict security headers verified', level: 'success' },
  ]);

  const { setActiveDomain } = useTelemetryHUDStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const randomItem = LIVE_STREAM_POOL[Math.floor(Math.random() * LIVE_STREAM_POOL.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '3').slice(0, 2);

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

      setLiveMetrics((prev) => ({
        ...prev,
        ttfb: Number((15 + Math.random() * 3.5).toFixed(1)),
        carbon: Number((0.11 + Math.random() * 0.03).toFixed(2)),
      }));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

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
      className="relative overflow-hidden bg-slate-50 text-slate-900 py-20 sm:py-24 lg:py-32 border-b border-slate-200 transition-colors duration-300"
    >
      {/* 1. Deep Ambient Radial Canvas Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#ffffff_0%,#f8fafc_65%,#f1f5f9_100%)] pointer-events-none z-0" />

      {/* 2. High-Contrast Cinematic Video & Datacenter Media Background Layer with Smooth Radial Mask */}
      <div className="absolute inset-0 opacity-40 sm:opacity-60 pointer-events-none z-0 overflow-hidden [-webkit-mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_40%,transparent_100%)] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_40%,transparent_100%)]">
        <img
          src="/src/assets/images/hero_ambient_background_1787838402609.jpg"
          alt="Ambient Background"
          className="w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* 3. Technical Micro-Grid Blueprint Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e140_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e140_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] sm:bg-[size:4rem_4rem] [-webkit-mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] pointer-events-none z-0" />

      {/* 4. Ambient Slate Bloom Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] lg:w-[680px] h-[340px] bg-slate-200/50 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <LazyReveal direction="up" delay={0.1}>
              {/* Telemetry OS Status Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-mono font-medium text-slate-700 shadow-sm mb-4 sm:mb-6 w-fit backdrop-blur-md">
                <span className="flex h-2 w-2 items-center justify-center relative">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75 absolute" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 relative" />
                </span>
                <span className="tracking-wider">SYNCHRONOUS TELEMETRY OS • v2.4</span>
              </div>

              {/* Primary Value Proposition Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.05] text-slate-900 [text-wrap:balance]">
                Precision Telemetry.
                <br className="hidden sm:inline" />{' '}
                <span className="text-slate-500">
                  Autonomous Auditing.
                </span>
              </h1>

              {/* Sub-headline / Description */}
              <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-xl lg:max-w-2xl font-normal leading-relaxed">
                Execute 8 synchronous diagnostic micro-engines against any production domain. Audit Core Web Vitals, OWASP zero-trust transport, and LLM RAG discoverability in under 2 seconds.
              </p>
            </LazyReveal>

            <LazyReveal direction="up" delay={0.2}>
              <div className="mt-8 sm:mt-10 max-w-2xl">
                <TerminalInput
                  value={heroUrl}
                  onChange={setHeroUrl}
                  onSubmit={(url) => handleLaunchAudit(url)}
                  placeholder="domain.com"
                  isLoading={isScanning}
                  variant="hero"
                  id="hero-telemetry-terminal-input"
                />

                {/* Preset Domain Quick Links */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-sans text-slate-500 font-medium select-none">Presets:</span>
                  {PRESET_DOMAINS.map((domain) => (
                    <PresetChip
                      key={domain}
                      domain={domain}
                      selected={heroUrl === domain}
                      onSelect={(d) => {
                        setHeroUrl(d);
                        handleLaunchAudit(d);
                      }}
                    />
                  ))}
                </div>

                {/* Telemetry Architecture Guarantees */}
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-sans font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>42 Global PoPs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>&lt; 2s Execution Latency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span>Zero Agents Required</span>
                  </div>
                </div>
              </div>
            </LazyReveal>
          </div>

          <div className="lg:col-span-5 relative w-full mt-6 lg:mt-0">
            <LazyReveal direction="scale" delay={0.3}>
              <div className="relative rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl overflow-hidden text-slate-300 flex flex-col">
                <div className="h-40 sm:h-48 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src="/src/assets/images/hero_network_visualization_1787838371820.jpg"
                    alt="Network Visualization"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  <div className="absolute bottom-4 left-5 flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-sans font-bold text-white tracking-widest shadow-sm uppercase">Global Edge Network</span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-slate-700" />
                      <span className="h-3 w-3 rounded-full bg-slate-700" />
                      <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400 ml-2 flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      <span>LIVE TELEMETRY STREAM</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                    {(['stream', 'pops', 'vectors'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveMonitorTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-colors ${
                          activeMonitorTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab === 'pops' ? 'PoPs' : tab === 'stream' ? 'Stream' : 'Vectors'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-4 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white shrink-0">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-sans font-bold text-slate-400 block uppercase tracking-wider">Active Probe Target</span>
                      <span className="text-sm font-sans font-bold text-white truncate block">{activeDisplayTarget}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                    <Activity className="h-3.5 w-3.5 animate-spin" />
                    <span>Synchronous</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {activeMonitorTab === 'stream' && (
                    <motion.div
                      key="stream"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="p-4 space-y-3.5"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'TTFB', value: `${liveMetrics.ttfb}`, unit: 'ms', icon: Zap, color: 'text-amber-400' },
                          { label: 'OWASP', value: liveMetrics.owaspScore, unit: 'Pass', icon: ShieldCheck, color: 'text-emerald-400' },
                          { label: 'LLM-RAG', value: `${liveMetrics.aiScore}`, unit: '/100', icon: Bot, color: 'text-indigo-400' },
                        ].map((metric) => {
                          const Icon = metric.icon;
                          return (
                            <div key={metric.label} className="rounded-xl border border-white/5 bg-black/20 p-3">
                              <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                                <Icon className={`h-3 w-3 ${metric.color}`} />
                                <span>{metric.label}</span>
                              </div>
                              <div className="mt-2 flex items-baseline gap-1">
                                <span className={`text-lg font-bold font-mono ${metric.color}`}>{metric.value}</span>
                                <span className="text-[10px] font-mono text-slate-500">{metric.unit}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="h-[175px] overflow-hidden rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-[11px] shadow-inner custom-scrollbar">
                        <div className="flex flex-col justify-end gap-2.5">
                          {simulationLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                              <span className="text-slate-500 text-[10px] select-none tabular-nums shrink-0">{log.time}</span>
                              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold border shrink-0 ${TAG_STYLES[log.tag] ?? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
                                {log.tag}
                              </span>
                              <span className="text-slate-300 truncate">{log.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeMonitorTab === 'pops' && (
                    <motion.div
                      key="pops"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="h-[270px] overflow-y-auto p-4 font-mono text-xs custom-scrollbar"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] text-slate-400 font-bold font-sans uppercase tracking-wider">
                        <span>Edge Node Region</span>
                        <span>Handshake TTFB</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {GLOBAL_POPS.map((pop) => (
                          <div key={pop.city} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <div>
                                <span className="font-bold font-sans text-slate-200">{pop.city}</span>
                                <span className="text-[10px] font-sans text-slate-500 ml-1.5">({pop.region})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-sans text-slate-500">{pop.ip}</span>
                              <span className="font-bold font-mono text-amber-400">{pop.ttfb}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeMonitorTab === 'vectors' && (
                    <motion.div
                      key="vectors"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="h-[270px] overflow-y-auto p-4 font-mono text-xs custom-scrollbar"
                    >
                      <div className="space-y-2">
                        {[
                          { name: 'Core Web Vitals AST', score: '99.4/100', icon: Zap },
                          { name: 'OWASP Transport Matrix', score: '6/6 Passed', icon: ShieldCheck },
                          { name: '/llms.txt AI Semantic', score: '98/100', icon: Bot },
                          { name: 'SWD v4 Carbon Budget', score: '0.12g CO2', icon: Leaf },
                          { name: 'DOM Tree Hydration', score: '420 nodes', icon: Layers },
                        ].map((vec, i) => {
                          const Icon = vec.icon;
                          return (
                            <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3">
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4 text-slate-400" />
                                <span className="font-sans font-medium text-slate-300">{vec.name}</span>
                              </div>
                              <span className="font-bold font-mono text-emerald-400">{vec.score}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between border-t border-white/5 bg-slate-900 px-4 py-3 text-xs font-mono">
                  <span className="flex items-center gap-2 text-slate-500 font-sans font-bold uppercase tracking-wider text-[10px]">
                    <Terminal className="h-3 w-3 text-slate-400" />
                    <span>8-ENGINE REEL READY</span>
                  </span>
                  <button
                    type="button"
                    id="hero-launch-full-dossier"
                    onClick={() => handleLaunchAudit(activeDisplayTarget)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 font-sans font-bold text-slate-900 transition-all hover:bg-slate-200 active:scale-[0.98]"
                  >
                    <span>Launch Dossier</span>
                    <ArrowRight className="h-3 w-3" />
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
