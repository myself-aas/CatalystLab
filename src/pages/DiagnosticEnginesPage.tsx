import React from 'react';
import { motion } from 'framer-motion';
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
      <section className="border-b border-slate-200 bg-slate-50 pt-10 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  <Cpu className="h-3.5 w-3.5" />
                  8 SDLC Engines
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 font-mono">
                  Deterministic Probes
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                Diagnostic Engines Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Independent telemetry probes measuring Web Vitals, LLM crawler access, multi-region latency, OWASP compliance, and green hosting carbon metrics.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/master-audit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer font-mono"
              >
                <span>Run Full Master Audit</span>
                <ArrowRight className="h-4 w-4" />
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

