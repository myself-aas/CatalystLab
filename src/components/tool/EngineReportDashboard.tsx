import React, { useMemo } from 'react';
import { EngineDataTable } from './EngineDataTable';
import { AuditInsights } from './AuditInsights';
import type { EngineType } from '../../types';
import { LinearCard } from '../ui/LinearCard';
import { parseEngineOutput } from '../../utils/parseEngineOutput';

interface EngineReportDashboardProps {
  engineType: EngineType;
  targetUrl: string;
  output: string;
  onRelaunch: () => void;
  onSave: () => void;
  savedReportId: string | null;
}

export const EngineReportDashboard: React.FC<EngineReportDashboardProps> = ({
  engineType,
  targetUrl,
  output,
}) => {
  const parsed = useMemo(() => parseEngineOutput(output), [output]);

  const scoreLabel = parsed.healthScore !== null ? `${parsed.healthScore}/100` : parsed.measured ? 'Not scored' : 'Not measured';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <LinearCard className="flex flex-wrap items-start justify-between gap-4 p-6" lift={false}>
        <div>
          <h2 className="text-xl font-semibold capitalize tracking-tight text-foreground">{engineType} report</h2>
          <p className="mt-1 font-mono text-sm text-muted-foreground">Target: {targetUrl}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-2 text-right">
          <div className="text-xs text-muted-foreground">Score</div>
          <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">{scoreLabel}</div>
          <div className="mt-1 max-w-[16rem] text-xs text-muted-foreground">
            {parsed.healthScore !== null
              ? 'The score the engine printed for this run.'
              : parsed.measured
                ? parsed.scoreNote || 'This engine reports readings but no score.'
                : 'The scan did not finish, so there is no score to show.'}
          </div>
        </div>
      </LinearCard>

      <AuditInsights engineType={engineType} targetUrl={targetUrl} parsed={parsed} />

      {parsed.loadTime !== null && (
        <p className="text-sm text-muted-foreground">
          Measured round trip from the probing host:{' '}
          <span className="font-mono text-foreground tabular-nums">{parsed.loadTime} ms</span>
        </p>
      )}

      <EngineDataTable engineType={engineType} tableData={parsed.tableData} />

      <LinearCard className="overflow-x-auto scrollbar-none touch-pan-x p-4 font-mono text-sm whitespace-pre-wrap text-muted-foreground" lift={false}>
        {output || 'No raw output generated.'}
      </LinearCard>
    </div>
  );
};
