import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Server, Database, Activity, Lock, Cpu, CheckCircle2, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { LazyReveal } from './LazyAnimate';
import { Link } from 'react-router-dom';

export const EnterpriseScaleChart: React.FC = () => {
  const [activePillar, setActivePillar] = useState<number>(0);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  const pillars = [
    {
      id: 'security',
      title: 'DevSecOps & OWASP Guardrails',
      subtitle: 'Phase 6 • Zero Vulnerability',
      desc: 'Enforce pre-commit AST linting, secret detection, and strict CSP directives across all branches.',
      icon: Shield,
      stats: '6 / 6 OWASP Strict',
      dialValue: '100%',
      dialLabel: 'OWASP Compliance',
      dashOffset: 10,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-950/40 border-rose-800/40'
    },
    {
      id: 'edge',
      title: 'Global Anycast Edge Latency',
      subtitle: 'Phase 5 • Sub-20ms P99 TTFB',
      desc: 'Continuous synthetic probing of TTFB, TLS 1.3 0-RTT handshakes, and HTTP/3 QUIC across 42 PoPs.',
      icon: Activity,
      stats: '18ms Global Average',
      dialValue: '18ms',
      dialLabel: 'Global Edge TTFB',
      dashOffset: 25,
      color: 'text-sky-400',
      badgeBg: 'bg-card border-sky-400/40'
    },
    {
      id: 'scale',
      title: 'High-Throughput Parallel AST',
      subtitle: 'Phase 1 • Multi-Threaded Engine',
      desc: 'Process microservice topologies and deep SPA component trees synchronously under 2 seconds.',
      icon: Cpu,
      stats: '<2,000ms End-to-End',
      dialValue: '1,840ms',
      dialLabel: 'Parallel AST Time',
      dashOffset: 45,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/40 border-amber-800/40'
    },
    {
      id: 'compliance',
      title: 'Immutable Compliance & ESG',
      subtitle: 'Phase 3 • SOC2 & SWD Carbon',
      desc: 'Permanent vector PDF dossiers with verified carbon emissions accounting under SWD v4 standard.',
      icon: Lock,
      stats: '100% Traceability',
      dialValue: '99.98%',
      dialLabel: 'Audit SLA Uptime',
      dashOffset: 15,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/40 border-emerald-800/40'
    }
  ];

  const current = pillars[activePillar];

  const triggerSimulation = () => {
    setSimulationActive(true);
    setTimeout(() => setSimulationActive(false), 1500);
  };

  return (
    <section className="py-12 lg:py-14 bg-accent text-primary-foreground relative overflow-hidden border-b border-border">
      {/* Background Glow Elements */}
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] bg-sky-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-muted rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(65,90,119,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(65,90,119,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-0.5 text-sm font-mono text-muted-foreground mb-2 shadow-[0_0_20px_rgba(65,90,119,0.2)]">
              <Server className="h-3 w-3 text-sky-400" />
              <span>Enterprise SLA & Governance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-primary-foreground">
              Scale & Compliance Engine
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mt-1 leading-relaxed">
              Multi-threaded AST engines and continuous compliance reporting for production infrastructures.
            </p>
          </LazyReveal>

          <button
            type="button"
            onClick={triggerSimulation}
            disabled={simulationActive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-foreground hover:bg-background text-sm font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Sparkles className={`h-3.5 w-3.5 text-foreground ${simulationActive ? 'animate-spin' : ''}`} />
            <span>{simulationActive ? 'Simulating SLA Load...' : 'Simulate Enterprise Load'}</span>
          </button>
        </div>

        {/* Horizontal Pillar Switcher Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {pillars.map((pillar, idx) => {
            const isActive = activePillar === idx;
            const Icon = pillar.icon;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActivePillar(idx)}
                className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-muted border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)] ring-1 ring-sky-400'
                    : 'bg-background/80 border-border hover:bg-muted/80 hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg border ${pillar.badgeBg} ${pillar.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-mono text-sky-400 font-bold">
                    {pillar.stats}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
                    {pillar.subtitle}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-primary-foreground leading-tight mt-0.5">
                    {pillar.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail & Dial Card */}
        <div className="bg-background/95 border border-border rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                  {current.subtitle}
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>SLA Guard Active</span>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-primary-foreground">
                {current.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {current.desc}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-sm font-mono">
                <Link
                  to="/launch-audit"
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-background text-foreground px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>Audit Infrastructure SLA</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-muted-foreground text-sm">
                  ✓ Verified zero-downtime integration
                </span>
              </div>
            </div>

            {/* Right Metric Dial */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 bg-background rounded-2xl border border-border">
              <div className="text-2xl sm:text-3xl font-black font-mono text-primary-foreground tracking-tight">
                {current.dialValue}
              </div>
              <div className="text-sm font-mono text-sky-400 font-semibold mt-0.5">
                {current.dialLabel}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                {simulationActive ? '⚡ 14.8k ops/sec' : '● Live Telemetry Stream'}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default EnterpriseScaleChart;
