import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EngineInput } from '../common/EngineInput';
import { LazyReveal } from '../common/LazyAnimate';
import {
  Zap,
  ShieldCheck,
  Globe,
  Activity,
  Cpu,
  ArrowRight,
  Terminal,
  Layers,
  Sparkles,
  CheckCircle2,
  Code2
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [heroUrl, setHeroUrl] = useState('');
  const [activeMonitorTab, setActiveMonitorTab] = useState<'stream' | 'pops' | 'patch'>('stream');
  const [simulationLog, setSimulationLog] = useState<string[]>([
    'Core Web Vitals indexed: 99.4/100 (Optimal TTFB: 18ms)',
    'Verified strict CSP & HSTS transport headers (6/6 Pass)',
    '/llms.txt manifest parsed: 24,000 clean tokens indexed'
  ]);

  useEffect(() => {
    const logs = [
      'Latency optimized across 42 global PoPs (16.2ms avg TTFB)',
      'OWASP Transport: 6/6 strict compliance verified',
      '/llms.txt manifest parsed: 24,000 clean tokens indexed',
      'SWD Carbon model: 0.08g CO2/view (A+ Green Certified)',
      'Schema.org JSON-LD entity graph validated for AI search RAG',
      'Core Web Vitals indexed: 99.4/100 (Optimal TTFB: 18ms)',
      'AST Route Parser: 0 circular 301 redirects found',
      'TLS 1.3 0-RTT Handshake verified across Anycast DNS'
    ];
    const interval = setInterval(() => {
      const nextLog = logs[Math.floor(Math.random() * logs.length)];
      setSimulationLog((prev) => [nextLog, prev[0] || 'AST & DNS Anycast verified', prev[1] || 'Probing OWASP Transport']);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const selectQuickSample = (url: string) => {
    const clean = url.replace(/^https?:\/\//, '');
    setHeroUrl(clean);
    inputRef.current?.focus();
  };

  const isValidUrlFormat = (input: string): boolean => {
    const text = input.trim();
    if (!text) return false;
    const testUrl = text.startsWith('http://') || text.startsWith('https://') 
      ? text 
      : `https://${text}`;
    try {
      const parsed = new URL(testUrl);
      return !!parsed.hostname;
    } catch {
      return false;
    }
  };

  const activeDisplayTarget = heroUrl.trim() || 'catalystlab.tech';

  const globalPoPs = [
    { city: 'San Jose', region: 'US-West', ttfb: '14.2ms', status: 'Optimal' },
    { city: 'Frankfurt', region: 'EU-Central', ttfb: '17.8ms', status: 'Optimal' },
    { city: 'Tokyo', region: 'AP-Northeast', ttfb: '19.4ms', status: 'Optimal' },
    { city: 'London', region: 'EU-West', ttfb: '15.6ms', status: 'Optimal' },
    { city: 'Singapore', region: 'AP-Southeast', ttfb: '21.1ms', status: 'Optimal' }
  ];

  return (
    <section className="relative overflow-hidden border-b border-brand-slate/30 bg-transparent pt-16 pb-14 lg:pt-20 lg:pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Headline, copy, input, and sample badges */}
          <div className="lg:col-span-7 text-left space-y-6">
            <LazyReveal direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-surface-panel px-3.5 py-1 text-xs sm:text-sm font-mono text-brand-periwinkle mb-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
                <span className="font-semibold text-brand-offwhite">Synchronous Multi-Agent Telemetry</span>
                <span className="text-brand-slate-light hidden sm:inline">•</span>
                <span className="text-accent-cyan font-bold hidden sm:inline">42 Global PoPs</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.12] text-brand-offwhite font-sans">
                Precision Telemetry &amp; Autonomous Web Health Auditing.
              </h1>
              
              <p className="mt-3 text-base sm:text-lg text-brand-periwinkle max-w-2xl font-normal leading-relaxed font-sans">
                Execute 8 concurrent diagnostic micro-engines on any domain in under 2 seconds. Audit Core Web Vitals, OWASP transport security, AST tree depth, and <span className="text-accent-cyan font-mono">/llms.txt</span> AI search discoverability.
              </p>
            </LazyReveal>

            <LazyReveal direction="up" delay={0.2}>
              <div className="mt-2 space-y-4">
                <EngineInput 
                  value={heroUrl}
                  onChange={setHeroUrl}
                  onSubmit={(e: React.FormEvent) => { 
                    e.preventDefault(); 
                    if (isValidUrlFormat(heroUrl) || !heroUrl.trim()) {
                      navigate(`/launch-audit?url=${encodeURIComponent(activeDisplayTarget)}`); 
                    }
                  }}
                  buttonText="Run Master Audit"
                  placeholder="@catalystlab-search: (https://"
                  disabled={!isValidUrlFormat(heroUrl) && heroUrl.length > 0}
                />
                
                {/* Popular sample domain chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono">
                  <span className="text-brand-slate-light font-bold">Instant presets:</span>
                  {['catalystlab.tech', 'stripe.com', 'github.com', 'cloudflare.com', 'anthropic.com'].map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => selectQuickSample(domain)}
                      className="px-2.5 py-1 rounded-lg bg-surface-panel border border-brand-slate/40 hover:border-accent-cyan/60 hover:text-brand-offwhite text-brand-periwinkle transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                    >
                      {domain}
                    </button>
                  ))}
                </div>

                {/* Micro guarantees */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-mono text-brand-slate-light">
                  <div className="flex items-center gap-1.5 text-brand-periwinkle">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                    <span>No agent install required</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-periwinkle">
                    <Zap className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                    <span>&lt;2.0s Parallel Scan</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-periwinkle">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent-purple shrink-0" />
                    <span>OWASP ASVS v4 Validated</span>
                  </div>
                </div>
              </div>
            </LazyReveal>
          </div>

          {/* RIGHT COLUMN: Real-Time Telemetry Monitor */}
          <div className="lg:col-span-5 relative">
            <LazyReveal direction="scale" delay={0.3}>
              <div className="relative bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 sm:p-6 shadow-2xl text-left overflow-hidden space-y-4">
                
                {/* Header bar & tab selector */}
                <div className="flex items-center justify-between pb-3 border-b border-brand-slate/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
                    <span className="text-xs font-mono text-brand-periwinkle font-bold uppercase tracking-wider">
                      Live Telemetry Radar
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-brand-oxford p-1 rounded-lg border border-brand-slate/30">
                    <button
                      type="button"
                      onClick={() => setActiveMonitorTab('stream')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        activeMonitorTab === 'stream'
                          ? 'bg-brand-slate text-white'
                          : 'text-brand-slate-light hover:text-brand-offwhite'
                      }`}
                    >
                      Stream
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMonitorTab('pops')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        activeMonitorTab === 'pops'
                          ? 'bg-brand-slate text-white'
                          : 'text-brand-slate-light hover:text-brand-offwhite'
                      }`}
                    >
                      Edge PoPs
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMonitorTab('patch')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        activeMonitorTab === 'patch'
                          ? 'bg-brand-slate text-white'
                          : 'text-brand-slate-light hover:text-brand-offwhite'
                      }`}
                    >
                      Patch
                    </button>
                  </div>
                </div>

                {/* Target Host Object */}
                <div className="bg-brand-oxford p-3.5 rounded-xl border border-brand-slate/30 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-brand-slate/30 flex items-center justify-center text-accent-cyan shrink-0">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-brand-slate-light font-mono uppercase tracking-widest font-bold">
                        Target Domain Object
                      </div>
                      <div className="text-sm sm:text-base font-bold text-brand-offwhite font-mono truncate mt-0.5">
                        {activeDisplayTarget}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-accent-emerald bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/40 font-bold shrink-0">
                    LIVE PROBE
                  </span>
                </div>

                {/* Tab 1: Live Stream view */}
                {activeMonitorTab === 'stream' && (
                  <div className="space-y-3">
                    {/* Real-time Metrics Pair */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-brand-oxford p-3.5 rounded-xl border border-brand-slate/30">
                        <div className="flex items-center gap-1.5 text-accent-cyan text-xs font-mono mb-1 font-semibold">
                          <Zap className="h-3.5 w-3.5" />
                          <span>Edge TTFB</span>
                        </div>
                        <div className="text-xl font-black font-mono text-brand-offwhite tracking-tight metric-tabular">
                          18.4ms
                        </div>
                        <div className="text-[10px] font-mono text-accent-emerald mt-0.5">
                          Top 1% Global Tier
                        </div>
                      </div>
                      <div className="bg-brand-oxford p-3.5 rounded-xl border border-brand-slate/30">
                        <div className="flex items-center gap-1.5 text-accent-emerald text-xs font-mono mb-1 font-semibold">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>OWASP Headers</span>
                        </div>
                        <div className="text-xl font-black font-mono text-brand-offwhite tracking-tight metric-tabular">
                          6 / 6 Pass
                        </div>
                        <div className="text-[10px] font-mono text-accent-emerald mt-0.5">
                          Grade A+ Hardened
                        </div>
                      </div>
                    </div>

                    {/* Monospace Stream Logs */}
                    <div className="bg-brand-oxford p-3 rounded-xl border border-brand-slate/30 font-mono text-xs space-y-1.5 h-[96px] overflow-hidden flex flex-col justify-end">
                      {simulationLog.slice(0, 3).map((log, idx) => (
                        <div key={idx} className="text-brand-periwinkle truncate flex items-center gap-2 opacity-95">
                          <span className="text-accent-cyan shrink-0">❯</span>
                          <span className="truncate">{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2: Edge PoPs latency breakdown */}
                {activeMonitorTab === 'pops' && (
                  <div className="bg-brand-oxford p-3 rounded-xl border border-brand-slate/30 font-mono text-xs space-y-2">
                    <div className="text-[10px] text-brand-slate-light uppercase tracking-wider font-bold mb-1 flex items-center justify-between">
                      <span>PoP Location</span>
                      <span>TTFB Latency</span>
                    </div>
                    {globalPoPs.map((pop) => (
                      <div key={pop.city} className="flex items-center justify-between text-[11px] py-0.5 border-b border-brand-slate/20 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
                          <span className="text-brand-offwhite font-bold">{pop.city}</span>
                          <span className="text-brand-slate-light text-[10px]">({pop.region})</span>
                        </div>
                        <span className="text-accent-cyan font-bold metric-tabular">{pop.ttfb}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Remediation Patch Preview */}
                {activeMonitorTab === 'patch' && (
                  <div className="bg-brand-oxford p-3 rounded-xl border border-brand-slate/30 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-brand-slate-light uppercase tracking-wider font-bold">
                      <span className="flex items-center gap-1.5 text-accent-cyan">
                        <Code2 className="h-3.5 w-3.5" />
                        <span>nginx.conf • Strict Headers</span>
                      </span>
                      <span className="text-accent-emerald">Auto-Generated</span>
                    </div>
                    <pre className="text-[11px] text-brand-periwinkle bg-brand-navy p-2.5 rounded-lg overflow-x-auto leading-relaxed border border-brand-slate/40">
{`add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self';" always;
add_header X-Content-Type-Options "nosniff" always;`}
                    </pre>
                  </div>
                )}

                {/* Footer link to launch */}
                <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-brand-slate/30">
                  <span className="text-brand-slate-light text-[11px]">Autonomous Multi-Agent Mesh</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/launch-audit?url=${encodeURIComponent(activeDisplayTarget)}`)}
                    className="text-accent-cyan hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Diagnostic Dossier</span>
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
