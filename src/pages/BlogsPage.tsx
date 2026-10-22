import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPosts } from '../lib/firebase';
import { ENGINE_SEEDED_BLOGS } from '../data/engineBlogs';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, Search, BookOpen, Settings, Clock, 
  Bookmark, Sparkles, Plus, X, User, Home,
  Sliders
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { PlateImage } from '../components/common/PlateImage';
import { getBlogCoverImage } from '../utils/blogImageMap';
import { getArticleReadingTime } from '../utils/readingTime';
import { logger } from '../lib/logger';
import { BlogCardSkeleton } from '../components/skeleton';
import { motion, AnimatePresence } from 'motion/react';

const SEEDED_BLOG_POSTS = Object.values(ENGINE_SEEDED_BLOGS)
  .flat()
  .filter((post, index, posts) => posts.findIndex((item) => item.slug === post.slug) === index) as BlogPost[];

const TOPICS = [
  { key: 'All', label: 'Discover' },
  { key: 'Health', label: 'Health' },
  { key: 'Politics', label: 'Politics' },
  { key: 'Art', label: 'Art' },
  { key: 'Food', label: 'Food' },
  { key: 'Science', label: 'Science' }
];

export const BlogsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getBlogPosts();
        if (!data || data.length === 0) {
          setPosts(SEEDED_BLOG_POSTS);
        } else {
          const published = data.filter(p => p.status !== 'archived');
          setPosts(published.length > 0 ? published : SEEDED_BLOG_POSTS);
        }
      } catch (err) {
        logger.error("Error loading blog posts:", err);
        setPosts(SEEDED_BLOG_POSTS);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTopic = selectedTopic === 'All' || 
                           (post.category && post.category.toLowerCase().includes(selectedTopic.toLowerCase()));
      return matchesSearch && matchesTopic;
    }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [posts, searchQuery, selectedTopic]);

  const heroPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const listPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <div className="min-h-screen ds-page-top bg-background text-foreground font-sans pb-20">
      <SEOHead 
        title="Discover News | CatalystLab" 
        description="Latest news from all over the world." 
      />

      <div className="max-w-2xl mx-auto relative min-h-screen flex flex-col">
        {/* Compact title bar — no duplicate hamburger (global Navbar handles it) */}
        <header className="px-6 py-4 flex items-center justify-between sticky top-[var(--nav-height,4rem)] z-30 bg-background/85 backdrop-blur-xl border-b border-foreground/10">
          <p className="text-lg font-bold tracking-tight text-foreground">Discover</p>
          {user && isAdmin && (
            <Link to="/blogs/create" className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground hover:border-foreground/20 transition-colors">
              <Plus className="w-4 h-4" />
              New
            </Link>
          )}
        </header>

        {/* Discover Header */}
        <div className="px-6 pt-6 pb-4">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">News & Insights</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Discover</h1>
          <p className="text-sm text-muted-foreground">News from all over the world.</p>
        </div>

        {/* Search — pill shape */}
        <div className="px-6 mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted text-foreground rounded-full py-3 pl-11 pr-11 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-foreground/10 focus:border-foreground/20 transition-colors placeholder:text-muted-foreground shadow-[inset_0_1px_0_rgba(240,250,255,0.04)]"
            />
            <button type="button" aria-label="Filter articles" className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Topic Pills */}
        <div className="px-6 mb-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 pb-1 min-w-max">
            {TOPICS.map((topic) => {
              const isActive = selectedTopic === topic.key;
              return (
                <button
                  key={topic.key}
                  onClick={() => setSelectedTopic(topic.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-transparent shadow-[0_2px_10px_rgba(240,250,255,0.15)]'
                      : 'bg-muted text-foreground/80 border-foreground/10 hover:text-foreground hover:border-foreground/20'
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 pb-12">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <BlogCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-foreground/50 rounded-3xl border border-foreground/10 bg-muted">
              No articles found.
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredPosts.map((post, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    key={post.id || post.slug}
                  >
                    <Link to={`/blog/${post.slug || post.id}`} className="group flex gap-4 items-center p-3 rounded-2xl hover:bg-muted transition-colors border border-transparent hover:border-foreground/10">
                      <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-muted border border-foreground/10">
                        <PlateImage
                          {...getBlogCoverImage(post)}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2 group-hover:text-foreground transition-colors">
                          {post.title}
                        </h2>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {getArticleReadingTime(post)}
                          </span>
                          {post.authorName && (
                            <span className="truncate">By {post.authorName}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BlogsPage;
