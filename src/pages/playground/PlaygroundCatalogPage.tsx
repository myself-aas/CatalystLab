import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Layers, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Leaf, 
  GitBranch, 
  Sparkles, 
  Lock, 
  Server, 
  Zap, 
  ArrowRight,
  Code2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { PLAYGROUND_ENGINES, PlaygroundNavSidebar } from '../../components/playground/PlaygroundNavSidebar';
import { useAuth } from '../../context/AuthContext';
import { getRateLimitStatus } from '../../utils/rateLimiter';

export const PlaygroundCatalogPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [quickUrl, setQuickUrl] = useState('https://example.com');
  const [selectedEngine, setSelectedEngine] = useState('master');

  const rateStatus = getRateLimitStatus(user, isAdmin);

  const handleLaunchQuickTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      navigate(`/playground/${selectedEngine}?url=${encodeURIComponent(quickUrl.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#0b192c]">
      {/* Hero Banner */}
      <div className="border-b border-[#e2e8f0] bg-white pt-12 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-semibold text-emerald-800">
                <Terminal className="h-3.5 w-3.5" />
                <span>Interactive Developer Playground</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0b192c]">
                API & Engine Test Sandbox
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Test real-time audit queries, inspect telemetry JSON payloads, generate cURL code, and validate production endpoints with live Python execution containers.
              </p>
            </div>

            {/* Quota Indicator */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm space-y-2 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                <span>Active Quota Tier</span>
                <span className="font-bold uppercase text-[#0b192c]">{rateStatus.tier}</span>
              </div>
              <div className="text-2xl font-black text-[#0b192c]">
                {rateStatus.isUnlimited ? '∞ Unlimited' : `${rateStatus.remaining} / ${rateStatus.limit}`}
              </div>
              <p className="text-[11px] text-gray-500">
                {rateStatus.isUnlimited 
                  ? 'Superadmin unrestricted bypass' 
                  : 'Daily scans remaining for this session'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <PlaygroundNavSidebar />

          {/* Catalog & Quick Launch */}
          <div className="flex-1 space-y-10 min-w-0">
            
            {/* Quick Test Launch Form */}
            <section className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span>Launch Live Diagnostic Test</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Select an engine console and execute a live scan against any public domain or Git repository.
                </p>
              </div>

              <form onSubmit={handleLaunchQuickTest} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={quickUrl}
                    onChange={(e) => setQuickUrl(e.target.value)}
                    placeholder="Enter target URL (e.g. https://example.com)"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-mono text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="w-full sm:w-60">
                  <select
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-gray-800 focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    {PLAYGROUND_ENGINES.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name} ({eng.cost} cr)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#0b192c] px-6 py-3 text-sm font-bold text-white hover:bg-[#152238] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
                >
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>Launch Console</span>
                </button>
              </form>
            </section>

            {/* Diagnostic Engines Sandbox Catalog */}
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0b192c]">Interactive Engine Consoles</h2>
                <p className="text-xs text-gray-500 mt-0.5">Click any engine to open its dedicated interactive test sandbox</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {PLAYGROUND_ENGINES.map((engine) => {
                  const Icon = engine.icon;
                  return (
                    <Link
                      key={engine.id}
                      to={`/playground/${engine.id}`}
                      className="group rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover:shadow-md hover:border-[#415a77]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-[#0b192c]">
                            <Icon className="h-5 w-5 text-[#415a77] group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {engine.category}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#0b192c] group-hover:text-sky-700 transition-colors">
                          {engine.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          Dedicated real-time testing console for {engine.name.toLowerCase()} telemetry.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="font-mono text-gray-500">
                          Cost: <strong>{engine.cost} scan credit</strong>
                        </span>
                        <span className="font-bold text-sky-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Open Console</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
