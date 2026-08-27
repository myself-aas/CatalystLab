import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPostBySlug, getBlogPosts } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { ScanRevealFigure } from '../components/media/ScanRevealFigure';
import { getBlogCoverImage } from '../utils/blogImageMap';
import { getArticleReadingTime } from '../utils/readingTime';
import { 
  Clock, 
  ArrowLeft, 
  Share2, 
  Check, 
  ArrowRight,
  Edit3
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getBlogPostBySlug(slug);
        setPost(data);

        // Fetch related posts
        const allPosts = await getBlogPosts();
        const related = allPosts
          .filter((p) => p.id !== data?.id && p.status !== 'archived')
          .slice(0, 3);
        setRelatedPosts(related);
      } catch (err) {
        console.error("Error loading blog post:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white text-slate-600 font-mono">
        <span className="material-symbols-outlined text-3xl animate-spin text-slate-900 mb-2">progress_activity</span>
        <p className="text-xs font-bold">Loading technical briefing...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center font-mono text-black">
        <h1 className="text-xl font-bold font-sans">Article Not Found</h1>
        <p className="mt-2 text-xs text-slate-600 font-sans">
          The engineering article you are looking for has been moved or does not exist.
        </p>
        <Link
          to="/blogs"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-white transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Articles</span>
        </Link>
      </div>
    );
  }

  const publishedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'Recently Published';

  return (
    <div className="min-h-screen bg-white text-black font-mono selection:bg-slate-900 selection:text-white">
      <SEOHead
        title={post.title}
        description={post.excerpt || `Read ${post.title} on CatalystLab Developer Blog.`}
        keywords={['CatalystLab', post.category || 'Engineering', ...(post.tags || [])]}
        canonicalUrl={`https://www.catalystlab.tech/blog/${post.slug || post.id}`}
        ogType="article"
        author={post.authorName || 'CatalystLab Telemetry Team'}
        publishedTime={post.createdAt ? new Date(post.createdAt).toISOString() : undefined}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          author: {
            '@type': 'Person',
            name: post.authorName || 'CatalystLab Telemetry Team'
          },
          datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.catalystlab.tech/blog/${post.slug || post.id}`
          }
        }}
      />

      {/* Main Split Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Article Stream (col-span-8) */}
          <main className="lg:col-span-8">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
              
              {/* Meta & Category */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-900">
                  {post.category || 'Architecture'}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-600" />
                  <span>{getArticleReadingTime(post)}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl font-extrabold text-black tracking-tight leading-tight mb-5 font-sans">
                {post.title}
              </h1>

              {/* Hero / Cover Image Banner with ScanReveal & Catalyst Treatment */}
              <div className="mb-6">
                <ScanRevealFigure
                  src={getBlogCoverImage(post)}
                  alt={post.title}
                  caption={`Figure 1.0 • Technical architecture briefing for ${post.title}`}
                  className="rounded-xl overflow-hidden shadow-sm border border-slate-200"
                />
              </div>

              {/* Author & Byline */}
              <div className="flex items-center justify-between border-y border-slate-200 py-3 mb-6">
                <div className="flex items-center gap-2.5">
                  {post.authorAvatar ? (
                    <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
                      <PexelsImage
                        src={post.authorAvatar}
                        alt={post.authorName || 'Author'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-xs border border-slate-700">
                      {(post.authorName || 'C')[0]}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-black font-sans">
                      {post.authorName || 'CatalystLab Telemetry Team'}
                    </div>
                    <div className="text-[10px] text-slate-600">{publishedDate}</div>
                  </div>
                </div>

                {/* Actions: Edit (if permitted) & Share */}
                <div className="flex items-center gap-2">
                  {user && (isAdmin || user.email === post.authorEmail) && (
                    <Link
                      to={`/blogs/edit/${post.id || post.slug}`}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all"
                      title="Edit this article in dedicated studio"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </Link>
                  )}

                  {/* Share Link Button */}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-black hover:bg-slate-100 transition-all cursor-pointer"
                    title="Copy link to article"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3 w-3" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Excerpt Lead */}
              {post.excerpt && (
                <div className="mb-6 rounded-xl border-l-2 border-slate-900 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed font-sans">
                  {post.excerpt}
                </div>
              )}

              {/* Markdown Content */}
              <div className="text-xs sm:text-sm leading-relaxed text-black font-sans space-y-4">
                <MarkdownRenderer content={post.content} />
              </div>

              {/* Tags Footer */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 border-t border-slate-200 pt-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-600 mr-1">Tags:</span>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-900 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </main>

          {/* Dedicated Google Developers Sidebar (col-span-4) */}
          <aside className="lg:col-span-4 space-y-5">
            
            {/* Author Profile Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                About the Author
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-xs border border-slate-700">
                  {(post.authorName || 'C')[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-black font-sans">
                    {post.authorName || 'CatalystLab Telemetry Team'}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Web Infrastructure &amp; AI Systems
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Specialized in distributed performance telemetry, edge latency benchmarking, and zero-trust web architectures.
              </p>
            </div>

            {/* Related Articles Box */}
            {relatedPosts.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Related Stories
                </div>
                <div className="divide-y divide-slate-200 space-y-2.5 pt-1">
                  {relatedPosts.map((r) => (
                    <div key={r.id} className="pt-2.5 first:pt-0">
                      <Link
                        to={`/blog/${r.slug || r.id}`}
                        className="group block space-y-1"
                      >
                        <h4 className="text-xs font-bold text-black group-hover:text-amber-700 transition-colors line-clamp-2 font-sans">
                          {r.title}
                        </h4>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 text-slate-600" />
                          <span>{getArticleReadingTime(r)}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Developer Documentation Callout */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Technical Reference
              </div>
              <p className="text-xs text-slate-600 font-sans">
                Explore our full technical documentation, cURL snippets, and telemetry metric definitions.
              </p>
              <Link
                to="/docs"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline transition-colors"
              >
                <span>Open Documentation</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
