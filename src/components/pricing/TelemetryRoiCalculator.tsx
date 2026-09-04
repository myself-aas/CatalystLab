import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Leaf, 
  Clock, 
  ArrowRight,
  Zap,
  Sliders,
  DollarSign
} from 'lucide-react';
import { SubscriptionPlanId } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../data/pricingData';

interface TelemetryRoiCalculatorProps {
  onSelectRecommendedPlan?: (planId: SubscriptionPlanId) => void;
}

export const TelemetryRoiCalculator: React.FC<TelemetryRoiCalculatorProps> = ({ 
  onSelectRecommendedPlan 
}) => {
  const [monthlyProbes, setMonthlyProbes] = useState<number>(250000);
  const [productionDomains, setProductionDomains] = useState<number>(5);
  const [engineerSeats, setEngineerSeats] = useState<number>(8);

  // Dynamic ROI Calculations
  // Baseline manual QA / monitoring debug time per incident: 4.5 hours @ $95/hr engineer cost
  const hoursSavedPerMonth = Math.round(productionDomains * 6.5 + (monthlyProbes / 50000) * 3);
  const annualDollarSavings = Math.round(hoursSavedPerMonth * 12 * 95);
  const incidentsPreventedPerYear = Math.max(2, Math.round(productionDomains * 3.2));
  const carbonAvoidedKg = ((monthlyProbes * 0.00018 * 0.475) / 1000 * 12).toFixed(1);

  // Recommended plan logic
  let recommendedPlan: SubscriptionPlanId = 'pro';

  if (monthlyProbes > 1000000 || productionDomains > 15 || engineerSeats > 15) {
    recommendedPlan = 'enterprise';
  } else if (monthlyProbes > 300000 || productionDomains > 6 || engineerSeats > 5) {
    recommendedPlan = 'team';
  } else if (monthlyProbes < 50000 && productionDomains <= 2 && engineerSeats <= 2) {
    recommendedPlan = 'starter';
  }

  const recommended = SUBSCRIPTION_PLANS[recommendedPlan];
  const planName = recommended.name;
  const planPrice = recommended.priceMonthly > 0 ? `$${recommended.priceMonthly}/mo` : 'Custom';

  const handleApplyPlan = () => {
    if (onSelectRecommendedPlan) {
      onSelectRecommendedPlan(recommendedPlan);
    } else {
      window.dispatchEvent(new CustomEvent('catalyst:open-payment-checkout', { 
        detail: { planId: recommendedPlan } 
      }));
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-muted/10 p-6 sm:p-8 shadow-linear-card space-y-8 font-mono text-foreground backdrop-blur-xl">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent border border-border text-foreground text-xs font-bold">
            <Calculator className="h-3.5 w-3.5" />
            <span>INTERACTIVE ROI SIMULATOR</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-sans">
            Telemetry Efficiency &amp; Cost ROI Calculator
          </h3>
          <p className="text-xs text-muted-foreground font-sans">
            Model engineering hours reclaimed and downtime averted by automating all 8 synthetic diagnostic vectors.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-muted/40 border border-border text-right">
          <span className="text-[10px] text-muted-foreground block uppercase font-bold">Estimated Net Savings</span>
          <span className="text-xl font-extrabold text-foreground font-mono">${annualDollarSavings.toLocaleString()} / yr</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sliders Input Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Slider 1: Monthly Synthetic Probes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="roi-slider-probes" className="text-foreground font-bold flex items-center gap-1.5 cursor-pointer">
                <Zap className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                Monthly Synthetic Probes &amp; Telemetry Calls
              </label>
              <span className="text-foreground font-bold font-mono">
                {monthlyProbes.toLocaleString()} probes/mo
              </span>
            </div>
            <input
              id="roi-slider-probes"
              type="range"
              min={10000}
              max={2500000}
              step={10000}
              value={monthlyProbes}
              aria-label="Monthly Synthetic Probes and Telemetry Calls"
              aria-valuemin={10000}
              aria-valuemax={2500000}
              aria-valuenow={monthlyProbes}
              aria-valuetext={`${monthlyProbes.toLocaleString()} probes per month`}
              onChange={(e) => setMonthlyProbes(Number(e.target.value))}
              className="w-full h-2 bg-muted/40 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>10k (Hobby)</span>
              <span>500k (Pro)</span>
              <span>2.5M+ (Enterprise)</span>
            </div>
          </div>

          {/* Slider 2: Monitored Production Domains */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="roi-slider-domains" className="text-foreground font-bold flex items-center gap-1.5 cursor-pointer">
                <Sliders className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                Active Production Endpoints / Domains
              </label>
              <span className="text-primary font-bold font-mono">
                {productionDomains} domains
              </span>
            </div>
            <input
              id="roi-slider-domains"
              type="range"
              min={1}
              max={50}
              step={1}
              value={productionDomains}
              aria-label="Active Production Endpoints and Domains"
              aria-valuemin={1}
              aria-valuemax={50}
              aria-valuenow={productionDomains}
              aria-valuetext={`${productionDomains} domains`}
              onChange={(e) => setProductionDomains(Number(e.target.value))}
              className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 domain</span>
              <span>10 domains</span>
              <span>50+ domains</span>
            </div>
          </div>

          {/* Slider 3: Engineering Team Seats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="roi-slider-seats" className="text-foreground font-bold flex items-center gap-1.5 cursor-pointer">
                <Clock className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                Engineering &amp; DevOps Seats
              </label>
              <span className="text-indigo-700 font-bold font-mono">
                {engineerSeats} developers
              </span>
            </div>
            <input
              id="roi-slider-seats"
              type="range"
              min={1}
              max={30}
              step={1}
              value={engineerSeats}
              aria-label="Engineering and DevOps Seats"
              aria-valuemin={1}
              aria-valuemax={30}
              aria-valuenow={engineerSeats}
              aria-valuetext={`${engineerSeats} seats`}
              onChange={(e) => setEngineerSeats(Number(e.target.value))}
              className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 seat</span>
              <span>10 seats</span>
              <span>30+ seats</span>
            </div>
          </div>
        </div>

        {/* Dynamic ROI Metrics Output Column (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Metric 1 */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                DevOps Time Saved
              </div>
              <div className="text-xl font-extrabold text-foreground font-mono">
                {hoursSavedPerMonth} hrs<span className="text-xs text-muted-foreground font-normal">/mo</span>
              </div>
              <div className="text-[10px] text-primary font-bold">Automated CI/CD Gates</div>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Outages Prevented
              </div>
              <div className="text-xl font-extrabold text-foreground font-mono">
                ~{incidentsPreventedPerYear} incidents<span className="text-xs text-muted-foreground font-normal">/yr</span>
              </div>
              <div className="text-[10px] text-primary font-bold">Zero client-script errors</div>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                <Leaf className="h-3 w-3 text-emerald-600" />
                Carbon Offset
              </div>
              <div className="text-xl font-extrabold text-foreground font-mono">
                {carbonAvoidedKg} kg<span className="text-xs text-muted-foreground font-normal"> CO2e/yr</span>
              </div>
              <div className="text-[10px] text-primary font-bold">Green Web Protocol</div>
            </div>

            {/* Metric 4 */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-amber-600" />
                Net Productivity
              </div>
              <div className="text-xl font-extrabold text-foreground font-mono">
                {Math.round((annualDollarSavings / (engineerSeats * 120000)) * 100)}%
              </div>
              <div className="text-[10px] text-muted-foreground font-bold">Engineering Velocity</div>
            </div>
          </div>

          {/* Recommended Plan Match Box */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Optimal Plan Recommendation:
              </div>
              <div className="text-base font-extrabold text-foreground mt-0.5">
                {planName} <span className="text-muted-foreground font-normal text-xs">({planPrice})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyPlan}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-linear-cta cursor-pointer text-xs"
            >
              <span>Deploy {planName}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
