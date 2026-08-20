import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Activity, Users, Clock, Globe, ArrowUpRight, ArrowDownRight, 
  Smartphone, Monitor, Bell, Mail, Hash, MousePointerClick
} from 'lucide-react';
import type { AuditReport } from '../../types';

interface UserAnalyticsDashboardProps {
  reports: AuditReport[];
}

const COLORS = ['#0b192c', '#415a77', '#c5d3e8', '#38bdf8', '#0ea5e9'];

// Mock Analytics Data for demonstration
const visitorData = [
  { time: '00:00', visitors: 1200, views: 1800, bounceRate: 45 },
  { time: '04:00', visitors: 800, views: 1200, bounceRate: 42 },
  { time: '08:00', visitors: 3200, views: 5400, bounceRate: 35 },
  { time: '12:00', visitors: 4800, views: 7600, bounceRate: 38 },
  { time: '16:00', visitors: 5600, views: 9200, bounceRate: 41 },
  { time: '20:00', visitors: 4100, views: 6100, bounceRate: 39 },
  { time: '23:59', visitors: 2800, views: 4200, bounceRate: 44 },
];

const sourceData = [
  { name: 'Direct', value: 45 },
  { name: 'Google', value: 35 },
  { name: 'Twitter', value: 12 },
  { name: 'GitHub', value: 8 },
];

const deviceData = [
  { name: 'Desktop', value: 65 },
  { name: 'Mobile', value: 30 },
  { name: 'Tablet', value: 5 },
];

const browserData = [
  { name: 'Chrome', visitors: 45000 },
  { name: 'Safari', visitors: 28000 },
  { name: 'Firefox', visitors: 12000 },
  { name: 'Edge', visitors: 8000 },
];

const MetricCard = ({ title, value, change, isPositive, icon: Icon, subtitle }: any) => (
  <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#415a77] uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-[#0b192c] font-mono">{value}</h3>
      </div>
      <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
        {change}%
      </div>
      <span className="text-[11px] text-[#64748b]">{subtitle}</span>
    </div>
  </div>
);

export const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ reports }) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [realtimeVisitors, setRealtimeVisitors] = useState(342);

  // Simulate real-time fluctuation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeVisitors(prev => prev + Math.floor(Math.random() * 11) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#0b192c] flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#415a77]" />
            Real-Time Analytics & APM
          </h2>
          <p className="text-xs text-[#415a77] mt-1">Unified telemetry pipeline (Google Analytics, Plausible, Cloudflare metrics).</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Realtime Pulse */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-700">{realtimeVisitors} Active Now</span>
          </div>

          <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-1 text-xs font-bold">
            {['24h', '7d', '30d', 'all'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t as any)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  timeframe === t ? 'bg-white text-[#0b192c] shadow-sm' : 'text-[#415a77] hover:bg-[#e2e8f0]'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title="Unique Visitors" 
          value="124.5K" 
          change="12.5" 
          isPositive={true} 
          icon={Users} 
          subtitle="vs previous 7 days" 
        />
        <MetricCard 
          title="Total Pageviews" 
          value="452.1K" 
          change="8.2" 
          isPositive={true} 
          icon={MousePointerClick} 
          subtitle="vs previous 7 days" 
        />
        <MetricCard 
          title="Bounce Rate" 
          value="42.3%" 
          change="2.1" 
          isPositive={false} 
          icon={Activity} 
          subtitle="vs previous 7 days" 
        />
        <MetricCard 
          title="Avg Session Duration" 
          value="2m 45s" 
          change="15.3" 
          isPositive={true} 
          icon={Clock} 
          subtitle="vs previous 7 days" 
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Traffic Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#0b192c]">Traffic Overview (Visitors vs Views)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b192c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0b192c" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="views" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="visitors" stroke="#0b192c" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device & OS Breakdowns */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-[#0b192c] mb-4">Device Distribution</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#0b192c', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-[#0b192c] mb-4">Top Sources</h3>
            <div className="space-y-4">
              {sourceData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#0b192c]">{item.name}</span>
                    <span className="text-[#415a77]">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${item.value}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Configuration & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Browsers Chart */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0b192c] mb-6">Top Browsers by Visitors</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={browserData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="visitors" fill="#415a77" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications & Alerts Setup */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0b192c] mb-1">Instant Alert & Webhook Pipeline</h3>
            <p className="text-xs text-[#64748b] mb-6">Configure thresholds for anomaly detection and downtime. Integrate via Slack, Discord, or Email.</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-[#E5F1FB] flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[#0052cc]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0b192c]">Email Alerts</h4>
                    <p className="text-[10px] text-[#64748b]">Daily summaries & critical downtime</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-[#0b192c] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-[#F4EDE4] flex items-center justify-center">
                    <Hash className="h-4 w-4 text-[#4A154B]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0b192c]">Slack Webhook</h4>
                    <p className="text-[10px] text-[#64748b]">#eng-alerts channel integration</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-[#0b192c] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-[#e8e9fb] flex items-center justify-center">
                    {/* SVG standard icon for discord approximation */}
                    <Globe className="h-4 w-4 text-[#5865F2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0b192c]">Discord Webhook</h4>
                    <p className="text-[10px] text-[#64748b]">Real-time audit failures</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-[#cbd5e1] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
                </div>
              </div>
            </div>
          </div>
          
          <button className="mt-6 w-full rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] py-2.5 text-xs font-bold text-[#0b192c] hover:bg-[#e2e8f0] transition-colors">
            Configure Advanced Webhooks
          </button>
        </div>

      </div>
    </div>
  );
};
