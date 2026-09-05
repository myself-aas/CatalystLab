import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
  Cpu,
  Leaf,
  ShieldCheck,
  GitBranch,
  Search,
  Globe,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { PageTransition } from '../components/common/LazyAnimate';
import { ENGINES_MAP } from '../data/engines';

import { 
  PerfWidget, 
  LatencyWidget, 
  EcoWidget, 
  SecurityWidget, 
  RepoWidget, 
  AiWidget, 
  MigrationWidget, 
  LlmoWidget 
} from '../components/hub/SimulationWidgets';


const CATEGORIES = [
  { id: 'all', label: 'All', count: 8 },
  { id: 'perf', label: 'Core Performance', count: 3 },
  { id: 'sec', label: 'Security & OWASP', count: 2 },
  { id: 'ai', label: 'AI Discoverability', count: 3 }
];

const ENGINE_DETAILS = [
  {
    id: 'health', // VitalZyme
    cat: 'perf',
    title: 'VitalZyme',
    desc: 'Deep DOM & TTFB performance analysis. Identifies render-blocking resources and layout shifts.',
    icon: Activity,
    color: '#00F298',
    status: 'Operational',
    specs: [
      { label: 'Frequency', value: 'Per-deploy / 5m pulse' },
      { label: 'CPU Impact', value: '< 1% (Passive)' },
      { label: 'Protocols', value: 'HTTP/2, HTTP/3, TLS 1.3' },
      { label: 'Standards', value: 'W3C Navigation Timing API' }
    ],
    widget: 'perf'
  },
  {
    id: 'latency', // EdgeKinase
    cat: 'perf',
    title: 'EdgeKinase',
    desc: 'Multi-region 42-PoP latency testing and edge caching validation.',
    icon: Globe,
    color: '#00D2FF',
    status: 'Operational',
    specs: [
      { label: 'Frequency', value: 'Continuous (Global PoPs)' },
      { label: 'CPU Impact', value: 'Zero (Edge-bound)' },
      { label: 'Protocols', value: 'Anycast DNS, TCP/UDP' },
      { label: 'Standards', value: 'RFC 1035, RFC 793' }
    ],
    widget: 'latency'
  },
  {
    id: 'eco', // EcoHolo
    cat: 'perf',
    title: 'EcoHolo',
    desc: 'Carbon and CO2e profiling. Measure the environmental impact of your digital footprint.',
    icon: Leaf,
    color: '#00F298',
    status: 'Beta',
    specs: [
      { label: 'Frequency', value: 'Post-render' },
      { label: 'CPU Impact', value: 'Low' },
      { label: 'Protocols', value: 'HTTP/s' },
      { label: 'Standards', value: 'Sustainable Web Manifesto' }
    ],
    widget: 'eco'
  },
  {
    id: 'compliance', // RiskProtease
    cat: 'sec',
    title: 'RiskProtease',
    desc: 'OWASP Top 10 compliance checker. Scans headers, CSPs, and common vulnerability endpoints.',
    icon: ShieldCheck,
    color: '#FF9900',
    status: 'Operational',
    specs: [
      { label: 'Frequency', value: 'Pre-flight / CI Gate' },
      { label: 'CPU Impact', value: 'Medium (Parsing)' },
      { label: 'Protocols', value: 'HTTPS, WSS' },
      { label: 'Standards', value: 'OWASP ASVS v4.0' }
    ],
    widget: 'sec'
  },
  {
    id: 'repo', // GitLygase
    cat: 'sec',
    title: 'GitLygase',
    desc: 'Repository hygiene, CI/CD pipeline health, and code structure telemetry.',
    icon: Terminal,
    color: '#FF9900',
    status: 'Operational',
    specs: [
      { label: 'Frequency', value: 'On Commit' },
      { label: 'CPU Impact', value: 'Variable' },
      { label: 'Protocols', value: 'Git, SSH' },
      { label: 'Standards', value: 'GitOps, DORA' }
    ],
    widget: 'repo'
  },
  {
    id: 'ai_ready', // LLM-Kinase
    cat: 'ai',
    title: 'LLM-Kinase',
    desc: 'Validates llms.txt readiness and AI crawler accessibility for semantic ingestion.',
    icon: Cpu,
    color: '#8A2BE2',
    status: 'Operational',
    specs: [
      { label: 'Frequency', value: 'On-demand' },
      { label: 'CPU Impact', value: 'Low' },
      { label: 'Protocols', value: 'HTTP/s' },
      { label: 'Standards', value: 'robots.txt, llms.txt' }
    ],
    widget: 'ai'
  },
  {
    id: 'llmo', // AllosterSearch
    cat: 'ai',
    title: 'AllosterSearch',
    desc: 'LLM Optimization (LLMO) and geographic SEO visibility scoring.',
    icon: Search,
    color: '#8A2BE2',
    status: 'Operational',
    specs: [
      { label: 'Frequency', value: 'Daily crawl' },
      { label: 'CPU Impact', value: 'None' },
      { label: 'Protocols', value: 'HTTPS' },
      { label: 'Standards', value: 'Schema.org JSON-LD' }
    ],
    widget: 'llmo'
  },
  {
    id: 'migration', // SynthShift
    cat: 'ai', // Mapping SynthShift to AI for 3 AI Discoverability items
    title: 'SynthShift',
    desc: 'Cross-framework migration complexity analysis and schema structure validation.',
    icon: GitBranch,
    color: '#8A2BE2',
    status: 'Operational',
    specs: [
      { label: 'Frequency', value: 'CI/CD Pipeline' },
      { label: 'CPU Impact', value: 'High' },
      { label: 'Protocols', value: 'AST Parsing' },
      { label: 'Standards', value: 'ECMAScript, JSX' }
    ],
    widget: 'migration'
  }
];

export const DiagnosticHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredEngines = ENGINE_DETAILS.filter(
    (eng) => activeTab === 'all' || eng.cat === activeTab
  );

  return (
    <PageTransition>
      <div className="min-h-[100dvh] pt-24 pb-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="framer-hero-title text-white mb-4">
              Diagnostic Hub.
            </h1>
            <p className="framer-body-text">
              The Engine Matrix. Select a specialized vector to analyze your domain's architecture, 
              security, and performance directly from the command center.
            </p>
          </div>
          
          <Link
            to="/launch-audit"
            className="group flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm sm:text-base font-semibold text-black transition-all hover:bg-neutral-200 shrink-0"
          >
            <Sparkles className="size-4" />
            Launch Master Audit
          </Link>
        </div>

        {/* Engine Filter Tabs */}
        <div className="flex overflow-x-auto scrollbar-none touch-pan-x no-scrollbar pb-4 -mb-4">
          <div className="flex items-center gap-2 p-1.5 bg-surface border border-white/10 rounded-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === cat.id ? 'text-black' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {activeTab === cat.id && (
                  <motion.div
                    layoutId="hub-active-tab"
                    className="absolute inset-0 bg-white rounded-full z-0"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat.label} ({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card Matrix */}
        <div className="flex flex-col gap-6 mt-4">
          <AnimatePresence mode="popLayout">
            {filteredEngines.map((engine, idx) => (
              <motion.div
                key={engine.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group relative bg-surface border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:border-white/25 transition-colors"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
                  style={{ background: 'var(--glow-card-subsurface)' }}
                />
                
                {/* Left Side: Specs & Info */}
                <div className="p-6 sm:p-8 flex-1 border-b md:border-b-0 md:border-r border-white/10 relative z-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-white/5 border border-white/10" style={{ color: engine.color }}>
                          <engine.icon className="size-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white tracking-tight">{engine.title}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            {engine.status === 'Operational' ? (
                              <CheckCircle2 className="size-3.5 text-emerald-400" />
                            ) : (
                              <Clock className="size-3.5 text-amber-400" />
                            )}
                            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{engine.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
                      {engine.desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {engine.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{spec.label}</span>
                        <span className="text-sm font-medium text-white">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Live Simulation Widget */}
                <div className="w-full md:w-[45%] lg:w-[40%] bg-background relative z-10 p-6 sm:p-8 flex items-center justify-center">
                  {/* Mock Widget Container */}
                  <div className="w-full h-full min-h-[220px] border border-white/5 rounded-2xl bg-surface flex flex-col items-center justify-center p-0 relative overflow-hidden group/widget">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                    
                    {engine.widget === 'perf' && <PerfWidget />}
                    {engine.widget === 'latency' && <LatencyWidget />}
                    {engine.widget === 'eco' && <EcoWidget />}
                    {engine.widget === 'sec' && <SecurityWidget />}
                    {engine.widget === 'repo' && <RepoWidget />}
                    {engine.widget === 'ai' && <AiWidget />}
                    {engine.widget === 'migration' && <MigrationWidget />}
                    {engine.widget === 'llmo' && <LlmoWidget />}
                    
                    <Link
                      to={ENGINES_MAP[engine.id]?.route || '/hub'}
                      className="absolute inset-0 z-20 focus:outline-none"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs font-medium text-white opacity-0 group-hover/widget:opacity-100 transition-opacity z-30">
                      Inspect <ArrowRight className="size-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default DiagnosticHubPage;
