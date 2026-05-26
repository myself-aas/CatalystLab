'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, Search, Zap, Clock, BrainCircuit, FileText, FileSpreadsheet, ClipboardList, Mail, CheckSquare } from 'lucide-react';
import Markdown from 'react-markdown';

interface Session {
  id: string;
  title: string;
  instrumentName: string;
  duration: number;
  input: string;
  output: string;
  tldr: string;
  noveltyScore: number;
  googleDocUrl?: string;
  googleSheetUrl?: string;
  googleFormUrl?: string;
  googleGmailRecipient?: string;
  googleTaskId?: string;
  createdAt: any;
}

export default function StudyRoomPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKeyword, setFilterKeyword] = useState('');

  useEffect(() => {
    async function loadSessions() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'sessions'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Session[];
        setSessions(data);
      } catch (err) {
        console.error('Error fetching study sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [user]);

  // Aggregate duration by day
  const chartData = React.useMemo(() => {
    const daily: Record<string, number> = {};
    sessions.forEach(s => {
      let dateStr = 'Unknown';
      if (s.createdAt?.toDate) {
        dateStr = s.createdAt.toDate().toLocaleDateString();
      } else if (s.createdAt) {
        dateStr = new Date(s.createdAt).toLocaleDateString();
      }
      
      const sessionDuration = s.duration || 15; // default 15 min if 0

      daily[dateStr] = (daily[dateStr] || 0) + sessionDuration;
    });

    return Object.entries(daily).map(([date, duration]) => ({
      date,
      duration
    })).reverse(); // Oldest first for chart
  }, [sessions]);

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    const kw = filterKeyword.toLowerCase();
    if (!kw) return true;
    return (
      (s.title || '').toLowerCase().includes(kw) ||
      (s.instrumentName || '').toLowerCase().includes(kw) ||
      (s.input || '').toLowerCase().includes(kw)
    );
  });

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 max-h-[calc(100vh-8rem)]">
      {/* Left side - Chart & Analytics */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6 overflow-y-auto">
        <div className="bg-white border border-[#68BA7F]/30 rounded-[1.5rem] p-6 flex flex-col shrink-0 shadow-lg">
          <h2 className="text-lg font-bold text-[#253D2C] uppercase tracking-widest flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-[#2E6F40]" />
            Study Progress
          </h2>
          <div className="w-full h-64">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}m`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      itemStyle={{ color: '#0f172a' }}
                    />
                    <Bar dataKey="duration" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="w-full h-full flex items-center justify-center text-[#2E6F40]/70 italic text-sm">
                  No study data available yet.
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Right side - Filterable Sessions List */}
      <div className="w-full xl:w-2/3 flex flex-col bg-white border border-[#68BA7F]/30 rounded-[1.5rem] overflow-hidden shrink-0 shadow-lg">
        <div className="p-4 border-b border-[#68BA7F]/30 bg-[#F4F9F5] flex items-center justify-between gap-4">
          <h2 className="font-bold text-[#253D2C] uppercase text-sm tracking-widest flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#2E6F40]" /> Session Logs
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2E6F40]/60" />
            <input 
              type="text"
              placeholder="Filter by paper/keyword..."
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              className="w-full bg-white border border-[#68BA7F]/40 rounded-[1rem] pl-10 pr-4 py-2 text-sm text-[#253D2C] placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-lg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {loading ? (
              <div className="flex items-center justify-center h-full text-[#2E6F40]">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
           ) : filteredSessions.length > 0 ? (
              filteredSessions.map(session => (
                <div key={session.id} className="bg-[#F4F9F5] border border-[#68BA7F]/30 rounded-[1.25rem] p-5 space-y-4 shadow-lg hover:border-[#68BA7F]/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#253D2C] capitalize">{session.instrumentName || session.title}</h3>
                      <p className="text-xs text-[#2E6F40]/70 font-mono mt-1">
                        {session.createdAt?.toDate ? session.createdAt.toDate().toLocaleString() : new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {session.googleDocUrl && (
                        <a 
                          href={session.googleDocUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#2E6F40] bg-white border border-[#68BA7F]/40 hover:bg-[#F4F9F5] rounded-xl shadow-sm transition-all"
                          title="Open exported Google Document"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Doc</span>
                        </a>
                      )}
                      {session.googleSheetUrl && (
                        <a 
                          href={session.googleSheetUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#2E6F40] bg-white border border-[#68BA7F]/40 hover:bg-[#F4F9F5] rounded-xl shadow-sm transition-all"
                          title="Open exported Google Spreadsheet mapping database"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Sheet</span>
                        </a>
                      )}
                      {session.googleFormUrl && (
                        <a 
                          href={session.googleFormUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#2E6F40] bg-white border border-[#68BA7F]/40 hover:bg-[#F4F9F5] rounded-xl shadow-sm transition-all"
                          title="Open peer evaluation Google Form questionnaire"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Form</span>
                        </a>
                      )}
                      {session.googleGmailRecipient && (
                        <div 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#EAB308] bg-[#FEF08A]/40 border border-[#EAB308]/30 rounded-xl shadow-sm cursor-help"
                          title={`Report emailed via Gmail to ${session.googleGmailRecipient}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Emailed</span>
                        </div>
                      )}
                      {session.googleTaskId && (
                        <div 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#8B5CF6] bg-[#EDE9FE] border border-[#8B5CF6]/30 rounded-xl shadow-sm cursor-help"
                          title="Action item added to Google Tasks"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Task</span>
                        </div>
                      )}
                      {session.noveltyScore !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#253D2C] bg-[#CFFFDC] px-2.5 py-1 rounded-full">
                          <Zap className="w-3.5 h-3.5" />
                          {session.noveltyScore}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-[#2E6F40]/80 line-clamp-2">
                    <span className="font-semibold text-[#253D2C]/90">Input: </span>
                    {session.input}
                  </div>

                  {session.tldr && (
                    <div className="px-4 py-3 bg-[#CFFFDC]/40 border border-[#68BA7F]/30 rounded-[1rem]">
                      <span className="text-xs font-bold text-[#2E6F40] uppercase tracking-widest block mb-1">TL;DR</span>
                      <p className="text-sm text-[#253D2C]/80">{session.tldr}</p>
                    </div>
                  )}
                </div>
              ))
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-[#2E6F40]/70 italic text-sm py-12">
               No matching sessions found.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
