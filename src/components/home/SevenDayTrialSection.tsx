import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Bot, 
  Check, 
  Clock, 
  BarChart3, 
  Layers, 
  Crop, 
  Sliders, 
  Play, 
  MousePointer, 
  CheckCircle2,
  Lock,
  Globe,
  Flame,
  LineChart
} from 'lucide-react';
import { LazyReveal } from '../common/LazyAnimate';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';

export const SevenDayTrialSection: React.FC = () => {
  const { openTrialModal, isTrialActive, trialDaysRemaining } = useSubscription();
  const { user } = useAuth();

  // Interactive state for the telemetry fan cards in the right visual stage
  const [activeEngineCard, setActiveEngineCard] = useState<number>(0);
  const [activeToolTab, setActiveToolTab] = useState<'inspect' | 'vitals' | 'secops' | 'api'>('vitals');

  const engineCards = [
    {
      id: 0,
      title: 'Core Web Vitals',
      metric: '99.4/100',
      detail: 'TTFB: 14ms • LCP: 0.72s',
      color: 'from-emerald-500 to-teal-600',
      bgClass: 'bg-emerald-500',
      borderClass: 'border-emerald-400/40',
      badge: 'Speed Index'
    },
    {
      id: 1,
      title: 'Edge Anycast',
      metric: '18ms TTFB',
      detail: '42 Global Edge PoPs',
      color: 'from-cyan-500 to-blue-600',
      bgClass: 'bg-cyan-500',
      borderClass: 'border-cyan-400/40',
      badge: 'DNS & Latency'
    },
    {
      id: 2,
      title: 'AI Search RAG',
      metric: '100% LLMO',
      detail: '/llms.txt + Schema JSON-LD',
      color: 'from-purple-500 to-indigo-600',
      bgClass: 'bg-purple-500',
      borderClass: 'border-purple-400/40',
      badge: 'AI Crawler'
    },
    {
      id: 3,
      title: 'OWASP Zero-Trust',
      metric: 'Grade A+',
      detail: 'TLS 1.3 • Strict CSP & HSTS',
      color: 'from-rose-500 to-pink-600',
      bgClass: 'bg-rose-500',
      borderClass: 'border-rose-400/40',
      badge: 'SecOps'
    },
    {
      id: 4,
      title: 'Green Web Carbon',
      metric: '0.08g CO2',
      detail: 'SWD v4 Model Certified',
      color: 'from-amber-400 to-orange-500',
      bgClass: 'bg-amber-500',
      borderClass: 'border-amber-400/40',
      badge: 'Eco Score'
    }
  ];

  return (
    <section 
      id="7-day-free-trial-section"
      className="relative overflow-hidden bg-brand-navy py-16 sm:py-24 border-t border-b border-brand-slate/30 text-white"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-brand-cyan/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-indigo-600/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Clean, High-Impact Editorial Copy & CTA     */}
          {/* ========================================================= */}
          <LazyReveal direction="left" className="lg:col-span-5 space-y-6">
            
            {/* Eyebrow / Kicker (Matching Later's POST. EARN. REPEAT. style) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-brand-cyan uppercase">
                AUDIT. AUTOMATE. OPTIMIZE.
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
              Audit, monitor, <br className="hidden sm:inline" />
              &amp; scale your stack
            </h2>

            {/* Clean, persuasive description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              Less guesswork, more speed. With CatalystLab Pro and Team, eliminate blindspots with 8 concurrent diagnostic engines, automated 24/7 cron audits, full REST API telemetry, and instant webhook alerts — all in one unified workspace.
            </p>

            {/* Primary Action Button & Subtext */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openTrialModal('pro')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-cyan px-7 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <span>Start 7-Day Free Trial</span>
                  <ChevronRight className="h-4 w-4 stroke-[3]" />
                </button>

                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-slate/40 bg-brand-surface/60 px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:border-brand-cyan/50 hover:bg-brand-surface transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <span>Compare Plans</span>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-cyan" />
                </Link>
              </div>

              {/* Subtext directly under the button */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Try any CatalystLab plan free for 7 days. No credit card required.</span>
              </div>
            </div>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-brand-slate/30 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand-cyan shrink-0" />
                <span>8 Parallel Engines</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand-cyan shrink-0" />
                <span>5,000 Units/Day Quota</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand-cyan shrink-0" />
                <span>Automated 6h Cron Audits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand-cyan shrink-0" />
                <span>Instant API &amp; Webhooks</span>
              </div>
            </div>

          </LazyReveal>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Layered Interactive Visual Stage (Later Style) */}
          {/* ========================================================= */}
          <LazyReveal direction="right" className="lg:col-span-7 relative">
            
            {/* Visual stage frame with subtle glowing borders */}
            <div className="relative min-h-[460px] sm:min-h-[500px] w-full rounded-3xl border border-brand-slate/40 bg-gradient-to-br from-[#0c1c33]/90 via-[#07111e]/95 to-[#0b172a]/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
              
              {/* Background grid dots */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* ------------------------------------------------------------- */}
              {/* 1. TOP FLOATING PILL: Auto-Audit Cron Trigger                */}
              {/* ------------------------------------------------------------- */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-[#07111e]/95 px-3.5 py-1.5 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur-md">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span>Auto-Audit Cron</span>
                  </span>
                  <span className="h-3 w-[1px] bg-slate-700" />
                  <span className="font-mono text-[11px] text-cyan-300">11/02 10:00 UTC</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 2. TOP RIGHT CIRCULAR BADGE / AVATAR STATUS                   */}
              {/* ------------------------------------------------------------- */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2.5">
                <div className="relative group">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-emerald-400 shadow-lg">
                    <div className="h-full w-full rounded-full bg-[#0b192c] flex flex-col items-center justify-center text-center p-1 overflow-hidden">
                      <span className="text-[10px] font-mono font-bold text-slate-400 leading-none">SCORE</span>
                      <span className="text-base sm:text-lg font-black text-emerald-400 leading-tight">99.4</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[#07111e] rounded-full p-1 border-2 border-[#07111e]">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 3. CALENDAR & SCHEDULE WORKSPACE CARD (Top Left / Background) */}
              {/* ------------------------------------------------------------- */}
              <div className="relative mt-12 sm:mt-14 w-full sm:w-[58%] rounded-2xl border border-slate-800 bg-[#0f213d]/90 p-3.5 sm:p-4 shadow-xl z-10 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs font-bold text-white font-mono">Oct 31 – Nov 05</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    24/7 Active
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-[#07111e]/80 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[10px] w-12">10:00 AM</span>
                      <span className="font-bold text-white">Core Web Vitals</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">18ms TTFB</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-[#07111e]/80 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[10px] w-12">12:00 PM</span>
                      <span className="font-bold text-white">OWASP Transport</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">Grade A+</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-[#07111e]/80 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[10px] w-12">02:00 PM</span>
                      <span className="font-bold text-white">AI Search RAG</span>
                    </div>
                    <span className="font-mono text-purple-400 font-bold">100% Ready</span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 4. CENTER INTERACTIVE FANNED ENGINE CARDS & HAND CURSOR       */}
              {/* ------------------------------------------------------------- */}
              <div className="relative mt-4 sm:-mt-10 sm:ml-28 z-20">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Diagnostic Streams
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">(Interactive Swatches)</span>
                </div>

                {/* Layered Fan of Cards */}
                <div className="relative flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {engineCards.map((card, idx) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setActiveEngineCard(idx)}
                      className={`relative shrink-0 rounded-xl p-3 text-left transition-all duration-300 cursor-pointer shadow-lg ${
                        activeEngineCard === idx
                          ? 'scale-105 ring-2 ring-cyan-400 shadow-cyan-500/30 -translate-y-1'
                          : 'opacity-85 hover:opacity-100 hover:-translate-y-0.5'
                      } ${card.bgClass} text-white w-32 sm:w-36`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-wider bg-black/30 px-1.5 py-0.5 rounded font-bold">
                          {card.badge}
                        </span>
                        {activeEngineCard === idx && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="text-base sm:text-lg font-black mt-2 leading-tight">
                        {card.metric}
                      </div>
                      <div className="text-[10px] opacity-90 truncate mt-0.5">
                        {card.title}
                      </div>
                    </button>
                  ))}

                  {/* Interactive Cursor Indicator (Hand pointer like Later design) */}
                  <div className="hidden sm:flex absolute -top-5 left-36 z-30 pointer-events-none items-center gap-1.5 bg-[#07111e]/90 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-400/40 text-[10px] font-mono shadow-xl animate-bounce">
                    <MousePointer className="h-3 w-3 text-cyan-400 fill-cyan-400" />
                    <span>Select Engine</span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 5. VERTICAL METRIC BAR GRAPH (Violet & Cyan Later style)     */}
              {/* ------------------------------------------------------------- */}
              <div className="absolute top-28 right-4 sm:top-24 sm:right-28 z-10 flex items-end gap-1.5 bg-[#07111e]/80 border border-slate-800 p-2.5 rounded-xl shadow-lg">
                <div className="w-2.5 h-6 rounded-t bg-purple-500" />
                <div className="w-2.5 h-10 rounded-t bg-indigo-500" />
                <div className="w-2.5 h-14 rounded-t bg-cyan-400 animate-pulse" />
                <div className="w-2.5 h-8 rounded-t bg-emerald-400" />
                <span className="text-[9px] font-mono text-cyan-300 font-bold ml-1">4.8x</span>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 6. TELEMETRY DOODLE / GUARANTEE ACCENT (Bottom Left)          */}
              {/* ------------------------------------------------------------- */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 z-20 flex items-center gap-2 bg-[#0b172a]/90 border border-pink-500/30 px-3 py-1.5 rounded-xl text-pink-400 shadow-lg">
                <Flame className="h-3.5 w-3.5 text-pink-400" />
                <span className="text-[11px] font-mono font-bold">$0 for 7 Days</span>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 7. BOTTOM RIGHT INTERACTIVE INSPECTOR & WORKSPACE TOOL PANEL  */}
              {/* ------------------------------------------------------------- */}
              <div className="mt-6 sm:mt-0 sm:absolute sm:bottom-6 sm:right-6 z-20 w-full sm:w-[62%] rounded-2xl border border-slate-700/80 bg-[#07111e]/95 p-3.5 shadow-2xl backdrop-blur-xl">
                <div className="flex gap-3">
                  
                  {/* Left Inspector Tools Bar (Crop / Filter / Vitals / API) */}
                  <div className="flex flex-col gap-1.5 shrink-0 bg-[#0b192c] p-1.5 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('inspect')}
                      className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                        activeToolTab === 'inspect'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Telemetry Inspector"
                    >
                      <Crop className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveToolTab('vitals')}
                      className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                        activeToolTab === 'vitals'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Core Web Vitals"
                    >
                      <Activity className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveToolTab('secops')}
                      className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                        activeToolTab === 'secops'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="SecOps Sandbox"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveToolTab('api')}
                      className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                        activeToolTab === 'api'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="REST API Key"
                    >
                      <Cpu className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Right Viewport Mockup with cyan crop/selection frame */}
                  <div className="relative flex-1 rounded-xl bg-[#091526] border border-cyan-500/40 p-3 overflow-hidden">
                    
                    {/* Bounding box handles (like in Later's photo frame) */}
                    <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />

                    <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono mb-2">
                      <span className="truncate max-w-[140px] text-cyan-300 font-bold">
                        https://catalystlab.tech
                      </span>
                      <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold">
                        PRO TRIAL ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                      <div className="bg-[#07111e] p-1.5 rounded-lg border border-slate-800">
                        <div className="text-[9px] text-slate-400">LCP</div>
                        <div className="text-xs font-bold text-emerald-400">0.74s</div>
                      </div>
                      <div className="bg-[#07111e] p-1.5 rounded-lg border border-slate-800">
                        <div className="text-[9px] text-slate-400">CLS</div>
                        <div className="text-xs font-bold text-emerald-400">0.001</div>
                      </div>
                      <div className="bg-[#07111e] p-1.5 rounded-lg border border-slate-800">
                        <div className="text-[9px] text-slate-400">QUOTA</div>
                        <div className="text-xs font-bold text-cyan-300">5k/day</div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800/80">
                      <span>Telemetry Channel: WebSocket 100-PoP</span>
                      <span className="text-emerald-400 font-bold">0-RTT OK</span>
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
