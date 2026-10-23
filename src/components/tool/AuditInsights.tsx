import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { EngineType } from '../../types';
import { ENGINES_MAP } from '../../data/engines';
import type { ParsedEngineTelemetry } from '../../utils/parseEngineOutput';

interface AuditInsightsProps {
  engineType: EngineType;
  targetUrl: string;
  parsed: ParsedEngineTelemetry;
}

/**
 * Summarises an engine log. Every sentence here is copied out of the log; the
 * component adds no scores, no benchmarks and no remediation advice, because
 * it has not measured anything itself.
 */
export const AuditInsights: React.FC<AuditInsightsProps> = ({ engineType, targetUrl, parsed }) => {
  const meta = ENGINES_MAP[engineType];
  const engineName = meta?.catalystName || meta?.name || engineType;

  const counts = [
    { label: 'Checks passed', value: parsed.issues.info, icon: CheckCircle2, tone: 'text-success' },
    { label: 'Failed checks', value: parsed.issues.critical, icon: AlertTriangle, tone: 'text-danger' },
    { label: 'Warnings', value: parsed.issues.warning, icon: Info, tone: 'text-warning' },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface p-6" aria-labelledby="audit-insights-heading">
      <h2 id="audit-insights-heading" className="text-base font-semibold text-foreground">
        What this run found
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {engineName} against {targetUrl}. Counts and quotes come straight from the engine log below.
      </p>

      {!parsed.measured ? (
        <p className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
          The scan did not complete, so this run has no readings to summarise. The log below records
          what failed.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {counts.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="flex items-baseline justify-between gap-2 border-t border-border pt-3">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className={`size-4 ${tone}`} aria-hidden="true" />
                  {label}
                </dt>
                <dd className="font-mono text-lg font-semibold text-foreground tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>

          {parsed.scoreNote && (
            <p className="mt-4 text-xs text-muted-foreground">{parsed.scoreNote}</p>
          )}

          {parsed.failures.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Failed checks
              </h3>
              <ul className="mt-2 divide-y divide-border">
                {parsed.failures.slice(0, 6).map((finding) => (
                  <li key={finding} className="py-2 text-sm text-foreground">
                    {finding}
                  </li>
                ))}
              </ul>
              {parsed.failures.length > 6 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {parsed.failures.length - 6} more failed checks are listed in the log below.
                </p>
              )}
            </div>
          )}

          {parsed.warnings.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Warnings
              </h3>
              <ul className="mt-2 divide-y divide-border">
                {parsed.warnings.slice(0, 4).map((warning) => (
                  <li key={warning} className="py-2 text-sm text-foreground">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsed.failures.length === 0 && parsed.warnings.length === 0 && (
            <p className="mt-4 text-sm text-foreground">
              The engine reported no failed checks for this target.
            </p>
          )}
        </>
      )}
    </section>
  );
};
