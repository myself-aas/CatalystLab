import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { BlogPost } from '../../types';
import { getUserBlogPosts, saveBlogPost, deleteBlogPost } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { getArticleReadingTime } from '../../utils/readingTime';
import {
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { errorMessage } from '../../lib/utils';
import { logger } from '../../lib/logger';
import { SkeletonTable } from '../skeleton';

export const UserBlogManagementView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const fetched = await getUserBlogPosts(user.email);
      setPosts(fetched);
    } catch (error) {
      logger.error('Failed to fetch user blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`)) return;
    try {
      if (post.id) {
        await deleteBlogPost(post.id);
        setPosts(posts.filter((p) => p.id !== post.id));
        showNotification('Article deleted successfully.');
      }
    } catch (err: unknown) {
      logger.error('Failed to delete post:', err);
      showNotification(`Failed to delete post: ${errorMessage(err)}`);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await saveBlogPost({ ...post, status: newStatus });
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p)));
      showNotification(`Article ${newStatus === 'published' ? 'published' : 'saved as draft'}.`);
    } catch (err: unknown) {
      logger.error('Failed to toggle status:', err);
    }
  };

  const handleCopyLink = (post: BlogPost) => {
    const slug = post.slug || post.id || '';
    const url = `${window.location.origin}/blogs/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(post.id || post.slug || 'article');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt?.toLowerCase().includes(q) ||
        post.category?.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-primary-foreground shadow-2xl backdrop-blur-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-sky-100 text-sky-800 p-1.5 border border-sky-200">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-foreground">My Published Articles & Drafts</h2>
          </div>
          <p className="text-xs ds-muted mt-1">
            Author and manage your architecture and telemetry articles on CatalystLab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPosts}
            className="p-2.5 ds-card ds-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Refresh articles"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Dedicated URL for Create (No Popup!) */}
          <Link
            to="/dashboard/blogs/create"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Write New Article</span>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ds-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter your articles by title, topic, or keyword..."
          className="w-full ds-control bg-background border border-border pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:ds-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {loading ? (
          <SkeletonTable rows={4} columns={4} />
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center ds-muted rounded-2xl border border-dashed border-border bg-background p-8 shadow-xs">
            <BookOpen className="mx-auto h-10 w-10 ds-muted mb-3" />
            <h3 className="text-base font-bold text-foreground">No Articles Found</h3>
            <p className="mt-1 text-xs ds-muted max-w-sm mx-auto">
              You haven't written any articles yet, or no articles match your search filter.
            </p>
            <Link
              to="/dashboard/blogs/create"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Article</span>
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const articleIdOrSlug = post.id || post.slug || '';
            return (
              <div
                key={post.id || post.slug}
                className="ds-card p-4 sm:p-5 shadow-xs transition-all hover:border-border hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800 border border-sky-200">
                        {post.category || 'Technology'}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs ds-muted font-mono">
                        {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-sky-700 font-mono font-medium">
                        • {getArticleReadingTime(post)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground truncate">
                      <Link to={`/dashboard/blogs/edit/${articleIdOrSlug}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {post.title}
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="text-xs ds-muted line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-border pt-3 sm:border-t-0 sm:pt-0">
                    
                    <a
                      href={`/blogs/${post.slug || post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 ds-card px-3 py-1.5 text-xs font-semibold ds-muted hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="View live article"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(post)}
                      className="p-2 ds-card ds-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="Copy public link"
                    >
                      {copiedId === (post.id || post.slug) ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Dedicated Edit Page Navigation */}
                    <Link
                      to={`/dashboard/blogs/edit/${articleIdOrSlug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Article</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(post)}
                      className="ds-card px-3 py-1.5 text-xs font-semibold ds-muted hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {post.status === 'published' ? 'Draft' : 'Publish'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
