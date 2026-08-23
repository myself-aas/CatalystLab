import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Check, 
  CheckCircle2,
  Flame,
  Crop
} from 'lucide-react';
import { LazyReveal } from '../common/LazyAnimate';
import { useSubscription } from '../../context/SubscriptionContext';

export const SevenDayTrialSection: React.FC = () => {
  const { openTrialModal } = useSubscription();

  const [activeEngineCard, setActiveEngineCard] = useState<number>(0);
  const [activeToolTab, setActiveToolTab] = useState<'inspect' | 'vitals' | 'secops' | 'api'>('vitals');

  const engineCards = [
    {
      id: 0,
      title: 'Core Web Vitals',
      metric: '99.4/100',
      detail: 'TTFB: 14ms • LCP: 0.72s',
      bgClass: 'bg-white border-accent-emerald/40 text-accent-emerald',
      badge: 'Speed Index'
    },
    {
      id: 1,
      title: 'Edge Anycast',
      metric: '18ms TTFB',
      detail: '42 Global Edge PoPs',
      bgClass: 'bg-white border-accent-cyan/40 text-accent-cyan',
      badge: 'DNS & Latency'
    },
    {
      id: 2,
      title: 'AI Search RAG',
      metric: '100% LLMO',
      detail: '/llms.txt + Schema JSON-LD',
      bgClass: 'bg-white border-accent-purple/40 text-accent-purple',
      badge: 'AI Crawler'
    },
    {
      id: 3,
      title: 'OWASP Zero-Trust',
      metric: 'Grade A+',
      detail: 'TLS 1.3 • Strict CSP & HSTS',
      bgClass: 'bg-white border-accent-rose/40 text-accent-rose',
      badge: 'SecOps'
    },
    {
      id: 4,
      title: 'Green Web Carbon',
      metric: '0.08g CO2',
      detail: 'SWD v4 Model Certified',
      bgClass: 'bg-white border-accent-amber/40 text-accent-amber',
      badge: 'Eco Score'
    }
  ];

  return (
    <section 
      id="7-day-free-trial-section"
      className="relative overflow-hidden bg-gray-100/70 backdrop-blur-sm py-16 sm:py-20 border-b border-gray-200 text-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN */}
          <LazyReveal direction="left" className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] text-accent-cyan uppercase">
                AUDIT. AUTOMATE. OPTIMIZE.
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight leading-[1.12]">
              Audit, monitor, <br className="hidden sm:inline" />
              &amp; scale your stack
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-lg">
              Less guesswork, more speed. With CatalystLab Pro and Team, eliminate blindspots with 8 concurrent diagnostic engines, automated 24/7 cron audits, full REST API telemetry, and instant webhook alerts — all in one unified workspace.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openTrialModal('pro')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-black-hover px-6 py-3 text-xs sm:text-sm font-mono font-bold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>Start 7-Day Free Trial</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3 text-xs sm:text-sm font-mono font-semibold text-gray-600 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>Compare Plans</span>
                  <ArrowRight className="h-3.5 w-3.5 text-accent-cyan" />
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono pt-1">
                <ShieldCheck className="h-4 w-4 text-accent-emerald shrink-0" />
                <span>Try any CatalystLab plan free for 7 days. No credit card required.</span>
              </div>
            </div>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-gray-200 text-xs font-mono text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                <span>8 Parallel Engines</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                <span>5,000 Units/Day Quota</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                <span>Automated 6h Cron Audits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                <span>Instant API &amp; Webhooks</span>
              </div>
            </div>

          </LazyReveal>

          {/* RIGHT COLUMN */}
          <LazyReveal direction="right" className="lg:col-span-7 relative">
            <div className="relative min-h-[440px] sm:min-h-[480px] w-full rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xl overflow-hidden">
              
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 mb-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-mono text-gray-600">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
                  </span>
                  <Zap className="h-3.5 w-3.5 text-accent-amber" />
                  <span>Auto-Audit Cron: 10:00 UTC</span>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 text-xs font-mono">
                  <span className="text-gray-500">HEALTH INDEX:</span>
                  <span className="font-bold text-accent-emerald">99.4/100</span>
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="w-full sm:w-[65%] rounded-xl border border-gray-200 bg-gray-100 p-3.5 mb-4 font-mono">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                    <Calendar className="h-3.5 w-3.5 text-accent-cyan" />
                    <span>Continuous Cron Log</span>
                  </div>
                  <span className="text-[10px] text-accent-emerald bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    24/7 Active
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-1.5 rounded bg-white border border-gray-200">
                    <span className="text-gray-500">10:00 AM • Core Web Vitals</span>
                    <span className="text-accent-emerald font-bold">18ms TTFB</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-white border border-gray-200">
                    <span className="text-gray-500">12:00 PM • OWASP Transport</span>
                    <span className="text-accent-cyan font-bold">Grade A+</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-white border border-gray-200">
                    <span className="text-gray-500">02:00 PM • AI Search RAG</span>
                    <span className="text-accent-purple font-bold">100% Ready</span>
                  </div>
                </div>
              </div>

              {/* Swatch Engine Selector */}
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                  Active Telemetry Swatches
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {engineCards.map((card, idx) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setActiveEngineCard(idx)}
                      className={`shrink-0 rounded-xl p-3 text-left border transition-all cursor-pointer w-32 font-mono ${card.bgClass} ${
                        activeEngineCard === idx
                          ? 'ring-1 ring-accent-cyan bg-gray-100'
                          : 'opacity-80 hover:opacity-100 bg-gray-100/70'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-wider text-gray-500">
                        {card.badge}
                      </div>
                      <div className="text-sm font-bold text-black mt-1">
                        {card.metric}
                      </div>
                      <div className="text-[10px] text-gray-600 truncate">
                        {card.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Tool Frame */}
              <div className="rounded-xl border border-gray-200 bg-gray-100 p-3 font-mono">
                <div className="flex gap-2.5">
                  <div className="flex flex-col gap-1 shrink-0 bg-white p-1 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('inspect')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeToolTab === 'inspect' ? 'bg-black text-white' : 'text-gray-500 hover:text-white'
                      }`}
                      title="Telemetry Inspector"
                    >
                      <Crop className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('vitals')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeToolTab === 'vitals' ? 'bg-black text-white' : 'text-gray-500 hover:text-white'
                      }`}
                      title="Core Web Vitals"
                    >
                      <Activity className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('secops')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeToolTab === 'secops' ? 'bg-black text-white' : 'text-gray-500 hover:text-white'
                      }`}
                      title="SecOps"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('api')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeToolTab === 'api' ? 'bg-black text-white' : 'text-gray-500 hover:text-white'
                      }`}
                      title="API"
                    >
                      <Cpu className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 rounded-lg bg-white border border-gray-200 p-2.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-gray-600 mb-2">
                      <span className="truncate max-w-[140px] text-accent-cyan font-bold">
                        https://catalystlab.tech
                      </span>
                      <span className="text-accent-emerald bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                        PRO TRIAL ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-gray-100 p-1.5 rounded border border-gray-200">
                        <div className="text-[9px] text-gray-500">LCP</div>
                        <div className="text-xs font-bold text-accent-emerald">0.74s</div>
                      </div>
                      <div className="bg-gray-100 p-1.5 rounded border border-gray-200">
                        <div className="text-[9px] text-gray-500">CLS</div>
                        <div className="text-xs font-bold text-accent-emerald">0.001</div>
                      </div>
                      <div className="bg-gray-100 p-1.5 rounded border border-gray-200">
                        <div className="text-[9px] text-gray-500">QUOTA</div>
                        <div className="text-xs font-bold text-accent-cyan">5k/day</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </LazyReveal>

        </div>
      </div>
    </section>
  );
};

export default SevenDayTrialSection;
