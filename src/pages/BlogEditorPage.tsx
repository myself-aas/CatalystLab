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
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-20 text-foreground">
 <SEOHead
 title={id ? 'Edit Article' : 'New Article'}
 description="Draft and publish CatalystLab engineering articles with SEO metadata, excerpts, and telemetry research notes."
 />

 <div className="ds-page-shell">
 <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
 <div>
 <Link
 to={listPath}
 className="ds-btn ds-btn-ghost text-xs mb-3"
 >
 <ArrowLeft className="size-3.5 shrink-0"/>
 Back to articles
 </Link>
 <h1 className="framer-section-headline text-foreground">
 {id ? 'Edit article' : 'New post'}
 </h1>
 <p className="mt-1 font-mono text-[11px] text-muted-foreground">/{slugPreview}</p>
 </div>
 <div className="flex flex-wrap gap-2">
 <button
 type="button"
 onClick={() => setPreview((v) => !v)}
 className="ds-btn ds-btn-secondary text-sm"
 >
 <Eye className="size-4 shrink-0"/>
 {preview ? 'Edit' : 'Preview'}
 </button>
 <button
 type="button"
 disabled={saving}
 onClick={() => handleSave('draft')}
 className="ds-btn ds-btn-secondary text-sm"
 >
 {saving ? <RotateCw className="size-4 animate-spin shrink-0"/> : <Save className="size-4 shrink-0"/>}
 Save draft
 </button>
 <button
 type="button"
 disabled={saving}
 onClick={() => handleSave('published')}
 className="ds-btn ds-btn-primary text-sm disabled:opacity-50"
 >
 Publish
 </button>
 </div>
 </div>

 {error && (
 <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300 font-mono">
 {error}
 </div>
 )}

 {loading ? (
 <BlogEditorSkeleton />
 ) : preview ? (
 <article className="ds-card space-y-4 p-6">
 <p className="font-mono text-[11px] uppercase tracking-wider text-[#0066FF]">{category} · {status}</p>
 <h2 className="framer-section-headline text-foreground">{title || 'Untitled'}</h2>
 {excerpt && <p className="framer-body-text">{excerpt}</p>}
 <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{content}</pre>
 </article>
 ) : (
 <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(status); }}>
 <input
 type="text"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="Post title"
 className="w-full border-none bg-transparent text-2xl sm:text-3xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
 />
 <textarea
 value={excerpt}
 onChange={(e) => setExcerpt(e.target.value)}
 placeholder="Excerpt for SEO and listing cards"
 rows={2}
 className="ds-input w-full p-3 text-sm h-auto"
 />
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value)}
 className="ds-select text-sm"
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
 className="ds-input text-sm"
 />
 </div>
 <textarea
 value={content}
 onChange={(e) => setContent(e.target.value)}
 placeholder="Write your post in markdown…"
 className="ds-card h-96 w-full p-4 text-base font-mono focus:outline-none focus:border-[#0066FF]"
 />
 </form>
 )}
 </div>
 </div>
 );
};

export default BlogEditorPage;
