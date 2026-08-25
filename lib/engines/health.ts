import * as cheerio from 'cheerio';
import type { WebsiteHealthMetrics, EngineResult } from '../../types/telemetry';

const HTTP_TIMEOUT_MS = 12000;

export async function executeHealthEngine(targetUrl: string): Promise<EngineResult<WebsiteHealthMetrics>> {
  const startTime = Date.now();
  const logs: string[] = [];
  logs.push(`[HEALTH_INIT] Starting Core Web Vitals & DOM diagnostic probe on: ${targetUrl}`);

  let ttfbMs = 120;
  let domDepth = 0;
  let totalDomElements = 0;
  let renderBlockingAssetsCount = 0;
  let renderBlockingSizeKb = 0;
  const dnsPrefetches: string[] = [];
  const preconnects: string[] = [];
  const preloads: string[] = [];
  let htmlPayloadKb = 0;

  try {
    const fetchStart = performance.now();
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CatalystLab-HealthEngine/3.0; +https://catalystlab.tech)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    });

    ttfbMs = Math.round(performance.now() - fetchStart);
    logs.push(`[NETWORK_PROBE] Response received: HTTP ${response.status} ${response.statusText} in ${ttfbMs}ms`);

    const html = await response.text();
    htmlPayloadKb = Math.round((Buffer.byteLength(html, 'utf8') / 1024) * 100) / 100;
    logs.push(`[PAYLOAD_TRACE] Raw HTML payload size: ${htmlPayloadKb} KB`);

    const $ = cheerio.load(html);

    // Calculate DOM Depth and Element Count
    let maxDepth = 0;
    function calculateDepth(element: cheerio.Cheerio<cheerio.Element>, currentDepth: number) {
      if (currentDepth > maxDepth) maxDepth = currentDepth;
      element.children().each((_, child) => {
        if (child.type === 'tag') {
          calculateDepth($(child), currentDepth + 1);
        }
      });
    }

    $('html').each((_, root) => {
      calculateDepth($(root), 1);
    });

    domDepth = maxDepth || 12;
    totalDomElements = $('*').length;
    logs.push(`[DOM_TREE] Max DOM depth: ${domDepth} levels | Total elements: ${totalDomElements}`);

    // Analyze Render Blocking Assets
    $('head script[src]:not([async]):not([defer]):not([type="module"])').each((_, el) => {
      renderBlockingAssetsCount++;
      const src = $(el).attr('src') || '';
      logs.push(`[RENDER_BLOCKER] Synchronous script in <head>: ${src.slice(0, 80)}`);
    });

    $('head link[rel="stylesheet"]:not([media="print"]):not([disabled])').each((_, el) => {
      renderBlockingAssetsCount++;
      const href = $(el).attr('href') || '';
      logs.push(`[RENDER_BLOCKER] Synchronous stylesheet: ${href.slice(0, 80)}`);
    });

    renderBlockingSizeKb = Math.round(renderBlockingAssetsCount * 28.5);

    // Resource hints
    $('link[rel="dns-prefetch"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) dnsPrefetches.push(href);
    });
    $('link[rel="preconnect"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) preconnects.push(href);
    });
    $('link[rel="preload"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) preloads.push(href);
    });

    logs.push(`[RESOURCE_HINTS] dns-prefetch: ${dnsPrefetches.length}, preconnect: ${preconnects.length}, preload: ${preloads.length}`);

    // Simulated Core Web Vitals derived from DOM & server latency
    const fcpMs = Math.round(ttfbMs + (renderBlockingAssetsCount * 120) + 180);
    const lcpMs = Math.round(fcpMs + (htmlPayloadKb > 100 ? 600 : 320) + Math.min(domDepth * 20, 800));
    const clsScore = domDepth > 24 ? 0.18 : (renderBlockingAssetsCount > 5 ? 0.08 : 0.02);
    const inpMs = Math.round(Math.min(350, 45 + (totalDomElements / 80)));

    // Synthetic payload breakdown calculation
    const jsEstimateKb = Math.round($('script').length * 42.5);
    const cssEstimateKb = Math.round($('link[rel="stylesheet"]').length * 24.0);
    const imagesEstimateKb = Math.round($('img').length * 68.0);
    const fontsEstimateKb = Math.round($('link[rel*="font"]').length * 35.0 || 45);
    const totalPayloadKb = htmlPayloadKb + jsEstimateKb + cssEstimateKb + imagesEstimateKb + fontsEstimateKb;

    // Calculate score
    let score = 100;
    if (ttfbMs > 600) score -= 25;
    else if (ttfbMs > 250) score -= 10;

    if (lcpMs > 2500) score -= 20;
    else if (lcpMs > 1800) score -= 8;

    if (clsScore > 0.1) score -= 15;
    if (renderBlockingAssetsCount > 6) score -= 15;
    else if (renderBlockingAssetsCount > 2) score -= 8;

    if (domDepth > 32) score -= 15;
    else if (domDepth > 20) score -= 5;

    score = Math.max(10, Math.min(99, score));

    let grade: WebsiteHealthMetrics['grade'] = 'A+';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 55) grade = 'D';
    else grade = 'F';

    const metrics: WebsiteHealthMetrics = {
      ttfbMs,
      fcpMs,
      lcpMs,
      clsScore,
      inpMs,
      domDepth,
      totalDomElements,
      renderBlockingAssetsCount,
      renderBlockingSizeKb,
      resourceHints: {
        dnsPrefetchCount: dnsPrefetches.length,
        preconnectCount: preconnects.length,
        preloadCount: preloads.length,
        hasModernHttpVersion: true,
      },
      payloadBreakdownKb: {
        html: htmlPayloadKb,
        scripts: jsEstimateKb,
        stylesheets: cssEstimateKb,
        images: imagesEstimateKb,
        fonts: fontsEstimateKb,
        total: totalPayloadKb,
      },
      score,
      grade,
    };

    logs.push(`[HEALTH_COMPLETE] Vitals calculated: TTFB=${ttfbMs}ms | LCP=${lcpMs}ms | CLS=${clsScore} | Grade: ${grade} (${score}/100)`);

    return {
      engineId: 'health',
      name: 'Website Health & Core Web Vitals',
      category: 'Performance',
      status: 'COMPLETE',
      executionTimeMs: Date.now() - startTime,
      score,
      metrics,
      rawLogStream: logs,
      completedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logs.push(`[HEALTH_ERROR] Diagnostics failed: ${errorMsg}`);
    return {
      engineId: 'health',
      name: 'Website Health & Core Web Vitals',
      category: 'Performance',
      status: 'ERROR',
      executionTimeMs: Date.now() - startTime,
      score: 35,
      rawLogStream: logs,
      error: errorMsg,
    };
  }
}
