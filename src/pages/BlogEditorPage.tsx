import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { SEOHead } from '../components/common/SEOHead';
import { useAuth } from '../context/AuthContext';
import { getBlogPostById, saveBlogPost } from '../lib/firebase';
import { logger } from '../lib/logger';
import { errorMessage } from '../lib/utils';
import { ArrowLeft, Eye, RotateCw, Save } from 'lucide-react';
import { BlogEditorSkeleton } from '../components/skeleton';

const CATEGORIES = [
  'Engineering',
  'AI & LLMO',
  'Edge Latency',
  'SecOps & Compliance',
  'DOM & Performance',
  'Web Architecture',
  'Sustainability & Green Web',
  'Release Notes',
];

export const BlogEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminPath = location.pathname.startsWith('/admin');
  const listPath = isAdminPath ? '/admin/blogs' : '/dashboard/blogs';

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getBlogPostById(id)
      .then((post) => {
        if (!post || cancelled) return;
        setPostId(post.id);
        setTitle(post.title || '');
        setExcerpt(post.excerpt || '');
        setContent(post.content || '');
        setCategory(post.category || 'Engineering');
        setTags((post.tags || []).join(', '));
        setStatus(post.status === 'published' ? 'published' : 'draft');
      })
      .catch((err) => {
        logger.error('Failed to load article:', err);
        setError(errorMessage(err) || 'Could not load article.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const slugPreview = useMemo(
    () =>
      (title || 'untitled-post')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80),
    [title]
  );

  const handleSave = async (nextStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const savedId = await saveBlogPost({
        id: postId,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        category,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 10),
        status: nextStatus,
        authorName: user?.displayName || 'CatalystLab Author',
        authorEmail: user?.email || 'admin@catalystlab.io',
      });
      setPostId(savedId);
      setStatus(nextStatus);
      navigate(listPath);
    } catch (err: unknown) {
      logger.error('Failed to save article:', err);
      setError(errorMessage(err) || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-20 text-[#EDEDEF]">
      <SEOHead
        title={id ? 'Edit Article' : 'New Article'}
        description="Draft and publish CatalystLab engineering articles with SEO metadata, excerpts, and telemetry research notes."
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to={listPath}
              className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs text-[#8A8F98] hover:text-[#EDEDEF]"
            >
              <ArrowLeft className="size-3.5" />
              Back to articles
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {id ? 'Edit article' : 'New post'}
            </h1>
            <p className="mt-1 font-mono text-[11px] text-[#8A8F98]">/{slugPreview}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2 text-sm text-[#8A8F98] hover:text-[#EDEDEF]"
            >
              <Eye className="size-4" />
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2 text-sm text-[#EDEDEF] disabled:opacity-50"
            >
              {saving ? <RotateCw className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white shadow-linear-cta hover:bg-[#6872D9] disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <BlogEditorSkeleton />
        ) : preview ? (
          <article className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-6">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#6872D9]">{category} · {status}</p>
            <h2 className="text-3xl font-semibold">{title || 'Untitled'}</h2>
            {excerpt && <p className="text-[#8A8F98]">{excerpt}</p>}
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#EDEDEF]">{content}</pre>
          </article>
        ) : (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(status); }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full border-none bg-transparent text-3xl font-semibold text-[#EDEDEF] outline-none placeholder:text-[#8A8F98]"
            />
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Excerpt for SEO and listing cards"
              rows={2}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] p-3 text-sm text-[#EDEDEF] outline-none placeholder:text-[#8A8F98]"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-[#EDEDEF]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags, comma separated"
                className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-[#EDEDEF] outline-none placeholder:text-[#8A8F98]"
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post in markdown…"
              className="h-96 w-full resize-y rounded-xl border border-white/[0.06] bg-white/[0.04] p-4 text-base leading-relaxed text-[#EDEDEF] outline-none placeholder:text-[#8A8F98]"
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default BlogEditorPage;
