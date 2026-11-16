import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { SEOHead } from '../components/common/SEOHead';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { getPostSource } from '../lib/blogLoader';
import { logger } from '../lib/logger';
import { errorMessage } from '../lib/utils';
import { ArrowLeft, Check, Copy, Download, Eye, FileCode2 } from 'lucide-react';
import { BlogEditorSkeleton } from '../components/skeleton';
import {
  BLOG_CATEGORIES,
  BlogPostError,
  parsePost,
  splitFrontmatter,
  toMdxSource,
} from '@blogs/src/lib/postSchema';
import { slugify } from '@blogs/src/utils/slugify';

type Category = (typeof BLOG_CATEGORIES)[number];

const today = () => new Date().toISOString().slice(0, 10);

/**
 * File-based blog editor. Posts live in `blogs/posts/<slug>.mdx` and are
 * compiled at build time, so the browser cannot save them. This page builds
 * and validates the `.mdx` file (same schema as the build) and hands it over
 * as a download or clipboard copy; committing the file publishes it on the
 * next deploy.
 */
export const BlogEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const isAdminPath = location.pathname.startsWith('/admin');
  const listPath = isAdminPath ? '/admin/blogs' : location.pathname.startsWith('/dashboard') ? '/dashboard/blogs' : '/blogs';

  const [loading, setLoading] = useState(Boolean(id));
  const [preview, setPreview] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Frontmatter fields this form does not edit (views, avatar, …) survive a round trip.
  const [extra, setExtra] = useState<Record<string, unknown>>({});
  const [title, setTitle] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>(BLOG_CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [date, setDate] = useState(today);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getPostSource(id)
      .then((source) => {
        if (cancelled) return;
        const split = source ? splitFrontmatter(source) : null;
        if (!split) {
          setLoadError(`No post file found at blogs/posts/${id}.mdx.`);
          return;
        }
        const {
          title: t, seoTitle: st, excerpt: ex, category: cat, tags: tg, coverImage: cover,
          date: d, featured: f, status: s, ...rest
        } = (split.data ?? {}) as Record<string, unknown>;
        setExtra(rest);
        setTitle(String(t ?? ''));
        setSeoTitle(String(st ?? ''));
        setExcerpt(String(ex ?? ''));
        setCategory((BLOG_CATEGORIES as readonly string[]).includes(String(cat)) ? (cat as Category) : BLOG_CATEGORIES[0]);
        setTags(Array.isArray(tg) ? tg.join(', ') : '');
        setCoverImage(String(cover ?? ''));
        setDate(d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? today()));
        setFeatured(f === true);
        setStatus(s === 'draft' ? 'draft' : 'published');
        setContent(split.body.trim());
      })
      .catch((err) => {
        logger.error('Failed to load article source:', err);
        if (!cancelled) setLoadError(errorMessage(err) || 'Could not load article.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const slug = id ?? (slugify(title) || 'untitled-post');
  const fileName = `${slug}.mdx`;

  const source = useMemo(
    () =>
      toMdxSource(
        {
          title: title.trim(),
          seoTitle: seoTitle.trim() || undefined,
          date,
          excerpt: excerpt.trim(),
          author: id ? undefined : user?.displayName || undefined,
          authorEmail: id ? undefined : user?.email || undefined,
          ...extra,
          category,
          tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          coverImage: coverImage.trim() || undefined,
          featured,
          status,
        },
        content
      ),
    [title, seoTitle, date, excerpt, extra, category, tags, coverImage, featured, status, content, id, user]
  );

  // Same validation the build runs, so an exported file is known to compile.
  const problems = useMemo(() => {
    try {
      parsePost(slug, source, fileName);
      return [];
    } catch (err) {
      return err instanceof BlogPostError ? err.problems : [errorMessage(err)];
    }
  }, [slug, source, fileName]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div className="min-h-screen ds-page-top bg-background text-foreground">
      <SEOHead
        title={id ? 'Edit Article' : 'New Article'}
        description="Draft CatalystLab engineering articles as MDX files with validated frontmatter."
        robots="noindex, nofollow"
      />

      <div className="ds-page-shell ds-section">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to={listPath} className="ds-btn ds-btn-ghost text-xs mb-3">
              <ArrowLeft className="size-3.5 shrink-0" />
              Back to articles
            </Link>
            <h1 className="framer-section-headline text-foreground">{id ? 'Edit article' : 'New post'}</h1>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">blogs/posts/{fileName} → /blogs/{slug}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPreview((v) => !v)} className="ds-btn ds-btn-secondary text-sm">
              <Eye className="size-4 shrink-0" />
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button type="button" onClick={copy} disabled={loading || !!loadError} className="ds-btn ds-btn-secondary text-sm disabled:opacity-50">
              {copied ? <Check className="size-4 shrink-0" /> : <Copy className="size-4 shrink-0" />}
              {copied ? 'Copied' : 'Copy MDX'}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={loading || !!loadError || problems.length > 0}
              className="ds-btn ds-btn-primary text-sm disabled:opacity-50"
            >
              <Download className="size-4 shrink-0" />
              Download .mdx
            </button>
          </div>
        </div>

        <div className="ds-card mb-4 flex gap-3 p-4 text-sm text-muted-foreground">
          <FileCode2 aria-hidden="true" className="size-5 shrink-0 text-foreground" />
          <p>
            Posts are files in the repository. Save the download as{' '}
            <code className="font-mono text-foreground">blogs/posts/{fileName}</code> and commit it; it goes live on the next
            deploy. Run <code className="font-mono text-foreground">npx tsx scripts/validate-mdx-posts.ts</code> to check it locally.
          </p>
        </div>

        {loadError && (
          <div role="alert" className="mb-4 rounded-xl border border-danger/20 bg-danger/10 p-3 font-mono text-sm text-danger">
            {loadError}
          </div>
        )}

        {!loading && problems.length > 0 && (
          <div role="status" className="mb-4 rounded-xl border border-warning/20 bg-warning/10 p-3 text-sm text-warning">
            <p className="mb-1 font-semibold">Fix before exporting:</p>
            <ul className="list-disc pl-5 font-mono text-xs">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <BlogEditorSkeleton />
        ) : preview ? (
          <article className="ds-card space-y-4 p-6">
            <p className="font-mono text-[11px] uppercase tracking-wider text-foreground">{category} · {status}</p>
            <h2 className="framer-section-headline text-foreground">{title || 'Untitled'}</h2>
            {excerpt && <p className="framer-body-text">{excerpt}</p>}
            <p className="font-mono text-[11px] text-muted-foreground">
              Markdown preview. Custom components such as &lt;Callout&gt; render on the published page only.
            </p>
            <MarkdownRenderer content={content} />
          </article>
        ) : (
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              aria-label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full border-none bg-transparent text-2xl sm:text-3xl font-semibold text-foreground rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
            <textarea
              aria-label="Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Excerpt for SEO and listing cards (50–160 characters)"
              rows={2}
              className="ds-input w-full p-3 text-sm h-auto"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                aria-label="SEO title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="SEO title (optional, max 60 characters)"
                className="ds-input text-sm"
              />
              <input
                type="text"
                aria-label="Cover image"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/blogs/assets/images/covers/<slug>.jpg"
                className="ds-input text-sm"
              />
              <select
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="ds-select text-sm"
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                aria-label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags, comma separated (max 10)"
                className="ds-input text-sm"
              />
              <input
                type="date"
                aria-label="Publish date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ds-input text-sm"
              />
              <div className="flex items-center gap-4">
                <select
                  aria-label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value === 'published' ? 'published' : 'draft')}
                  className="ds-select flex-1 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                  Featured
                </label>
              </div>
            </div>
            <textarea
              aria-label="Body"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post in Markdown or MDX…"
              className="ds-card h-96 w-full p-4 text-base font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-cream"
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default BlogEditorPage;
