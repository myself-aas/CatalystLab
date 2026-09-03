import { BlogCard } from "../cards/content/BlogCard";
import { EnzymeHue } from "../cards/types";
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
import { logger } from '../../lib/logger';
import { BlogCardSkeleton } from '../skeleton';

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
    } catch (e) { logger.error("Ignored error:", e); }
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
        logger.warn("Could not fetch remote blogs, using local seeds:", err);
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
      className={`relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden bg-transparent border-b border-border ${className}`}
      aria-label="Latest engineering news and articles"
    >
      <div className="relative rounded-3xl border border-border bg-muted p-6 sm:p-8 lg:p-10 shadow-xl">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-3 max-w-2xl">
            {badgeText && (
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-sans font-bold text-indigo-700 tracking-widest uppercase shadow-sm">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>{badgeText}</span>
              </div>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-muted-foreground font-medium text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
          </div>

          {showViewAllButton && (
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/blogs"
                id="view-all-blogs-btn"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background hover:bg-muted px-5 py-3 text-sm font-sans font-bold text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              >
                <span>View all blogs</span>
                <ArrowRight className="h-4 w-4 text-indigo-600" />
              </Link>
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        {showFilterTabs && (
          <div className="mt-6 flex items-center gap-2.5 overflow-x-auto pb-3 no-scrollbar">
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
                  className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-sans transition-all shadow-sm cursor-pointer border ${
                    isActive 
                      ? 'bg-primary text-primary-foreground border-border font-bold shadow-md' 
                      : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted font-medium'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isActive ? 'bg-background/20 text-primary-foreground' : 'bg-accent text-muted-foreground'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        
        {/* 1 + 4 Grid Layout */}
        {loading && posts.length === 0 ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" role="status" aria-label="Loading research articles...">
            <div className="lg:col-span-5 h-full">
              <BlogCardSkeleton />
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Hero Card */}
          {heroPost && (
            <div className="lg:col-span-5 h-full">
              <BlogCard
                id={heroPost.id || heroPost.slug}
                slug={heroPost.slug || heroPost.id || ''}
                title={heroPost.title}
                excerpt={heroPost.excerpt || 'Explore deep-dive telemetry diagnostics, modern SSR hydration patterns, and benchmark data from production engines.'}
                category={heroPost.category || 'Featured'}
                readTime={getArticleReadingTime(heroPost)}
                publishedAt={formatDate(heroPost.createdAt)}
                author={{
                  name: heroPost.authorName || 'CatalystLab Telemetry',
                  role: 'Principal Engineer',
                  avatarUrl: heroPost.authorAvatar,
                }}
                imageUrl={getBlogCoverImage(heroPost)}
                assetId="engine-neural-hologram"
                hue="vitalzyme"
                isBookmarked={bookmarkedIds.has(heroPost.id || heroPost.slug)}
                onBookmarkToggle={(s) => toggleBookmark(heroPost.id || s, {} as React.MouseEvent)}
                onShare={(s) => handleShare(s, {} as React.MouseEvent)}
                className="h-full flex flex-col justify-between"
              />
            </div>
          )}

          {/* Right 2x2 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {finalCompactPosts.map((post, idx) => {
                const isBookmarked = bookmarkedIds.has(post.id || post.slug);
                const hues: EnzymeHue[] = ['llmkinase', 'edgevmax', 'riskprotease', 'ecoholo'];
                const activeHue = hues[idx % hues.length];
                
                return (
                  <div key={post.slug || post.id || idx} className="h-full">
                    <BlogCard
                      id={post.id || post.slug}
                      slug={post.slug || post.id || ''}
                      title={post.title}
                      excerpt={post.excerpt || 'Real-time telemetry and edge diagnostic research.'}
                      category={post.category || 'Research'}
                      readTime={getArticleReadingTime(post)}
                      publishedAt={formatDate(post.createdAt)}
                      author={{
                        name: post.authorName || 'Staff Engineer',
                        avatarUrl: post.authorAvatar,
                      }}
                      imageUrl={getBlogCoverImage(post)}
                      assetId="engine-quantum-processor"
                      hue={activeHue}
                      isBookmarked={isBookmarked}
                      onBookmarkToggle={(s) => toggleBookmark(post.id || s, {} as React.MouseEvent)}
                      onShare={(s) => handleShare(s, {} as React.MouseEvent)}
                      className="h-full flex flex-col justify-between"
                    />
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
        )}
        {/* Bottom Ecosystem & Trust Bar */}
        {showEcosystemBar && (
          <div className="mt-10 pt-6 border-t border-border font-sans">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Audited &amp; Integrated Across Modern Cloud Ecosystems:
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                  <span className="text-amber-500 font-black">●</span> Cloudflare
                </span>
                <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                  <span className="text-indigo-600 font-black">■</span> Google Cloud
                </span>
                <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                  <span className="text-rose-500 font-black">▲</span> Fastly
                </span>
                <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                  <span className="text-amber-500 font-black">◆</span> AWS
                </span>
                <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                  <span className="text-foreground font-black">▲</span> Vercel
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {previewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-2xl rounded-3xl border border-border bg-background p-6 sm:p-8 text-foreground shadow-2xl overflow-hidden font-sans"
            >
              <button
                onClick={() => setPreviewPost(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="rounded bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-bold shadow-sm">
                  {previewPost.category}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatDate(previewPost.createdAt)} • {previewPost.readTime}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug mb-4">
                {previewPost.title}
              </h3>

              <div className="w-full aspect-[16/8] rounded-2xl overflow-hidden mb-4 bg-accent border border-border shadow-sm">
                <img 
                  src={getBlogCoverImage(previewPost)} 
                  alt={previewPost.title} 
                  className="w-full h-full object-cover"
                  
                />
              </div>

              <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">
                {previewPost.excerpt}
              </p>

              <div className="flex items-center justify-between gap-3 pt-5 border-t border-border">
                <div className="text-xs font-medium text-muted-foreground">
                  Author: <span className="text-foreground font-bold">{previewPost.authorName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewPost(null)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:bg-muted"
                  >
                    Close Preview
                  </button>
                  <Link
                    to={`/blog/${previewPost.slug || previewPost.id}`}
                    onClick={() => setPreviewPost(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-bold text-primary-foreground transition-all shadow-md"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="h-4 w-4" />
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
