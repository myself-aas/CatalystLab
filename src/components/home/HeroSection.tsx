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
  VITAL: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  AI_RAG: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SECOPS: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ECO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  EDGE: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  AST: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  REPO: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  TLS: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
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
      className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,#0B1224_0%,#060911_55%,#020408_100%)] text-slate-100 py-16 lg:py-24 border-b border-slate-800"
    >
      <CinematicVideo
        assetId="hero-video"
        containerClassName="absolute inset-0 opacity-[0.12] pointer-events-none z-0"
        treatment="catalyst-grade-hero"
        overlayScrim
        overlayVignette
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[360px] bg-gradient-to-tr from-[#06B6D4]/12 via-[#00F0FF]/10 to-[#10B981]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <LazyReveal direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3.5 py-1 text-xs font-mono font-medium text-[#00F0FF] shadow-[0_0_15px_rgba(6,182,212,0.15)] mb-6 w-fit backdrop-blur-md">
                <span className="flex h-2 w-2 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-ping opacity-75" />
                  <span className="absolute h-2 w-2 rounded-full bg-[#00FF66]" />
                </span>
                <span className="tracking-wider">SYNCHRONOUS TELEMETRY OS • v2.4</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-white">
                Precision Telemetry.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#06B6D4] to-[#00FF66]">
                  Autonomous Auditing.
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Execute 8 synchronous diagnostic micro-engines against any production domain. Audit Core Web Vitals, OWASP zero-trust transport, and LLM RAG discoverability in under 2 seconds.
              </p>
            </LazyReveal>

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
                  enableGlow
                  id="hero-telemetry-terminal-input"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">Presets:</span>
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

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66]" />
                    <span>42 Global PoPs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00F0FF]" />
                    <span>&lt; 2s Execution Latency</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A855F7]" />
                    <span>Zero Agents Required</span>
                  </div>
                </div>
              </div>
            </LazyReveal>
          </div>

          <div className="lg:col-span-5 relative w-full">
            <LazyReveal direction="scale" delay={0.3}>
              <div className="relative rounded-2xl border border-slate-800 bg-[#0B101D]/95 backdrop-blur-xl shadow-[0_12px_48px_rgba(0,0,0,0.7)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#070B14] border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/80" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-300 ml-1.5 flex items-center gap-1">
                      <Radio className="h-3 w-3 text-[#00FF66] animate-pulse" />
                      <span>LIVE TELEMETRY STREAM</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
                    {(['stream', 'pops', 'vectors'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveMonitorTab(tab)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                          activeMonitorTab === tab ? 'bg-[#06B6D4] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab === 'pops' ? 'PoPs' : tab === 'stream' ? 'Stream' : 'Vectors'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#080E1C] border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#00F0FF] shrink-0">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Probe Target</span>
                      <span className="text-xs font-mono font-bold text-slate-100 truncate block">{activeDisplayTarget}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#10B981]/15 text-[#00FF66] border border-[#10B981]/30 text-[11px] font-mono font-bold">
                    <Activity className="h-3 w-3 animate-spin" />
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
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { label: 'TTFB', value: `${liveMetrics.ttfb}`, unit: 'ms', icon: Zap, color: 'text-[#00F0FF]' },
                          { label: 'OWASP', value: liveMetrics.owaspScore, unit: 'Pass', icon: ShieldCheck, color: 'text-[#00FF66]' },
                          { label: 'LLM-RAG', value: `${liveMetrics.aiScore}`, unit: '/100', icon: Bot, color: 'text-[#A855F7]' },
                        ].map((metric) => {
                          const Icon = metric.icon;
                          return (
                            <div key={metric.label} className="rounded-lg border border-slate-800 bg-[#070A12] p-2.5">
                              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                                <Icon className={`h-3 w-3 ${metric.color}`} />
                                <span>{metric.label}</span>
                              </div>
                              <div className="mt-1 flex items-baseline gap-0.5">
                                <span className={`text-base font-bold font-mono ${metric.color}`}>{metric.value}</span>
                                <span className="text-[10px] font-mono text-slate-400">{metric.unit}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="h-[175px] overflow-hidden rounded-lg border border-slate-800/90 bg-[#05080F] p-3 font-mono text-[11px] shadow-inner">
                        <div className="flex flex-col justify-end gap-2">
                          {simulationLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-slate-600 text-[10px] select-none tabular-nums shrink-0">{log.time}</span>
                              <span className={`rounded px-1 text-[9px] font-bold border shrink-0 ${TAG_STYLES[log.tag] ?? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'}`}>
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
                      className="h-[260px] overflow-y-auto p-4 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[10px] text-slate-400 font-semibold uppercase">
                        <span>Edge Node Region</span>
                        <span>Handshake TTFB</span>
                      </div>
                      <div className="mt-2 space-y-2">
                        {GLOBAL_POPS.map((pop) => (
                          <div key={pop.city} className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-[#070A12] p-2">
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] animate-pulse" />
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
                    </motion.div>
                  )}

                  {activeMonitorTab === 'vectors' && (
                    <motion.div
                      key="vectors"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="h-[260px] overflow-y-auto p-4 font-mono text-xs"
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
                            <div key={i} className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-[#070A12] p-2">
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-[#06B6D4]" />
                                <span className="text-slate-200">{vec.name}</span>
                              </div>
                              <span className="font-bold text-[#00FF66]">{vec.score}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between border-t border-slate-800 bg-[#070B14] px-3 py-2.5 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Terminal className="h-3 w-3 text-[#06B6D4]" />
                    <span>8-ENGINE REEL READY</span>
                  </span>
                  <button
                    type="button"
                    id="hero-launch-full-dossier"
                    onClick={() => handleLaunchAudit(activeDisplayTarget)}
                    className="inline-flex items-center gap-1.5 rounded bg-[#06B6D4]/15 px-3 py-1.5 font-bold text-[#00F0FF] transition-all hover:bg-[#06B6D4]/25 active:scale-[0.98]"
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
