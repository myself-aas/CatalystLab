import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { MDXContent } from 'mdx/types';
import { DEFAULT_BLOG_COVER, getPostBySlug, getPostMeta } from '@/lib/blogLoader';
import { mdxComponents } from '@blogs/src/components';
import { useAuth } from '../context/AuthContext';
import { PlateImage } from '../components/common/PlateImage';
import { 
  ArrowLeft, Bookmark, Clock, Share2, Check, Edit3, Eye
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { logger } from '../lib/logger';
import { motion } from 'motion/react';

const absoluteUrl = (url: string) => new URL(url, window.location.origin).toString();

export const BlogPostPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { user, isAdmin } = useAuth();
  // Metadata is in the build-time index, so the header renders immediately;
  // only the compiled body is fetched.
  const post = getPostMeta(slug);
  const [body, setBody] = useState<{ slug: string; Content: MDXContent } | null>(null);
  const [bodyFailed, setBodyFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBodyFailed(false);
    window.scrollTo(0, 0);
    getPostBySlug(slug)
      .then((loaded) => {
        if (!cancelled && loaded) setBody({ slug, Content: loaded.Content });
      })
      .catch((err) => {
        logger.error('Error loading blog post body:', err);
        if (!cancelled) setBodyFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const Content = body?.slug === slug ? body.Content : null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        {/* A missing slug must not stay indexable: without this the document
            keeps the shell head it arrived with (SEO audit 2026-10-23, issue 3). */}
        <SEOHead
          title="Article not found | CatalystLab"
          description="That article does not exist. Browse the engineering blog for published posts."
          canonicalPath="/blogs"
          robots="noindex, nofollow"
        />
        <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center">The article you are looking for does not exist.</p>
          <Link to="/blogs" className="px-6 py-3 bg-muted rounded-full text-sm font-medium hover:bg-muted/80 transition-colors">
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground font-sans pb-24">
      <SEOHead
        title={post.seoTitle}
        description={post.excerpt}
        canonicalPath={`/blogs/${post.slug}`}
        absoluteTitle
        ogType="article"
        ogImage={absoluteUrl(post.coverImage ?? DEFAULT_BLOG_COVER)}
        author={post.author}
        publishedTime={post.publishedAt}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: absoluteUrl(post.coverImage ?? DEFAULT_BLOG_COVER),
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
          articleSection: post.category,
          keywords: post.tags.join(', '),
          author: { '@type': 'Person', name: post.author },
          publisher: { '@type': 'Organization', name: 'CatalystLab' },
        }}
      />

      <div className="relative mx-auto min-h-screen w-full max-w-5xl bg-background">
        
        {/* Full Bleed Image Header */}
        <div className="relative h-[45vh] min-h-[300px] max-h-[560px] w-full">
          <PlateImage
            src={post.coverImage ?? DEFAULT_BLOG_COVER}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-ink-navy/90" />
          
          {/* Top Actions */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
            <Link to="/blogs" aria-label="Back to blog index" className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => setBookmarked(!bookmarked)}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
              className={`flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-colors ${bookmarked ? 'text-white' : 'text-white/80 hover:text-white'}`}
            >
              <Bookmark className="w-5 h-5" fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Floating White Card Overlap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ds-card relative z-20 -mt-16 mx-4 rounded-[32px] bg-card p-6 text-foreground shadow-2xl sm:mx-8 sm:p-8 lg:mx-auto lg:max-w-3xl"
        >
          <div className="inline-block px-3 py-1 rounded-full border border-border bg-muted text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
            {post.category || 'Article'}
          </div>
          
          <h1 className="text-2xl font-bold leading-tight mb-4 text-foreground">
            {post.title}
          </h1>
          
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {post.excerpt}
          </p>
          
          {/* Author Strip */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center font-bold overflow-hidden">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.author} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  post.author[0]
                )}
              </div>
              <span className="font-semibold text-sm text-foreground">{post.author}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions Bar */}
        <div className="px-6 py-6 flex items-center justify-between mt-4">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors px-4 py-2 rounded-full bg-muted border border-border"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share Article'}
          </button>
          
          {user && (isAdmin || user.email === post.authorEmail) && (
            <Link 
              to={`/blogs/edit/${post.slug}`}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors px-4 py-2 rounded-full bg-muted border border-border"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Link>
          )}
        </div>

        {/* Main Content */}
        <article className="mx-auto max-w-3xl px-6 pb-16 sm:px-8" aria-busy={!Content && !bodyFailed}>
          {Content ? (
            <Content components={mdxComponents} />
          ) : bodyFailed ? (
            <p className="text-sm text-muted-foreground">
              This article could not be loaded. Check your connection and reload the page.
            </p>
          ) : (
            <div className="space-y-3" aria-hidden="true">
              {['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-10/12', 'w-3/5'].map((width, idx) => (
                <div key={idx} className={`h-4 rounded bg-muted animate-pulse ${width}`} />
              ))}
            </div>
          )}
        </article>

      </div>
    </div>
  );
};

export default BlogPostPage;
