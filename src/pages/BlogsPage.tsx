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
  Star,
  Plus,
  X
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { ParallaxSection } from '../components/common/ParallaxSection';
import { LatestBlogsSection } from '../components/home/LatestBlogsSection';
import { getBlogCoverImage, UNSPLASH_ASSET_LIBRARY } from '../utils/blogImageMap';
import { getArticleReadingTime } from '../utils/readingTime';

export const BlogsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [, setLoading] = useState(true);
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
    <div className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white">
      <SEOHead
        title="Engineering Insights & Telemetry Articles | CatalystLab"
        description="Discover engineering updates, telemetry benchmarks, and architecture best practices from the CatalystLab team."
        keywords={['CatalystLab blog', 'engineering blog', 'web health insights', 'edge telemetry']}
        canonicalUrl="https://www.catalystlab.tech/blogs"
      />

      {/* Admin Quick Access Bar */}
      {user && (
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black">
              <Sparkles className="h-3 w-3" />
              <span>
                {isAdmin ? 'Admin Mode Active — Publishing & editing privileges enabled' : 'Author Access Active'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/blogs/create"
                className="inline-flex items-center gap-1 rounded-lg bg-black hover:bg-black-hover border border-slate-500/30 px-3 py-1 text-xs font-bold text-white transition-all shadow-sm"
              >
                <Plus className="h-3 w-3 stroke-[3]" />
                <span>Write Article</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-black hover:bg-slate-100 transition-colors"
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
      <section className="border-b border-slate-200 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-bold text-black uppercase tracking-wider">
            <BookOpen className="h-3 w-3" />
            <span>CatalystLab Engineering Publications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight font-sans">
            Engineering Insights &amp; Edge Telemetry Research
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto font-sans">
            Deep-dive technical diagnostics, Next.js rendering benchmarks, AI crawler readiness protocols, and multi-region infrastructure analyses written by our core architects.
          </p>
        </div>
      </section>

      {/* Immersive Blogs Parallax Banner */}
      <ParallaxSection
        bgImage="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
        overlayOpacity={0.88}
        height="min-h-[280px]"
        className="border-b border-slate-200"
      >
        <div className="max-w-4xl mx-auto px-6 text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            Engineering Knowledge Base
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black font-sans tracking-tight">
            Research, Benchmarks &amp; Architecture Guides
          </h2>
        </div>
      </ParallaxSection>

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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight font-sans">
              All Technical Publications
            </h2>
            <p className="text-slate-600 text-xs mt-0.5 font-sans">
              Showing {filteredAndSortedPosts.length} article{filteredAndSortedPosts.length === 1 ? '' : 's'} across core telemetry disciplines
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
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-7 py-1.5 text-xs text-black placeholder:text-slate-500 focus:border-slate-300 focus:outline-none transition-colors font-mono"
              />
              {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-slate-500 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-black focus:border-slate-300 focus:outline-none cursor-pointer font-mono"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="popular">Sort: Most Popular</option>
              <option value="readTime">Sort: Quick Read</option>
            </select>
          </div>
        </div>

        {/* Topic Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {topicsList.map((topic) => {
            const isActive = selectedTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                aria-pressed={isActive}
                className={`min-h-10 shrink-0 rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                  isActive
                    ? 'bg-black text-white border border-slate-500/30 shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-black hover:bg-slate-50'
                }`}
              >
                {topic}
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
                  className="group relative rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between transition-all duration-300 hover:border-slate-500/50 hover:shadow-xl"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-200">
                      <img 
                        src={getBlogCoverImage(post)} 
                        alt={post.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      
                      {/* Category Pill Tag */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="rounded-md bg-white/90 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-black shadow-sm">
                          {post.category || 'Engineering'}
                        </span>
                      </div>

                      {/* Share & Bookmark overlay buttons */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <button
                          onClick={(e) => handleShare(post.slug || post.id || '', e)}
                          title="Copy Link"
                          className="h-6 w-6 rounded-lg bg-white/80 hover:bg-white border border-slate-200 flex items-center justify-center text-black transition-all cursor-pointer"
                        >
                          {copiedSlug === (post.slug || post.id) ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Share2 className="h-3 w-3 text-slate-600" />
                          )}
                        </button>
                        <button
                          onClick={(e) => toggleBookmark(post.id || post.slug, e)}
                          title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                          className="h-6 w-6 rounded-lg bg-white/80 hover:bg-white border border-slate-200 flex items-center justify-center text-black transition-all cursor-pointer"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3 w-3 text-black fill-black" />
                          ) : (
                            <Bookmark className="h-3 w-3 text-slate-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1 text-[10px]">
                        <Calendar className="h-2.5 w-2.5 text-black" />
                        {formatDate(post.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[10px]">
                        <Clock className="h-2.5 w-2.5 text-black" />
                        {getArticleReadingTime(post)}
                      </span>
                      {post.views && (
                        <>
                          <span>•</span>
                          <span className="text-[10px]">{post.views.toLocaleString()} views</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <Link to={`/blog/${post.slug || post.id}`}>
                      <h3 className="text-sm font-bold text-black group-hover:text-black transition-colors leading-snug line-clamp-2 font-sans">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2 font-sans">
                      {post.excerpt || 'Read the comprehensive breakdown covering real telemetry vectors, implementation guides, and performance benchmarks.'}
                    </p>

                    {/* Tags Pills */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName || 'Author'}
                          className="h-5 w-5 rounded-full object-cover border border-slate-500/40"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-black border border-slate-500/30 flex items-center justify-center text-white font-bold text-[9px]">
                          {post.authorName ? post.authorName.charAt(0) : 'C'}
                        </div>
                      )}
                      <span className="text-xs text-slate-600 font-medium">
                        {post.authorName || 'Catalyst Team'}
                      </span>
                    </div>

                    <Link
                      to={`/blog/${post.slug || post.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-black hover:underline transition-all"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white max-w-md mx-auto p-6 space-y-3">
            <Search className="h-8 w-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-black">No matching articles found</h3>
            <p className="text-xs text-slate-600 font-sans">Try resetting your search query or choosing &quot;All&quot; topics.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedTopic('All'); }}
              className="mt-2 rounded-xl bg-black hover:bg-black-hover border border-slate-500/30 px-4 py-1.5 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* 3. ENGINEER'S TELEMETRY HIGHLIGHTS SECTION */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
                <Sparkles className="h-3.5 w-3.5" /> Engineer&apos;s Field Highlights
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-black leading-tight font-sans">
                Architectural Benchmarks &amp; Field Notes
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans">
                Our engineering team runs real-world probes against 40M+ edge requests each month. Here are the core field notes on sub-millisecond edge routing and zero-CLS layouts.
              </p>
              
              {/* Testimonial Quote */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-1 mb-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3 w-3 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <blockquote className="text-xs text-black italic leading-relaxed font-sans">
                  &quot;CatalystLab&apos;s telemetry diagnostics uncovered a critical DOM hydration freeze in our Next.js edge clusters that standard Lighthouse tests completely missed.&quot;
                </blockquote>
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200"
                    alt="Maria Angelica"
                    className="h-6 w-6 rounded-full object-cover border border-slate-500/40"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-bold text-black">Maria Angelica</div>
                    <div className="text-[10px] text-slate-600">Staff Cloud Architect</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Image Highlight Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 */}
              <Link 
                to="/blog/optimizing-dom-depth-render-blocking-nextjs"
                className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-50 border border-slate-200 hover:border-slate-500/50 transition-all shadow-md"
              >
                <img 
                  src={UNSPLASH_ASSET_LIBRARY.dom_performance} 
                  alt="DOM Health Telemetry" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3.5 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Telemetry Spotlight</span>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors line-clamp-2 font-sans">
                    Optimizing DOM Depth &amp; Eliminating Hydration Freezes
                  </h4>
                </div>
              </Link>

              {/* Card 2 */}
              <Link 
                to="/blog/decimating-ttfb-edge-workers"
                className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-50 border border-slate-200 hover:border-slate-500/50 transition-all shadow-md"
              >
                <img 
                  src={UNSPLASH_ASSET_LIBRARY.edge_network} 
                  alt="Edge Latency Benchmarks" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3.5 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Edge Latency</span>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors line-clamp-2 font-sans">
                    Sub-20ms Anycast Routing &amp; Worker Invalidation
                  </h4>
                </div>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* 4. NEWSLETTER SUBSCRIPTION SECTION */}
      <section className="border-t border-slate-200 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-bold text-black">
            <Sparkles className="h-3 w-3" />
            <span>Weekly Engineering Telemetry Digest</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight font-sans">
            Get Technical Telemetry Briefings Straight to Your Inbox
          </h2>
          
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-sans">
            Every Tuesday, we send deep-dive architectural breakdowns, Core Web Vital changes, and AI search indexing tactics. No spam, ever.
          </p>

          {subscribed ? (
            <div className="rounded-xl border border-emerald-500/40 bg-white p-3 text-xs font-bold text-emerald-500">
              ✓ You are subscribed! Check your inbox for the latest telemetry dispatch.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-1 font-mono">
              <label htmlFor="blog-subscribe" className="sr-only">Email for blog subscription</label>
              <input
                id="blog-subscribe"
                type="email"
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="developer@company.com"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-black placeholder:text-slate-500 focus:border-slate-300 focus:outline-none"
              />
              <button 
                type="submit"
                className="rounded-xl bg-black hover:bg-black-hover border border-slate-500/30 px-5 py-2 text-xs font-bold text-white transition-all whitespace-nowrap cursor-pointer shadow-sm"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-[11px] text-slate-500 font-sans">
            By subscribing, you agree to our <Link to="/privacy" className="underline hover:text-black">Privacy Policy</Link>. Unsubscribe at any time with one click.
          </p>
        </div>
      </section>

    </div>
  );
};

export default BlogsPage;
