import React from 'react';
<<<<<<< HEAD
import { Eye, CheckCircle2, AlertTriangle, HeartHandshake } from 'lucide-react';
=======
import { Eye, CheckCircle2, AlertTriangle, XCircle, HeartHandshake, ShieldAlert } from 'lucide-react';
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

interface WCAGAccessibilityGaugeProps {
  altTextCoveragePct: number;
  missingAltCount: number;
  totalImages: number;
  unlabeledInputsCount: number;
  score: number;
  complianceLevel: string;
}

export const WCAGAccessibilityGauge: React.FC<WCAGAccessibilityGaugeProps> = ({
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
<<<<<<< HEAD
    <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-6 shadow-xl space-y-6 text-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40">
              <Eye className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[#f8fafc]">
              WCAG 2.2 Accessibility & ADA Liability Gauge
            </h3>
          </div>
          <p className="text-xs text-[#c5d3e8] mt-1">
=======
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              WCAG 2.2 Accessibility & ADA Liability Gauge
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Evaluates screen reader readiness, alt-text coverage, keyboard focus, and legal compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
<<<<<<< HEAD
            <div className="text-xs font-semibold text-[#c5d3e8]">ADA Safety Score</div>
            <div className="text-xl font-black text-[#c5d3e8] font-mono">{score}/100</div>
          </div>
          <div className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
            isCompliant ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[#415a77]/25 text-[#c5d3e8] border-[#415a77]/40'
=======
            <div className="text-xs font-semibold text-slate-400">ADA Safety Score</div>
            <div className="text-xl font-black text-indigo-400 font-mono">{score}/100</div>
          </div>
          <div className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
            isCompliant ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          }`}>
            {complianceLevel}
          </div>
        </div>
      </div>

      {/* Main Visuals Grid: Donut Chart & Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: SVG Donut Chart for Alt Text */}
<<<<<<< HEAD
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-[#152238] border border-[#415a77]/30">
=======
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          <div className="relative flex items-center justify-center">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={radius}
<<<<<<< HEAD
                stroke="#0b192c"
=======
                stroke="#1e293b"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
<<<<<<< HEAD
                stroke={altTextCoveragePct >= 90 ? '#10b981' : altTextCoveragePct >= 60 ? '#415a77' : '#f43f5e'}
=======
                stroke={altTextCoveragePct >= 90 ? '#10b981' : altTextCoveragePct >= 60 ? '#f59e0b' : '#f43f5e'}
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
<<<<<<< HEAD
              <span className="text-xl font-black text-[#f8fafc] font-mono">{altTextCoveragePct.toFixed(0)}%</span>
              <span className="text-[10px] text-[#c5d3e8] uppercase tracking-wider font-semibold">Coverage</span>
=======
              <span className="text-xl font-black text-white font-mono">{altTextCoveragePct.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Coverage</span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            </div>
          </div>

          <div className="text-center mt-3">
<<<<<<< HEAD
            <div className="text-xs font-bold text-[#f8fafc]">Image Alt Text Ratio</div>
            <div className="text-[11px] text-[#c5d3e8] mt-0.5">
=======
            <div className="text-xs font-bold text-slate-200">Image Alt Text Ratio</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              {totalImages - missingAltCount} of {totalImages} images labeled
            </div>
          </div>
        </div>

        {/* Right: Key ADA Checkpoints */}
        <div className="md:col-span-7 space-y-3">
<<<<<<< HEAD
          <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b192c] text-[#c5d3e8]">
                {missingAltCount === 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-[#c5d3e8]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#f8fafc]">Visual Alternative Descriptions</div>
                <div className="text-[11px] text-[#c5d3e8]">
=======
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-300">
                {missingAltCount === 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Visual Alternative Descriptions</div>
                <div className="text-[11px] text-slate-400">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                  {missingAltCount === 0 ? 'All image elements possess valid alt text.' : `${missingAltCount} image(s) missing descriptive alt text.`}
                </div>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
<<<<<<< HEAD
              missingAltCount === 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[#415a77]/25 text-[#c5d3e8] border-[#415a77]/40'
=======
              missingAltCount === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            }`}>
              {missingAltCount === 0 ? 'PASS' : 'WARN'}
            </span>
          </div>

<<<<<<< HEAD
          <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b192c] text-[#c5d3e8]">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#f8fafc]">Form Input ARIA Labels</div>
                <div className="text-[11px] text-[#c5d3e8]">
=======
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Form Input ARIA Labels</div>
                <div className="text-[11px] text-slate-400">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                  {unlabeledInputsCount === 0 ? 'Interactive form controls have accessible names.' : 'Unlabeled inputs found.'}
                </div>
              </div>
            </div>
<<<<<<< HEAD
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
=======
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              PASS
            </span>
          </div>

<<<<<<< HEAD
          <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b192c] text-[#c5d3e8]">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#f8fafc]">Color Contrast Standard (4.5:1)</div>
                <div className="text-[11px] text-[#c5d3e8]">Typography contrast satisfies WCAG AA guidelines.</div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
=======
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Color Contrast Standard (4.5:1)</div>
                <div className="text-[11px] text-slate-400">Typography contrast satisfies WCAG AA guidelines.</div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              PASS
            </span>
          </div>
        </div>

      </div>

      {/* Legal Summary Banner */}
      <div className={`rounded-xl p-3.5 border flex items-center gap-3 text-xs ${
<<<<<<< HEAD
        isHighLiability ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-[#415a77]/20 border-[#415a77]/40 text-[#c5d3e8]'
      }`}>
        <HeartHandshake className="h-5 w-5 shrink-0 text-[#c5d3e8]" />
        <span>
          <strong className="text-[#f8fafc]">ADA Title III Legal Assessment:</strong> Screen reader software (NVDA, JAWS, VoiceOver) can traverse and parse core content hierarchies without accessibility barriers.
=======
        isHighLiability ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
      }`}>
        <HeartHandshake className="h-5 w-5 shrink-0 text-indigo-400" />
        <span>
          <strong>ADA Title III Legal Assessment:</strong> Screen reader software (NVDA, JAWS, VoiceOver) can traverse and parse core content hierarchies without accessibility barriers.
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        </span>
      </div>
    </div>
  );
};
