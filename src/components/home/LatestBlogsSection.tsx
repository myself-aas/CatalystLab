import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import type { BlogPost } from '../../types';
import { getBlogPosts } from '../../lib/firebase';
import { ENGINE_SEEDED_BLOGS } from '../../data/engineBlogs';
import { getBlogCoverImage } from '../../utils/blogImageMap';
import { getArticleReadingTime } from '../../utils/readingTime';
import { 
  ArrowRight, 
  Clock, 
  Calendar, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Sparkles, 
  Check, 
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
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All Topics');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('catalyst_bookmarked_blogs');
      if (saved) {
        setBookmarkedIds(new Set(JSON.parse(saved)));
      }
    } catch (e) { console.error("Ignored error:", e); }
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

  const categories = [
    { id: 'All Topics', label: 'All Topics', icon: Sparkles },
    { id: 'AI & LLMO', label: 'AI & LLMO', icon: Cpu },
    { id: 'Core Performance', label: 'Core Performance', icon: Zap },
    { id: 'Edge Latency', label: 'Edge Latency', icon: Globe },
    { id: 'SecOps', label: 'SecOps & OWASP', icon: ShieldCheck },
    { id: 'Sustainability', label: 'Sustainability', icon: Leaf },
    { id: 'Architecture', label: 'Architecture', icon: Layers }
  ];

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

  const heroPost = filteredPosts[0] || posts[0];
  const compactPosts = filteredPosts.filter(p => (p.slug || p.id) !== (heroPost?.slug || heroPost?.id)).slice(0, 4);

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
      className={`relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden bg-transparent border-b border-brand-slate/30 ${className}`}
      aria-label="Latest engineering news and articles"
    >
      <div className="relative rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 sm:p-8 lg:p-10 shadow-xl">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-brand-slate/30">
          <div className="space-y-2 max-w-2xl">
            {badgeText && (
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-brand-oxford px-3.5 py-1 text-xs font-mono font-semibold text-accent-cyan tracking-wide">
                <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
                <span>{badgeText}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-offwhite tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-brand-periwinkle text-xs sm:text-sm leading-relaxed">
              {subtitle}
            </p>
          </div>

          {showViewAllButton && (
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/blogs"
                id="view-all-blogs-btn"
                className="inline-flex items-center gap-2 rounded-xl border border-brand-slate/40 bg-brand-oxford hover:bg-surface-subtle px-5 py-2.5 text-xs font-mono font-bold text-brand-offwhite transition-colors"
              >
                <span>View all blogs</span>
                <ArrowRight className="h-3.5 w-3.5 text-accent-cyan" />
              </Link>
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        {showFilterTabs && (
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              
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
                  className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer border ${
                    isActive 
                      ? 'bg-brand-slate text-white border-brand-periwinkle/40 font-bold' 
                      : 'bg-brand-oxford text-brand-periwinkle border-brand-slate/30 hover:text-white hover:bg-surface-subtle'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-brand-navy text-brand-slate-light">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 1 + 4 Grid Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Hero Card */}
          {heroPost && (
            <article 
              className="lg:col-span-5 group relative rounded-xl border border-brand-slate/40 bg-brand-oxford p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-brand-slate shadow-lg"
            >
              <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-brand-navy border border-brand-slate/30">
                <img 
                  src={getBlogCoverImage(heroPost)} 
                  alt={heroPost.title}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="rounded bg-brand-navy/90 border border-brand-slate/40 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                    {heroPost.category || 'Trending'}
                  </span>
                  <span className="rounded bg-accent-cyan text-brand-navy px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                    Featured
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={(e) => handleShare(heroPost.slug || heroPost.id || '', e)}
                    title="Share Article Link"
                    className="h-7 w-7 rounded-lg bg-brand-navy/80 border border-brand-slate/40 flex items-center justify-center text-white transition-colors hover:bg-brand-oxford cursor-pointer"
                  >
                    {copiedSlug === (heroPost.slug || heroPost.id) ? (
                      <Check className="h-3.5 w-3.5 text-accent-emerald" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5 text-brand-periwinkle" />
                    )}
                  </button>
                  <button
                    onClick={(e) => toggleBookmark(heroPost.id || heroPost.slug, e)}
                    title={bookmarkedIds.has(heroPost.id || heroPost.slug) ? "Remove Bookmark" : "Save Article"}
                    className="h-7 w-7 rounded-lg bg-brand-navy/80 border border-brand-slate/40 flex items-center justify-center text-white transition-colors hover:bg-brand-oxford cursor-pointer"
                  >
                    {bookmarkedIds.has(heroPost.id || heroPost.slug) ? (
                      <BookmarkCheck className="h-3.5 w-3.5 text-accent-cyan fill-accent-cyan" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5 text-brand-periwinkle" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-brand-slate-light mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-accent-cyan" />
                      {formatDate(heroPost.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-accent-cyan" />
                      {getArticleReadingTime(heroPost)}
                    </span>
                  </div>

                  <Link to={`/blog/${heroPost.slug || heroPost.id}`}>
                    <h3 className="text-base sm:text-lg font-bold text-brand-offwhite group-hover:text-accent-cyan transition-colors leading-snug">
                      {heroPost.title}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xs text-brand-periwinkle leading-relaxed line-clamp-3">
                    {heroPost.excerpt || 'Explore deep-dive telemetry diagnostics, modern SSR hydration patterns, and benchmark data from production engines.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-slate/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-brand-navy border border-brand-slate/40 flex items-center justify-center text-accent-cyan font-mono font-bold text-xs">
                      {heroPost.authorName ? heroPost.authorName.charAt(0) : 'C'}
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-bold text-brand-offwhite">{heroPost.authorName || 'CatalystLab Telemetry'}</div>
                      <div className="text-[10px] text-brand-slate-light">Principal Engineer</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewPost(heroPost)}
                      className="rounded-lg bg-brand-navy hover:bg-surface-subtle border border-brand-slate/40 px-2.5 py-1 text-xs font-mono text-brand-periwinkle hover:text-white transition-colors cursor-pointer"
                    >
                      Quick Peek
                    </button>
                    <Link
                      to={`/blog/${heroPost.slug || heroPost.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-slate hover:bg-brand-slate-hover px-3 py-1 text-xs font-mono font-bold text-white transition-colors border border-brand-periwinkle/30"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Right 2x2 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {finalCompactPosts.map((post, idx) => {
                const isBookmarked = bookmarkedIds.has(post.id || post.slug);
                return (
                  <article
                    key={post.slug || post.id || idx}
                    className="group relative rounded-xl border border-brand-slate/40 bg-brand-oxford p-3.5 flex flex-col justify-between transition-all hover:border-brand-slate shadow-md"
                  >
                    <div>
                      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-brand-navy border border-brand-slate/30 mb-2.5">
                        <img 
                          src={getBlogCoverImage(post)} 
                          alt={post.title}
                          className="h-full w-full object-cover object-center"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="rounded bg-brand-navy/90 border border-brand-slate/40 px-2 py-0.5 text-[9px] font-mono font-bold text-brand-offwhite">
                            {post.category || 'Guide'}
                          </span>
                        </div>

                        <button
                          onClick={(e) => toggleBookmark(post.id || post.slug, e)}
                          title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                          className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-brand-navy/80 border border-brand-slate/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3 w-3 text-accent-cyan fill-accent-cyan" />
                          ) : (
                            <Bookmark className="h-3 w-3 text-brand-periwinkle" />
                          )}
                        </button>
                      </div>

                      <Link to={`/blog/${post.slug || post.id}`}>
                        <h4 className="text-xs sm:text-sm font-bold text-brand-offwhite group-hover:text-accent-cyan transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h4>
                      </Link>

                      <p className="mt-1 text-xs text-brand-periwinkle line-clamp-2 leading-relaxed">
                        {post.excerpt || 'Technical breakdown with architectural diagrams and actionable code patterns.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono text-brand-slate-light">
                      <div className="flex items-center gap-1 text-[10px]">
                        <Calendar className="h-3 w-3 text-accent-cyan" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewPost(post)}
                          className="text-[10px] text-brand-periwinkle hover:text-white font-semibold transition-colors cursor-pointer"
                        >
                          Peek
                        </button>
                        <Link 
                          to={`/blog/${post.slug || post.id}`}
                          className="h-5 w-5 rounded bg-brand-navy border border-brand-slate/40 flex items-center justify-center text-brand-periwinkle hover:text-white"
                          aria-label={`Read article: ${post.title}`}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Ecosystem & Trust Bar */}
        {showEcosystemBar && (
          <div className="mt-8 pt-6 border-t border-brand-slate/30 font-mono">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-slate-light">
                Audited &amp; Integrated Across Modern Cloud Ecosystems:
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-brand-periwinkle">
                <span className="flex items-center gap-1 font-bold text-brand-offwhite">
                  <span className="text-accent-amber font-black">●</span> Cloudflare
                </span>
                <span className="flex items-center gap-1 font-bold text-brand-offwhite">
                  <span className="text-accent-cyan font-black">■</span> Google Cloud
                </span>
                <span className="flex items-center gap-1 font-bold text-brand-offwhite">
                  <span className="text-accent-rose font-black">▲</span> Fastly
                </span>
                <span className="flex items-center gap-1 font-bold text-brand-offwhite">
                  <span className="text-accent-amber font-black">◆</span> AWS
                </span>
                <span className="flex items-center gap-1 font-bold text-brand-offwhite">
                  <span className="text-white font-black">▲</span> Vercel
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {previewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-2xl rounded-2xl border border-brand-slate/50 bg-surface-panel p-5 sm:p-7 text-brand-offwhite shadow-2xl overflow-hidden font-mono"
            >
              <button
                onClick={() => setPreviewPost(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-brand-oxford border border-brand-slate/40 flex items-center justify-center text-brand-periwinkle hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="rounded bg-cyan-950/60 text-accent-cyan border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold">
                  {previewPost.category}
                </span>
                <span className="text-xs text-brand-slate-light">
                  {formatDate(previewPost.createdAt)} • {previewPost.readTime}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-brand-offwhite leading-snug mb-3">
                {previewPost.title}
              </h3>

              <div className="w-full aspect-[16/8] rounded-xl overflow-hidden mb-3 bg-brand-navy border border-brand-slate/30">
                <img 
                  src={getBlogCoverImage(previewPost)} 
                  alt={previewPost.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs text-brand-periwinkle leading-relaxed mb-4">
                {previewPost.excerpt}
              </p>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-brand-slate/30">
                <div className="text-xs text-brand-slate-light">
                  Author: <span className="text-white font-bold">{previewPost.authorName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPost(null)}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-brand-periwinkle hover:text-white transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                  <Link
                    to={`/blog/${previewPost.slug || previewPost.id}`}
                    onClick={() => setPreviewPost(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-slate hover:bg-brand-slate-hover px-4 py-2 text-xs font-bold text-white transition-all shadow-sm border border-brand-periwinkle/30"
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
