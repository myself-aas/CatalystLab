import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { getBlogPosts } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  Image as ImageIcon,
  Play,
  Star,
  User as UserIcon,
  Search,
  BookOpen,
  Settings
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const BlogsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Popular');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getBlogPosts();
        const visible = data.filter((p) => p.status !== 'archived');
        setPosts(visible);
      } catch (err) {
        console.error("Error loading blog posts:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const listPosts = posts.filter((p) => p.id !== featuredPost?.id).slice(0, 3);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail) {
      setSubscribed(true);
      setSubscribeEmail('');
    }
  };

  const categories = ['Popular', 'AI & LLM', 'Performance', 'SecOps', 'Edge Latency', 'Architecture'];

  const getFormatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Aug 10, 2024';
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b192c] overflow-x-hidden">
      <SEOHead
        title="Engineering Insights & Telemetry Articles"
        description="Discover engineering updates, telemetry benchmarks, and architecture best practices from the CatalystLab team."
        keywords={['CatalystLab blog', 'engineering blog', 'web health insights']}
        canonicalUrl="https://www.catalystlab.tech/blogs"
      />

      {/* Header and Breadcrumbs */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs items={[{ label: 'Engineering Blog' }]} />
          {user && isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-[#0b192c] bg-[#0b192c] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#152238] transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 space-y-28">
        
        {/* 1. Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mt-4">
          <div className="lg:col-span-5 space-y-6">
            <h1 className="text-[40px] sm:text-[52px] lg:text-[64px] font-extrabold text-[#0b192c] tracking-tight leading-[1.1]">
              Discover the <br /> Web's Hidden <br /> Telemetry
            </h1>
            <p className="text-[#415a77] text-sm sm:text-base leading-relaxed max-w-sm">
              Find the unique benchmarks and hidden metrics that ignite unforgettable web experiences. From rare performance bottlenecks to remarkable edge destinations.
            </p>
            <button className="rounded-full bg-[#0b192c] px-7 py-3.5 text-xs font-bold text-white hover:bg-[#152238] transition-colors shadow-sm tracking-wide">
              Read our latest
            </button>
          </div>
          
          <div className="lg:col-span-7 relative h-[400px] sm:h-[500px]">
            {/* Gray map silhouette background would go here, using a subtle gradient placeholder */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-slate-100/50 rounded-full blur-3xl opacity-50 -z-10" />
            
            {/* Image masonry blocks simulating the wireframe layout */}
            <div className="absolute right-[5%] top-[5%] w-[45%] h-[40%] bg-[#cbd5e1] rounded-3xl flex items-center justify-center shadow-sm">
               <ImageIcon className="h-8 w-8 text-[#94a3b8]" />
            </div>
            
            <div className="absolute left-[15%] top-[10%] w-[35%] h-[55%] bg-[#e2e8f0] rounded-3xl flex items-center justify-center shadow-sm">
               <ImageIcon className="h-8 w-8 text-[#94a3b8]" />
            </div>

            <div className="absolute right-[10%] bottom-[15%] w-[30%] h-[35%] bg-[#e2e8f0] rounded-3xl flex items-center justify-center shadow-sm">
               <ImageIcon className="h-6 w-6 text-[#94a3b8]" />
            </div>

            <div className="absolute left-[30%] bottom-[5%] w-[25%] h-[25%] bg-[#cbd5e1] rounded-3xl flex items-center justify-center shadow-sm">
               <ImageIcon className="h-6 w-6 text-[#94a3b8]" />
            </div>
          </div>
        </section>

        {/* 2. Top Topics (Destinations) */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[28px] font-extrabold text-[#0b192c]">Top Topics</h2>
              <div className="mt-4 flex items-center gap-6 text-xs font-semibold text-[#64748b] overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <span 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap cursor-pointer transition-colors ${selectedCategory === cat ? 'text-[#0b192c] border-b-2 border-[#0b192c] pb-1' : 'hover:text-[#0b192c]'}`}
                  >
                    {cat}
                  </span>
                ))}
                <span className="whitespace-nowrap cursor-pointer hover:text-[#0b192c] flex items-center gap-1">
                  More <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
            <button className="shrink-0 rounded-full border border-[#cbd5e1] px-5 py-2 text-[11px] font-bold text-[#0b192c] hover:bg-[#e2e8f0] transition-colors tracking-wide">
              Explore all topics
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: 'Edge Routing Analytics', subtitle: 'Global Network' },
              { title: 'Core Web Vitals', subtitle: 'Performance' },
              { title: 'Content Security Policy', subtitle: 'SecOps' },
              { title: 'AI Crawler Indexing', subtitle: 'LLMs' }
            ].map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-[32px] bg-[#cbd5e1] flex items-center justify-center mb-4 transition-transform group-hover:scale-[1.02]">
                  <ImageIcon className="h-8 w-8 text-[#94a3b8]" />
                </div>
                <h3 className="text-sm font-bold text-[#0b192c] leading-tight group-hover:text-[#415a77] transition-colors">{item.title}</h3>
                <p className="text-[11px] text-[#64748b] mt-1.5">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Latest Stories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[28px] font-extrabold text-[#0b192c]">Latest Stories</h2>
            <button className="hidden sm:block rounded-full border border-[#cbd5e1] px-5 py-2 text-[11px] font-bold text-[#0b192c] hover:bg-[#e2e8f0] transition-colors tracking-wide">
              Read more articles
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Featured Post (Left) */}
            <div className="lg:col-span-7 group cursor-pointer">
              <Link to={featuredPost ? `/blog/${featuredPost.slug || featuredPost.id}` : '#'}>
                <div className="aspect-[4/3] rounded-[32px] bg-[#cbd5e1] flex items-center justify-center mb-6 overflow-hidden transition-transform group-hover:scale-[1.01]">
                   <ImageIcon className="h-12 w-12 text-[#94a3b8]" />
                </div>
                <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-3">
                  {featuredPost?.category || 'Engineering'}
                </div>
                <h3 className="text-[26px] font-extrabold text-[#0b192c] leading-tight mb-3 group-hover:text-[#415a77] transition-colors">
                  {featuredPost ? featuredPost.title : 'Deep dive into rendering patterns: 10 strategies for React'}
                </h3>
                <div className="text-[11px] text-[#64748b] mb-4">
                  {getFormatDate(featuredPost?.createdAt)} • {featuredPost?.readTime || '4 min read'}
                </div>
                <p className="text-sm text-[#415a77] leading-relaxed line-clamp-3">
                  {featuredPost ? featuredPost.excerpt : 'It seems that in frontend engineering, almost any problem can be solved with a combination of memoization, lazy loading, and suspense. After all, speed matters...'}
                </p>
              </Link>
            </div>

            {/* List Posts (Right) */}
            <div className="lg:col-span-5 flex flex-col gap-8 justify-center">
              {listPosts.length > 0 ? listPosts.map((item, idx) => (
                <Link key={idx} to={`/blog/${item.slug || item.id}`} className="flex gap-5 group cursor-pointer items-center">
                  <div className="w-28 h-28 shrink-0 rounded-3xl bg-[#cbd5e1] flex items-center justify-center transition-transform group-hover:scale-[1.03]">
                     <ImageIcon className="h-6 w-6 text-[#94a3b8]" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1.5">{item.category || 'Guide'}</div>
                    <h4 className="text-sm font-bold text-[#0b192c] leading-snug group-hover:text-[#415a77] transition-colors line-clamp-3">
                      {item.title}
                    </h4>
                    <div className="text-[10px] text-[#64748b] mt-2">{getFormatDate(item.createdAt)} • {item.readTime || '5 min read'}</div>
                  </div>
                </Link>
              )) : (
                [
                  { cat: 'Architecture', title: '15 Cloud Architectures You\'ll Love: Best patterns in 2024' },
                  { cat: 'SecOps', title: '10 incredible security headers your app needs immediately' },
                  { cat: 'Performance', title: 'Visiting Web Vitals on a Budget: Affordable optimization tricks' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 group cursor-pointer items-center">
                    <div className="w-28 h-28 shrink-0 rounded-3xl bg-[#cbd5e1] flex items-center justify-center transition-transform group-hover:scale-[1.03]">
                       <ImageIcon className="h-6 w-6 text-[#94a3b8]" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1.5">{item.cat}</div>
                      <h4 className="text-sm font-bold text-[#0b192c] leading-snug group-hover:text-[#415a77] transition-colors line-clamp-3">
                        {item.title}
                      </h4>
                      <div className="text-[10px] text-[#64748b] mt-2">Aug 15, 2024 • 5 min read</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <button className="mt-8 sm:hidden w-full rounded-full border border-[#cbd5e1] px-5 py-3 text-[11px] font-bold text-[#0b192c] hover:bg-[#e2e8f0] transition-colors tracking-wide">
            Read more articles
          </button>
        </section>

        {/* 4. Trekker's Highlights (Engineer's Highlights) */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[28px] font-extrabold text-[#0b192c]">Engineer's Highlights</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Text & Testimonial */}
            <div className="lg:col-span-4 flex flex-col justify-center pr-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-[#cbd5e1] flex items-center justify-center overflow-hidden">
                   <UserIcon className="h-5 w-5 text-[#94a3b8]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0b192c]">Maria Angelica</div>
                  <div className="text-[10px] text-[#64748b]">Senior Frontend Architect</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-[#0b192c] text-[#0b192c]" />)}
              </div>
              <h3 className="text-[22px] font-extrabold text-[#0b192c] mb-4 leading-tight">
                An Unforgettable Journey Through Telemetry
              </h3>
              <p className="text-[13px] text-[#415a77] leading-relaxed mb-6">
                Thanks to CatalystLab, my trip through web performance was truly magical. Their expert probes and insider insights led me to hidden DOM bottlenecks and must-see latency issues I would have missed otherwise. The suggested optimizations made fixing our robust CI/CD pipelines effortless.
              </p>
            </div>

            {/* Video / Highlight Image Blocks */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row gap-6">
              <div className="flex-1 aspect-[3/4] sm:aspect-auto sm:h-[400px] rounded-[32px] bg-[#e2e8f0] flex flex-col justify-end p-6 relative overflow-hidden group cursor-pointer shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-105">
                  <ImageIcon className="h-10 w-10 text-[#94a3b8]" />
                </div>
              </div>
              
              <div className="flex-1 aspect-[3/4] sm:aspect-auto sm:h-[400px] rounded-[32px] bg-[#cbd5e1] flex flex-col justify-end p-6 relative overflow-hidden group cursor-pointer shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-105">
                   <div className="h-14 w-14 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center shadow-sm">
                     <Play className="h-5 w-5 fill-[#0b192c] text-[#0b192c] ml-1" />
                   </div>
                </div>
                <div className="relative z-10 p-2">
                  <div className="text-[13px] font-bold text-white leading-tight">Sunset from Edge Latency Probe</div>
                  <button className="mt-3 rounded-full border border-white/50 bg-white/20 backdrop-blur-md px-4 py-2 text-[10px] font-bold text-white hover:bg-white hover:text-[#0b192c] transition-colors tracking-wide">
                    See more highlights
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 5. Newsletter Full Width */}
      <section className="bg-[#94a3b8] py-24 px-4 mt-24">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[32px] sm:text-[40px] font-extrabold text-white mb-10 leading-tight">
            Get Your Developer Inspiration <br className="hidden sm:block" /> Straight to Your Inbox
          </h2>
          
          {subscribed ? (
             <div className="rounded-full bg-white/20 backdrop-blur-sm px-6 py-4 text-sm font-bold text-white border border-white/30 transition-all">
               Thanks for subscribing to our technical updates!
             </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 rounded-full px-6 py-4 text-sm bg-white border-0 focus:outline-none focus:ring-2 focus:ring-[#0b192c] text-[#0b192c] placeholder:text-[#94a3b8]"
              />
              <button 
                type="submit"
                className="rounded-full bg-[#0b192c] px-10 py-4 text-sm font-bold text-white hover:bg-[#152238] transition-colors shadow-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
          <p className="text-[11px] text-white/80 mt-6 max-w-sm mx-auto leading-relaxed">
            Subscribe to receive telemetry newsletters and exclusive developer updates. Read our <Link to="/privacy" className="underline font-semibold hover:text-white transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </section>

    </div>
  );
};
export default BlogsPage;
