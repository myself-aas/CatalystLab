import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { BlogPost } from '../../types';
import { getBlogPosts, saveBlogPost, deleteBlogPost } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { getArticleReadingTime } from '../../utils/readingTime';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Sparkles, 
  Layers, 
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  FileText,
  TrendingUp,
  BarChart2
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'AI & LLMO',
  'Edge Latency',
  'SecOps & Compliance',
  'DOM & Performance',
  'Web Architecture',
  'Sustainability & Green Web',
  'Release Notes',
  'Engineering'
];

export const BlogManagementView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await saveBlogPost({ ...post, status: newStatus });
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p)));
      showNotification(`Article status updated to ${newStatus}.`);
    } catch (err: unknown) {
      console.error('Error toggling status:', err);
      showNotification(`Failed to toggle status: ${err.message}`);
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to permanently delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      if (post.id) {
        await deleteBlogPost(post.id);
        setPosts(posts.filter((p) => p.id !== post.id));
        showNotification('Article deleted successfully.');
      }
    } catch (err: unknown) {
      console.error('Failed to delete post:', err);
      showNotification(`Failed to delete post: ${err.message}`);
    }
  };

  const handleCopyLink = (post: BlogPost) => {
    const slug = post.slug || post.id || '';
    const url = `${window.location.origin}/blogs/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(post.id || post.slug || 'article');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.authorName?.toLowerCase().includes(query) ||
        post.category?.toLowerCase().includes(query) ||
        post.tags?.some((t) => t.toLowerCase().includes(query));

      const matchesCat =
        selectedCategory === 'All Categories' || post.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === 'all' || post.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [posts, searchQuery, selectedCategory, selectedStatus]);

  // Aggregate stats
  const totalViews = useMemo(() => posts.reduce((acc, p) => acc + (p.views || 0), 0), [posts]);
  const publishedCount = useMemo(() => posts.filter((p) => p.status === 'published').length, [posts]);
  const draftCount = useMemo(() => posts.filter((p) => p.status === 'draft').length, [posts]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-950/90 border border-emerald-500/40 px-4 py-3 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 p-1.5">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Article Editorial CMS Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Author and orchestrate technical benchmark publications, telemetry analyses, and architecture briefs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPosts}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Refresh articles"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Dedicated Page Navigation Link (No Popups!) */}
          <Link
            to="/admin/blogs/create"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create New Article</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-[#0b192c]/90 p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Articles</div>
          <div className="text-2xl font-black text-white mt-1">{posts.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0b192c]/90 p-4">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Published</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{publishedCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0b192c]/90 p-4">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Drafts</div>
          <div className="text-2xl font-black text-amber-300 mt-1">{draftCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0b192c]/90 p-4">
          <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">Cumulative Views</div>
          <div className="text-2xl font-black text-sky-300 mt-1">{totalViews.toLocaleString()}</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0b192c]/90 border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, excerpt, author, or keyword..."
            className="w-full rounded-xl border border-slate-700/60 bg-[#07111e] pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-700/60 bg-[#07111e] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="rounded-xl border border-slate-700/60 bg-[#07111e] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Articles Stream / List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
            <RefreshCw className="h-7 w-7 animate-spin text-cyan-400 mb-3" />
            <div className="font-semibold text-white">Loading CMS Articles...</div>
            <div className="text-xs text-slate-500 mt-1">Querying telemetry and publication archives.</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 rounded-2xl border border-slate-800 bg-[#0b192c]/70 p-8 shadow-xl">
            <BookOpen className="mx-auto h-10 w-10 text-cyan-400/40 mb-3" />
            <h3 className="text-base font-bold text-white">No Matching Articles Found</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? 'Try clearing your search query or category filters.' : 'Get started by creating your first deep-dive technical article.'}
            </p>
            <Link
              to="/admin/blogs/create"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-[#07111e] hover:bg-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Compose First Article</span>
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const articleIdOrSlug = post.id || post.slug || '';
            return (
              <div
                key={post.id || post.slug}
                className="rounded-2xl border border-slate-800 bg-[#0b192c]/90 p-4 sm:p-5 shadow-md transition-all hover:border-cyan-500/40 hover:bg-[#0d1f38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Metadata & Title */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-cyan-950/80 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/30">
                        {post.category || 'Engineering'}
                      </span>
                      <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-cyan-400 font-mono">
                        • {getArticleReadingTime(post)}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white truncate hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                      <Link to={`/admin/blogs/edit/${articleIdOrSlug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-mono text-slate-500">By {post.authorName || 'CatalystLab Team'}</span>
                      {post.tags && post.tags.length > 0 && (
                        <>
                          <span className="text-slate-700">•</span>
                          {post.tags.slice(0, 4).map((t) => (
                            <span key={t} className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                              #{t}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-slate-800 pt-3 lg:border-t-0 lg:pt-0">
                    
                    {/* View Live Article Button */}
                    <a
                      href={`/blogs/${post.slug || post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      title="View live article"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View</span>
                    </a>

                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(post)}
                      className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      title="Copy public link"
                    >
                      {copiedId === (post.id || post.slug) ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Dedicated Edit Page Button (Navigates to unique URL) */}
                    <Link
                      to={`/admin/blogs/edit/${articleIdOrSlug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>

                    {/* Toggle Status */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(post)}
                      className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      {post.status === 'published' ? 'Draft' : 'Publish'}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      className="p-2 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      title="Delete article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
