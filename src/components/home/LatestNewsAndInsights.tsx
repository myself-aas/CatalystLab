import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { DEFAULT_BLOG_COVER, getAllPosts } from '@/lib/blogLoader';

type Tab = 'Engineering' | 'Security' | 'AI';

/** "AI" must match the word, not the letters inside "maintain" or "detail". */
const TAB_PATTERNS: Record<Exclude<Tab, 'Engineering'>, RegExp> = {
  Security: /secur|secops|owasp/i,
  AI: /\bai\b|llm/i,
};

export const LatestNewsAndInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Engineering');

  // Build-time MDX index: newest first, no fetch.
  const articles = useMemo(() => {
    const posts = getAllPosts();
    if (activeTab === 'Engineering') return posts.slice(0, 3);
    const pattern = TAB_PATTERNS[activeTab];
    const matching = posts.filter((post) => pattern.test(`${post.category} ${post.tags.join(' ')}`));
    return (matching.length ? matching : posts).slice(0, 3);
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
            <div className="flex gap-2 p-1.5 bg-cream/3 border border-cream/10 rounded-full font-mono text-xs shadow-sm">
              {(['Engineering', 'Security', 'AI'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-5 py-2 transition duration-300 ${
                    activeTab === tab
                      ? 'bg-cream/15 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-cream/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {articles.map((article, index) => (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link
                      to={`/blogs/${article.slug}`}
                      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl sm:rounded-[32px] border border-cream/10 shadow-lg"
                    >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${article.coverImage ?? DEFAULT_BLOG_COVER})` }}
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-ink-navy/80 via-transparent to-ink-navy/95" />
                    
                    {/* Content Container */}
                    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
                      
                      {/* Top Row: Meta & Icon */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1.5 text-xs font-mono font-medium opacity-90 drop-shadow-sm uppercase tracking-wider">
                          <span className="text-white/75">{new Date(`${article.date}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-white">{article.category}</span>
                        </div>
                        <div className="size-10 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center transition-colors duration-300 group-hover:bg-white/20 group-hover:border-white/40 shrink-0">
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
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-cream/10 hover:border-cream/30 transition-colors bg-cream/5 backdrop-blur-sm"
          >
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <ArrowRight className="size-4" />
            </div>
            <span className="text-sm font-medium text-foreground">View all articles</span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default LatestNewsAndInsights;
