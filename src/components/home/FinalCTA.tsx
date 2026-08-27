import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalInput } from '../ui/TerminalInput';
import { LazyReveal } from '../common/LazyAnimate';
import { CinematicVideo } from '../media/CinematicVideo';
import { CinematicMedia } from '../media/CinematicMedia';
import { ShieldCheck, Zap, ChevronRight, Check, Sparkles, Terminal } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const { openTrialModal } = useSubscription();
  const [url, setUrl] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  const sampleTargets = [
    { label: 'stripe.com', url: 'stripe.com' },
    { label: 'github.com', url: 'github.com' },
    { label: 'anthropic.com', url: 'anthropic.com' },
    { label: 'cloudflare.com', url: 'cloudflare.com' },
  ];

  const handleLaunch = (submittedUrl: string) => {
    const target = submittedUrl || url;
    if (!target.trim()) return;
    setIsLaunching(true);
    let clean = target.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    setTimeout(() => {
      navigate(`/launch-audit?url=${encodeURIComponent(clean)}`);
    }, 400);
  };

  return (
    <section id="final-cta-section" className="py-20 lg:py-28 bg-white text-slate-900 relative overflow-hidden border-b border-slate-200">
      {/* Scanline-Treated Cinematic Video Band (V-AI with scanlines & fallback) */}
      <CinematicVideo 
        assetId="cta-video" 
        scanlines={true}
        treatment="catalyst-grade-slate"
        containerClassName="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-multiply" 
      />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <LazyReveal direction="up">
          <div className="bg-slate-50/90 border border-slate-200 rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-xl backdrop-blur-xl">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-sans font-bold text-indigo-700 tracking-widest shadow-sm mb-5 uppercase">
              <Terminal className="h-4 w-4 text-indigo-600" />
              <span>Instant Zero-Installation Audit Dispatch</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-5 max-w-3xl mx-auto leading-tight">
              Ready to Audit Your Architecture?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
              Launch all 8 diagnostic engines synchronously. Audit Core Web Vitals, transport security, and AI search discoverability in seconds.
            </p>

            {/* Quick Audit Launch Form with TerminalInput */}
            <div className="max-w-xl mx-auto mb-8 relative z-20">
              <TerminalInput 
                value={url}
                onChange={setUrl}
                onSubmit={handleLaunch}
                buttonText="Launch Master Scan"
                placeholder="domain.com"
                isLoading={isLaunching}
                presets={sampleTargets}
                id="final-cta-terminal-input"
              />
            </div>

            {/* Alternative Action: Pro Trial */}
            <div className="pt-8 mt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-sans font-medium">
              <span className="text-slate-500">Looking for continuous automated 6-hour cron audits?</span>
              <button
                type="button"
                id="final-cta-start-trial-btn"
                onClick={() => openTrialModal('pro')}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Start 7-Day Pro Trial Free</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-8 text-sm font-sans font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Zero Installation Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>&lt; 2.0s Parallel Latency</span>
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
