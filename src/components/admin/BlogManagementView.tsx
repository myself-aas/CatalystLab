import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPostMeta } from '@/types/blog';
import { getManagedPosts } from '@/lib/blogLoader';
import { BLOG_CATEGORIES } from '@blogs/src/lib/categories';
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

const CATEGORIES = ['All Categories', ...BLOG_CATEGORIES];

/**
 * Lists the MDX posts in blogs/posts/. Publishing, unpublishing and deleting
 * are file changes (edit `status:` or remove the file, then commit), so this
 * view only links out to the article and to the .mdx export editor.
 */
export const BlogManagementView: React.FC = () => {
  const posts = useMemo(() => getManagedPosts(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopyLink = (post: BlogPostMeta) => {
    void navigator.clipboard?.writeText(`${window.location.origin}/blogs/${post.slug}`);
    setCopiedSlug(post.slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));
      const matchesCat = selectedCategory === 'All Categories' || post.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [posts, searchQuery, selectedCategory, selectedStatus]);

  const totalViews = useMemo(() => posts.reduce((acc, p) => acc + p.views, 0), [posts]);
  const publishedCount = useMemo(() => posts.filter((p) => p.status === 'published').length, [posts]);
  const draftCount = posts.length - publishedCount;

  return (
    <div className="space-y-6">
      
      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-foreground/20 text-amber-600 border border-cyan-400/30 p-1.5">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Article Editorial CMS Studio
            </h2>
          </div>
          <p className="text-xs ds-muted mt-1">
            Posts are MDX files in <code className="font-mono">blogs/posts/</code>. Change status or delete by editing the file and committing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Dedicated Page Navigation Link (No Popups!) */}
          <Link
            to="/admin/blogs/create"
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border px-4 py-2.5 text-xs font-bold text-primary-foreground transition shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create New Article</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ds-card p-4">
          <div className="ds-eyebrow">Total Articles</div>
          <div className="text-2xl font-black text-foreground mt-1">{posts.length}</div>
        </div>
        <div className="ds-card p-4">
          <div className="ds-eyebrow">Published</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{publishedCount}</div>
        </div>
        <div className="ds-card p-4">
          <div className="ds-eyebrow">Drafts</div>
          <div className="text-2xl font-black text-amber-300 mt-1">{draftCount}</div>
        </div>
        <div className="ds-card p-4">
          <div className="ds-eyebrow">Cumulative Views</div>
          <div className="text-2xl font-black text-sky-300 mt-1">{totalViews.toLocaleString()}</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-background/90 border border-border p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ds-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, excerpt, author, or keyword..."
            className="w-full ds-control bg-background border border-border pl-9 pr-4 py-2 text-xs text-foreground placeholder:ds-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ds-card px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'published' | 'draft')}
            className="ds-card px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Articles Stream / List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center ds-muted ds-card p-8 shadow-xl">
            <BookOpen className="mx-auto h-10 w-10 text-amber-600/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">No Matching Articles Found</h3>
            <p className="mt-1 text-xs ds-muted max-w-sm mx-auto">
              {searchQuery ? 'Try clearing your search query or category filters.' : 'Get started by creating your first deep-dive technical article.'}
            </p>
            <Link
              to="/admin/blogs/create"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Compose First Article</span>
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => {
            return (
              <div
                key={post.slug}
                className="ds-card p-4 sm:p-5 shadow-md transition hover:border-cyan-500/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Metadata & Title */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-cyan-950/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 border border-cyan-500/30">
                        {post.category}
                      </span>
                      <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
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
                      <span className="text-xs text-amber-600 font-mono">
                        • {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-foreground truncate hover:text-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Link to={`/admin/blogs/edit/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs ds-muted line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-mono ds-muted">By {post.author}</span>
                      {post.tags.length > 0 && (
                        <>
                          <span className="ds-muted">•</span>
                          {post.tags.slice(0, 4).map((t) => (
                            <span key={t} className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium ds-muted">
                              #{t}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-border pt-3 lg:border-t-0 lg:pt-0">
                    
                    {/* View Live Article Button (drafts have no public page) */}
                    {post.status === 'published' && (
                    <a
                      href={`/blogs/${post.slug}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 ds-card px-3 py-1.5 text-xs font-semibold ds-muted hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="View live article"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View</span>
                    </a>
                    )}

                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(post)}
                      className="p-2 ds-card ds-muted hover:text-amber-600 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="Copy public link"
                    >
                      {copiedSlug === post.slug ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Dedicated Edit Page Button (Navigates to unique URL) */}
                    <Link
                      to={`/admin/blogs/edit/${post.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-foreground/10 px-3.5 py-1.5 text-xs font-bold text-amber-600 hover:bg-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>

                    <span
                      className="inline-flex items-center gap-1 px-2 py-1.5 font-mono text-[11px] ds-muted"
                      title="Source file"
                    >
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
