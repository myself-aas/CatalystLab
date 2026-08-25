import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPosts } from '../lib/firebase';
import { ENGINE_SEEDED_BLOGS } from '../data/engineBlogs';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  Search, 
  BookOpen, 
  Settings,
  Calendar,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Sparkles,
  Plus,
  X,
  Terminal as TerminalIcon,
  Zap,
  Sliders
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { ParallaxSection } from '../components/common/ParallaxSection';
import { LatestBlogsSection } from '../components/home/LatestBlogsSection';
import { InteractiveTelemetrySandbox } from '../components/blog/InteractiveTelemetrySandbox';
import { getBlogCoverImage } from '../utils/blogImageMap';
import { getArticleReadingTime } from '../utils/readingTime';

export const BlogsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'readTime'>('newest');
  const [showSandbox, setShowSandbox] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem('catalyst_bookmarked_blogs');
      if (saved) setBookmarkedIds(new Set(JSON.parse(saved)));
    } catch (e) { console.error("Ignored error:", e); }
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('catalyst_bookmarked_blogs', JSON.stringify(Array.from(next)));
      } catch (e) { console.error("Ignored error:", e); }
      return next;
    });
  };

  const handleShare = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  // Compile fallback list
  const allFallbackPosts = useMemo(() => {
    const list: BlogPost[] = [];
    Object.values(ENGINE_SEEDED_BLOGS).forEach(engineList => {
      engineList.forEach(item => {
        if (!list.some(existing => existing.slug === item.slug)) {
          list.push(item);
        }
      });
    });
    return list;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const firestorePosts = await getBlogPosts();
        const published = firestorePosts.filter(p => p.status !== 'archived');
        
        const combinedMap = new Map<string, BlogPost>();
        allFallbackPosts.forEach(p => combinedMap.set(p.slug || p.id || '', p));
        published.forEach(p => combinedMap.set(p.slug || p.id || '', p));
        
        const merged = Array.from(combinedMap.values());
        merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        if (isMounted) setPosts(merged);
      } catch (err) {
        console.warn("Error fetching remote blogs, using local seeds:", err);
        if (isMounted) setPosts(allFallbackPosts);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticles();
    return () => { isMounted = false; };
  }, [allFallbackPosts]);

  const topicsList = [
    { label: 'All', key: 'All' },
    { label: '[VitalZyme]', key: 'vitalzyme', enzyme: 'Core Web Vitals' },
    { label: '[EdgeVmax]', key: 'edgevmax', enzyme: 'Edge TTFB' },
    { label: '[RiskProtease]', key: 'riskprotease', enzyme: 'SecOps' },
    { label: '[LLM-Kinase]', key: 'llmkinase', enzyme: 'AI Readiness' },
    { label: '[EcoHolo]', key: 'ecoholo', enzyme: 'Digital Carbon' },
    { label: '[GitLygase]', key: 'gitlygase', enzyme: 'AST Code Hygiene' },
    { label: '[SynthShift]', key: 'synthshift', enzyme: 'Headless Chrome' },
    { label: '[AllosterSearch]', key: 'allostersearch', enzyme: 'SEO Knowledge Graph' },
  ];

  // Filter & sort all articles for the archive grid
  const filteredAndSortedPosts = useMemo(() => {
    return posts.filter(post => {
      const title = (post.title || '').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const cat = (post.category || '').toLowerCase();
      const tags = (post.tags || []).map(t => t.toLowerCase()).join(' ');
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || title.includes(query) || excerpt.includes(query) || tags.includes(query) || cat.includes(query);

      if (!matchesSearch) return false;
      if (selectedTopic === 'All') return true;

      const target = selectedTopic.toLowerCase();
      if (target === 'vitalzyme') return cat.includes('perf') || cat.includes('core') || cat.includes('health') || tags.includes('vitals') || tags.includes('vitalzyme');
      if (target === 'edgevmax') return cat.includes('latency') || cat.includes('edge') || tags.includes('ttfb') || tags.includes('edgevmax');
      if (target === 'riskprotease') return cat.includes('sec') || cat.includes('compliance') || tags.includes('owasp') || tags.includes('riskprotease');
      if (target === 'llmkinase') return cat.includes('ai') || cat.includes('llm') || tags.includes('ai') || tags.includes('llm') || tags.includes('llmkinase');
      if (target === 'ecoholo') return cat.includes('eco') || cat.includes('sustain') || tags.includes('carbon') || tags.includes('ecoholo');
      if (target === 'gitlygase') return cat.includes('git') || cat.includes('repo') || tags.includes('ast') || tags.includes('gitlygase');
      if (target === 'synthshift') return cat.includes('synth') || tags.includes('synthshift');
      if (target === 'allostersearch') return cat.includes('seo') || tags.includes('allostersearch');
      
      return cat.includes(target) || tags.includes(target);
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'readTime') {
        const parseMinutes = (rt?: string) => parseInt(rt || '5', 10) || 5;
        return parseMinutes(a.readTime) - parseMinutes(b.readTime);
      }
      return 0;
    });
  }, [posts, searchQuery, selectedTopic, sortBy]);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Aug 18, 2026';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#060912] text-slate-100 font-mono selection:bg-[#06B6D4]/30 selection:text-white">
      <SEOHead
        title="Telemetry Research Feed & Technical Publications | CatalystLab"
        description="Explore biochemical telemetry research, Core Web Vitals optimizations, AI agent crawler readiness protocols, and edge latency benchmarks."
        keywords={['CatalystLab blog', 'telemetry research feed', 'web health insights', 'edge telemetry benchmarks', 'VitalZyme', 'LLM-Kinase']}
        canonicalPath="/blogs"
      />

      {/* Admin Quick Access Bar */}
      {user && (
        <div className="border-b border-slate-800 bg-[#080D1A]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="h-3 w-3 text-[#00F0FF]" />
              <span>
                {isAdmin ? 'Admin Mode Active — Publishing & editing privileges enabled' : 'Author Access Active'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/blogs/create"
                className="inline-flex items-center gap-1 rounded-lg bg-[#06B6D4] hover:bg-[#00F0FF] px-3 py-1 text-xs font-bold text-slate-950 transition-all shadow-sm"
              >
                <Plus className="h-3 w-3 stroke-[3]" />
                <span>Write Article</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B101D] px-3 py-1 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <Settings className="h-3 w-3" />
                  <span>CMS Studio</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Header Section */}
      <section className="border-b border-slate-800 bg-[#080D1A] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#0B101D] px-3 py-1 text-xs font-bold text-[#00F0FF] uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            <span>TELEMETRY RESEARCH FEED &bull; 8-VECTOR SDLC DIAGNOSTICS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Engineering Insights &amp; Edge Telemetry Research
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-sans">
            Deep-dive technical diagnostics, Next.js rendering benchmarks, AI crawler readiness protocols, and multi-region infrastructure analyses written by our core architects.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowSandbox(!showSandbox)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                showSandbox
                  ? 'bg-[#06B6D4]/10 border-[#06B6D4] text-[#00F0FF]'
                  : 'bg-[#0B101D] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TerminalIcon className="h-3.5 w-3.5" />
              <span>{showSandbox ? 'Hide Live Sandbox' : 'Open Live Telemetry Sandbox'}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${showSandbox ? 'bg-[#00FF66] animate-pulse' : 'bg-slate-600'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Inline Interactive Mini-Sandbox */}
      {showSandbox && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <InteractiveTelemetrySandbox />
        </div>
      )}

      {/* 1. DYNAMIC INTERACTIVE LATEST BLOGS SECTION */}
      <LatestBlogsSection 
        title="Latest news & research insights"
        subtitle="Explore our newest benchmark telemetry, code patterns, and deep-dive engineering analyses."
        badgeText="Real-Time Research Feed"
        showViewAllButton={false}
        showFilterTabs={true}
        showEcosystemBar={true}
        className="pt-8 pb-12"
      />

      {/* 2. EXPLORE ALL TECHNICAL ARTICLES */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        
        {/* Section Header with Search & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
              All Technical Publications
            </h2>
            <p className="text-slate-400 text-xs mt-0.5 font-sans">
              Showing {filteredAndSortedPosts.length} article{filteredAndSortedPosts.length === 1 ? '' : 's'} tagged by biochemical catalyst
            </p>
          </div>

          {/* Search and Sort Inputs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <label htmlFor="blog-search" className="sr-only">Search blogs</label>
              <input
                id="blog-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, tags, or words..."
                className="w-full rounded-xl border border-slate-800 bg-[#080D1A] pl-9 pr-7 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none transition-colors font-mono"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-slate-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-[#080D1A] px-3 py-1.5 text-xs font-semibold text-white focus:border-[#06B6D4] focus:outline-none cursor-pointer font-mono"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="popular">Sort: Most Popular</option>
              <option value="readTime">Sort: Quick Read</option>
            </select>
          </div>
        </div>

        {/* [Enzyme] Biochemical Topic Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {topicsList.map((topic) => {
            const isActive = selectedTopic === topic.key;
            return (
              <button
                key={topic.key}
                type="button"
                onClick={() => setSelectedTopic(topic.key)}
                aria-pressed={isActive}
                className={`min-h-9 shrink-0 rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer font-mono flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#06B6D4] text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-[#080D1A] border border-slate-800 text-slate-400 hover:text-white hover:bg-[#0E1526]'
                }`}
              >
                <span>{topic.label}</span>
                {topic.enzyme && (
                  <span className={`text-[10px] ${isActive ? 'text-slate-900 font-normal' : 'text-slate-500'}`}>
                    ({topic.enzyme})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Articles Grid (3 Columns) */}
        {filteredAndSortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedPosts.map((post) => {
              const isBookmarked = bookmarkedIds.has(post.id || post.slug);
              return (
                <article
                  key={post.slug || post.id}
                  className="group relative rounded-2xl border border-slate-800 bg-[#080D1A] p-4 flex flex-col justify-between transition-all duration-300 hover:border-[#06B6D4]/50 hover:shadow-2xl"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#060912] mb-3 border border-slate-800">
                      <img 
                        src={getBlogCoverImage(post)} 
                        alt={post.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-transparent to-transparent opacity-90" />
                      
                      {/* Biochemical Tag Pill */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="rounded-md bg-[#060912]/90 border border-[#06B6D4]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#00F0FF] shadow-sm">
                          [{post.category || 'Telemetry'}]
                        </span>
                      </div>

                      {/* Share & Bookmark overlay buttons */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <button
                          onClick={(e) => handleShare(post.slug || post.id || '', e)}
                          title="Copy Link"
                          className="h-6 w-6 rounded-lg bg-[#060912]/80 hover:bg-[#060912] border border-slate-800 flex items-center justify-center text-slate-300 transition-all cursor-pointer"
                        >
                          {copiedSlug === (post.slug || post.id) ? (
                            <Check className="h-3 w-3 text-[#00FF66]" />
                          ) : (
                            <Share2 className="h-3 w-3 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => toggleBookmark(post.id || post.slug, e)}
                          title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                          className="h-6 w-6 rounded-lg bg-[#060912]/80 hover:bg-[#060912] border border-slate-800 flex items-center justify-center text-slate-300 transition-all cursor-pointer"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3 w-3 text-[#00F0FF] fill-[#00F0FF]" />
                          ) : (
                            <Bookmark className="h-3 w-3 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1 text-[10px]">
                        <Calendar className="h-2.5 w-2.5 text-[#00F0FF]" />
                        {formatDate(post.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[10px]">
                        <Clock className="h-2.5 w-2.5 text-[#00F0FF]" />
                        {getArticleReadingTime(post)}
                      </span>
                      {post.views && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-slate-400">{post.views.toLocaleString()} views</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <Link to={`/blog/${post.slug || post.id}`}>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors leading-snug line-clamp-2 font-sans">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2 font-sans">
                      {post.excerpt || 'Read the comprehensive breakdown covering real telemetry vectors, implementation guides, and performance benchmarks.'}
                    </p>

                    {/* Tags Pills */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="rounded bg-[#060912] border border-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName || 'Author'}
                          className="h-5 w-5 rounded-full object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-[#06B6D4] text-slate-950 font-bold text-[9px] flex items-center justify-center">
                          {post.authorName ? post.authorName.charAt(0) : 'C'}
                        </div>
                      )}
                      <span className="text-xs text-slate-400 font-medium">
                        {post.authorName || 'Catalyst Team'}
                      </span>
                    </div>

                    <Link
                      to={`/blog/${post.slug || post.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#00F0FF] hover:underline transition-all"
                    >
                      <span>Read Specs</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-[#080D1A] p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-white">No articles matched your filter</h3>
            <p className="text-xs text-slate-400 mt-1">Try searching for other catalysts like VitalZyme, EcoHolo, or RiskProtease.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogsPage;
