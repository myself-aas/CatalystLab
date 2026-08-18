import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPosts } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  ArrowRight, 
  Search, 
  Tag, 
  Clock, 
  Calendar, 
  Sparkles,
  Shield,
  Layers,
  Settings
} from 'lucide-react';

export const BlogsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getBlogPosts();
        // Show all blogs to all visitors (except archived)
        const visible = data.filter((p) => p.status !== 'archived');
        setPosts(visible);
      } catch (err) {
        console.error("Error loading blog posts:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c]">
      
      {/* Hero Banner */}
      <section className="border-b border-[#ebe9e6] bg-[#f4f6fa] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#415a77]/15 text-[#415a77] mb-4 border border-[#415a77]/30 shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b192c] sm:text-5xl">
            Architecture & Telemetry Insights
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#415a77]">
            Deep technical investigations into AI search vectorization, synthetic edge latency, OWASP compliance, and zero-trust web infrastructure.
          </p>

          {/* Admin quick access - Only visible to Primary Superadmins */}
          {user && isAdmin && (
            <div className="mt-6 flex justify-center">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/40 bg-[#0b192c] px-4 py-1.5 text-xs font-semibold text-[#f8fafc] hover:bg-[#152238] transition-colors shadow-sm"
              >
                <Settings className="h-3.5 w-3.5 text-[#c5d3e8]" />
                <span>Open Superadmin Studio to Create New Articles</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#c5d3e8]" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="border-b border-[#ebe9e6] bg-[#f8fafc]/95 px-4 py-4 backdrop-blur-md sticky top-16 z-30 shadow-sm">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0b192c] text-[#f8fafc] font-bold shadow-sm'
                    : 'bg-[#ebe9e6] text-[#0b192c] hover:bg-[#c5d3e8] border border-[#ebe9e6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#415a77]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, tags, keywords..."
              className="w-full rounded-xl border border-[#415a77]/30 bg-[#f4f6fa] py-1.5 pl-9 pr-3 text-xs text-[#0b192c] placeholder:text-[#415a77]/60 focus:border-[#415a77] focus:outline-none"
            />
          </div>

        </div>
      </div>

      {/* Blog Cards List */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center text-[#415a77] text-sm">
            <span className="material-symbols-outlined text-2xl animate-spin text-[#415a77] mb-2 inline-block">progress_activity</span>
            <div>Loading technical articles...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-8 text-[#f8fafc]">
            <BookOpen className="mx-auto h-8 w-8 text-[#c5d3e8] mb-3" />
            <h3 className="text-base font-bold text-[#f8fafc]">No Articles Found</h3>
            <p className="mt-1 text-xs text-[#c5d3e8]">Try changing your search query or category filter.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article
              key={post.id || post.slug}
              className="group rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 hover:border-[#415a77]/60 transition-all shadow-xl text-[#f8fafc]"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#c5d3e8] font-mono mb-3">
                <span className="rounded-md bg-[#415a77]/30 px-2.5 py-0.5 font-bold text-[#c5d3e8] border border-[#415a77]/50 font-sans">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#c5d3e8]" />
                  <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#c5d3e8]" />
                  <span>{post.readTime}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#f8fafc] group-hover:text-[#c5d3e8] transition-colors">
                <Link to={`/blogs/${post.slug || post.id}`}>
                  {post.title}
                </Link>
              </h2>

              <p className="mt-3 text-sm text-[#ebe9e6] leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#415a77]/30 pt-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(post.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#152238] px-2 py-0.5 text-[11px] font-mono text-[#c5d3e8] border border-[#415a77]/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/blogs/${post.slug || post.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5d3e8] group-hover:text-[#f8fafc] transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
};
