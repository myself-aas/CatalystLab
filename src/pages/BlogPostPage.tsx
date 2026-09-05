import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPostBySlug, getBlogPosts } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { ScanRevealFigure } from '../components/media/ScanRevealFigure';
import { PexelsImage } from '../components/media/PexelsImage';
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
import { logger } from '../lib/logger';
import { BlogPostSkeleton } from '../components/skeleton';

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
 logger.error("Error loading blog post:", err);
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
 return <BlogPostSkeleton />;
 }

 if (!post) {
 return (
 <div className="ds-page-shell">
 <h1 className="text-xl font-bold font-sans">Article Not Found</h1>
 <p className="mt-2 text-xs text-muted-foreground font-sans">
 The engineering article you are looking for has been moved or does not exist.
 </p>
 <Link
 to="/blogs"
 className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all"
 >
 <ArrowLeft className="h-3.5 w-3.5"/>
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
 <div className="min-h-screen ds-page-top bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
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
 <div className="ds-page-shell py-8">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* Main Article Stream (col-span-8) */}
 <main className="lg:col-span-8">
 <article className="ds-card p-5 sm:p-8">
 
 {/* Meta & Category */}
 <div className="flex flex-wrap items-center gap-2 mb-3">
 <span className="rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
 {post.category || 'Architecture'}
 </span>
 <span className="text-xs text-muted-foreground flex items-center gap-1">
 <Clock className="h-3 w-3 text-muted-foreground"/>
 <span>{getArticleReadingTime(post)}</span>
 </span>
 </div>

 {/* Title */}
 <h1 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight mb-5 font-sans">
 {post.title}
 </h1>

 {/* Hero / Cover Image Banner with ScanReveal & Catalyst Treatment */}
 <div className="mb-6">
 <ScanRevealFigure
 src={getBlogCoverImage(post)}
 alt={post.title}
 caption={`Figure 1.0 • Technical architecture briefing for ${post.title}`}
 className="rounded-xl overflow-hidden shadow-sm border border-border"
 />
 </div>

 {/* Author & Byline */}
 <div className="flex items-center justify-between border-y border-border py-3 mb-6">
 <div className="flex items-center gap-2.5">
 {post.authorAvatar ? (
 <div className="h-9 w-9 rounded-full overflow-hidden border border-border flex-shrink-0">
 <PexelsImage
 src={post.authorAvatar}
 alt={post.authorName || 'Author'}
 className="h-full w-full object-cover"
 />
 </div>
 ) : (
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-xs border border-border">
 {(post.authorName || 'C')[0]}
 </div>
 )}
 <div>
 <div className="text-xs font-bold text-foreground font-sans">
 {post.authorName || 'CatalystLab Telemetry Team'}
 </div>
 <div className="text-[10px] text-muted-foreground">{publishedDate}</div>
 </div>
 </div>

 {/* Actions: Edit (if permitted) & Share */}
 <div className="flex items-center gap-2">
 {user && (isAdmin || user.email === post.authorEmail) && (
 <Link
 to={`/blogs/edit/${post.id || post.slug}`}
 className="ds-card flex items-center gap-1 text-xs font-bold ds-card-interactive p-4"
 title="Edit this article in dedicated studio"
 >
 <Edit3 className="h-3 w-3"/>
 <span>Edit</span>
 </Link>
 )}

 {/* Share Link Button */}
 <button
 onClick={handleShare}
 className="ds-card flex items-center gap-1 text-xs font-bold ds-card-interactive p-4"
 title="Copy link to article"
 >
 {copied ? (
 <>
 <Check className="h-3 w-3 text-emerald-600"/>
 <span className="text-emerald-600">Copied</span>
 </>
 ) : (
 <>
 <Share2 className="h-3 w-3"/>
 <span>Share</span>
 </>
 )}
 </button>
 </div>
 </div>

 {/* Excerpt Lead */}
 {post.excerpt && (
 <div className="mb-6 rounded-xl border-l-2 border-border bg-muted p-3.5 text-xs text-muted-foreground leading-relaxed font-sans">
 {post.excerpt}
 </div>
 )}

 {/* Markdown Content */}
 <div className="text-xs sm:text-sm leading-relaxed text-foreground font-sans space-y-4">
 <MarkdownRenderer content={post.content} />
 </div>

 {/* Tags Footer */}
 {post.tags && post.tags.length > 0 && (
 <div className="mt-8 border-t border-border pt-4">
 <div className="flex flex-wrap items-center gap-1.5">
 <span className="text-xs font-bold text-muted-foreground mr-1">Tags:</span>
 {post.tags.map((tag) => (
 <span
 key={tag}
 className="rounded bg-muted border border-border py-0.5 text-[10px] text-foreground font-mono"
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
 <div className="ds-card p-5 space-y-2.5">
 <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
 About the Author
 </div>
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-xs border border-border">
 {(post.authorName || 'C')[0]}
 </div>
 <div>
 <div className="text-xs font-bold text-foreground font-sans">
 {post.authorName || 'CatalystLab Telemetry Team'}
 </div>
 <div className="text-[10px] text-muted-foreground">
 Web Infrastructure &amp; AI Systems
 </div>
 </div>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed font-sans">
 Specialized in distributed performance telemetry, edge latency benchmarking, and zero-trust web architectures.
 </p>
 </div>

 {/* Related Articles Box */}
 {relatedPosts.length > 0 && (
 <div className="ds-card p-5 space-y-3">
 <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
 Related Stories
 </div>
 <div className="divide-y divide-border space-y-2.5 pt-1">
 {relatedPosts.map((r) => (
 <div key={r.id} className="pt-2.5 first:pt-0">
 <Link
 to={`/blog/${r.slug || r.id}`}
 className="group block space-y-1"
 >
 <h4 className="text-xs font-bold text-foreground group-hover:text-amber-700 transition-colors line-clamp-2 font-sans">
 {r.title}
 </h4>
 <div className="text-[10px] text-muted-foreground flex items-center gap-1">
 <Clock className="h-2.5 w-2.5 text-muted-foreground"/>
 <span>{getArticleReadingTime(r)}</span>
 </div>
 </Link>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Developer Documentation Callout */}
 <div className="ds-card p-5 space-y-2.5">
 <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
 Technical Reference
 </div>
 <p className="text-xs text-muted-foreground font-sans">
 Explore our full technical documentation, cURL snippets, and telemetry metric definitions.
 </p>
 <Link
 to="/docs"
 className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline transition-colors px-4 py-2"
 >
 <span>Open Documentation</span>
 <ArrowRight className="h-3 w-3"/>
 </Link>
 </div>

 </aside>

 </div>
 </div>
 </div>
 );
};

export default BlogPostPage;
