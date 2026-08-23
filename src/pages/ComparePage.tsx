import { CompareEngineInput } from "../components/common/CompareEngineInput";
import React, { useState } from 'react';
import { TerminalOutput } from '../components/TerminalOutput';
import { CheckCircle2, XCircle } from 'lucide-react';
import { CustomIconSync } from '../components/common/CustomSvgs';
import { SEOHead } from '../components/common/SEOHead';

export const ComparePage: React.FC = () => {
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');
  const [loading, setLoading] = useState(false);
  const [outputA, setOutputA] = useState('');
  const [outputB, setOutputB] = useState('');

  const normalizeUrl = (input: string): string => {
    let trimmed = input.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlA.trim() || !urlB.trim()) return;

    const cleanA = normalizeUrl(urlA);
    const cleanB = normalizeUrl(urlB);
    setUrlA(cleanA);
    setUrlB(cleanB);

    setLoading(true);
    setOutputA('');
    setOutputB('');

    const fetchEngine = async (url: string) => {
      try {
        const res = await fetch('/api/run-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, engine: 'health' })
        });
        const data = await res.json();
        return data.output || data.error || 'Done';
      } catch (err: any) {
        return `[!] Error: ${err.message}`;
      }
    };

    const [resA, resB] = await Promise.all([fetchEngine(cleanA), fetchEngine(cleanB)]);
    setOutputA(resA);
    setOutputB(resB);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-navy pb-20 text-brand-offwhite selection:bg-brand-slate selection:text-white">
      <SEOHead
        title="Side-by-Side Delta Comparison"
        description="Benchmark performance, security headers, and DOM complexity between two competing websites in real-time."
        keywords={['site comparison', 'benchmark websites', 'performance comparison', 'OWASP headers', 'DOM complexity']}
        canonicalUrl="https://www.catalystlab.tech/compare"
      />
      
      {/* Header */}
      <section className="border-b border-brand-slate/30 bg-brand-oxford px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-surface-panel text-accent-cyan mb-4 border border-brand-slate/40 shadow-sm">
            <CustomIconSync className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-offwhite sm:text-4xl tracking-tight">
            Side-by-Side Delta Comparison
          </h1>
          <p className="mt-2 text-sm text-brand-periwinkle max-w-2xl mx-auto font-sans">
            Benchmark performance, security headers, and DOM complexity between two competing websites.
          </p>

          <div className="mt-8 mx-auto max-w-3xl font-mono">
            <CompareEngineInput 
              urlA={urlA}
              setUrlA={setUrlA}
              urlB={urlB}
              setUrlB={setUrlB}
              onSubmit={handleCompare}
              isLoading={loading}
            />
          </div>
        </div>
      </section>

      {/* Side-by-Side Results */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TerminalOutput
            title={`Target A: ${urlA || 'Primary Site'}`}
            icon="looks_one"
            output={outputA}
            loading={loading}
            statusText="Analyzing primary target DOM & telemetry..."
            maxHeight="max-h-[600px]"
          />
          <TerminalOutput
            title={`Target B: ${urlB || 'Comparison Site'}`}
            icon="looks_two"
            output={outputB}
            loading={loading}
            statusText="Analyzing secondary target DOM & telemetry..."
            maxHeight="max-h-[600px]"
          />
        </div>

        {/* Industry Competitive Architecture Matrix */}
        <section className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 sm:p-8 text-brand-offwhite shadow-xl font-mono">
          <div className="text-center max-w-3xl mx-auto mb-7">
            <span className="rounded-md bg-brand-oxford px-2.5 py-1 text-xs font-bold text-accent-cyan border border-brand-slate/40 uppercase tracking-wider">
              COMPETITIVE BENCHMARK
            </span>
            <h2 className="text-xl font-extrabold text-brand-offwhite sm:text-2xl mt-2.5">
              CatalystLab vs. Legacy Telemetry Tools
            </h2>
            <p className="mt-1.5 text-xs text-brand-periwinkle font-sans">
              Comparing architectural capabilities across modern web health, OWASP security, AI readiness, and edge latency.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-brand-slate/30">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-slate/40 text-brand-periwinkle bg-brand-oxford">
                  <th className="py-3 px-4">Feature / Telemetry Dimension</th>
                  <th className="py-3 px-4 text-accent-emerald font-bold bg-brand-slate/40">CatalystLab</th>
                  <th className="py-3 px-4">PageSpeed Insights</th>
                  <th className="py-3 px-4">GTmetrix</th>
                  <th className="py-3 px-4">SecurityHeaders</th>
                  <th className="py-3 px-4">WAVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-slate/30 text-brand-offwhite bg-brand-navy">
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="py-3 px-4 font-semibold text-brand-offwhite">Multi-Engine Unified Audit (8 Engines)</td>
                  <td className="py-3 px-4 text-accent-emerald font-bold bg-brand-slate/20">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (Full Suite)</span>
                  </td>
                  <td className="py-3 px-4 text-brand-slate-light">Lighthouse Only</td>
                  <td className="py-3 px-4 text-brand-slate-light">Performance Only</td>
                  <td className="py-3 px-4 text-brand-slate-light">Headers Only</td>
                  <td className="py-3 px-4 text-brand-slate-light">A11y Only</td>
                </tr>
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="py-3 px-4 font-semibold text-brand-offwhite">Instant Shareable Permalink</td>
                  <td className="py-3 px-4 text-accent-emerald font-bold bg-brand-slate/20">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (/reports/:slug)</span>
                  </td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                </tr>
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="py-3 px-4 font-semibold text-brand-offwhite">AI Search Readiness (/llms.txt)</td>
                  <td className="py-3 px-4 text-accent-emerald font-bold bg-brand-slate/20">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (LLMO Radar)</span>
                  </td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                </tr>
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="py-3 px-4 font-semibold text-brand-offwhite">Continuous Edge Latency Radar (12 PoPs)</td>
                  <td className="py-3 px-4 text-accent-emerald font-bold bg-brand-slate/20">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (Global)</span>
                  </td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-brand-slate-light">Single Region</td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                </tr>
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="py-3 px-4 font-semibold text-brand-offwhite">Full PDF &amp; JSON Telemetry Dossiers</td>
                  <td className="py-3 px-4 text-accent-emerald font-bold bg-brand-slate/20">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (Instant Export)</span>
                  </td>
                  <td className="py-3 px-4 text-brand-slate-light">JSON Only</td>
                  <td className="py-3 px-4 text-brand-slate-light">Paid PDF</td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-400"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ComparePage;
