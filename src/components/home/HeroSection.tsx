import React, { useState } from 'react';
import { ArrowRight, Play, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/engine/master?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <section className="pt-32 pb-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight mb-8">
          Enterprise Security <span className="text-emerald-500">Diagnostics</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          Run comprehensive audits across 8 dedicated diagnostic engines. Uncover vulnerabilities before they reach production.
        </p>
        
        <form onSubmit={handleAudit} className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
          <input 
            type="url" 
            placeholder="https://your-domain.com" 
            required
            className="flex-1 px-6 py-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
            Run Master Audit <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </section>
  );
};
