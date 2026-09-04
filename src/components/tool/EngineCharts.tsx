import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { EngineType } from '../../types';

interface EngineChartsProps {
  engineType: EngineType;
  metrics: any;
}

const COLORS = ['#5E6AD2', '#38bdf8', '#34d399', '#fbbf24', '#f43f5e'];

export const EngineCharts: React.FC<EngineChartsProps> = ({ engineType, metrics }) => {
  const data: { name: string; value: number }[] = Array.isArray(metrics?.plot1)
    ? metrics.plot1.filter((d: { name?: string; value?: number }) => typeof d?.value === 'number')
    : Object.entries(metrics || {})
        .filter(([, v]) => typeof v === 'number')
        .slice(0, 8)
        .map(([name, value]) => ({ name: String(name).slice(0, 18), value: Number(value) }));

  if (data.length === 0) return null;

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-6 shadow-linear-card">
        <h3 className="mb-4 text-lg font-semibold capitalize tracking-tight text-foreground">{engineType} metrics</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8A8F98', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A8F98', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#EDEDEF' }} />
              <Bar dataKey="value" fill="#5E6AD2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-6 shadow-linear-card">
        <h3 className="mb-4 text-lg font-semibold capitalize tracking-tight text-foreground">Distribution</h3>
        <div className="flex h-[250px] w-full items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#EDEDEF' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
