import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const DynamicBanner: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const bannerConfig = useMemo(() => {
    let config = {
      title: 'Catalyst Score',
      subtitle: 'Next-Generation Telemetry & Analytics',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop'
    };

    if (path.startsWith('/products')) {
      config = {
        title: 'Our Products',
        subtitle: 'Enterprise-grade tools for modern engineering teams.',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/pricing')) {
      config = {
        title: 'Transparent Pricing',
        subtitle: 'Scale your infrastructure without unexpected costs.',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/api-docs') || path.startsWith('/docs')) {
      config = {
        title: 'Developer Documentation',
        subtitle: 'Build powerful integrations with the Catalyst API.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/blog')) {
      config = {
        title: 'Engineering Blog',
        subtitle: 'Insights, tutorials, and updates from the Catalyst team.',
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/contact')) {
      config = {
        title: 'Get in Touch',
        subtitle: 'We are here to help you build better software.',
        image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
      config = {
        title: 'Command Center',
        subtitle: 'Manage your telemetry, users, and infrastructure.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/report')) {
      config = {
        title: 'Audit Reports',
        subtitle: 'Comprehensive performance and security analysis.',
        image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/health') || path.startsWith('/latency') || path.startsWith('/eco-audit') || path.startsWith('/compliance') || path.startsWith('/migration') || path.startsWith('/llmo') || path.startsWith('/ai-readiness') || path.startsWith('/repo-scanner') || path.startsWith('/compare')) {
       config = {
        title: 'Diagnostic Engines',
        subtitle: 'Real-time infrastructure health and latency monitoring.',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/privacy') || path.startsWith('/terms') || path.startsWith('/security') || path.startsWith('/cookies')) {
       config = {
        title: 'Trust & Security',
        subtitle: 'Your data privacy and security are our top priority.',
        image: 'https://images.unsplash.com/photo-1510511459019-5efa32a85c6c?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/playground')) {
       config = {
        title: 'Interactive Playground',
        subtitle: 'Test our engines and APIs in a safe sandbox environment.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/methodology')) {
       config = {
        title: 'Our Methodology',
        subtitle: 'The science and engineering behind Catalyst Score.',
        image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2000&auto=format&fit=crop'
      };
    } else if (path.startsWith('/login') || path.startsWith('/signup')) {
       config = {
        title: 'Authentication',
        subtitle: 'Secure access to your Catalyst Lab environment.',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2000&auto=format&fit=crop'
      };
    }

    return config;
  }, [path]);

  // Don't show banner on home page since it has its own HeroSection
  if (path === '/') return null;

  return (
    <div className="relative w-full h-[35vh] min-h-[300px] max-h-[400px] overflow-hidden flex items-center justify-center border-b border-zinc-200 bg-zinc-50">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={bannerConfig.image} 
          alt={bannerConfig.title}
          className="w-full h-full object-cover object-center grayscale-[0.2]"
        />
        {/* Light overlay to match premium minimalist zinc theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent mix-blend-normal" />
      </div>

      {/* Content Safe Zone */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start justify-center h-full pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-lg bg-zinc-100/80 border border-zinc-200/80 backdrop-blur-md text-[11px] font-mono text-zinc-600 tracking-widest uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Module
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-950 tracking-tight leading-tight mb-4">
            {bannerConfig.title}
          </h1>
          
          <p className="text-base sm:text-lg text-zinc-600 font-medium max-w-xl leading-relaxed">
            {bannerConfig.subtitle}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
