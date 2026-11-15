import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPostMeta } from '@/types/blog';
import { getManagedPosts } from '@/lib/blogLoader';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Plus,
  Edit3,
  ExternalLink,
  Search,
  Copy,
  Check,
  FileCode2
} from 'lucide-react';

/**
 * The signed-in author's MDX posts (matched on `authorEmail` frontmatter).
 * Status changes and deletion are file edits committed to blogs/posts/.
 */
export const UserBlogManagementView: React.FC = () => {
  const { user } = useAuth();
  const posts = useMemo(
    () => (user?.email ? getManagedPosts().filter((post) => post.authorEmail === user.email) : []),
    [user?.email]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopyLink = (post: BlogPostMeta) => {
    void navigator.clipboard?.writeText(`${window.location.origin}/blogs/${post.slug}`);
    setCopiedSlug(post.slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return posts.filter(
      (post) =>
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-cream/10 text-foreground p-1.5 border border-cream/20">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-foreground">My Published Articles & Drafts</h2>
          </div>
          <p className="text-xs ds-muted mt-1">
            Your posts in <code className="font-mono">blogs/posts/</code>. Export from the editor and commit the file to publish.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dedicated URL for Create (No Popup!) */}
          <Link
            to="/dashboard/blogs/create"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
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
          className="w-full ds-control bg-background border border-border pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:ds-muted focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center ds-muted rounded-2xl border border-dashed border-border bg-background p-8 shadow-xs">
            <BookOpen className="mx-auto h-10 w-10 ds-muted mb-3" />
            <h3 className="text-base font-bold text-foreground">No Articles Found</h3>
            <p className="mt-1 text-xs ds-muted max-w-sm mx-auto">
              You haven't written any articles yet, or no articles match your search filter.
            </p>
            <Link
              to="/dashboard/blogs/create"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Article</span>
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => {
            return (
              <div
                key={post.slug}
                className="ds-card p-4 sm:p-5 shadow-xs transition hover:border-border hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-cream/10 px-2 py-0.5 text-[11px] font-bold text-foreground border border-cream/20">
                        {post.category}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        post.status === 'published'
                          ? 'bg-cream/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-cream/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs ds-muted font-mono">
                        {new Date(`${post.date}T00:00:00Z`).toLocaleDateString('en-US', {
                          timeZone: 'UTC',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-sky-700 font-mono font-medium">
                        • {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground truncate">
                      <Link to={`/dashboard/blogs/edit/${post.slug}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs ds-muted line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-border pt-3 sm:border-t-0 sm:pt-0">
                    
                    {post.status === 'published' && (
                    <a
                      href={`/blogs/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 ds-card px-3 py-1.5 text-xs font-semibold ds-muted hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="View live article"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View</span>
                    </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyLink(post)}
                      className="p-2 ds-card ds-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="Copy public link"
                    >
                      {copiedSlug === post.slug ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Dedicated Edit Page Navigation */}
                    <Link
                      to={`/dashboard/blogs/edit/${post.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-cream/20 bg-cream/10 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-cream/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Article</span>
                    </Link>

                    <span className="inline-flex items-center gap-1 px-2 py-1.5 font-mono text-[11px] ds-muted" title="Source file">
                      <FileCode2 className="h-3.5 w-3.5" />
                      {post.slug}.mdx
                    </span>
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
