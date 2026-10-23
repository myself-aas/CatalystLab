import React from 'react';
import { Eye } from 'lucide-react';
import type { AccessibilitySection } from '../../utils/telemetryParser';

interface WCAGAccessibilityGaugeProps {
  accessibility: AccessibilitySection;
}

export const WCAGAccessibilityGauge: React.FC<WCAGAccessibilityGaugeProps> = React.memo(({ accessibility }) => {
  const coverage = accessibility.altTextCoveragePct;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = coverage === null ? circumference : circumference - (coverage / 100) * circumference;

  const rows = [
    {
      label: 'Alt text coverage',
      value:
        coverage === null
          ? 'Not measured'
          : `${accessibility.missingAltCount ?? 0} of ${accessibility.totalImages ?? '—'} images missing alt text`,
      ok: coverage === null ? null : coverage === 100,
    },
    {
      label: 'Form control labels',
      value:
        accessibility.unlabeledInputsCount === null
          ? 'Not measured'
          : accessibility.unlabeledInputsCount === 0
            ? 'Every input has an associated label'
            : `${accessibility.unlabeledInputsCount} input(s) without a label`,
      ok: accessibility.unlabeledInputsCount === null ? null : accessibility.unlabeledInputsCount === 0,
    },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 text-foreground">
      <div className="flex items-start gap-3 border-b border-border pb-5">
        <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          <Eye className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">Alt text and form labels</h3>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Two automated checks from the compliance engine. Contrast, keyboard order and screen
            reader behaviour need a manual or browser-based audit and are not assessed here.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted p-4 md:col-span-5">
          <div className="relative flex items-center justify-center">
            <svg width="120" height="120" className="-rotate-90" role="img" aria-label="Alt text coverage">
              <circle cx="60" cy="60" r={radius} stroke="var(--border)" strokeWidth="10" fill="transparent" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="var(--foreground)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {coverage !== null ? `${coverage}%` : '—'}
              </span>
              <span className="text-xs text-muted-foreground">with alt text</span>
            </div>
          </div>
        </div>

        <dl className="space-y-3 md:col-span-7">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <dt className="text-sm font-medium text-foreground">{row.label}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{row.value}</dd>
              </div>
              <span
                className={`shrink-0 text-xs font-medium ${
                  row.ok === null ? 'text-muted-foreground' : row.ok ? 'text-success' : 'text-danger'
                }`}
              >
                {row.ok === null ? 'Unknown' : row.ok ? 'Pass' : 'Fail'}
              </span>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
});
