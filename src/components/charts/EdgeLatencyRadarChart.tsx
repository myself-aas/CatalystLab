import React from 'react';
<<<<<<< HEAD
import { Activity, Globe } from 'lucide-react';
=======
import { Activity, Globe, Zap, Server, ShieldCheck } from 'lucide-react';
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

interface EdgeLatencyRadarChartProps {
  originTtfbMs: number;
  globalAverageMs: number;
  infrastructure: string;
  pops: {
    region: string;
    location: string;
    latencyMs: number;
    status: 'optimal' | 'moderate' | 'slow';
  }[];
}

export const EdgeLatencyRadarChart: React.FC<EdgeLatencyRadarChartProps> = ({
  originTtfbMs,
  globalAverageMs,
  infrastructure,
  pops
}) => {
  const maxLatency = Math.max(...pops.map(p => p.latencyMs), 150);

  // Simulated waterfall connection phases based on TTFB
  const dnsTime = Math.max(4, Math.round(originTtfbMs * 0.12));
  const tlsTime = Math.max(12, Math.round(originTtfbMs * 0.28));
  const ttfbWaitTime = Math.max(16, Math.round(originTtfbMs * 0.45));
  const downloadTime = Math.max(8, Math.round(originTtfbMs * 0.15));
  const totalRoundTrip = dnsTime + tlsTime + ttfbWaitTime + downloadTime;

  return (
<<<<<<< HEAD
    <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-6 shadow-xl space-y-6 text-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40">
              <Activity className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[#f8fafc]">
              Global Edge Latency & Multi-POP Radar
            </h3>
          </div>
          <p className="text-xs text-[#c5d3e8] mt-1">
=======
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Global Edge Latency & Multi-POP Radar
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Measures anycast routing speed, DNS resolution, TLS handshakes, and TTFB across 6 global continents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
<<<<<<< HEAD
            <div className="text-xs font-semibold text-[#c5d3e8]">Global Average</div>
            <div className="text-xl font-black text-[#c5d3e8] font-mono">~{globalAverageMs} ms</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40">
=======
            <div className="text-xs font-semibold text-slate-400">Global Average</div>
            <div className="text-xl font-black text-amber-400 font-mono">~{globalAverageMs} ms</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            <Globe className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Global POP Latency Bars */}
      <div className="space-y-3">
<<<<<<< HEAD
        <div className="flex items-center justify-between text-xs text-[#c5d3e8] mb-1">
          <span className="font-semibold text-[#f8fafc]">Multi-Region Point of Presence (POP) Dispersion</span>
          <span className="font-mono text-[11px] text-[#c5d3e8]">{infrastructure}</span>
=======
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold text-slate-300">Multi-Region Point of Presence (POP) Dispersion</span>
          <span className="font-mono text-[11px] text-cyan-400">{infrastructure}</span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        </div>

        <div className="space-y-2.5">
          {pops.map((pop) => {
            const barWidth = Math.min(100, Math.max(10, (pop.latencyMs / maxLatency) * 100));
            const isFast = pop.latencyMs < 60;
            const isModerate = pop.latencyMs >= 60 && pop.latencyMs < 120;

            return (
<<<<<<< HEAD
              <div key={pop.location} className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{
                      backgroundColor: isFast ? '#10b981' : isModerate ? '#c5d3e8' : '#f43f5e'
                    }} />
                    <span className="font-bold text-[#f8fafc]">{pop.region}</span>
                    <span className="text-[#c5d3e8] font-mono text-[11px]">({pop.location})</span>
                  </div>
                  <span className="font-mono font-bold text-[#f8fafc]">{pop.latencyMs} ms</span>
                </div>

                <div className="h-2 w-full rounded-full bg-[#0b192c] overflow-hidden border border-[#415a77]/20">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFast ? 'bg-emerald-400' : isModerate ? 'bg-[#c5d3e8]' : 'bg-rose-500'
=======
              <div key={pop.location} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{
                      backgroundColor: isFast ? '#10b981' : isModerate ? '#f59e0b' : '#f43f5e'
                    }} />
                    <span className="font-bold text-white">{pop.region}</span>
                    <span className="text-slate-500 font-mono text-[11px]">({pop.location})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">{pop.latencyMs} ms</span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFast ? 'bg-emerald-400' : isModerate ? 'bg-amber-400' : 'bg-rose-500'
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection Lifecycle Waterfall */}
<<<<<<< HEAD
      <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#f8fafc]">
          <span>Connection Phase Waterfall (Origin TTFB ~{originTtfbMs}ms)</span>
          <span className="font-mono text-[#c5d3e8]">Total: ~{totalRoundTrip}ms</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg bg-[#0b192c] p-2.5 border border-[#415a77]/30">
            <div className="text-[10px] text-[#c5d3e8] uppercase font-mono">1. DNS Resolution</div>
            <div className="text-sm font-bold text-[#c5d3e8] font-mono mt-0.5">{dnsTime} ms</div>
          </div>

          <div className="rounded-lg bg-[#0b192c] p-2.5 border border-[#415a77]/30">
            <div className="text-[10px] text-[#c5d3e8] uppercase font-mono">2. TLS Handshake</div>
            <div className="text-sm font-bold text-[#ebe9e6] font-mono mt-0.5">{tlsTime} ms</div>
          </div>

          <div className="rounded-lg bg-[#0b192c] p-2.5 border border-[#415a77]/30">
            <div className="text-[10px] text-[#c5d3e8] uppercase font-mono">3. Server Processing</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{ttfbWaitTime} ms</div>
          </div>

          <div className="rounded-lg bg-[#0b192c] p-2.5 border border-[#415a77]/30">
            <div className="text-[10px] text-[#c5d3e8] uppercase font-mono">4. Content Stream</div>
            <div className="text-sm font-bold text-[#f8fafc] font-mono mt-0.5">{downloadTime} ms</div>
=======
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
          <span>Connection Phase Waterfall (Origin TTFB ~{originTtfbMs}ms)</span>
          <span className="font-mono text-cyan-400">Total: ~{totalRoundTrip}ms</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono">1. DNS Resolution</div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{dnsTime} ms</div>
          </div>

          <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono">2. TLS Handshake</div>
            <div className="text-sm font-bold text-indigo-400 font-mono mt-0.5">{tlsTime} ms</div>
          </div>

          <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono">3. Server Processing</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{ttfbWaitTime} ms</div>
          </div>

          <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono">4. Content Stream</div>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">{downloadTime} ms</div>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          </div>
        </div>
      </div>
    </div>
  );
};
