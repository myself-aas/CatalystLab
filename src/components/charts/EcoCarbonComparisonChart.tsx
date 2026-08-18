import React, { useState } from 'react';
import { Leaf, Trees, Wind, Award, Zap } from 'lucide-react';

interface EcoCarbonComparisonChartProps {
  rating: string;
  color: string;
  emissionsPerVisitGrams: number;
  monthly10kKg: number;
  pageWeightMb: number;
  treesEquivalentYearly: number;
}

export const EcoCarbonComparisonChart: React.FC<EcoCarbonComparisonChartProps> = ({
  rating,
  color,
  emissionsPerVisitGrams,
  monthly10kKg,
  pageWeightMb,
  treesEquivalentYearly
}) => {
  const [trafficMultiplier, setTrafficMultiplier] = useState<number>(10000);

  const calculatedMonthlyKg = parseFloat(((emissionsPerVisitGrams * trafficMultiplier) / 1000).toFixed(2));
  const calculatedYearlyKg = parseFloat((calculatedMonthlyKg * 12).toFixed(2));
  const calculatedTrees = parseFloat((calculatedYearlyKg / 21.77).toFixed(1));

  const globalAvgPerVisit = 0.85; // Global median web page
  const cleanTargetPerVisit = 0.20; // High efficiency target

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Leaf className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Sustainable Web Design (SWD) Eco-Carbon Footprint
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard SWD v3 model calculation (0.81 kWh/GB energy transfer @ 442g CO2/kWh grid intensity).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">Carbon Rating</div>
            <div className="text-xl font-black text-emerald-400 font-mono">Grade [{rating}]</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black text-xl">
            {rating}
          </div>
        </div>
      </div>

      {/* Comparative Benchmark Bar Chart */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-300">Emissions per Page View Benchmark (grams CO2e)</div>
        
        <div className="space-y-3">
          {/* Target Site */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-emerald-300">This Target Page (Estimated ~{pageWeightMb} MB payload)</span>
              <span className="font-mono font-bold text-emerald-400">{emissionsPerVisitGrams.toFixed(4)} g CO2e</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (emissionsPerVisitGrams / 1.5) * 100)}%` }}
              />
            </div>
          </div>

          {/* Clean Target */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300">Sustainable Web Green Target</span>
              <span className="font-mono text-slate-400">{cleanTargetPerVisit.toFixed(2)} g CO2e</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${(cleanTargetPerVisit / 1.5) * 100}%` }}
              />
            </div>
          </div>

          {/* Global Average */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Global Average Web Page (2.2 MB median)</span>
              <span className="font-mono text-slate-500">{globalAvgPerVisit.toFixed(2)} g CO2e</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-slate-700 rounded-full"
                style={{ width: `${(globalAvgPerVisit / 1.5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Traffic Projection Slider */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-white">Interactive Monthly Traffic Scale</div>
            <div className="text-[11px] text-slate-400">Simulate environmental impact across scaling visitor volumes.</div>
          </div>
          <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            {trafficMultiplier.toLocaleString()} Monthly Visits
          </span>
        </div>

        <input
          type="range"
          min="5000"
          max="500000"
          step="5000"
          value={trafficMultiplier}
          onChange={(e) => setTrafficMultiplier(parseInt(e.target.value))}
          className="w-full accent-emerald-400 cursor-pointer"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Monthly Footprint</div>
            <div className="text-base font-black text-emerald-400 font-mono mt-0.5">{calculatedMonthlyKg} kg CO2e</div>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Annual Extrapolation</div>
            <div className="text-base font-black text-cyan-400 font-mono mt-0.5">{calculatedYearlyKg} kg CO2e/yr</div>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Offset Equivalence</div>
            <div className="text-base font-black text-amber-400 font-mono mt-0.5">{calculatedTrees} Mature Trees</div>
          </div>
        </div>
      </div>
    </div>
  );
};
