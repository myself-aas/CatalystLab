import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';
import heroImage from '../assets/images/about_us_hero_1787216854874.jpg';
import dnaServersImage from '../assets/images/dna_servers_1787216887436.jpg';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#111111] text-[#f8fafc] font-sans selection:bg-rose-500/30 selection:text-white">
      <SEOHead
        title="About Us & Core Philosophy"
        description="CatalystLab is a team of digital architects building the next generation of web infrastructure tools."
        keywords={['CatalystLab about', 'team', 'philosophy', 'web infrastructure']}
        canonicalUrl="https://www.catalystlab.tech/about"
      />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Abstract laboratory" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111111]/80 to-[#111111]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 mt-20">
          <LazyReveal direction="up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">About Us</h1>
            <div className="flex items-center justify-center gap-2 text-base text-gray-400 font-medium">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-rose-500">About Us</span>
            </div>
            <p className="mt-6 max-w-2xl mx-auto text-gray-300 leading-relaxed">
              We are a collective of digital architects, engineers, and researchers dedicated to pushing the boundaries of web performance, security, and scalability.
            </p>
          </LazyReveal>
        </div>
      </section>

      {/* Philosophy Section - "Perfection In Engineering" */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <LazyReveal direction="left">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Perfection In <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Engineering</span>
            </h2>
          </LazyReveal>
          
          <LazyReveal direction="right">
            <p className="text-gray-400 leading-relaxed mb-6">
              Our core philosophy is rooted in the synthesis of organic growth and rigorous digital architecture. We build systems that don't just scale—they evolve. CatalystLab is designed to map, monitor, and mend your web infrastructure with biological precision.
            </p>
            <Link to="/docs" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-rose-400 transition-colors group">
              Learn More 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </LazyReveal>
        </div>

        {/* 3 Image Grid */}
        <LazyStaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16" staggerDelay={0.1}>
          <LazyStaggerItem>
            <div className="aspect-[4/3] rounded-sm overflow-hidden bg-gray-900 border border-white/10 group relative">
              <img src={dnaServersImage} alt="Servers" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-base font-bold tracking-wider text-rose-400 uppercase">Infrastructure</span>
              </div>
            </div>
          </LazyStaggerItem>
          <LazyStaggerItem>
            <div className="aspect-[4/3] rounded-sm overflow-hidden bg-gray-900 border border-white/10 group relative">
              <img src={heroImage} alt="Abstract" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-base font-bold tracking-wider text-orange-400 uppercase">Analysis</span>
              </div>
            </div>
          </LazyStaggerItem>
          <LazyStaggerItem>
            <div className="aspect-[4/3] rounded-sm overflow-hidden bg-gray-900 border border-white/10 flex items-center justify-center p-8 text-center group">
               <div className="space-y-4">
                 <div className="w-12 h-12 mx-auto rounded-full border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <div className="w-8 h-8 rounded-full bg-rose-500/20 animate-pulse"></div>
                 </div>
                 <h3 className="text-lg font-bold">Continuous Evolution</h3>
                 <p className="text-sm text-gray-500">Adapting to the ever-changing digital landscape.</p>
               </div>
            </div>
          </LazyStaggerItem>
        </LazyStaggerContainer>
      </section>

      {/* Latest Technology Section */}
      <section className="py-24 bg-[#161616] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <LazyReveal direction="right" className="order-2 lg:order-1 relative">
               <div className="aspect-square max-w-md mx-auto relative rounded-sm overflow-hidden">
                 <img src={dnaServersImage} alt="Technology" className="w-full h-full object-cover opacity-60" />
                 <div className="absolute inset-0 border-2 border-rose-500/20 mix-blend-overlay"></div>
               </div>
               {/* Decorative elements */}
               <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-orange-500/50"></div>
               <div className="absolute -top-6 -left-6 w-24 h-24 border-t-2 border-l-2 border-rose-500/50"></div>
            </LazyReveal>

            <LazyReveal direction="left" className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Using The Latest <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Technology</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                We leverage state-of-the-art diagnostic engines, synthetic edge routing, and generative AI indexability checks to provide a comprehensive, 8-dimensional view of your application's health.
              </p>
              <Link to="/pricing" className="inline-flex items-center justify-center px-8 py-3 text-base font-bold bg-white text-black rounded-sm hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 active:scale-95">
                Get Started
              </Link>
            </LazyReveal>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyStaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" staggerDelay={0.1}>
            <LazyStaggerItem>
              <div className="text-5xl font-black mb-2">8+</div>
              <div className="text-sm font-bold tracking-widest text-orange-500 uppercase px-4 py-1 border border-orange-500/30 inline-block bg-orange-500/10">SDLC Engines</div>
            </LazyStaggerItem>
            <LazyStaggerItem>
              <div className="text-5xl font-black mb-2">12M+</div>
              <div className="text-sm font-bold tracking-widest text-orange-500 uppercase px-4 py-1 border border-orange-500/30 inline-block bg-orange-500/10">Nodes Scanned</div>
            </LazyStaggerItem>
            <LazyStaggerItem>
              <div className="text-5xl font-black mb-2">99.9%</div>
              <div className="text-sm font-bold tracking-widest text-orange-500 uppercase px-4 py-1 border border-orange-500/30 inline-block bg-orange-500/10">Uptime SLA</div>
            </LazyStaggerItem>
            <LazyStaggerItem>
              <div className="text-5xl font-black mb-2">12</div>
              <div className="text-sm font-bold tracking-widest text-orange-500 uppercase px-4 py-1 border border-orange-500/30 inline-block bg-orange-500/10">Global Edge PoPs</div>
            </LazyStaggerItem>
          </LazyStaggerContainer>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 relative overflow-hidden bg-black flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-black to-black"></div>
        <LazyReveal direction="up" className="relative z-10 max-w-2xl px-4">
          <h2 className="text-4xl font-bold mb-4">
            Join Our <span className="text-orange-400">Newsletter</span>
          </h2>
          <p className="text-gray-400 mb-8 text-base">
            Stay updated with the latest advancements in web architecture, OWASP security trends, and our newest Catalyst releases.
          </p>
          <div className="flex justify-center">
            <Link to="/contact" className="px-8 py-3 text-base font-bold border border-white/20 hover:bg-white/5 transition-colors rounded-sm text-gray-200">
              Subscribe Now
            </Link>
          </div>
        </LazyReveal>
      </section>
      
    </div>
  );
};
export default MethodologyPage;
