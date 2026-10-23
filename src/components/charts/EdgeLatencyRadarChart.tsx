import React from 'react';
import { Activity } from 'lucide-react';
import type { LatencySection } from '../../utils/telemetryParser';

interface EdgeLatencyRadarChartProps {
  latency: LatencySection;
}

export const EdgeLatencyRadarChart: React.FC<EdgeLatencyRadarChartProps> = React.memo(({ latency }) => {
  const ttfb = latency.originTtfbMs;

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">Origin response time</h3>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              One HEAD request timed from the server that ran this audit. Regional point-of-presence
              timings need probes in each region, so they are not shown.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Measured round trip</div>
          <div className="font-mono text-xl font-semibold tabular-nums text-foreground">
            {ttfb != null ? `${ttfb} ms` : 'Not measured'}
          </div>
          {latency.score != null && (
            <div className="mt-1 text-xs text-muted-foreground">Latency score {latency.score}/100</div>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs text-muted-foreground">Probing host</dt>
          <dd className="mt-1 text-sm text-foreground">CatalystLab server, single location</dd>
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs text-muted-foreground">Reported infrastructure</dt>
          <dd className="mt-1 font-mono text-sm text-foreground">{latency.infrastructure ?? 'Not reported'}</dd>
        </div>
      </dl>

      <p className="text-sm text-muted-foreground">
        A single probe is a single sample: it shows how quickly one host got a response, not a
        global average.
      </p>
    </div>
  );
});
