import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  Cpu,
  Globe,
  GitBranch,
  Terminal,
  Leaf,
  Search,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import { ENGINES_MAP } from '../../data/engines';
import { TOTAL_POPS_COUNT } from '../../lib/edge/pops';

interface FramerDossierCockpitProps {
  targetDomain?: string;
  onRefreshScan?: () => void;
  isScanning?: boolean;
  /** Kept for call-site compatibility; the compact panel has no KPI strip. */
  showTopKpi?: boolean;
}

const ENGINE_ORDER = [
  { id: 'health', icon: Activity },
  { id: 'latency', icon: Globe },
  { id: 'eco', icon: Leaf },
  { id: 'compliance', icon: ShieldCheck },
  { id: 'repo', icon: Terminal },
  { id: 'ai_ready', icon: Cpu },
  { id: 'llmo', icon: Search },
  { id: 'migration', icon: GitBranch },
] as const;

/**
 * Scan panel for the dashboard overview.
 *
 * This replaces a cockpit that rendered invented telemetry (a 99.9% pass rate,
 * an A+ transport grade, and a pull-request number drawn from Math.random) for
 * whatever domain was in scope. A dashboard that shows made-up readings is
 * worse than one that shows none, so this panel states what each engine
 * measures, launches a real audit, and links to the stored results.
 */
export const FramerDossierCockpit: React.FC<FramerDossierCockpitProps> = ({
  targetDomain,
  onRefreshScan,
  isScanning = false,
}) => {
  const domain = targetDomain?.trim();
  const auditHref = domain ? `/audit?url=${encodeURIComponent(domain)}` : '/audit';

  return (
    <section className="ds-card p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="framer-card-title text-foreground">New audit</h2>
          <p className="text-sm text-muted-foreground">
            {domain
              ? <>Every engine below runs against <span className="font-medium text-foreground">{domain}</span> and the reading is saved to this account.</>
              : 'Choose a domain, then run all eight engines and keep the resulting dossier.'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onRefreshScan && (
            <button
              type="button"
              onClick={onRefreshScan}
              disabled={isScanning}
              className="ds-btn ds-btn-secondary text-sm disabled:opacity-50"
            >
              <RotateCw className={`size-4 shrink-0 ${isScanning ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{isScanning ? 'Refreshing…' : 'Refresh list'}</span>
            </button>
          )}
          <Link to={auditHref} className="ds-btn ds-btn-primary text-sm">
            <span>Run audit</span>
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {ENGINE_ORDER.map(({ id, icon: Icon }) => {
          const meta = ENGINES_MAP[id];
          return (
            <li key={id} className="flex items-start gap-3 rounded-lg bg-surface p-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{meta?.catalystName || meta?.name || id}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {meta?.lifecycleFocus || meta?.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        Readings are measured now across {TOTAL_POPS_COUNT} edge locations. A single audit costs one unit from your daily allowance.
      </p>
    </section>
  );
};

export default FramerDossierCockpit;
