'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ArrowRight, Beaker, FileBox, Search, Layers } from 'lucide-react';
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/instruments" className="p-6 rounded-[1.5rem] bg-[#CFFFDC]/40 border border-[#68BA7F]/50 hover:bg-[#CFFFDC] transition-all group shadow-lg flex flex-col items-start">
          <div className="w-10 h-10 rounded-[1.25rem] bg-[#CFFFDC] flex items-center justify-center mb-4 border border-[#68BA7F]/20 group-hover:border-[#68BA7F]/40 transition-colors">
            <Beaker className="w-5 h-5 text-[#2E6F40]" />
          </div>
          <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Launch Instrument</h2>
          <p className="text-sm text-[#2E6F40]/80 leading-relaxed">Pick from 21 specialized AI tools</p>
        </Link>
        <Link href="/search" className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/50 hover:shadow-lg transition-all group shadow-lg flex flex-col items-start">
          <div className="w-10 h-10 rounded-[1.25rem] bg-[#F4F9F5] flex items-center justify-center mb-4 border border-[#68BA7F]/20 group-hover:border-[#68BA7F]/40 transition-colors">
            <Search className="w-5 h-5 text-[#2E6F40]" />
          </div>
          <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Literature Search</h2>
          <p className="text-sm text-[#2E6F40]/80 leading-relaxed">Search 17 academic sources directly</p>
        </Link>
        <Link href="/reports" className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/50 hover:shadow-lg transition-all group shadow-lg flex flex-col items-start">
          <div className="w-10 h-10 rounded-[1.25rem] bg-[#F4F9F5] flex items-center justify-center mb-4 border border-[#68BA7F]/20 group-hover:border-[#68BA7F]/40 transition-colors">
            <FileBox className="w-5 h-5 text-[#2E6F40]" />
          </div>
          <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Saved Sessions</h2>
          <p className="text-sm text-[#2E6F40]/80 leading-relaxed">Review your past brainstorms</p>
        </Link>
        <Link href="/zones" className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/50 hover:shadow-lg transition-all group shadow-lg flex flex-col items-start">
          <div className="w-10 h-10 rounded-[1.25rem] bg-[#F4F9F5] flex items-center justify-center mb-4 border border-[#68BA7F]/20 group-hover:border-[#68BA7F]/40 transition-colors">
            <Layers className="w-5 h-5 text-[#2E6F40]" />
          </div>
          <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Experimental Zones</h2>
          <p className="text-sm text-[#2E6F40]/80 leading-relaxed">Adaptive M3 expressive tab views</p>
        </Link>
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
