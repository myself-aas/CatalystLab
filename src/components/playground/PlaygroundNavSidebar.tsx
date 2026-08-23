import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ChevronRight,
  Code2
} from 'lucide-react';
import { ENGINES_MAP } from '../../data/engines';

export const PLAYGROUND_ENGINES = [
  { id: 'master', name: 'Master Orchestrator', category: 'Full Suite', icon: Layers, cost: 3 },
  { id: 'health', name: 'Health & Web Vitals', category: 'Performance', icon: Activity, cost: 1 },
  { id: 'latency', name: 'Edge Latency Radar', category: 'Network', icon: Globe, cost: 1 },
  { id: 'ssl', name: 'SSL / TLS Verification', category: 'Security', icon: Lock, cost: 1 },
  { id: 'headers', name: 'Security Headers & CSP', category: 'Security', icon: ShieldCheck, cost: 1 },
  { id: 'dns', name: 'DNS & Anycast Routing', category: 'Network', icon: Server, cost: 1 },
  { id: 'eco', name: 'EcoHolo Carbon Audit', category: 'Sustainability', icon: Leaf, cost: 1 },
  { id: 'ai_ready', name: 'LlmKinase AI Readiness', category: 'AI & Ingestion', icon: Cpu, cost: 1 },
  { id: 'repo', name: 'GitLygase Repo Scanner', category: 'Code Hygiene', icon: Terminal, cost: 1 },
  { id: 'compliance', name: 'RiskProtease DevSecOps', category: 'Compliance', icon: ShieldCheck, cost: 1 },
  { id: 'migration', name: 'SynthShift PAR Migration', category: 'Architecture', icon: GitBranch, cost: 1 },
  { id: 'llmo', name: 'AllosterSearch LLMO', category: 'Discovery', icon: Sparkles, cost: 1 },
];

export const PlaygroundNavSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-3">
          Playground Hub
        </h4>
        <nav className="space-y-1">
          <Link
            to="/playground"
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              location.pathname === '/playground'
                ? 'bg-[#0b192c] text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span>Sandbox Catalog</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </Link>

          <Link
            to="/api-reference"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-sky-600" />
              <span>API Reference Docs</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </nav>
      </div>

      {/* Engine Consoles List */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
            Engine Consoles
          </h4>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
            {PLAYGROUND_ENGINES.length}
          </span>
        </div>

        <nav className="space-y-1">
          {PLAYGROUND_ENGINES.map((engine) => {
            const path = `/playground/${engine.id}`;
            const active = location.pathname === path;
            const Icon = engine.icon;

            return (
              <Link
                key={engine.id}
                to={path}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#0b192c] text-white font-bold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-emerald-400' : 'text-[#415a77]'}`} />
                  <span className="truncate">{engine.name}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  active ? 'bg-gray-100 text-black' : 'bg-gray-100 text-gray-600'
                }`}>
                  {engine.cost} credit
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
