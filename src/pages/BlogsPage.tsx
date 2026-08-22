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
  Eye,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Sparkles,
  Filter,
  Layers,
  Zap,
  Globe,
  ShieldCheck,
  Leaf,
  Cpu,
  Star
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LatestBlogsSection } from '../components/home/LatestBlogsSection';
import { getBlogCoverImage } from '../utils/blogImageMap';
import synthshiftImg from '../assets/images/synthshift_migration_1787420135413.jpg';
import vitalzymeImg from '../assets/images/vitalzyme_health_1787420174357.jpg';
import edgevmaxImg from '../assets/images/edgevmax_latency_1787420187566.jpg';

export const BlogsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'readTime'>('newest');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem('catalyst_bookmarked_blogs');
      if (saved) setBookmarkedIds(new Set(JSON.parse(saved)));
    } catch {}
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
      } catch {}
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail.trim()) {
      setSubscribed(true);
      setSubscribeEmail('');
    }
  };

  const topicsList = ['All', 'AI & LLMO', 'Core Performance', 'Edge Latency', 'SecOps', 'Sustainability', 'Architecture'];

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
      if (target === 'ai & llmo') return cat.includes('ai') || cat.includes('llm') || tags.includes('ai') || tags.includes('llm');
      if (target === 'core performance') return cat.includes('perf') || cat.includes('core') || cat.includes('health') || tags.includes('dom') || tags.includes('vitals');
      if (target === 'edge latency') return cat.includes('latency') || cat.includes('edge') || tags.includes('ttfb');
      if (target === 'secops') return cat.includes('sec') || cat.includes('compliance') || tags.includes('owasp') || tags.includes('git');
      if (target === 'sustainability') return cat.includes('eco') || cat.includes('sustain') || tags.includes('carbon');
      if (target === 'architecture') return cat.includes('arch') || cat.includes('migrat') || tags.includes('redirect');
      return cat.includes(target);
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
    <div className="min-h-screen bg-[#07111e] text-white overflow-x-hidden selection:bg-cyan-500 selection:text-[#07111e]">
      <SEOHead
        title="Engineering Insights & Telemetry Articles | CatalystLab"
        description="Discover engineering updates, telemetry benchmarks, and architecture best practices from the CatalystLab team."
        keywords={['CatalystLab blog', 'engineering blog', 'web health insights', 'edge telemetry']}
        canonicalUrl="https://www.catalystlab.tech/blogs"
      />

      {/* Admin Quick Access Bar */}
      {user && isAdmin && (
        <div className="border-b border-cyan-500/20 bg-cyan-950/40 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Admin Mode Active — You have editing & publishing permissions</span>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            >
              <Settings className="h-3 w-3" />
              <span>Blog CMS Dashboard</span>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Header Section */}
      <section className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 tracking-wide">
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span>CatalystLab Engineering Publications</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Engineering Insights & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Edge Telemetry Research
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Deep-dive technical diagnostics, Next.js rendering benchmarks, AI crawler readiness protocols, and multi-region infrastructure analyses written by our core architects.
          </p>
        </div>
      </section>

      {/* 1. DYNAMIC INTERACTIVE LATEST BLOGS SECTION (1+4 Interactive Grid) */}
      <LatestBlogsSection 
        title="Latest news & research insights"
        subtitle="Explore our newest benchmark telemetry, code patterns, and deep-dive engineering analyses."
        badgeText="Real-Time Research Feed"
        showViewAllButton={false}
        showFilterTabs={true}
        showEcosystemBar={true}
        className="pt-2 pb-16"
      />

      {/* 2. EXPLORE ALL TECHNICAL ARTICLES (Searchable, Filterable Grid) */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Section Header with Search & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              All Technical Publications
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              Showing {filteredAndSortedPosts.length} article{filteredAndSortedPosts.length === 1 ? '' : 's'} across core telemetry disciplines
            </p>
          </div>

          {/* Search and Sort Inputs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, tags, or words..."
                className="w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-full border border-white/15 bg-[#0e1c30] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="readTime">Sort: Quick Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Topic Pills Bar */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {topicsList.map((topic) => {
            const isActive = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-400 text-[#07111e] font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>

        {/* Articles Grid (3 Columns) */}
        {filteredAndSortedPosts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAndSortedPosts.map((post) => {
              const isBookmarked = bookmarkedIds.has(post.id || post.slug);
              return (
                <article
                  key={post.slug || post.id}
                  className="group relative rounded-3xl border border-white/10 bg-[#0d1c30]/70 hover:bg-[#11243d]/90 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-950/40 hover:-translate-y-1.5"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-800 mb-4">
                      <img 
                        src={getBlogCoverImage(post)} 
                        alt={post.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c30]/90 via-transparent to-black/20" />
                      
                      {/* Category Pill Tag */}
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-[#07111e]/90 border border-white/20 backdrop-blur-md px-3 py-0.5 text-[11px] font-bold text-white shadow-sm">
                          {post.category || 'Engineering'}
                        </span>
                      </div>

                      {/* Share & Bookmark overlay buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleShare(post.slug || post.id || '', e)}
                          title="Copy Link"
                          className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer"
                        >
                          {copiedSlug === (post.slug || post.id) ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Share2 className="h-3 w-3 text-slate-200" />
                          )}
                        </button>
                        <button
                          onClick={(e) => toggleBookmark(post.id || post.slug, e)}
                          title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                          className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5 text-slate-200" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium mb-2.5">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-cyan-400" />
                        {formatDate(post.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {post.readTime || '5 min'}
                      </span>
                      {post.views && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">{post.views.toLocaleString()} views</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <Link to={`/blog/${post.slug || post.id}`}>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {post.excerpt || 'Read the comprehensive breakdown covering real telemetry vectors, implementation guides, and performance benchmarks.'}
                    </p>

                    {/* Tags Pills */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-300 flex items-center justify-center text-[#07111e] font-black text-[10px]">
                        {post.authorName ? post.authorName.charAt(0) : 'C'}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">
                        {post.authorName || 'Catalyst Team'}
                      </span>
                    </div>

                    <Link
                      to={`/blog/${post.slug || post.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors group-hover:translate-x-1 duration-200"
                    >
                      <span>Read article</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-16 text-center py-16 rounded-3xl border border-white/10 bg-white/5 max-w-md mx-auto p-8">
            <Search className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No matching articles found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query or choosing "All" topics.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedTopic('All'); }}
              className="mt-4 rounded-full bg-cyan-400 px-5 py-2 text-xs font-bold text-[#07111e] hover:bg-cyan-300 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* 3. ENGINEER'S TELEMETRY HIGHLIGHTS SECTION */}
        <section className="mt-28 rounded-3xl border border-white/10 bg-gradient-to-r from-[#0d1d33] via-[#0f223d] to-[#0d1d33] p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" /> Engineer's Field Highlights
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Architectural Benchmarks & Field Notes
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Our engineering team runs real-world probes against 40M+ edge requests each month. Here are the core field notes on sub-millisecond edge routing and zero-CLS layouts.
              </p>
              
              {/* Testimonial Quote */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs text-slate-200 italic leading-relaxed">
                  "CatalystLab's telemetry telemetry diagnostics uncovered a critical DOM hydration freeze in our Next.js edge clusters that standard Lighthouse tests completely missed."
                </blockquote>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-cyan-400 text-[#07111e] flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Maria Angelica</div>
                    <div className="text-[10px] text-slate-400">Staff Cloud Architect</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Image Highlight Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Card 1 */}
              <Link 
                to="/blog/optimizing-dom-depth-nextjs"
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 border border-white/10 hover:border-cyan-400/40 transition-all hover:scale-[1.02] shadow-lg"
              >
                <img 
                  src={vitalzymeImg} 
                  alt="DOM Health Telemetry" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1">Telemetry Spotlight</span>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
                    Optimizing DOM Depth & Eliminating Hydration Freezes
                  </h4>
                </div>
              </Link>

              {/* Card 2 */}
              <Link 
                to="/blog/decimating-ttfb-edge-workers"
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 border border-white/10 hover:border-cyan-400/40 transition-all hover:scale-[1.02] shadow-lg"
              >
                <img 
                  src={edgevmaxImg} 
                  alt="Edge Latency Benchmarks" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1">Edge Latency</span>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
                    Sub-20ms Anycast Routing & Worker Invalidation
                  </h4>
                </div>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* 4. NEWSLETTER SUBSCRIPTION SECTION */}
      <section className="border-t border-white/10 bg-[#0a1526] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Weekly Engineering Telemetry Digest</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Get Technical Telemetry Briefings Straight to Your Inbox
          </h2>
          
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Every Tuesday, we send deep-dive architectural breakdowns, Core Web Vital changes, and AI search indexing tactics. No spam, ever.
          </p>

          {subscribed ? (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-sm font-bold text-green-300">
              ✓ You are subscribed! Check your inbox for the latest telemetry dispatch.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="developer@company.com"
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white/15 focus:outline-none transition-colors"
              />
              <button 
                type="submit"
                className="rounded-full bg-cyan-400 hover:bg-cyan-300 px-8 py-3.5 text-sm font-extrabold text-[#07111e] transition-all hover:scale-105 shadow-md whitespace-nowrap cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-xs text-slate-400">
            By subscribing, you agree to our <Link to="/privacy" className="underline hover:text-cyan-300">Privacy Policy</Link>. Unsubscribe at any time with one click.
          </p>
        </div>
      </section>

    </div>
  );
};

export default BlogsPage;
