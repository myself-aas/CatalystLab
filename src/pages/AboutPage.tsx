import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
 Sparkles, 
 ShieldCheck, 
 Zap, 
 Terminal, 
 Cpu, 
 Globe, 
 Layers, 
 Activity, 
 CheckCircle2, 
 ArrowRight, 
 Lock, 
 Server, 
 Eye, 
 FileCode, 
 Leaf, 
 Bot, 
 Users, 
 Award,
 ChevronRight,
 Database
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal } from '../components/common/LazyAnimate';
import { LinearCard } from '../components/ui/LinearCard';
import { ScanRevealFigure } from '../components/media/ScanRevealFigure';

interface EngineDetail {
 id: string;
 name: string;
 category: string;
 icon: React.ElementType;
 color: string;
 summary: string;
 metrics: string[];
}

const ENGINES_CATALOG: EngineDetail[] = [
 {
 id: 'dom',
 name: 'DOM Structure & Hydration Engine',
 category: 'Architecture',
 icon: Layers,
 color: '#5E6AD2',
 summary: 'Traverses the rendered DOM tree to calculate maximum nesting depth, total node count, and client-side hydration risks in modern SPA/SSR frameworks.',
 metrics: ['Max Tree Depth', 'Total Node Density', 'Hydration Mismatch Risk', 'Repaint Cost Index']
 },
 {
 id: 'security',
 name: 'OWASP Zero-Trust Security Engine',
 category: 'SecOps',
 icon: ShieldCheck,
 color: '#10B981',
 summary: 'Audits edge HTTP response headers against OWASP Top 10 compliance, enforcing strict transport security, script sandboxing, and framing policies.',
 metrics: ['Strict-Transport-Security (HSTS)', 'Content-Security-Policy (CSP)', 'X-Frame-Options (XFO)', 'Permissions-Policy']
 },
 {
 id: 'performance',
 name: 'Global Edge Performance Engine',
 category: 'Latency',
 icon: Zap,
 color: '#F59E0B',
 summary: 'Measures multi-region edge Time to First Byte (TTFB), Core Web Vitals (FCP, LCP, INP, CLS), and network transfer compression across 42 global PoPs.',
 metrics: ['Anycast TTFB Latency', 'Largest Contentful Paint (LCP)', 'Interaction to Next Paint (INP)', 'Brotli/Gzip Efficiency']
 },
 {
 id: 'a11y',
 name: 'WCAG 2.2 Accessibility Engine',
 category: 'Compliance',
 icon: Eye,
 color: '#EC4899',
 summary: 'Performs automated mathematical contrast calculations, keyboard focus traversals, and ARIA landmark evaluations to guarantee universal access.',
 metrics: ['Contrast Ratio 4.5:1 (AA)', 'ARIA Landmark Structure', 'Alt Text Coverage', 'Tab-Order Traversability']
 },
 {
 id: 'seo',
 name: 'Semantic Graph & SEO Engine',
 category: 'Discoverability',
 icon: FileCode,
 color: '#38BDF8',
 summary: 'Validates canonical URLs, Open Graph schemas, JSON-LD structured microdata, and search crawl accessibility.',
 metrics: ['Canonical URL Integrity', 'JSON-LD Schema Verification', 'Open Graph Metadata', 'Sitemap & Heading Hierarchy']
 },
 {
 id: 'ai-readiness',
 name: 'AI Agent & LLM Discoverability Engine',
 category: 'AI Readiness',
 icon: Bot,
 color: '#A855F7',
 summary: 'Analyzes machine readability for modern AI crawlers (SearchGPT, Perplexity, Gemini), validating llms.txt endpoints and clean markdown extractability.',
 metrics: ['llms.txt Endpoint Detection', 'AI Crawler robots.txt Permissions', 'Semantic Chunk Density', 'Noise-to-Signal Ratio']
 },
 {
 id: 'pwa',
 name: 'Edge Resilience & PWA Engine',
 category: 'Reliability',
 icon: Terminal,
 color: '#06B6D4',
 summary: 'Evaluates service worker registration, offline precaching strategies, and Web App Manifest compliance for resilient web experiences.',
 metrics: ['ServiceWorker Lifecycle', 'Web App Manifest Schema', 'Offline Fallback Capability', 'Maskable Icon Geometry']
 },
 {
 id: 'carbon',
 name: 'Digital Carbon & SWD Engine',
 category: 'Sustainability',
 icon: Leaf,
 color: '#22C55E',
 summary: 'Calculates estimated grams of CO2 per pageview based on transferred byte weight and verifies Green Web Foundation renewable hosting.',
 metrics: ['Estimated CO2 / Pageview', 'Green Hosting Verification', 'Wire Payload Weight', 'Sustainable Web Score']
 }
];

const TEAM_MEMBERS = [
 {
 name: 'Dr. Elena Rostova',
 role: 'Chief Telemetry Architect & Co-Founder',
 bio: 'Former Chromium V8 contributor and distributed systems researcher. Specializes in deterministic headless browser instrumentation and synthetic network profiling.',
 specialty: 'Distributed Telemetry & V8 Internals',
 image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
 },
 {
 name: 'Marcus Vance',
 role: 'Head of Edge Infrastructure & Co-Founder',
 bio: 'Pioneered Anycast routing mesh networks and low-jitter synthetic probe pools across 42 global points of presence. Background in high-throughput SRE.',
 specialty: '42-PoP Anycast Mesh & Python Runners',
 image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
 },
 {
 name: 'Priya Sharma',
 role: 'Principal Security & OWASP Engineer',
 bio: 'Author of zero-trust web header audit frameworks and former offensive security researcher. Directs automated CVE triage and Content-Security-Policy validation.',
 specialty: 'Zero-Trust Architecture & SecOps',
 image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
 },
 {
 name: 'David Chen',
 role: 'AI Agent Discoverability & Vector Systems Lead',
 bio: 'Designs semantic chunking models and LLM crawler ingest standards. Leads research into llms.txt integration and neural agent web retrieval fidelity.',
 specialty: 'SearchGPT & Semantic Retrieval',
 image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
 }
];

const GLOBAL_POPS = [
 { region: 'North America', count: 14, cities: ['Ashburn (IAD)', 'San Jose (SJC)', 'Chicago (ORD)', 'Dallas (DFW)', 'Toronto (YYZ)', 'Seattle (SEA)'] },
 { region: 'Europe', count: 12, cities: ['Frankfurt (FRA)', 'London (LHR)', 'Amsterdam (AMS)', 'Paris (CDG)', 'Dublin (DUB)', 'Stockholm (ARN)'] },
 { region: 'Asia-Pacific', count: 10, cities: ['Tokyo (NRT)', 'Singapore (SIN)', 'Sydney (SYD)', 'Mumbai (BOM)', 'Seoul (ICN)', 'Hong Kong (HKG)'] },
 { region: 'Latin America & MENA', count: 6, cities: ['São Paulo (GRU)', 'Santiago (SCL)', 'Dubai (DXB)', 'Tel Aviv (TLV)', 'Johannesburg (JNB)'] }
];

export const AboutPage: React.FC = () => {
 const [selectedEngine, setSelectedEngine] = useState<string>('dom');
 const activeEngine = ENGINES_CATALOG.find((e) => e.id === selectedEngine) || ENGINES_CATALOG[0];

 return (
 <div data-theme="dark" className="relative min-h-screen ds-page-top bg-background pb-24 text-foreground">
 <SEOHead
 title="About Us & Engineering Methodology — CatalystLab"
 description="Learn about CatalystLab, our 8-engine telemetry architecture, deterministic benchmarks, 42-PoP global edge mesh, and zero-trust engineering standards."
 keywords={['CatalystLab about', 'telemetry mission', '8 engine architecture', 'why choose us', 'edge mesh PoPs', 'engineering team']}
 canonicalUrl="https://www.catalystlab.tech/about"
 />

 {/* Atmospheric Lighting */}
 <div className="pointer-events-none absolute left-1/2 top-0 h-[450px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.12)_0%,transparent_70%)]" />

 {/* Hero Section */}
 <section className="relative z-10 border-b border-border pb-16 sm:pb-20 w-full">
 <div className="ds-page-shell text-center space-y-6">
 
 <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 framer-micro-tag text-[#0066FF] backdrop-blur-md">
 <Sparkles className="size-3.5 text-[#0066FF] shrink-0"/>
 <span>Autonomous Telemetry Infrastructure</span>
 </div>

 <h1 className="framer-hero-title text-foreground max-w-4xl mx-auto">
 Engineering the standard in autonomous web telemetry
 </h1>

 <p className="max-w-2xl mx-auto framer-body-text">
 CatalystLab eliminates black-box guesswork with 8 parallel, deterministic Python microagents across 42 global edge points of presence, delivering reproducible ground-truth dossiers in seconds.
 </p>

 {/* Quick Key Metrics Strip */}
 <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left">
 <div className="ds-card p-4">
 <div className="text-2xl font-bold font-mono text-foreground">8 Engines</div>
 <div className="framer-micro-tag text-muted-foreground mt-1">Parallel microagent dispatch</div>
 </div>

 <div className="ds-card p-4">
 <div className="text-2xl font-bold font-mono text-[#00D2FF]">42 PoPs</div>
 <div className="framer-micro-tag text-muted-foreground mt-1">Global edge Anycast mesh</div>
 </div>

 <div className="ds-card p-4">
 <div className="text-2xl font-bold font-mono text-[#0066FF]">&lt; 4.8s</div>
 <div className="framer-micro-tag text-muted-foreground mt-1">Dossier synthesis latency</div>
 </div>

 <div className="ds-card p-4">
 <div className="text-2xl font-bold font-mono text-emerald-400">100%</div>
 <div className="framer-micro-tag text-muted-foreground mt-1">Passive, zero-SDK probes</div>
 </div>
 </div>

 </div>
 </section>

 {/* Main Content Workspace */}
 <main className="relative z-10 ds-page-shell py-16 space-y-20">
 
 {/* The Problem & Our Mission */}
 <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
 <LazyReveal direction="left" className="lg:col-span-7 space-y-5">
 <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 framer-micro-tag text-[#0066FF] backdrop-blur-md">
 <Terminal className="size-3.5 text-[#0066FF] shrink-0"/>
 <span>Genesis &amp; Mission</span>
 </div>

 <h2 className="framer-section-headline text-foreground">
 Why modern engineering teams outgrow black-box audit tools
 </h2>

 <p className="framer-body-text">
 For more than a decade, web performance auditing has relied on opaque single-number scores from browser extensions and legacy black boxes. These tools fluctuate between consecutive runs, ignore real edge network distribution, and completely overlook critical modern dimensions like zero-trust OWASP headers and SearchGPT/LLM crawler discoverability.
 </p>

 <p className="framer-body-text">
 We engineered CatalystLab as a deterministic observability grid. Every audit spins up eight isolated Python 3.11 microagents that test your production stack against verifiable RFC specifications, OWASP standards, and mathematical DOM metrics without installing invasive client-side trackers.
 </p>

 <div className="pt-2 flex flex-wrap items-center gap-3">
 <Link 
 to="/master-audit"
 className="ds-btn ds-btn-primary text-xs"
 >
 <span>Launch Master Audit</span>
 <ArrowRight className="size-3.5 shrink-0"/>
 </Link>
 <Link 
 to="/engines"
 className="ds-btn ds-btn-secondary text-xs"
 >
 <span>View All 8 Engines</span>
 </Link>
 </div>
 </LazyReveal>

 {/* Interactive Live Telemetry HUD */}
 <LazyReveal direction="right" className="lg:col-span-5">
 <div className="ds-card p-6 space-y-4 font-mono">
 <div className="flex items-center justify-between border-b border-border pb-3.5">
 <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
 <Activity className="size-4 text-[#0066FF] shrink-0"/>
 <span>Telemetry Benchmark Grid</span>
 </div>
 <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 framer-micro-tag text-emerald-400">
 <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"/>
 Grid Live (v2.4)
 </span>
 </div>

 <div className="space-y-2.5 text-xs">
 <div className="flex justify-between py-1.5 border-b border-border/60 dark:border-white/[0.04]">
 <span className="text-muted-foreground">Engine Architecture:</span>
 <strong className="text-foreground">8 Containerized Microagents</strong>
 </div>
 <div className="flex justify-between py-1.5 border-b border-border/60 dark:border-white/[0.04]">
 <span className="text-muted-foreground">Edge Node Distribution:</span>
 <strong className="text-foreground">42 Anycast PoPs</strong>
 </div>
 <div className="flex justify-between py-1.5 border-b border-border/60 dark:border-white/[0.04]">
 <span className="text-muted-foreground">Audit Latency SLA:</span>
 <strong className="text-foreground">&lt; 4.8 Seconds End-to-End</strong>
 </div>
 <div className="flex justify-between py-1.5 border-b border-border/60 dark:border-white/[0.04]">
 <span className="text-muted-foreground">Security Standards:</span>
 <strong className="text-foreground">OWASP Top 10 / HSTS / CSP</strong>
 </div>
 <div className="flex justify-between py-1.5 border-b border-border/60 dark:border-white/[0.04]">
 <span className="text-muted-foreground">AI Crawlers Verified:</span>
 <strong className="text-foreground">SearchGPT / Perplexity / Gemini</strong>
 </div>
 <div className="flex justify-between py-1.5">
 <span className="text-muted-foreground">Data Persistence:</span>
 <strong className="text-foreground">Google Cloud Firestore</strong>
 </div>
 </div>
 </div>
 </LazyReveal>
 </section>

 {/* Mission Visual Asset Showcase */}
 <section className="relative overflow-hidden rounded-2xl border border-border dark:border-white/[0.08] p-2 bg-card dark:bg-muted/20 shadow-sm dark:shadow-linear-card backdrop-blur-xl">
 <div aria-hidden="true"className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 dark:via-white/20 to-transparent"/>
 <ScanRevealFigure
 assetId="about-engineering-team"
 caption="CatalystLab Edge Infrastructure Engineering Team Collaborating"
 aspectRatio="21/9"
 className="rounded-xl overflow-hidden"
 />
 </section>

 {/* The 8-Engine Matrix Interactive Showcase */}
 <section className="space-y-8">
 <div className="text-center space-y-3 max-w-2xl mx-auto">
 <div className="inline-flex items-center gap-2 rounded-full border border-border dark:border-white/[0.08] bg-muted/40 dark:bg-muted/40 px-3.5 py-1 text-xs font-mono font-medium text-primary backdrop-blur-md">
 <Cpu className="size-3.5 text-primary"/>
 <span>Multi-Dimensional Precision</span>
 </div>
 <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-foreground">
 The 8-Engine Autonomous Matrix
 </h2>
 <p className="text-sm text-muted-foreground leading-relaxed font-sans">
 Each microagent operates autonomously on an isolated execution thread, evaluating an explicit layer of your web infrastructure.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
 {/* Engine Selector Navigation */}
 <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
 {ENGINES_CATALOG.map((eng) => {
 const Icon = eng.icon;
 const isSelected = eng.id === selectedEngine;
 return (
 <button
 key={eng.id}
 type="button"
 onClick={() => setSelectedEngine(eng.id)}
 className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
 isSelected
 ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_20px_rgba(94,106,210,0.15)] ring-1 ring-primary/50'
 : 'border-border dark:border-border bg-card dark:bg-muted/20 text-muted-foreground hover:border-border/80 hover:bg-accent hover:text-foreground'
 }`}
 >
 <div className="flex items-center gap-3">
 <div 
 className="p-2 rounded-xl border border-border/80 dark:border-white/[0.08] flex items-center justify-center shrink-0"
 style={{ backgroundColor: isSelected ? `${eng.color}25` : undefined, color: eng.color }}
 >
 <Icon className="size-4"/>
 </div>
 <div>
 <div className="text-xs font-semibold text-foreground font-sans">{eng.name}</div>
 <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{eng.category}</div>
 </div>
 </div>
 <ChevronRight className={`size-4 transition-transform ${isSelected ? 'translate-x-0.5 text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground'}`} />
 </button>
 );
 })}
 </div>

 {/* Selected Engine Deep Dive Card */}
 <div className="lg:col-span-7">
 <LinearCard className="p-7 sm:p-8 space-y-6">
 <div className="flex items-center justify-between border-b border-border dark:border-white/[0.08] pb-5">
 <div className="flex items-center gap-3">
 <div 
 className="p-3 rounded-xl border border-border dark:border-white/[0.08] flex items-center justify-center"
 style={{ backgroundColor: `${activeEngine.color}20`, color: activeEngine.color }}
 >
 {React.createElement(activeEngine.icon, { className: 'size-6' })}
 </div>
 <div>
 <h3 className="text-lg sm:text-xl font-bold text-foreground font-sans">
 {activeEngine.name}
 </h3>
 <span className="text-xs font-mono text-primary uppercase tracking-wider">
 Dimension: {activeEngine.category}
 </span>
 </div>
 </div>
 <span className="hidden sm:inline-flex rounded-full border border-border dark:border-white/[0.08] bg-muted/40 dark:bg-muted/30 px-3 py-1 font-mono text-xs text-muted-foreground">
 Microagent Ready
 </span>
 </div>

 <div className="space-y-3">
 <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Architectural Objective</h4>
 <p className="text-sm text-foreground leading-relaxed font-sans">
 {activeEngine.summary}
 </p>
 </div>

 <div className="space-y-3">
 <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Evaluated Ground-Truth Metrics</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 {activeEngine.metrics.map((metric, i) => (
 <div 
 key={i} 
 className="ds-card flex items-center gap-2.5 p-3 text-xs font-sans"
 >
 <CheckCircle2 className="size-4 shrink-0 text-primary"/>
 <span>{metric}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border dark:border-border">
 <span className="font-mono">Execution Protocol: Isolated Subprocess</span>
 <Link 
 to="/engines"
 className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2"
 >
 <span>Full Engine Dossier</span>
 <ArrowRight className="size-3.5"/>
 </Link>
 </div>
 </LinearCard>
 </div>
 </div>
 </section>

 {/* 4 Architectural Pillars */}
 <section className="space-y-8">
 <div className="text-center space-y-3 max-w-2xl mx-auto">
 <div className="inline-flex items-center gap-2 rounded-full border border-border dark:border-white/[0.08] bg-muted/40 dark:bg-muted/40 px-3.5 py-1 text-xs font-mono font-medium text-primary backdrop-blur-md">
 <Award className="size-3.5 text-primary"/>
 <span>Engineering Philosophy</span>
 </div>
 <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-foreground">
 The Four Structural Pillars
 </h2>
 <p className="text-sm text-muted-foreground leading-relaxed font-sans">
 Non-negotiable architectural commitments baked directly into the CatalystLab runtime.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <LinearCard className="p-6 space-y-3">
 <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
 <Zap className="size-5"/>
 </div>
 <h3 className="text-sm font-semibold text-foreground font-sans">Deterministic Runtime</h3>
 <p className="text-xs text-muted-foreground leading-relaxed font-sans">
 No subjective AI scoring or arbitrary weights. Results are mathematically derived from raw HTTP traces and DOM metrics.
 </p>
 </LinearCard>

 <LinearCard className="p-6 space-y-3">
 <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
 <Globe className="size-5"/>
 </div>
 <h3 className="text-sm font-semibold text-foreground font-sans">42-PoP Global Mesh</h3>
 <p className="text-xs text-muted-foreground leading-relaxed font-sans">
 True global Anycast edge routing eliminates false regional bias, verifying real-world TTFB from 5 continents simultaneously.
 </p>
 </LinearCard>

 <LinearCard className="p-6 space-y-3">
 <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
 <Lock className="size-5"/>
 </div>
 <h3 className="text-sm font-semibold text-foreground font-sans">Zero-Footprint Probes</h3>
 <p className="text-xs text-muted-foreground leading-relaxed font-sans">
 Passive external probes that never inject tracking cookies, analytics pixels, or intrusive JavaScript into client browsers.
 </p>
 </LinearCard>

 <LinearCard className="p-6 space-y-3">
 <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
 <Database className="size-5"/>
 </div>
 <h3 className="text-sm font-semibold text-foreground font-sans">Immutable Permalinks</h3>
 <p className="text-xs text-muted-foreground leading-relaxed font-sans">
 Cryptographically hashed audit permalinks permanently stored in Cloud Firestore for verifiable historical diffing and regression CI gates.
 </p>
 </LinearCard>
 </div>
 </section>

 {/* Global Edge Mesh Network (42 PoPs) */}
 <section className="ds-card p-8 sm:p-10 space-y-8">
 <div aria-hidden="true"className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 dark:via-white/20 to-transparent"/>
 
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="inline-flex items-center gap-2 rounded-full border border-border dark:border-white/[0.08] bg-muted/40 dark:bg-muted/40 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-primary">
 <Server className="size-3.5 text-primary"/>
 <span>Edge Topology</span>
 </div>
 <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
 42 Points of Presence Across Five Continents
 </h2>
 <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto font-sans">
 Distributed Anycast probe nodes execute simultaneous synthetic requests, exposing regional CDN cache misses and edge routing anomalies.
 </p>
 </div>

 <div className="shrink-0 flex items-center gap-3">
 <div className="ds-card p-3 text-center">
 <div className="text-lg font-bold font-mono text-foreground">99.99%</div>
 <div className="text-[10px] text-muted-foreground font-sans">Node Availability</div>
 </div>
 <div className="ds-card p-3 text-center">
 <div className="text-lg font-bold font-mono text-cyan-400">&lt; 2.5ms</div>
 <div className="text-[10px] text-muted-foreground font-sans">Internal Jitter</div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
 {GLOBAL_POPS.map((pop, i) => (
 <div key={i} className="ds-card p-4 space-y-2.5">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-xs text-foreground font-sans">{pop.region}</span>
 <span className="font-mono text-[11px] text-primary font-bold">{pop.count} PoPs</span>
 </div>
 <ul className="space-y-1 text-[11px] font-mono text-muted-foreground">
 {pop.cities.map((c, ci) => (
 <li key={ci} className="flex items-center gap-1.5">
 <span className="size-1 rounded-full bg-cyan-400/80"/>
 <span>{c}</span>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </section>

 {/* Leadership & Core Engineering Team */}
 <section className="space-y-8">
 <div className="text-center space-y-3 max-w-2xl mx-auto">
 <div className="inline-flex items-center gap-2 rounded-full border border-border dark:border-white/[0.08] bg-muted/40 dark:bg-muted/40 px-3.5 py-1 text-xs font-mono font-medium text-primary backdrop-blur-md">
 <Users className="size-3.5 text-primary"/>
 <span>The Builders</span>
 </div>
 <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-foreground">
 Core Engineering Team
 </h2>
 <p className="text-sm text-muted-foreground leading-relaxed font-sans">
 Distributed systems specialists, browser engine researchers, and security architects dedicated to ground-truth web observability.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {TEAM_MEMBERS.map((member, i) => (
 <LinearCard key={i} className="p-5 space-y-4">
 <div className="relative overflow-hidden rounded-xl border border-border dark:border-white/[0.08] aspect-square bg-muted/30 dark:bg-muted/20">
 <img 
 src={member.image} 
 alt={member.name} 
 referrerPolicy="no-referrer"
 className="w-full h-full object-cover grayscale contrast-125 opacity-90 group-hover/card:scale-105 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-500"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-background dark:from-[var(--theme-slate-50)] via-transparent to-transparent opacity-60"/>
 </div>

 <div className="space-y-1">
 <h3 className="text-sm font-bold text-foreground font-sans">{member.name}</h3>
 <div className="text-xs text-primary font-medium font-sans">{member.role}</div>
 <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{member.specialty}</div>
 </div>

 <p className="text-xs text-muted-foreground leading-relaxed font-sans">
 {member.bio}
 </p>
 </LinearCard>
 ))}
 </div>
 </section>

 {/* Final CTA Banner */}
 <section className="ds-card p-8 sm:p-12 text-center space-y-6">
 <div className="relative z-10 max-w-2xl mx-auto space-y-4">
 <h2 className="framer-section-headline text-foreground">
 Ready to benchmark your web stack?
 </h2>
 <p className="framer-body-text">
 Run an instant 8-engine audit on your production domain, or contact our engineering team to request custom worker pools and enterprise quotas.
 </p>
 <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
 <Link
 to="/master-audit"
 className="ds-btn ds-btn-primary text-xs"
 >
 <span>Launch Master Audit</span>
 <ArrowRight className="size-3.5 shrink-0"/>
 </Link>
 <Link
 to="/contact"
 className="ds-btn ds-btn-secondary text-xs"
 >
 <span>Contact Engineering</span>
 </Link>
 </div>
 </div>
 </section>

 </main>
 </div>
 );
};

export default AboutPage;
