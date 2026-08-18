import React, { useState } from 'react';
import { TerminalOutput } from '../components/TerminalOutput';
import { Play, ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Header */}
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Side-by-Side Delta Comparison
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Benchmark performance, security headers, and DOM complexity between two competing websites.
          </p>

          <form onSubmit={handleCompare} className="mt-8 mx-auto max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-2">
                <input
                  type="text"
                  value={urlA}
                  onChange={(e) => setUrlA(e.target.value)}
                  placeholder="Primary URL (e.g. https://site-a.com)"
                  required
                  className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-2">
                <input
                  type="text"
                  value={urlB}
                  onChange={(e) => setUrlB(e.target.value)}
                  placeholder="Comparison URL (e.g. https://site-b.com)"
                  required
                  className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Benchmarking Both Targets...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Execute Comparative Benchmark</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Side-by-Side Results */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TerminalOutput
            title={`Target A: ${urlA || 'Primary Site'}`}
            icon="🅰️"
            output={outputA}
            loading={loading}
            statusText="Analyzing primary target DOM & telemetry..."
            maxHeight="max-h-[600px]"
          />
          <TerminalOutput
            title={`Target B: ${urlB || 'Comparison Site'}`}
            icon="🅱️"
            output={outputB}
            loading={loading}
            statusText="Analyzing secondary target DOM & telemetry..."
            maxHeight="max-h-[600px]"
          />
        </div>
      </main>
    </div>
  );
};
