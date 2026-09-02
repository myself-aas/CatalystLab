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
    <div className="flex flex-col space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6 bg-muted text-foreground rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">Monitor your audit performance and traffic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Audits', value: reports?.length || 0, icon: Activity, color: 'text-blue-500' },
          { label: 'Avg Latency', value: '124ms', icon: Clock, color: 'text-emerald-500' },
          { label: 'Global Reach', value: '12 Regions', icon: Globe, color: 'text-indigo-500' },
          { label: 'Active Users', value: '4,291', icon: Users, color: 'text-rose-500' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="p-5 bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                12%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 p-6 bg-background border border-border rounded-2xl shadow-sm"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Weekly Traffic</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTraffic}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-background border border-border rounded-2xl shadow-sm"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Device Distribution</h3>
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
