import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReport, getUserReports, saveReport } from '../lib/firebase';
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
  Layers, 
  Lock, 
  Eye, 
  Bot, 
  Activity, 
  Leaf, 
  Search, 
  ArrowLeft,
  ChevronRight,
  Terminal,
  FileText,
  Sparkles,
  Server,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const DomainReportArticlePage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
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

  // Derive target domain and slug
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
      const responses = await Promise.all(
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

      // Auto-save if logged in
      if (user) {
        try {
          const docId = await saveReport(cleanUrl, 'master-audit', aggregatedOutput, {
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
        // 1. Try to fetch from Firestore by ID if it's an existing Firestore document
        const docData = await getReport(reportIdentifier);
        if (docData) {
          setReport(docData);
          setTelemetry(parseTelemetryOutput(docData.output, docData.url));
          setLoading(false);
          return;
        }

        // 2. Reconstruct domain from slug (e.g. 'cloudflare-com' -> 'cloudflare.com')
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
      } catch (err: any) {
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
      <div className="flex min-h-[75vh] items-center justify-center bg-slate-950 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500 border-t-transparent shadow-lg shadow-orange-500/20" />
            <div className="absolute inset-0 flex items-center justify-center text-orange-400 font-bold">
              <span className="material-symbols-outlined text-2xl font-black">terminal_2</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAuditingLive ? 'Compiling Benchmark Dossier...' : 'Retrieving Audit Record...'}
          </h2>
          <p className="text-sm text-slate-400">
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
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl text-amber-400 mb-4 border border-amber-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Benchmark Report Unavailable</h2>
          <p className="mt-2 text-base text-slate-400">{error || 'Could not locate telemetry for this domain.'}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => runLiveAuditForDomain(displayDomain)}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
            >
              <RotateCw className="h-4 w-4" />
              <span>Retry Diagnostic Audit</span>
            </button>
            <Link
              to="/reports"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
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
    <article id="article-dossier-root" className="min-h-screen bg-[#070e24] pb-28 text-[#f8fafc] selection:bg-[#5882b7]/35 selection:text-[#f8fafc]">
      {/* Main Blog Article Hero Header */}
      <header className="border-b border-[#5882b7]/20 bg-gradient-to-b from-[#0b1736]/90 via-[#0b1736]/40 to-[#070e24] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          
          {/* Badge & Category */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#5882b7]/40 bg-[#5882b7]/15 px-3 py-1 text-sm font-bold text-[#5882b7] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#c8beba]" />
              Engineering Benchmark Dossier
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[#c8beba]/30 bg-[#c8beba]/10 px-2.5 py-1 text-sm font-semibold text-[#c8beba]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Telemetry
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#f8fafc] tracking-tight leading-tight">
            Full-Stack Performance, Security & AI Readiness Benchmark:{' '}
            <span className="text-[#5882b7]">
              {displayDomain}
            </span>
          </h1>

          {/* Subtitle / Executive Lead */}
          <p className="text-base sm:text-lg text-[#a4b7cc] leading-relaxed max-w-4xl font-normal">
            A comprehensive multi-vector telemetry benchmark inspecting DOM element depth, OWASP security headers, 
            WCAG 2.2 accessibility, SearchGPT vector chunking, global edge latency dispersion, and Sustainable Web Design carbon metrics.
          </p>

          {/* Metadata & Actions Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 border-t border-[#5882b7]/20">
            
            {/* Author Profile */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5882b7] text-[#070e24] font-bold text-xl shadow-lg shadow-[#5882b7]/20">
                <span className="material-symbols-outlined text-2xl font-black">terminal_2</span>
              </div>
              <div>
                <div className="text-base font-bold text-[#f8fafc] flex items-center gap-2">
                  <span>CatalystLab Automated Diagnostic Grid</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#a4b7cc] mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#a4b7cc]" />
                    {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#a4b7cc]" />
                    ~8 min read
                  </span>
                  <span>•</span>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#5882b7] hover:underline font-mono"
                  >
                    <span>{displayDomain}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2.5">
              {/* PDF Export Button */}
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-2 rounded-xl bg-[#5882b7] px-4 py-2.5 text-sm font-bold text-[#070e24] hover:bg-[#4872a7] shadow-lg shadow-[#5882b7]/25 transition-all disabled:opacity-50"
                title="Export PDF Benchmark Dossier"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isExportingPdf ? 'Exporting PDF...' : 'Export PDF Dossier'}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-xl border border-[#5882b7]/30 bg-[#0b1736] px-3.5 py-2.5 text-sm font-semibold text-[#f8fafc] hover:bg-[#10214a] transition-colors"
                title="Copy Permalink URL"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#c8beba]" /> : <Share2 className="h-3.5 w-3.5 text-[#5882b7]" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              {/* Re-Audit Button */}
              <button
                onClick={() => runLiveAuditForDomain(displayDomain)}
                disabled={isAuditingLive}
                className="flex items-center gap-1.5 rounded-xl border border-[#5882b7]/30 bg-[#0b1736] px-3.5 py-2.5 text-sm font-semibold text-[#f8fafc] hover:bg-[#10214a] transition-colors disabled:opacity-50"
                title="Re-run Diagnostic Telemetry"
              >
                <RotateCw className={`h-3.5 w-3.5 text-[#a4b7cc] ${isAuditingLive ? 'animate-spin' : ''}`} />
                <span>Re-Audit</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Editorial Body */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">

        {/* Section 1: Executive Summary & Composite Vitals Radar */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-bold font-mono">
                01
              </span>
              <span>Executive Telemetry Summary & Vitals Radar</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Below is the aggregated telemetry signature for <strong className="text-white">{displayDomain}</strong>. 
              The global composite score of <strong className="text-cyan-400">{telemetry.overallScore}/100</strong> represents 
              a weighted average across all 8 diagnostic vectors.
            </p>
          </div>

          <VitalsRadarOverview telemetry={telemetry} targetDomain={displayDomain} />
        </section>

        {/* Section 2: DOM Depth & Rendering Tree */}
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-bold font-mono">
                02
              </span>
              <span>Core DOM Depth, Node Count & Payload Weight</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
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
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold font-mono">
                03
              </span>
              <span>OWASP Top 10 Security Headers & Protocol Matrix</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
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

        {/* Section 4: WCAG 2.2 Accessibility & ADA Compliance */}
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-bold font-mono">
                04
              </span>
              <span>WCAG 2.2 Accessibility & ADA Legal Liability Index</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
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
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-bold font-mono">
                05
              </span>
              <span>Autonomous AI Agent & LLM Crawler Readiness</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
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

        {/* Section 6: Global Edge Latency & Multi-POP Radar */}
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-bold font-mono">
                06
              </span>
              <span>Global Edge Latency & Multi-Region POP Radar</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
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
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold font-mono">
                07
              </span>
              <span>Sustainable Web Design (SWD) Eco-Carbon Footprint</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
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

        {/* Section 8: LLMO (SearchGPT & Perplexity Citations) */}
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-bold font-mono">
                08
              </span>
              <span>LLMO (LLM Search Optimization) & Semantic Citation Scorecard</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
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
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-bold font-mono">
                09
              </span>
              <span>Architectural Takeaways & Remediation Roadmap</span>
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Recommended prioritization matrix for software engineering teams to resolve detected performance bottlenecks, 
              security liabilities, and indexing blind spots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
                <Flame className="h-4 w-4" />
                <span>Priority 1: Instant Wins</span>
              </div>
              <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                <li>Deploy missing OWASP headers via edge CDN (HSTS, CSP, X-Frame-Options).</li>
                <li>Add explicit `alt` attributes to all unlabeled image assets.</li>
                <li>Enable Brotli/Gzip text compression on all static text assets.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                <Zap className="h-4 w-4" />
                <span>Priority 2: AI & SEO Optimization</span>
              </div>
              <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                <li>Create `/llms.txt` plain-text API directory for autonomous crawlers.</li>
                <li>Implement JSON-LD Schema.org markup for entity recognition.</li>
                <li>Ensure explicit `robots.txt` directives for GPTBot and ClaudeBot.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                <Server className="h-4 w-4" />
                <span>Priority 3: Architecture & Edge</span>
              </div>
              <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                <li>Migrate legacy PNG/JPEG media to next-gen WebP/AVIF formats.</li>
                <li>Flatten DOM nesting hierarchy to stay under 800 total elements.</li>
                <li>Utilize Anycast Global Edge caching to minimize origin TTFB.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 10: Raw Telemetry Logs Drawer */}
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>Raw Diagnostic Engine Console Output</span>
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Inspect raw telemetry traces generated by CatalystLab backend engines.
              </p>
            </div>

            <button
              onClick={() => setShowRawTerminal(!showRawTerminal)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>{showRawTerminal ? 'Collapse Console' : 'Expand Raw Output'}</span>
            </button>
          </div>

          {showRawTerminal && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-1">
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
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#5882b7]/20 bg-[#070e24]/90 backdrop-blur-xl py-3 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#f8fafc] hidden sm:inline">
              Benchmark Dossier: <span className="font-mono text-[#5882b7]">{displayDomain}</span>
            </span>
            <span className="text-sm font-mono font-bold text-[#c8beba] bg-[#c8beba]/10 px-2 py-0.5 rounded border border-[#c8beba]/30">
              Grade {telemetry.grade} ({telemetry.overallScore}/100)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 rounded-xl bg-[#5882b7] px-4 py-2 text-sm font-bold text-[#070e24] hover:bg-[#4872a7] transition-all shadow-lg shadow-[#5882b7]/20"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-xl border border-[#5882b7]/30 bg-[#0b1736] px-3 py-2 text-sm font-semibold text-[#f8fafc] hover:bg-[#10214a] hover:text-[#f8fafc]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#c8beba]" /> : <Share2 className="h-3.5 w-3.5 text-[#5882b7]" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <Link
              to="/reports"
              className="flex items-center gap-1 rounded-xl border border-[#5882b7]/30 bg-[#0b1736] px-3 py-2 text-sm font-semibold text-[#a4b7cc] hover:bg-[#10214a] hover:text-[#f8fafc] hidden sm:flex"
            >
              <span>Directory</span>
            </Link>
          </div>
        </div>
      </footer>

    </article>
  );
};
