import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import type { EcoSection } from '../../utils/telemetryParser';

interface EcoCarbonComparisonChartProps {
  eco: EcoSection;
}

export const EcoCarbonComparisonChart: React.FC<EcoCarbonComparisonChartProps> = React.memo(({ eco }) => {
  const [monthlyVisits, setMonthlyVisits] = useState<number>(10000);
  const perVisit = eco.emissionsPerVisitGrams;

  const projectedMonthlyKg = perVisit !== null ? (perVisit * monthlyVisits) / 1000 : null;

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
            <Leaf className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">Estimated carbon per page view</h3>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Estimated with the Sustainable Web Design model from the HTML bytes served plus
              per-asset allowances (500 KB per image, 100 KB per script, 30 KB per stylesheet).
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Rating</div>
          <div className="font-mono text-xl font-semibold text-foreground">
            {eco.rating ?? 'Not measured'}
          </div>
          {eco.ratingLabel && <div className="mt-1 text-xs text-muted-foreground">{eco.ratingLabel}</div>}
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs text-muted-foreground">Grams CO2e per view</dt>
          <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
            {perVisit !== null ? perVisit.toFixed(4) : 'Not measured'}
          </dd>
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs text-muted-foreground">Estimated page weight</dt>
          <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
            {eco.pageWeightMb !== null ? `${eco.pageWeightMb.toFixed(2)} MB` : 'Not measured'}
          </dd>
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs text-muted-foreground">At 10,000 views</dt>
          <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
            {eco.monthly10kKg !== null ? `${eco.monthly10kKg.toFixed(2)} kg` : 'Not measured'}
          </dd>
        </div>
      </dl>

      {perVisit !== null && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="eco-visits" className="text-sm font-medium text-foreground">
              Monthly page views
            </label>
            <span className="font-mono text-sm tabular-nums text-foreground">
              {monthlyVisits.toLocaleString()}
            </span>
          </div>
          <input
            id="eco-visits"
            type="range"
            min="1000"
            max="500000"
            step="1000"
            value={monthlyVisits}
            onChange={(event) => setMonthlyVisits(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted"
          />
          <p className="text-sm text-muted-foreground">
            Projected monthly footprint:{' '}
            <span className="font-mono text-foreground tabular-nums">
              {projectedMonthlyKg !== null ? `${projectedMonthlyKg.toFixed(2)} kg CO2e` : '—'}
            </span>{' '}
            — this multiplication of the measured per-view estimate, not a separate measurement.
          </p>
        </div>
      )}
    </div>
  );
});
