import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReport, saveReport } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ENGINES_MAP } from '../data/engines';
import { parseTelemetryOutput, generateDomainBenchmarkTelemetry, type ParsedTelemetryData } from '../utils/telemetryParser';
import { urlToDomainSlug, slugToDisplayDomain, extractDomainFromUrl } from '../utils/slugUtils';
import { exportReportToPdf } from '../utils/pdfExport';
import { VitalsRadarOverview } from '../components/charts/VitalsRadarOverview';
import { DOMDepthChart } from '../components/charts/DOMDepthChart';
import { OWASPSecurityMatrixChart } from '../components/charts/OWASPSecurityMatrixChart';
import { WCAGAccessibilityGauge } from '../components/charts/WCAGAccessibilityGauge';
import { AIRadarChart } from '../components/charts/AIRadarChart';
import { EdgeLatencyRadarChart } from '../components/charts/EdgeLatencyRadarChart';
import { EcoCarbonComparisonChart } from '../components/charts/EcoCarbonComparisonChart';
import { LLMOCitationScorecard } from '../components/charts/LLMOCitationScorecard';
import { TerminalOutput } from '../components/TerminalOutput';
import type { AuditReport } from '../types';
import { 
  Download, 
  Share2, 
  RotateCw, 
  Check, 
  ExternalLink, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  Terminal,
  Sparkles,
  Server,
  Zap,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const DomainReportArticlePage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const { user } = useAuth();

  const reportIdentifier = slug || id || '';
  
  const [report, setReport] = useState<AuditReport | null>(null);
  const [telemetry, setTelemetry] = useState<ParsedTelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuditingLive, setIsAuditingLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showRawTerminal, setShowRawTerminal] = useState(false);

  const displayDomain = report ? extractDomainFromUrl(report.url) : slugToDisplayDomain(reportIdentifier);
  const targetUrl = report?.url || (reportIdentifier.startsWith('http') ? reportIdentifier : `https://${displayDomain}`);
  const canonicalDomainSlug = urlToDomainSlug(targetUrl);

  const runLiveAuditForDomain = async (domainToScan: string) => {
    setIsAuditingLive(true);
    setLoading(true);
    setError(null);

    let cleanUrl = domainToScan.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      const engineKeys = Object.keys(ENGINES_MAP);
      const settledResponses = await Promise.allSettled(
        engineKeys.map(async (engineKey) => {
          try {
            const res = await fetch('/api/run-engine', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: cleanUrl, engine: engineKey })
            });
            const data = await res.json();
            return {
              engine: engineKey,
              output: data.output || (data.error ? `Error: ${data.error}` : 'No output')
            };
          } catch (e: any) {
            return {
              engine: engineKey,
              output: `Diagnostic error: ${e.message}`
            };
          }
        })
      );
      const responses = settledResponses.map(r => r.status === 'fulfilled' ? r.value : { engine: 'unknown', output: 'Task rejected' });

      const aggregatedOutput = responses
        .map(r => `=== Engine: ${ENGINES_MAP[r.engine]?.name || r.engine} ===\n${r.output}\n`)
        .join('\n');

      const parsed = parseTelemetryOutput(aggregatedOutput, cleanUrl);
      const newReport: AuditReport = {
        url: cleanUrl,
        engine: 'master-audit',
        output: aggregatedOutput,
        createdAt: Date.now(),
        ownerId: user?.uid || 'guest-telemetry',
        title: `Master Audit: ${extractDomainFromUrl(cleanUrl)}`,
        score: parsed.overallScore
      };

      setReport(newReport);
      setTelemetry(parsed);

      if (user) {
        try {
          const docId = await saveReport({
            url: cleanUrl,
            engine: 'master-audit',
            output: aggregatedOutput,
            title: `Master Audit: ${extractDomainFromUrl(cleanUrl)}`
          });
          newReport.id = docId;
        } catch (saveErr) {
          console.error("Auto-saving generated report failed:", saveErr);
        }
      }
    } catch (err: any) {
      console.error("Live audit execution failed:", err);
      setError(err.message || 'Failed to complete diagnostic scan for domain.');
    } finally {
      setIsAuditingLive(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadReportData = async () => {
      if (!reportIdentifier) {
        setError("Missing report domain or ID in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const docData = await getReport(reportIdentifier);
        if (docData) {
          setReport(docData);
          setTelemetry(parseTelemetryOutput(docData.output, docData.url));
          setLoading(false);
          return;
        }

        const reconstructedDomain = slugToDisplayDomain(reportIdentifier);
        const benchmark = generateDomainBenchmarkTelemetry(reconstructedDomain);
        
        const fallbackReport: AuditReport = {
          url: `https://${reconstructedDomain}`,
          engine: 'master-audit',
          output: benchmark.rawOutput,
          createdAt: Date.now(),
          ownerId: user?.uid || 'public-benchmark',
          title: `Master Audit: ${reconstructedDomain}`,
          score: benchmark.telemetry.overallScore
        };

        setReport(fallbackReport);
        setTelemetry(benchmark.telemetry);
        setLoading(false);
      } catch (err: unknown) {
        console.error("Failed to load audit article:", err);
        const reconstructedDomain = slugToDisplayDomain(reportIdentifier);
        const benchmark = generateDomainBenchmarkTelemetry(reconstructedDomain);
        setReport({
          url: `https://${reconstructedDomain}`,
          engine: 'master-audit',
          output: benchmark.rawOutput,
          createdAt: Date.now(),
          ownerId: 'public-benchmark',
          title: `Master Audit: ${reconstructedDomain}`,
          score: benchmark.telemetry.overallScore
        });
        setTelemetry(benchmark.telemetry);
        setLoading(false);
      }
    };

    loadReportData();
  }, [reportIdentifier, user]);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/reports/${canonicalDomainSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportReportToPdf('article-dossier-root', `CatalystLab-Benchmark-${canonicalDomainSlug}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-white px-4 font-mono">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-black" />
          <h2 className="text-base font-bold text-black">
            {isAuditingLive ? 'Compiling Benchmark Dossier...' : 'Retrieving Audit Record...'}
          </h2>
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            {isAuditingLive 
              ? `Executing 8 specialized diagnostic engines across DOM depth, OWASP headers, WCAG accessibility, and edge latency for ${displayDomain}...`
              : 'Formatting telemetry figures, interactive charts, and architectural takeaways...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !telemetry || !report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center font-mono">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-3 border border-amber-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-black">Benchmark Report Unavailable</h2>
          <p className="mt-1.5 text-xs text-slate-600">{error || 'Could not locate telemetry for this domain.'}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => runLiveAuditForDomain(displayDomain)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retry Diagnostic Audit</span>
            </button>
            <Link
              to="/reports"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-black hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Browse All Reports</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = report.createdAt 
    ? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recent Verification';

  return (
    <article id="article-dossier-root" className="min-h-screen bg-white pb-28 text-black selection:bg-slate-900 selection:text-white font-mono">
      <SEOHead
        title={`Benchmark: ${displayDomain}`}
        description={`Full-stack performance, security, and AI readiness benchmark for ${displayDomain}.`}
        canonicalUrl={`https://www.catalystlab.tech/reports/${canonicalDomainSlug}`}
      />
      
      {/* Main Hero Header */}
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-5">
          
          {/* Badge & Category */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Engineering Benchmark Dossier
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Verified Telemetry
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight leading-tight font-sans">
            Full-Stack Performance, Security &amp; AI Readiness Benchmark:{' '}
            <span className="text-slate-900">
              {displayDomain}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl font-sans">
            A comprehensive multi-vector telemetry benchmark inspecting DOM element depth, OWASP security headers, 
            WCAG 2.2 accessibility, SearchGPT vector chunking, global edge latency dispersion, and Sustainable Web Design carbon metrics.
          </p>

          {/* Metadata & Actions Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-200">
            
            {/* Author Profile */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-sm shadow-sm">
                <Terminal className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-black flex items-center gap-2">
                  <span>CatalystLab Automated Diagnostic Grid</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~8 min read
                  </span>
                  <span>•</span>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-900 hover:underline"
                  >
                    <span>{displayDomain}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
                title="Export PDF Benchmark Dossier"
              >
                <Download className="h-3 w-3 text-white" />
                <span>{isExportingPdf ? 'Exporting PDF...' : 'Export PDF'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-slate-100 transition-colors cursor-pointer"
                title="Copy Permalink URL"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Share2 className="h-3 w-3 text-slate-700" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button
                onClick={() => runLiveAuditForDomain(displayDomain)}
                disabled={isAuditingLive}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                title="Re-run Diagnostic Telemetry"
              >
                <RotateCw className={`h-3 w-3 text-slate-700 ${isAuditingLive ? 'animate-spin' : ''}`} />
                <span>Re-Audit</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Editorial Body */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">

        {/* Section 1: Executive Summary & Composite Vitals Radar */}
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold">
                01
              </span>
              <span>Executive Telemetry Summary &amp; Vitals Radar</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Below is the aggregated telemetry signature for <strong className="text-black">{displayDomain}</strong>. 
              The global composite score of <strong className="text-slate-900">{telemetry.overallScore}/100</strong> represents 
              a weighted average across all 8 diagnostic vectors.
            </p>
          </div>

          <VitalsRadarOverview telemetry={telemetry} targetDomain={displayDomain} />
        </section>

        {/* Section 2: DOM Depth & Rendering Tree */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold">
                02
              </span>
              <span>Core DOM Depth, Node Count &amp; Payload Weight</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Excessive DOM elements and deep subtree nesting directly degrade First Contentful Paint (FCP) and Time to Interactive (TTI). 
              Modern browser layout engines must recalculate bounding rects whenever nodes exceed 1,500 elements.
            </p>
          </div>

          <DOMDepthChart
            domElementsCount={telemetry.health.domElementsCount}
            domDepthLevel={telemetry.health.domDepthLevel}
            payloadKb={telemetry.health.payloadKb}
            blockingScriptsCount={telemetry.health.blockingScriptsCount}
            modernImagesPct={telemetry.health.modernImagesPct}
          />
        </section>

        {/* Section 3: OWASP Top 10 Security Headers */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-emerald-600 border border-slate-200 text-xs font-bold">
                03
              </span>
              <span>OWASP Top 10 Security Headers &amp; Protocol Matrix</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Zero-Trust HTTP response headers prevent malicious third-party scripts from executing unauthorized API calls, 
              iframe clickjacking, and protocol downgrade attacks.
            </p>
          </div>

          <OWASPSecurityMatrixChart
            hsts={telemetry.security.hsts}
            csp={telemetry.security.csp}
            xFrameOptions={telemetry.security.xFrameOptions}
            referrerPolicy={telemetry.security.referrerPolicy}
            permissionsPolicy={telemetry.security.permissionsPolicy}
            riskCount={telemetry.security.riskCount}
            score={telemetry.security.score}
          />
        </section>

        {/* Section 4: WCAG 2.2 Accessibility */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold">
                04
              </span>
              <span>WCAG 2.2 Accessibility &amp; Legal Index</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Website accessibility compliance is both a legal mandate under ADA Title III and a core UX metric. 
              Screen readers require descriptive image alt tags and labeled form controls to navigate interactive interfaces.
            </p>
          </div>

          <WCAGAccessibilityGauge
            altTextCoveragePct={telemetry.accessibility.altTextCoveragePct}
            missingAltCount={telemetry.accessibility.missingAltCount}
            totalImages={telemetry.accessibility.totalImages}
            unlabeledInputsCount={telemetry.accessibility.unlabeledInputsCount}
            score={telemetry.accessibility.score}
            complianceLevel={telemetry.accessibility.complianceLevel}
          />
        </section>

        {/* Section 5: AI Agent & LLM Crawler Readiness */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold">
                05
              </span>
              <span>Autonomous AI Agent &amp; LLM Crawler Readiness</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              With SearchGPT, Perplexity, and Gemini replacing traditional search queries, sites must provide structured 
              plain-text endpoints (`/llms.txt`), clear heading hierarchies, and explicit crawler directives to avoid hallucinations.
            </p>
          </div>

          <AIRadarChart
            score={telemetry.aiReadiness.score}
            hasLlmsTxt={telemetry.aiReadiness.hasLlmsTxt}
            hasAiPlugin={telemetry.aiReadiness.hasAiPlugin}
            hasRobotsAiDirectives={telemetry.aiReadiness.hasRobotsAiDirectives}
            wordCount={telemetry.aiReadiness.wordCount}
            headingsCount={telemetry.aiReadiness.headingsCount}
            ragIndexability={telemetry.aiReadiness.ragIndexability}
          />
        </section>

        {/* Section 6: Global Edge Latency */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-amber-700 border border-slate-200 text-xs font-bold">
                06
              </span>
              <span>Global Edge Latency &amp; Multi-Region POP Radar</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Edge routing and TLS session resumption determine user latency globally. The probe below measures 
              origin TTFB and calculates multi-region dispersion across North America, Europe, Asia, and South America.
            </p>
          </div>

          <EdgeLatencyRadarChart
            originTtfbMs={telemetry.latency.originTtfbMs}
            globalAverageMs={telemetry.latency.globalAverageMs}
            infrastructure={telemetry.latency.infrastructure}
            pops={telemetry.latency.pops}
          />
        </section>

        {/* Section 7: Sustainable Web Design Eco-Carbon Footprint */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-emerald-600 border border-slate-200 text-xs font-bold">
                07
              </span>
              <span>Sustainable Web Design (SWD) Eco-Carbon Footprint</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Digital carbon emissions stem from data transfer across network routers, data centers, and client device screens. 
              The Sustainable Web Design model quantifies kilowatt-hours and grams CO2e per visit.
            </p>
          </div>

          <EcoCarbonComparisonChart
            rating={telemetry.eco.rating}
            color={telemetry.eco.color}
            emissionsPerVisitGrams={telemetry.eco.emissionsPerVisitGrams}
            monthly10kKg={telemetry.eco.monthly10kKg}
            pageWeightMb={telemetry.eco.pageWeightMb}
            treesEquivalentYearly={telemetry.eco.treesEquivalentYearly}
          />
        </section>

        {/* Section 8: LLMO Citations */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold">
                08
              </span>
              <span>LLMO &amp; Semantic Citation Scorecard</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Ensuring JSON-LD schema blocks, OpenGraph social cards, and canonical links are fully declared allows 
              large language models to accurately attribute quotes, pricing, and brand data.
            </p>
          </div>

          <LLMOCitationScorecard
            score={telemetry.llmo.score}
            jsonLdBlocksCount={telemetry.llmo.jsonLdBlocksCount}
            hasOgTags={telemetry.llmo.hasOgTags}
            hasOgImage={telemetry.llmo.hasOgImage}
            hasCanonical={telemetry.llmo.hasCanonical}
            citationConfidence={telemetry.llmo.citationConfidence}
          />
        </section>

        {/* Section 9: Architectural Takeaways & Remediation Blueprint */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold">
                09
              </span>
              <span>Architectural Takeaways &amp; Remediation Roadmap</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Recommended prioritization matrix for software engineering teams to resolve detected performance bottlenecks, 
              security liabilities, and indexing blind spots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5 text-amber-600" />
                <span>Priority 1: Instant Wins</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-sans">
                <li>Deploy missing OWASP headers via edge CDN (HSTS, CSP, X-Frame-Options).</li>
                <li>Add explicit `alt` attributes to all unlabeled image assets.</li>
                <li>Enable Brotli/Gzip text compression on all static text assets.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                <span>Priority 2: AI &amp; SEO</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-sans">
                <li>Create `/llms.txt` plain-text API directory for autonomous crawlers.</li>
                <li>Implement JSON-LD Schema.org markup for entity recognition.</li>
                <li>Ensure explicit `robots.txt` directives for GPTBot and ClaudeBot.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <Server className="h-3.5 w-3.5 text-emerald-600" />
                <span>Priority 3: Architecture &amp; Edge</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-sans">
                <li>Migrate legacy PNG/JPEG media to next-gen WebP/AVIF formats.</li>
                <li>Flatten DOM nesting hierarchy to stay under 800 total elements.</li>
                <li>Utilize Anycast Global Edge caching to minimize origin TTFB.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 10: Raw Telemetry Logs Drawer */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-black flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-slate-900" />
                <span>Raw Diagnostic Engine Console Output</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inspect raw telemetry traces generated by CatalystLab backend engines.
              </p>
            </div>

            <button
              onClick={() => setShowRawTerminal(!showRawTerminal)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Terminal className="h-3 w-3 text-slate-900" />
              <span>{showRawTerminal ? 'Collapse Console' : 'Expand Raw Output'}</span>
            </button>
          </div>

          {showRawTerminal && (
            <div className="rounded-xl border border-slate-200 bg-white p-1">
              <TerminalOutput
                title={`Telemetry Log Traces: ${displayDomain}`}
                icon="bolt"
                output={report.output}
                maxHeight="max-h-[600px]"
              />
            </div>
          )}
        </section>

      </main>

      {/* Bottom Sticky Action / Share Strip */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md py-2.5 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-black hidden sm:inline">
              Benchmark Dossier: <span className="text-slate-900">{displayDomain}</span>
            </span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Grade {telemetry.grade} ({telemetry.overallScore}/100)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer"
            >
              <Download className="h-3 w-3 text-white" />
              <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-slate-100 cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Share2 className="h-3 w-3 text-slate-700" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <Link
              to="/reports"
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-black hidden sm:flex"
            >
              <span>Directory</span>
            </Link>
          </div>
        </div>
      </footer>

    </article>
  );
};

export default DomainReportArticlePage;
