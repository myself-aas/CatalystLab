import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Activity,
  Cpu,
  Leaf,
  ShieldCheck,
  GitBranch,
  Search,
  Globe,
  Terminal,
  Check,
} from 'lucide-react';
import { PageTransition } from '../components/common/LazyAnimate';
import { ENGINES_MAP, ENGINE_ORDER, type EngineId } from '../data/engines';


type Group = 'perf' | 'sec' | 'ai';
type HubEngineId = EngineId;

const GROUPS: Array<{ id: 'all' | Group; label: string }> = [
  { id: 'all', label: 'All engines' },
  { id: 'perf', label: 'Performance' },
  { id: 'sec', label: 'Security & repository' },
  { id: 'ai', label: 'AI discoverability' },
];

const GROUP_OF: Record<HubEngineId, Group> = {
  health: 'perf',
  latency: 'perf',
  eco: 'perf',
  compliance: 'sec',
  repo: 'sec',
  ai_ready: 'ai',
  llmo: 'ai',
  migration: 'ai',
};

const ENGINE_VISUALS: Record<HubEngineId, { icon: React.ElementType; hue: string }> = {
  health: { icon: Activity, hue: 'var(--hue-vitalzyme)' },
  latency: { icon: Globe, hue: 'var(--hue-edgevmax)' },
  eco: { icon: Leaf, hue: 'var(--hue-ecoholo)' },
  compliance: { icon: ShieldCheck, hue: 'var(--hue-riskprotease)' },
  repo: { icon: Terminal, hue: 'var(--hue-gitlygase)' },
  ai_ready: { icon: Cpu, hue: 'var(--hue-llmkinase)' },
  llmo: { icon: Search, hue: 'var(--hue-alloster)' },
  migration: { icon: GitBranch, hue: 'var(--hue-synthshift)' },
};

export const DiagnosticHubPage: React.FC = () => {
 const [activeTab, setActiveTab] = useState<'all' | Group>('all');

 const engines = ENGINE_ORDER.map((id) => {
   const meta = ENGINES_MAP[id];
   const visual = ENGINE_VISUALS[id];
   return {
     id,
     name: meta.catalystName || meta.name,
     description: meta.description,
     route: meta.route,
     focus: meta.lifecycleFocus,
     measures: (meta.keyVectors ?? []).slice(0, 4),
     group: GROUP_OF[id],
     ...visual,
   };
 });

 const filteredEngines = engines.filter(
  (engine) => activeTab === 'all' || engine.group === activeTab
 );

 const countFor = (group: 'all' | Group) =>
  group === 'all' ? engines.length : engines.filter((e) => e.group === group).length;

 return (
 <PageTransition>
 <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 ds-page-top-hero px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
 <div className="max-w-2xl space-y-3">
 <h1 className="framer-hero-title text-foreground">
 Diagnostic engines.
 </h1>
 <p className="framer-body-text">
 Eight engines inspect one domain at a time: performance, security, carbon, and AI
 readiness. Each card lists what that engine measures; a master audit runs all eight.
 </p>
 </div>

 <Link to="/audit" className="ds-btn ds-btn-primary h-12 shrink-0 px-6 text-sm sm:text-base">
 <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
 <span>Run a master audit</span>
 </Link>
 </div>

 <div className="no-scrollbar flex overflow-x-auto pb-1" role="group" aria-label="Filter engines by area">
 <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
 {GROUPS.map((group) => {
 const selected = activeTab === group.id;
 return (
 <button
 key={group.id}
 type="button"
 aria-pressed={selected}
 onClick={() => setActiveTab(group.id)}
 className={`relative min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
 selected ? 'text-background' : 'text-muted-foreground hover:text-foreground'
 }`}
 >
 {selected && (
 <motion.span
 layoutId="hub-active-tab"
 className="absolute inset-0 z-0 rounded-full bg-foreground"
 transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
 />
 )}
 <span className="relative z-10 whitespace-nowrap">
 {group.label}
 <span className="ml-2 font-mono text-xs opacity-70">{countFor(group.id)}</span>
 </span>
 </button>
 );
 })}
 </div>
 </div>

 <div className="flex flex-col gap-4">
 <AnimatePresence initial={false} mode="popLayout">
 {filteredEngines.map((engine, idx) => {
 const Icon = engine.icon;
 return (
 <motion.article
 key={engine.id}
 layout
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.3, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
 className="ds-card grid gap-0 overflow-hidden md:grid-cols-[1.15fr_1fr]"
 style={{ ['--engine-hue' as string]: engine.hue }}
 >
 <div className="flex flex-col justify-between gap-6 border-b border-border p-6 sm:p-8 md:border-b-0 md:border-r">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <span
 aria-hidden="true"
 className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border"
 style={{ color: `hsl(${engine.hue} / 0.95)`, background: `hsl(${engine.hue} / 0.08)` }}
 >
 <Icon className="size-5" />
 </span>
 <h2 className="framer-card-title text-foreground">{engine.name}</h2>
 </div>

 <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
 {engine.description}
 </p>
 </div>

 <dl className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-1">
 <dt className="font-mono text-xs text-muted-foreground">Area</dt>
 <dd className="text-sm text-foreground">
 {GROUPS.find((group) => group.id === engine.group)?.label ?? engine.group}
 </dd>
 </div>
 <div className="space-y-1">
 <dt className="font-mono text-xs text-muted-foreground">Lifecycle stage</dt>
 <dd className="text-sm text-foreground">{engine.focus || engine.name}</dd>
 </div>
 </dl>
 </div>

 <div className="relative flex flex-col justify-between gap-6 bg-background p-6 sm:p-8">
 {engine.measures.length > 0 ? (
 <div className="space-y-3">
 <h3 className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
 Measures
 </h3>
 <ul className="space-y-2">
 {engine.measures.map((item) => (
 <li key={item} className="flex gap-2 text-sm text-foreground">
 <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">
 {engine.focus || engine.name}
 </p>
 )}

 <Link
 to={engine.route}
 className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
 >
 <span>Read the {engine.name} documentation</span>
 <ArrowRight className="size-4" aria-hidden="true" />
 </Link>
 </div>
 </motion.article>
 );
 })}
 </AnimatePresence>
 </div>

 <p className="framer-body-text text-sm">
 Checking one domain against another? <Link to="/compare" className="text-info underline underline-offset-4">Compare two domains</Link> on the health score, or <Link to="/api-docs" className="text-info underline underline-offset-4">call the API</Link> from a pipeline.
 </p>
 </div>
 </PageTransition>
 );
};

export default DiagnosticHubPage;
