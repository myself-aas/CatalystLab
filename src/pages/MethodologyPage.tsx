import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Zap, Clock, ShieldCheck, Lock, Activity, Cpu, Sparkles, Terminal } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';
import { ScanRevealFigure } from '../components/media/ScanRevealFigure';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent font-mono text-[#EDEDEF]">
      <SEOHead
        title="Engineering Methodology & Architectural Philosophy — CatalystLab"
        description="Learn about CatalystLab, our 8-engine telemetry architecture, deterministic benchmarks, and zero-trust engineering standards."
        keywords={['CatalystLab methodology', 'web telemetry mission', '8 engine architecture', 'why choose us']}
        canonicalUrl="https://www.catalystlab.tech/about"
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border bg-muted py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--app-card)_0%,var(--app-background)_65%,var(--app-muted)_100%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground">Methodology &amp; Philosophy</span>
          </div>
          
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 backdrop-blur-md px-3.5 py-1 text-xs font-mono font-bold text-foreground uppercase tracking-wider shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Deterministic Engineering Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-sans leading-[1.08]">
            Deterministic Web Telemetry{' '}
            <span className="bg-gradient-to-r from-[#5E6AD2] via-[#6872D9] to-[#38bdf8] bg-clip-text text-transparent">
              Architecture
            </span>
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-muted-foreground font-sans font-normal leading-relaxed">
            Building the gold standard in multi-dimensional web health, OWASP security, DOM efficiency, and AI-agent discoverability.
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <LazyReveal direction="left" className="space-y-4 font-sans">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-border bg-background text-foreground text-xs font-mono font-bold uppercase tracking-wider">
              <Terminal className="h-3 w-3" />
              <span>Core Mission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Who We Are &amp; What Drives Us
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              CatalystLab is a deterministic, multi-vector developer observability and web health platform designed for modern engineering teams.
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              We replace fragmented manual audit workflows with 8 parallel, autonomous Python diagnostic microagents that evaluate DOM element nesting, zero-trust HTTP security headers, WCAG 2.2 accessibility, SearchGPT vector chunking, and global edge TTFB latency.
            </p>
            <div className="pt-2">
              <Link 
                to="/master-audit" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover border border-border text-primary-foreground font-mono text-xs font-bold transition-all shadow-sm group"
              >
                <span>Launch Master Audit</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </LazyReveal>

          <LazyReveal direction="right">
            <div className="rounded-2xl border border-border bg-background p-6 shadow-xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-foreground" />
                  Telemetry Benchmark Engine v4.2
                </span>
                <span className="text-[10px] text-emerald-500 bg-accent px-2 py-0.5 rounded border border-border">
                  Containerized Python 3.11
                </span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Engine Concurrency:</span>
                  <strong className="text-foreground">8 Parallel Microagents</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Audit Duration:</span>
                  <strong className="text-foreground">&lt; 4.8 Seconds Global</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Compliance Standards:</span>
                  <strong className="text-foreground">OWASP Top 10 / WCAG 2.2 / SWD</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>AI Indexing Engine:</span>
                  <strong className="text-foreground">SearchGPT / Perplexity / Gemini</strong>
                </div>
              </div>
            </div>
          </LazyReveal>
        </div>
      </section>

      {/* Vision and Mission Section */}
      <section className="py-12 bg-muted border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            
            <div className="rounded-2xl border border-border bg-background p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-sans">
                To build the world&apos;s most reliable and transparent autonomous telemetry grid for modern web applications, eliminating developer guesswork and ensuring enterprise websites remain lightning-fast, zero-trust secure, and AI-crawler ready.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-sans">
                Empowering software engineering teams and site reliability engineers with instant, actionable, and repeatable telemetry traces across every layer of the modern web stack.
              </p>
            </div>

          </div>

          <div className="mt-12">
            <ScanRevealFigure
              assetId="about-engineering-team"
              caption="CatalystLab Edge Infrastructure Engineering Team Collaborating"
              aspectRatio="21/9"
              className="rounded-2xl shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-border bg-background text-foreground text-xs font-mono font-bold uppercase tracking-wider">
            <Cpu className="h-3 w-3" />
            <span>Why CatalystLab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">
            Built For High-Velocity Engineering Teams
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto font-sans">
            Four structural pillars that separate CatalystLab from legacy black-box page speed tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-background p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-muted border border-border text-foreground flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground font-sans">Instant Multi-Engine Execution</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-sans">
              Dispatch 8 microagents simultaneously without queuing delays or rate throttling.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-muted border border-border text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground font-sans">24/7 Persistent Storage</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-sans">
              Immutable telemetry permalinks stored in Google Cloud Firestore for historical tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-muted border border-border text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground font-sans">OWASP Zero-Trust Headers</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-sans">
              Deep evaluation of HSTS, Content-Security-Policy, Permissions-Policy, and X-Frame-Options.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-muted border border-border text-foreground flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground font-sans">Privacy-First Architecture</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-sans">
              Non-invasive passive HTTP probes that never inject invasive trackers or third-party cookies.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default MethodologyPage;
