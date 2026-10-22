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

/** The eight engines in SDLC order — names, routes and copy come from ENGINES_MAP. */
const ENGINE_ORDER = [
  'migration',
  'repo',
  'eco',
  'health',
  'latency',
  'compliance',
  'ai_ready',
  'llmo',
] as const;

type Group = 'perf' | 'sec' | 'ai';
type HubEngineId = (typeof ENGINE_ORDER)[number];

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

const ENGINE_VISUALS: Record<
  HubEngineId,
  { icon: React.ElementType; hue: string; sweep: string; widget: 'perf' | 'latency' | 'eco' | 'sec' | 'repo' | 'ai' | 'migration' | 'llmo' }
> = {
  health: { icon: Activity, hue: 'var(--hue-vitalzyme)', sweep: '5-minute pulse, per deploy', widget: 'perf' },
  latency: { icon: Globe, hue: 'var(--hue-edgevmax)', sweep: 'Continuous, 42 edge PoPs', widget: 'latency' },
  eco: { icon: Leaf, hue: 'var(--hue-ecoholo)', sweep: 'After each page render', widget: 'eco' },
  compliance: { icon: ShieldCheck, hue: 'var(--hue-riskprotease)', sweep: 'Before a release, in CI', widget: 'sec' },
  repo: { icon: Terminal, hue: 'var(--hue-gitlygase)', sweep: 'On every commit', widget: 'repo' },
  ai_ready: { icon: Cpu, hue: 'var(--hue-llmkinase)', sweep: 'On demand', widget: 'ai' },
  llmo: { icon: Search, hue: 'var(--hue-alloster)', sweep: 'Daily crawl', widget: 'llmo' },
  migration: { icon: GitBranch, hue: 'var(--hue-synthshift)', sweep: 'In the release pipeline', widget: 'migration' },
};

const WIDGETS = {
  perf: PerfWidget,
  latency: LatencyWidget,
  eco: EcoWidget,
  sec: SecurityWidget,
  repo: RepoWidget,
  ai: AiWidget,
  migration: MigrationWidget,
  llmo: LlmoWidget,
} as const;

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
 Eight engines inspect one domain at a time — performance, security, carbon, and AI
 readiness. Pick an engine to see what it measures, then run it from the audit page.
 </p>
 </div>

 <Link to="/audit" className="ds-btn ds-btn-primary h-12 shrink-0 px-6 text-sm sm:text-base">
 <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
 <span>Run all eight engines</span>
 </Link>
 </div>

 <div className="flex overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Filter engines">
 <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
 {GROUPS.map((group) => {
 const selected = activeTab === group.id;
 return (
 <button
 key={group.id}
 type="button"
 role="tab"
 aria-selected={selected}
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
 const Widget = WIDGETS[engine.widget];
 return (
 <motion.article
 key={engine.id}
 layout
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.3, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
 className="ds-card group grid gap-0 overflow-hidden md:grid-cols-[1.15fr_1fr]"
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
 <dt className="font-mono text-xs text-muted-foreground">Runs</dt>
 <dd className="text-sm text-foreground">{engine.sweep}</dd>
 </div>
 <div className="space-y-1">
 <dt className="font-mono text-xs text-muted-foreground">Lifecycle stage</dt>
 <dd className="text-sm text-foreground">{engine.focus || engine.name}</dd>
 </div>
 </dl>
 </div>

 <div className="relative flex min-h-[200px] items-center justify-center bg-background p-4">
 <div className="w-full" aria-hidden="true">
 <Widget />
 </div>
 <Link
 to={engine.route}
 className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
 >
 <span className="sr-only">Read the {engine.name} documentation</span>
 </Link>
 <span className="pointer-events-none absolute bottom-3 right-3 z-30 inline-flex items-center gap-1 text-xs font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
 Docs <ArrowRight className="size-3" aria-hidden="true" />
 </span>
 </div>
 </motion.article>
 );
 })}
 </AnimatePresence>
 </div>

 <p className="framer-body-text text-sm">
 Need a single number instead of eight? <Link to="/compare" className="text-info underline underline-offset-4">Compare two domains</Link> on the health engine, or <Link to="/api-docs" className="text-info underline underline-offset-4">call the API</Link> from your pipeline.
 </p>
 </div>
 </PageTransition>
 );
};

export default DiagnosticHubPage;
