import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { EngineType } from '../../types';

interface EngineChartsProps {
  engineType: EngineType;
  metrics: any;
}

const COLORS = ['#F0FAFF', '#F0FAFF', '#F0FAFF', '#F0FAFF', '#FFFFFF'];

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
      <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.04] p-6 shadow-linear-card">
        <h3 className="mb-4 text-lg font-semibold capitalize tracking-tight text-foreground">{engineType} metrics</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#F0FAFF', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#F0FAFF', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#F3F4F6', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }} />
              <Bar dataKey="value" fill="#F0FAFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.04] p-6 shadow-linear-card">
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
              <Tooltip contentStyle={{ backgroundColor: '#F3F4F6', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
