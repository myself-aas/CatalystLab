import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Terminal, 
  Leaf, 
  ShieldCheck, 
  GitBranch, 
  Search, 
  Globe,
  ArrowRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { PageTransition } from '../components/common/LazyAnimate';
import { cn } from '../lib/utils';

interface EngineCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  to: string;
  badge?: string;
  color: string;
}

const engines: EngineCard[] = [
  {
    id: 'vitalzyme',
    title: 'VitalZyme Engine',
    description: 'Deep DOM & TTFB performance analysis. Identifies render-blocking resources and layout shifts.',
    icon: Activity,
    to: '/health',
    badge: 'Popular',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'llm-kinase',
    title: 'LLM-Kinase Engine',
    description: 'Validates llms.txt readiness and AI crawler accessibility for semantic ingestion.',
    icon: Cpu,
    to: '/ai-readiness',
    badge: 'AI Ready',
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
  },
  {
    id: 'riskprotease',
    title: 'RiskProtease Engine',
    description: 'OWASP Top 10 compliance checker. Scans headers, CSPs, and common vulnerability endpoints.',
    icon: ShieldCheck,
    to: '/compliance',
    badge: 'SecOps',
    color: 'text-red-500 bg-red-500/10 border-red-500/20'
  },
  {
    id: 'gitlygase',
    title: 'GitLygase Engine',
    description: 'Repository hygiene, CI/CD pipeline health, and code structure telemetry.',
    icon: Terminal,
    to: '/repo-scanner',
    color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
  },
  {
    id: 'ecoholo',
    title: 'EcoHolo Engine',
    description: 'Carbon and CO2e profiling. Measure the environmental impact of your digital footprint.',
    icon: Leaf,
    to: '/eco-audit',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'synthshift',
    title: 'SynthShift Engine',
    description: 'Cross-framework migration complexity analysis. Calculate costs of moving between tech stacks.',
    icon: GitBranch,
    to: '/migration',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  },
  {
    id: 'allostersearch',
    title: 'AllosterSearch Engine',
    description: 'LLM Optimization (LLMO) and geographic SEO visibility scoring.',
    icon: Search,
    to: '/llmo',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  },
  {
    id: 'edgevmax',
    title: 'EdgeVmax Engine',
    description: 'Multi-region 42-PoP latency testing and edge caching validation.',
    icon: Globe,
    to: '/latency',
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
  }
];

export const DiagnosticHubPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-[100dvh] pt-24 pb-20 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto flex flex-col gap-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Diagnostic <span className="text-primary">Hub</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              The Engine Matrix. Select a specialized vector to analyze your domain's architecture, 
              security, and performance directly from the command center.
            </p>
          </div>
          
          <Link
            to="/launch-audit"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="size-4 opacity-80" />
            Launch Master Audit
            <ArrowRight className="size-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Engine Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {engines.map((engine, i) => (
            <motion.div
              key={engine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link 
                to={engine.to}
                className="group relative flex flex-col h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className={cn(
                    "flex size-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110",
                    engine.color
                  )}>
                    <engine.icon className="size-5" />
                  </div>
                  {engine.badge && (
                    <span className="inline-flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                      {engine.badge}
                    </span>
                  )}
                </div>

                <div className="flex-1 relative z-10">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {engine.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {engine.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative z-10">
                  Launch Engine <ArrowRight className="ml-1.5 size-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default DiagnosticHubPage;
