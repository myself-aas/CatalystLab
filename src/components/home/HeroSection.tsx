import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EngineInput } from '../common/EngineInput';
import { LazyReveal } from '../common/LazyAnimate';
import {
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Code2
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [heroUrl, setHeroUrl] = useState('');
  const [activeMonitorTab, setActiveMonitorTab] = useState<'stream' | 'pops' | 'patch'>('stream');
  
  const [simulationLog, setSimulationLog] = useState<string[]>([
    'Core Web Vitals indexed: 99.4/100',
    'Verified strict transport headers',
    '/llms.txt manifest parsed: 24k tokens'
  ]);

  useEffect(() => {
    const logs = [
      'Latency optimized across 42 global PoPs',
      'OWASP Transport: 6/6 strict compliance',
      '/llms.txt manifest parsed: 24k tokens',
      'SWD Carbon model: 0.08g CO2/view',
      'Schema.org JSON-LD graph validated',
      'Core Web Vitals indexed: 99.4/100',
      'AST Route Parser: 0 circular redirects',
      'TLS 1.3 0-RTT Handshake verified'
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
    { city: 'San Jose', region: 'US-West', ttfb: '14.2ms' },
    { city: 'Frankfurt', region: 'EU-Central', ttfb: '17.8ms' },
    { city: 'Tokyo', region: 'AP-Northeast', ttfb: '19.4ms' },
    { city: 'London', region: 'EU-West', ttfb: '15.6ms' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50/50 via-white to-white py-16 lg:py-28 border-b border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center text-left">
            <LazyReveal direction="up" delay={0.1}>
              {/* Clora-inspired Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3.5 py-1 text-xs font-mono font-medium text-zinc-800 shadow-2xs mb-6 w-fit">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>✦ NEXT-GEN TELEMETRY & AUDIT OS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-zinc-950">
                Precision Telemetry. <br className="hidden sm:block" />
                Autonomous Auditing.
              </h1>
              
              <p className="mt-6 text-base sm:text-lg text-zinc-600 max-w-xl leading-relaxed">
                Execute enterprise-grade diagnostic micro-engines on any domain. Audit Web Vitals, OWASP transport security, and LLM discoverability in under 2 seconds.
              </p>
            </LazyReveal>

            <LazyReveal direction="up" delay={0.2}>
              <div className="mt-10 max-w-xl">
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
                  placeholder="https://"
                  disabled={!isValidUrlFormat(heroUrl) && heroUrl.length > 0}
                />
                
                {/* Presets */}
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider select-none mr-1">Presets:</span>
                  {['catalystlab.tech', 'stripe.com', 'github.com', 'vercel.com'].map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => selectQuickSample(domain)}
                      aria-label={`Use ${domain} as the audit target`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/80 px-3 text-xs font-mono text-zinc-700 transition-all duration-150 hover:bg-zinc-200 hover:text-zinc-950 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{domain}</span>
                    </button>
                  ))}
                </div>
              </div>
            </LazyReveal>
          </div>

          {/* RIGHT COLUMN (Unsplash Banner + Glass Card) */}
          <div className="lg:col-span-6 xl:col-span-5 relative w-full h-[500px] lg:h-[650px] rounded-3xl overflow-hidden shadow-xl border border-zinc-200/80">
            {/* Background Image */}
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200" 
              alt="Modern architectural glass facade" 
              className="absolute inset-0 w-full h-full object-cover object-center bg-zinc-100"
              loading="eager"
            />
            {/* Overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/70 via-white/30 to-transparent mix-blend-overlay pointer-events-none" />

            <LazyReveal direction="scale" delay={0.3} className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
              <div className="liquid-glass-web-approx rounded-3xl p-5 sm:p-6 w-full max-w-sm text-left shadow-2xl border border-white/80 bg-white/90 backdrop-blur-xl">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-950/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-zinc-950 tracking-wide">
                      Live Telemetry
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-white/60 p-1 rounded-lg border border-white/40 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setActiveMonitorTab('stream')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        activeMonitorTab === 'stream'
                          ? 'bg-zinc-950 text-white shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      Stream
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMonitorTab('pops')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        activeMonitorTab === 'pops'
                          ? 'bg-zinc-950 text-white shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      PoPs
                    </button>
                  </div>
                </div>

                {/* Target */}
                <div className="mt-4 bg-white/80 p-4 rounded-2xl border border-white/60 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100/80 flex items-center justify-center text-zinc-900 border border-zinc-200/50 shrink-0">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-zinc-500 font-medium tracking-wide">
                        Target Domain
                      </div>
                      <div className="text-sm font-semibold text-zinc-950 truncate mt-0.5">
                        {activeDisplayTarget}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab 1: Stream */}
                {activeMonitorTab === 'stream' && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/80 p-3 sm:p-4 rounded-2xl border border-white/60 shadow-sm">
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium mb-1.5">
                          <Zap className="h-3.5 w-3.5" />
                          <span>TTFB</span>
                        </div>
                        <div className="text-xl font-bold text-zinc-950 font-mono tracking-tight">
                          18.4ms
                        </div>
                      </div>
                      <div className="bg-white/80 p-3 sm:p-4 rounded-2xl border border-white/60 shadow-sm">
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium mb-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>OWASP</span>
                        </div>
                        <div className="text-xl font-bold text-zinc-950 font-mono tracking-tight">
                          6 / 6
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-950/90 backdrop-blur-md p-4 rounded-2xl border border-zinc-900 font-mono text-[10px] sm:text-[11px] space-y-2 h-[100px] overflow-hidden flex flex-col justify-end shadow-inner">
                      {simulationLog.map((log, idx) => (
                        <div key={idx} className="text-zinc-300 truncate flex items-center gap-2 opacity-90">
                          <span aria-hidden="true" className="text-zinc-600 shrink-0">&gt;</span>
                          <span className="truncate">{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2: PoPs */}
                {activeMonitorTab === 'pops' && (
                  <div className="mt-4 bg-white/80 p-4 rounded-2xl border border-white/60 font-mono text-[11px] space-y-3 shadow-sm h-[200px] overflow-y-auto no-scrollbar">
                    <div className="text-zinc-400 font-semibold mb-2 flex items-center justify-between">
                      <span>Location</span>
                      <span>Latency</span>
                    </div>
                    {globalPoPs.map((pop) => (
                      <div key={pop.city} className="flex items-center justify-between py-1.5 border-b border-zinc-950/5 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-zinc-950 font-medium">{pop.city}</span>
                        </div>
                        <span className="text-zinc-600">{pop.ttfb}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Link */}
                <div className="mt-5 pt-4 flex items-center justify-between text-xs border-t border-zinc-950/10">
                  <span className="text-zinc-500 font-medium">Autonomous Agent Mesh</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/launch-audit?url=${encodeURIComponent(activeDisplayTarget)}`)}
                    className="text-zinc-950 hover:text-zinc-600 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Dossier</span>
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
