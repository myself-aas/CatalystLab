import { EngineInput } from "../../components/common/EngineInput";
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Banner */}
      <div className="border-b border-border bg-background pt-12 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-semibold text-emerald-800">
                <Terminal className="h-3.5 w-3.5" />
                <span>Interactive Developer Playground</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                API & Engine Test Sandbox
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Test real-time audit queries, inspect telemetry JSON payloads, generate cURL code, and validate production endpoints with live Python execution containers.
              </p>
            </div>

            {/* Quota Indicator */}
            <div className="rounded-2xl border border-border bg-muted p-5 shadow-sm space-y-2 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Active Quota Tier</span>
                <span className="font-bold uppercase text-foreground">{rateStatus.tier}</span>
              </div>
              <div className="text-2xl font-black text-foreground">
                {rateStatus.isUnlimited ? '∞ Unlimited' : `${rateStatus.remaining} / ${rateStatus.limit}`}
              </div>
              <p className="text-[11px] text-muted-foreground">
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
            <section className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span>Launch Live Diagnostic Test</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Select an engine console and execute a live scan against any public domain or Git repository.
                </p>
              </div>

              <div className="space-y-3 max-w-2xl mx-auto">
                <div className="w-full">
                  <select
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    {PLAYGROUND_ENGINES.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name} ({eng.cost} cr)
                      </option>
                    ))}
                  </select>
                </div>
                <EngineInput 
                  value={quickUrl}
                  onChange={setQuickUrl}
                  onSubmit={handleLaunchQuickTest}
                  buttonText="Launch Console"
                  placeholder="@catalystlab-search: (https://"
                />
              </div>
            </section>

            {/* Diagnostic Engines Sandbox Catalog */}
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Interactive Engine Consoles</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Click any engine to open its dedicated interactive test sandbox</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {PLAYGROUND_ENGINES.map((engine) => {
                  const Icon = engine.icon;
                  return (
                    <Link
                      key={engine.id}
                      to={`/playground/${engine.id}`}
                      className="group rounded-3xl border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-border transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-foreground">
                            <Icon className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-accent text-muted-foreground">
                            {engine.category}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-foreground group-hover:text-sky-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {engine.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          Dedicated real-time testing console for {engine.name.toLowerCase()} telemetry.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground">
                          Cost: <strong>{engine.cost} scan credit</strong>
                        </span>
                        <span className="font-bold text-sky-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
