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
import { BlogCard } from '../components/cards/content/BlogCard';
import { EnzymeHue } from '../components/cards/types';
import { getBlogCoverImage } from '../utils/blogImageMap';
import { getArticleReadingTime } from '../utils/readingTime';
import { logger } from '../lib/logger';

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
    } catch (e) { logger.error("Ignored error:", e); }
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
      } catch (e) { logger.error("Ignored error:", e); }
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
        logger.warn("Error fetching remote blogs, using local seeds:", err);
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
    <div className="min-h-screen bg-[#060912] text-foreground font-mono selection:bg-[#06B6D4]/30 selection:text-primary-foreground">
      <SEOHead
        title="Telemetry Research Feed & Technical Publications | CatalystLab"
        description="Explore biochemical telemetry research, Core Web Vitals optimizations, AI agent crawler readiness protocols, and edge latency benchmarks."
        keywords={['CatalystLab blog', 'telemetry research feed', 'web health insights', 'edge telemetry benchmarks', 'VitalZyme', 'LLM-Kinase']}
        canonicalPath="/blogs"
      />

      {/* Admin Quick Access Bar */}
      {user && (
        <div className="border-b border-border bg-[#080D1A]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-foreground">
              <Sparkles className="h-3 w-3 text-[#00F0FF]" />
              <span>
                {isAdmin ? 'Admin Mode Active — Publishing & editing privileges enabled' : 'Author Access Active'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/blogs/create"
                className="inline-flex items-center gap-1 rounded-lg bg-[#06B6D4] hover:bg-[#00F0FF] px-3 py-1 text-xs font-bold text-foreground transition-all shadow-sm"
              >
                <Plus className="h-3 w-3 stroke-[3]" />
                <span>Write Article</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-[#0B101D] px-3 py-1 text-xs font-bold text-muted-foreground hover:text-primary-foreground transition-colors"
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
      <section className="relative overflow-hidden border-b border-border bg-[#080D1A] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--app-card)_0%,var(--app-background)_75%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-mono font-bold text-[#00F0FF] uppercase tracking-wider shadow-xs backdrop-blur-md">
            <BookOpen className="h-3.5 w-3.5" />
            <span>TELEMETRY RESEARCH FEED &bull; 8-VECTOR SDLC DIAGNOSTICS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-primary-foreground tracking-tight font-sans leading-[1.08]">
            Engineering Insights &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-cyan-400 to-blue-500">
              Edge Telemetry Research
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans font-normal">
            Deep-dive technical diagnostics, Next.js rendering benchmarks, AI crawler readiness protocols, and multi-region infrastructure analyses written by our core architects.
          </p>

          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowSandbox(!showSandbox)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all cursor-pointer active:scale-95 shadow-sm ${
                showSandbox
                  ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#00F0FF] shadow-cyan-900/30'
                  : 'bg-[#0B101D] border-border text-muted-foreground hover:text-primary-foreground hover:border-border'
              }`}
            >
              <TerminalIcon className="h-4 w-4" />
              <span>{showSandbox ? 'Hide Live Sandbox' : 'Open Live Telemetry Sandbox'}</span>
              <span className={`h-2 w-2 rounded-full ${showSandbox ? 'bg-[#00FF66] animate-pulse' : 'bg-muted0'}`} />
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-primary-foreground tracking-tight font-sans">
              All Technical Publications
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5 font-sans">
              Showing {filteredAndSortedPosts.length} article{filteredAndSortedPosts.length === 1 ? '' : 's'} tagged by biochemical catalyst
            </p>
          </div>

          {/* Search and Sort Inputs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <label htmlFor="blog-search" className="sr-only">Search blogs</label>
              <input
                id="blog-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, tags, or words..."
                className="w-full rounded-xl border border-border bg-[#080D1A] pl-9 pr-7 py-1.5 text-xs text-primary-foreground placeholder:text-muted-foreground focus:border-[#06B6D4] focus:outline-none transition-colors font-mono"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-muted-foreground hover:text-primary-foreground"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-border bg-[#080D1A] px-3 py-1.5 text-xs font-semibold text-primary-foreground focus:border-[#06B6D4] focus:outline-none cursor-pointer font-mono"
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
                    ? 'bg-[#06B6D4] text-foreground shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-[#080D1A] border border-border text-muted-foreground hover:text-primary-foreground hover:bg-[#0E1526]'
                }`}
              >
                <span>{topic.label}</span>
                {topic.enzyme && (
                  <span className={`text-[10px] ${isActive ? 'text-foreground font-normal' : 'text-muted-foreground'}`}>
                    ({topic.enzyme})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Articles Grid (3 Columns) */}
        {filteredAndSortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPosts.map((post, idx) => {
              const isBookmarked = bookmarkedIds.has(post.id || post.slug);
              const hues: EnzymeHue[] = ['vitalzyme', 'edgevmax', 'riskprotease', 'llmkinase', 'ecoholo', 'synthshift', 'gitlygase', 'alloster'];
              const cardHue = hues[idx % hues.length];

              return (
                <BlogCard
                  key={post.slug || post.id}
                  id={post.id || post.slug}
                  slug={post.slug || post.id || ''}
                  title={post.title}
                  excerpt={post.excerpt || 'Read the comprehensive breakdown covering real telemetry vectors, implementation guides, and performance benchmarks.'}
                  category={post.category || 'Telemetry'}
                  readTime={getArticleReadingTime(post)}
                  publishedAt={formatDate(post.createdAt)}
                  author={{
                    name: post.authorName || 'Catalyst Team',
                    role: 'Principal Engineer',
                    avatarUrl: post.authorAvatar,
                  }}
                  imageUrl={getBlogCoverImage(post)}
                  assetId="engine-neural-hologram"
                  hue={cardHue}
                  isBookmarked={isBookmarked}
                  onBookmarkToggle={(s) => toggleBookmark(post.id || s, {} as React.MouseEvent)}
                  onShare={(s) => handleShare(s, {} as React.MouseEvent)}
                  className="h-full flex flex-col justify-between"
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-[#080D1A] p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-sm font-bold text-primary-foreground">No articles matched your filter</h3>
            <p className="text-xs text-muted-foreground mt-1">Try searching for other catalysts like VitalZyme, EcoHolo, or RiskProtease.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogsPage;
