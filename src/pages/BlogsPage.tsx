import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_BLOG_COVER, getAllPosts } from '@/lib/blogLoader';
import { useAuth } from '../context/AuthContext';
import { Search, Clock, Plus, Sliders } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { PlateImage } from '../components/common/PlateImage';
import { motion, AnimatePresence } from 'motion/react';

export const BlogsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  // Build-time index: synchronous, so the list renders on first paint.
  const posts = getAllPosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return posts.filter(post => {
      const matchesSearch = !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query));
      const matchesTopic = selectedTopic === 'All' || post.category === selectedTopic;
      return matchesSearch && matchesTopic;
    });
  }, [posts, searchQuery, selectedTopic]);

  const topics = useMemo(() => {
    const categories = [...new Set(posts.map(p => p.category))];
    return [{ key: 'All', label: 'Discover' }, ...categories.map(c => ({ key: c, label: c }))];
  }, [posts]);

  return (
    <div className="min-h-screen ds-page-top bg-background text-foreground font-sans pb-20">
      <SEOHead
        title="Engineering Blog: Web Health, Performance and AI Search | CatalystLab"
        description="Research notes on Core Web Vitals, DOM cost, AI crawler policy, structured data and sustainable web engineering, written by the team that builds the engines."
        canonicalPath="/blogs"
        absoluteTitle
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Engineering notes on web health and AI search</h1>
          <p className="text-sm text-muted-foreground">Written by the engineers who build the engines, with the measurement each post is based on.</p>
        </div>

        {/* Topic Pills - one per frontmatter category */}
        <div className="px-6 mb-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 pb-1 min-w-max">
            {topics.map((topic) => {
              const isActive = selectedTopic === topic.key;
              return (
                <button
                  key={topic.key}
                  type="button"
                  aria-pressed={isActive}
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

        {/* Content Area */}
        <div className="flex-1 px-6 pb-12">
          {filteredPosts.length === 0 ? (
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
                    key={post.slug}
                  >
                    <Link to={`/blogs/${post.slug}`} className="group flex gap-4 items-center p-3 rounded-2xl hover:bg-muted transition-colors border border-transparent hover:border-foreground/10">
                      <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-muted border border-foreground/10">
                        <PlateImage
                          src={post.coverImage ?? DEFAULT_BLOG_COVER}
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
                            {post.readTime}
                          </span>
                          <span className="truncate">By {post.author}</span>
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
