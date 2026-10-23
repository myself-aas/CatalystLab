import React from 'react';
import { Lock } from 'lucide-react';
import type { SecuritySection } from '../../utils/telemetryParser';

interface OWASPSecurityMatrixChartProps {
  security: SecuritySection;
}

const label = (value: boolean | null) =>
  value === null ? 'Not measured' : value ? 'Present' : 'Missing';

const tone = (value: boolean | null) =>
  value === null ? 'text-muted-foreground' : value ? 'text-success' : 'text-danger';

export const OWASPSecurityMatrixChart: React.FC<OWASPSecurityMatrixChartProps> = React.memo(({ security }) => {
  const headers = [
    { name: 'Strict-Transport-Security', value: security.hsts, purpose: 'Forces HTTPS and blocks downgrade attacks.' },
    { name: 'Content-Security-Policy', value: security.csp, purpose: 'Restricts which scripts may run.' },
    { name: 'X-Frame-Options', value: security.xFrameOptions, purpose: 'Blocks framing by other origins.' },
    { name: 'Referrer-Policy', value: security.referrerPolicy, purpose: 'Limits referrer leakage.' },
    { name: 'Permissions-Policy', value: security.permissionsPolicy, purpose: 'Restricts camera, microphone and location access.' },
    { name: 'X-Content-Type-Options', value: security.contentTypeOptions, purpose: 'Stops MIME-type sniffing.' },
  ];

  const measured = headers.filter((h) => h.value !== null);
  const present = measured.filter((h) => h.value === true).length;

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
            <Lock className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">Response security headers</h3>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Presence of six headers in the response. The engine records that a header is there, not
              its policy strength.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Compliance score</div>
          <div className="font-mono text-xl font-semibold tabular-nums text-foreground">
            {security.score != null ? `${security.score}/100` : 'Not scored'}
          </div>
          {security.riskCount != null && (
            <div className="mt-1 text-xs text-muted-foreground">{security.riskCount} liabilities counted</div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <h4 className="font-semibold text-foreground">Header coverage</h4>
          <span className="text-muted-foreground">
            {present} of {measured.length} measured headers present
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-[width]"
            style={{ width: `${measured.length ? (present / measured.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <caption className="sr-only">Security header presence</caption>
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th scope="col" className="py-2 pr-4 font-medium">Header</th>
            <th scope="col" className="py-2 pr-4 font-medium">Result</th>
            <th scope="col" className="hidden py-2 font-medium md:table-cell">What it does</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {headers.map((header) => (
            <tr key={header.name}>
              <th scope="row" className="py-3 pr-4 font-mono text-xs font-medium text-foreground">{header.name}</th>
              <td className={`py-3 pr-4 text-xs ${tone(header.value)}`}>{label(header.value)}</td>
              <td className="hidden py-3 text-xs text-muted-foreground md:table-cell">{header.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-sm text-muted-foreground">
        {security.sslValid === null
          ? 'The TLS probe did not complete, so certificate details are unknown for this run.'
          : `Certificate ${security.sslValid ? 'valid' : 'expired'}${security.sslDaysRemaining != null ? `, ${security.sslDaysRemaining} days until expiry` : ''}.`}
      </p>
    </div>
  );
});
