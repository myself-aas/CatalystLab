'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { collection, query, where, getDocs, limit, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { 
  ArrowRight, Beaker, FileBox, Search, Layers, 
  PenTool, Eye, Send, Loader2, Save, User, Bold, Italic, List, Link as LinkIcon, FileText,
  Heading1, Heading2, Quote, ListOrdered, Code, Braces, Image, Table, Minus, Strikethrough
} from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import Markdown from 'react-markdown';
import BlogCard from '../../../components/BlogCard';
import BlogTemplatesModal from '../../../components/BlogTemplatesModal';
import CreateTemplateModal from '../../../components/CreateTemplateModal';
import DataExplorer from '../search/page';

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
  
  // Tab selector state ('overview' | 'blogs' | 'search')
  const [activeTab, setActiveTab] = useState<'overview' | 'blogs' | 'search'>('overview');

  // --- OVERVIEW TAB STATE ---
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [mounted, setMounted] = useState(false);
  const PIE_COLORS = ['#68BA7F', '#EAB308', '#2E6F40', '#B8C6BC'];

  // --- BLOGS TAB STATE ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [posting, setPosting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set default active tab from query parameters safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'blogs') {
        setActiveTab('blogs');
      } else if (tabParam === 'search') {
        setActiveTab('search');
      }
    }
  }, []);

  // --- OVERVIEW DATA FETCHING ---
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
        setLoadingOverview(false);
      }
    }
    fetchDashboard();
  }, [user]);

  // --- BLOGS DATA FETCHING & AUTO-SAVE ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'drafts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Drafts subscription offline or error:", error);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user || (!title.trim() && !content.trim())) return;
      try {
        if (activeDraftId) {
             await updateDoc(doc(db, 'drafts', activeDraftId), {
                title,
                content,
                createdAt: serverTimestamp()
             });
        } else {
             const docRef = await addDoc(collection(db, 'drafts'), {
                authorId: user.uid,
                title,
                content,
                createdAt: serverTimestamp(),
              });
              setActiveDraftId(docRef.id);
        }
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user, title, content, activeDraftId]);

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Blogs subscription offline or error:", error);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setWordCount(content.trim().split(/\s+/).filter(Boolean).length);
  }, [content]);

  // Filtered research articles
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [blogs, searchQuery]);

  const handlePost = async () => {
    if (!user || !title.trim() || !content.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'blogs'), {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || null,
        title,
        content,
        tags,
        reactions: {like: 0, dislike: 0, insightful: 0, sad: 0, angry: 0, confused: 0, brainstorming: 0},
        favouriteCount: 0,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setTags([]);
      setIsPreview(false);
    } catch (err) {
      console.error('Error posting blog:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user || (!title.trim() && !content.trim())) return;
    setSavingDraft(true);
    try {
      if (activeDraftId) {
        await updateDoc(doc(db, 'drafts', activeDraftId), {
           title,
           content,
           createdAt: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, 'drafts'), {
          authorId: user.uid,
          title,
          content,
          createdAt: serverTimestamp(),
        });
        setActiveDraftId(docRef.id);
      }
      alert('Draft saved!');
    } catch (err) {
      console.error('Error saving draft:', err);
    } finally {
      setSavingDraft(false);
    }
  };

  const insertMarkdown = (syntax: string, wrapper = '') => {
    if (!contentRef.current) return;
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + `${syntax}${selected}${wrapper || syntax}` + text.substring(end);
    setContent(newText);
    textarea.focus();
    setTimeout(() => {
        textarea.selectionStart = start + syntax.length;
        textarea.selectionEnd = end + syntax.length;
    }, 0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Dynamic Header & Nested Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#68BA7F]/15 pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#253D2C]">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Researcher'}
          </h1>
          <p className="text-[#2E6F40]/80">Ready to break through the edge of knowledge?</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-[#F4F9F5] p-1.5 rounded-[1.25rem] border border-[#68BA7F]/20 self-start md:self-center shrink-0">
          <button
            onClick={() => {
              setActiveTab('overview');
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', '/dashboard');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-[#2E6F40] shadow-sm'
                : 'text-[#2E6F40]/75 hover:bg-white/40'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => {
              setActiveTab('blogs');
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', '/dashboard?tab=blogs');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'blogs'
                ? 'bg-white text-[#2E6F40] shadow-sm'
                : 'text-[#2E6F40]/75 hover:bg-white/40'
            }`}
          >
            RESEARCH BLOGS
          </button>
          <button
            onClick={() => {
              setActiveTab('search');
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', '/dashboard?tab=search');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-white text-[#2E6F40] shadow-sm'
                : 'text-[#2E6F40]/75 hover:bg-white/40'
            }`}
          >
            LITERATURE SEARCH
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Overview Tab Content */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="/instruments" className="p-6 rounded-[1.5rem] bg-[#CFFFDC]/40 border border-[#68BA7F]/50 hover:bg-[#CFFFDC] transition-all group shadow-lg flex flex-col items-start">
              <div className="w-10 h-10 rounded-[1.25rem] bg-[#CFFFDC] flex items-center justify-center mb-4 border border-[#68BA7F]/20 group-hover:border-[#68BA7F]/40 transition-colors">
                <Beaker className="w-5 h-5 text-[#2E6F40]" />
              </div>
              <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Launch Instrument</h2>
              <p className="text-sm text-[#2E6F40]/80 leading-relaxed">Pick from 21 specialized AI tools</p>
            </a>
            <button
              onClick={() => {
                setActiveTab('search');
                if (typeof window !== 'undefined') {
                  window.history.replaceState({}, '', '/dashboard?tab=search');
                }
              }}
              className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/50 hover:shadow-lg transition-all group shadow-lg flex flex-col items-start text-left cursor-pointer w-full"
            >
              <div className="w-10 h-10 rounded-[1.25rem] bg-[#F4F9F5] flex items-center justify-center mb-4 border border-[#68BA7F]/20 group-hover:border-[#68BA7F]/40 transition-colors">
                <Search className="w-5 h-5 text-[#2E6F40]" />
              </div>
              <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Literature Search</h2>
              <p className="text-sm text-[#2E6F40]/80 leading-relaxed">Search 17 academic sources directly</p>
            </button>
            <a href="/reports" className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/50 hover:shadow-lg transition-all group shadow-lg flex flex-col items-start">
              <div className="w-10 h-10 rounded-[1.25rem] bg-[#F4F9F5] flex items-center justify-center mb-4 border border-[#68BA7F]/20 group-hover:border-[#68BA7F]/40 transition-colors">
                <FileBox className="w-5 h-5 text-[#2E6F40]" />
              </div>
              <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Saved Sessions</h2>
              <p className="text-sm text-[#2E6F40]/80 leading-relaxed">Review your past brainstorms</p>
            </a>
            <a href="/zones" className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/50 hover:shadow-lg transition-all group shadow-lg flex flex-col items-start">
              <div className="w-10 h-10 rounded-[1.25rem] bg-[#F4F9F5] flex items-center justify-center mb-4 border border-[#68BA7F]/20 group-hover:border-[#68BA7F]/40 transition-colors">
                <Layers className="w-5 h-5 text-[#2E6F40]" />
              </div>
              <h2 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">Experimental Zones</h2>
              <p className="text-sm text-[#2E6F40]/80 leading-relaxed">Adaptive M3 expressive tab views</p>
            </a>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#253D2C]">Recent Activities</h2>
              <a href="/reports" className="text-sm font-medium text-[#2E6F40] hover:text-[#253D2C] flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            {loadingOverview ? (
              <div className="text-[#2E6F40]/70 text-sm">Loading latest sessions...</div>
            ) : recentSessions.length === 0 ? (
              <div className="p-8 text-center rounded-[1.5rem] bg-white border border-dashed border-[#68BA7F]/40">
                <p className="text-[#2E6F40]/70">No sessions yet. Run your first instrument to get started.</p>
                <a href="/instruments" className="inline-block mt-4 px-4 py-2 bg-[#2E6F40] text-white text-sm font-medium rounded-[1rem] hover:bg-[#253D2C]">
                  Browse Instruments
                </a>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                {recentSessions.map(session => (
                  <div key={session.id} className="p-4 rounded-[1.25rem] bg-white border border-[#68BA7F]/30 shadow-lg flex items-center justify-between hover:border-[#68BA7F]/50 transition-colors">
                    <div>
                      <h3 className="font-medium text-[#253D2C]">{session.instrumentName || 'Instrument Session'}</h3>
                      <p className="text-sm text-[#2E6F40]/70 mt-1">{new Date(session.createdAt?.toMillis?.() || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <a href={`/reports/${session.id}`} className="px-4 py-2 bg-[#CFFFDC]/60 hover:bg-[#CFFFDC] rounded-[1rem] text-sm font-medium text-[#253D2C]/80 transition-colors">
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'blogs' ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Interactive Blogs Tab Content */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[#68BA7F]" />
              <input 
                type="text"
                placeholder="Filter blogs by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#68BA7F]/20 focus:outline-none focus:ring-1 focus:ring-[#2E6F40] bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Editor Card for Authenticated Hub Users */}
          {user && (
            <div className="bg-white p-6 rounded-[2rem] border border-[#68BA7F]/20 shadow-sm space-y-4">
              <input 
                type="text"
                placeholder="Publication Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-bold text-[#253D2C] pb-2 border-b border-[#68BA7F]/30 focus:outline-none"
              />
              
              <input 
                type="text"
                placeholder="Add tags (comma separated)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tagInput.trim()) setTags([...tags, tagInput.trim()]);
                      setTagInput('');
                  }
                }}
                className="w-full text-sm text-[#2E6F40] p-2 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40]"
              />
              
              <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-[#F4F9F5] text-[#2E6F40] text-xs font-bold rounded-lg flex items-center gap-1">
                          {tag}
                          <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-[#68BA7F] hover:text-[#2E6F40]">×</button>
                      </span>
                  ))}
              </div>
              
              <div className="flex flex-wrap justify-between items-center gap-4">
                 <div className="flex gap-2">
                   <button 
                     onClick={() => setIsPreview(false)}
                     className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${!isPreview ? 'bg-[#2E6F40] text-white' : 'bg-[#F4F9F5] text-[#2E6F40]'}`}
                   >
                     <PenTool className="w-4 h-4" /> Write
                   </button>
                   <button 
                     onClick={() => setIsPreview(true)}
                     className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${isPreview ? 'bg-[#2E6F40] text-white' : 'bg-[#F4F9F5] text-[#2E6F40]'}`}
                   >
                     <Eye className="w-4 h-4" /> Preview
                   </button>
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                   <div className="flex flex-wrap gap-2 items-center p-1 bg-[#F4F9F5] rounded-2xl border border-[#68BA7F]/20">
                     {/* Inline Typography */}
                     <div className="flex gap-1">
                       <button onClick={() => insertMarkdown('**')} type="button" title="Bold" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Bold size={15}/></button>
                       <button onClick={() => insertMarkdown('*')} type="button" title="Italic" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Italic size={15}/></button>
                       <button onClick={() => insertMarkdown('~~')} type="button" title="Strikethrough" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Strikethrough size={15}/></button>
                       <button onClick={() => insertMarkdown('`')} type="button" title="Inline Code" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Code size={15}/></button>
                     </div>
                     
                     <span className="w-px h-5 bg-[#68BA7F]/30" />

                     {/* Headings & Blocks */}
                     <div className="flex gap-1">
                       <button onClick={() => insertMarkdown('# ', '\n')} type="button" title="Heading 1" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Heading1 size={15}/></button>
                       <button onClick={() => insertMarkdown('## ', '\n')} type="button" title="Heading 2" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Heading2 size={15}/></button>
                       <button onClick={() => insertMarkdown('> ', '\n')} type="button" title="Blockquote" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Quote size={15}/></button>
                       <button onClick={() => insertMarkdown('\n---\n', '\n')} type="button" title="Horizontal Rule" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Minus size={15}/></button>
                     </div>

                     <span className="w-px h-5 bg-[#68BA7F]/30" />

                     {/* Lists */}
                     <div className="flex gap-1">
                       <button onClick={() => insertMarkdown('\n- ', '\n')} type="button" title="Unordered List" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><List size={15}/></button>
                       <button onClick={() => insertMarkdown('\n1. ', '\n')} type="button" title="Ordered List" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><ListOrdered size={15}/></button>
                     </div>

                     <span className="w-px h-5 bg-[#68BA7F]/30" />

                     {/* Rich Media & Complex Elements */}
                     <div className="flex gap-1">
                       <button onClick={() => insertMarkdown('[', '](https://)')} type="button" title="Link" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><LinkIcon size={15}/></button>
                       <button onClick={() => insertMarkdown('![alt text](', ')')} type="button" title="Image" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Image size={15}/></button>
                       <button onClick={() => insertMarkdown('\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n', '\n')} type="button" title="Table" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Table size={15}/></button>
                       <button onClick={() => insertMarkdown('\n```javascript\n', '\n```\n')} type="button" title="Code Block" className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-[#253D2C] transition-all cursor-pointer"><Braces size={15}/></button>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => setIsDraftsOpen(true)}
                     className="px-4 py-2 bg-[#F4F9F5] text-[#2E6F40] text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#CFFFDC] transition-colors cursor-pointer shadow-sm"
                   >
                     <FileText className="w-4 h-4" /> Drafts
                   </button>
                   <button
                     onClick={() => setIsTemplatesOpen(true)}
                     className="px-4 py-2 bg-[#F4F9F5] text-[#2E6F40] text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#CFFFDC] transition-colors cursor-pointer shadow-sm"
                   >
                     <FileText className="w-4 h-4" /> Templates
                   </button>
                 </div>
              </div>
      
              {isPreview ? (
                <div className="prose prose-sm max-w-none p-4 rounded-xl border border-[#68BA7F]/20 bg-[#F4F9F5]/30 min-h-[300px]">
                   <Markdown>{content || '*Preview will appear here...*'}</Markdown>
                </div>
              ) : (
                <textarea
                  ref={contentRef}
                  placeholder="Draft your scholarly breakthroughs with Markdown tags..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[300px] p-4 rounded-xl border border-[#68BA7F]/30 focus:outline-none focus:ring-1 focus:ring-[#2E6F40] resize-none text-sm bg-gray-50/20"
                />
              )}
              <div className="text-xs text-[#9CA3AF] text-right">{wordCount} words</div>
      
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={handlePost}
                  disabled={posting || !title.trim() || !content.trim()}
                  className="px-6 py-2.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish Post
                </button>
                <button 
                  onClick={handleSaveDraft}
                  disabled={savingDraft || (!title.trim() && !content.trim())}
                  className="px-6 py-2.5 bg-[#F4F9F5] text-[#2E6F40] font-bold rounded-xl flex items-center gap-2 hover:bg-[#CFFFDC] transition-colors cursor-pointer shadow-sm"
                >
                  {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save as Draft
                </button>
              </div>
            </div>
          )}

          {/* Blogs Display */}
          <div className="space-y-6">
            {filteredBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
            {filteredBlogs.length === 0 && (
              <div className="p-8 text-center rounded-[1.5rem] bg-white border border-[#68BA7F]/15">
                <p className="text-[#2E6F40]/70 font-medium">No published blogs found matching your filters.</p>
              </div>
            )}
          </div>

          {/* Drafts Manager Modal */}
          {isDraftsOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
               <div className="bg-white p-6 rounded-[2rem] w-full max-w-lg shadow-2xl border border-[#68BA7F]/20 animate-scaleUp">
                  <h2 className="text-xl font-bold mb-4 text-[#253D2C]">Saved Drafts</h2>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                     {drafts.map(draft => (
                        <button key={draft.id} onClick={() => {
                            setTitle(draft.title || '');
                            setContent(draft.content || '');
                            setActiveDraftId(draft.id);
                            setIsDraftsOpen(false);
                        }} className="w-full text-left p-4 rounded-xl hover:bg-[#F4F9F5] border border-gray-100 hover:border-[#68BA7F]/30 transition-all cursor-pointer">
                          <p className="font-bold text-[#253D2C]">{draft.title || 'Untitled Draft'}</p>
                          <p className="text-xs text-gray-500 mt-1">{draft.createdAt?.toDate ? draft.createdAt.toDate().toLocaleDateString() : 'Auto-saved'}</p>
                        </button>
                     ))}
                     {drafts.length === 0 && <p className="text-gray-500 text-center py-6 text-sm">No drafts found on your account.</p>}
                  </div>
                  <button onClick={() => setIsDraftsOpen(false)} className="mt-6 w-full p-3 rounded-xl bg-[#F4F9F5] text-[#2E6F40] font-bold hover:bg-[#CFFFDC]/40 transition-colors cursor-pointer">Close</button>
               </div>
            </div>
          )}

          <BlogTemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} onSelect={(c) => { setContent(c); setIsTemplatesOpen(false); }} />
          <CreateTemplateModal isOpen={isCreateTemplateOpen} onClose={() => setIsCreateTemplateOpen(false)} />
        </div>
      ) : (
        <div className="animate-fadeIn p-1">
          <DataExplorer isEmbedded={true} />
        </div>
      )}
    </div>
  );
}
