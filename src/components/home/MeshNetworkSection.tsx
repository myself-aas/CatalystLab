import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { EdgeMeshGlobe } from '../ui/edge-mesh-globe';
import { 
  EDGE_POPS, 
  EdgePoP, 
  PoPStatus, 
  getPoPStats 
} from '../../lib/edge/pops';
import { useTelemetryHUDStore } from '../../store/useTelemetryHUDStore';
import { 
  Globe2, 
  Radio, 
  Zap, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  ChevronRight,
  Lock,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MeshNetworkSection: React.FC = () => {
  const stats = useMemo(() => getPoPStats(), []);
  const focusedPoP = useTelemetryHUDStore((s) => s.focusedPoP);
  const setFocusedPoP = useTelemetryHUDStore((s) => s.setFocusedPoP);

  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Top leaderboard PoPs
  const leaderboardPoPs = useMemo(() => {
    let list = [...EDGE_POPS];
    if (selectedContinent !== 'all') {
      list = list.filter((p) => {
        if (selectedContinent === 'Americas') return p.region.includes('US') || p.region.includes('SA') || p.region.includes('CA');
        if (selectedContinent === 'EMEA') return p.region.includes('EU') || p.region.includes('ME') || p.region.includes('Africa');
        if (selectedContinent === 'APAC') return p.region.includes('AP') || p.region.includes('Oceania');
        return true;
      });
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter((p) => p.location.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.region.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.ttfbMs - b.ttfbMs);
  }, [selectedContinent, filterQuery]);

  const handleTriggerGlobalProbe = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
    }, 650);
  };

  const activePoP = focusedPoP || EDGE_POPS[0];

  return (
    <section 
      id="mesh-network-section" 
      className="py-16 lg:py-24 bg-primary text-primary-foreground relative overflow-hidden border-b border-border"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(0,180,255,0.06)_0%,transparent_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <LazyReveal direction="up" className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono text-cyan-300 mb-3 backdrop-blur-md">
              <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>Phase 5 • Synchronous Edge Mesh Radar</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-primary-foreground">
              42-Node Global Anycast Mesh
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mt-3 leading-relaxed font-normal">
              Continuous sub-20ms edge verification. Every health audit dispatches synchronous TCP/TLS handshakes and HTTP/3 QUIC probes to nearest cloud gateways.
            </p>
          </LazyReveal>

          {/* Quick Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTriggerGlobalProbe}
              disabled={isSynthesizing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-foreground text-xs sm:text-sm font-mono font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Probing 42 Mesh Nodes...' : 'Probe All 42 Nodes'}</span>
            </button>

            <div className="flex items-center gap-1 bg-foreground/80 p-1 rounded-xl border border-border backdrop-blur-md">
              {['all', 'Americas', 'EMEA', 'APAC'].map((cont) => (
                <button
                  key={cont}
                  type="button"
                  onClick={() => setSelectedContinent(cont)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer capitalize ${
                    selectedContinent === cont
                      ? 'bg-blue-600 text-primary-foreground font-bold shadow-md'
                      : 'text-muted-foreground hover:text-primary-foreground hover:bg-primary-hover'
                  }`}
                >
                  {cont}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Core Mesh Interactive Layout: 3D Globe + Regional TTFB Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: 3D WebGL Edge Mesh Globe */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            <div className="w-full bg-foreground/60 border border-border/80 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* Top Mesh HUD metrics */}
              <div className="w-full flex items-center justify-between border-b border-border/80 pb-3 mb-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <span className="font-bold">ACTIVE ROUTING MATRIX</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>P95 TTFB: <strong className="text-cyan-400 font-bold">{stats.p95Latency}ms</strong></span>
                  <span>Optimal: <strong className="text-emerald-400 font-bold">{stats.optimalCount}/42</strong></span>
                </div>
              </div>

              {/* 3D WebGL Globe instance (panel variant) */}
              <div className="w-full flex items-center justify-center py-2">
                <EdgeMeshGlobe
                  variant="panel"
                  interactive={true}
                  autoSpin={true}
                  showInspector={true}
                  showChips={true}
                  showControls={true}
                  onSelectPoP={(pop) => setFocusedPoP(pop)}
                />
              </div>

              {/* Active PoP Bottom Bar */}
              <div className="w-full mt-2 pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-muted-foreground">Focused Anycast Node:</span>
                  <span className="text-cyan-300 font-bold">{activePoP.code} • {activePoP.location}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span>Handshake: <strong className="text-emerald-400">{activePoP.tlsRtt}</strong></span>
                  <span>HTTP/3: <strong className="text-cyan-400">{activePoP.http3 ? 'Enabled' : 'Disabled'}</strong></span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Regional TTFB Leaderboard & SLA Insights */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Real-time Regional Leaderboard Container */}
            <div className="rounded-3xl border border-border bg-foreground/80 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-bold font-mono text-primary-foreground">REGIONAL TTFB LEADERBOARD</h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">{leaderboardPoPs.length} Nodes</span>
              </div>

              {/* Filter search input */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Filter by city, code, or region..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full rounded-xl bg-primary/90 border border-border px-3 py-2 text-xs font-mono text-primary-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Scrollable Leaderboard List */}
              <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1 custom-scrollbar">
                {leaderboardPoPs.map((pop, idx) => {
                  const isSelected = activePoP.id === pop.id;
                  return (
                    <div
                      key={pop.id}
                      onClick={() => setFocusedPoP(pop)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/40 text-primary-foreground'
                          : 'bg-primary/50 border-border/80 hover:bg-primary hover:border-border text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{idx + 1}</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted border border-border text-[11px] font-mono font-bold text-cyan-300 shrink-0">
                          {pop.code}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-foreground truncate">{pop.location}</div>
                          <div className="text-[10px] font-mono text-muted-foreground truncate">{pop.region}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-emerald-400">{pop.ttfbMs} ms</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{pop.tlsRtt}</div>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick SLA & Compliance Badge */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-foreground/60 p-3.5 backdrop-blur-md flex flex-col justify-between">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>SLA GUARANTEE</span>
                </div>
                <div className="text-lg font-bold font-mono text-primary-foreground">99.99% Edge Uptime</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">BGP Anycast failover &lt; 50ms</div>
              </div>

              <div className="rounded-2xl border border-border bg-foreground/60 p-3.5 backdrop-blur-md flex flex-col justify-between">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-1">
                  <Leaf className="h-4 w-4 text-teal-400" />
                  <span>GREEN CDN INDEX</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">100% Zero-Carbon</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Renewable edge data centers</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default MeshNetworkSection;
