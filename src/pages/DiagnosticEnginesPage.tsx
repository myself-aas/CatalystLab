import React from 'react';
import { motion } from 'motion/react';
import { engines } from '../data/diagnosticEngines';
import { DiagnosticEngineCard } from '../components/DiagnosticEngineCard';
import { SEOHead } from '../components/common/SEOHead';
import { Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DiagnosticEnginesPage: React.FC = () => {
 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-24 text-foreground">
 <SEOHead
 title="Diagnostic Engines Catalog — CatalystLab"
 description="Explore the 8 standalone automated diagnostic engines of CatalystLab: performance, security, LLM readiness, and carbon intelligence."
 canonicalUrl="https://www.catalystlab.tech/diagnostic-engines"
 />

 {/* Top Banner Hero */}
 <section className="relative overflow-hidden border-b border-border bg-background py-12 sm:py-16 w-full">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.08)_0%,transparent_70%)] pointer-events-none" />

 <div className="ds-page-shell">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
 <div className="space-y-4 max-w-2xl">
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 framer-micro-tag text-foreground">
 <Cpu className="h-3.5 w-3.5 text-[#0066FF] shrink-0"/>
 8 SDLC Micro-Engines
 </span>
 <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 framer-micro-tag text-muted-foreground">
 Deterministic Probes
 </span>
 <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 framer-micro-tag text-emerald-400">
 Python 3.11 Runtime
 </span>
 </div>

 <h1 className="framer-section-headline text-foreground">
 Diagnostic Engines Catalog
 </h1>
 <p className="framer-body-text">
 Independent telemetry probes measuring Web Vitals, LLM crawler access, multi-region latency, OWASP compliance, and green hosting carbon metrics.
 </p>
 </div>

 <div className="shrink-0">
 <Link
 to="/master-audit"
 className="ds-btn ds-btn-primary text-xs sm:text-sm"
 >
 <span>Run Full Master Audit</span>
 <ArrowRight className="h-4 w-4 shrink-0"/>
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* Main Grid */}
 <main className="ds-page-shell lg:">
 <motion.div
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
 variants={{
 visible: { transition: { staggerChildren: 0.08 } },
 hidden: {},
 }}
 initial="hidden"
 animate="visible"
 >
 {engines.map((engine) => (
 <DiagnosticEngineCard key={engine.id} engine={engine} />
 ))}
 </motion.div>
 </main>
 </div>
 );
};

export default DiagnosticEnginesPage;

