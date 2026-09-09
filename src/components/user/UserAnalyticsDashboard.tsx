import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Clock, Globe, ArrowUpRight } from 'lucide-react';
import type { AuditReport } from '../../types';
import { motion } from 'motion/react';

interface UserAnalyticsDashboardProps {
  reports?: AuditReport[];
}

const BRAND_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6'];

const mockTraffic = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 550 },
  { name: 'Thu', value: 450 },
  { name: 'Fri', value: 700 },
  { name: 'Sat', value: 650 },
  { name: 'Sun', value: 800 },
];

export const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ reports }) => {
  return (
    <div className="flex flex-col space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="framer-micro-tag text-[#0066FF] mb-1">Global Telemetry</div>
          <h2 className="framer-card-title text-white">Analytics Overview</h2>
          <p className="framer-body-text text-sm mt-1">Real-time performance and usage metrics across the mesh.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Audits', value: reports?.length || 0, icon: Activity, color: 'text-[#0066FF]', bg: 'bg-[#0066FF]/10' },
          { label: 'Avg Latency', value: '124ms', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Global Reach', value: '12 Regions', icon: Globe, color: 'text-[#00D2FF]', bg: 'bg-[#00D2FF]/10' },
          { label: 'Active Users', value: '4,291', icon: Users, color: 'text-[#8A2BE2]', bg: 'bg-[#8A2BE2]/10' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="ds-card p-5 group hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} border border-white/5`}>
                <stat.icon className="size-5" />
              </div>
              <span className="flex items-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <ArrowUpRight className="size-3 mr-1" />
                12%
              </span>
            </div>
            <div>
              <p className="framer-micro-tag opacity-60">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-2 ds-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="framer-card-title text-white">Weekly Traffic</h3>
            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg font-mono text-[10px]">
              {['7D', '30D', '90D'].map((t) => (
                <button key={t} className={`px-2 py-1 rounded ${t === '7D' ? 'bg-white/10 text-white' : 'text-muted-foreground'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTraffic}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} 
                  dx={-10} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                  labelStyle={{ color: '#666', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0066FF" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="ds-card p-6"
        >
          <h3 className="framer-card-title text-white mb-6">Device Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Desktop', value: 400 },
                    { name: 'Mobile', value: 300 },
                    { name: 'Tablet', value: 300 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockTraffic.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
