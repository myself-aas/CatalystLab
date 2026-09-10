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
import { getBlogCoverImage } from '../utils/blogImageMap';
import { getArticleReadingTime } from '../utils/readingTime';
import { logger } from '../lib/logger';
import { BlogCardSkeleton } from '../components/skeleton';
import { motion, AnimatePresence } from 'motion/react';

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
          setPosts(ENGINE_SEEDED_BLOGS as any);
        } else {
          setPosts(data.filter(p => p.status !== 'archived'));
        }
      } catch (err) {
        logger.error("Error loading blog posts:", err);
        setPosts(ENGINE_SEEDED_BLOGS as any);
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
    <div data-theme="dark" className="min-h-screen ds-page-top bg-[#1F2223] text-[#F0FAFF] font-sans pb-20">
      <SEOHead 
        title="Discover News | CatalystLab" 
        description="Latest news from all over the world." 
      />

      <div className="max-w-2xl mx-auto relative min-h-screen flex flex-col">
        {/* Compact title bar — no duplicate hamburger (global Navbar handles it) */}
        <header className="px-6 py-4 flex items-center justify-between sticky top-[var(--nav-height,4rem)] z-30 bg-[#1F2223]/85 backdrop-blur-xl border-b border-[rgba(240,250,255,0.06)]">
          <h1 className="text-lg font-bold tracking-tight text-[#F0FAFF]">Discover</h1>
          {user && isAdmin && (
            <Link to="/blogs/create" className="inline-flex items-center gap-1.5 rounded-full bg-[#2C3032] border border-[rgba(240,250,255,0.08)] px-3 py-1.5 text-xs font-medium text-[#F0FAFF] hover:border-[rgba(240,250,255,0.18)] transition-colors">
              <Plus className="w-4 h-4" />
              New
            </Link>
          )}
        </header>

        {/* Discover Header */}
        <div className="px-6 pt-6 pb-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[rgba(240,250,255,0.45)] mb-1.5">News & Insights</p>
          <h2 className="text-3xl font-bold tracking-tight text-[#F0FAFF] mb-1">Discover</h2>
          <p className="text-sm text-[rgba(240,250,255,0.55)]">News from all over the world.</p>
        </div>

        {/* Search — pill shape */}
        <div className="px-6 mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,250,255,0.45)]" />
            <input
              type="text"
              placeholder="Search articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2C3032] text-[#F0FAFF] rounded-full py-3 pl-11 pr-11 text-sm outline-none border border-[rgba(240,250,255,0.08)] focus:border-[rgba(240,250,255,0.18)] transition-colors placeholder:text-[rgba(240,250,255,0.4)] shadow-[inset_0_1px_0_rgba(240,250,255,0.04)]"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-[#1F2223] border border-[rgba(240,250,255,0.08)] flex items-center justify-center text-[rgba(240,250,255,0.55)] hover:text-[#F0FAFF] transition-colors">
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
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-[#F0FAFF] text-[#1F2223] border-transparent shadow-[0_2px_10px_rgba(240,250,255,0.15)]'
                      : 'bg-[#2C3032] text-[rgba(240,250,255,0.65)] border-[rgba(240,250,255,0.08)] hover:text-[#F0FAFF] hover:border-[rgba(240,250,255,0.18)]'
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
            <div className="py-12 text-center text-[rgba(240,250,255,0.5)] rounded-3xl border border-[rgba(240,250,255,0.06)] bg-[#2C3032]">
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
                    <Link to={`/blog/${post.slug || post.id}`} className="group flex gap-4 items-center p-3 rounded-2xl hover:bg-[#2C3032] transition-colors border border-transparent hover:border-[rgba(240,250,255,0.06)]">
                      <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-[#2C3032] border border-[rgba(240,250,255,0.06)]">
                        <img
                          src={getBlogCoverImage(post)}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[#F0FAFF] leading-snug line-clamp-2 mb-2 group-hover:text-[#F0FAFF] transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] text-[rgba(240,250,255,0.45)] font-medium">
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
