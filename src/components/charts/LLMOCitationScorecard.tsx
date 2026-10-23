import React from 'react';
import { Search } from 'lucide-react';
import type { LlmoSection } from '../../utils/telemetryParser';

interface LLMOCitationScorecardProps {
  llmo: LlmoSection;
}

const reading = (value: boolean | null) => (value === null ? 'Not measured' : value ? 'Present' : 'Missing');

export const LLMOCitationScorecard: React.FC<LLMOCitationScorecardProps> = React.memo(({ llmo }) => {
  const rows = [
    {
      label: 'JSON-LD schema blocks',
      value:
        llmo.jsonLdBlocksCount !== null ? `${llmo.jsonLdBlocksCount} found` : 'Not measured',
      ok: llmo.jsonLdBlocksCount === null ? null : llmo.jsonLdBlocksCount > 0,
    },
    { label: 'OpenGraph title and description', value: reading(llmo.hasOgTags), ok: llmo.hasOgTags },
    { label: 'OpenGraph image', value: reading(llmo.hasOgImage), ok: llmo.hasOgImage },
    { label: 'Canonical URL', value: reading(llmo.hasCanonical), ok: llmo.hasCanonical },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
            <Search className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">Structured data and citation metadata</h3>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Four document-level checks. The engine cannot see whether a search assistant cites the
              page, so no citation probability is reported.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Citation readiness score</div>
          <div className="font-mono text-xl font-semibold tabular-nums text-foreground">
            {llmo.score != null ? `${llmo.score}/100` : 'Not scored'}
          </div>
        </div>
      </div>

      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-foreground">{row.label}</dt>
            <dd
              className={`font-mono text-sm ${
                row.ok === null ? 'text-muted-foreground' : row.ok ? 'text-success' : 'text-danger'
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
});
