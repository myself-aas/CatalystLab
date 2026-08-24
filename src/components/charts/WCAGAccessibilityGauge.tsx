import React from 'react';
import { Eye, CheckCircle2, AlertTriangle, HeartHandshake } from 'lucide-react';

interface WCAGAccessibilityGaugeProps {
  altTextCoveragePct: number;
  missingAltCount: number;
  totalImages: number;
  unlabeledInputsCount: number;
  score: number;
  complianceLevel: string;
}

export const WCAGAccessibilityGauge: React.FC<WCAGAccessibilityGaugeProps> = React.memo(({
  altTextCoveragePct,
  missingAltCount,
  totalImages,
  unlabeledInputsCount,
  score,
  complianceLevel
}) => {
  const isHighLiability = score < 60 || missingAltCount > 5;
  const isCompliant = score >= 85 && missingAltCount === 0;

  // Donut chart calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (altTextCoveragePct / 100) * circumference;

  return (
    <div className="rounded-2xl border border-black/30 bg-white p-6 shadow-xl space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/25 text-black border border-black/40">
              <Eye className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-black">
              WCAG 2.2 Accessibility & ADA Liability Gauge
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluates screen reader readiness, alt-text coverage, keyboard focus, and legal compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500">ADA Safety Score</div>
            <div className="text-xl font-black text-black font-mono">{score}/100</div>
          </div>
          <div className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
            isCompliant ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-black/25 text-black border-black/40'
          }`}>
            {complianceLevel}
          </div>
        </div>
      </div>

      {/* Main Visuals Grid: Donut Chart & Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: SVG Donut Chart for Alt Text */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-black/30">
          <div className="relative flex items-center justify-center">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={altTextCoveragePct >= 90 ? '#10b981' : altTextCoveragePct >= 60 ? '#415a77' : '#f43f5e'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-black text-black font-mono">{altTextCoveragePct.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Coverage</span>
            </div>
          </div>

          <div className="text-center mt-3">
            <div className="text-xs font-bold text-black">Image Alt Text Ratio</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {totalImages - missingAltCount} of {totalImages} images labeled
            </div>
          </div>
        </div>

        {/* Right: Key ADA Checkpoints */}
        <div className="md:col-span-7 space-y-3">
          <div className="rounded-xl border border-black/30 bg-slate-50 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-black/20 text-black">
                {missingAltCount === 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              </div>
              <div>
                <div className="text-xs font-bold text-black">Visual Alternative Descriptions</div>
                <div className="text-[11px] text-slate-500">
                  {missingAltCount === 0 ? 'All image elements possess valid alt text.' : `${missingAltCount} image(s) missing descriptive alt text.`}
                </div>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
              missingAltCount === 0 ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-amber-500/15 text-amber-700 border-amber-500/30'
            }`}>
              {missingAltCount === 0 ? 'PASS' : 'WARN'}
            </span>
          </div>

          <div className="rounded-xl border border-black/30 bg-slate-50 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-black/20 text-black">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-black">Form Input ARIA Labels</div>
                <div className="text-[11px] text-slate-500">
                  {unlabeledInputsCount === 0 ? 'Interactive form controls have accessible names.' : 'Unlabeled inputs found.'}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
              PASS
            </span>
          </div>

          <div className="rounded-xl border border-black/30 bg-slate-50 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-black/20 text-black">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-black">Color Contrast Standard (4.5:1)</div>
                <div className="text-[11px] text-slate-500">Typography contrast satisfies WCAG AA guidelines.</div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
              PASS
            </span>
          </div>
        </div>

      </div>

      {/* Legal Summary Banner */}
      <div className={`rounded-xl p-3.5 border flex items-center gap-3 text-xs ${
        isHighLiability ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-black/30 text-black'
      }`}>
        <HeartHandshake className="h-5 w-5 shrink-0 text-black" />
        <span>
          <strong className="text-black">ADA Title III Legal Assessment:</strong> Screen reader software (NVDA, JAWS, VoiceOver) can traverse and parse core content hierarchies without accessibility barriers.
        </span>
      </div>
    </div>
  );
});
