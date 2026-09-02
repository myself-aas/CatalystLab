import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { WorkflowStepCard } from '../cards/marketing/WorkflowStepCard';
import { EnzymeHue } from '../cards/types';
import {
  Network,
  Cpu,
  Bot,
  FileCheck,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ArrowRight,
  Sparkles,
  Layers,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkflowStep {
  number: string;
  phaseCode: string;
  title: string;
  subtitle: string;
  executionTime: string;
  description: string;
  icon: React.ElementType;
  color: string;
  vectors: string[];
  techSnippet: string;
}

export const WorkflowSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 60%'],
  });

  // Smooth spring for the animated SVG line
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Height / stroke-dasharray animation transforms
  const lineHeight = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  const steps: WorkflowStep[] = [
    {
      number: '01',
      phaseCode: 'PHASE_DNS_ANYCAST',
      title: 'Target Ingestion & Edge DNS',
      subtitle: 'Global Edge Anycast Resolution',
      executionTime: '~140ms',
      icon: Network,
      color: '#06B6D4',
      description:
        'Resolves target domain across 42 global edge PoPs. Probes TLS 1.3 0-RTT handshakes, ALPN protocols, and HTTP/3 QUIC connection viability.',
      vectors: ['DNS TTL & CAA Records', 'TLS 1.3 0-RTT Handshake', 'HTTP/3 QUIC Support', 'Multi-Region TTFB P90'],
      techSnippet: 'GET /probe/anycast?target=domain.com&pops=42 -> 200 OK (14.2ms)',
    },
    {
      number: '02',
      phaseCode: 'PHASE_PARALLEL_TELEMETRY',
      title: '8-Engine Parallel Telemetry',
      subtitle: 'Synchronous Multi-Vector Analysis',
      executionTime: '~420ms',
      icon: Cpu,
      color: '#00F0FF',
      description:
        'Eight specialized micro-engines execute synchronously. Inspects Core Web Vitals, AST tree recursion, OWASP zero-trust headers, and carbon emissions.',
      vectors: ['VitalZyme (LCP, CLS, INP)', 'RiskProtease (OWASP 6/6)', 'EcoHolo (SWD v4 Carbon)', 'GitLygase (Branch SecOps)'],
      techSnippet: 'EXEC [VitalZyme, RiskProtease, EcoHolo, GitLygase] PARALLEL_STREAM',
    },
    {
      number: '03',
      phaseCode: 'PHASE_AI_RAG_DISCOVERY',
      title: 'AI Discoverability & /llms.txt',
      subtitle: 'Semantic Vector Extraction',
      executionTime: '~310ms',
      icon: Bot,
      color: '#A855F7',
      description:
        'Parses /llms.txt manifests, robots.txt AI bot directives, and Schema.org JSON-LD knowledge graphs to verify RAG compatibility for Claude, GPT, and Perplexity.',
      vectors: ['/llms.txt Token Manifest', 'Schema.org JSON-LD Entities', 'GPTBot / ClaudeBot Crawl Policy', 'Markdown AST Cleanliness'],
      techSnippet: 'PARSE /llms.txt -> 24.8k tokens indexable | Schema.org: 18 entities',
    },
    {
      number: '04',
      phaseCode: 'PHASE_REMEDIATION_SYNTHESIS',
      title: 'Remediation Dossier & Patches',
      subtitle: 'Autonomous Code Generation',
      executionTime: '~190ms',
      icon: FileCheck,
      color: '#00FF66',
      description:
        'Synthesizes all diagnostic telemetry into a unified composite score. Generates production-ready NGINX, Cloudflare Workers, and Next.js remediation code patches.',
      vectors: ['Composite Health Score', 'Instant NGINX/Caddy Patches', 'Cloudflare Transform Rules', 'Shareable Executive Dossier'],
      techSnippet: 'GENERATE patch.nginx.conf -> Content-Security-Policy & HSTS injected',
    },
  ];

  return (
    <section
      id="workflow-section"
      ref={containerRef}
      className="relative py-24 lg:py-32 bg-white text-slate-900 border-b border-slate-200 overflow-hidden"
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-sans font-bold text-indigo-700 shadow-sm mb-4">
              <Network className="h-3.5 w-3.5 text-indigo-600" />
              <span>SYNCHRONOUS EXECUTION PIPELINE</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
              Autonomous 4-Stage Workflow
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mt-4 font-medium leading-relaxed">
              From global edge DNS resolution to instant zero-latency remediation patches in under 1,060ms total execution time.
            </p>
          </LazyReveal>

          <div className="flex items-center gap-2 text-sm font-sans font-medium text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>TOTAL LATENCY: <strong className="text-slate-900 font-mono text-base">1.06s</strong> (P95)</span>
          </div>
        </div>

        {/* =========================================================================
            WORKFLOW PIPELINE WITH SCROLL-ANIMATED SVG CONNECTING LINES
        ========================================================================= */}
        <div className="relative">
          
          {/* Central Vertical Connecting Line on Large Screens */}
          <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 -translate-x-1/2 w-0.5 pointer-events-none">
            {/* Background Track Line */}
            <div className="w-full h-full bg-slate-200 rounded-full" />
            
            {/* Animated SVG Filling Stroke */}
            <motion.div
              style={{ height: lineHeight }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 shadow-[0_0_12px_rgba(99,102,241,0.5)] rounded-full"
            />
          </div>

          {/* Steps Grid / Timeline */}
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 1;

              return (
                <div
                  key={step.number}
                  id={`workflow-step-${step.number}`}
                  className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                >
                  {/* Left Column Content (or Right on alternate rows) */}
                  <div
                    className={`lg:col-span-5 ${
                      isEven ? 'lg:order-3' : 'lg:order-1'
                    }`}
                  >
                    <LazyReveal direction={isEven ? 'left' : 'right'} delay={idx * 0.1}>
                      {(() => {
                        const stepHues: EnzymeHue[] = ['edgevmax', 'vitalzyme', 'llmkinase', 'gitlygase'];
                        const activeHue = stepHues[idx] || 'edgevmax';
                        return (
                          <WorkflowStepCard
                            stepNumber={step.number}
                            duration={step.executionTime}
                            title={step.title}
                            description={step.description}
                            commandSnippet={step.techSnippet}
                            status="COMPLETED"
                            hue={activeHue}
                          />
                        );
                      })()}
                    </LazyReveal>
                  </div>

                  {/* Center Node Icon Marker on Large Screens */}
                  <div className="hidden lg:flex lg:col-span-2 lg:order-2 justify-center items-center relative">
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className="w-16 h-16 rounded-2xl bg-white border-2 border-indigo-500 shadow-md flex items-center justify-center relative z-10"
                    >
                      <Icon className="w-7 h-7 text-indigo-600" />
                    </motion.div>
                  </div>

                  {/* Placeholder / Visual Graphic Column on Alternate Side */}
                  <div
                    className={`lg:col-span-5 ${
                      isEven ? 'lg:order-1' : 'lg:order-3'
                    }`}
                  >
                    <LazyReveal direction={isEven ? 'right' : 'left'} delay={idx * 0.1 + 0.1}>
                      <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-sans font-bold text-slate-500 uppercase tracking-widest mb-4">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span>STAGE EXECUTION TELEMETRY</span>
                          </span>
                          <span>LATENCY BUDGET: 25%</span>
                        </div>

                        {/* Progress Bar & Telemetry Matrix */}
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(idx + 1) * 25}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                          />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-[11px]">
                          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-1">
                            <span className="text-slate-500 font-sans font-bold text-[10px] uppercase tracking-wider">DIAGNOSTIC STATUS</span>
                            <span className="font-bold text-emerald-600 text-sm">VERIFIED OK</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-1">
                            <span className="text-slate-500 font-sans font-bold text-[10px] uppercase tracking-wider">PARITY DRIFT</span>
                            <span className="font-bold text-indigo-600 text-sm">0.00% DRIFT</span>
                          </div>
                        </div>
                      </div>
                    </LazyReveal>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Pipeline Summary CTA */}
        <div className="mt-20 text-center">
          <LazyReveal direction="up" delay={0.3}>
            <Link
              to="/methodology"
              id="workflow-view-methodology-link"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-sm font-bold transition-all shadow-md active:scale-95 hover:shadow-lg"
            >
              <span>Inspect Full RFC & Engine Methodology Specification</span>
              <ArrowRight className="w-4 h-4 text-indigo-300" />
            </Link>
          </LazyReveal>
        </div>

      </div>
    </section>
  );
};

export default WorkflowSection;
