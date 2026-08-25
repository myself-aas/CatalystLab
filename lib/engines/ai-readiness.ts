import * as cheerio from 'cheerio';
import type { AiReadinessMetrics, AiCrawlerPermission, StructuredDataEntry, EngineResult } from '../../types/telemetry';

const HTTP_TIMEOUT_MS = 10000;

export async function executeAiReadinessEngine(targetUrl: string): Promise<EngineResult<AiReadinessMetrics>> {
  const startTime = Date.now();
  const logs: string[] = [];
  logs.push(`[AI_RADAR_INIT] Initiating LLM Ingestion & AI Crawler Accessibility Audit for: ${targetUrl}`);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    parsedUrl = new URL(`https://${targetUrl}`);
  }

  const origin = parsedUrl.origin;
  let hasLlmsTxt = false;
  let llmsTxtLength = 0;
  let hasLlmsFullTxt = false;
  let hasRobotsTxt = false;
  const crawlerPolicies: AiCrawlerPermission[] = [
    { botName: 'GPTBot', allowed: true, disallowedPaths: [] },
    { botName: 'ClaudeBot', allowed: true, disallowedPaths: [] },
    { botName: 'PerplexityBot', allowed: true, disallowedPaths: [] },
    { botName: 'Google-Extended', allowed: true, disallowedPaths: [] },
    { botName: 'CCBot', allowed: true, disallowedPaths: [] },
    { botName: 'Bytespider', allowed: true, disallowedPaths: [] },
    { botName: 'Applebot-Extended', allowed: true, disallowedPaths: [] },
  ];

  try {
    // 1. Probe /llms.txt
    logs.push(`[PROBE_LLMS_TXT] Testing ${origin}/llms.txt`);
    try {
      const llmsRes = await fetch(`${origin}/llms.txt`, {
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });
      if (llmsRes.ok) {
        const text = await llmsRes.text();
        if (text.length > 20 && !text.includes('<!DOCTYPE html>')) {
          hasLlmsTxt = true;
          llmsTxtLength = text.length;
          logs.push(`[LLMS_TXT_FOUND] /llms.txt valid (${text.length} chars)`);
        }
      }
    } catch {
      logs.push(`[LLMS_TXT_STATUS] /llms.txt not present or timed out`);
    }

    // 2. Probe /llms-full.txt
    try {
      const llmsFullRes = await fetch(`${origin}/llms-full.txt`, {
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });
      if (llmsFullRes.ok) {
        const text = await llmsFullRes.text();
        if (text.length > 50 && !text.includes('<!DOCTYPE html>')) {
          hasLlmsFullTxt = true;
          logs.push(`[LLMS_FULL_TXT_FOUND] /llms-full.txt verified (${text.length} chars)`);
        }
      }
    } catch {
      // Ignore
    }

    // 3. Probe and parse robots.txt for AI Crawlers
    logs.push(`[PROBE_ROBOTS_TXT] Analyzing crawler directives in ${origin}/robots.txt`);
    try {
      const robotsRes = await fetch(`${origin}/robots.txt`, {
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });
      if (robotsRes.ok) {
        hasRobotsTxt = true;
        const robotsContent = await robotsRes.text();
        logs.push(`[ROBOTS_TXT_FOUND] Parsing robots.txt (${robotsContent.length} bytes)`);

        crawlerPolicies.forEach((crawler) => {
          const regex = new RegExp(`User-agent:\\s*${crawler.botName}[\\s\\S]*?(?=User-agent:|$)`, 'i');
          const match = robotsContent.match(regex);
          if (match) {
            const block = match[0];
            if (/Disallow:\s*\/\s*$/m.test(block) || /Disallow:\s*\/\*/m.test(block)) {
              crawler.allowed = false;
              crawler.disallowedPaths.push('/');
              logs.push(`[AI_BOT_BLOCK] ${crawler.botName} is explicitly blocked in robots.txt`);
            } else {
              logs.push(`[AI_BOT_ALLOW] ${crawler.botName} custom permissions detected`);
            }
          } else {
            // Check global User-agent: *
            const globalMatch = robotsContent.match(/User-agent:\s*\*[\s\S]*?(?=User-agent:|$)/i);
            if (globalMatch && /Disallow:\s*\/\s*$/m.test(globalMatch[0])) {
              crawler.allowed = false;
              crawler.disallowedPaths.push('/');
            }
          }
        });
      }
    } catch {
      logs.push(`[ROBOTS_TXT_STATUS] robots.txt not reachable`);
    }

    // 4. Parse Main HTML for JSON-LD and OpenGraph metadata
    logs.push(`[HTML_SEMANTICS] Fetching page markup for RAG structured context extraction`);
    const pageRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CatalystLab-AiReadiness/2.0; +https://catalystlab.tech)',
      },
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    });

    const pageHtml = await pageRes.text();
    const $ = cheerio.load(pageHtml);

    // Extract JSON-LD
    const structuredDataEntries: StructuredDataEntry[] = [];
    const typesFound: string[] = [];

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const rawJson = $(el).html();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          const type = parsed['@type'] || (Array.isArray(parsed) ? 'ItemList' : 'Unknown');
          typesFound.push(String(type));
          structuredDataEntries.push({
            type: String(type),
            isValid: true,
            missingFields: [],
          });
        }
      } catch {
        structuredDataEntries.push({
          type: 'Malformed JSON-LD',
          isValid: false,
          missingFields: ['syntax_error'],
        });
      }
    });

    logs.push(`[STRUCTURED_DATA] Found ${structuredDataEntries.length} JSON-LD schemas: ${typesFound.join(', ') || 'None'}`);

    // Extract OpenGraph
    const ogTitle = Boolean($('meta[property="og:title"]').attr('content') || $('meta[name="og:title"]').attr('content'));
    const ogDesc = Boolean($('meta[property="og:description"]').attr('content') || $('meta[name="og:description"]').attr('content'));
    const ogImage = Boolean($('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content'));
    const ogUrl = Boolean($('meta[property="og:url"]').attr('content'));
    const ogType = Boolean($('meta[property="og:type"]').attr('content'));
    const ogMetaCount = $('meta[property^="og:"], meta[name^="twitter:"]').length;

    logs.push(`[OPEN_GRAPH] Tags present: Title=${ogTitle}, Desc=${ogDesc}, Image=${ogImage} (${ogMetaCount} meta properties)`);

    // Compute RAG Extraction & Overall Score
    let ragScore = 40;
    if (hasLlmsTxt) ragScore += 30;
    if (hasLlmsFullTxt) ragScore += 15;
    if (structuredDataEntries.length > 0) ragScore += 15;
    ragScore = Math.min(100, ragScore);

    let score = 50;
    if (hasLlmsTxt) score += 25;
    if (hasLlmsFullTxt) score += 10;
    if (structuredDataEntries.length > 0) score += 15;
    if (ogTitle && ogDesc && ogImage) score += 10;
    
    // Check if bots are permitted
    const allowedBotsCount = crawlerPolicies.filter(c => c.allowed).length;
    score += Math.round((allowedBotsCount / crawlerPolicies.length) * 10);

    score = Math.min(100, Math.max(15, score));

    const metrics: AiReadinessMetrics = {
      hasLlmsTxt,
      llmsTxtLength,
      hasLlmsFullTxt,
      hasRobotsTxt,
      crawlerPolicies,
      structuredData: {
        count: structuredDataEntries.length,
        typesFound,
        schemaDotOrgCompliant: structuredDataEntries.some(e => e.isValid),
        entries: structuredDataEntries,
      },
      openGraph: {
        hasTitle: ogTitle,
        hasDescription: ogDesc,
        hasImage: ogImage,
        hasUrl: ogUrl,
        hasType: ogType,
        metaCount: ogMetaCount,
      },
      ragContextExtractionScore: ragScore,
      score,
    };

    logs.push(`[AI_RADAR_COMPLETE] AI Readiness Index: ${score}/100 | RAG Context Extraction Score: ${ragScore}/100`);

    return {
      engineId: 'ai_ready',
      name: 'AI & LLM Readiness Radar',
      category: 'Intelligence',
      status: 'COMPLETE',
      executionTimeMs: Date.now() - startTime,
      score,
      metrics,
      rawLogStream: logs,
      completedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logs.push(`[AI_RADAR_ERROR] Error analyzing AI readiness: ${errorMsg}`);
    return {
      engineId: 'ai_ready',
      name: 'AI & LLM Readiness Radar',
      category: 'Intelligence',
      status: 'ERROR',
      executionTimeMs: Date.now() - startTime,
      score: 30,
      rawLogStream: logs,
      error: errorMsg,
    };
  }
}
