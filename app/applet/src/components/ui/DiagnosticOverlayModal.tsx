import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Activity, ArrowRight, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

interface DiagnosticOverlayModalProps {
  card: any;
  onClose: () => void;
}

export const DiagnosticOverlayModal: React.FC<DiagnosticOverlayModalProps> = ({ card, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'json' | 'chart'>('split');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mockTimeSeriesData = [
    { time: '00:00', latency: 42, score: 98, load: 12 },
    { time: '04:00', latency: 38, score: 99, load: 15 },
    { time: '08:00', latency: 24, score: 100, load: 28 },
    { time: '12:00', latency: 18, score: 99.4, load: 45 },
    { time: '16:00', latency: 22, score: 99.8, load: 39 },
    { time: '20:00', latency: 31, score: 99.1, load: 22 },
    { time: '24:00', latency: 19, score: 100, load: 14 }
  ];

  const rawJsonData = {
    diagnostic_engine: card?.badge || "CatalystLab Engine v4.2",
    audit_id: `aud_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    target_domain: "https://www.catalystlab.tech",
    status_code: 200,
    metrics: {
      primary_metric: card?.metric || "18ms",
      metric_label: card?.metricLabel || "Edge TTFB",
      score: card?.score || "99.4",
      packet_loss_pct: 0.0,
      tls_version: "TLS 1.3 0-RTT",
      global_pops_probed: 42
    },
    ast_security_headers: {
      content_security_policy: "enforced",
      strict_transport_security: "max-age=63072000; includeSubDomains; preload",
      x_frame_options: "DENY",
      x_content_type_options: "nosniff"
    },
    ai_readiness_llmo: {
      llms_txt_status: "verified",
      entity_graph_nodes: 1420,
      perplexity_crawl_rate: "+140%"
    },
    eco_carbon: {
      grams_co2_per_view: "0.08g",
      green_hosting_verified: true
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rawJsonData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Modal Container */}
      <div className="relative w-full max-w-7xl h-[94vh] bg-slate-950 text-slate-100 rounded-[2.5rem] border border-white/25 shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  {card?.badge || 'Telemetry Active'}
                </span>
                <span className="text-xs text-white/50 font-mono">• Live Split View</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                {card?.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'split' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-white/70 hover:text-white'}`}
              >
                Split View
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'json' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-white/70 hover:text-white'}`}
              >
                Raw JSON
              </button>
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'chart' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-white/70 hover:text-white'}`}
              >
                Graphical Charts
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Telemetry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white hover:text-rose-300 transition-all cursor-pointer border border-white/20"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Split-View Body Content */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-slate-950">
          
          {/* Left Column: Raw Telemetry JSON Data */}
          {(activeTab === 'split' || activeTab === 'json') && (
            <div className={`flex flex-col h-full border-r border-white/10 bg-slate-900/40 ${activeTab === 'json' ? 'col-span-2' : ''}`}>
              <div className="px-6 py-3 bg-slate-900/60 border-b border-white/10 flex items-center justify-between font-mono text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span>Raw Telemetry JSON Stream</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">200 OK</span>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow p-6 overflow-y-auto font-mono text-xs sm:text-sm text-cyan-200/90 bg-slate-950/80 leading-relaxed selection:bg-cyan-500 selection:text-slate-950">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(rawJsonData, null, 2)}
                </pre>
              </div>

              <div className="p-4 bg-slate-900/50 border-t border-white/10 font-mono text-xs text-white/60 flex items-center justify-between">
                <div>Buffer: 1.4KB • Schema v4.2</div>
                <div className="text-emerald-400 font-bold">● Synchronous Stream Live</div>
              </div>
            </div>
          )}

          {/* Right Column: Detailed Graphical Visualization */}
          {(activeTab === 'split' || activeTab === 'chart') && (
            <div className={`flex flex-col h-full bg-slate-950 ${activeTab === 'chart' ? 'col-span-2' : ''}`}>
              <div className="px-6 py-3 bg-slate-900/60 border-b border-white/10 flex items-center justify-between font-mono text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span>Graphical Telemetry & Latency Trends</span>
                </div>
                <div className="text-emerald-400 font-bold font-mono">
                  {card?.metric} {card?.metricLabel}
                </div>
              </div>

              <div className="flex-grow p-6 overflow-y-auto space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono uppercase text-white/50">Primary Metric</span>
                    <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{card?.metric || '18ms'}</div>
                    <span className="text-xs text-white/70">{card?.metricLabel}</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono uppercase text-white/50">Compliance Score</span>
                    <div className="text-2xl font-black font-mono text-cyan-400 mt-1">{card?.score || '99.4'}</div>
                    <span className="text-xs text-white/70">Hardened Status</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono uppercase text-white/50">Global PoPs</span>
                    <div className="text-2xl font-black font-mono text-amber-400 mt-1">42 / 42</div>
                    <span className="text-xs text-white/70">Active Nodes</span>
                  </div>
                </div>

                {/* Recharts Area Chart */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                    <span>Edge Latency & Response Time (24h)</span>
                    <span className="text-xs font-mono text-emerald-400">Avg: 24.5ms</span>
                  </h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockTimeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="latency" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recharts Bar Chart */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-4">Node Load Distribution (%)</h3>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockTimeSeriesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                        />
                        <Bar dataKey="load" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              <div className="p-4 bg-slate-900/50 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                <span className="text-white/60">Visualization rendered via Recharts v3</span>
                <span className="text-cyan-400 font-bold">100% Real-Time Synchronized</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-white/60 font-mono">
            {card?.description}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20"
            >
              Close Overlay
            </button>
            <button
              onClick={() => { alert(`Deployment patch dispatched successfully for ${card?.title}!`); onClose(); }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2"
            >
              <span>Deploy Production Patch</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DiagnosticOverlayModal;
