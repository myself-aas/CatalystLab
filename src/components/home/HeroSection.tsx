import React, { useState } from 'react';
import { ArrowRight, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/launch-audit?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Subtle Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-border-default bg-white/[0.04] text-xs font-medium text-foreground-muted mb-8 backdrop-blur-md hover:border-border-hover transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-foreground-subtle">Engine Matrix 2.4 Released</span>
          <ChevronRight className="w-3.5 h-3.5 text-foreground-muted" />
        </div>

        {/* Linear Hero Display Typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-gradient-linear">
          Autonomous Telemetry &amp; <br className="hidden sm:inline" />
          <span className="text-gradient-accent">Enterprise Diagnostics</span>
        </h1>

        <p className="text-base sm:text-lg text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Execute continuous, multi-dimensional health audits across 8 autonomous diagnostic engines. Uncover architectural drift and security vulnerabilities in real time.
        </p>
        
        {/* Search / URL Submission Bar (Linear Surface) */}
        <form 
          onSubmit={handleAudit} 
          className="max-w-2xl mx-auto p-1.5 rounded-2xl bg-white/[0.04] border border-border-default shadow-linear-card backdrop-blur-xl focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all flex flex-col sm:flex-row gap-2"
        >
          <div className="flex-1 flex items-center px-4 py-2">
            <Zap className="w-4 h-4 text-foreground-muted mr-3 shrink-0" />
            <input 
              id="hero-audit-url-input"
              type="url" 
              placeholder="https://your-domain.com" 
              required
              className="w-full bg-transparent border-none text-foreground placeholder:text-foreground-muted/60 focus:outline-none text-sm sm:text-base font-normal"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-accent-bright transition-all shadow-linear-cta flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
          >
            <span>Run Master Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Supporting Trust Metrics */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accent" /> Zero Agent Installation
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>8 Diagnostic Engines</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>Sub-second Latency</span>
        </div>
      </div>
    </section>
  );
};

