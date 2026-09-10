import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPostBySlug } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { getBlogCoverImage } from '../utils/blogImageMap';
import { getArticleReadingTime } from '../utils/readingTime';
import { 
  ArrowLeft, Bookmark, Clock, Share2, Check, Edit3, Eye
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { logger } from '../lib/logger';
import { motion } from 'motion/react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getBlogPostBySlug(slug);
        setPost(data);
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
    return (
      <div className="min-h-screen bg-[#1F2223] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2C3032] border-t-[#F7FDFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#1F2223] text-[#F7FDFF] flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
        <p className="text-gray-400 mb-6 text-center">The article you are looking for does not exist.</p>
        <Link to="/blogs" className="px-6 py-3 bg-[#2C2F32] rounded-full text-sm font-medium hover:bg-[#2C3032] transition-colors">
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div data-theme="dark" className="min-h-screen bg-[#1F2223] text-[#F7FDFF] font-sans pb-20">
      <SEOHead 
        title={post.title} 
        description={post.excerpt || `Read ${post.title}`}
      />

      <div className="max-w-md mx-auto relative bg-[#1F2223] min-h-screen">
        
        {/* Full Bleed Image Header */}
        <div className="relative h-[45vh] w-full">
          <img 
            src={getBlogCoverImage(post)} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#1F2223]/90" />
          
          {/* Top Actions */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
            <Link to="/blogs" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => setBookmarked(!bookmarked)}
              className={`w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center transition-colors ${bookmarked ? 'text-white' : 'text-white/80 hover:text-white'}`}
            >
              <Bookmark className="w-5 h-5" fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Floating White Card Overlap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 -mt-16 mx-4 bg-[#F7FDFF] rounded-[32px] p-6 shadow-2xl text-[#1F2223]"
        >
          <div className="inline-block px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-4">
            {post.category || 'Article'}
          </div>
          
          <h1 className="text-2xl font-bold leading-tight mb-4 text-[#1F2223]">
            {post.title}
          </h1>
          
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            {post.excerpt}
          </p>
          
          {/* Author Strip */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1F2223] text-white flex items-center justify-center font-bold overflow-hidden">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                ) : (
                  (post.authorName || 'C')[0]
                )}
              </div>
              <span className="font-semibold text-sm">{post.authorName || 'Catalyst Team'}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {getArticleReadingTime(post)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {(post as any).views || 376}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions Bar (Dark Mode) */}
        <div className="px-6 py-6 flex items-center justify-between mt-4">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full bg-[#2C2F32]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share Article'}
          </button>
          
          {user && (isAdmin || user.email === post.authorEmail) && (
            <Link 
              to={`/blogs/edit/${post.id || post.slug}`}
              className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full bg-[#2C2F32]"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Link>
          )}
        </div>

        {/* Main Content (Dark Mode) */}
        <article className="px-6 pb-12 prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:text-[#F7FDFF] max-w-none">
          <MarkdownRenderer content={post.content} />
        </article>

      </div>
    </div>
  );
};

export default BlogPostPage;
