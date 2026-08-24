import { CompareEngineInput } from "../components/common/CompareEngineInput";
import React, { useState } from 'react';
import { TerminalOutput } from '../components/TerminalOutput';
import { CheckCircle2, XCircle } from 'lucide-react';
import { CustomIconSync } from '../components/common/CustomSvgs';
import { SEOHead } from '../components/common/SEOHead';
import { ParallaxSection } from '../components/common/ParallaxSection';

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
    <div className="min-h-screen bg-white pb-20 text-black selection:bg-slate-900 selection:text-white">
      <SEOHead
        title="Side-by-Side Delta Comparison"
        description="Benchmark performance, security headers, and DOM complexity between two competing websites in real-time."
        keywords={['site comparison', 'benchmark websites', 'performance comparison', 'OWASP headers', 'DOM complexity']}
        canonicalUrl="https://www.catalystlab.tech/compare"
      />
      
      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-900 mb-4 border border-slate-200 shadow-sm">
            <CustomIconSync className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-black sm:text-4xl tracking-tight">
            Side-by-Side Delta Comparison
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto font-sans">
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

        {/* Immersive Compare Parallax Banner */}
        <ParallaxSection
          bgImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80"
          overlayOpacity={0.88}
          height="min-h-[260px]"
          className="rounded-2xl overflow-hidden border border-slate-200"
        >
          <div className="max-w-3xl mx-auto px-6 text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-amber-700 border border-slate-200 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider">
              Side-by-Side Telemetry Diff
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-black font-sans tracking-tight">
              Synchronous Multi-Target Benchmarking
            </h2>
          </div>
        </ParallaxSection>

        {/* Industry Competitive Architecture Matrix */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-black shadow-sm font-mono">
          <div className="text-center max-w-3xl mx-auto mb-7">
            <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-slate-200 uppercase tracking-wider">
              COMPETITIVE BENCHMARK
            </span>
            <h2 className="text-xl font-extrabold text-black sm:text-2xl mt-2.5">
              CatalystLab vs. Legacy Telemetry Tools
            </h2>
            <p className="mt-1.5 text-xs text-slate-600 font-sans">
              Comparing architectural capabilities across modern web health, OWASP security, AI readiness, and edge latency.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                  <th className="py-3 px-4">Feature / Telemetry Dimension</th>
                  <th className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/50">CatalystLab</th>
                  <th className="py-3 px-4">PageSpeed Insights</th>
                  <th className="py-3 px-4">GTmetrix</th>
                  <th className="py-3 px-4">SecurityHeaders</th>
                  <th className="py-3 px-4">WAVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-black bg-white">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-black">Multi-Engine Unified Audit (8 Engines)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/30">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (Full Suite)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">Lighthouse Only</td>
                  <td className="py-3 px-4 text-slate-500">Performance Only</td>
                  <td className="py-3 px-4 text-slate-500">Headers Only</td>
                  <td className="py-3 px-4 text-slate-500">A11y Only</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-black">Instant Shareable Permalink</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/30">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (/reports/:slug)</span>
                  </td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-black">AI Search Readiness (/llms.txt)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/30">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (LLMO Radar)</span>
                  </td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-black">Continuous Edge Latency Radar (12 PoPs)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/30">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (Global)</span>
                  </td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-slate-500">Single Region</td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-black">Full PDF &amp; JSON Telemetry Dossiers</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/30">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes (Instant Export)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">JSON Only</td>
                  <td className="py-3 px-4 text-slate-500">Paid PDF</td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
                  <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span></td>
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
