import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import type { BlogPost } from '../../types';
import { getBlogPosts } from '../../lib/firebase';
import { ENGINE_SEEDED_BLOGS } from '../../data/engineBlogs';
import { getBlogCoverImage } from '../../utils/blogImageMap';
import { 
  ArrowRight, 
  Clock, 
  Calendar, 
  Eye, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Sparkles, 
  Check, 
  ExternalLink,
  ChevronRight,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Globe,
  Leaf,
  X
} from 'lucide-react';

interface LatestBlogsSectionProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  showViewAllButton?: boolean;
  showFilterTabs?: boolean;
  showEcosystemBar?: boolean;
  className?: string;
  limit?: number;
}

export const LatestBlogsSection: React.FC<LatestBlogsSectionProps> = ({
  title = "Latest news & research insights",
  subtitle = "Stay informed / Explore our latest engineering updates, web performance benchmarks, AI readiness protocols, and edge telemetry.",
  badgeText = "Engineering Research & Telemetry",
  showViewAllButton = true,
  showFilterTabs = true,
  showEcosystemBar = true,
  className = "",
  limit = 5
}) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All Topics');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Load bookmarks from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('catalyst_bookmarked_blogs');
      if (saved) {
        setBookmarkedIds(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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

  // Compile all available seed articles as fallback + combine
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
        
        // Merge firestore with fallback blogs so we always have a comprehensive set
        const combinedMap = new Map<string, BlogPost>();
        allFallbackPosts.forEach(p => combinedMap.set(p.slug || p.id || '', p));
        published.forEach(p => combinedMap.set(p.slug || p.id || '', p));
        
        const merged = Array.from(combinedMap.values());
        merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        if (isMounted) {
          setPosts(merged);
        }
      } catch (err) {
        console.warn("Could not fetch remote blogs, using local seeds:", err);
        if (isMounted) {
          setPosts(allFallbackPosts);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, [allFallbackPosts]);

  // Categories list
  const categories = [
    { id: 'All Topics', label: 'All Topics', icon: Sparkles },
    { id: 'AI & LLMO', label: 'AI & LLMO', icon: Cpu },
    { id: 'Core Performance', label: 'Core Performance', icon: Zap },
    { id: 'Edge Latency', label: 'Edge Latency', icon: Globe },
    { id: 'SecOps', label: 'SecOps & OWASP', icon: ShieldCheck },
    { id: 'Sustainability', label: 'Sustainability', icon: Leaf },
    { id: 'Architecture', label: 'Architecture', icon: Layers }
  ];

  // Filtered posts based on active category
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All Topics') return posts;
    return posts.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const tags = (p.tags || []).map(t => t.toLowerCase());
      const target = activeCategory.toLowerCase();

      if (target === 'ai & llmo') {
        return cat.includes('ai') || cat.includes('llm') || tags.some(t => t.includes('ai') || t.includes('llm') || t.includes('rag'));
      }
      if (target === 'core performance') {
        return cat.includes('perf') || cat.includes('core') || cat.includes('health') || tags.some(t => t.includes('dom') || t.includes('vitals') || t.includes('lcp'));
      }
      if (target === 'edge latency') {
        return cat.includes('latency') || cat.includes('edge') || tags.some(t => t.includes('ttfb') || t.includes('edge'));
      }
      if (target === 'secops') {
        return cat.includes('sec') || cat.includes('compliance') || tags.some(t => t.includes('git') || t.includes('owasp') || t.includes('security'));
      }
      if (target === 'sustainability') {
        return cat.includes('eco') || cat.includes('sustain') || tags.some(t => t.includes('carbon') || t.includes('green'));
      }
      if (target === 'architecture') {
        return cat.includes('arch') || cat.includes('migrat') || tags.some(t => t.includes('redirect') || t.includes('schema'));
      }
      return cat.includes(target);
    });
  }, [posts, activeCategory]);

  // Featured hero post (1st) and the 4 compact list posts
  const heroPost = filteredPosts[0] || posts[0];
  const compactPosts = filteredPosts.filter(p => (p.slug || p.id) !== (heroPost?.slug || heroPost?.id)).slice(0, 4);

  // If filtered category has fewer than 4 compact posts, supplement with recent posts
  const finalCompactPosts = useMemo(() => {
    if (compactPosts.length >= 4) return compactPosts;
    const remaining = 4 - compactPosts.length;
    const pool = posts.filter(p => 
      (p.slug || p.id) !== (heroPost?.slug || heroPost?.id) &&
      !compactPosts.some(cp => (cp.slug || cp.id) === (p.slug || p.id))
    ).slice(0, remaining);
    return [...compactPosts, ...pool];
  }, [compactPosts, posts, heroPost]);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Aug 18, 2026';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section 
      id="latest-blogs-section"
      className={`relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden ${className}`}
      aria-label="Latest engineering news and articles"
    >
      {/* Background Ambient Glow Accents */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Glassmorphic Container Wrapper */}
      <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e1b2e]/90 via-[#0d1829]/95 to-[#0a1424] p-6 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-2xl">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            {badgeText && (
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 tracking-wide">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>{badgeText}</span>
              </div>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              {title}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
          </div>

          {showViewAllButton && (
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/blogs"
                id="view-all-blogs-btn"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-cyan-400/50 group cursor-pointer"
              >
                <span>View all blogs</span>
                <ArrowRight className="h-4 w-4 text-cyan-400 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Interactive Category Filter Pills */}
        {showFilterTabs && (
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              
              // Count articles for this category
              const count = cat.id === 'All Topics' 
                ? posts.length 
                : posts.filter(p => {
                    const c = (p.category || '').toLowerCase();
                    const t = (p.tags || []).map(tag => tag.toLowerCase());
                    const target = cat.id.toLowerCase();
                    if (target === 'ai & llmo') return c.includes('ai') || c.includes('llm') || t.some(x => x.includes('ai'));
                    if (target === 'core performance') return c.includes('perf') || c.includes('core') || t.some(x => x.includes('dom'));
                    if (target === 'edge latency') return c.includes('latency') || c.includes('edge');
                    if (target === 'secops') return c.includes('sec') || c.includes('compliance');
                    if (target === 'sustainability') return c.includes('eco') || c.includes('sustain');
                    if (target === 'architecture') return c.includes('arch') || c.includes('migrat');
                    return c.includes(target);
                  }).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'text-[#0b192c] font-bold shadow-md' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBlogFilter"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 shadow-lg shadow-cyan-500/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#0b192c]' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-black/15 text-[#0b192c]' : 'bg-white/10 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 1 + 4 Grid Layout (Matching Reference Mockup) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT FEATURED HERO CARD (5 cols) */}
          {heroPost && (
            <motion.article 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-5 group relative rounded-[28px] border border-white/10 bg-[#122238]/80 hover:bg-[#152740]/90 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-950/40"
            >
              {/* Card Image Container */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-800">
                <img 
                  src={getBlogCoverImage(heroPost)} 
                  alt={heroPost.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1b2e]/90 via-transparent to-black/30" />
                
                {/* Category Pill Tag Overlay */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <span className="rounded-full bg-[#0b192c]/85 border border-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-md">
                    {heroPost.category || 'Trending'}
                  </span>
                  <span className="rounded-full bg-cyan-500/90 text-[#0b192c] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    Featured
                  </span>
                </div>

                {/* Bookmark & Quick Share Buttons Overlay */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleShare(heroPost.slug || heroPost.id || '', e)}
                    title="Share Article Link"
                    className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer"
                  >
                    {copiedSlug === (heroPost.slug || heroPost.id) ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5 text-slate-200" />
                    )}
                  </button>
                  <button
                    onClick={(e) => toggleBookmark(heroPost.id || heroPost.slug, e)}
                    title={bookmarkedIds.has(heroPost.id || heroPost.slug) ? "Remove Bookmark" : "Save Article"}
                    className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer"
                  >
                    {bookmarkedIds.has(heroPost.id || heroPost.slug) ? (
                      <BookmarkCheck className="h-4 w-4 text-cyan-400 fill-cyan-400" />
                    ) : (
                      <Bookmark className="h-4 w-4 text-slate-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Content Area */}
              <div className="mt-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                      {formatDate(heroPost.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {heroPost.readTime || '5 min read'}
                    </span>
                    {heroPost.views && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          {heroPost.views.toLocaleString()} views
                        </span>
                      </>
                    )}
                  </div>

                  <Link to={`/blog/${heroPost.slug || heroPost.id}`}>
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug tracking-tight">
                      {heroPost.title}
                    </h3>
                  </Link>

                  <p className="mt-3 text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {heroPost.excerpt || 'Explore deep-dive telemetry diagnostics, modern SSR hydration patterns, and benchmark data from production engines.'}
                  </p>
                </div>

                {/* Card Footer Action Row */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-[#0b192c] font-black text-xs shadow-sm">
                      {heroPost.authorName ? heroPost.authorName.charAt(0) : 'C'}
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white">{heroPost.authorName || 'CatalystLab Telemetry'}</div>
                      <div className="text-[11px] text-slate-400">Principal Engineer</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewPost(heroPost)}
                      className="rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      Quick Peek
                    </button>
                    <Link
                      to={`/blog/${heroPost.slug || heroPost.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 px-4 py-1.5 text-xs font-bold text-[#0b192c] transition-all hover:scale-105 shadow-sm"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          )}

          {/* RIGHT 2x2 COMPACT GRID (7 cols - 4 Cards) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <AnimatePresence mode="popLayout">
              {finalCompactPosts.map((post, idx) => {
                const isBookmarked = bookmarkedIds.has(post.id || post.slug);
                return (
                  <motion.article
                    key={post.slug || post.id || idx}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group relative rounded-2xl border border-white/10 bg-[#122238]/70 hover:bg-[#152740]/90 p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-950/30 hover:-translate-y-1"
                  >
                    <div>
                      {/* Compact Thumbnail Container */}
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-800 mb-3">
                        <img 
                          src={getBlogCoverImage(post)} 
                          alt={post.title}
                          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1b2e]/80 via-transparent to-black/20" />
                        
                        {/* Category Pill Tag Overlay */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="rounded-full bg-[#0b192c]/85 border border-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            {post.category || 'Guide'}
                          </span>
                        </div>

                        {/* Bookmark Button Overlay */}
                        <button
                          onClick={(e) => toggleBookmark(post.id || post.slug, e)}
                          title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                          className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5 text-slate-200" />
                          )}
                        </button>
                      </div>

                      {/* Title & Excerpt */}
                      <Link to={`/blog/${post.slug || post.id}`}>
                        <h4 className="text-[15px] font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h4>
                      </Link>

                      <p className="mt-1.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {post.excerpt || 'Technical breakdown with architectural diagrams and actionable code patterns.'}
                      </p>
                    </div>

                    {/* Compact Card Meta Row */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-cyan-400" />
                          {formatDate(post.createdAt)}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-400">{post.readTime || '4 min'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewPost(post)}
                          className="text-[11px] text-slate-300 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                        >
                          Peek
                        </button>
                        <Link 
                          to={`/blog/${post.slug || post.id}`}
                          className="h-6 w-6 rounded-full bg-white/10 group-hover:bg-cyan-400 group-hover:text-[#0b192c] flex items-center justify-center text-slate-300 transition-all"
                          aria-label={`Read article: ${post.title}`}
                        >
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM ECOSYSTEM & TRUST LOGO BAR (Matching Mockup Footer) */}
        {showEcosystemBar && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Audited & Integrated Across Modern Cloud Ecosystems:
              </div>

              {/* Partner Brand Logos Grid (Matching uploaded layout) */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
                {/* Cloudflare */}
                <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-bold text-sm">
                  <span className="text-orange-400 font-black text-base">●</span> Cloudflare
                </div>
                {/* Google Cloud */}
                <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-bold text-sm">
                  <span className="text-blue-400 font-black text-base">■</span> Google Cloud
                </div>
                {/* Fastly */}
                <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-bold text-sm">
                  <span className="text-red-400 font-black text-base">▲</span> Fastly
                </div>
                {/* AWS */}
                <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-bold text-sm">
                  <span className="text-amber-400 font-black text-base">◆</span> AWS
                </div>
                {/* Vercel */}
                <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-bold text-sm">
                  <span className="text-white font-black text-base">▲</span> Vercel
                </div>
                {/* Next.js */}
                <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-bold text-sm">
                  <span className="text-cyan-400 font-black text-base">N</span> Next.js
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* QUICK PREVIEW MODAL */}
      <AnimatePresence>
        {previewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-[#0e1c30] p-6 sm:p-8 text-white shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewPost(null)}
                className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 text-xs font-bold">
                  {previewPost.category}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(previewPost.createdAt)} • {previewPost.readTime}
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-white leading-tight mb-3">
                {previewPost.title}
              </h3>

              <div className="w-full aspect-[16/8] rounded-2xl overflow-hidden mb-4 bg-slate-800">
                <img 
                  src={getBlogCoverImage(previewPost)} 
                  alt={previewPost.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {previewPost.excerpt}
              </p>

              {/* Key Takeaways */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-6 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Key Architectural Takeaways:
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Proven telemetry benchmark vectors based on real multi-region tests.</li>
                  <li>Actionable mitigation steps to prevent CPU blocking and DOM degradation.</li>
                  <li>Tested for compliance with OWASP, Sustainable Web v4, and Schema.org standards.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="text-xs text-slate-400">
                  Author: <span className="text-white font-bold">{previewPost.authorName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewPost(null)}
                    className="rounded-full px-5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                  <Link
                    to={`/blog/${previewPost.slug || previewPost.id}`}
                    onClick={() => setPreviewPost(null)}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-400 hover:bg-cyan-300 px-6 py-2.5 text-xs font-extrabold text-[#0b192c] transition-all hover:scale-105 shadow-md"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LatestBlogsSection;
