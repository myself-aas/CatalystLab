import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, ShieldCheck, Zap, Calendar, Check, AlertTriangle } from 'lucide-react';

const timeRangeData: Record<string, Array<{ date: string; score: number; security: number; performance: number; seo: number }>> = {
  '7d': [
    { date: 'Mon', score: 82, security: 90, performance: 75, seo: 85 },
    { date: 'Tue', score: 85, security: 92, performance: 78, seo: 85 },
    { date: 'Wed', score: 88, security: 95, performance: 82, seo: 88 },
    { date: 'Thu', score: 86, security: 91, performance: 80, seo: 87 },
    { date: 'Fri', score: 92, security: 96, performance: 88, seo: 92 },
    { date: 'Sat', score: 95, security: 98, performance: 92, seo: 95 },
    { date: 'Sun', score: 97, security: 99, performance: 95, seo: 97 },
  ],
  '30d': [
    { date: 'Day 5', score: 78, security: 88, performance: 72, seo: 80 },
    { date: 'Day 10', score: 82, security: 90, performance: 75, seo: 83 },
    { date: 'Day 15', score: 86, security: 93, performance: 79, seo: 86 },
    { date: 'Day 20', score: 89, security: 95, performance: 84, seo: 90 },
    { date: 'Day 25', score: 94, security: 97, performance: 90, seo: 94 },
    { date: 'Day 30', score: 97, security: 99, performance: 95, seo: 97 },
  ],
  '90d': [
    { date: 'Month 1', score: 75, security: 85, performance: 70, seo: 78 },
    { date: 'Month 2', score: 85, security: 92, performance: 81, seo: 86 },
    { date: 'Month 3', score: 97, security: 99, performance: 95, seo: 97 },
  ]
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B111A]/95 backdrop-blur-xl border border-white/15 px-4 py-3 shadow-2xl rounded-xl font-mono text-xs space-y-2">
        <div className="text-muted-foreground flex items-center gap-2 border-b border-white/10 pb-1.5">
          <span className="size-2 rounded-full bg-[var(--chart-cyan-bright)] animate-pulse" />
          <span className="text-foreground font-semibold">{label}</span>
        </div>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-6">
              <span className="text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.dataKey}:
              </span>
              <span className="font-bold text-sm tracking-tight" style={{ color: entry.color }}>
                {entry.value} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const TelemetryInsights: React.FC<{ targetDomain?: string }> = ({ targetDomain = 'acme-mesh.prod' }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [visibleSeries, setVisibleSeries] = useState<{ score: boolean; security: boolean; performance: boolean; seo: boolean }>({
    score: true,
    security: true,
    performance: true,
    seo: false,
  });

  const toggleSeries = (key: 'score' | 'security' | 'performance' | 'seo') => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentData = timeRangeData[timeRange];

  // Dynamic trends based on selected time range
  const trends = {
    '7d': { score: '+4.2% vs last week', security: '+1.5% vs last week', latency: '-12.4% vs last week', scoreUp: true, secUp: true, latImprove: true },
    '30d': { score: '+8.6% vs last month', security: '+3.2% vs last month', latency: '-18.1% vs last month', scoreUp: true, secUp: true, latImprove: true },
    '90d': { score: '+14.2% vs prior quarter', security: '+5.4% vs prior quarter', latency: '-24.5% vs prior quarter', scoreUp: true, secUp: true, latImprove: true },
  }[timeRange];

  return (
    <div className="ds-card p-6 rounded-2xl bg-surface border border-border space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#0066FF]/10 text-[var(--chart-blue)]">
              <Activity className="size-5" />
            </span>
            <h3 className="framer-card-title text-foreground font-semibold">Telemetry Insights</h3>
          </div>
          <p className="framer-body-text text-xs text-muted-foreground mt-1">
            Audit score progression and mesh telemetry for <span className="text-foreground font-mono">{targetDomain}</span>
          </p>
        </div>

        {/* Time-Range Dropdown Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/50 border border-border text-xs font-mono text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
            <Calendar className="size-3.5 text-accent-bright" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              aria-label="Select time range"
              className="bg-transparent text-foreground focus:outline-none cursor-pointer font-mono"
            >
              <option value="7d" className="bg-background text-foreground">Last 7 days</option>
              <option value="30d" className="bg-background text-foreground">Last 30 days</option>
              <option value="90d" className="bg-background text-foreground">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary Row with Percentage-Based Trend Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-background/40 border border-border">
          <div className="text-[11px] font-mono text-muted-foreground uppercase">Current Health Score</div>
          <div className="text-2xl font-bold text-foreground mt-1 flex flex-wrap items-center gap-2">
            <span>97%</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="size-3" /> {trends.score}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-background/40 border border-border">
          <div className="text-[11px] font-mono text-muted-foreground uppercase">OWASP Security Grade</div>
          <div className="text-2xl font-bold text-foreground mt-1 flex flex-wrap items-center gap-2">
            <span>A+</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="size-3" /> {trends.security}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-background/40 border border-border">
          <div className="text-[11px] font-mono text-muted-foreground uppercase">Edge Latency P95</div>
          <div className="text-2xl font-bold text-foreground mt-1 flex flex-wrap items-center gap-2">
            <span>28ms</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingDown className="size-3" /> {trends.latency}
            </span>
          </div>
        </div>
      </div>

      {/* Series Visibility Toggles */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
        <span className="text-[11px] font-mono uppercase text-muted-foreground mr-1">Data Series:</span>
        {[
          { key: 'score', label: 'Score', color: 'var(--chart-blue)' },
          { key: 'security', label: 'Security', color: 'var(--chart-green)' },
          { key: 'performance', label: 'Performance', color: 'var(--chart-cyan-bright)' },
          { key: 'seo', label: 'SEO', color: 'var(--chart-violet)' },
        ].map((s) => {
          const isActive = visibleSeries[s.key as keyof typeof visibleSeries];
          return (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key as any)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                isActive
                  ? 'bg-foreground/10 text-foreground border-border shadow-xs'
                  : 'bg-background/20 text-muted-foreground border-border/40 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.label}</span>
              {isActive && <Check className="size-3 text-accent-bright ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Recharts Area Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-blue)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--chart-blue)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-green)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--chart-green)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-cyan-bright)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--chart-cyan-bright)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSeo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-violet)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--chart-violet)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
            />
            <YAxis 
              stroke="#888888" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
              domain={[60, 100]} 
            />
            <Tooltip content={<CustomTooltip />} />
            
            {visibleSeries.score && (
              <Area 
                type="monotone" 
                dataKey="score" 
                name="Score"
                stroke="var(--chart-blue)" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorScore)"
                isAnimationActive={true}
                animationDuration={1200}
                dot={{ r: 4, fill: 'var(--chart-blue)', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: 'var(--chart-blue)', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
            {visibleSeries.security && (
              <Area 
                type="monotone" 
                dataKey="security" 
                name="Security"
                stroke="var(--chart-green)" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorSecurity)"
                isAnimationActive={true}
                animationDuration={1200}
                dot={{ r: 4, fill: 'var(--chart-green)', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: 'var(--chart-green)', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
            {visibleSeries.performance && (
              <Area 
                type="monotone" 
                dataKey="performance" 
                name="Performance"
                stroke="var(--chart-cyan-bright)" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorPerformance)"
                isAnimationActive={true}
                animationDuration={1200}
                dot={{ r: 4, fill: 'var(--chart-cyan-bright)', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: 'var(--chart-cyan-bright)', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
            {visibleSeries.seo && (
              <Area 
                type="monotone" 
                dataKey="seo" 
                name="SEO"
                stroke="var(--chart-violet)" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorSeo)"
                isAnimationActive={true}
                animationDuration={1200}
                dot={{ r: 4, fill: 'var(--chart-violet)', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: 'var(--chart-violet)', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TelemetryInsights;
