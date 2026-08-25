import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalInput } from '../ui/TerminalInput';
import { LazyReveal } from '../common/LazyAnimate';
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
    <section id="final-cta-section" className="py-20 lg:py-28 bg-[#060912] text-slate-100 relative overflow-hidden">
      {/* Scanline-Treated Cinematic Media Band */}
      <CinematicMedia 
        assetId="cta-server-band" 
        mode="ken-burns" 
        scanlineOverlay={true}
        containerClassName="absolute inset-0 opacity-[0.18] pointer-events-none" 
      />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#06B6D4]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <LazyReveal direction="up">
          <div className="bg-[#0B101D]/90 border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3.5 py-1 text-xs font-mono font-medium text-[#00F0FF] shadow-sm mb-4">
              <Terminal className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>INSTANT ZERO-INSTALLATION AUDIT DISPATCH</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 max-w-2xl mx-auto leading-tight">
              Ready to Audit Your Architecture?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
              Launch all 8 diagnostic engines synchronously. Audit Core Web Vitals, transport security, and AI search discoverability in seconds.
            </p>

            {/* Quick Audit Launch Form with TerminalInput */}
            <div className="max-w-xl mx-auto mb-6">
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
            <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono">
              <span className="text-slate-400">Looking for continuous automated 6-hour cron audits?</span>
              <button
                type="button"
                id="final-cta-start-trial-btn"
                onClick={() => openTrialModal('pro')}
                className="inline-flex items-center justify-center gap-2 bg-[#06B6D4] hover:bg-[#00F0FF] text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                <span>Start 7-Day Pro Trial Free</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-8 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                <span>Zero Installation Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                <span>&lt; 2.0s Parallel Latency</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
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
