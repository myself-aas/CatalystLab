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
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    if (path.startsWith('/products')) {
      config = {
        title: 'Our Products',
        subtitle: 'Enterprise-grade tools for modern engineering teams.',
        image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/pricing')) {
      config = {
        title: 'Transparent Pricing',
        subtitle: 'Scale your infrastructure without unexpected costs.',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/api-docs') || path.startsWith('/docs')) {
      config = {
        title: 'Developer Documentation',
        subtitle: 'Build powerful integrations with the Catalyst API.',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/blog')) {
      config = {
        title: 'Engineering Blog',
        subtitle: 'Insights, tutorials, and updates from the Catalyst team.',
        image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/contact')) {
      config = {
        title: 'Get in Touch',
        subtitle: 'We are here to help you build better software.',
        image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
      config = {
        title: 'Command Center',
        subtitle: 'Manage your telemetry, users, and infrastructure.',
        image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/report')) {
      config = {
        title: 'Audit Reports',
        subtitle: 'Comprehensive performance and security analysis.',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/health') || path.startsWith('/latency') || path.startsWith('/eco-audit') || path.startsWith('/compliance') || path.startsWith('/migration') || path.startsWith('/llmo') || path.startsWith('/ai-readiness') || path.startsWith('/repo-scanner') || path.startsWith('/compare')) {
       config = {
        title: 'Diagnostic Engines',
        subtitle: 'Real-time infrastructure health and latency monitoring.',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/privacy') || path.startsWith('/terms') || path.startsWith('/security') || path.startsWith('/cookies')) {
       config = {
        title: 'Trust & Security',
        subtitle: 'Your data privacy and security are our top priority.',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/playground')) {
       config = {
        title: 'Interactive Playground',
        subtitle: 'Test our engines and APIs in a safe sandbox environment.',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/methodology')) {
       config = {
        title: 'Our Methodology',
        subtitle: 'The science and engineering behind Catalyst Score.',
        image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    } else if (path.startsWith('/login') || path.startsWith('/signup')) {
       config = {
        title: 'Authentication',
        subtitle: 'Secure access to your Catalyst Lab environment.',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      };
    }

    return config;
  }, [path]);

  // Don't show banner on home page since it has its own HeroSection
  if (path === '/') return null;

  return (
    <div className="relative w-full h-[32vh] min-h-[260px] max-h-[360px] overflow-hidden flex items-center justify-center border-b border-slate-800/80 bg-[#060912]">
      {/* Background Image with Dark Gradient Scrim */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img 
          src={bannerConfig.image} 
          alt={bannerConfig.title}
          className="w-full h-full object-cover object-center opacity-25 filter grayscale contrast-125"
        />
        {/* Dark Gradient Scrim Layering (Satisfies Background Layering Directive) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060912] via-[#060912]/85 to-[#060912]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent" />
      </div>

      {/* Content Safe Zone */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start justify-center h-full pt-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-4 rounded-lg bg-slate-800/60 border border-slate-700/60 backdrop-blur-md text-[11px] font-mono text-cyan-400 tracking-wider uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Active Module
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-3">
            {bannerConfig.title}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl leading-relaxed">
            {bannerConfig.subtitle}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
