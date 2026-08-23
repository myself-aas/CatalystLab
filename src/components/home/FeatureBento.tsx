import React, { useState } from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { 
  ShieldCheck, 
  Layers, 
  Leaf, 
  Bot, 
  Zap,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeatureBento: React.FC = () => {
  // Card 1: Interactive OWASP Header Simulator
  const [activeHeaders, setActiveHeaders] = useState<Record<string, boolean>>({
    'Content-Security-Policy': true,
    'Strict-Transport-Security': true,
    'X-Frame-Options': true,
    'X-Content-Type-Options': true,
    'Permissions-Policy': true,
    'Referrer-Policy': true,
  });

  const toggleHeader = (key: string) => {
    setActiveHeaders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = Object.values(activeHeaders).filter(Boolean).length;
  const securityGrade = activeCount === 6 ? 'A+' : activeCount >= 4 ? 'B' : 'F';

  // Card 2: Interactive DOM Depth Slider
  const [domDepth, setDomDepth] = useState<number>(8);
  const estimatedNodes = Math.round(domDepth * 62 + 40);
  const renderTimeMs = (domDepth * 2.8).toFixed(1);

  // Card 3: Carbon Footprint Calculator
  const [monthlyTraffic, setMonthlyTraffic] = useState<number>(100000);
  const legacyCo2Kg = ((monthlyTraffic * 1.84) / 1000).toFixed(1);
  const optimizedCo2Kg = ((monthlyTraffic * 0.08) / 1000).toFixed(1);
  const co2SavedKg = (Number(legacyCo2Kg) - Number(optimizedCo2Kg)).toFixed(1);

  // Card 5: QUIC / HTTP/3 Simulator
  const [quicEnabled, setQuicEnabled] = useState<boolean>(true);
  const quicTtfb = quicEnabled ? 18 : 142;
  const quicHandshake = quicEnabled ? '0-RTT (TLS 1.3)' : '3-RTT (TCP+TLS 1.2)';

  // Presets for quick interaction
  const applyPreset = (preset: 'ecommerce' | 'saas' | 'content') => {
    if (preset === 'ecommerce') {
      setMonthlyTraffic(500000);
      setDomDepth(14);
      setActiveHeaders({
        'Content-Security-Policy': true,
        'Strict-Transport-Security': true,
        'X-Frame-Options': true,
        'X-Content-Type-Options': true,
        'Permissions-Policy': false,
        'Referrer-Policy': true,
      });
      setQuicEnabled(true);
    } else if (preset === 'saas') {
      setMonthlyTraffic(250000);
      setDomDepth(7);
      setActiveHeaders({
        'Content-Security-Policy': true,
        'Strict-Transport-Security': true,
        'X-Frame-Options': true,
        'X-Content-Type-Options': true,
        'Permissions-Policy': true,
        'Referrer-Policy': true,
      });
      setQuicEnabled(true);
    } else {
      setMonthlyTraffic(1000000);
      setDomDepth(6);
      setActiveHeaders({
        'Content-Security-Policy': true,
        'Strict-Transport-Security': true,
        'X-Frame-Options': false,
        'X-Content-Type-Options': true,
        'Permissions-Policy': true,
        'Referrer-Policy': true,
      });
      setQuicEnabled(false);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white text-zinc-950 relative border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <LazyReveal direction="up" className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950">
              Deep Architectural Telemetry Deck
            </h2>
            <p className="text-base lg:text-lg text-zinc-600 mt-4 leading-relaxed">
              Interact with live diagnostic sandboxes to inspect security headers, DOM render-blocking bottlenecks, carbon budgets, and generative AI search indexing.
            </p>
          </LazyReveal>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset('saas')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 shadow-sm"
            >
              SaaS
            </button>
            <button
              type="button"
              onClick={() => applyPreset('ecommerce')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 shadow-sm"
            >
              E-Commerce
            </button>
            <button
              type="button"
              onClick={() => applyPreset('content')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 shadow-sm"
            >
              Media
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: OWASP Security Transport Header Sandbox */}
          <div className="col-span-1 lg:col-span-2 bg-white border border-zinc-200/80 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-900 border border-zinc-200/80">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-950">Transport Security</h3>
                </div>
                <span className={`text-xs font-mono px-3 py-1.5 rounded-lg border ${
                  securityGrade === 'A+'
                    ? 'bg-zinc-950 text-white border-zinc-900'
                    : securityGrade === 'B'
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200'
                    : 'bg-white text-zinc-500 border-zinc-200'
                }`}>
                  Grade {securityGrade}
                </span>
              </div>

              <p className="text-sm text-zinc-600 mb-8 max-w-md">
                Click headers to simulate response defenses against transport attack vectors.
              </p>

              {/* Interactive Header Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs mb-8">
                {Object.entries(activeHeaders).map(([header, enabled]) => (
                  <button
                    key={header}
                    type="button"
                    onClick={() => toggleHeader(header)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      enabled
                        ? 'bg-zinc-950 border-zinc-900 text-white shadow-sm'
                        : 'bg-white border-zinc-200/80 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                    }`}
                  >
                    <span className="truncate">{header.replace('Content-', '').replace('Transport-', '')}</span>
                    {enabled ? <Check className="h-3.5 w-3.5 opacity-100 shrink-0 ml-2" /> : <X className="h-3.5 w-3.5 opacity-40 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-100 flex items-center justify-between text-sm">
              <span className="text-zinc-500">{activeCount}/6 Strict Policies</span>
              <Link to="/compliance" className="text-zinc-950 hover:text-zinc-600 flex items-center gap-1.5 font-medium transition-colors">
                <span>Run RiskProtease</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: DOM Depth & Render-Tree Inspector */}
          <div className="col-span-1 bg-zinc-50/50 border border-zinc-200/80 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl text-zinc-900 border border-zinc-200/80">
                    <Layers className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-950">DOM Depth</h3>
                </div>
                <span className="text-xs font-mono text-zinc-900 bg-white border border-zinc-200/80 px-2.5 py-1.5 rounded-lg">
                  {domDepth} Lvl
                </span>
              </div>

              <p className="text-sm text-zinc-600 mb-8">
                Excessive nesting triggers layout thrashing and delays client first-paint.
              </p>

              {/* Slider */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-zinc-200/80 mb-8">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Depth</span>
                  <span className="text-zinc-900 font-medium">Target ≤ 8</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  value={domDepth}
                  onChange={(e) => setDomDepth(Number(e.target.value))}
                  className="w-full accent-zinc-900 cursor-pointer"
                />
                
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-100 font-mono text-xs">
                  <div className="text-zinc-500">
                    Nodes: <br/><span className="text-zinc-900 font-medium text-sm">{estimatedNodes}</span>
                  </div>
                  <div className="text-zinc-500 text-right">
                    Thread: <br/><span className="text-zinc-900 font-medium text-sm">~{renderTimeMs}ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-200 flex items-center justify-between text-sm">
              <span className="text-zinc-500">W3C Target: ≤ 8</span>
              <Link to="/health" className="text-zinc-950 hover:text-zinc-600 flex items-center gap-1.5 font-medium transition-colors">
                <span>Inspect DOM</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: SWD Carbon Budget */}
          <div className="col-span-1 bg-white border border-zinc-200/80 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-900 border border-zinc-200/80">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-950">Carbon Budget</h3>
                </div>
              </div>

              <p className="text-sm text-zinc-600 mb-8">
                Estimate annual emissions savings with Brotli + AVIF payload optimizations.
              </p>

              {/* Traffic Slider */}
              <div className="space-y-4 bg-zinc-50/50 p-5 rounded-2xl border border-zinc-200/80 mb-8">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Traffic</span>
                  <span className="text-zinc-900 font-medium">{(monthlyTraffic / 1000).toLocaleString()}k</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={monthlyTraffic}
                  onChange={(e) => setMonthlyTraffic(Number(e.target.value))}
                  className="w-full accent-zinc-900 cursor-pointer"
                />

                <div className="p-3.5 rounded-xl bg-zinc-950 text-white text-xs font-mono flex items-center justify-between shadow-inner">
                  <span className="text-zinc-400">CO2 Saved:</span>
                  <span className="font-medium text-sm">{(Number(co2SavedKg) * 12).toFixed(0)} kg</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-100 flex items-center justify-between text-sm">
              <span className="text-zinc-500">Green Web</span>
              <Link to="/eco-audit" className="text-zinc-950 hover:text-zinc-600 flex items-center gap-1.5 font-medium transition-colors">
                <span>Run EcoHolo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 4: AI LLMO Ingestion (Dark Theme) */}
          <div className="col-span-1 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-100 border border-zinc-800">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">AI LLMO</h3>
                </div>
                <span className="text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
                  98.4%
                </span>
              </div>

              <p className="text-sm text-zinc-400 mb-8">
                Perplexity, SearchGPT &amp; Claude rely on structured JSON-LD &amp; <code className="text-white font-medium">/llms.txt</code>.
              </p>

              {/* Vector Check Matrix */}
              <div className="grid grid-cols-1 gap-3 text-xs font-mono mb-8">
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                  <div className="text-zinc-100 font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>/llms.txt Found</span>
                  </div>
                  <div className="text-zinc-500 text-right">
                    24k tkns
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                  <div className="text-zinc-100 font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>JSON-LD Schema</span>
                  </div>
                  <div className="text-zinc-500 text-right">
                    Verified
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-800 flex items-center justify-between text-sm">
              <span className="text-zinc-500">RAG Ready</span>
              <Link to="/ai-readiness" className="text-white hover:text-zinc-300 flex items-center gap-1.5 font-medium transition-colors">
                <span>Audit Readiness</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 5: HTTP/3 QUIC Protocol */}
          <div className="col-span-1 bg-zinc-50/50 border border-zinc-200/80 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl text-zinc-900 border border-zinc-200/80">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-950">HTTP/3 QUIC</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setQuicEnabled(!quicEnabled)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    quicEnabled ? 'bg-zinc-950 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200/80 hover:bg-zinc-50'
                  }`}
                >
                  {quicEnabled ? 'Active' : 'HTTP/1.1'}
                </button>
              </div>

              <p className="text-sm text-zinc-600 mb-8">
                UDP multiplexing reduces TLS handshakes to zero round trips on repeat requests.
              </p>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 space-y-4 font-mono text-xs mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Measured TTFB:</span>
                  <span className={`font-medium text-sm ${quicEnabled ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    {quicTtfb}ms {quicEnabled ? '(Optimal)' : '(High)'}
                  </span>
                </div>
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-zinc-500">Handshake:</span>
                  <span className="text-zinc-900 font-medium">{quicHandshake}</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-200 flex items-center justify-between text-sm">
              <span className="text-zinc-500">42 Anycast PoPs</span>
              <Link to="/latency" className="text-zinc-950 hover:text-zinc-600 flex items-center gap-1.5 font-medium transition-colors">
                <span>Probe Edge</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FeatureBento;
