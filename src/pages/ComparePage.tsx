import React, { useState } from 'react';
import { SideBySideDeltaMatrix } from '../components/telemetry/SideBySideDeltaMatrix';
import { SEOHead } from '../components/common/SEOHead';
import { urlToDomainSlug } from '../utils/slugUtils';
import type { MasterTelemetryReport, DiagnosticEngineId, EngineResult } from '../types/telemetry';
import { authorizedFetch } from '../lib/authHeaders';
import { logger } from '../lib/logger';

interface CompareResponse {
  success: boolean;
  error?: string;
  domainA?: { url: string; score: number | null; status: 'pass' | 'fail' | 'unknown' };
  domainB?: { url: string; score: number | null; status: 'pass' | 'fail' | 'unknown' };
  differential?: { scoreDelta: string | null };
}

const ENGINE_IDS: DiagnosticEngineId[] = [
  'health',
  'ai_ready',
  'repo',
  'latency',
  'eco',
  'compliance',
  'migration',
  'ai_search',
];

/** Builds a report containing only what the compare endpoint actually measured. */
function reportFrom(
  domain: { url: string; score: number | null } | undefined,
  key: string
): MasterTelemetryReport | null {
  if (!domain || typeof domain.score !== 'number') return null;

  const idle = (engineId: DiagnosticEngineId): EngineResult => ({
    engineId,
    name: engineId,
    category: 'Performance',
    status: 'IDLE',
    executionTimeMs: 0,
    score: 0,
    rawLogStream: [],
  });

  const engines = Object.fromEntries(ENGINE_IDS.map((id) => [id, idle(id)])) as Record<
    DiagnosticEngineId,
    EngineResult
  >;

  engines.health = {
    engineId: 'health',
    name: 'Health',
    category: 'Performance',
    status: 'COMPLETE',
    executionTimeMs: 0,
    score: domain.score,
    rawLogStream: [],
    completedAt: new Date().toISOString(),
  };

  const grade: MasterTelemetryReport['grade'] =
    domain.score >= 90 ? 'A+' : domain.score >= 80 ? 'A' : domain.score >= 70 ? 'B' : domain.score >= 60 ? 'C' : domain.score >= 50 ? 'D' : 'F';

  return {
    id: key,
    targetUrl: domain.url,
    normalizedUrl: domain.url,
    domainSlug: urlToDomainSlug(domain.url),
    overallScore: domain.score,
    grade,
    engines,
    startedAt: new Date().toISOString(),
    totalDurationMs: 0,
    isCompleted: true,
    initiatedBy: { tier: 'visitor', ipHash: 'compare' },
  };
}

export const ComparePage: React.FC = () => {
  const [reportA, setReportA] = useState<MasterTelemetryReport | null>(null);
  const [reportB, setReportB] = useState<MasterTelemetryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleCompare = async (rawA: string, rawB: string) => {
    const cleanA = normalizeUrl(rawA);
    const cleanB = normalizeUrl(rawB);
    if (!cleanA || !cleanB) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authorizedFetch('/api/v1/audit/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlA: cleanA, urlB: cleanB }),
      });

      const data = (await response.json()) as CompareResponse;

      if (!response.ok || !data.success) {
        setReportA(null);
        setReportB(null);
        setError(
          data.error ||
            (response.status === 429
              ? 'You have used the comparison allowance for now. Sign in for a higher limit, or try again shortly.'
              : 'We could not compare those domains. Check both addresses and try again.')
        );
        return;
      }

      const nextA = reportFrom(data.domainA, `compare_${Date.now()}_a`);
      const nextB = reportFrom(data.domainB, `compare_${Date.now()}_b`);

      if (!nextA || !nextB) {
        setReportA(null);
        setReportB(null);
        setError('One of the domains did not return a measurable health score. Check that it is publicly reachable, then try again.');
        return;
      }

      setReportA(nextA);
      setReportB(nextB);
    } catch (err) {
      logger.error('Side-by-side comparison failed:', err);
      setReportA(null);
      setReportB(null);
      setError('The comparison request did not reach CatalystLab. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ds-page-top bg-background text-foreground">
      <SEOHead
        title="Compare two domains — CatalystLab"
        description="Run the CatalystLab health engine against two domains and read the score difference side by side."
        keywords={['site comparison', 'benchmark websites', 'performance comparison', 'health score comparison']}
        canonicalUrl="https://www.catalystlab.tech/compare"
      />

      <section className="border-b border-border w-full ds-section">
        <div className="ds-page-shell max-w-3xl space-y-3">
          <h1 className="framer-hero-title text-foreground">Compare two domains</h1>
          <p className="framer-body-text">
            Both domains get the same health reading, measured now, and the difference is shown
            engine by engine.
          </p>
        </div>
      </section>

      <main className="ds-page-shell mt-8 ds-section">
        <SideBySideDeltaMatrix
          reportA={reportA}
          reportB={reportB}
          onCompare={handleCompare}
          isLoading={loading}
          error={error}
        />
      </main>
    </div>
  );
};

export default ComparePage;
