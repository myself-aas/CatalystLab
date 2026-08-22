import { EngineInput } from "../common/EngineInput";
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
            <div className="max-w-xl mx-auto mb-3">
              <EngineInput 
                value={url}
                onChange={setUrl}
                onSubmit={handleLaunch}
                buttonText="Launch Scan"
                placeholder="@catalystlab-search: (https://"
              />
            </div>

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

