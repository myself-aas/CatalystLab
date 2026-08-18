import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../types';
import { getBlogPosts, saveBlogPost, deleteBlogPost } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
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
  Send,
  Layers,
  FileText,
  ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  'AI & LLMO',
  'Edge Latency',
  'SecOps & Compliance',
  'DOM & Performance',
  'Web Architecture',
  'Release Notes'
];

export const BlogManagementView: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = () => {
    setEditingPost({
      title: '',
      slug: '',
      excerpt: '',
      content: `## Executive Overview

Introduce the core technical thesis, performance vector, or security risk.

### Technical Implementation & Telemetry
1. **Network Layer**: Analysis of TTFB and edge routing.
2. **Application Layer**: DOM depth and runtime execution profiling.

\`\`\`typescript
// Example Code Snippet
export async function optimizeEndpoint() {
  // Production optimization logic
}
\`\`\`

### Remediation & Next Steps
Summarize key takeaways for engineering teams.`,
      category: 'AI & LLMO',
      tags: ['Architecture', 'SecOps', 'Telemetry'],
      authorName: user?.displayName || 'CatalystLab SecOps',
      authorEmail: user?.email || 'shuvo.1807016@bau.edu.bd',
      authorAvatar: user?.photoURL || '',
      status: 'published',
      readTime: '5 min read'
    });
    setEditorTab('write');
  };

  const handleTitleChange = (newTitle: string) => {
    if (!editingPost) return;
    const generatedSlug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 150);

    setEditingPost({
      ...editingPost,
      title: newTitle,
      slug: editingPost.id ? editingPost.slug : generatedSlug
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && editingPost) {
        const currentTags = editingPost.tags || [];
        if (!currentTags.includes(val)) {
          setEditingPost({ ...editingPost, tags: [...currentTags, val] });
        }
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      tags: (editingPost.tags || []).filter((t) => t !== tagToRemove)
    });
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title?.trim() || !editingPost.content?.trim()) {
      alert("Title and content are required.");
      return;
    }

    setSaving(true);
    try {
      const postId = await saveBlogPost(editingPost);
      setNotification(`Blog post "${editingPost.title}" successfully saved!`);
      setTimeout(() => setNotification(null), 4000);
      setEditingPost(null);
      await fetchPosts();
    } catch (err: any) {
      console.error("Save blog post failed:", err);
      alert("Failed to save blog post: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (!post.id) return;
    if (!confirm(`Are you sure you want to permanently delete "${post.title}"?`)) return;
    try {
      await deleteBlogPost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setNotification(`Deleted "${post.title}".`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post.");
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await saveBlogPost({ ...post, status: nextStatus });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p)));
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="space-y-8 text-[#0b192c]">
      
      {/* Toast */}
      {notification && (
        <div className="rounded-xl border border-[#415a77]/40 bg-[#0b192c] p-4 text-xs font-semibold text-[#c5d3e8] flex items-center justify-between shadow-lg">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-[#c5d3e8] hover:text-[#f8fafc]">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 shadow-md text-[#f8fafc]">
          <div className="flex items-center justify-between text-xs font-medium text-[#c5d3e8]">
            <span>Total Articles</span>
            <Layers className="h-4 w-4 text-[#c5d3e8]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#f8fafc]">{posts.length}</span>
            <span className="text-xs text-[#c5d3e8]/70">posts in CMS</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 shadow-md text-[#f8fafc]">
          <div className="flex items-center justify-between text-xs font-medium text-[#c5d3e8]">
            <span>Published Live</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{publishedCount}</span>
            <span className="text-xs text-[#c5d3e8]/70">publicly visible</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 shadow-md text-[#f8fafc]">
          <div className="flex items-center justify-between text-xs font-medium text-[#c5d3e8]">
            <span>Drafts</span>
            <Edit3 className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{draftCount}</span>
            <span className="text-xs text-[#c5d3e8]/70">in progress</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 shadow-md text-[#f8fafc]">
          <div className="flex items-center justify-between text-xs font-medium text-[#c5d3e8]">
            <span>Total Engagements</span>
            <Eye className="h-4 w-4 text-[#c5d3e8]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#c5d3e8]">{totalViews}</span>
            <span className="text-xs text-[#c5d3e8]/70">article views</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0b192c] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#415a77]" />
            <span>Architecture Articles & Technical Insights Studio</span>
          </h2>
          <p className="text-xs text-[#415a77] mt-0.5">
            Compose and publish technical guides, SecOps benchmarks, and release breakdowns.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-[#415a77] px-4 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#52718e] transition-all shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create New Article</span>
        </button>
      </div>

      {/* Editor Modal / Studio View */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl my-auto rounded-2xl border border-[#415a77]/40 bg-[#0b192c] p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col text-[#f8fafc]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#415a77]/30 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#c5d3e8]" />
                <h3 className="text-lg font-bold text-[#f8fafc]">
                  {editingPost.id ? 'Edit Article' : 'Create New Technical Article'}
                </h3>
              </div>
              <button
                onClick={() => setEditingPost(null)}
                className="text-[#c5d3e8] hover:text-[#f8fafc]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSavePost} className="space-y-4 overflow-y-auto flex-1 pr-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#c5d3e8] mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Decimating TTFB with Multi-Region Edge Workers"
                    className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#c5d3e8]/50 focus:border-[#c5d3e8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c5d3e8] mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    placeholder="decimating-ttfb-edge-workers"
                    className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2.5 text-sm font-mono text-[#c5d3e8] placeholder:text-[#c5d3e8]/50 focus:border-[#c5d3e8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#c5d3e8] mb-1">
                    Category
                  </label>
                  <select
                    value={editingPost.category || CATEGORIES[0]}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2.5 text-sm text-[#f8fafc] focus:border-[#c5d3e8] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c5d3e8] mb-1">
                    Publication Status
                  </label>
                  <select
                    value={editingPost.status || 'published'}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                    className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2.5 text-sm text-[#f8fafc] focus:border-[#c5d3e8] focus:outline-none"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c5d3e8] mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={editingPost.readTime || '5 min read'}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                    placeholder="e.g. 6 min read"
                    className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#c5d3e8]/50 focus:border-[#c5d3e8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c5d3e8] mb-1">
                  Excerpt / AI Search Meta Summary
                </label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Concise overview describing the article's core findings..."
                  className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] px-3.5 py-2 text-sm text-[#f8fafc] placeholder:text-[#c5d3e8]/50 focus:border-[#c5d3e8] focus:outline-none"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-[#c5d3e8] mb-1">
                  Tags (Press Enter or comma to add)
                </label>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#415a77]/40 bg-[#152238] p-2">
                  {(editingPost.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-md bg-[#415a77]/25 px-2 py-1 text-xs font-medium text-[#c5d3e8] border border-[#415a77]/40"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag and press enter..."
                    className="flex-1 min-w-[140px] bg-transparent text-xs text-[#f8fafc] placeholder:text-[#c5d3e8]/50 focus:outline-none px-2 py-1"
                  />
                </div>
              </div>

              {/* Content Editor with Write / Preview Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#c5d3e8]">
                    Article Body (Markdown Supported)
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-[#415a77]/40 bg-[#152238] p-0.5">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                        editorTab === 'write' ? 'bg-[#415a77] text-[#f8fafc]' : 'text-[#c5d3e8] hover:text-[#f8fafc]'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                        editorTab === 'preview' ? 'bg-[#415a77] text-[#f8fafc]' : 'text-[#c5d3e8] hover:text-[#f8fafc]'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {editorTab === 'write' ? (
                  <textarea
                    rows={12}
                    required
                    value={editingPost.content || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    placeholder="Write article in markdown..."
                    className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] p-4 text-xs sm:text-sm font-mono text-[#ebe9e6] placeholder:text-[#c5d3e8]/50 focus:border-[#c5d3e8] focus:outline-none leading-relaxed"
                  />
                ) : (
                  <div className="min-h-[280px] max-h-[360px] overflow-y-auto rounded-xl border border-[#415a77]/40 bg-[#152238]/60 p-5">
                    <MarkdownRenderer content={editingPost.content || '*No content to preview*'} />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-[#415a77]/30 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="rounded-xl border border-[#415a77]/40 bg-[#152238] px-4 py-2 text-xs font-semibold text-[#c5d3e8] hover:bg-[#1e2f4a] hover:text-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#415a77] px-5 py-2 text-xs font-bold text-[#f8fafc] hover:bg-[#52718e] disabled:opacity-50 shadow-md"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving...' : editingPost.id ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-[#c5d3e8] text-sm">
            <span className="material-symbols-outlined text-2xl animate-spin text-[#c5d3e8] mb-2 inline-block">progress_activity</span>
            <div>Loading CMS articles...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-[#c5d3e8] rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-8 shadow-xl">
            <BookOpen className="mx-auto h-8 w-8 text-[#415a77]/60 mb-3" />
            <h3 className="text-base font-bold text-[#f8fafc]">No Blog Posts Yet</h3>
            <p className="mt-1 text-xs text-[#c5d3e8]">Create your first technical article to share architecture insights.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#415a77] px-4 py-2 text-xs font-bold text-[#f8fafc] hover:bg-[#52718e]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Article</span>
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 sm:p-6 shadow-md transition-all hover:border-[#415a77]/60 text-[#f8fafc]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#415a77]/25 px-2 py-0.5 text-[11px] font-bold text-[#c5d3e8] border border-[#415a77]/40">
                      {post.category}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      post.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-[#c5d3e8] font-mono">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-[#c5d3e8] font-mono">
                      • {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#f8fafc] hover:text-[#c5d3e8] transition-colors">
                    <Link to={`/blogs/${post.slug || post.id}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-[#c5d3e8] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(post.tags || []).map((t) => (
                      <span key={t} className="rounded bg-[#152238] px-2 py-0.5 text-[10px] text-[#c5d3e8] border border-[#415a77]/30">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t border-[#415a77]/20 pt-3 sm:border-t-0 sm:pt-0">
                  <Link
                    to={`/blogs/${post.slug || post.id}`}
                    target="_blank"
                    className="flex items-center gap-1 rounded-lg border border-[#415a77]/30 bg-[#152238] px-3 py-1.5 text-xs font-semibold text-[#c5d3e8] hover:bg-[#1e2f4a] hover:text-[#f8fafc] transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[#c5d3e8]" />
                    <span>View</span>
                  </Link>

                  <button
                    onClick={() => setEditingPost(post)}
                    className="flex items-center gap-1 rounded-lg border border-[#415a77]/30 bg-[#152238] px-3 py-1.5 text-xs font-semibold text-[#c5d3e8] hover:bg-[#1e2f4a] hover:text-[#f8fafc] transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#c5d3e8]" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(post)}
                    className="rounded-lg border border-[#415a77]/30 bg-[#152238] px-3 py-1.5 text-xs font-semibold text-[#c5d3e8] hover:bg-[#1e2f4a] hover:text-[#f8fafc] transition-colors"
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDeletePost(post)}
                    className="rounded-lg border border-[#415a77]/30 bg-[#152238] p-2 text-[#c5d3e8] hover:border-rose-900/50 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
