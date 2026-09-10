import React from 'react';
import { 
  Activity, 
  FileText, 
  Zap, 
  Globe, 
  GitBranch, 
  ShieldCheck, 
  ArrowRight, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import type { RateLimitStatus } from '../../utils/rateLimiter';

export interface DashboardMetricsBentoGridProps {
  totalAudits: number;
  avgScore: number;
  uniqueDomains: number;
  rateStatus: RateLimitStatus;
  targetDomain: string;
  onNavigateTab: (tab: string) => void;
}

export const DashboardMetricsBentoGrid: React.FC<DashboardMetricsBentoGridProps> = ({
  totalAudits,
  avgScore,
  uniqueDomains,
  rateStatus,
  targetDomain,
  onNavigateTab,
}) => {
  const quotaPercentage = Math.min(
    100,
    Math.max(0, Math.round((rateStatus.remaining / (rateStatus.limit || 1)) * 100))
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Platform Telemetry Matrix
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface)] border border-border text-foreground">
            3-Column Bento Engine
          </span>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground hidden sm:flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-[#F0FAFF] animate-pulse" />
          <span>Real-Time Engine Sync</span>
        </div>
      </div>

      {/* 3-Column Bento-Grid Layout for Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        {/* Metric 1: Global Diagnostic Architecture Health (Primary Metric) */}
        <div
          onClick={() => onNavigateTab('audits')}
          className="ds-card ds-card-interactive group p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
          title="Click to view full audit dossiers vault"
        >
          <div>
            {/* Top Card Bar - Strict Visual Parity with Audit Dossier Cards */}
            <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-[#F0FAFF] shrink-0">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate group-hover:text-foreground transition-colors">
                    Global Health Score
                  </h3>
                  <span className="text-[10px] ds-muted flex items-center gap-1 truncate">
                    <Layers className="h-2.5 w-2.5" />
                    Diagnostic Engine Composite
                  </span>
                </div>
              </div>

              {/* Score Pill */}
              <div
                className={`py-0.5 px-2 rounded text-xs font-bold border shrink-0 ${
                  avgScore >= 90
                    ? 'bg-[#F0FAFF]/10 text-emerald-400 border-emerald-500/20'
                    : avgScore >= 75
                    ? 'bg-[#F0FAFF]/10 text-amber-400 border-amber-500/20'
                    : 'bg-[#F7FDFF]/10 text-red-400 border-red-500/20'
                }`}
              >
                {avgScore}/100
              </div>
            </div>

            {/* Middle Content */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  {avgScore}%
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />
                  +2.8%
                </span>
              </div>

              <p className="text-[11px] ds-muted line-clamp-2 leading-relaxed font-sans">
                Aggregated score across Core Web Vitals, DOM complexity, AST diffs, and transport security.
              </p>

              {/* Progress bar */}
              <div className="w-full bg-[var(--bg-surface)] rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    avgScore >= 90
                      ? 'bg-gradient-to-r from-emerald-500 to-[#F0FAFF]'
                      : avgScore >= 75
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-red-500 to-rose-400'
                  }`}
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card Action Footer */}
          <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
            <span className="text-[10px] ds-muted truncate">
              {totalAudits} dossiers evaluated
            </span>
            <span className="text-xs font-bold ds-muted group-hover:text-foreground flex items-center gap-1 shrink-0">
              <span>Audit Vault</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Metric 2: Telemetry Dossiers Recorded */}
        <div
          onClick={() => onNavigateTab('audits')}
          className="ds-card ds-card-interactive group p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
          title="Click to inspect all recorded dossiers"
        >
          <div>
            {/* Top Card Bar */}
            <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-[#F0FAFF] shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate group-hover:text-foreground transition-colors">
                    Telemetry Dossiers
                  </h3>
                  <span className="text-[10px] ds-muted flex items-center gap-1 truncate">
                    <Cpu className="h-2.5 w-2.5" />
                    Autonomous AST Records
                  </span>
                </div>
              </div>

              {/* Pill */}
              <div className="py-0.5 px-2 rounded text-xs font-bold border shrink-0 bg-[#F0FAFF]/10 text-cyan-400 border-cyan-500/20">
                {totalAudits} Dossiers
              </div>
            </div>

            {/* Middle Content */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  {totalAudits}
                </span>
                <span className="text-[11px] font-bold text-[#F0FAFF] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  Active Scan
                </span>
              </div>

              <p className="text-[11px] ds-muted line-clamp-2 leading-relaxed font-sans">
                {uniqueDomains} unique domain{uniqueDomains === 1 ? '' : 's'} continuously profiled with AST diffs and DOM snapshots.
              </p>

              <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground font-mono">
                <span className="truncate max-w-[150px] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-border text-foreground">
                  {targetDomain}
                </span>
                <span>Active Target</span>
              </div>
            </div>
          </div>

          {/* Card Action Footer */}
          <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
            <span className="text-[10px] ds-muted truncate">
              {uniqueDomains} Hostnames Monitored
            </span>
            <span className="text-xs font-bold ds-muted group-hover:text-foreground flex items-center gap-1 shrink-0">
              <span>Filter Dossiers</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Metric 3: Compute Quota & Allocation */}
        <div
          onClick={() => onNavigateTab('rate-limits')}
          className="ds-card ds-card-interactive group p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
          title="Click to manage rate limit allocation"
        >
          <div>
            {/* Top Card Bar */}
            <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-[rgba(240,250,255,0.6)] shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate group-hover:text-foreground transition-colors">
                    Compute Quota
                  </h3>
                  <span className="text-[10px] ds-muted flex items-center gap-1 truncate">
                    Daily Telemetry Allocation
                  </span>
                </div>
              </div>

              {/* Pill */}
              <div className="py-0.5 px-2 rounded text-xs font-bold border shrink-0 bg-[#F0FAFF]/10 text-amber-400 border-amber-500/20">
                {rateStatus.tier.toUpperCase()} TIER
              </div>
            </div>

            {/* Middle Content */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  {rateStatus.remaining} <span className="text-sm font-normal text-muted-foreground">/ {rateStatus.limit}</span>
                </span>
                <span className="text-[11px] font-bold text-amber-400">
                  {quotaPercentage}% Remaining
                </span>
              </div>

              <p className="text-[11px] ds-muted line-clamp-2 leading-relaxed font-sans">
                Tokens allocated per 24-hour cycle for AST mutation scanning, Lighthouse audits, and packet telemetry.
              </p>

              {/* Progress bar */}
              <div className="w-full bg-[var(--bg-surface)] rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                  style={{ width: `${quotaPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card Action Footer */}
          <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
            <span className="text-[10px] ds-muted truncate">
              Resets at 00:00 UTC
            </span>
            <span className="text-xs font-bold ds-muted group-hover:text-foreground flex items-center gap-1 shrink-0">
              <span>Manage Quota</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Metric 4: Edge Kinase Mesh Latency */}
        <div
          onClick={() => onNavigateTab('monitoring')}
          className="ds-card ds-card-interactive group p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
          title="Click to open live edge mesh radar"
        >
          <div>
            {/* Top Card Bar */}
            <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-emerald-400 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate group-hover:text-foreground transition-colors">
                    Edge Mesh Matrix
                  </h3>
                  <span className="text-[10px] ds-muted flex items-center gap-1 truncate">
                    Anycast PoP Routing
                  </span>
                </div>
              </div>

              {/* Pill */}
              <div className="py-0.5 px-2 rounded text-xs font-bold border shrink-0 bg-[#F0FAFF]/10 text-emerald-400 border-emerald-500/20">
                38 PoPs Active
              </div>
            </div>

            {/* Middle Content */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  18.4ms
                </span>
                <span className="text-[11px] font-bold text-emerald-400">
                  0% Drops
                </span>
              </div>

              <p className="text-[11px] ds-muted line-clamp-2 leading-relaxed font-sans">
                Global distributed round-trip telemetry verified across Fastly, Cloudflare, and AWS edge points.
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                <span>P95 TTFB Sub-20ms</span>
                <span className="text-emerald-400 font-medium">Replication OK</span>
              </div>
            </div>
          </div>

          {/* Card Action Footer */}
          <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
            <span className="text-[10px] ds-muted truncate">
              Global Anycast Routing
            </span>
            <span className="text-xs font-bold ds-muted group-hover:text-foreground flex items-center gap-1 shrink-0">
              <span>Inspect Radar</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Metric 5: GHLyase Autonomous PR Patches */}
        <div
          onClick={() => onNavigateTab('patches')}
          className="ds-card ds-card-interactive group p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
          title="Click to view automated pull request patches"
        >
          <div>
            {/* Top Card Bar */}
            <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-[#F0FAFF] shrink-0">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate group-hover:text-foreground transition-colors">
                    Automated PR Patches
                  </h3>
                  <span className="text-[10px] ds-muted flex items-center gap-1 truncate">
                    GHLyase AST Engine
                  </span>
                </div>
              </div>

              {/* Pill */}
              <div className="py-0.5 px-2 rounded text-xs font-bold border shrink-0 bg-[#F0FAFF]/10 text-blue-400 border-blue-500/20">
                3 Ready
              </div>
            </div>

            {/* Middle Content */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  3 Branches
                </span>
                <span className="text-[11px] font-bold text-[#F0FAFF]">
                  Verified AST Diff
                </span>
              </div>

              <p className="text-[11px] ds-muted line-clamp-2 leading-relaxed font-sans">
                Zero-runtime AST diffs compiled for Core Web Vitals, preloading fonts and eliminating render blocks.
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                <span>Webhook Dispatched</span>
                <span className="text-emerald-400 font-medium">Ready to Merge</span>
              </div>
            </div>
          </div>

          {/* Card Action Footer */}
          <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
            <span className="text-[10px] ds-muted truncate">
              GitHub Pipeline Active
            </span>
            <span className="text-xs font-bold ds-muted group-hover:text-foreground flex items-center gap-1 shrink-0">
              <span>Review PRs</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Metric 6: OWASP Transport Shield (RiskProtease) */}
        <div
          onClick={() => onNavigateTab('security')}
          className="ds-card ds-card-interactive group p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
          title="Click to view OWASP security audit logs"
        >
          <div>
            {/* Top Card Bar */}
            <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-[rgba(240,250,255,0.75)] shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate group-hover:text-foreground transition-colors">
                    OWASP Security Vault
                  </h3>
                  <span className="text-[10px] ds-muted flex items-center gap-1 truncate">
                    TLS 1.3 &amp; Header Audit
                  </span>
                </div>
              </div>

              {/* Pill */}
              <div className="py-0.5 px-2 rounded text-xs font-bold border shrink-0 bg-[#F0FAFF]/10 text-purple-400 border-purple-500/20">
                Grade A+
              </div>
            </div>

            {/* Middle Content */}
            <div className="py-3.5 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  100% Pass
                </span>
                <span className="text-[11px] font-bold text-purple-400">
                  0 Vulnerabilities
                </span>
              </div>

              <p className="text-[11px] ds-muted line-clamp-2 leading-relaxed font-sans">
                Continuous inspection of TLS 1.3 cipher suites, HSTS preloading, CSP directives, and CORS safety.
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                <span>Strict-Transport-Security</span>
                <span className="text-emerald-400 font-medium">Enforced</span>
              </div>
            </div>
          </div>

          {/* Card Action Footer */}
          <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
            <span className="text-[10px] ds-muted truncate">
              OWASP Top 10 Compliant
            </span>
            <span className="text-xs font-bold ds-muted group-hover:text-foreground flex items-center gap-1 shrink-0">
              <span>Security Logs</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
