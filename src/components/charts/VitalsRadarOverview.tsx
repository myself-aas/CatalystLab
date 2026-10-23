import React from 'react';
import { Layers, Lock, Eye, Bot, Activity, Leaf, Server, Search } from 'lucide-react';
import type { ParsedTelemetryData } from '../../utils/telemetryParser';

interface VitalsRadarOverviewProps {
  telemetry: ParsedTelemetryData;
  targetDomain: string;
}

/**
 * One tile per engine. A tile shows the reading that engine printed, or says
 * the engine has not run for this target — it never converts one reading into
 * another engine's score.
 */
export const VitalsRadarOverview: React.FC<VitalsRadarOverviewProps> = React.memo(({ telemetry }) => {
  const tiles = [
    {
      name: 'Core DOM & health',
      icon: Layers,
      reading: telemetry.health?.score != null ? `${telemetry.health.score}/100` : null,
    },
    {
      name: 'Security headers',
      icon: Lock,
      reading: telemetry.security?.score != null ? `${telemetry.security.score}/100` : null,
    },
    {
      name: 'Accessibility',
      icon: Eye,
      reading:
        telemetry.accessibility?.altTextCoveragePct != null
          ? `${telemetry.accessibility.altTextCoveragePct}% alt text`
          : null,
    },
    {
      name: 'AI crawler readiness',
      icon: Bot,
      reading: telemetry.aiReadiness?.score != null ? `${telemetry.aiReadiness.score}/100` : null,
    },
    {
      name: 'Edge latency',
      icon: Activity,
      reading: telemetry.latency?.originTtfbMs != null ? `${telemetry.latency.originTtfbMs} ms TTFB` : null,
    },
    {
      name: 'Carbon per visit',
      icon: Leaf,
      reading:
        telemetry.eco?.emissionsPerVisitGrams != null
          ? `${telemetry.eco.emissionsPerVisitGrams.toFixed(4)} g CO2e`
          : null,
    },
    {
      name: 'Platform stack',
      icon: Server,
      reading: telemetry.migration?.detectedStack ?? null,
    },
    {
      name: 'LLM citation readiness',
      icon: Search,
      reading: telemetry.llmo?.score != null ? `${telemetry.llmo.score}/100` : null,
    },
  ];

  const measuredCount = tiles.filter((tile) => tile.reading !== null).length;

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 text-foreground">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-base font-semibold text-foreground">The eight engine readings</h3>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Each tile repeats the figure its engine printed for this run. An engine that did not run,
            or could not reach the target, shows nothing rather than a placeholder.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {measuredCount} of {tiles.length} engine readings present
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ name, icon: Icon, reading }) => (
          <div key={name} className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
              <span className="text-xs">{name}</span>
            </div>
            <div className="mt-3 font-mono text-lg font-semibold tabular-nums text-foreground">
              {reading ?? <span className="text-sm font-normal text-muted-foreground">Not measured</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
