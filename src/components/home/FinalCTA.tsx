import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyReveal } from '../common/LazyAnimate';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  const sampleTargets = [
    { label: 'stripe.com', url: 'https://stripe.com' },
    { label: 'github.com', url: 'https://github.com' },
    { label: 'anthropic.com', url: 'https://anthropic.com' },
    { label: 'vercel.com', url: 'https://vercel.com' },
  ];

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    navigate(`/launch-audit?url=${encodeURIComponent(clean)}`);
  };

  return (
    <section className="py-12 lg:py-16 bg-brand-navy text-white relative overflow-hidden border-t border-brand-slate/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <LazyReveal direction="up">
          <div className="bg-brand-oxford border border-brand-slate/30 rounded-3xl p-6 sm:p-10 shadow-xl shadow-black/40 text-center">
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2 max-w-2xl mx-auto">
              Ready to Audit Your Production Stack?
            </h2>

            <p className="text-sm sm:text-base text-[#8ea8c3] max-w-lg mx-auto mb-6 leading-relaxed">
              Launch all 8 diagnostic engines in parallel. Detect security headers, Core Web Vitals, and AI search discoverability in seconds.
            </p>

            {/* Quick Audit Launch Form */}
            <form onSubmit={handleLaunch} className="max-w-xl mx-auto mb-3">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-brand-navy border border-brand-slate/60 rounded-2xl shadow-inner focus-within:border-[#38bdf8] transition-all">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-domain.com"
                  className="w-full bg-transparent px-4 py-2 text-sm sm:text-base font-mono text-white placeholder-[#8ea8c3] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-brand-periwinkle hover:bg-white text-brand-navy px-5 py-2.5 rounded-xl text-sm font-mono font-bold transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>Launch Scan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            {/* Sample Targets Pill Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-sm font-mono text-[#8ea8c3]">
              <span className="text-sm">Popular:</span>
              {sampleTargets.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setUrl(item.url)}
                  className="px-2.5 py-0.5 rounded-lg bg-brand-navy hover:bg-[#162a45] hover:text-[#38bdf8] border border-brand-slate/40 text-sm transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Micro Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-brand-slate/30 text-sm font-mono text-[#8ea8c3]">
              <div className="flex items-center gap-1.5 text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-[#34d399]" />
                <span>Zero Installation</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <Zap className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span>&lt;2000ms Latency</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <Globe className="h-3.5 w-3.5 text-brand-periwinkle" />
                <span>100% Free Public Audit</span>
              </div>
            </div>

          </div>
        </LazyReveal>
      </div>
    </section>
  );
};

export default FinalCTA;

