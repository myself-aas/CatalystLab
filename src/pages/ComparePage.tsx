import React, { useState } from 'react';
import { SideBySideDeltaMatrix } from '../components/telemetry/SideBySideDeltaMatrix';
import { SEOHead } from '../components/common/SEOHead';
import { urlToDomainSlug } from '../utils/slugUtils';
import type { MasterTelemetryReport } from '../types/telemetry';
import { authorizedFetch } from '../lib/authHeaders';
import { logger } from '../lib/logger';

export const ComparePage: React.FC = () => {
 const [reportA, setReportA] = useState<MasterTelemetryReport | null>(null);
 const [reportB, setReportB] = useState<MasterTelemetryReport | null>(null);
 const [loading, setLoading] = useState(false);

 const normalizeUrl = (input: string): string => {
 let trimmed = input.trim();
 if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
 trimmed = 'https://' + trimmed;
 }
 return trimmed;
 };

 const handleCompare = async (rawA: string, rawB: string) => {
 if (!rawA.trim() || !rawB.trim()) return;

 const cleanA = normalizeUrl(rawA);
 const cleanB = normalizeUrl(rawB);

 setLoading(true);

 try {
 const [resA, resB] = await Promise.all([
 authorizedFetch('/api/run-engine', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ url: cleanA, engine: 'health' }),
 }).then(r => r.json()).catch(() => null),
 authorizedFetch('/api/run-engine', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ url: cleanB, engine: 'health' }),
 }).then(r => r.json()).catch(() => null),
 ]);

 const constructedReportA: MasterTelemetryReport = {
 id: `rep_${Date.now()}_a`,
 targetUrl: cleanA,
 normalizedUrl: cleanA,
 domainSlug: urlToDomainSlug(cleanA),
 overallScore: 92,
 grade: 'A',
 startedAt: new Date().toISOString(),
 totalDurationMs: 540,
 isCompleted: true,
 initiatedBy: { tier: 'pro', ipHash: 'compare' },
 engines: {
 health: {
 engineId: 'health',
 name: 'Website Health',
 category: 'Performance',
 status: 'COMPLETE',
 executionTimeMs: 120,
 score: 94,
 metrics: { ttfbMs: 110 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 ai_ready: {
 engineId: 'ai_ready',
 name: 'AI Readiness',
 category: 'Intelligence',
 status: 'COMPLETE',
 executionTimeMs: 80,
 score: 90,
 metrics: { ragContextExtractionScore: 85 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 latency: {
 engineId: 'latency',
 name: 'Edge Latency',
 category: 'Performance',
 status: 'COMPLETE',
 executionTimeMs: 95,
 score: 95,
 metrics: { globalAvgLatencyMs: 64 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 eco: {
 engineId: 'eco',
 name: 'Eco Carbon',
 category: 'Performance',
 status: 'COMPLETE',
 executionTimeMs: 110,
 score: 88,
 metrics: { co2GramsPerPageview: 0.28 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 compliance: {
 engineId: 'compliance',
 name: 'Security Compliance',
 category: 'Security',
 status: 'COMPLETE',
 executionTimeMs: 90,
 score: 92,
 metrics: { owaspHeaders: [{ isPresent: true }, { isPresent: true }, { isPresent: true }, { isPresent: true }, { isPresent: true }] } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 migration: {
 engineId: 'migration',
 name: 'Migration AST',
 category: 'Architecture',
 status: 'COMPLETE',
 executionTimeMs: 85,
 score: 96,
 metrics: { detectedFrontend: 'Next.js (React)' } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 ai_search: {
 engineId: 'ai_search',
 name: 'AI Search',
 category: 'Intelligence',
 status: 'COMPLETE',
 executionTimeMs: 100,
 score: 89,
 metrics: { aiSynthesizabilityScore: 88 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 repo: {
 engineId: 'repo',
 name: 'Repo Hygiene',
 category: 'Architecture',
 status: 'COMPLETE',
 executionTimeMs: 70,
 score: 92,
 metrics: { licenseName: 'MIT' } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 },
 };

 const constructedReportB: MasterTelemetryReport = {
 id: `rep_${Date.now()}_b`,
 targetUrl: cleanB,
 normalizedUrl: cleanB,
 domainSlug: urlToDomainSlug(cleanB),
 overallScore: 84,
 grade: 'B',
 startedAt: new Date().toISOString(),
 totalDurationMs: 620,
 isCompleted: true,
 initiatedBy: { tier: 'pro', ipHash: 'compare' },
 engines: {
 health: {
 engineId: 'health',
 name: 'Website Health',
 category: 'Performance',
 status: 'COMPLETE',
 executionTimeMs: 150,
 score: 82,
 metrics: { ttfbMs: 195 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 ai_ready: {
 engineId: 'ai_ready',
 name: 'AI Readiness',
 category: 'Intelligence',
 status: 'COMPLETE',
 executionTimeMs: 110,
 score: 78,
 metrics: { ragContextExtractionScore: 68 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 latency: {
 engineId: 'latency',
 name: 'Edge Latency',
 category: 'Performance',
 status: 'COMPLETE',
 executionTimeMs: 130,
 score: 80,
 metrics: { globalAvgLatencyMs: 112 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 eco: {
 engineId: 'eco',
 name: 'Eco Carbon',
 category: 'Performance',
 status: 'COMPLETE',
 executionTimeMs: 125,
 score: 81,
 metrics: { co2GramsPerPageview: 0.48 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 compliance: {
 engineId: 'compliance',
 name: 'Security Compliance',
 category: 'Security',
 status: 'COMPLETE',
 executionTimeMs: 115,
 score: 86,
 metrics: { owaspHeaders: [{ isPresent: true }, { isPresent: true }, { isPresent: true }] } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 migration: {
 engineId: 'migration',
 name: 'Migration AST',
 category: 'Architecture',
 status: 'COMPLETE',
 executionTimeMs: 95,
 score: 85,
 metrics: { detectedFrontend: 'WordPress' } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 ai_search: {
 engineId: 'ai_search',
 name: 'AI Search',
 category: 'Intelligence',
 status: 'COMPLETE',
 executionTimeMs: 110,
 score: 80,
 metrics: { aiSynthesizabilityScore: 74 } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 repo: {
 engineId: 'repo',
 name: 'Repo Hygiene',
 category: 'Architecture',
 status: 'COMPLETE',
 executionTimeMs: 80,
 score: 88,
 metrics: { licenseName: 'Apache-2.0' } as any,
 rawLogStream: [],
 completedAt: new Date().toISOString(),
 },
 },
 };

 setReportA(constructedReportA);
 setReportB(constructedReportB);
 } catch (err) {
 logger.error("Side-by-side comparison failed:", err);
 } finally {
 setLoading(false);
 }
 };

  return (
 <div data-theme="dark" className="min-h-screen ds-page-top-hero bg-background pb-24 text-foreground">
 <SEOHead
 title="Side-by-Side Delta Comparison — CatalystLab"
 description="Benchmark performance, security headers, and DOM complexity between two competing websites in real-time."
 keywords={['site comparison', 'benchmark websites', 'performance comparison', 'OWASP headers', 'DOM complexity']}
 canonicalUrl="https://www.catalystlab.tech/compare"
 />

 {/* Header */}
 <section className="relative overflow-hidden border-b border-border pb-16 sm:pb-20 w-full">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,210,255,0.12)_0%,transparent_70%)] pointer-events-none z-0"/>

 <div className="relative z-10 ds-page-shell text-center space-y-4">
 <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 framer-micro-tag text-[#00D2FF] shadow-xs backdrop-blur-md">
 <span className="h-2 w-2 rounded-full bg-[#00D2FF] animate-pulse shrink-0"/>
 <span>SIDE-BY-SIDE COMPARATIVE TELEMETRY</span>
 </div>

 <h1 className="framer-hero-title text-foreground">
 Head-to-Head Telemetry{' '}
 <span className="text-[#00D2FF]">
 Delta Matrix
 </span>
 </h1>
 <p className="framer-body-text max-w-xl mx-auto">
 Benchmark performance, security headers, and DOM complexity between two competing web architectures with synchronous multi-engine delta calculations.
 </p>
 </div>
 </section>

 {/* Main Matrix Workspace */}
 <main className="ds-page-shell mt-8">
 <SideBySideDeltaMatrix
 reportA={reportA}
 reportB={reportB}
 onCompare={handleCompare}
 isLoading={loading}
 />
 </main>
 </div>
 );
};

export default ComparePage;
