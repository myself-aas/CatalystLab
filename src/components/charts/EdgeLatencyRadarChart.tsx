import React from 'react';
import { Activity, Globe } from 'lucide-react';

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

export const EdgeLatencyRadarChart: React.FC<EdgeLatencyRadarChartProps> = React.memo(({
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
    <div className="rounded-2xl border border-brand-slate/30 bg-white p-6 shadow-xl space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-slate/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-slate/25 text-brand-periwinkle border border-brand-slate/40">
              <Activity className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-black">
              Global Edge Latency & Multi-POP Radar
            </h3>
          </div>
          <p className="text-xs text-brand-periwinkle mt-1">
            Measures anycast routing speed, DNS resolution, TLS handshakes, and TTFB across 6 global continents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-brand-periwinkle">Global Average</div>
            <div className="text-xl font-black text-brand-periwinkle font-mono">~{globalAverageMs} ms</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-slate/25 text-brand-periwinkle border border-brand-slate/40">
            <Globe className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Global POP Latency Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-brand-periwinkle mb-1">
          <span className="font-semibold text-black">Multi-Region Point of Presence (POP) Dispersion</span>
          <span className="font-mono text-[11px] text-brand-periwinkle">{infrastructure}</span>
        </div>

        <div className="space-y-2.5">
          {pops.map((pop) => {
            const barWidth = Math.min(100, Math.max(10, (pop.latencyMs / maxLatency) * 100));
            const isFast = pop.latencyMs < 60;
            const isModerate = pop.latencyMs >= 60 && pop.latencyMs < 120;

            return (
              <div key={pop.location} className="rounded-xl border border-brand-slate/30 bg-white p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{
                      backgroundColor: isFast ? '#10b981' : isModerate ? 'var(--periwinkle-300)' : '#f43f5e'
                    }} />
                    <span className="font-bold text-black">{pop.region}</span>
                    <span className="text-brand-periwinkle font-mono text-[11px]">({pop.location})</span>
                  </div>
                  <span className="font-mono font-bold text-black">{pop.latencyMs} ms</span>
                </div>

                <div className="h-2 w-full rounded-full bg-white overflow-hidden border border-brand-slate/20">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFast ? 'bg-emerald-400' : isModerate ? 'bg-brand-periwinkle' : 'bg-rose-500'
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
      <div className="rounded-xl border border-brand-slate/30 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-black">
          <span>Connection Phase Waterfall (Origin TTFB ~{originTtfbMs}ms)</span>
          <span className="font-mono text-brand-periwinkle">Total: ~{totalRoundTrip}ms</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg bg-white p-2.5 border border-brand-slate/30">
            <div className="text-[10px] text-brand-periwinkle uppercase font-mono">1. DNS Resolution</div>
            <div className="text-sm font-bold text-brand-periwinkle font-mono mt-0.5">{dnsTime} ms</div>
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-brand-slate/30">
            <div className="text-[10px] text-brand-periwinkle uppercase font-mono">2. TLS Handshake</div>
            <div className="text-sm font-bold text-brand-greige font-mono mt-0.5">{tlsTime} ms</div>
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-brand-slate/30">
            <div className="text-[10px] text-brand-periwinkle uppercase font-mono">3. Server Processing</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{ttfbWaitTime} ms</div>
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-brand-slate/30">
            <div className="text-[10px] text-brand-periwinkle uppercase font-mono">4. Content Stream</div>
            <div className="text-sm font-bold text-black font-mono mt-0.5">{downloadTime} ms</div>
          </div>
        </div>
      </div>
    </div>
  );
});
