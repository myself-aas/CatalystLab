import { CompareEngineInput } from "../components/common/CompareEngineInput";
import React, { useState } from 'react';
import { TerminalOutput } from '../components/TerminalOutput';
import { Play, CheckCircle2, XCircle, RotateCw } from 'lucide-react';
import { CustomIconSync } from '../components/common/CustomSvgs';

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
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c]">
      
      {/* Header */}
      <section className="border-b border-[#ebe9e6] bg-[#f4f6fa] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#415a77]/15 text-[#415a77] mb-4 border border-[#415a77]/30 shadow-sm">
            <CustomIconSync className="h-6 w-6 text-[#415a77]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0b192c] sm:text-4xl">
            Side-by-Side Delta Comparison
          </h1>
          <p className="mt-2 text-base text-[#415a77]">
            Benchmark performance, security headers, and DOM complexity between two competing websites.
          </p>

          <div className="mt-8 mx-auto max-w-3xl">
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
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
        <section className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-10 text-[#f8fafc] shadow-2xl">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="rounded-md bg-[#415a77]/30 px-3 py-1 text-sm font-bold text-[#c5d3e8] border border-[#415a77]/50 font-mono">
              COMPETITIVE BENCHMARK
            </span>
            <h2 className="text-2xl font-extrabold text-[#f8fafc] sm:text-3xl mt-3">
              CatalystLab vs. Legacy Telemetry Tools
            </h2>
            <p className="mt-2 text-sm text-[#c5d3e8]">
              Comparing architectural capabilities across modern web health, OWASP security, AI readiness, and edge latency.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#415a77]/40 text-[#c5d3e8] font-mono">
                  <th className="py-3 px-4">Feature / Telemetry Dimension</th>
                  <th className="py-3 px-4 text-emerald-400 font-bold bg-[#152238]/60 rounded-t-lg">CatalystLab</th>
                  <th className="py-3 px-4">PageSpeed Insights</th>
                  <th className="py-3 px-4">GTmetrix</th>
                  <th className="py-3 px-4">SecurityHeaders</th>
                  <th className="py-3 px-4">WAVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#415a77]/20 text-[#ebe9e6]">
                <tr className="hover:bg-[#152238]/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#f8fafc]">Multi-Engine Unified Audit (8 Engines)</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-[#152238]/40"><span className="material-symbols-outlined text-base align-middle">check_circle</span> Yes (Full Suite)</td>
                  <td className="py-3 px-4 text-[#c5d3e8]/70">Lighthouse Only</td>
                  <td className="py-3 px-4 text-[#c5d3e8]/70">Performance Only</td>
                  <td className="py-3 px-4 text-[#c5d3e8]/70">Headers Only</td>
                  <td className="py-3 px-4 text-[#c5d3e8]/70">A11y Only</td>
                </tr>
                <tr className="hover:bg-[#152238]/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#f8fafc]">Instant Shareable Permalink</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-[#152238]/40"><span className="material-symbols-outlined text-base align-middle">check_circle</span> Yes (/reports/:slug)</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                </tr>
                <tr className="hover:bg-[#152238]/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#f8fafc]">AI Search Readiness (/llms.txt)</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-[#152238]/40"><span className="material-symbols-outlined text-base align-middle">check_circle</span> Yes (LLMO Radar)</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                </tr>
                <tr className="hover:bg-[#152238]/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#f8fafc]">Continuous Edge Latency Radar (12 PoPs)</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-[#152238]/40"><span className="material-symbols-outlined text-base align-middle">check_circle</span> Yes (Global)</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-[#c5d3e8]/70">Single Region</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                </tr>
                <tr className="hover:bg-[#152238]/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#f8fafc]">Full PDF & JSON Telemetry Dossiers</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-[#152238]/40"><span className="material-symbols-outlined text-base align-middle">check_circle</span> Yes (Instant Export)</td>
                  <td className="py-3 px-4 text-[#c5d3e8]/70">JSON Only</td>
                  <td className="py-3 px-4 text-[#c5d3e8]/70">Paid PDF</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                  <td className="py-3 px-4 text-rose-400"><span className="material-symbols-outlined text-base align-middle">cancel</span> No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
