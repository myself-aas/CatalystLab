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
import { TelemetrySwatchCard } from '../cards/content/TelemetrySwatchCard';
import { EnzymeHue } from '../cards/types';
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
      className="relative overflow-hidden bg-background py-24 sm:py-32 border-b border-border text-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN */}
          <LazyReveal direction="left" className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-sans font-bold text-indigo-700 shadow-sm">
              <Terminal className="w-3.5 h-3.5" />
              <span>AUDIT. AUTOMATE. OPTIMIZE.</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>

            <h2 className="framer-section-headline text-foreground">
              Audit, monitor, <br className="hidden sm:inline" />
              &amp; scale your stack
            </h2>

            <p className="framer-body-text max-w-lg">
              Less guesswork, more speed. With CatalystLab Pro and Team, eliminate blindspots with 8 concurrent diagnostic engines, automated 24/7 cron audits, full REST API telemetry, and instant webhook alerts — all in one unified workspace.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  id="trial-section-start-btn"
                  onClick={() => openTrialModal('pro')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 py-3.5 text-sm font-sans font-bold text-primary-foreground shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Start 7-Day Free Trial</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-border px-5 py-3.5 text-sm font-sans font-bold text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                >
                  <span>Compare Plans</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans font-bold pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Try any CatalystLab plan free for 7 days. No credit card required.</span>
              </div>
            </div>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-border text-sm font-sans font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>8 Parallel Engines</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>5,000 Units/Day Quota</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Automated 6h Cron Audits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Instant API &amp; Webhooks</span>
              </div>
            </div>

          </LazyReveal>

          {/* RIGHT COLUMN */}
          <LazyReveal direction="right" className="lg:col-span-7 relative">
            <div className="relative min-h-[440px] sm:min-h-[480px] w-full rounded-3xl border border-border bg-muted p-6 sm:p-8 shadow-xl overflow-hidden">
              
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5 mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-sans font-bold text-muted-foreground shadow-sm">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Auto-Audit Cron: 10:00 UTC</span>
                </div>

                <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border text-xs font-sans shadow-sm">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider">HEALTH INDEX:</span>
                  <span className="font-bold text-emerald-600">99.4/100</span>
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="w-full sm:w-[65%] rounded-xl border border-border bg-background p-4 mb-5 font-mono shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span>Continuous Cron Log</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shadow-sm">
                    24/7 Active
                  </span>
                </div>

                <div className="space-y-2 text-[11px] font-sans font-medium">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted border border-border">
                    <span className="text-muted-foreground">10:00 AM • Core Web Vitals</span>
                    <span className="text-emerald-600 font-bold">18ms TTFB</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted border border-border">
                    <span className="text-muted-foreground">12:00 PM • OWASP Transport</span>
                    <span className="text-indigo-600 font-bold">Grade A+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted border border-border">
                    <span className="text-muted-foreground">02:00 PM • AI Search RAG</span>
                    <span className="text-purple-600 font-bold">100% Ready</span>
                  </div>
                </div>
              </div>

              {/* Swatch Engine Selector */}
              <div className="space-y-3 mb-5">
                <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
                  Active Telemetry Swatches
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {engineCards.map((card, idx) => {
                    const hues: EnzymeHue[] = ['vitalzyme', 'edgevmax', 'riskprotease', 'llmkinase', 'ecoholo'];
                    const cardHue = hues[idx % hues.length];
                    return (
                      <div key={card.id} className="shrink-0 w-40">
                        <TelemetrySwatchCard
                          id={`swatch-${card.id}`}
                          title={card.title}
                          badge={card.badge}
                          mainMetric={card.metric}
                          detail={card.detail}
                          hue={cardHue}
                          isActive={activeEngineCard === idx}
                          onClick={() => setActiveEngineCard(idx)}
                          miniStats={[
                            { label: 'SLA', value: '99.9%' },
                            { label: 'PoPs', value: '42' }
                          ]}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Tool Frame - Responsive Layout */}
              <div className="rounded-xl border border-border bg-background p-4 font-sans shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Tabs - Responsive Row/Column */}
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0 bg-muted p-1.5 rounded-xl border border-border shadow-inner overflow-x-auto sm:overflow-visible">
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('inspect')}
                      className={`p-2.5 rounded-lg text-xs transition-all flex items-center gap-2 ${
                        activeToolTab === 'inspect' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                      title="Telemetry Inspector"
                    >
                      <Crop className="h-4 w-4" />
                      <span className="hidden md:inline font-bold">Inspector</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('vitals')}
                      className={`p-2.5 rounded-lg text-xs transition-all flex items-center gap-2 ${
                        activeToolTab === 'vitals' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                      title="Core Web Vitals"
                    >
                      <Activity className="h-4 w-4" />
                      <span className="hidden md:inline font-bold">Vitals</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('secops')}
                      className={`p-2.5 rounded-lg text-xs transition-all flex items-center gap-2 ${
                        activeToolTab === 'secops' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                      title="SecOps"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span className="hidden md:inline font-bold">SecOps</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('api')}
                      className={`p-2.5 rounded-lg text-xs transition-all flex items-center gap-2 ${
                        activeToolTab === 'api' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                      title="API"
                    >
                      <Cpu className="h-4 w-4" />
                      <span className="hidden md:inline font-bold">API</span>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 rounded-xl bg-muted border border-border p-3 text-xs shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                      <span className="truncate max-w-[140px] text-foreground font-bold font-mono">
                        https://catalystlab.tech
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200 shadow-sm">
                        PRO TRIAL ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-background p-2 rounded-lg border border-border shadow-sm">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">LCP</div>
                        <div className="text-xs font-bold text-emerald-600 font-mono">0.74s</div>
                      </div>
                      <div className="bg-background p-2 rounded-lg border border-border shadow-sm">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">CLS</div>
                        <div className="text-xs font-bold text-emerald-600 font-mono">0.001</div>
                      </div>
                      <div className="bg-background p-2 rounded-lg border border-border shadow-sm">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">QUOTA</div>
                        <div className="text-xs font-bold text-foreground font-mono">5k/day</div>
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
