import { HeroImageCard } from "../common/HeroImageCard";
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
      className={`relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden bg-transparent border-b border-gray-200 ${className}`}
      aria-label="Latest engineering news and articles"
    >
      <div className="relative rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10 shadow-xl">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="space-y-2 max-w-2xl">
            {badgeText && (
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3.5 py-1 text-xs font-mono font-semibold text-accent-cyan tracking-wide">
                <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
                <span>{badgeText}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              {subtitle}
            </p>
          </div>

          {showViewAllButton && (
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/blogs"
                id="view-all-blogs-btn"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 hover:bg-gray-50 px-5 py-2.5 text-xs font-mono font-bold text-black transition-colors"
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
                      ? 'bg-black text-white border-slate-700 font-bold' 
                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:text-white hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-white text-gray-500">
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
            <div className="lg:col-span-5 h-full min-h-[450px]">
              <HeroImageCard
                imageUrl={getBlogCoverImage(heroPost)}
                imageAlt={heroPost.title}
                title={heroPost.title}
                subtitle={
                  <div className="flex items-center gap-2 text-xs font-mono mt-2 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-white/70" />
                      {formatDate(heroPost.createdAt)}
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-white/70" />
                      {getArticleReadingTime(heroPost)}
                    </span>
                  </div>
                }
                description={heroPost.excerpt || 'Explore deep-dive telemetry diagnostics, modern SSR hydration patterns, and benchmark data from production engines.'}
                badge={
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] font-mono font-bold text-white backdrop-blur-md">
                      {heroPost.category || 'Trending'}
                    </span>
                    <span className="rounded bg-white text-black px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-sm">
                      Featured
                    </span>
                  </div>
                }
                topRight={
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(heroPost.slug || heroPost.id || '', e);
                      }}
                      title="Share Article Link"
                      className="h-8 w-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white transition-colors hover:bg-black/60 backdrop-blur-md cursor-pointer shadow-sm"
                    >
                      {copiedSlug === (heroPost.slug || heroPost.id) ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Share2 className="h-4 w-4 text-white/90" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(heroPost.id || heroPost.slug, e);
                      }}
                      title={bookmarkedIds.has(heroPost.id || heroPost.slug) ? "Remove Bookmark" : "Save Article"}
                      className="h-8 w-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white transition-colors hover:bg-black/60 backdrop-blur-md cursor-pointer shadow-sm"
                    >
                      {bookmarkedIds.has(heroPost.id || heroPost.slug) ? (
                        <BookmarkCheck className="h-4 w-4 text-white fill-white" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-white/90" />
                      )}
                    </button>
                  </div>
                }
                action={
                  <Link
                    to={`/blog/${heroPost.slug || heroPost.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-gray-100 px-4 py-2.5 text-sm font-bold text-black transition-colors shadow-sm"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
                footer={
                  <div className="flex items-center gap-2.5">
                    {heroPost.authorAvatar ? (
                      <img
                        src={heroPost.authorAvatar}
                        alt={heroPost.authorName || 'Author'}
                        className="h-8 w-8 rounded-full object-cover border border-white/20"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xs">
                        {heroPost.authorName ? heroPost.authorName.charAt(0) : 'C'}
                      </div>
                    )}
                    <div className="text-xs font-mono text-white/90">
                      <div className="font-bold">{heroPost.authorName || 'CatalystLab Telemetry'}</div>
                      <div className="text-[10px] text-white/60">Principal Engineer</div>
                    </div>
                  </div>
                }
                aspectRatio="h-full w-full"
                overlayStyle="solid" bottomGradientClasses="from-slate-900 via-slate-900/90"
              />
            </div>
          )}

          {/* Right 2x2 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {finalCompactPosts.map((post, idx) => {
                const isBookmarked = bookmarkedIds.has(post.id || post.slug);
                return (
                  <div key={post.slug || post.id || idx} className="h-[260px] md:h-full">
                    <HeroImageCard
                      imageUrl={getBlogCoverImage(post)}
                      imageAlt={post.title}
                      title={<div className="text-lg md:text-xl line-clamp-2">{post.title}</div>}
                      description={null}
                      badge={
                        <span className="rounded bg-black/60 border border-white/20 px-2 py-0.5 text-[9px] font-mono font-bold text-white backdrop-blur-md">
                          {post.category || 'Guide'}
                        </span>
                      }
                      topRight={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(post.id || post.slug, e);
                          }}
                          title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                          className="h-7 w-7 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white transition-colors hover:bg-black/60 backdrop-blur-md cursor-pointer shadow-sm"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5 text-white fill-white" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5 text-white/90" />
                          )}
                        </button>
                      }
                      footer={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            <Calendar className="h-3 w-3 text-white/70" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPost(post);
                              }}
                              className="text-[10px] text-white/70 hover:text-white font-semibold transition-colors cursor-pointer"
                            >
                              Peek
                            </button>
                            <Link 
                              to={`/blog/${post.slug || post.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-colors"
                              aria-label={`Read article: ${post.title}`}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      }
                      aspectRatio="h-full w-full"
                      overlayStyle="solid" bottomGradientClasses="from-slate-900 via-slate-900/90"
                    />
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
        {/* Bottom Ecosystem & Trust Bar */}
        {showEcosystemBar && (
          <div className="mt-8 pt-6 border-t border-gray-200 font-mono">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                Audited &amp; Integrated Across Modern Cloud Ecosystems:
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-600">
                <span className="flex items-center gap-1 font-bold text-black">
                  <span className="text-accent-amber font-black">●</span> Cloudflare
                </span>
                <span className="flex items-center gap-1 font-bold text-black">
                  <span className="text-accent-cyan font-black">■</span> Google Cloud
                </span>
                <span className="flex items-center gap-1 font-bold text-black">
                  <span className="text-accent-rose font-black">▲</span> Fastly
                </span>
                <span className="flex items-center gap-1 font-bold text-black">
                  <span className="text-accent-amber font-black">◆</span> AWS
                </span>
                <span className="flex items-center gap-1 font-bold text-black">
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
              className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 text-black shadow-2xl overflow-hidden font-mono"
            >
              <button
                onClick={() => setPreviewPost(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="rounded bg-cyan-950/60 text-accent-cyan border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold">
                  {previewPost.category}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(previewPost.createdAt)} • {previewPost.readTime}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-black leading-snug mb-3">
                {previewPost.title}
              </h3>

              <div className="w-full aspect-[16/8] rounded-xl overflow-hidden mb-3 bg-white border border-gray-200">
                <img 
                  src={getBlogCoverImage(previewPost)} 
                  alt={previewPost.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {previewPost.excerpt}
              </p>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Author: <span className="text-white font-bold">{previewPost.authorName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPost(null)}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-gray-600 hover:text-white transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                  <Link
                    to={`/blog/${previewPost.slug || previewPost.id}`}
                    onClick={() => setPreviewPost(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black hover:bg-black-hover px-4 py-2 text-xs font-bold text-white transition-all shadow-sm border border-slate-300"
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
