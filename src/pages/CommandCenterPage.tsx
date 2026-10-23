import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  Cpu,
  GitBranch,
  Globe,
  Leaf,
  MemoryStick,
  RefreshCw,
  Search,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { ENGINES_MAP, ENGINE_ORDER } from '../data/engines';
import { useAuth } from '../context/AuthContext';
import { getUserReports } from '../lib/firebase';
import { extractDomainFromUrl } from '../utils/slugUtils';
import type { AuditReport } from '../types';
import { logger } from '../lib/logger';

const ENGINE_ICONS: Record<string, React.ElementType> = {
  health: Activity,
  latency: Globe,
  eco: Leaf,
  compliance: ShieldCheck,
  repo: Terminal,
  ai_ready: Cpu,
  llmo: Search,
  migration: GitBranch,
};

interface ServerHealth {
  status: string;
  uptimeSeconds: number;
  memoryUsageMb: { rss: number; heapTotal: number; heapUsed: number };
  activeEnginesCount: number;
  totalAuditsLogged: number;
  nodeVersion: string;
  platform: string;
  timestamp: number;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Command centre.
 *
 * The previous version rendered a hard-coded cockpit: invented Core Web Vitals,
 * a 99.9% pass rate, a scanner "sweep" and a cron log of probes that never ran.
 * Every number here now comes from the running server
 * (`GET /api/monitor/system-health`) or from the signed-in user's stored
 * audits; when neither is available the panel says so instead of inventing a
 * reading.
 */
export const CommandCenterPage: React.FC = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(Boolean(user));

  const loadHealth = useCallback(async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await fetch('/api/monitor/system-health', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Health check returned ${res.status}`);
      setHealth((await res.json()) as ServerHealth);
    } catch (err) {
      logger.error('Command centre health check failed:', err);
      setHealthError('The server did not answer the health check. Readings are unavailable.');
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    void loadHealth();
    const timer = window.setInterval(() => void loadHealth(), 30_000);
    return () => window.clearInterval(timer);
  }, [loadHealth]);

  useEffect(() => {
    if (!user) {
      setReports([]);
      setLoadingReports(false);
      return;
    }
    let cancelled = false;
    setLoadingReports(true);
    getUserReports()
      .then((data) => {
        if (!cancelled) setReports(data.slice(0, 5));
      })
      .catch((err) => logger.error('Command centre could not load reports:', err))
      .finally(() => {
        if (!cancelled) setLoadingReports(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Command Center — CatalystLab"
        description="Live runtime status, the eight diagnostic engines, and the audits saved to your account."
        canonicalPath="/app"
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="framer-title text-foreground">Command center</h1>
            <p className="mt-2 max-w-xl framer-body-text">
              What this server is doing right now, which engines a master audit will
              run, and the audits stored to your account.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadHealth()}
              className="ds-btn ds-btn-secondary h-11"
              aria-label="Refresh runtime readings"
            >
              <RefreshCw className={`size-4 ${loadingHealth ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>Refresh</span>
            </button>
            <Link to="/audit" className="ds-btn ds-btn-primary h-11">
              <span>Run a master audit</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <main className="space-y-10 pt-8">
          <section aria-labelledby="runtime-heading" className="space-y-4">
            <h2 id="runtime-heading" className="framer-card-title text-foreground">
              Runtime
            </h2>

            {healthError ? (
              <div className="ds-card flex items-start gap-3 border-warning/30 p-4" role="status">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm text-foreground">{healthError}</p>
                  <p className="text-sm text-muted-foreground">
                    Audits can still run from the <Link to="/audit" className="underline underline-offset-4">audit page</Link>.
                  </p>
                </div>
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="ds-card p-4">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="size-4" aria-hidden="true" />
                    Status
                  </dt>
                  <dd className="mt-2 font-mono text-xl text-foreground">
                    {loadingHealth && !health ? 'Checking…' : health ? health.status : 'Unknown'}
                  </dd>
                </div>
                <div className="ds-card p-4">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" aria-hidden="true" />
                    Uptime
                  </dt>
                  <dd className="mt-2 font-mono text-xl tabular-nums text-foreground">
                    {health ? formatUptime(health.uptimeSeconds) : '—'}
                  </dd>
                </div>
                <div className="ds-card p-4">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MemoryStick className="size-4" aria-hidden="true" />
                    Heap used
                  </dt>
                  <dd className="mt-2 font-mono text-xl tabular-nums text-foreground">
                    {health ? `${health.memoryUsageMb.heapUsed} MB` : '—'}
                  </dd>
                </div>
                <div className="ds-card p-4">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Cpu className="size-4" aria-hidden="true" />
                    Engine runs served
                  </dt>
                  <dd className="mt-2 font-mono text-xl tabular-nums text-foreground">
                    {health ? health.totalAuditsLogged : '—'}
                  </dd>
                </div>
              </dl>
            )}

            {health ? (
              <p className="font-mono text-xs text-muted-foreground">
                {health.activeEnginesCount} engines registered · {health.platform} · Node {health.nodeVersion} ·
                updated {new Date(health.timestamp).toLocaleTimeString()}
              </p>
            ) : null}
          </section>

          <section aria-labelledby="engines-heading" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="engines-heading" className="framer-card-title text-foreground">
                Engines
              </h2>
              <Link
                to="/engines"
                className="flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <span>Engine reference</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ENGINE_ORDER.map((id) => {
                const engine = ENGINES_MAP[id];
                const Icon = ENGINE_ICONS[id] ?? Activity;
                return (
                  <li key={id} className="ds-card flex items-start gap-3 p-4">
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{engine.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{engine.lifecycleFocus}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="recent-heading" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="recent-heading" className="framer-card-title text-foreground">
                Your recent audits
              </h2>
              {user ? (
                <Link
                  to="/dashboard?tab=audits"
                  className="flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  <span>All audits</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>

            {!user ? (
              <div className="ds-card p-6">
                <p className="text-sm text-muted-foreground">
                  Sign in to see the audits saved to your account.{' '}
                  <Link to="/login?redirect=/app" className="text-foreground underline underline-offset-4">
                    Sign in
                  </Link>
                  .
                </p>
              </div>
            ) : loadingReports ? (
              <p className="font-mono text-sm text-muted-foreground" role="status">
                Loading your audits…
              </p>
            ) : reports.length === 0 ? (
              <div className="ds-card p-6">
                <p className="text-sm text-muted-foreground">
                  No audits saved yet. A master audit runs all eight engines against one URL
                  and stores the result under your account.
                </p>
                <Link to="/audit" className="ds-btn ds-btn-primary mt-4 h-11">
                  <span>Run a master audit</span>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {reports.map((report) => (
                  <li key={report.id}>
                    <Link
                      to={`/reports/${extractDomainFromUrl(report.url)}`}
                      className="flex min-h-11 flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted"
                    >
                      <span className="min-w-0 truncate text-sm text-foreground">
                        {extractDomainFromUrl(report.url)}
                      </span>
                      <span className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                        <span className="tabular-nums">
                          {typeof report.score === 'number' ? `${report.score}/100` : 'No score'}
                        </span>
                        {report.createdAt ? (
                          <time dateTime={new Date(report.createdAt).toISOString()}>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </time>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default CommandCenterPage;
