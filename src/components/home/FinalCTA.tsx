import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EngineInput } from '../common/EngineInput';
import { LazyReveal } from '../common/LazyAnimate';
import { ShieldCheck, Zap, ChevronRight, Check } from 'lucide-react';
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
    <section className="py-24 bg-white text-zinc-950 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <LazyReveal direction="up">
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-950 tracking-tight mb-4 max-w-2xl mx-auto leading-tight">
              Ready to Audit Your Architecture?
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 max-w-xl mx-auto mb-10 leading-relaxed">
              Launch all 8 diagnostic engines synchronously. Audit Core Web Vitals, transport security, and AI search discoverability in seconds.
            </p>

            {/* Quick Audit Launch Form */}
            <div className="max-w-xl mx-auto mb-6">
              <EngineInput 
                value={url}
                onChange={setUrl}
                onSubmit={handleLaunch}
                buttonText="Launch Master Scan"
                placeholder="https://"
              />
            </div>

            {/* Sample Targets */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12 text-sm text-zinc-600">
              <span className="font-medium">Try instant domain:</span>
              {sampleTargets.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setUrl(item.url)}
                  className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Alternative Action: Pro Trial */}
            <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-center gap-6">
              <span className="text-zinc-600">Looking for continuous automated 6-hour cron audits?</span>
              <button
                type="button"
                onClick={() => openTrialModal('pro')}
                className="inline-flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <span>Start 7-Day Pro Trial Free</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm font-medium text-zinc-700">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Zero Installation Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>&lt;2.0s Parallel Latency</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
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
