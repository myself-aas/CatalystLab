import React from 'react';
import type { EngineType } from '../../types';

interface EngineDataTableProps {
  engineType: EngineType;
  tableData: any[];
}

export const EngineDataTable: React.FC<EngineDataTableProps> = ({ engineType, tableData }) => {
  return (
    <div className="w-full bg-background border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border bg-muted">
        <h3 className="text-lg font-bold text-foreground capitalize">{engineType} Data</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted border-b border-border text-muted-foreground uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Metric</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData && tableData.length > 0 ? tableData.map((row, i) => (
              <tr key={i} className="hover:bg-muted/50">
                <td className="px-6 py-4 font-medium text-foreground">{row.metric || 'Item ' + i}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${row.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {row.status || 'Pass'}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{row.value || 'N/A'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                  No data points recorded for this run.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
