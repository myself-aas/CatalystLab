import { EngineInput } from "../common/EngineInput";
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import {
  ArrowRight, Terminal, Copy, Check, Zap,
  ShieldCheck, Bot, Globe, Leaf, Activity, Cpu, Search
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [heroUrl, setHeroUrl] = useState('');
  const [simulationLog, setSimulationLog] = useState<string[]>([
    'Core Web Vitals indexed: 99.4/100 (Optimal TTFB: 18ms)',
    'Verified strict CSP & HSTS transport headers (6/6 Pass)'
  ]);

  useEffect(() => {
    const logs = [
      'Latency optimized across 42 global PoPs (16.2ms avg TTFB)',
      'OWASP Transport: 6/6 strict compliance verified',
      '/llms.txt manifest parsed: 24,000 clean tokens indexed',
      'SWD Carbon model: 0.08g CO2/view (A+ Green Certified)',
      'Schema.org JSON-LD entity graph validated for AI search RAG',
      'Core Web Vitals indexed: 99.4/100 (Optimal TTFB: 18ms)'
    ];
    const interval = setInterval(() => {
      const nextLog = logs[Math.floor(Math.random() * logs.length)];
      setSimulationLog((prev) => [nextLog, prev[0] || 'AST & DNS Anycast verified']);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.startsWith('https://')) val = val.replace(/^https:\/\//, '');
    else if (val.startsWith('http://')) val = val.replace(/^http:\/\//, '');
    setHeroUrl(val);
  };

  const selectQuickSample = (url: string) => {
    setHeroUrl(url.replace(/^https?:\/\//, ''));
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

  return (
    <section className="relative overflow-hidden border-b border-brand-slate/30 bg-brand-navy pt-16 pb-12 lg:pt-20 lg:pb-16 px-4 sm:px-6 lg:px-8 text-white select-none">
      

      
      {/* Deep Central Glow for contrast focus */}

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 text-left space-y-4">
            <LazyReveal direction="up" delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-black tracking-tight leading-[1.1] text-white">
                Precision Telemetry &amp; Health Auditing.
              </h1>
              <p className="mt-3 text-base sm:text-lg text-brand-periwinkle max-w-2xl font-medium leading-relaxed">
                Run immediate multi-dimensional audits on any domain. Assess core web vitals, OWASP security, AST integrity, and semantic AI-readiness instantly.
              </p>
            </LazyReveal>

            <LazyReveal direction="up" delay={0.2}>
              <div className="mt-5">
                <EngineInput 
                  value={heroUrl}
                  onChange={setHeroUrl}
                  onSubmit={(e: React.FormEvent) => { e.preventDefault(); if (isValidUrlFormat(heroUrl)) navigate(`/launch-audit?url=${encodeURIComponent(activeDisplayTarget)}`); }}
                  buttonText="Run Audit"
                  placeholder="@catalystlab-search: (https://"
                  disabled={!isValidUrlFormat(heroUrl) && heroUrl.length > 0}
                />
                
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-mono text-brand-slate-light">
                  <span>Try:</span>
                  {['catalystlab.tech', 'stripe.com', 'github.com'].map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => selectQuickSample(domain)}
                      className="px-2.5 py-1 rounded-md bg-brand-oxford border border-brand-slate/40 hover:border-sky-400/50 hover:text-brand-periwinkle transition-colors cursor-pointer"
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            </LazyReveal>
          </div>

          {/* RIGHT COLUMN (Console UI) */}
          <div className="lg:col-span-5 relative">
            <LazyReveal direction="scale" delay={0.3}>
              <div className="relative bg-brand-oxford/95 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 shadow-2xl shadow-black/40 text-left overflow-hidden space-y-5">
                
                {/* Header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-brand-slate/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-sm font-mono text-brand-periwinkle font-bold">Live Execution Engine</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-md border border-emerald-500/40 font-bold tracking-wide">
                    SECURE ENV
                  </span>
                </div>

                {/* Target */}
                <div className="bg-brand-navy p-3.5 rounded-[16px] border border-brand-slate/40 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center text-sky-400 shrink-0">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-brand-slate-light font-mono uppercase tracking-widest">
                        Target Object
                      </div>
                      <div className="text-base font-bold text-white font-mono truncate mt-0.5">
                        {activeDisplayTarget}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-brand-navy p-3.5 rounded-[16px] border border-brand-slate/30">
                    <div className="flex items-center gap-1.5 text-sky-400 text-sm font-mono mb-1">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Edge TTFB</span>
                    </div>
                    <div className="text-lg font-black font-mono text-white tracking-tight">18ms</div>
                  </div>
                  <div className="bg-brand-navy p-3.5 rounded-[16px] border border-brand-slate/30">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-mono mb-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>OWASP</span>
                    </div>
                    <div className="text-lg font-black font-mono text-white tracking-tight">6 / 6</div>
                  </div>
                </div>

                {/* Logs */}
                <div className="bg-brand-navy p-3.5 rounded-[16px] border border-brand-slate/30 font-mono text-sm space-y-1.5 h-[80px] overflow-hidden flex flex-col justify-end">
                  {simulationLog.map((log, idx) => (
                    <div key={idx} className="text-brand-periwinkle truncate flex items-center gap-2 opacity-80">
                      <span className="text-sky-400 shrink-0">❯</span>
                      <span className="truncate">{log}</span>
                    </div>
                  ))}
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
