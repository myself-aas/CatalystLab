import React from 'react';
import { motion } from 'motion/react';
import { engines } from '../data/diagnosticEngines';
import { DiagnosticEngineCard } from '../components/DiagnosticEngineCard';
import { SEOHead } from '../components/common/SEOHead';
import { Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DiagnosticEnginesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900 selection:bg-slate-900 selection:text-white">
      <SEOHead
        title="Diagnostic Engines Catalog — CatalystLab"
        description="Explore the 8 standalone automated diagnostic engines of CatalystLab: performance, security, LLM readiness, and carbon intelligence."
        canonicalUrl="https://www.catalystlab.tech/diagnostic-engines"
      />

      {/* Top Banner Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 pt-14 pb-16 sm:pt-16 sm:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#ffffff_0%,#f8fafc_65%,#f1f5f9_100%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-mono font-bold text-slate-900 uppercase tracking-wider shadow-xs">
                  <Cpu className="h-3.5 w-3.5 text-blue-600" />
                  8 SDLC Micro-Engines
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-mono font-semibold text-slate-700 shadow-xs">
                  Deterministic Probes
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-bold text-emerald-800 shadow-xs">
                  Python 3.11 Runtime
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 font-sans leading-[1.1]">
                Diagnostic Engines{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800">
                  Catalog
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans font-normal max-w-2xl">
                Independent telemetry probes measuring Web Vitals, LLM crawler access, multi-region latency, OWASP compliance, and green hosting carbon metrics.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/master-audit"
                className="inline-flex items-center gap-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer font-mono active:scale-95"
              >
                <span>Run Full Master Audit</span>
                <ArrowRight className="h-4 w-4 text-blue-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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

