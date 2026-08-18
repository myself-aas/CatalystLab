import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPostBySlug, getBlogPosts } from '../lib/firebase';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  BookOpen, 
  Tag, 
  User as UserIcon,
  ExternalLink
} from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const found = await getBlogPostBySlug(slug);
        setPost(found);

        // Fetch related
        const all = await getBlogPosts();
        setRelatedPosts(all.filter((p) => (p.slug !== slug && p.id !== slug)).slice(0, 2));
      } catch (err) {
        console.error("Error loading blog post:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-[#f8fafc] py-24 text-center text-[#415a77]">
        <span className="material-symbols-outlined text-3xl animate-spin text-[#415a77] mb-3 inline-block">progress_activity</span>
        <div className="text-sm font-semibold">Loading technical article...</div>
=======
      <div className="min-h-screen bg-slate-950 py-24 text-center text-slate-500">
        <div className="animate-spin inline-block mb-3 text-2xl">⏳</div>
        <div className="text-sm">Loading technical article...</div>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
      </div>
    );
  }

  if (!post) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-[#f8fafc] py-24 px-4 text-center text-[#0b192c]">
        <BookOpen className="mx-auto h-12 w-12 text-[#415a77] mb-4" />
        <h1 className="text-2xl font-bold text-[#0b192c]">Article Not Found</h1>
        <p className="mt-2 text-sm text-[#415a77]">The requested article could not be located or was removed.</p>
        <Link
          to="/blogs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#52718e] shadow-md"
=======
      <div className="min-h-screen bg-slate-950 py-24 px-4 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold text-white">Article Not Found</h1>
        <p className="mt-2 text-sm text-slate-400">The requested article could not be located or was removed.</p>
        <Link
          to="/blogs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Articles</span>
        </Link>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c]">
      {/* Dynamic TechArticle JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "TechArticle",
                "@id": `https://www.catalystlab.tech/blogs/${post.slug || post.id}#article`,
                "isPartOf": {
                  "@type": "WebSite",
                  "@id": "https://www.catalystlab.tech/#website",
                  "name": "CatalystLab",
                  "url": "https://www.catalystlab.tech/"
                },
                "headline": post.title,
                "description": post.excerpt || post.title,
                "inLanguage": "en-US",
                "mainEntityOfPage": `https://www.catalystlab.tech/blogs/${post.slug || post.id}`,
                "datePublished": new Date(post.createdAt).toISOString(),
                "dateModified": new Date(post.updatedAt || post.createdAt).toISOString(),
                "author": {
                  "@type": "Person",
                  "name": post.authorName,
                  "email": post.authorEmail
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "CatalystLab Inc.",
                  "url": "https://www.catalystlab.tech/"
                },
                "articleSection": post.category,
                "keywords": (post.tags || []).join(', ')
              },
              {
                "@type": "BreadcrumbList",
                "@id": `https://www.catalystlab.tech/blogs/${post.slug || post.id}#breadcrumbs`,
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://www.catalystlab.tech/"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Architecture Insights",
                    "item": "https://www.catalystlab.tech/blogs"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": post.title,
                    "item": `https://www.catalystlab.tech/blogs/${post.slug || post.id}`
                  }
                ]
              }
            ]
          })
        }}
      />
      
      {/* Top Breadcrumb Header */}
      <div className="border-b border-[#ebe9e6] bg-[#f4f6fa] py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#415a77] hover:text-[#0b192c] transition-colors"
=======
    <div className="min-h-screen bg-slate-950 pb-24">
      
      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-800 bg-slate-900/40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Insights</span>
          </Link>

          <button
            onClick={handleShare}
<<<<<<< HEAD
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#415a77]/30 bg-[#0b192c] px-3.5 py-1.5 text-xs font-bold text-[#f8fafc] hover:bg-[#152238] transition-colors shadow-sm"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-[#c5d3e8]" />}
            <span>{copied ? 'Link Copied' : 'Share Article'}</span>
=======
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-cyan-400" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Article Container in a clean, elevated dark card */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <article className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-12 shadow-2xl text-[#f8fafc]">
          
          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#c5d3e8] mb-4">
            <span className="rounded-md bg-[#415a77]/30 px-2.5 py-0.5 font-bold font-sans text-[#c5d3e8] border border-[#415a77]/50">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-[#c5d3e8]" />
              <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#c5d3e8]" />
              <span>{post.readTime}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#f8fafc] leading-tight">
            {post.title}
          </h1>

          {/* Excerpt Lead */}
          {post.excerpt && (
            <p className="mt-5 text-base sm:text-lg text-[#ebe9e6] font-medium leading-relaxed border-l-4 border-[#415a77] pl-4 py-2 bg-[#152238] rounded-r-xl">
              {post.excerpt}
            </p>
          )}

          {/* Author Card */}
          <div className="mt-8 flex items-center gap-3 border-y border-[#415a77]/30 py-4">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="h-10 w-10 rounded-full object-cover border border-[#415a77]/50"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#152238] text-[#c5d3e8] font-bold text-sm border border-[#415a77]/40">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-[#f8fafc]">{post.authorName}</div>
              <div className="text-xs text-[#c5d3e8] font-mono">{post.authorEmail}</div>
            </div>
          </div>

          {/* Article Body */}
          <div className="mt-10 text-[#ebe9e6]">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Tags */}
          <div className="mt-12 border-t border-[#415a77]/30 pt-6">
            <div className="text-xs font-semibold text-[#c5d3e8] uppercase tracking-wider mb-2">
              Keywords & Topics
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(post.tags || []).map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-[#152238] px-3 py-1 text-xs font-mono text-[#c5d3e8] border border-[#415a77]/30"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 border-t border-[#415a77]/30 pt-10">
              <h3 className="text-lg font-bold text-[#f8fafc] mb-4">Further Investigations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.id || rel.slug}
                    to={`/blogs/${rel.slug || rel.id}`}
                    className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4 hover:border-[#c5d3e8] hover:bg-[#1e2f4a] transition-all"
                  >
                    <div className="text-[10px] font-bold text-[#c5d3e8] uppercase font-mono mb-1">
                      {rel.category}
                    </div>
                    <h4 className="text-sm font-bold text-[#f8fafc] hover:underline line-clamp-2">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </article>
      </div>
=======
      {/* Article Container */}
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 mb-4">
          <span className="rounded-md bg-cyan-500/10 px-2.5 py-0.5 font-bold font-sans text-cyan-400 border border-cyan-500/20">
            {post.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.readTime}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          {post.title}
        </h1>

        {/* Excerpt Lead */}
        {post.excerpt && (
          <p className="mt-5 text-base sm:text-lg text-slate-300 font-medium leading-relaxed border-l-2 border-cyan-500 pl-4 py-1 bg-slate-900/30 rounded-r-xl">
            {post.excerpt}
          </p>
        )}

        {/* Author Card */}
        <div className="mt-8 flex items-center gap-3 border-y border-slate-800 py-4">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="h-10 w-10 rounded-full object-cover border border-slate-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-sm border border-cyan-500/20">
              <UserIcon className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="text-sm font-bold text-white">{post.authorName}</div>
            <div className="text-xs text-slate-400 font-mono">{post.authorEmail}</div>
          </div>
        </div>

        {/* Article Body */}
        <div className="mt-10">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Tags */}
        <div className="mt-12 border-t border-slate-800 pt-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Keywords & Topics
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(post.tags || []).map((t) => (
              <span
                key={t}
                className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-mono text-cyan-300 border border-slate-800"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 border-t border-slate-800 pt-10">
            <h3 className="text-lg font-bold text-white mb-4">Further Investigations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id || rel.slug}
                  to={`/blogs/${rel.slug || rel.id}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-cyan-500/40 transition-all"
                >
                  <div className="text-[10px] font-bold text-cyan-400 uppercase font-mono mb-1">
                    {rel.category}
                  </div>
                  <h4 className="text-sm font-bold text-white hover:underline line-clamp-2">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
    </div>
  );
};
