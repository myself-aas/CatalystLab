import React from 'react';
import { Layers, Lock, Eye, Bot, Activity, Leaf, Server, Search } from 'lucide-react';
import type { ParsedTelemetryData } from '../../utils/telemetryParser';

interface VitalsRadarOverviewProps {
  telemetry: ParsedTelemetryData;
  targetDomain: string;
}

export const VitalsRadarOverview: React.FC<VitalsRadarOverviewProps> = React.memo(({ telemetry, targetDomain }) => {
  const dimensions = [
    { name: 'Core DOM Depth', score: telemetry.health.score, icon: Layers, color: '#415a77' },
    { name: 'OWASP Security', score: telemetry.security.score, icon: Lock, color: '#10b981' },
    { name: 'WCAG Accessibility', score: telemetry.accessibility.score, icon: Eye, color: '#c5d3e8' },
    { name: 'AI Crawler Readiness', score: telemetry.aiReadiness.score, icon: Bot, color: '#9cb3d4' },
    { name: 'Global Edge Latency', score: Math.max(30, Math.min(100, 100 - Math.round(telemetry.latency.globalAverageMs * 0.4))), icon: Activity, color: '#ebe9e6' },
    { name: 'Eco-Carbon Footprint', score: telemetry.eco.rating === 'A+' ? 98 : telemetry.eco.rating === 'A' ? 90 : 75, icon: Leaf, color: '#10b981' },
    { name: 'Platform Portability', score: telemetry.migration.portabilityScore, icon: Server, color: '#52718e' },
    { name: 'LLMO Citations', score: telemetry.llmo.score, icon: Search, color: '#68829e' }
  ];

  return (
    <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-6 shadow-xl space-y-6 text-[#f8fafc]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-5">
        <div>
          <h3 className="text-base font-bold text-[#f8fafc] flex items-center gap-2">
            <span>Executive Vitals Overview: 8-Engine Telemetry Spectrum</span>
          </h3>
          <p className="text-xs text-[#c5d3e8] mt-1">
            Holistic diagnostic score card calibrated across client, edge network, security layer, and AI agent vectors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#c5d3e8]">Composite Score:</span>
          <span className="text-xl font-black text-[#c5d3e8] bg-[#415a77]/25 px-3 py-1 rounded-xl border border-[#415a77]/40">
            {telemetry.overallScore}/100 [{telemetry.grade}]
          </span>
        </div>
      </div>

      {/* Grid of 8 Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {dimensions.map((dim) => {
          const Icon = dim.icon;

          return (
            <div
              key={dim.name}
              className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4 transition-all hover:border-[#415a77]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  style={{
                    backgroundColor: `${dim.color}20`,
                    borderColor: `${dim.color}40`,
                    color: dim.color
                  }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-mono text-sm font-black text-[#f8fafc]">{dim.score}/100</span>
              </div>

              <div className="text-xs font-bold text-[#f8fafc] truncate">{dim.name}</div>

              {/* Mini progress bar */}
              <div className="h-1.5 w-full rounded-full bg-[#0b192c] overflow-hidden mt-2.5 border border-[#415a77]/20">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${dim.score}%`,
                    backgroundColor: dim.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
