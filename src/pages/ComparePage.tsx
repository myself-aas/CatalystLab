import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { authorizedFetch } from '../lib/authHeaders';
import { logger } from '../lib/logger';

interface DomainSide {
  url: string;
  score: number | null;
  status: 'pass' | 'fail' | 'unknown';
}

interface CompareResponse {
  success: boolean;
  error?: string;
  domainA?: DomainSide;
  domainB?: DomainSide;
  differential?: { scoreDelta?: string | number | null };
}

interface ComparisonResult {
  a: DomainSide;
  b: DomainSide;
}

const PASS_THRESHOLD = 85;

const normalizeUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const statusLabel = (status: DomainSide['status']): string =>
  status === 'pass'
    ? `Passes the ${PASS_THRESHOLD}-point bar`
    : status === 'fail'
      ? `Below the ${PASS_THRESHOLD}-point bar`
      : 'Result not reported';

const displayDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/**
 * Comparison surface.
 *
 * `POST /api/v1/audit/compare` measures the health engine on both domains and
 * returns one score per side. The page used to dress that up as an eight-engine
 * sidebar matrix by inventing an "idle" result for the other seven engines; it
 * now reports exactly the one reading the endpoint takes and points at the full
 * audit when more is needed.
 */
export const ComparePage: React.FC = () => {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runComparison = async (event: React.FormEvent) => {
    event.preventDefault();
    const urlA = normalizeUrl(inputA);
    const urlB = normalizeUrl(inputB);
    if (!urlA || !urlB) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authorizedFetch('/api/v1/audit/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlA, urlB }),
      });

      const data = (await response.json().catch(() => null)) as CompareResponse | null;

      if (!response.ok || !data?.success || !data.domainA || !data.domainB) {
        setResult(null);
        setError(
          response.status === 429
            ? 'You have used the comparison allowance for now. Sign in for a higher limit, or try again shortly.'
            : data?.error ||
                'The comparison did not complete. Check that both addresses are public, then try again.',
        );
        return;
      }

      if (typeof data.domainA.score !== 'number' || typeof data.domainB.score !== 'number') {
        setResult(null);
        setError(
          'At least one domain did not return a health score. That usually means the page did not load in time — try again, or audit it directly.',
        );
        return;
      }

      setResult({ a: data.domainA, b: data.domainB });
    } catch (err) {
      logger.error('Side-by-side comparison failed:', err);
      setResult(null);
      setError('The request did not reach CatalystLab. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const delta = result ? result.a.score! - result.b.score! : null;
  const winner =
    result && delta !== null && delta !== 0
      ? delta > 0
        ? result.a
        : result.b
      : null;

  return (
    <div className="min-h-screen ds-page-top bg-background text-foreground">
      <SEOHead
        title="Compare two domains — CatalystLab"
        description="Score two domains on the same health engine at the same moment and see which is ahead."
        keywords={['site comparison', 'compare websites', 'health score comparison']}
        canonicalUrl="https://www.catalystlab.tech/compare"
      />

      <section className="w-full border-b border-border ds-section">
        <div className="ds-page-shell max-w-3xl space-y-3">
          <h1 className="framer-hero-title text-foreground">Compare two domains</h1>
          <p className="framer-body-text">
            Both domains get one health score, measured when you submit. The bar is{' '}
            {PASS_THRESHOLD} points; a full audit runs all eight engines.
          </p>
        </div>
      </section>

      <main className="ds-page-shell mt-8 space-y-8 ds-section">
        <form onSubmit={runComparison} className="ds-card p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <div className="space-y-2">
              <label htmlFor="compare-a" className="block text-sm font-medium text-foreground">
                First domain
              </label>
              <input
                id="compare-a"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                placeholder="example.com"
                className="ds-input h-11 w-full bg-background text-sm"
                required
              />
            </div>
            <span className="hidden pb-3 text-sm text-muted-foreground sm:block" aria-hidden="true">
              vs
            </span>
            <div className="space-y-2">
              <label htmlFor="compare-b" className="block text-sm font-medium text-foreground">
                Second domain
              </label>
              <input
                id="compare-b"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                placeholder="competitor.com"
                className="ds-input h-11 w-full bg-background text-sm"
                required
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Uses one request per domain; both count against your daily allowance.
            </p>
            <button
              type="submit"
              disabled={loading || !inputA.trim() || !inputB.trim()}
              className="ds-btn ds-btn-primary h-11 text-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-4" aria-hidden="true" />
              )}
              <span>{loading ? 'Measuring both domains…' : 'Compare domains'}</span>
            </button>
          </div>
        </form>

        {error ? (
          <div role="alert" className="ds-card flex items-start gap-3 border-danger/30 p-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Comparison did not complete</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p role="status" className="font-mono text-sm text-muted-foreground">
            Measuring both domains…
          </p>
        ) : result ? (
          <section aria-labelledby="compare-result-heading" className="space-y-5">
            <h2 id="compare-result-heading" className="framer-card-title text-foreground">
              {winner
                ? `${displayDomain(winner.url)} scores higher`
                : `Both domains score ${result.a.score}`}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {[result.a, result.b].map((side, index) => (
                <div key={side.url} className="ds-card space-y-3 p-5">
                  <p className="text-sm text-muted-foreground">
                    {index === 0 ? 'First domain' : 'Second domain'}
                  </p>
                  <p className="truncate text-base font-medium text-foreground">
                    {displayDomain(side.url)}
                  </p>
                  <p className="font-mono text-4xl tabular-nums text-foreground">
                    {side.score}
                    <span className="text-base text-muted-foreground">/100</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{statusLabel(side.status)}</p>
                </div>
              ))}
            </div>

            <dl className="ds-card divide-y divide-border p-0">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-sm text-muted-foreground">Score difference</dt>
                <dd className="font-mono text-sm tabular-nums text-foreground">
                  {delta === 0 ? 'Level' : `${delta! > 0 ? '+' : ''}${delta} pts`}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-sm text-muted-foreground">Engines measured</dt>
                <dd className="text-sm text-foreground">Health only — run an audit for all eight</dd>
              </div>
            </dl>

            <p className="framer-body-text text-sm">
              Scores are point-in-time. For the other seven engines,{' '}
              <Link to="/audit" className="text-info underline underline-offset-4">
                run a master audit
              </Link>{' '}
              on either domain.
            </p>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default ComparePage;
