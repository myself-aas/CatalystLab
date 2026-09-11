import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight, Loader2 } from 'lucide-react';
import type { BlogPost } from '../../types';
import { getBlogPosts } from '../../lib/firebase';
import { ENGINE_SEEDED_BLOGS } from '../../data/engineBlogs';
import { getBlogCoverImage } from '../../utils/blogImageMap';
import { getArticleReadingTime } from '../../utils/readingTime';
import { logger } from '../../lib/logger';

type Article = BlogPost;

const FALLBACK_ARTICLES: Article[] = Object.values(ENGINE_SEEDED_BLOGS)
  .flat()
  .filter((post, index, posts) => posts.findIndex((item) => item.slug === post.slug) === index)
  .slice(0, 3) as Article[];

export const LatestNewsAndInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Engineering' | 'Security' | 'AI'>('Engineering');
  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchNews = async () => {
      setLoading(true);
      try {
        const remotePosts = await getBlogPosts();
        if (cancelled) return;
        const published = remotePosts.filter((post) => post.status !== 'archived');
        const seeded = FALLBACK_ARTICLES;
        const merged = [...published, ...seeded].filter((post, index, posts) => {
          const key = post.slug || post.id;
          return posts.findIndex((item) => (item.slug || item.id) === key) === index;
        });
        const filtered = merged.filter((post) => {
          const value = `${post.category || ''} ${(post.tags || []).join(' ')}`.toLowerCase();
          return activeTab === 'Engineering' || value.includes(activeTab.toLowerCase());
        });
        setArticles((filtered.length ? filtered : merged).slice(0, 3));
      } catch (err) {
        if (cancelled) return;
        logger.warn('Could not fetch homepage blog articles, using seeded posts:', err);
        setArticles(FALLBACK_ARTICLES.slice(0, 3));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNews();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <section className="ds-section relative bg-transparent py-24 sm:py-32">
      <div className="relative z-10 ds-page-shell max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans text-foreground tracking-tight mb-8">
            The latest news & insights
          </h2>
          
          {/* Filtering Toolbar */}
          <div className="flex justify-center">
            <div className="flex gap-2 p-1.5 bg-[rgba(240,250,255,0.03)] border border-[rgba(240,250,255,0.1)] rounded-full font-mono text-xs shadow-sm">
              {(['Engineering', 'Security', 'AI'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-5 py-2 transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-[rgba(240,250,255,0.15)] text-[#F0FAFF] shadow-sm'
                      : 'text-muted-foreground hover:text-[#F0FAFF] hover:bg-[rgba(240,250,255,0.05)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-3xl">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link
                      to={`/blog/${article.slug || article.id}`}
                      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl sm:rounded-[32px] border border-[rgba(240,250,255,0.1)] shadow-lg"
                    >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${getBlogCoverImage(article)})` }}
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1F2223]/80 via-transparent to-[#1F2223]/95" />
                    
                    {/* Content Container */}
                    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
                      
                      {/* Top Row: Meta & Icon */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1.5 text-xs font-mono font-medium opacity-90 drop-shadow-sm uppercase tracking-wider">
                          <span className="text-muted-foreground">{article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Latest'}</span>
                          <span className="text-[#F0FAFF]">{article.category || 'Engineering'}</span>
                        </div>
                        <div className="size-10 rounded-full border border-[rgba(240,250,255,0.2)] backdrop-blur-md flex items-center justify-center transition-colors duration-300 group-hover:bg-[rgba(240,250,255,0.2)] group-hover:border-[rgba(240,250,255,0.4)] shrink-0">
                          <ArrowUpRight className="size-5" />
                        </div>
                      </div>
                      
                      {/* Bottom Row: Title */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-medium leading-tight drop-shadow-md line-clamp-3">
                          {article.title}
                        </h3>
                      </div>
                      
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* View All Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 sm:mt-16 flex justify-center"
        >
          <Link
            to="/blogs"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[rgba(240,250,255,0.1)] hover:border-[rgba(240,250,255,0.3)] transition-colors bg-[rgba(240,250,255,0.05)] backdrop-blur-sm"
          >
            <div className="size-8 rounded-full bg-[#F0FAFF] text-[#1F2223] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <ArrowRight className="size-4" />
            </div>
            <span className="text-sm font-medium text-white">View all articles</span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default LatestNewsAndInsights;
