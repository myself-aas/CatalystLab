import React, { useState } from 'react';
import { 
  Calculator, 
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
    <div className="space-y-8 rounded-xl border border-border bg-surface p-6 text-foreground sm:p-8">
      {/* Title Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Calculator className="size-5 text-muted-foreground" aria-hidden="true" />
            Estimate the time you would save
          </h3>
          <p className="max-w-xl text-sm text-muted-foreground">
            An estimate, not a forecast. It assumes 6.5 engineer-hours saved per monitored
            domain and 3 hours per 50,000 scans, at $95 an hour.
          </p>
        </div>

        <div className="shrink-0 rounded-lg border border-border bg-background px-4 py-2.5 text-right">
          <span className="block text-sm text-muted-foreground">Estimated value</span>
          <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
            ${annualDollarSavings.toLocaleString()}/yr
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Inputs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Slider 1: Scans per month */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="roi-slider-probes" className="text-foreground font-bold flex items-center gap-1.5 cursor-pointer">
                <Zap className="size-3.5 text-muted-foreground" aria-hidden="true" />
                Scans per month
              </label>
              <span className="font-mono text-foreground">
                {monthlyProbes.toLocaleString()}
              </span>
            </div>
            <input
              id="roi-slider-probes"
              type="range"
              min={10000}
              max={2500000}
              step={10000}
              value={monthlyProbes}
              aria-label="Scans per month"
              aria-valuemin={10000}
              aria-valuemax={2500000}
              aria-valuenow={monthlyProbes}
              aria-valuetext={`${monthlyProbes.toLocaleString()} probes per month`}
              onChange={(e) => setMonthlyProbes(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10k</span>
              <span>500k</span>
              <span>2.5M</span>
            </div>
          </div>

          {/* Slider 2: Monitored domains */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="roi-slider-domains" className="text-foreground font-bold flex items-center gap-1.5 cursor-pointer">
                <Sliders className="size-3.5 text-muted-foreground" aria-hidden="true" />
                Monitored domains
              </label>
              <span className="font-mono text-foreground">{productionDomains}</span>
            </div>
            <input
              id="roi-slider-domains"
              type="range"
              min={1}
              max={50}
              step={1}
              value={productionDomains}
              aria-label="Monitored domains"
              aria-valuemin={1}
              aria-valuemax={50}
              aria-valuenow={productionDomains}
              aria-valuetext={`${productionDomains} domains`}
              onChange={(e) => setProductionDomains(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
              <span>50</span>
            </div>
          </div>

          {/* Slider 3: Team seats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="roi-slider-seats" className="text-foreground font-bold flex items-center gap-1.5 cursor-pointer">
                <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
                Team seats
              </label>
              <span className="font-mono text-foreground">{engineerSeats}</span>
            </div>
            <input
              id="roi-slider-seats"
              type="range"
              min={1}
              max={30}
              step={1}
              value={engineerSeats}
              aria-label="Team seats"
              aria-valuemin={1}
              aria-valuemax={30}
              aria-valuenow={engineerSeats}
              aria-valuetext={`${engineerSeats} seats`}
              onChange={(e) => setEngineerSeats(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 seat</span>
              <span>10 seats</span>
              <span>30+ seats</span>
            </div>
          </div>
        </div>

        {/* Estimate */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Metric 1 */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
                Hours saved
              </div>
              <div className="text-xl font-extrabold text-foreground font-mono">
                {hoursSavedPerMonth} hrs<span className="text-xs text-muted-foreground font-normal">/mo</span>
              </div>
              <div className="text-xs text-muted-foreground">at $95 per hour</div>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
                Incidents avoided
              </div>
              <div className="text-xl font-extrabold text-foreground font-mono">
                ~{incidentsPreventedPerYear} incidents<span className="text-xs text-muted-foreground font-normal">/yr</span>
              </div>
              <div className="text-xs text-muted-foreground">3.2 per monitored domain</div>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                <Leaf className="size-3.5 text-success" aria-hidden="true" />
                Carbon avoided
              </div>
              <div className="text-xl font-extrabold text-foreground font-mono">
                {carbonAvoidedKg} kg<span className="text-xs text-muted-foreground font-normal"> CO2e/yr</span>
              </div>
              <div className="text-xs text-muted-foreground">at 475 g CO₂e per kWh</div>
            </div>

            {/* Metric 4 */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                <DollarSign className="size-3.5 text-warning" aria-hidden="true" />
                Value per engineer
              </div>
              <div className="text-xl font-extrabold text-foreground font-mono">
                {Math.round((annualDollarSavings / (engineerSeats * 120000)) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">of a $120k salary</div>
            </div>
          </div>

          {/* Recommended Plan Match Box */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Cheapest plan that covers these inputs
              </div>
              <div className="mt-0.5 text-base font-semibold text-foreground">
                {planName}{' '}
                <span className="font-mono text-sm font-normal text-muted-foreground">({planPrice})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyPlan}
              className="ds-btn ds-btn-primary h-11 w-full text-sm sm:w-auto"
            >
              <span>Continue with {planName}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
