import React from 'react';
import { Link } from 'react-router-dom';
import { Info, CheckCircle2, Server, Cpu, Database, Activity, Play, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';
import { ParallaxSection } from '../../components/common/ParallaxSection';

export const SystemOverviewDoc: React.FC = () => {
 return (
 <DocsLayout
 title="System Overview & Philosophy"
 description="System overview, core architectural tenets, non-evaluating streaming telemetry, and the 8 automated diagnostic engines of CatalystLab."
 canonicalPath="/docs"
 >
 {/* Hero Header */}
 <section id="overview-philosophy"className="space-y-4">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-0.5 text-xs font-semibold text-primary">
 <span className="h-1.5 w-1.5 rounded-full bg-primary"/>
 <span>CatalystLab Core Architecture</span>
 </div>
 <h1 className="text-4xl sm:text-5xl font-display font-medium text-foreground">
 System Overview & Engineering Philosophy
 </h1>
 <p className="text-base text-muted-foreground leading-relaxed">
 CatalystLab is an enterprise-grade automated telemetry and web quality intelligence platform. It orchestrates synchronous diagnostics across 8 isolated evaluation modules to measure Core Web Vitals, AI LLM crawler accessibility, Git repository hygiene, multi-region edge latency, OWASP compliance, and green hosting carbon metrics.
 </p>
 </section>

 {/* Immersive Docs Parallax Banner */}
 <ParallaxSection
 bgImage="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
 overlayOpacity={0.88}
 height="min-h-[260px]"
 className="rounded-xl overflow-hidden my-6 border border-border"
 >
 <div className="ds-page-shell">
 <span className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground py-1 text-xs font-mono font-bold uppercase tracking-wider">
 Zero-Eval Architecture
 </span>
 <h2 className="text-2xl sm:text-3xl font-display font-medium text-foreground tracking-normal">
 Deterministic Telemetry &amp; TLS Probing
 </h2>
 </div>
 </ParallaxSection>

 {/* Callout Note */}
 <section id="zero-eval-model"className="space-y-4">
 <div className="rounded-xl border-l-4 border-primary bg-primary/10 p-5 text-sm text-foreground">
 <div className="flex items-start gap-3">
 <Info className="h-5 w-5 text-primary shrink-0 mt-0.5"/>
 <div className="space-y-2">
 <h2 className="font-bold text-foreground text-base">Zero Client-Script Execution Model</h2>
 <p className="leading-relaxed">
 Unlike traditional headless browser clusters (Puppeteer / Playwright) that load and execute unvetted client-side JavaScript—introducing security vulnerabilities, crypto-mining risks, and high memory overhead—CatalystLab utilizes high-speed non-evaluating streaming HTTP/TLS socket timing probes, Abstract Syntax Tree (AST) HTML parsers, and DNS anycast radars.
 </p>
 <p className="leading-relaxed">
 This delivers sub-second deterministic telemetry while protecting host infrastructure and providing tamper-free diagnostic repeatability.
 </p>
 </div>
 </div>
 </div>
 </section>

 {/* Key Architectural Tenets */}
 <section className="space-y-4">
 <h2 className="text-2xl font-display font-medium text-foreground">Four Core Principles</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div className="ds-card p-4 space-y-1.5">
 <div className="flex items-center gap-2 font-bold text-foreground">
 <Zap className="h-4 w-4 text-amber-500"/>
 <span>1. Sub-Second Determinism</span>
 </div>
 <p className="text-muted-foreground leading-relaxed">
 Every audit returns within 800ms to 2.5s with zero cold-boot overhead, enabling seamless integration into CI/CD build gates.
 </p>
 </div>

 <div className="ds-card p-4 space-y-1.5">
 <div className="flex items-center gap-2 font-bold text-foreground">
 <ShieldCheck className="h-4 w-4 text-emerald-600"/>
 <span>2. Zero-Trust Security</span>
 </div>
 <p className="text-muted-foreground leading-relaxed">
 Strict SSRF mitigation, regex shell escapes, memory caps, and process timeouts protect against malicious target domains.
 </p>
 </div>

 <div className="ds-card p-4 space-y-1.5">
 <div className="flex items-center gap-2 font-bold text-foreground">
 <Activity className="h-4 w-4 text-sky-600"/>
 <span>3. Standardized Output Schema</span>
 </div>
 <p className="text-muted-foreground leading-relaxed">
 All 8 engines emit uniform JSON telemetry with score indexes (0–100), passing statuses, and actionable remediation instructions.
 </p>
 </div>

 <div className="ds-card p-4 space-y-1.5">
 <div className="flex items-center gap-2 font-bold text-foreground">
 <Database className="h-4 w-4 text-purple-600"/>
 <span>4. Durable Permalinks</span>
 </div>
 <p className="text-muted-foreground leading-relaxed">
 Dossier snapshots are automatically indexed into permanent shareable reports (e.g. <code>/reports/example-com</code>).
 </p>
 </div>
 </div>
 </section>

 {/* SDLC Catalysts Summary */}
 <section id="engines-summary"className="space-y-4">
 <h2 className="text-2xl font-display font-medium text-foreground">The 8 SDLC Catalysts</h2>
 <p className="text-sm text-muted-foreground">
 CatalystLab divides modern web telemetry into 8 specialized diagnostic vectors:
 </p>

 <div className="ds-card p-4">
 <table className="w-full text-left text-sm">
 <thead className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
 <tr>
 <th className="py-2.5">Phase / Engine</th>
 <th className="py-2.5">Diagnostic Vector</th>
 <th className="py-2.5">Key Output</th>
 <th className="py-2.5">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.06] text-foreground">
 <tr>
 <td className="py-2 font-semibold text-orange-400">1. SynthShift</td>
 <td className="py-2 text-muted-foreground">Platform Migration & System Blueprint</td>
 <td className="py-2 text-xs font-mono">Firebase + Mongo Schemas</td>
 <td className="py-2">
 <Link to="/docs/synthshift"className="text-primary hover:underline font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Docs →</Link>
 </td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-emerald-400">2. GitLygase</td>
 <td className="py-2 text-muted-foreground">Git Repository SecOps & Hygiene</td>
 <td className="py-2 text-xs font-mono">License, SECURITY.md, CI</td>
 <td className="py-2">
 <Link to="/docs/gitlygase"className="text-primary hover:underline font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Docs →</Link>
 </td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-emerald-400">3. EcoHolo</td>
 <td className="py-2 text-muted-foreground">Sustainable Web Carbon Footprint</td>
 <td className="py-2 text-xs font-mono">SWD v4 (g CO2 / view)</td>
 <td className="py-2">
 <Link to="/docs/ecoholo"className="text-primary hover:underline font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Docs →</Link>
 </td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-primary">4. VitalZyme</td>
 <td className="py-2 text-muted-foreground">Core Web Vitals & DOM Tree Depth</td>
 <td className="py-2 text-xs font-mono">Tree Depth, Total Nodes</td>
 <td className="py-2">
 <Link to="/docs/vitalzyme"className="text-primary hover:underline font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Docs →</Link>
 </td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-pink-400">5. EdgeVmax</td>
 <td className="py-2 text-muted-foreground">Multi-PoP Global Edge Latency</td>
 <td className="py-2 text-xs font-mono">12-Region Synthetic TTFB</td>
 <td className="py-2">
 <Link to="/docs/edgevmax"className="text-primary hover:underline font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Docs →</Link>
 </td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-amber-400">6. RiskProtease</td>
 <td className="py-2 text-muted-foreground">OWASP Security & Compliance</td>
 <td className="py-2 text-xs font-mono">HSTS, CSP, WCAG 2.2 AA</td>
 <td className="py-2">
 <Link to="/docs/riskprotease"className="text-primary hover:underline font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Docs →</Link>
 </td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-violet-400">7. LLM-Kinase</td>
 <td className="py-2 text-muted-foreground">AI Readiness & llms.txt Discovery</td>
 <td className="py-2 text-xs font-mono">GPTBot, JSON-LD Schemas</td>
 <td className="py-2">
 <Link to="/docs/llm-kinase"className="text-primary hover:underline font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Docs →</Link>
 </td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-indigo-300">8. AllosterSearch</td>
 <td className="py-2 text-muted-foreground">AI Search Engine Optimization (LLMO)</td>
 <td className="py-2 text-xs font-mono">RAG Density, E-E-A-T Index</td>
 <td className="py-2">
 <Link to="/docs/allostersearch"className="text-primary hover:underline font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Docs →</Link>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* Next Steps */}
 <section id="next-steps"className="space-y-4">
 <h2 className="text-2xl font-display font-medium text-foreground">Next Steps</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
 <Link
 to="/products#webhook-mesh"
 className="rounded-xl border border-primary/30 bg-primary/10 p-4 hover:border-primary/50 hover:bg-primary/15 transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
 >
 <div className="font-bold text-foreground group-hover:text-primary flex items-center justify-between">
 <span>Edge Mesh &amp; Webhooks</span>
 <ArrowRight className="h-3.5 w-3.5"/>
 </div>
 <p className="text-xs text-muted-foreground mt-1">Interactive 42-PoP Anycast mesh & webhook fan-out live visualizer.</p>
 </Link>

 <Link
 to="/docs/architecture"
 className="ds-card p-4 group ds-card-interactive"
 >
 <div className="font-bold text-foreground group-hover:text-primary flex items-center justify-between">
 <span>Full-Stack Architecture</span>
 <ArrowRight className="h-3.5 w-3.5"/>
 </div>
 <p className="text-xs text-muted-foreground mt-1">Explore ingress, worker processes & Firestore storage.</p>
 </Link>

 <Link
 to="/docs/api"
 className="ds-card p-4 group ds-card-interactive"
 >
 <div className="font-bold text-foreground group-hover:text-primary flex items-center justify-between">
 <span>REST API Spec</span>
 <ArrowRight className="h-3.5 w-3.5"/>
 </div>
 <p className="text-xs text-muted-foreground mt-1">Programmatic endpoint schemas and execution parameters.</p>
 </Link>

 <Link
 to="/docs/synthshift"
 className="ds-card p-4 group ds-card-interactive"
 >
 <div className="font-bold text-foreground group-hover:text-primary flex items-center justify-between">
 <span>Engine Deep-Dives</span>
 <ArrowRight className="h-3.5 w-3.5"/>
 </div>
 <p className="text-xs text-muted-foreground mt-1">Detailed blueprints, calculations, and remediation guides.</p>
 </Link>
 </div>
 </section>
 </DocsLayout>
 );
};
export default SystemOverviewDoc;
