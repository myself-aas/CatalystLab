import React from 'react';
import type { EngineType } from '../../types';
import type { MetricStatus, ParsedMetricRow } from '../../utils/parseEngineOutput';

interface EngineDataTableProps {
  engineType: EngineType;
  tableData: ParsedMetricRow[];
}

const STATUS_CLASS: Record<MetricStatus, string> = {
  Pass: 'border-success/30 bg-success/10 text-success',
  Fail: 'border-danger/30 bg-danger/10 text-danger',
  Warn: 'border-warning/30 bg-warning/10 text-warning',
  Info: 'border-border bg-muted text-muted-foreground',
};

export const EngineDataTable: React.FC<EngineDataTableProps> = ({ engineType, tableData }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold capitalize text-foreground">{engineType} readings</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Every line the engine marked as a reading, in the order it printed them.
        </p>
      </div>
      <div className="overflow-x-auto scrollbar-none touch-pan-x">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
            <tr>
              <th scope="col" className="px-6 py-3">Check</th>
              <th scope="col" className="px-6 py-3">Result</th>
              <th scope="col" className="px-6 py-3">Reading</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tableData.length > 0 ? tableData.map((row, i) => (
              <tr key={`${row.metric}-${i}`} className="hover:bg-muted/50">
                <td className="px-6 py-3 font-medium text-foreground">{row.metric}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-muted-foreground tabular-nums">{row.value}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                  This run printed no readings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
