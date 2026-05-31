'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Fingerprint, Workflow, Network, Activity, Layers, 
  RefreshCw, Search, Loader2, Bookmark, CheckCircle, 
  Trash2, Globe, Award, BookOpen, FileText, ChevronDown, 
  ChevronUp, ExternalLink, Calendar, Heart, ShieldAlert,
  SlidersHorizontal, Check, Compass, Share2
} from 'lucide-react';
import { useAuth } from '../../../components/AuthProvider';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  date?: string;
  doi?: string;
  url?: string;
  source: string;
  abstract?: string;
  citationCount?: number;
  isOa?: boolean;
  cleanSource: string;
}

// Sample topics to query from APIs
const TOPICS = [
  'Sustainable Hydrogen Energy',
  'CRISPR Therapeutics',
  'Deep Reinforcement Learning',
  'Quantum Entanglement Sensors',
  'Humanitarian Climate Response',
  'Biomimetic Materials'
];

export default function ZonesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('A');

  // --- TAB C LIVE MULTI-API FEED SYSTEM STATE ---
  const [searchTopic, setSearchTopic] = useState('Sustainable Hydrogen Energy');
  const [customKeyword, setCustomKeyword] = useState('');
  const [feedPapers, setFeedPapers] = useState<Paper[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeApiFilter, setActiveApiFilter] = useState<'all' | string>('all');
  const [errorText, setErrorText] = useState<string | null>(null);

  // Swipe to Refresh gesture states
  const containerRef = useRef<HTMLDivElement>(null);
  const pullRef = useRef<HTMLDivElement>(null);
  const pullY = useMotionValue(0);
  const pullProgressType = useTransform(pullY, [0, 80], [0, 1]);
  const pullRotate = useTransform(pullY, [0, 100], [0, 360]);

  // Infinite Scroll Trigger
  const bottomTriggerRef = useRef<HTMLDivElement>(null);

  // Available Academic APIs represented inside the Synthesis Matrix
  const ACADEMIC_APIS = [
    { name: 'arXiv', desc: 'Prephysics & Computer Science', color: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
    { name: 'PubMed', desc: 'Bio, Health & Medicine', color: 'bg-purple-50 border-purple-200 text-purple-800' },
    { name: 'Zenodo', desc: 'General Discipline Datasets', color: 'bg-teal-50 border-teal-200 text-teal-800' },
    { name: 'DOAJ', desc: 'Directory of Open Access', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { name: 'Semantic Scholar', desc: 'AI-Powered Research', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    { name: 'OpenAlex', desc: 'Global Scholarly Index', color: 'bg-rose-50 border-rose-200 text-rose-800' }
  ];

  // Fetch 5 papers from each API
  const fetchApiFeeds = useCallback(async (topic: string, currentPage: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    setErrorText(null);

    try {
      // Modify query slightly based on page count to retrieve unique, page-specific search results!
      let subQuery = topic;
      if (currentPage > 1) {
        const paginatedSuffixes = [
          'innovations',
          'methodologies',
          'advanced results',
          'system study',
          'model application'
        ];
        subQuery = `${topic} ${paginatedSuffixes[(currentPage - 2) % paginatedSuffixes.length]}`;
      }

      // Query active APIs concurrently via search aggregator endpoint
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: subQuery,
          enabledSources: ['arXiv', 'PubMed', 'Zenodo', 'DOAJ', 'Semantic Scholar', 'OpenAlex'],
          timeGatingEnabled: false
        })
      });

      if (!res.ok) {
        throw new Error('Scholarly nodes responded with an error.');
      }

      const data = await res.json();
      const rawResults = data.results || [];

      // Clean metadata and assign cleanSource
      const cleanedResults: Paper[] = rawResults.map((item: any) => ({
        id: item.id || Math.random().toString(36).substring(2, 9),
        title: item.title || 'Untitled Research Output',
        authors: item.authors || 'Unknown Investigator',
        year: item.year || new Date().getFullYear(),
        date: item.date,
        doi: item.doi,
        url: item.url,
        source: item.source || 'Academic Crawler',
        abstract: item.abstract || 'No abstract text was provided by the publishing index node.',
        citationCount: item.citationCount || 0,
        isOa: !!item.isOa,
        cleanSource: item.cleanSource || item.source || 'arXiv'
      }));

      if (isRefresh) {
        setFeedPapers(cleanedResults);
      } else {
        // Append unique items
        setFeedPapers(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = cleanedResults.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
      }

      if (cleanedResults.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Fatal crash during academic feed routing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      pullY.set(0);
    }
  }, [loading, pullY]);

  // Trigger initial retrieval
  useEffect(() => {
    if (activeTab === 'C') {
      setPage(1);
      fetchApiFeeds(searchTopic, 1, true);
    }
  }, [activeTab, searchTopic]);

  // Swipe to Refresh gesture event hooks
  useEffect(() => {
    const handleDrag = () => {
      if (pullY.get() > 90 && !refreshing && !loading) {
        setRefreshing(true);
        setPage(1);
        fetchApiFeeds(searchTopic, 1, true);
      }
    };
    const unsubscribe = pullY.on('change', handleDrag);
    return () => unsubscribe();
  }, [pullY, refreshing, loading, searchTopic, fetchApiFeeds]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (activeTab !== 'C') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore && feedPapers.length > 0) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchApiFeeds(searchTopic, nextPage, false);
      }
    }, { threshold: 0.1 });

    if (bottomTriggerRef.current) {
      observer.observe(bottomTriggerRef.current);
    }
    return () => observer.disconnect();
  }, [activeTab, loading, hasMore, feedPapers.length, page, searchTopic, fetchApiFeeds]);

  // Pull Bookmark list from firestore on init
  useEffect(() => {
    if (!user) return;
    const fetchUserBookmarks = async () => {
      try {
        const qB = query(collection(db, 'bookmarks'), where('uid', '==', user.uid));
        const sB = await getDocs(qB);
        const ids = new Set<string>();
        sB.forEach(doc => {
          const data = doc.data();
          if (data.title) ids.add(data.title.toLowerCase().trim());
        });
        setBookmarkedIds(ids);
      } catch (err) {
        console.warn('Bookmarks fetch outline error:', err);
      }
    };
    fetchUserBookmarks();
  }, [user]);

  // Handle swipes & bookmarking
  const onBookmarkPaper = async (paper: Paper) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      next.add(paper.title.toLowerCase().trim());
      return next;
    });

    if (!user) return;
    try {
      await addDoc(collection(db, 'bookmarks'), {
        uid: user.uid,
        title: paper.title,
        authors: paper.authors,
        source: paper.cleanSource,
        year: paper.year,
        url: paper.url || '',
        abstract: paper.abstract || '',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Firestore save failed:', err);
    }
  };

  const onDismissPaper = (id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const currentTopicPapers = feedPapers.filter(p => {
    if (dismissedIds.has(p.id)) return false;
    if (activeApiFilter !== 'all' && p.cleanSource !== activeApiFilter) return false;
    return true;
  });

  const tabs = [
    { id: 'A', label: 'Zone A', icon: <Fingerprint className="w-4 h-4" /> },
    { id: 'B', label: 'Zone B', icon: <Workflow className="w-4 h-4" /> },
    { id: 'C', label: 'Zone C', icon: <Network className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col space-y-8 p-1 select-none">
      <div>
        <h1 className="text-3xl font-bold text-[#253D2C] tracking-tight">Experimental Zones</h1>
        <p className="text-[#2E6F40]/80 mt-2 text-sm leading-relaxed">
          Adaptive Material 3 framing expressive tab configurations isolating reactive developer operating environments.
        </p>
      </div>

      {/* Material 3 Expressive Tabs */}
      <div className="self-start relative bg-white/60 p-1.5 rounded-2xl inline-flex gap-1 border border-[#68BA7F]/20 shadow-sm backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-[14px] text-sm font-bold transition-colors duration-300 cursor-pointer ${
                isActive ? 'text-[#1E4D2B]' : 'text-[#2E6F40]/70 hover:text-[#2E6F40] hover:bg-[#68BA7F]/10'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="m3-expressive-tab"
                  className="absolute inset-0 bg-[#CFFFDC] rounded-[14px] shadow-sm border border-[#68BA7F]/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Zone */}
      <div className="bg-white rounded-[2rem] border border-[#68BA7F]/20 shadow-lg min-h-[450px] p-5 sm:p-8 md:p-10 relative overflow-hidden flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex flex-col flex-1"
          >
            {activeTab === 'A' && (
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-[#CFFFDC]/50 flex items-center justify-center border border-[#68BA7F]/30 shadow-inner">
                  <Fingerprint className="w-7 h-7 text-[#1E4D2B]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#68BA7F] tracking-widest uppercase mb-1">
                    Environment Phase 1
                  </span>
                  <h2 className="text-3xl font-bold text-[#253D2C] tracking-tight">Zone A: Primary Configuration</h2>
                </div>
                <p className="text-[#2E6F40]/80 leading-relaxed max-w-2xl text-base font-medium">
                  This zone handles initial payload parameters, fundamental constants, and core metrics for the layout container. All primary variable states originate from this secure environment.
                </p>
                <div className="bg-[#FAFDF6] border border-[#68BA7F]/20 rounded-2xl p-6 mt-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                     <Activity className="w-5 h-5 text-[#2E6F40]" />
                     <span className="font-mono text-sm text-[#253D2C] font-semibold">Node Status: INITIALIZING</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5F3E9] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#68BA7F]" 
                      initial={{ width: 0 }} 
                      animate={{ width: '45%' }} 
                      transition={{ delay: 0.2, duration: 0.8 }} 
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'B' && (
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-300/30 shadow-inner">
                  <Workflow className="w-7 h-7 text-amber-700" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-500 tracking-widest uppercase mb-1">
                    Environment Phase 2
                  </span>
                  <h2 className="text-3xl font-bold text-[#253D2C] tracking-tight">Zone B: Orchestration Variables</h2>
                </div>
                <p className="text-[#2E6F40]/80 leading-relaxed max-w-2xl text-base font-medium">
                  Dedicated to dynamic pipeline scheduling, sequential logic processing, and multi-stage workflow transitions. Handles all asynchronous state propagation across the system architecture.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-white border border-[#68BA7F]/20 rounded-2xl p-5 shadow-sm">
                     <span className="text-sm font-bold text-[#253D2C]">Fan-out Processes</span>
                     <div className="font-mono text-2xl text-[#2E6F40] mt-1">17 Nodes</div>
                  </div>
                  <div className="bg-white border border-[#68BA7F]/20 rounded-2xl p-5 shadow-sm">
                     <span className="text-sm font-bold text-[#253D2C]">Execution Rate</span>
                     <div className="font-mono text-2xl text-[#2E6F40] mt-1">~1.2s</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'C' && (
              <div className="flex flex-col flex-1 space-y-6">
                {/* Visual Title Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-200">
                        <Network className="w-6 h-6 text-indigo-700" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#253D2C] tracking-tight">Zone C: Multi-Node Feed</h2>
                        <span className="text-xs font-mono font-bold text-[#2E6F40]/70 uppercase tracking-widest">Synthesis Matrix</span>
                      </div>
                    </div>
                    <p className="text-[#2E6F40]/80 text-[13px] leading-relaxed max-w-2xl pt-1.5 font-medium">
                      Orchestrates up to 5 of the most updated, relevant publications directly from each of the 6 core scholarly databases. Swipe cards right to bookmark or pull down to refresh the streams.
                    </p>
                  </div>
                </div>

                {/* Sub-Filters / Topics Carousel */}
                <div className="space-y-3 bg-[#FAFDF6] p-4 rounded-2xl border border-[#68BA7F]/20 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#2E6F40]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E6F40]">Select Research Topic:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPICS.map((topic) => {
                      const isSelected = searchTopic === topic;
                      return (
                        <button
                          key={topic}
                          onClick={() => {
                            setSearchTopic(topic);
                            setCustomKeyword('');
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected 
                              ? 'bg-[#1E4D2B] text-white border-[#1E4D2B] shadow-sm'
                              : 'bg-white border-[#68BA7F]/25 text-[#2E6F40] hover:bg-[#CFFFDC]/20'
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual Keyword Search */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customKeyword.trim()) setSearchTopic(customKeyword.trim());
                    }} 
                    className="flex gap-2 pt-2 border-t border-[#68BA7F]/15"
                  >
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={customKeyword}
                        onChange={(e) => setCustomKeyword(e.target.value)}
                        placeholder="Type custom scientific query (e.g. quantum entanglement)..."
                        className="w-full bg-white border border-[#68BA7F]/20 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] text-[#253D2C] font-semibold"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-[#2E6F40] hover:bg-[#1E4D2B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Fetch
                    </button>
                  </form>
                </div>

                {/* API Lane Filter Selector */}
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-[#68BA7F]/10">
                  <button
                    onClick={() => setActiveApiFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                      activeApiFilter === 'all'
                        ? 'bg-[#CFFFDC] border-[#68BA7F]/40 text-[#253D2C] font-extrabold'
                        : 'bg-[#FAFDF6] border-slate-100 text-slate-500 hover:bg-[#FAFDF6]'
                    }`}
                  >
                    Unified Feed ({feedPapers.filter(p => !dismissedIds.has(p.id)).length})
                  </button>
                  {ACADEMIC_APIS.map((api) => {
                    const count = feedPapers.filter(p => p.cleanSource === api.name && !dismissedIds.has(p.id)).length;
                    return (
                      <button
                        key={api.name}
                        onClick={() => setActiveApiFilter(api.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                          activeApiFilter === api.name
                            ? `${api.color} ring-1 ring-black/10 font-extrabold`
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-[#FAFDF6]'
                        }`}
                      >
                        {api.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Swipe Gesture Backgrounds Layer description */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                  <span>💡 Drag individual cards <span className="font-bold text-emerald-600">Right to Bookmark</span> or <span className="font-bold text-rose-500">Left to Dismiss</span></span>
                  {activeApiFilter === 'all' && <span className="font-mono">Page {page} indicator</span>}
                </div>

                {/* Swipe to Refresh & Scroll Container */}
                <div 
                  ref={containerRef}
                  className="relative overflow-y-auto max-h-[500px] rounded-2xl flex-1 bg-slate-50/50 p-4 border border-[#68BA7F]/15 subtle-scrollbar"
                >
                  {/* Swipe gesture pull down indicator */}
                  <div className="absolute top-0 left-0 right-0 h-1 flex justify-center pointer-events-none z-40">
                    <motion.div 
                      ref={pullRef}
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 120 }}
                      dragElastic={0.5}
                      style={{ y: pullY }}
                      className="w-10 h-10 bg-white shadow-xl rounded-full border border-[#68BA7F]/30 flex items-center justify-center cursor-pointer pointer-events-auto shrink-0 mt-2"
                      title="Swipe down to refresh"
                    >
                      {refreshing ? (
                        <Loader2 className="w-5 h-5 text-[#2E6F40] animate-spin" />
                      ) : (
                        <motion.div style={{ rotate: pullRotate, scale: pullProgressType }}>
                          <RefreshCw className="w-4 h-4 text-[#2E6F40]" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Refetch progress notice */}
                  {refreshing && (
                    <div className="text-center py-2 text-xs font-mono font-bold text-[#2E6F40] animate-pulse">
                      Synchronizing parallel crawler nodes...
                    </div>
                  )}

                  {/* Empty state & Feed Streams */}
                  {errorText && (
                    <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-5 text-center mt-8">
                      <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="font-bold text-sm">Crawl Exception</p>
                      <p className="text-xs text-red-700 mt-1">{errorText}</p>
                      <button 
                        onClick={() => fetchApiFeeds(searchTopic, page, true)}
                        className="px-4 py-1.5 bg-red-900 text-white rounded-lg text-xs font-bold mt-4"
                      >
                        Retry Query
                      </button>
                    </div>
                  )}

                  {currentTopicPapers.length === 0 && !loading ? (
                    <div className="text-center py-16 italic text-slate-400 flex flex-col items-center gap-3">
                      <Compass className="w-10 h-10 text-slate-300 animate-pulse" />
                      <div>
                        <p className="font-bold text-slate-500">No active publications in this viewport</p>
                        <p className="text-xs text-slate-400 mt-1">If all swiped, try selecting other API nodes or search another topic!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-10">
                      {currentTopicPapers.map((paper, idx) => {
                        const isBookmarked = bookmarkedIds.has(paper.title.toLowerCase().trim());
                        
                        // Framer Motion motion.v motion calculations for tinder style indicator overlays
                        const dragX = useMotionValue(0);
                        const overlayGreenOpacity = useTransform(dragX, [0, 80], [0, 0.85]);
                        const overlayRedOpacity = useTransform(dragX, [-80, 0], [0.85, 0]);

                        return (
                          <div key={paper.id || idx} className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                            {/* Slide-back indicator layers */}
                            <motion.div 
                              style={{ opacity: overlayGreenOpacity }}
                              className="absolute inset-y-0 left-0 w-1/2 bg-emerald-500 flex items-center pl-8 text-white z-0 pointer-events-none rounded-l-2xl"
                            >
                              <div className="flex items-center gap-2 font-bold text-sm">
                                <Bookmark className="w-5 h-5 text-white fill-white" />
                                <span>Bookmark Record</span>
                              </div>
                            </motion.div>
                            <motion.div 
                              style={{ opacity: overlayRedOpacity }}
                              className="absolute inset-y-0 right-0 w-1/2 bg-rose-500 flex items-center justify-end pr-8 text-white z-0 pointer-events-none rounded-r-2xl"
                            >
                              <div className="flex items-center gap-2 font-bold text-sm">
                                <span>Dismiss Item</span>
                                <Trash2 className="w-5 h-5 text-white fill-white" />
                              </div>
                            </motion.div>

                            {/* Main Slide Card Container */}
                            <motion.div
                              drag="x"
                              dragConstraints={{ left: -140, right: 140 }}
                              dragElastic={0.4}
                              style={{ x: dragX }}
                              onDragEnd={(e, info) => {
                                if (info.offset.x > 80) {
                                  onBookmarkPaper(paper);
                                  dragX.set(0);
                                } else if (info.offset.x < -80) {
                                  onDismissPaper(paper.id);
                                  dragX.set(0);
                                } else {
                                  dragX.set(0);
                                }
                              }}
                              className="relative cursor-grab active:cursor-grabbing bg-white p-5 space-y-3 z-10 select-text"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  {/* Title & Author */}
                                  <h4 className="text-sm font-extrabold text-[#253D2C] leading-snug line-clamp-2">
                                    {paper.title}
                                  </h4>
                                  <p className="text-xs font-mono text-slate-500">
                                    By: {paper.authors}
                                  </p>
                                </div>
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 select-none ${
                                  ACADEMIC_APIS.find(api => api.name === paper.cleanSource)?.color || 'bg-slate-100 text-slate-700'
                                }`}>
                                  {paper.cleanSource}
                                </span>
                              </div>

                              {/* Paper Summary Abstract */}
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 italic">
                                {paper.abstract}
                              </p>

                              {/* Action Footer */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] select-none font-bold">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <span>📅 {paper.year}</span>
                                  {paper.citationCount !== undefined && paper.citationCount > 0 && (
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                                      ★ {paper.citationCount} Citations
                                    </span>
                                  )}
                                  {paper.isOa && (
                                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 flex items-center gap-0.5">
                                      <Globe className="w-2.5 h-2.5" /> OA
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {isBookmarked && (
                                    <span className="text-[#2E6F40] bg-[#CFFFDC] border border-[#68BA7F]/40 px-2 py-0.5 rounded flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Bookmarked
                                    </span>
                                  )}
                                  {paper.url && (
                                    <a 
                                      href={paper.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                                    >
                                      Full Paper <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Infinite scrolling bottom target indicator */}
                  {hasMore && !loading && !errorText && currentTopicPapers.length > 0 && (
                    <div ref={bottomTriggerRef} className="py-6 flex items-center justify-center text-xs text-slate-400 font-bold select-none">
                      <Loader2 className="w-4 h-4 animate-spin text-[#2E6F40] mr-2" />
                      <span>Infinite scrolling active. Pulling more publications from databases...</span>
                    </div>
                  )}

                  {/* Initial background query load spinner */}
                  {loading && currentTopicPapers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-[#2E6F40] gap-3">
                      <Loader2 className="w-7 h-7 animate-spin" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Retrieving Node Content...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
