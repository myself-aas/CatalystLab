import React from 'react';
import { Leaf, CheckCircle2, ShieldCheck, Zap, Globe, BarChart3 } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const EcoHoloDoc: React.FC = () => {
  const toc = [
    { id: 'ecoholo-overview', title: 'Phase 3: EcoHolo Overview' },
    { id: 'swd-formula', title: 'Sustainable Web Design (SWD v4) Formula' },
    { id: 'carbon-thresholds', title: 'Carbon Rating Thresholds' },
    { id: 'green-hosting', title: 'Green Web Foundation Verification' },
  ];

  return (
    <DocsLayout
      title="3. EcoHolo (SDLC Phase 3) — Sustainable Web Carbon Footprint"
      description="Sustainable Web Design Model v4 calculation, greenhouse gas emissions per page view, and renewable energy hosting verification."
      canonicalPath="/docs/ecoholo"
      toc={toc}
    >
      <section id="ecoholo-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800">
          <Leaf className="h-3.5 w-3.5" />
          <span>SDLC Phase 3: Carbon Footprint Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          EcoHolo: Sustainable Web & Carbon Audit Engine
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          EcoHolo measures the environmental impact of web endpoints using the Sustainable Web Design (SWD) Model v4 standard. It quantifies data transfer energy consumption (kWh), estimates greenhouse gas emissions (g CO2 per page view), and queries the Green Web Foundation API to verify renewable energy usage.
        </p>
      </section>

      {/* SWD Formula */}
      <section id="swd-formula" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">SWD Model v4 Mathematical Calculation</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          The SWD v4 algorithm divides digital energy into four operational segments: data center (15%), network transmission (14%), user device (52%), and hardware manufacturing embodied carbon (19%):
        </p>

        <CodeSnippet
          title="SWD v4 Carbon Calculation (engine/ecoholo.ts)"
          language="typescript"
          code={`// SWD v4 Carbon Calculus Constants
const KWH_PER_GB = 0.812; // Operational energy per gigabyte transferred
const GLOBAL_CARBON_INTENSITY = 442; // g CO2 per kWh (Global average grid)
const RENEWABLE_CARBON_INTENSITY = 50; // g CO2 per kWh (Certified Green Hosting)
const FIRST_VISIT_CACHE_RATIO = 0.75; // Initial download weight
const RETURNING_VISIT_CACHE_RATIO = 0.25; // Repeat cached download weight

export function calculateCarbonEmissions(bytesTransferred: number, isGreenHosted: boolean) {
  const gigabytes = bytesTransferred / (1024 * 1024 * 1024);
  const adjustedGb = (gigabytes * FIRST_VISIT_CACHE_RATIO) + (gigabytes * 0.02 * RETURNING_VISIT_CACHE_RATIO);
  
  const energyKwh = adjustedGb * KWH_PER_GB;
  const intensity = isGreenHosted ? RENEWABLE_CARBON_INTENSITY : GLOBAL_CARBON_INTENSITY;
  const co2GramsPerView = energyKwh * intensity;

  return {
    energyKwh,
    co2GramsPerView: parseFloat(co2GramsPerView.toFixed(3)),
    isCleanerThanAverage: co2GramsPerView < 0.50
  };
}`}
        />
      </section>

      {/* Carbon Rating Thresholds */}
      <section id="carbon-thresholds" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Carbon Rating Thresholds (A+ to F)</h2>
        <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Rating Tier</th>
                <th className="py-2.5 px-3">Grams CO2 / Page Load</th>
                <th className="py-2.5 px-3">Benchmark Comparison</th>
                <th className="py-2.5 px-3">Target Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
              <tr>
                <td className="py-2 px-3 font-bold text-emerald-700">A+ (Eco Elite)</td>
                <td className="py-2 px-3 font-mono font-bold text-emerald-700">&le; 0.095 g</td>
                <td className="py-2 px-3 text-[#64748b]">Cleaner than 95% of the web</td>
                <td className="py-2 px-3 font-mono text-xs">&lt; 150 KB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-emerald-600">A (Sustainable)</td>
                <td className="py-2 px-3 font-mono font-bold text-emerald-600">0.096 – 0.185 g</td>
                <td className="py-2 px-3 text-[#64748b]">Cleaner than 85% of the web</td>
                <td className="py-2 px-3 font-mono text-xs">&lt; 400 KB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-sky-600">B (Good)</td>
                <td className="py-2 px-3 font-mono font-bold text-sky-600">0.186 – 0.340 g</td>
                <td className="py-2 px-3 text-[#64748b]">Cleaner than 70% of the web</td>
                <td className="py-2 px-3 font-mono text-xs">&lt; 800 KB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-amber-600">C (Moderate)</td>
                <td className="py-2 px-3 font-mono font-bold text-amber-600">0.341 – 0.530 g</td>
                <td className="py-2 px-3 text-[#64748b]">Industry standard baseline</td>
                <td className="py-2 px-3 font-mono text-xs">&lt; 1.5 MB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-rose-700">F (Heavy Carbon)</td>
                <td className="py-2 px-3 font-mono font-bold text-rose-700">&gt; 1.000 g</td>
                <td className="py-2 px-3 text-rose-700 font-semibold">Heavier than 85% of the web</td>
                <td className="py-2 px-3 font-mono text-xs text-rose-700">&gt; 3.0 MB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Green Web Foundation */}
      <section id="green-hosting" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Green Web Foundation Integration</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          The engine queries the Green Web Foundation WHOIS database to verify whether the host Autonomous System Number (ASN) runs on verified renewable energy contracts.
        </p>
      </section>
    </DocsLayout>
  );
};
export default EcoHoloDoc;
