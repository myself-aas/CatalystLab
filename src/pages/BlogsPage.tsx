import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPosts } from '../lib/firebase';
import { ENGINE_SEEDED_BLOGS } from '../data/engineBlogs';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, Search, BookOpen, Settings, Clock, 
  Bookmark, Sparkles, Plus, X, Menu, User, Home,
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
    <div data-theme="dark" className="min-h-screen bg-[#1F2223] text-[#F7FDFF] font-sans pt-16 sm:pt-24 pb-20">
      <SEOHead 
        title="Discover News | CatalystLab" 
        description="Latest news from all over the world." 
      />

      <div className="max-w-md mx-auto relative min-h-screen flex flex-col bg-[#1F2223]">
        {/* Top Header */}
        <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#1F2223]/90 backdrop-blur-md z-40 border-b border-white/5">
          <button className="text-[#F7FDFF] hover:text-[#F0FAFF] transition-colors">
            <Menu className="w-6 h-6 stroke-[1.5]" />
          </button>
          {user && isAdmin && (
            <Link to="/blogs/create" className="text-[#F7FDFF] hover:text-[#F0FAFF]">
              <Plus className="w-6 h-6 stroke-[1.5]" />
            </Link>
          )}
        </header>

        {/* Discover Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#F7FDFF] mb-1">Discover</h1>
          <p className="text-sm text-gray-400">News from all over the world</p>
        </div>

        {/* Search */}
        <div className="px-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2C2F32] text-[#F7FDFF] rounded-2xl py-3.5 pl-11 pr-11 text-sm outline-none border border-transparent focus:border-white/10 transition-colors placeholder:text-gray-500"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2">
              <Sliders className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Tabs */}
        <div className="px-6 mb-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 pb-2 min-w-max">
            {TOPICS.map((topic) => {
              const isActive = selectedTopic === topic.key;
              return (
                <button
                  key={topic.key}
                  onClick={() => setSelectedTopic(topic.key)}
                  className={`text-base transition-colors font-medium whitespace-nowrap relative ${
                    isActive ? 'text-[#F7FDFF]' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {topic.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#F7FDFF]" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 pb-12">
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <BlogCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No articles found.
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredPosts.map((post, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={post.id || post.slug}
                  >
                    <Link to={`/blog/${post.slug || post.id}`} className="group flex gap-4 items-center">
                      <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-[#2C3032]">
                        <img 
                          src={getBlogCoverImage(post)} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#F7FDFF] leading-snug line-clamp-2 mb-2 group-hover:text-gray-300 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
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
