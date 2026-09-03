import React, { useMemo } from 'react';
import { EngineCharts } from './EngineCharts';
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
  const hasCharts = parsed.chartData.length > 0;
  const hasTable = parsed.tableData.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <LinearCard className="flex items-center justify-between p-6" lift={false}>
        <div>
          <h2 className="text-xl font-semibold capitalize tracking-tight text-[#EDEDEF]">{engineType} report</h2>
          <p className="mt-1 font-mono text-sm text-[#8A8F98]">Target: {targetUrl}</p>
        </div>
        {parsed.healthScore > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#8A8F98]">Score</div>
            <div className="font-mono text-2xl font-semibold text-[#EDEDEF]">{parsed.healthScore}</div>
          </div>
        )}
      </LinearCard>

      <AuditInsights
        engineType={engineType}
        targetUrl={targetUrl}
        metrics={{
          healthScore: parsed.healthScore,
          issues: parsed.issues,
          loadTime: parsed.loadTime,
          plot1: parsed.chartData,
        }}
      />

      {hasCharts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EngineCharts
            engineType={engineType}
            metrics={{ plot1: parsed.chartData, healthScore: parsed.healthScore }}
          />
        </div>
      )}

      {hasTable && <EngineDataTable engineType={engineType} tableData={parsed.tableData} />}

      <LinearCard className="overflow-x-auto p-4 font-mono text-sm whitespace-pre-wrap text-[#8A8F98]" lift={false}>
        {output || 'No raw output generated.'}
      </LinearCard>
    </div>
  );
};
