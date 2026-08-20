import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../types';
import { getUserBlogPosts, saveBlogPost, deleteBlogPost } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import MDEditor from '@uiw/react-md-editor';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2,
  ExternalLink,
  Send,
  X
} from 'lucide-react';

const CATEGORIES = [
  'General',
  'Technology',
  'Tutorials',
  'Case Studies',
  'Insights',
  'News'
];

export const UserBlogManagementView: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

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
      console.error("Failed to fetch user blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingPost({
      title: '',
      excerpt: '',
      content: '',
      category: CATEGORIES[0],
      tags: [],
      status: 'draft',
      authorName: user?.displayName || 'User',
      authorEmail: user?.email || '',
      authorAvatar: user?.photoURL || ''
    });
    setTagInput('');
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !editingPost) return;
    const currentTags = editingPost.tags || [];
    if (!currentTags.includes(tagInput.trim())) {
      setEditingPost({
        ...editingPost,
        tags: [...currentTags, tagInput.trim()]
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      tags: (editingPost.tags || []).filter(t => t !== tag)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title || !editingPost?.content) {
      alert("Title and content are required.");
      return;
    }

    setSaving(true);
    try {
      await saveBlogPost(editingPost);
      await fetchPosts();
      setEditingPost(null);
      showNotification(editingPost.id ? 'Blog post updated successfully' : 'Blog post published successfully');
    } catch (err) {
      console.error("Failed to save post:", err);
      alert("Failed to save post.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`)) return;
    try {
      if (post.id) {
        await deleteBlogPost(post.id);
        await fetchPosts();
        showNotification('Post deleted successfully');
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post.");
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await saveBlogPost({ ...post, status: newStatus });
      await fetchPosts();
      showNotification(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0b192c]">My Articles</h2>
          <p className="text-sm text-[#415a77]">Manage your published articles and drafts.</p>
        </div>
        
        {!editingPost && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-[#415a77] px-4 py-2 text-sm font-bold text-white hover:bg-[#33475e] transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Create Article</span>
          </button>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-sm animate-fade-in flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {notification}
        </div>
      )}

      {/* Editor Modal / View */}
      {editingPost && (
        <div className="rounded-2xl border border-[#415a77]/30 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6 border-b border-[#e2e8f0] pb-4">
            <h3 className="text-lg font-bold text-[#0b192c]">
              {editingPost.id ? 'Edit Article' : 'Compose New Article'}
            </h3>
            <button
              onClick={() => setEditingPost(null)}
              className="rounded-full p-1.5 text-[#415a77] hover:bg-[#f1f5f9] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column - Meta */}
              <div className="md:col-span-1 space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#415a77] uppercase tracking-wide">
                    Article Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    placeholder="e.g. My Awesome Guide"
                    className="w-full rounded-xl border border-[#415a77]/30 bg-[#f8fafc] px-4 py-2.5 text-sm text-[#0b192c] placeholder:text-[#415a77]/40 focus:border-[#0b192c] focus:outline-none focus:ring-1 focus:ring-[#0b192c]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#415a77] uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    value={editingPost.category || CATEGORIES[0]}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full rounded-xl border border-[#415a77]/30 bg-[#f8fafc] px-4 py-2.5 text-sm text-[#0b192c] focus:border-[#0b192c] focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#415a77] uppercase tracking-wide">
                    Short Excerpt
                  </label>
                  <textarea
                    rows={3}
                    value={editingPost.excerpt || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    placeholder="Brief summary of the article..."
                    className="w-full rounded-xl border border-[#415a77]/30 bg-[#f8fafc] px-4 py-2.5 text-sm text-[#0b192c] placeholder:text-[#415a77]/40 focus:border-[#0b192c] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#415a77] uppercase tracking-wide">
                    Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {(editingPost.tags || []).map(tag => (
                      <span key={tag} className="flex items-center gap-1 rounded-md bg-[#415a77]/10 px-2 py-1 text-[11px] font-bold text-[#415a77]">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag..."
                      className="w-full rounded-lg border border-[#415a77]/30 bg-[#f8fafc] px-3 py-1.5 text-xs text-[#0b192c] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="rounded-lg bg-[#415a77] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#33475e]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#415a77] uppercase tracking-wide">
                    Publish Status
                  </label>
                  <select
                    value={editingPost.status || 'draft'}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as 'published' | 'draft' })}
                    className="w-full rounded-xl border border-[#415a77]/30 bg-[#f8fafc] px-4 py-2.5 text-sm text-[#0b192c] focus:border-[#0b192c] focus:outline-none"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                  </select>
                </div>
              </div>

              {/* Right Column - Editor */}
              <div className="md:col-span-2 flex flex-col h-full" data-color-mode="light">
                <label className="mb-1.5 block text-xs font-bold text-[#415a77] uppercase tracking-wide">
                  Article Content (Markdown)
                </label>
                <div className="flex-1 rounded-xl overflow-hidden border border-[#415a77]/30">
                  <MDEditor
                    value={editingPost.content || ''}
                    onChange={(val) => setEditingPost({ ...editingPost, content: val || '' })}
                    preview="live"
                    hideToolbar={false}
                    height={500}
                    textareaProps={{
                      placeholder: 'Start writing your article using Markdown...',
                    }}
                    className="w-full h-full border-none"
                  />
                </div>
                <p className="mt-2 text-[10px] text-[#415a77]">
                  * Image uploads are disabled. Use the Image tool in the toolbar to insert a public image URL (e.g. `![alt text](https://example.com/image.jpg)`).
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="rounded-xl border border-[#415a77]/30 px-5 py-2.5 text-sm font-bold text-[#415a77] hover:bg-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#415a77] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#33475e] shadow-md disabled:opacity-50 transition-all"
              >
                <Send className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Article'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      {!editingPost && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-[#415a77] text-sm">
              <span className="material-symbols-outlined text-2xl animate-spin text-[#415a77] mb-2 inline-block">progress_activity</span>
              <div>Loading your articles...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-[#415a77] rounded-3xl border border-[#415a77]/30 bg-white p-8 shadow-sm">
              <BookOpen className="mx-auto h-8 w-8 text-[#415a77]/40 mb-3" />
              <h3 className="text-base font-bold text-[#0b192c]">No Articles Yet</h3>
              <p className="mt-1 text-xs text-[#415a77]">Create your first article and share your knowledge.</p>
              <button
                onClick={handleOpenCreate}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#33475e] shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Write an Article</span>
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-[#415a77]/30 bg-white p-5 shadow-sm transition-all hover:border-[#415a77]/60 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-bold text-[#415a77] border border-[#e2e8f0]">
                        {post.category}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-[#415a77] font-mono">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0b192c]">
                      <Link to={`/blogs/${post.slug || post.id}`} className="hover:text-[#415a77] transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-[#415a77] line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(post.tags || []).map((t) => (
                        <span key={t} className="rounded bg-[#f8fafc] px-2 py-0.5 text-[10px] text-[#415a77] border border-[#e2e8f0]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 border-t border-[#e2e8f0] pt-3 sm:border-t-0 sm:pt-0">
                    <Link
                      to={`/blogs/${post.slug || post.id}`}
                      target="_blank"
                      className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-bold text-[#415a77] hover:bg-[#f8fafc] hover:border-[#415a77]/30 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => setEditingPost(post)}
                      className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-bold text-[#415a77] hover:bg-[#f8fafc] hover:border-[#415a77]/30 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(post)}
                      className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-bold text-[#415a77] hover:bg-[#f8fafc] hover:border-[#415a77]/30 transition-colors"
                    >
                      {post.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post)}
                      className="rounded-lg border border-[#e2e8f0] bg-white p-1.5 text-[#415a77] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
