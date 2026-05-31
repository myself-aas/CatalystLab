'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, Search, Zap, Clock, BrainCircuit, FileText, FileSpreadsheet, ClipboardList, Mail, CheckSquare, MessageCircle, Send, Trash2, Target, Trophy, Edit2, Check, X } from 'lucide-react';
import Markdown from 'react-markdown';

interface Session {
  id: string;
  uid: string;
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

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

function SessionComments({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'sessions', sessionId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(parsed);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      await addDoc(collection(db, 'sessions', sessionId, 'comments'), {
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Researcher',
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'sessions', sessionId, 'comments', commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#68BA7F]/20 space-y-4">
      <h4 className="text-xs font-bold text-[#2E6F40] uppercase tracking-widest flex items-center gap-2">
        <MessageCircle className="w-3.5 h-3.5" /> Team Discussion
      </h4>
      
      {loading ? (
        <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-[#2E6F40]" /></div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(c => (
             <div key={c.id} className="bg-white border border-[#68BA7F]/20 rounded-xl p-3 flex justify-between group">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="font-bold text-xs text-[#253D2C]">{c.authorName}</span>
                   <span className="text-[10px] text-[#2E6F40]/60">
                     {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : ''}
                   </span>
                 </div>
                 <p className="text-sm text-[#253D2C]/90">{c.content}</p>
               </div>
               {user?.uid === c.authorId && (
                 <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
               )}
             </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-[#2E6F40]/60 italic">No comments yet. Start the discussion!</div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text" 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..." 
          className="flex-1 bg-white border border-[#68BA7F]/40 rounded-xl px-3 py-2 text-sm text-[#253D2C] focus:outline-none focus:border-[#2E6F40] transition-colors"
        />
        <button type="submit" disabled={!newComment.trim()} className="bg-[#2E6F40] hover:bg-[#1E4D2B] text-white p-2 rounded-xl disabled:opacity-50 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function GoalWidget({ sessions, userId }: { sessions: Session[], userId: string }) {
  const STORAGE_KEY = `catalyst_goal_${userId}`;
  
  const [isEditing, setIsEditing] = useState(false);
  const [goalType, setGoalType] = useState<'daily' | 'weekly'>('daily');
  const [goalAmount, setGoalAmount] = useState<number>(60);
  
  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.type) setGoalType(parsed.type);
        if (parsed.amount) setGoalAmount(parsed.amount);
      } catch(e) {}
    }
  }, [STORAGE_KEY]);

  const saveGoal = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: goalType, amount: goalAmount }));
    setIsEditing(false);
  };

  const progress = useMemo(() => {
    const now = new Date();
    if (goalType === 'daily') {
      const todaySessions = sessions.filter(s => {
        const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
        return d.toDateString() === now.toDateString();
      });
      return todaySessions.reduce((acc, s) => acc + (s.duration || 15), 0);
    } else {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekSessions = sessions.filter(s => {
        const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
        return d >= oneWeekAgo;
      });
      return weekSessions.reduce((acc, s) => acc + (s.duration || 15), 0);
    }
  }, [sessions, goalType]);

  const percentage = Math.min(Math.round((progress / goalAmount) * 100), 100);
  const isCompleted = progress >= goalAmount;

  return (
    <div className="bg-gradient-to-br from-[#2E6F40] to-[#1E4D2B] rounded-[1.5rem] p-6 text-white shadow-lg relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#CFFFDC]" /> Study Goals
        </h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-white/70 hover:text-white transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 relative z-10 bg-black/20 p-4 rounded-xl border border-white/10">
          <div>
            <label className="text-xs text-white/70 block mb-1">Target Type</label>
            <select 
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as 'daily' | 'weekly')}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CFFFDC]"
            >
              <option value="daily">Daily Target</option>
              <option value="weekly">Weekly Target (Last 7 days)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/70 block mb-1">Target Minutes</label>
            <input 
              type="number"
              min="1"
              value={goalAmount}
              onChange={(e) => setGoalAmount(parseInt(e.target.value) || 0)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CFFFDC]"
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <button onClick={saveGoal} className="bg-[#CFFFDC] text-[#1E4D2B] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-white transition-colors">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-3xl font-bold font-mono tracking-tighter">
                {progress} <span className="text-base text-white/70 font-sans tracking-normal">/ {goalAmount} min</span>
              </div>
              <p className="text-xs text-[#CFFFDC] font-medium capitalize pr-2">{goalType} Progress</p>
            </div>
            {isCompleted && (
              <div className="bg-[#CFFFDC]/20 text-[#CFFFDC] text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Reached!
              </div>
            )}
          </div>
          
          <div className="h-3 w-full bg-black/20 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-[#CFFFDC]' : 'bg-green-400'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-right text-xs font-mono text-white/70">
            {percentage}%
          </div>
        </div>
      )}
    </div>
  );
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
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left side - Chart & Analytics & Goals */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6 pr-2 pb-6">
        
        {user && <GoalWidget sessions={sessions} userId={user.uid} />}

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

        <div className="p-4 space-y-4">
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

                  <SessionComments sessionId={session.id} />
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
