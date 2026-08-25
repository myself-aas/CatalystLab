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
  Crop,
  Terminal
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
      color: '#00FF66',
      badge: 'Speed Index'
    },
    {
      id: 1,
      title: 'Edge Anycast',
      metric: '18ms TTFB',
      detail: '42 Global Edge PoPs',
      color: '#00F0FF',
      badge: 'DNS & Latency'
    },
    {
      id: 2,
      title: 'AI Search RAG',
      metric: '100% LLMO',
      detail: '/llms.txt + Schema JSON-LD',
      color: '#A855F7',
      badge: 'AI Crawler'
    },
    {
      id: 3,
      title: 'OWASP Zero-Trust',
      metric: 'Grade A+',
      detail: 'TLS 1.3 • Strict CSP & HSTS',
      color: '#F43F5E',
      badge: 'SecOps'
    },
    {
      id: 4,
      title: 'Green Web Carbon',
      metric: '0.08g CO2',
      detail: 'SWD v4 Model Certified',
      color: '#FBBF24',
      badge: 'Eco Score'
    }
  ];

  return (
    <section 
      id="7-day-free-trial-section"
      className="relative overflow-hidden bg-[#080D1A] py-16 sm:py-20 border-b border-slate-800 text-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN */}
          <LazyReveal direction="left" className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3 py-1 text-xs font-mono font-medium text-[#00F0FF] shadow-sm">
              <Terminal className="w-3.5 h-3.5" />
              <span>AUDIT. AUTOMATE. OPTIMIZE.</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse ml-1" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              Audit, monitor, <br className="hidden sm:inline" />
              &amp; scale your stack
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Less guesswork, more speed. With CatalystLab Pro and Team, eliminate blindspots with 8 concurrent diagnostic engines, automated 24/7 cron audits, full REST API telemetry, and instant webhook alerts — all in one unified workspace.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  id="trial-section-start-btn"
                  onClick={() => openTrialModal('pro')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#06B6D4] hover:bg-[#00F0FF] px-6 py-3 text-xs sm:text-sm font-mono font-bold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Start 7-Day Free Trial</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0B101D] hover:bg-[#0E1526] hover:border-slate-700 px-5 py-3 text-xs sm:text-sm font-mono font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Compare Plans</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-1">
                <ShieldCheck className="h-4 w-4 text-[#00FF66] shrink-0" />
                <span>Try any CatalystLab plan free for 7 days. No credit card required.</span>
              </div>
            </div>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-800 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                <span>8 Parallel Engines</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                <span>5,000 Units/Day Quota</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                <span>Automated 6h Cron Audits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                <span>Instant API &amp; Webhooks</span>
              </div>
            </div>

          </LazyReveal>

          {/* RIGHT COLUMN */}
          <LazyReveal direction="right" className="lg:col-span-7 relative">
            <div className="relative min-h-[440px] sm:min-h-[480px] w-full rounded-2xl border border-slate-800 bg-[#0B101D]/90 p-5 sm:p-7 shadow-[0_16px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0E1526] px-3 py-1 text-xs font-mono text-slate-300">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF66]" />
                  </span>
                  <Zap className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>Auto-Audit Cron: 10:00 UTC</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0E1526] px-3 py-1 rounded-full border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">HEALTH INDEX:</span>
                  <span className="font-bold text-[#00FF66]">99.4/100</span>
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="w-full sm:w-[65%] rounded-xl border border-slate-800 bg-[#0E1526] p-3.5 mb-4 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Calendar className="h-3.5 w-3.5 text-[#00F0FF]" />
                    <span>Continuous Cron Log</span>
                  </div>
                  <span className="text-[10px] text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30 px-2 py-0.5 rounded">
                    24/7 Active
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#0B101D] border border-slate-800">
                    <span className="text-slate-400">10:00 AM • Core Web Vitals</span>
                    <span className="text-[#00FF66] font-bold">18ms TTFB</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#0B101D] border border-slate-800">
                    <span className="text-slate-400">12:00 PM • OWASP Transport</span>
                    <span className="text-[#00F0FF] font-bold">Grade A+</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#0B101D] border border-slate-800">
                    <span className="text-slate-400">02:00 PM • AI Search RAG</span>
                    <span className="text-[#A855F7] font-bold">100% Ready</span>
                  </div>
                </div>
              </div>

              {/* Swatch Engine Selector */}
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Active Telemetry Swatches
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {engineCards.map((card, idx) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setActiveEngineCard(idx)}
                      style={{ borderColor: activeEngineCard === idx ? card.color : undefined }}
                      className={`shrink-0 rounded-xl p-3 text-left border transition-all cursor-pointer w-32 font-mono ${
                        activeEngineCard === idx
                          ? 'bg-[#0E1526] shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                          : 'bg-[#0E1526]/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        {card.badge}
                      </div>
                      <div className="text-sm font-bold text-white mt-1" style={{ color: card.color }}>
                        {card.metric}
                      </div>
                      <div className="text-[10px] text-slate-300 truncate">
                        {card.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Tool Frame */}
              <div className="rounded-xl border border-slate-800 bg-[#0E1526] p-3 font-mono">
                <div className="flex gap-2.5">
                  <div className="flex flex-col gap-1 shrink-0 bg-[#0B101D] p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('inspect')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeToolTab === 'inspect' ? 'bg-[#06B6D4] text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Telemetry Inspector"
                    >
                      <Crop className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('vitals')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeToolTab === 'vitals' ? 'bg-[#06B6D4] text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Core Web Vitals"
                    >
                      <Activity className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('secops')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeToolTab === 'secops' ? 'bg-[#06B6D4] text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                      title="SecOps"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('api')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        activeToolTab === 'api' ? 'bg-[#06B6D4] text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                      title="API"
                    >
                      <Cpu className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 rounded-lg bg-[#0B101D] border border-slate-800 p-2.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 mb-2">
                      <span className="truncate max-w-[140px] text-white font-bold">
                        https://catalystlab.tech
                      </span>
                      <span className="text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded text-[10px] font-bold border border-[#00FF66]/30">
                        PRO TRIAL ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-[#0E1526] p-1.5 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400">LCP</div>
                        <div className="text-xs font-bold text-[#00FF66]">0.74s</div>
                      </div>
                      <div className="bg-[#0E1526] p-1.5 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400">CLS</div>
                        <div className="text-xs font-bold text-[#00FF66]">0.001</div>
                      </div>
                      <div className="bg-[#0E1526] p-1.5 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400">QUOTA</div>
                        <div className="text-xs font-bold text-white">5k/day</div>
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
