import React from 'react';
import { EngineCharts } from './EngineCharts';
import { EngineDataTable } from './EngineDataTable';
import type { EngineType } from '../../types';

interface EngineReportDashboardProps {
  engineType: EngineType;
  targetUrl: string;
  output: string;
  onRelaunch: () => void;
  onSave: () => void;
  savedReportId: string | null;
}

export const EngineReportDashboard: React.FC<EngineReportDashboardProps> = ({ engineType, targetUrl, output }) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-muted border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground capitalize">{engineType} Report</h2>
          <p className="text-muted-foreground mt-1">Target: {targetUrl}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngineCharts engineType={engineType} metrics={{}} />
      </div>
      <div className="mt-6">
        <EngineDataTable engineType={engineType} tableData={[]} />
      </div>
      <div className="mt-6 bg-primary text-emerald-400 font-mono text-sm p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
        {output || 'No raw output generated.'}
      </div>
    </div>
  );
};
