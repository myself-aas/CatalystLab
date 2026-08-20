import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPostBySlug, getBlogPosts } from '../lib/firebase';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Tag, 
  BookOpen, 
  Check, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  FileText,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { GlobalSearchModal } from '../components/common/GlobalSearchModal';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f8fafc] text-[#415a77]">
        <span className="material-symbols-outlined text-4xl animate-spin text-[#415a77] mb-3">progress_activity</span>
        <p className="text-sm font-semibold">Loading technical briefing...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-[#0b192c]">Article Not Found</h1>
        <p className="mt-2 text-sm text-[#415a77]">
          The engineering article you are looking for has been moved or does not exist.
        </p>
        <Link
          to="/blogs"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b192c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#152238]"
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
    <div className="min-h-screen bg-[#f8fafc] text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
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

      {/* Top Header & Breadcrumbs */}
      <div className="border-b border-[#e2e8f0] bg-white sticky top-16 z-20 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Developer Blog', href: '/blogs' },
              { label: post.title }
            ]}
          />
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-xs text-[#64748b] hover:text-[#0b192c]"
          >
            <Search className="h-3 w-3" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Article Stream (col-span-8) */}
          <main className="lg:col-span-8">
            <article className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-10 shadow-xs">
              
              {/* Meta & Category */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                  {post.category || 'Architecture'}
                </span>
                <span className="text-xs text-[#64748b] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime || '5 min read'}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight leading-tight mb-4">
                {post.title}
              </h1>

              {/* Author & Byline */}
              <div className="flex items-center justify-between border-y border-[#f1f5f9] py-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b192c] text-xs font-bold text-white shadow-xs">
                    {(post.authorName || 'C')[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0b192c]">
                      {post.authorName || 'CatalystLab Telemetry Team'}
                    </div>
                    <div className="text-[11px] text-[#64748b]">{publishedDate}</div>
                  </div>
                </div>

                {/* Share Link Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] transition-all"
                  title="Copy link to article"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied Link</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              {/* Excerpt Lead */}
              {post.excerpt && (
                <div className="mb-8 rounded-xl border-l-4 border-[#0b192c] bg-[#f8fafc] p-4 text-sm font-medium text-[#415a77] leading-relaxed">
                  {post.excerpt}
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-[#0b192c]">
                <MarkdownRenderer content={post.content} />
              </div>

              {/* Tags Footer */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 border-t border-[#f1f5f9] pt-6">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-[#415a77] mr-1">Tags:</span>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#f1f5f9] px-2.5 py-1 text-xs text-[#415a77]"
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
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Author Profile Box */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-[#415a77] mb-3">
                About the Author
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b192c] text-sm font-bold text-white shadow-xs">
                  {(post.authorName || 'C')[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0b192c]">
                    {post.authorName || 'CatalystLab Telemetry Team'}
                  </div>
                  <div className="text-xs text-[#64748b]">
                    Web Infrastructure & AI Systems
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#64748b] leading-relaxed">
                Specialized in distributed performance telemetry, edge latency benchmarking, and zero-trust web architectures.
              </p>
            </div>

            {/* Related Articles Box */}
            {relatedPosts.length > 0 && (
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0b192c]">
                  Related Stories
                </div>
                <div className="divide-y divide-[#f1f5f9] space-y-3 pt-1">
                  {relatedPosts.map((r) => (
                    <div key={r.id} className="pt-3 first:pt-0">
                      <Link
                        to={`/blog/${r.slug || r.id}`}
                        className="group block space-y-1"
                      >
                        <h4 className="text-xs font-bold text-[#0b192c] group-hover:text-sky-700 transition-colors line-clamp-2">
                          {r.title}
                        </h4>
                        <div className="text-[11px] text-[#64748b] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{r.readTime || '5 min read'}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Developer Documentation Callout */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0b192c]">
                Technical Reference
              </div>
              <p className="text-xs text-[#64748b]">
                Explore our full technical documentation, cURL snippets, and telemetry metric definitions.
              </p>
              <Link
                to="/docs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b192c] hover:text-sky-700 transition-colors"
              >
                <span>Open Documentation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </aside>

        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
};
export default BlogPostPage;
