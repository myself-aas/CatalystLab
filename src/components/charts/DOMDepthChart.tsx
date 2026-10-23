import React from 'react';
import { Layers } from 'lucide-react';
import type { HealthSection } from '../../utils/telemetryParser';

interface DOMDepthChartProps {
  health: HealthSection;
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">{value}</div>
      {note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>}
    </div>
  );
}

export const DOMDepthChart: React.FC<DOMDepthChartProps> = React.memo(({ health }) => {
  const totalTags = health.tagMix?.reduce((sum, entry) => sum + entry.count, 0) ?? 0;

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 text-foreground">
      <div className="flex items-start gap-3 border-b border-border pb-5">
        <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          <Layers className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">DOM size, nesting and payload</h3>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Counted from the served HTML by the health engine. Sizes are the raw markup the server
            returned, not a full-page waterfall.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric
          label="DOM elements"
          value={health.domElementsCount != null ? health.domElementsCount.toLocaleString() : 'Not measured'}
          note="Engine flags a page above 1,500 elements"
        />
        <Metric
          label="Deepest nesting"
          value={health.domDepthLevel != null ? `${health.domDepthLevel} levels` : 'Not measured'}
          note="Element depth from the root"
        />
        <Metric
          label="Parser-blocking head scripts"
          value={health.blockingScriptsCount != null ? String(health.blockingScriptsCount) : 'Not measured'}
          note="Scripts without async, defer or type=module"
        />
        <Metric
          label="HTML payload"
          value={health.payloadKb != null ? `${health.payloadKb.toFixed(2)} KB` : 'Not measured'}
          note="Uncompressed HTML as served"
        />
        <Metric
          label="Modern image formats"
          value={health.modernImagesPct != null ? `${health.modernImagesPct.toFixed(0)}%` : 'Not measured'}
          note={
            health.totalImages != null && health.responsiveImagesCount != null
              ? `${health.responsiveImagesCount} of ${health.totalImages} images use srcset`
              : 'WebP or AVIF among img sources'
          }
        />
        <Metric
          label="Compression"
          value={health.compression ?? 'Not measured'}
          note="Content-Encoding on the response"
        />
      </div>

      {health.tagMix && totalTags > 0 ? (
        <div>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">Element mix</h4>
            <span className="text-xs text-muted-foreground">
              {totalTags.toLocaleString()} classified elements of {health.domElementsCount?.toLocaleString() ?? '—'} counted
            </span>
          </div>
          <div className="flex h-6 w-full gap-0.5 overflow-hidden rounded-lg border border-border bg-muted p-0.5">
            {health.tagMix.map((entry, index) => (
              <div
                key={entry.label}
                className="h-full rounded-sm first:rounded-l-md last:rounded-r-md"
                style={{
                  width: `${Math.max(2, (entry.count / totalTags) * 100)}%`,
                  backgroundColor: ['var(--chart-cyan)', 'var(--chart-green)', 'var(--chart-amber)', 'var(--chart-violet)', 'var(--chart-blue)', 'var(--chart-red)'][index % 6],
                }}
                title={`${entry.label}: ${entry.count}`}
              />
            ))}
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {health.tagMix.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between border-b border-border py-1.5 text-xs">
                <dt className="text-muted-foreground">{entry.label}</dt>
                <dd className="font-mono tabular-nums text-foreground">{entry.count.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          This report predates the element-mix reading, so only the totals above are available.
        </p>
      )}
    </div>
  );
});
