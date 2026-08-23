import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Zap, Clock, ShieldCheck, Lock, Activity, Cpu, Sparkles, Terminal } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-navy text-brand-offwhite font-mono selection:bg-brand-slate selection:text-white">
      <SEOHead
        title="Engineering Methodology & Architectural Philosophy — CatalystLab"
        description="Learn about CatalystLab, our 8-engine telemetry architecture, deterministic benchmarks, and zero-trust engineering standards."
        keywords={['CatalystLab methodology', 'web telemetry mission', '8 engine architecture', 'why choose us']}
        canonicalUrl="https://www.catalystlab.tech/about"
      />

      {/* Hero Banner */}
      <section className="border-b border-brand-slate/30 bg-brand-oxford py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-periwinkle">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-slate-light" />
            <span className="text-accent-cyan">Methodology &amp; Philosophy</span>
          </div>
          
          <div className="inline-flex items-center gap-1.5 rounded-md border border-brand-slate/40 bg-surface-panel px-2.5 py-0.5 text-xs font-bold text-accent-cyan uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-accent-cyan" />
            Engineering Standard
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-brand-offwhite font-sans">
            Deterministic Web Telemetry Architecture
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-brand-periwinkle font-sans leading-relaxed">
            Building the gold standard in multi-dimensional web health, OWASP security, DOM efficiency, and AI-agent discoverability.
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <LazyReveal direction="left" className="space-y-4 font-sans">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-brand-slate/40 bg-surface-panel text-accent-cyan text-xs font-mono font-bold uppercase tracking-wider">
              <Terminal className="h-3 w-3" />
              <span>Core Mission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-offwhite">
              Who We Are &amp; What Drives Us
            </h2>
            <p className="text-brand-periwinkle text-xs sm:text-sm leading-relaxed">
              CatalystLab is a deterministic, multi-vector developer observability and web health platform designed for modern engineering teams.
            </p>
            <p className="text-brand-periwinkle text-xs sm:text-sm leading-relaxed">
              We replace fragmented manual audit workflows with 8 parallel, autonomous Python diagnostic microagents that evaluate DOM element nesting, zero-trust HTTP security headers, WCAG 2.2 accessibility, SearchGPT vector chunking, and global edge TTFB latency.
            </p>
            <div className="pt-2">
              <Link 
                to="/master-audit" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 text-white font-mono text-xs font-bold transition-all shadow-sm group"
              >
                <span>Launch Master Audit</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </LazyReveal>

          <LazyReveal direction="right">
            <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 shadow-xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-brand-slate/30 pb-3">
                <span className="text-xs font-bold text-brand-offwhite flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent-cyan" />
                  Telemetry Benchmark Engine v4.2
                </span>
                <span className="text-[10px] text-accent-emerald bg-brand-oxford px-2 py-0.5 rounded border border-brand-slate/40">
                  Containerized Python 3.11
                </span>
              </div>
              <div className="space-y-2 text-xs text-brand-periwinkle">
                <div className="flex justify-between py-1 border-b border-brand-slate/20">
                  <span>Engine Concurrency:</span>
                  <strong className="text-brand-offwhite">8 Parallel Microagents</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-slate/20">
                  <span>Audit Duration:</span>
                  <strong className="text-accent-cyan">&lt; 4.8 Seconds Global</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-slate/20">
                  <span>Compliance Standards:</span>
                  <strong className="text-brand-offwhite">OWASP Top 10 / WCAG 2.2 / SWD</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>AI Indexing Engine:</span>
                  <strong className="text-brand-offwhite">SearchGPT / Perplexity / Gemini</strong>
                </div>
              </div>
            </div>
          </LazyReveal>
        </div>
      </section>

      {/* Vision and Mission Section */}
      <section className="py-12 bg-brand-oxford border-y border-brand-slate/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            
            <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 space-y-3">
              <h3 className="text-sm font-bold text-brand-offwhite flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-emerald" />
                Vision
              </h3>
              <p className="text-brand-periwinkle leading-relaxed text-xs font-sans">
                To build the world&apos;s most reliable and transparent autonomous telemetry grid for modern web applications, eliminating developer guesswork and ensuring enterprise websites remain lightning-fast, zero-trust secure, and AI-crawler ready.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 space-y-3">
              <h3 className="text-sm font-bold text-brand-offwhite flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-cyan" />
                Mission
              </h3>
              <p className="text-brand-periwinkle leading-relaxed text-xs font-sans">
                Empowering software engineering teams and site reliability engineers with instant, actionable, and repeatable telemetry traces across every layer of the modern web stack.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-brand-slate/40 bg-surface-panel text-accent-cyan text-xs font-mono font-bold uppercase tracking-wider">
            <Cpu className="h-3 w-3" />
            <span>Why CatalystLab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-offwhite font-sans">
            Built For High-Velocity Engineering Teams
          </h2>
          <p className="text-xs text-brand-periwinkle max-w-xl mx-auto font-sans">
            Four structural pillars that separate CatalystLab from legacy black-box page speed tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-cyan flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-offwhite font-sans">Instant Multi-Engine Execution</h3>
            <p className="text-brand-periwinkle text-xs leading-relaxed font-sans">
              Dispatch 8 microagents simultaneously without queuing delays or rate throttling.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-amber flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-offwhite font-sans">24/7 Persistent Storage</h3>
            <p className="text-brand-periwinkle text-xs leading-relaxed font-sans">
              Immutable telemetry permalinks stored in Google Cloud Firestore for historical tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-emerald flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-offwhite font-sans">OWASP Zero-Trust Headers</h3>
            <p className="text-brand-periwinkle text-xs leading-relaxed font-sans">
              Deep evaluation of HSTS, Content-Security-Policy, Permissions-Policy, and X-Frame-Options.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-cyan flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-offwhite font-sans">Privacy-First Architecture</h3>
            <p className="text-brand-periwinkle text-xs leading-relaxed font-sans">
              Non-invasive passive HTTP probes that never inject invasive trackers or third-party cookies.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default MethodologyPage;
