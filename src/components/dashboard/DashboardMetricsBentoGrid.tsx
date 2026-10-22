import React from 'react';

import {
  Activity,
  FileText,
  Globe,
  Gauge,
  ArrowRight,
} from 'lucide-react';
import type { RateLimitStatus } from '../../utils/rateLimiter';

export interface DashboardMetricsBentoGridProps {
  totalAudits: number;
  /** Mean of the stored audit scores, or null when nothing has been scored yet. */
  avgScore: number | null;
  uniqueDomains: number;
  rateStatus: RateLimitStatus;
  targetDomain: string;
  onNavigateTab: (tab: string) => void;
}

/**
 * Dashboard summary tiles.
 *
 * Every figure here is derived from the user's stored audits or the live quota
 * response. There are no placeholder deltas, no invented pass rates, and no
 * "live" chips for state the client cannot observe.
 */
export const DashboardMetricsBentoGrid: React.FC<DashboardMetricsBentoGridProps> = ({
  totalAudits,
  avgScore,
  uniqueDomains,
  rateStatus,
  targetDomain,
  onNavigateTab,
}) => {
  const limit = rateStatus.limit || 0;
  const remaining = Math.max(0, rateStatus.remaining);
  const quotaPercentage = limit > 0 ? Math.min(100, Math.round((remaining / limit) * 100)) : 0;

  const tiles = [
    {
      key: 'health',
      title: 'Mean health score',
      value: avgScore === null ? '—' : `${avgScore}`,
      suffix: avgScore === null ? null : '/100',
      description:
        avgScore === null
          ? 'No scored audits yet. Run an audit to start a baseline.'
          : `Mean of ${totalAudits} scored ${totalAudits === 1 ? 'audit' : 'audits'} on this account.`,
      icon: Activity,
      tab: 'audits',
      action: 'Open audits',
    },
    {
      key: 'audits',
      title: 'Recorded audits',
      value: `${totalAudits}`,
      suffix: null,
      description: 'Every completed audit is stored with its full engine output.',
      icon: FileText,
      tab: 'audits',
      action: 'Open audits',
    },
    {
      key: 'domains',
      title: 'Domains monitored',
      value: `${uniqueDomains}`,
      suffix: null,
      description: targetDomain
        ? `Currently watching ${targetDomain}.`
        : 'Add a domain to monitor uptime and regressions.',
      icon: Globe,
      tab: 'monitoring',
      action: 'Open monitoring',
    },
    {
      key: 'quota',
      title: 'Scan allowance',
      value: `${remaining}`,
      suffix: limit > 0 ? `of ${limit}` : null,
      description:
        limit > 0
          ? `${quotaPercentage}% of today's allowance is unspent.`
          : 'Sign in to see your daily scan allowance.',
      icon: Gauge,
      tab: 'rate-limits',
      action: 'View limits',
      progress: limit > 0 ? quotaPercentage : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.key} className="ds-card ds-card-interactive flex flex-col justify-between p-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-medium text-muted-foreground">{tile.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab(tile.tab)}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-info hover:underline"
                >
                  {tile.action}
                  <ArrowRight className="size-3" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-semibold tracking-tight text-foreground">
                  {tile.value}
                </span>
                {tile.suffix && (
                  <span className="font-mono text-sm text-muted-foreground">{tile.suffix}</span>
                )}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tile.description}</p>
            </div>

            {typeof tile.progress === 'number' && (
              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={tile.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Scan allowance remaining"
              >
                <div
                  className="h-full rounded-full bg-success transition-[width] duration-500"
                  style={{ width: `${tile.progress}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMetricsBentoGrid;
