import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EngineInput } from '../common/EngineInput';
import { LazyReveal } from '../common/LazyAnimate';
import { ShieldCheck, Zap, Globe, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const { openTrialModal } = useSubscription();
  const [url, setUrl] = useState('');

  const sampleTargets = [
    { label: 'stripe.com', url: 'stripe.com' },
    { label: 'github.com', url: 'github.com' },
    { label: 'anthropic.com', url: 'anthropic.com' },
    { label: 'cloudflare.com', url: 'cloudflare.com' },
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
    <section className="py-16 lg:py-20 bg-transparent text-brand-offwhite relative overflow-hidden border-b border-brand-slate/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <LazyReveal direction="up">
          <div className="bg-surface-panel border border-brand-slate/40 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl text-center relative overflow-hidden">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-brand-oxford px-3.5 py-1 text-xs font-mono text-brand-periwinkle mb-4">
              <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              <span>Full-Stack Automated Telemetry</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-offwhite tracking-tight mb-3 max-w-2xl mx-auto font-sans leading-tight">
              Ready to Audit Your Production Stack?
            </h2>

            <p className="text-xs sm:text-sm text-brand-periwinkle max-w-xl mx-auto mb-8 leading-relaxed font-sans">
              Launch all 8 diagnostic engines synchronously. Audit Core Web Vitals, OWASP transport security headers, and AI search discoverability in under 2 seconds.
            </p>

            {/* Quick Audit Launch Form */}
            <div className="max-w-xl mx-auto mb-4">
              <EngineInput 
                value={url}
                onChange={setUrl}
                onSubmit={handleLaunch}
                buttonText="Launch Master Scan"
                placeholder="@catalystlab-search: (https://"
              />
            </div>

            {/* Sample Targets */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-mono text-brand-periwinkle">
              <span className="text-brand-slate-light font-bold">Try instant domain:</span>
              {sampleTargets.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setUrl(item.url)}
                  className="px-2.5 py-1 rounded-lg bg-brand-oxford hover:bg-surface-subtle hover:text-white border border-brand-slate/40 text-xs transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Alternative Action: Pro Trial */}
            <div className="pt-6 border-t border-brand-slate/30 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono">
              <span className="text-brand-slate-light">Looking for continuous automated 6-hour cron audits?</span>
              <button
                type="button"
                onClick={() => openTrialModal('pro')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                <span>Start 7-Day Pro Trial Free</span>
                <ChevronRight className="h-3.5 w-3.5 text-accent-cyan" />
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-mono text-brand-periwinkle">
              <div className="flex items-center gap-1.5 text-brand-offwhite">
                <CheckCircle2 className="h-4 w-4 text-accent-emerald shrink-0" />
                <span>Zero Installation Required</span>
              </div>
              <div className="flex items-center gap-1.5 text-brand-offwhite">
                <Zap className="h-4 w-4 text-accent-cyan shrink-0" />
                <span>&lt;2.0s Parallel Latency</span>
              </div>
              <div className="flex items-center gap-1.5 text-brand-offwhite">
                <ShieldCheck className="h-4 w-4 text-accent-purple shrink-0" />
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
