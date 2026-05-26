'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ArrowRight, Beaker, FileBox, Search } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const ZONE_MAPPING: Record<string, string> = {
  'Thought Collider': 'Idea Catalyst',
  'Research Multiverse': 'Idea Catalyst',
  'Concept Alchemy': 'Idea Catalyst',
  'Assumption Excavator': 'Idea Catalyst',
  'Divergent Dialectic': 'Idea Catalyst',
  'Phenomenon Prism': 'Idea Catalyst',
  'Paradigm Disruptor': 'Idea Catalyst',

  'Pressure Chamber': 'Analytical Foundry',
  'Contradiction Finder': 'Analytical Foundry',
  'Metaphorical Bridge': 'Analytical Foundry',
  'Boundary Scalpel': 'Analytical Foundry',
  'Methodological Replicator': 'Analytical Foundry',
  'Vulnerability Auditor': 'Analytical Foundry',
  'Heuristic Decoupler': 'Analytical Foundry',

  'Temporal Telescope': 'Strategic Discovery',
  'Serendipity Radar': 'Strategic Discovery',
  'Horizon Mapper': 'Strategic Discovery',
  'Interdisciplinary Loom': 'Strategic Discovery',
  'Literature Navigator': 'Strategic Discovery',
  'Cognitive Cartographer': 'Strategic Discovery',
  'Vanguard Signal': 'Strategic Discovery',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sessions = payload[0].payload.sessions;
    let label = 'Quiet Focus';
    let labelColor = 'text-gray-500';
    let indicatorBg = 'bg-[#E4E9E5]';
    
    if (sessions === 1) {
      label = 'Moderate Momentum';
      labelColor = 'text-[#68BA7F] font-semibold';
      indicatorBg = 'bg-[#68BA7F]';
    } else if (sessions === 2) {
      label = 'Strong Study Focus';
      labelColor = 'text-[#2E6F40] font-bold';
      indicatorBg = 'bg-[#2E6F40]';
    } else if (sessions >= 3) {
      label = 'Peak Discovery';
      labelColor = 'text-[#EAB308] font-black';
      indicatorBg = 'bg-[#EAB308]';
    }

    return (
      <div className="bg-white border border-[#68BA7F]/30 p-4 rounded-[1.25rem] shadow-xl text-xs text-[#253D2C] space-y-1.5 min-w-[210px]">
        <p className="text-gray-400 font-medium">{payload[0].payload.fullDate}</p>
        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="font-bold flex items-center gap-1.5 text-sm text-[#253D2C]">
            <span className={`w-2.5 h-2.5 rounded-full ${indicatorBg} inline-block`} />
            {payload[0].value} {payload[0].value === 1 ? 'Session' : 'Sessions'}
          </p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#F4F9F5] border border-[#68BA7F]/20 ${labelColor}`}>
            {label}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const PIE_COLORS = ['#68BA7F', '#EAB308', '#2E6F40', '#B8C6BC'];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) return;
      try {
        // Fetch sessions for the recent activity list
        const qRecent = query(
          collection(db, 'sessions'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snapRecent = await getDocs(qRecent);
        setRecentSessions(snapRecent.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch all user sessions to calculate date-wise statistics for last 30 days
        const qAll = query(
          collection(db, 'sessions'),
          where('uid', '==', user.uid)
        );
        const snapAll = await getDocs(qAll);
        const allSessions = snapAll.docs.map(doc => {
          const data = doc.data();
          let dateVal: Date;
          if (data.createdAt?.toDate) {
            dateVal = data.createdAt.toDate();
          } else if (data.createdAt?.toMillis) {
            dateVal = new Date(data.createdAt.toMillis());
          } else if (data.createdAt) {
            dateVal = new Date(data.createdAt);
          } else {
            dateVal = new Date();
          }
          return {
            id: doc.id,
            ...data,
            dateValue: dateVal
          };
        });

        // Construct chronologically ordered 30-day activity datasets
        const chartDataArray = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
          
          // Filter sessions matching this specific day
          const sessionsOnDay = allSessions.filter(s => {
            return s.dateValue.getDate() === d.getDate() &&
                   s.dateValue.getMonth() === d.getMonth() &&
                   s.dateValue.getFullYear() === d.getFullYear();
          });
          
          chartDataArray.push({
            date: dateStr,
            sessions: sessionsOnDay.length,
            fullDate: d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          });
        }
        setChartData(chartDataArray);

        // Calculate distribution
        const counts: Record<string, number> = {
          'Idea Catalyst': 0,
          'Analytical Foundry': 0,
          'Strategic Discovery': 0,
          'Uncategorized': 0
        };

        allSessions.forEach(s => {
          const cat = ZONE_MAPPING[s.instrumentName] || 'Uncategorized';
          counts[cat]++;
        });

        const pieData = Object.entries(counts)
          .filter(([_, count]) => count > 0)
          .map(([name, value]) => ({ name, value }));

        setCategoryData(pieData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#253D2C]">Welcome back, {user?.displayName?.split(' ')[0] || 'Researcher'}</h1>
        <p className="text-[#2E6F40]/80">Ready to break through the edge of knowledge?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/instruments" className="p-6 rounded-[1.5rem] bg-[#CFFFDC]/40 border border-[#68BA7F]/50 hover:bg-[#CFFFDC] transition-all group shadow-lg">
          <div className="w-10 h-10 rounded-[1.25rem] bg-[#CFFFDC] flex items-center justify-center mb-4">
            <Beaker className="w-5 h-5 text-[#2E6F40]" />
          </div>
          <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Launch Instrument</h2>
          <p className="text-sm text-[#2E6F40]/80">Pick from 21 specialized AI tools</p>
        </Link>
        <Link href="/search" className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/40 hover:shadow-lg transition-all group shadow-lg">
          <div className="w-10 h-10 rounded-[1.25rem] bg-[#CFFFDC] flex items-center justify-center mb-4">
            <Search className="w-5 h-5 text-[#2E6F40]" />
          </div>
          <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Literature Search</h2>
          <p className="text-sm text-[#2E6F40]/80">Search 9 academic sources directly</p>
        </Link>
        <Link href="/reports" className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/40 hover:shadow-lg transition-all group shadow-lg">
          <div className="w-10 h-10 rounded-[1.25rem] bg-[#CFFFDC] flex items-center justify-center mb-4">
            <FileBox className="w-5 h-5 text-[#2E6F40]" />
          </div>
          <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Saved Sessions</h2>
          <p className="text-sm text-[#2E6F40]/80">Review your past brainstorms</p>
        </Link>
      </div>

      {/* 30-Day Activity History Visualization */}
      <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#253D2C]">Research Activity Dynamics</h2>
            <p className="text-sm text-[#2E6F40]/70">Frequency of dynamic sessions created over the last 30 days</p>
          </div>
          <div className="text-sm font-semibold bg-[#CFFFDC] text-[#253D2C] px-3 py-1.5 rounded-[1rem] self-start sm:self-center border border-[#68BA7F]/30">
            Total: {chartData.reduce((acc, curr) => acc + curr.sessions, 0)} Sessions
          </div>
        </div>

        <div className="w-full space-y-4">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-[#2E6F40]/50 text-sm">
              Analyzing research history...
            </div>
          ) : mounted ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="intensity-gradient" x1="0" y1="0" x2="1" y2="0">
                      {chartData.map((d, i) => {
                        const offset = `${(i / (chartData.length - 1)) * 100}%`;
                        let stopColor = '#E4E9E5'; // Quiet state
                        if (d.sessions === 1) stopColor = '#68BA7F'; // Moderate Study
                        else if (d.sessions === 2) stopColor = '#2E6F40'; // Solid active
                        else if (d.sessions >= 3) stopColor = '#EAB308'; // Peak breakthrough
                        return (
                          <stop key={i} offset={offset} stopColor={stopColor} />
                        );
                      })}
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#68BA7F" strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#2E6F40" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10} 
                    opacity={0.8}
                  />
                  <YAxis 
                    stroke="#2E6F40" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    allowDecimals={false}
                    dx={-5}
                    opacity={0.8}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="url(#intensity-gradient)" 
                    strokeWidth={4.5} 
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      let fillVal = '#E4E9E5';
                      let strokeVal = '#B8C6BC';
                      if (payload.sessions === 1) {
                        fillVal = '#68BA7F';
                        strokeVal = '#2E6F40';
                      } else if (payload.sessions === 2) {
                        fillVal = '#2E6F40';
                        strokeVal = '#1B4326';
                      } else if (payload.sessions >= 3) {
                        fillVal = '#EAB308';
                        strokeVal = '#A16207';
                      }
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4.5}
                          stroke={strokeVal}
                          strokeWidth={1.5}
                          fill={fillVal}
                          key={`dot-${payload.date}`}
                        />
                      );
                    }}
                    activeDot={(props: any) => {
                      const { cx, cy, payload } = props;
                      let fillVal = '#E4E9E5';
                      let strokeVal = '#B8C6BC';
                      if (payload.sessions === 1) {
                        fillVal = '#68BA7F';
                        strokeVal = '#2E6F40';
                      } else if (payload.sessions === 2) {
                        fillVal = '#2E6F40';
                        strokeVal = '#1B4326';
                      } else if (payload.sessions >= 3) {
                        fillVal = '#EAB308';
                        strokeVal = '#A16207';
                      }
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6.5}
                          stroke={strokeVal}
                          strokeWidth={2.5}
                          fill={fillVal}
                          key={`active-dot-${payload.date}`}
                        />
                      );
                    }}
                    isAnimationActive={true}
                    animationDuration={1200}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Dynamic Heatmap Legend */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#68BA7F]/10 text-xs text-[#2E6F40]/70">
                <span className="font-semibold text-[#253D2C]/80">Research Intensity Spectrum:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#E4E9E5] border border-gray-300 inline-block" />
                  <span>Quiet Focus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#68BA7F] inline-block" />
                  <span>Moderate Work (1)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#2E6F40] inline-block" />
                  <span>Active Study (2)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#EAB308] inline-block" />
                  <span>Peak Discovery (3+)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[300px]" />
          )}
        </div>
      </div>

      {/* Instrument Usage Distribution Visualization */}
      <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#253D2C]">Instrument Distribution</h2>
            <p className="text-sm text-[#2E6F40]/70">Breakdown of research sessions by methodology category</p>
          </div>
        </div>

        <div className="w-full flex items-center justify-center h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-[#2E6F40]/50 text-sm">
              Analyzing distribution...
            </div>
          ) : mounted && categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(104, 186, 127, 0.3)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#253D2C', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#2E6F40' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#2E6F40]/50 text-sm">
              No distribution data available yet.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#253D2C]">Recent Activities</h2>
          <Link href="/reports" className="text-sm font-medium text-[#2E6F40] hover:text-[#253D2C] flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="text-[#2E6F40]/70 text-sm">Loading latest sessions...</div>
        ) : recentSessions.length === 0 ? (
          <div className="p-8 text-center rounded-[1.5rem] bg-white border border-dashed border-[#68BA7F]/40">
            <p className="text-[#2E6F40]/70">No sessions yet. Run your first instrument to get started.</p>
            <Link href="/instruments" className="inline-block mt-4 px-4 py-2 bg-[#2E6F40] text-white text-sm font-medium rounded-[1rem] hover:bg-[#253D2C]">
              Browse Instruments
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSessions.map(session => (
              <div key={session.id} className="p-4 rounded-[1.25rem] bg-white border border-[#68BA7F]/30 shadow-lg flex items-center justify-between hover:border-[#68BA7F]/50 transition-colors">
                <div>
                  <h3 className="font-medium text-[#253D2C]">{session.instrumentName || 'Instrument Session'}</h3>
                  <p className="text-sm text-[#2E6F40]/70 mt-1">{new Date(session.createdAt?.toMillis?.() || Date.now()).toLocaleDateString()}</p>
                </div>
                <Link href={`/reports/${session.id}`} className="px-4 py-2 bg-[#CFFFDC]/60 hover:bg-[#CFFFDC] rounded-[1rem] text-sm font-medium text-[#253D2C]/80 transition-colors">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
