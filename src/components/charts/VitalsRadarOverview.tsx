import React from 'react';
import { Layers, Lock, Eye, Bot, Activity, Leaf, Server, Search, CheckCircle2 } from 'lucide-react';
import type { ParsedTelemetryData } from '../../utils/telemetryParser';

interface VitalsRadarOverviewProps {
  telemetry: ParsedTelemetryData;
  targetDomain: string;
}

export const VitalsRadarOverview: React.FC<VitalsRadarOverviewProps> = ({ telemetry, targetDomain }) => {
  const dimensions = [
    { name: 'Core DOM Depth', score: telemetry.health.score, icon: Layers, color: '#38bdf8' },
    { name: 'OWASP Security', score: telemetry.security.score, icon: Lock, color: '#34d399' },
    { name: 'WCAG Accessibility', score: telemetry.accessibility.score, icon: Eye, color: '#818cf8' },
    { name: 'AI Crawler Readiness', score: telemetry.aiReadiness.score, icon: Bot, color: '#06b6d4' },
    { name: 'Global Edge Latency', score: Math.max(30, Math.min(100, 100 - Math.round(telemetry.latency.globalAverageMs * 0.4))), icon: Activity, color: '#f59e0b' },
    { name: 'Eco-Carbon Footprint', score: telemetry.eco.rating === 'A+' ? 98 : telemetry.eco.rating === 'A' ? 90 : 75, icon: Leaf, color: '#10b981' },
    { name: 'Platform Portability', score: telemetry.migration.portabilityScore, icon: Server, color: '#ec4899' },
    { name: 'LLMO Citations', score: telemetry.llmo.score, icon: Search, color: '#a855f7' }
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Executive Vitals Overview: 8-Engine Telemetry Spectrum</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Holistic diagnostic score card calibrated across client, edge network, security layer, and AI agent vectors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Composite Score:</span>
          <span className="text-xl font-black text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/30">
            {telemetry.overallScore}/100 [{telemetry.grade}]
          </span>
        </div>
      </div>

      {/* Grid of 8 Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          const isHigh = dim.score >= 85;
          const isMed = dim.score >= 70 && dim.score < 85;

          return (
            <div
              key={dim.name}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  style={{
                    backgroundColor: `${dim.color}15`,
                    borderColor: `${dim.color}35`,
                    color: dim.color
                  }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-mono text-sm font-black text-white">{dim.score}/100</span>
              </div>

              <div className="text-xs font-bold text-slate-200 truncate">{dim.name}</div>

              {/* Mini progress bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden mt-2.5">
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
};
