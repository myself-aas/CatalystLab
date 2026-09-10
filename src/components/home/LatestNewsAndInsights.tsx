import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight, Loader2 } from 'lucide-react';

interface Article {
  id: string | number;
  date: string;
  category: string;
  title: string;
  image: string;
  link: string;
}

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 1,
    date: 'January 19, 2026',
    category: 'Engineering',
    title: 'Optimizing Distributed Tracing in High-Scale Architectures',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    link: '#'
  },
  {
    id: 2,
    date: 'January 12, 2026',
    category: 'Security',
    title: 'Zero-Day Vulnerability Mitigation with Autonomous Agents',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    link: '#'
  },
  {
    id: 3,
    date: 'January 5, 2026',
    category: 'AI',
    title: 'The Evolution of Code Completion: Context-Aware LLMs',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    link: '#'
  }
];

export const LatestNewsAndInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Engineering' | 'Security' | 'AI'>('Engineering');
  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const tagMap = {
          'Engineering': 'software',
          'Security': 'security',
          'AI': 'ai'
        };
        const tag = tagMap[activeTab];
        
        // Fetch real tech & telemetry news via dev.to public API
        const res = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=3`);
        if (!res.ok) throw new Error("Failed to fetch articles");
        const data = await res.json();
        
        if (data && data.length > 0) {
          const mappedArticles = data.map((item: any, idx: number) => {
            // Dev.to images can occasionally be null, use fallback Unsplash images to maintain layout
            const fallbackImages = [
              'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ];
            return {
              id: item.id,
              date: new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              category: activeTab,
              title: item.title,
              image: item.cover_image || item.social_image || fallbackImages[idx % fallbackImages.length],
              link: item.url
            };
          });
          setArticles(mappedArticles);
        } else {
          setArticles(FALLBACK_ARTICLES.filter(a => a.category === activeTab));
        }
      } catch (err) {
        // Fallback gracefully without breaking layout
        setArticles(FALLBACK_ARTICLES.filter(a => a.category === activeTab));
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeTab]);

  return (
    <section className="ds-section relative bg-transparent py-24 sm:py-32">
      <div className="relative z-10 ds-page-shell max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight mb-8">
            The latest news & insights
          </h2>
          
          {/* Filtering Toolbar */}
          <div className="flex justify-center">
            <div className="flex gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-full font-mono text-xs shadow-sm">
              {(['Engineering', 'Security', 'AI'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-5 py-2 transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
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
                  <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block aspect-[4/5] overflow-hidden rounded-3xl sm:rounded-[32px] border border-white/10 shadow-lg"
                  >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${article.image})` }}
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1F2223]/80 via-transparent to-[#1F2223]/95" />
                    
                    {/* Content Container */}
                    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
                      
                      {/* Top Row: Meta & Icon */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1.5 text-xs font-mono font-medium opacity-90 drop-shadow-sm uppercase tracking-wider">
                          <span className="text-muted-foreground">{article.date}</span>
                          <span className="text-[#00D2FF]">{article.category}</span>
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
                  </a>
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
          <a 
            href="/blogs" 
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 hover:border-white/30 transition-colors bg-white/5 backdrop-blur-sm"
          >
            <div className="size-8 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <ArrowRight className="size-4" />
            </div>
            <span className="text-sm font-medium text-white">View all articles</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
};

export default LatestNewsAndInsights;
