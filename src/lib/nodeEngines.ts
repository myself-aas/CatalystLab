const HTTP_TIMEOUT_MS = 10000;
import * as cheerio from 'cheerio';
import { guardedFetch } from './networkSecurity';
import { URL } from 'url';
import { getEmailSecurityProfile, enumerateSubdomains } from './securityAudit';
import type { SecurityDiagnosticProfile } from '../types';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export interface DiagnosticResult {
  success: boolean;
  engine: string;
  url: string;
  output: string;
}

const METRICS_MARKER = '---CATALYST_METRICS---';

/**
 * Machine-readable tail of every engine log.
 *
 * `measured: false` means the scan never completed, so the block deliberately
 * carries no score and no series. `measured: true` with `healthScore: null`
 * means the engine ran but has no scoring basis (the repository scanner reads
 * DNS metadata, not repositories), and `scoreNote` says so.
 */
export interface EngineMetricsBlock {
  measured: boolean;
  healthScore: number | null;
  scoreNote?: string;
  loadTime?: number;
  [key: string]: unknown;
}

function closeLog(logs: string[], metrics: EngineMetricsBlock | null): string {
  const block: EngineMetricsBlock = metrics ?? {
    measured: false,
    healthScore: null,
    scoreNote: 'The scan did not complete, so no readings were recorded.',
  };
  logs.push(`\n${METRICS_MARKER}\n${JSON.stringify(block, null, 2)}`);
  return logs.join('\n');
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Deepest element nest in the document, counted from the root element. */
function measureDomDepth($: cheerio.CheerioAPI): number {
  type DomNode = { type?: string; parent?: DomNode | null };
  let depth = 0;
  $('*').each((_, el) => {
    let node = (el as unknown as DomNode).parent ?? null;
    let current = 0;
    while (node && node.type !== 'root') {
      current += 1;
      node = node.parent ?? null;
    }
    if (current > depth) depth = current;
  });
  return depth;
}

// SWD Constants for Eco-Carbon
const KWH_PER_GB = 0.81;
const CO2_PER_KWH = 442; // grams
const PERCENT_NEW_VISITS = 0.75;
const PERCENT_RETURN_VISITS = 0.25;
const DATA_CACHE_RATIO = 0.02;

/**
 * Universal Native TypeScript Diagnostics Runner.
 *
 * Each engine prints the readings its scan actually collected and closes with a
 * `---CATALYST_METRICS---` block. A scan that could not finish records
 * `measured: false` instead of a score, so no consumer can show a number the
 * engine never read.
 */
export async function runNativeEngine(rawUrl: string, engine: string): Promise<string> {
  let targetUrl = rawUrl.trim();
  if (engine !== 'repo' && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  switch (engine) {
    case 'health':
    case 'testing_vitals':
      return runHealthEngine(targetUrl);
    case 'ai_ready':
    case 'operations_ai_ready':
      return runAiReadinessEngine(targetUrl);
    case 'eco':
    case 'build_eco':
      return runEcoEngine(targetUrl);
    case 'compliance':
    case 'devsecops_compliance':
      return runComplianceEngine(targetUrl);
    case 'latency':
    case 'release_edge':
      return runLatencyEngine(targetUrl);
    case 'repo':
    case 'code_quality':
      return runRepoEngine(targetUrl);
    case 'migration':
    case 'planning_arch':
      return runMigrationEngine(targetUrl);
    case 'llmo':
    case 'evolution_llmo':
      return runLlmoEngine(targetUrl);
    default:
      throw new Error(`Unknown catalyst '${engine}'.`);
  }
}

// --- 1. WEBSITE HEALTH ENGINE ---
async function runHealthEngine(url: string): Promise<string> {
  const startTime = performance.now();
  let score = 100;
  const logs: string[] = [];
  let scanFailed = false;
  let fetchTime: number | null = null;
  let tagMix: Record<string, number> | null = null;
  let maxDepth: number | null = null;
  let responsiveImages: number | null = null;
  let totalImages = 0;

  logs.push(`--- CORE WEBSITE HEALTH ANALYSIS ---`);
  logs.push(`Target: ${url}\n`);

  try {
    const res = await guardedFetch(url, {
      headers: {
        'User-Agent': 'CatalystLab-HealthScanner/2.0',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      timeoutMs: HTTP_TIMEOUT_MS
    });

    fetchTime = Math.round(performance.now() - startTime);
    const htmlText = await res.text();
    const payloadBytes = Buffer.byteLength(htmlText, 'utf8');
    const payloadKb = payloadBytes / 1024;
    const $ = cheerio.load(htmlText);

    const hasHsts = res.headers.has('strict-transport-security');
    const hasFrame = res.headers.has('x-frame-options');
    const hasCsp = res.headers.has('content-security-policy');
    const hasMime = res.headers.has('x-content-type-options');

    logs.push(`[*] 1. Network & Payload Profiling...`);
    logs.push(`  [>] HTML Payload Size: ${payloadKb.toFixed(2)} KB`);
    logs.push(`  [>] Time To First Byte (TTFB proxy): ${fetchTime} ms`);

    if (payloadKb > 150) {
      logs.push(`  [-] FAIL: Initial HTML payload exceeds 150KB. Risk of slow First Contentful Paint (FCP).`);
      score -= 10;
    } else {
      logs.push(`  [+] PASS: Lean HTML payload.`);
    }

    const encoding = res.headers.get('content-encoding') || '';
    if (encoding.includes('br') || encoding.includes('gzip')) {
      logs.push(`  [+] PASS: Compression enabled (${encoding}).`);
    } else {
      logs.push(`  [-] FAIL: Text compression (Brotli/Gzip) is not active. Major performance loss.`);
      score -= 15;
    }

    logs.push(`\n[*] 2. Resource Hints & Preloading (Network Optimization)...`);
    const preloads = $('link[rel="preload"]').length;
    const dnsPrefetch = $('link[rel="dns-prefetch"]').length;
    const preconnect = $('link[rel="preconnect"]').length;
    const totalHints = preloads + dnsPrefetch + preconnect;

    if (totalHints > 0) {
      logs.push(`  [+] PASS: Found ${totalHints} modern resource hints (Preload: ${preloads}, Preconnect: ${preconnect}).`);
    } else {
      logs.push(`  [-] FAIL: No Resource Hints detected. Browser must discover critical assets sequentially.`);
      score -= 10;
    }

    logs.push(`\n[*] 3. DOM & Rendering Health...`);
    const totalDomElements = $('*').length;
    logs.push(`  [>] Total DOM Elements: ${totalDomElements}`);
    if (totalDomElements > 1500) {
      logs.push(`  [-] FAIL: Excessive DOM size (>1500 nodes). Causes high memory usage and layout recalculation lag.`);
      score -= 15;
    } else {
      logs.push(`  [+] PASS: Optimal DOM complexity (<1500 nodes).`);
    }

    const containers = $('div, section, article, aside, form, ul, ol, table, nav, header, footer, main').length;
    const textNodes = $('p, span, h1, h2, h3, h4, h5, h6, strong, em, li, td, th, label, blockquote').length;
    const links = $('a, button').length;
    const media = $('img, svg, video, picture, canvas').length;
    const scripts = $('script, style, link').length;
    const other = Math.max(0, totalDomElements - (containers + textNodes + links + media + scripts));
    tagMix = { containers, text: textNodes, links, media, scripts, other };
    logs.push(`  [>] Tag Mix: containers ${containers}, text ${textNodes}, links ${links}, media ${media}, scripts ${scripts}, other ${other}`);

    maxDepth = measureDomDepth($);
    logs.push(`  [>] Maximum Nesting Depth: ${maxDepth} levels`);

    logs.push(`\n[*] 4. Next-Gen Image Formats & Modern Assets...`);
    const images = $('img');
    totalImages = images.length;
    let modernImages = 0;
    responsiveImages = 0;

    images.each((_, el) => {
      const src = $(el).attr('src') || '';
      const srcset = $(el).attr('srcset');
      if (src.endsWith('.webp') || src.endsWith('.avif') || src.includes('format=webp') || src.includes('format=avif')) {
        modernImages++;
      }
      if (srcset) {
        responsiveImages = (responsiveImages ?? 0) + 1;
      }
    });

    logs.push(`  [>] Responsive Images (srcset): ${responsiveImages} of ${totalImages}`);

    if (images.length > 0) {
      const modernPct = (modernImages / images.length) * 100;
      logs.push(`  [>] Modern Image Formats (WebP/AVIF): ${modernImages}/${images.length} (${modernPct.toFixed(1)}%)`);
      if (modernPct < 50) {
        logs.push(`  [~] WARNING: Many images use legacy formats (JPEG/PNG). Convert to WebP or AVIF for 30-50% size reduction.`);
        score -= 10;
      } else {
        logs.push(`  [+] PASS: Strong adoption of next-gen image formats.`);
      }

      if (responsiveImages > 0) {
        logs.push(`  [+] PASS: Found ${responsiveImages} images with responsive srcset attributes.`);
      } else {
        logs.push(`  [~] WARNING: No responsive images (srcset) found. Serving same image size to mobile and desktop.`);
        score -= 5;
      }
    } else {
      logs.push(`  [~] No standard img elements detected.`);
    }

    logs.push(`\n[*] 5. Critical Rendering Path & Blocking Scripts...`);
    const blockingScripts = $('head script:not([async]):not([defer]):not([type="module"])').length;
    if (blockingScripts > 0) {
      logs.push(`  [-] FAIL: Found ${blockingScripts} parser-blocking script(s) in <head>. Move to footer or add defer/async.`);
      score -= 15;
    } else {
      logs.push(`  [+] PASS: Zero parser-blocking scripts found in <head>.`);
    }

    logs.push(`\n[*] 6. Response Security Headers (presence only)...`);
    logs.push(`  ${hasHsts ? '[+] PASS' : '[-] FAIL'}: Strict-Transport-Security ${hasHsts ? 'is present' : 'is missing'}.`);
    logs.push(`  ${hasFrame ? '[+] PASS' : '[-] FAIL'}: X-Frame-Options ${hasFrame ? 'is present' : 'is missing'}.`);
    logs.push(`  ${hasCsp ? '[+] PASS' : '[-] FAIL'}: Content-Security-Policy ${hasCsp ? 'is present' : 'is missing'}.`);
    logs.push(`  ${hasMime ? '[+] PASS' : '[-] FAIL'}: X-Content-Type-Options ${hasMime ? 'is present' : 'is missing'}.`);

    const finalScore = clampScore(score);
    logs.push(`\n=> [SCORE] CATALYST HEALTH SCORE: ${finalScore}/100`);
    if (finalScore >= 90) {
      logs.push(`=> [PASS] STATUS: OPTIMAL PERFORMANCE (Green Vitals Profile)`);
    } else if (finalScore >= 70) {
      logs.push(`=> [WARN] STATUS: MODERATE (Optimization recommendations available)`);
    } else {
      logs.push(`=> [FAIL] STATUS: CRITICAL BOTTLENECKS DETECTED`);
    }
  } catch (err: unknown) {
    scanFailed = true;
    logs.push(`  [!] CRITICAL: Failed to complete health scan: ${getErrorMessage(err)}`);
  }

  if (scanFailed) return closeLog(logs, null);

  return closeLog(logs, {
    measured: true,
    healthScore: clampScore(score),
    loadTime: fetchTime ?? undefined,
    images: totalImages,
    responsiveImages,
    maxDepth,
    tagMix,
  });
}

// --- 2. AI READINESS ENGINE ---
async function runAiReadinessEngine(url: string): Promise<string> {
  let score = 100;
  const logs: string[] = [];
  const baseUrl = new URL(url).origin;

  let llmsFound = false;
  let robotsFound = false;
  let wordCount = 0;
  let headings = 0;
  let domRead = false;

  logs.push(`--- AI READINESS INSPECTOR V2 ---`);
  logs.push(`Target: ${url}\n`);
  logs.push(`[*] 1. Discovering LLM specific endpoints...`);

  // Check llms.txt
  try {
    const resLlms = await guardedFetch(`${baseUrl}/llms.txt`, { timeoutMs: HTTP_TIMEOUT_MS });
    if (resLlms.status === 200) {
      logs.push(`  [+] PASS: /llms.txt found. Explicit LLM instructions provided.`);
      llmsFound = true;
    } else {
      logs.push(`  [-] FAIL: /llms.txt missing (HTTP ${resLlms.status}). Agents must guess content structure.`);
      score -= 15;
    }
  } catch {
    logs.push(`  [-] FAIL: /llms.txt missing or unreachable.`);
    score -= 15;
  }

  // Check AI plugin manifest
  try {
    const resPlugin = await guardedFetch(`${baseUrl}/.well-known/ai-plugin.json`, { timeoutMs: HTTP_TIMEOUT_MS });
    if (resPlugin.status === 200) {
      logs.push(`  [+] PASS: /.well-known/ai-plugin.json found. App acts as an AI tool/agent.`);
    } else {
      logs.push(`  [~] WARNING: /.well-known/ai-plugin.json missing (Optional, but limits ecosystem discoverability).`);
    }
  } catch (e) { console.error("Ignored error:", e); }

  logs.push(`\n[*] 2. Checking robots.txt for AI Bot Directives...`);
  try {
    const resRobots = await guardedFetch(`${baseUrl}/robots.txt`, { timeoutMs: HTTP_TIMEOUT_MS });
    if (resRobots.status === 200) {
      robotsFound = true;
      const robotsTxt = (await resRobots.text()).toLowerCase();
      if (robotsTxt.includes('gptbot') || robotsTxt.includes('ccbot') || robotsTxt.includes('anthropic') || robotsTxt.includes('claude')) {
        logs.push(`  [+] PASS: Found specific rules for AI crawlers (GPTBot, CCBot, Anthropic, etc).`);
      } else {
        logs.push(`  [~] WARNING: No specific rules for AI crawlers found in robots.txt.`);
        score -= 5;
      }
    } else {
      logs.push(`  [-] FAIL: robots.txt not found.`);
      score -= 10;
    }
  } catch {
    logs.push(`  [-] FAIL: Could not fetch robots.txt`);
    score -= 10;
  }

  logs.push(`\n[*] 3. Evaluating DOM Semantic Purity & Chunking...`);
  try {
    const res = await guardedFetch(url, { timeoutMs: HTTP_TIMEOUT_MS });
    const htmlText = await res.text();
    const $ = cheerio.load(htmlText);
    domRead = true;

    $('script, style, nav, footer, header, noscript').remove();
    const rawText = $('body').text().replace(/\s+/g, ' ').trim();
    wordCount = rawText ? rawText.split(' ').length : 0;

    logs.push(`  [>] Extracted Text: ~${wordCount} words.`);

    if (wordCount < 100) {
      logs.push(`  [-] FAIL: Extremely low semantic content. Vectors will lack context.`);
      score -= 20;
    } else if (wordCount > 10000) {
      logs.push(`  [~] WARNING: High text density on single page (>10k words). Requires strong chunking logic by the RAG bot.`);
      score -= 10;
    } else {
      logs.push(`  [+] PASS: Ideal content density for vector embedding models.`);
    }

    headings = $('h1, h2, h3').length;
    if (headings > 0) {
      logs.push(`  [+] PASS: Document structured with ${headings} heading tags (Critical for LLM semantic chunking).`);
    } else {
      logs.push(`  [-] FAIL: No headings found. LLMs cannot determine hierarchy.`);
      score -= 15;
    }
  } catch (err: unknown) {
    logs.push(`  [!] CRITICAL: Failed to parse DOM for semantic analysis. ${getErrorMessage(err)}`);
  }

  if (!domRead) {
    logs.push(`\n=> [FAIL] STATUS: NOT MEASURED. The page itself could not be read, so the readiness score is unavailable.`);
    return closeLog(logs, null);
  }

  const finalScore = clampScore(score);
  logs.push(`\n=> [SCORE] AI READINESS SCORE: ${finalScore}/100`);
  if (finalScore >= 85) {
    logs.push(`=> [PASS] STATUS: FULLY COMPATIBLE (SearchGPT/Perplexity optimized)`);
  } else if (finalScore >= 60) {
    logs.push(`=> [WARN] STATUS: PARTIAL (Usable, but missing explicit AI directives)`);
  } else {
    logs.push(`=> [FAIL] STATUS: INVISIBLE (High risk of hallucination or being ignored by AI agents)`);
  }

  return closeLog(logs, {
    measured: true,
    healthScore: finalScore,
    llmsTxt: llmsFound,
    robotsTxt: robotsFound,
    wordCount,
    headings,
  });
}

// --- 3. ECO-CARBON FOOTPRINT ENGINE ---
async function runEcoEngine(url: string): Promise<string> {
  const logs: string[] = [];
  let measuredCarbon: number | null = null;
  let measuredWeightMb: number | null = null;
  let measuredMonthlyKg: number | null = null;
  let rating: string | null = null;
  let ratingLabel: string | null = null;
  let pageRead = false;

  logs.push(`--- ECO-CARBON FOOTPRINT AUDIT ---`);
  logs.push(`Target: ${url}\n`);
  logs.push(`[*] 1. Fetching page and measuring initial payload weight...`);

  try {
    const res = await guardedFetch(url, { timeoutMs: HTTP_TIMEOUT_MS });
    const htmlText = await res.text();
    pageRead = true;
    const htmlBytes = Buffer.byteLength(htmlText, 'utf8');
    const $ = cheerio.load(htmlText);

    const images = $('img').length;
    const scripts = $('script[src]').length;
    const stylesheets = $('link[rel="stylesheet"]').length;

    logs.push(`  [>] Found: ${images} Images, ${scripts} Scripts, ${stylesheets} CSS files.`);

    const estImgBytes = images * 500 * 1024;
    const estScriptBytes = scripts * 100 * 1024;
    const estCssBytes = stylesheets * 30 * 1024;

    const totalEstBytes = htmlBytes + estImgBytes + estScriptBytes + estCssBytes;
    const totalGb = totalEstBytes / Math.pow(1024, 3);
    measuredWeightMb = totalEstBytes / Math.pow(1024, 2);

    logs.push(`\n[*] 2. Calculating Energy & Carbon Metrics (Sustainable Web Design Model)...`);
    logs.push(`  [>] Estimated Total Page Weight: ${measuredWeightMb.toFixed(2)} MB`);
    logs.push(`  [>] Estimate basis: HTML bytes plus 500 KB per image, 100 KB per script and 30 KB per stylesheet.`);

    const energyKwh = totalGb * KWH_PER_GB;
    const carbonFirstView = energyKwh * CO2_PER_KWH;
    const carbonReturnView = energyKwh * DATA_CACHE_RATIO * CO2_PER_KWH;
    measuredCarbon = (carbonFirstView * PERCENT_NEW_VISITS) + (carbonReturnView * PERCENT_RETURN_VISITS);
    measuredMonthlyKg = (measuredCarbon * 10000) / 1000;

    logs.push(`\n=> [METRICS] ECO-METRICS RESULTS:`);
    logs.push(`  - Emissions per Visit: ${measuredCarbon.toFixed(4)} grams CO2e`);
    logs.push(`  - Monthly Emissions (10k views): ${measuredMonthlyKg.toFixed(2)} kg CO2e`);

    rating = 'F';
    ratingLabel = 'Failing (Heavy Emitter)';
    if (measuredCarbon < 0.5) {
      rating = 'A+';
      ratingLabel = 'Excellent';
    } else if (measuredCarbon < 1.0) {
      rating = 'A';
      ratingLabel = 'Good';
    } else if (measuredCarbon < 1.5) {
      rating = 'B';
      ratingLabel = 'Fair';
    } else if (measuredCarbon < 2.5) {
      rating = 'C';
      ratingLabel = 'Poor';
    }

    logs.push(`\n=> [RATING] CATALYST ECO-RATING: [${rating}] - ${ratingLabel}`);
    logs.push(`=> [SCORE] ECO EFFICIENCY SCORE: ${clampScore(100 - measuredCarbon * 35)}/100`);
  } catch (err: unknown) {
    logs.push(`  [!] Error calculating eco footprint: ${getErrorMessage(err)}`);
  }

  if (!pageRead || measuredCarbon === null) {
    logs.push(`\n=> [FAIL] STATUS: NOT MEASURED. The page could not be fetched, so no emission estimate was produced.`);
    return closeLog(logs, null);
  }

  return closeLog(logs, {
    measured: true,
    healthScore: clampScore(100 - measuredCarbon * 35),
    emissionsPerVisitGrams: Number(measuredCarbon.toFixed(4)),
    monthly10kKg: Number((measuredMonthlyKg ?? 0).toFixed(2)),
    pageWeightMb: Number((measuredWeightMb ?? 0).toFixed(2)),
    rating,
    ratingLabel,
  });
}

// --- 4. COMPLIANCE & RISK ENGINE ---
async function runComplianceEngine(url: string): Promise<string> {
  const logs: string[] = [];
  logs.push(`--- COMPLIANCE & RISK MITIGATION AUDIT ---`);
  logs.push(`Target: ${url}\n`);

  let riskCount = 0;
  let secProfile: SecurityDiagnosticProfile | null = null;
  let pageRead = false;

  try {
    const res = await guardedFetch(url, { timeoutMs: HTTP_TIMEOUT_MS });
    const htmlText = await res.text();
    pageRead = true;
    const $ = cheerio.load(htmlText);

    logs.push(`[*] 1. Auditing OWASP Security Headers (InfoSec Compliance)...`);
    const secHeaders: Record<string, string> = {
      'strict-transport-security': 'HSTS prevents downgrade attacks.',
      'content-security-policy': 'CSP prevents Cross-Site Scripting (XSS).',
      'x-frame-options': 'Prevents Clickjacking.',
      'referrer-policy': 'Limits referrer leakage to third parties.',
      'permissions-policy': 'Restricts access to browser features.'
    };

    for (const [header, desc] of Object.entries(secHeaders)) {
      if (res.headers.has(header)) {
        logs.push(`  [+] PASS: ${header} is present.`);
      } else {
        logs.push(`  [-] FAIL: Missing ${header}. ${desc}`);
        riskCount++;
      }
    }

    logs.push(`\n[*] 2. Auditing Privacy & Consent (GDPR/CCPA Risk)...`);
    let privacyFound = false;
    $('a[href]').each((_, el) => {
      const text = $(el).text().toLowerCase();
      const href = ($(el).attr('href') || '').toLowerCase();
      if (text.includes('privacy') || text.includes('policy') || text.includes('legal') || text.includes('terms') || href.includes('privacy')) {
        privacyFound = true;
      }
    });

    if (privacyFound) {
      logs.push(`  [+] PASS: Detected links to Privacy Policy / Legal terms.`);
    } else {
      logs.push(`  [-] FAIL: No visible link to a Privacy Policy found. Major GDPR/CCPA risk.`);
      riskCount++;
    }

    let cookieFound = false;
    $('*').each((_, el) => {
      const id = ($(el).attr('id') || '').toLowerCase();
      const cls = ($(el).attr('class') || '').toLowerCase();
      if (id.includes('cookie') || id.includes('consent') || cls.includes('cookie') || cls.includes('consent') || cls.includes('cmp')) {
        cookieFound = true;
      }
    });

    if (cookieFound) {
      logs.push(`  [+] PASS: Possible Cookie Consent / CMP banner detected in DOM.`);
    } else {
      logs.push(`  [~] WARNING: No obvious Cookie Consent HTML detected. Ensure a CMP script is loading asynchronously.`);
    }

    logs.push(`\n[*] 3. Auditing WCAG Accessibility (ADA Legal Risk)...`);
    const images = $('img');
    if (images.length > 0) {
      let missingAlt = 0;
      images.each((_, el) => {
        const alt = $(el).attr('alt');
        if (!alt || alt.trim() === '') {
          missingAlt++;
        }
      });

      if (missingAlt > 0) {
        const pct = (missingAlt / images.length) * 100;
        logs.push(`  [-] FAIL: ${missingAlt}/${images.length} images (${pct.toFixed(1)}%) are missing 'alt' text.`);
        riskCount++;
      } else {
        logs.push(`  [+] PASS: 100% Image Alt Text coverage (${images.length} images).`);
      }
    } else {
      logs.push(`  [>] No img elements on the page, so alt text was not assessed.`);
    }

    const inputs = $('input:not([type="hidden"]), select, textarea');
    let unlabeledInputs = 0;
    inputs.each((_, el) => {
      const id = $(el).attr('id');
      const hasAria = Boolean($(el).attr('aria-label') || $(el).attr('aria-labelledby'));
      const hasWrappingLabel = $(el).closest('label').length > 0;
      const hasForLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
      if (!hasAria && !hasWrappingLabel && !hasForLabel) unlabeledInputs++;
    });
    logs.push(`  [>] Form controls: ${inputs.length} found, ${unlabeledInputs} without an associated label.`);
    if (unlabeledInputs > 0) {
      logs.push(`  [-] FAIL: ${unlabeledInputs} form control(s) have no accessible label.`);
      riskCount++;
    }

    logs.push(`\n[*] 4. Auditing Email Security & Anti-Spoofing Vectors...`);
    secProfile = await getEmailSecurityProfile(url);

    if (secProfile.spf_status === 'Configured') {
      logs.push(`  [+] PASS: SPF Structural Record validated (v=spf1 declared).`);
    } else if (secProfile.spf_status === 'Missing Protection') {
      logs.push(`  [-] FAIL: Missing SPF record. Domain exposed to unauthorized mail relay.`);
      riskCount++;
    } else {
      logs.push(`  [~] SPF status could not be measured: DNS lookups did not answer.`);
    }

    if (secProfile.dmarc_status === 'Configured') {
      logs.push(`  [+] PASS: DMARC Policy validated (v=DMARC1 enforcement active).`);
    } else if (secProfile.dmarc_status === 'Missing Protection') {
      logs.push(`  [-] FAIL: Missing DMARC policy. No rejection or quarantine instruction for forged headers.`);
      riskCount++;
    } else {
      logs.push(`  [~] DMARC status could not be measured: DNS lookups did not answer.`);
    }

    logs.push(`  [>] Spoofing Risk Rating: ${secProfile.spoofing_risk_level}`);

    logs.push(`\n[*] 5. Auditing SSL/TLS Certificate & Cryptographic Parameters...`);
    const ssl = secProfile.ssl_status;
    if (ssl.measured) {
      logs.push(`  [>] Cipher & Protocol: ${ssl.encryption_algorithm}`);
      logs.push(`  [>] Certificate Issuer: ${ssl.issuer ?? 'Not reported by the certificate'}`);
      logs.push(`  [>] Days Until Expiration: ${ssl.days_until_expiration} days`);
      logs.push(`  [>] Expiration Status: ${ssl.is_expired ? 'EXPIRED' : 'VALID'}`);
      logs.push(`  [>] Validation Alert: ${ssl.validation_alert}`);

      if (ssl.is_expired) {
        logs.push(`  [-] CRITICAL: SSL Certificate has expired. Browser trust warnings active.`);
        riskCount += 2;
      } else if (ssl.days_until_expiration !== null && ssl.days_until_expiration < 30) {
        logs.push(`  [~] WARNING: SSL Certificate expires in under 30 days. Renewal required.`);
      }
    } else {
      logs.push(`  [~] TLS handshake did not complete, so certificate details are not measured.`);
    }

    logs.push(`\n[*] 6. Hosting Ecosystem & Mail Topography Overview:`);
    logs.push(`  [>] ${secProfile.pipeline_summary}`);

    const finalScore = clampScore(100 - riskCount * 10);
    logs.push(`\n=> [LIABILITIES] TOTAL IDENTIFIED LIABILITIES: ${riskCount}`);
    if (riskCount === 0) {
      logs.push(`=> [PASS] STATUS: COMPLIANT. Low legal, security, and spoofing risk.`);
    } else if (riskCount <= 2) {
      logs.push(`=> [WARN] STATUS: WARNING. Remediate missing policies or headers to ensure full compliance.`);
    } else {
      logs.push(`=> [FAIL] STATUS: HIGH LIABILITY. Critical remediation required for compliance & email security.`);
    }
    logs.push(`=> [SCORE] COMPLIANCE SCORE: ${finalScore}/100`);
  } catch (err: unknown) {
    logs.push(`  [!] Failed to complete compliance audit: ${getErrorMessage(err)}`);
  }

  if (!pageRead) {
    logs.push(`\n=> [FAIL] STATUS: NOT MEASURED. The page could not be read, so no compliance score was produced.`);
    return closeLog(logs, null);
  }

  return closeLog(logs, {
    measured: true,
    healthScore: clampScore(100 - riskCount * 10),
    riskCount,
    spoofing_risk_level: secProfile?.spoofing_risk_level ?? null,
    spf_status: secProfile?.spf_status ?? null,
    dmarc_status: secProfile?.dmarc_status ?? null,
    ssl_status: secProfile?.ssl_status ?? null,
    pipeline_summary: secProfile?.pipeline_summary ?? null,
  });
}

// --- 5. EDGE LATENCY RADAR ENGINE ---
async function runLatencyEngine(url: string): Promise<string> {
  const logs: string[] = [];
  logs.push(`--- GLOBAL EDGE LATENCY RADAR ---`);
  logs.push(`Target: ${url}\n`);

  let localTtfb: number | null = null;
  let infrastructure = '';
  let status = 0;

  try {
    const startTime = performance.now();
    const res = await guardedFetch(url, { method: 'HEAD', timeoutMs: HTTP_TIMEOUT_MS });
    localTtfb = Math.round(performance.now() - startTime);
    status = res.status;

    logs.push(`[*] 1. Direct Edge Probe & Handshake:`);
    logs.push(`  [>] HTTP Status: ${status}`);
    logs.push(`  [>] Local Origin TTFB: ${localTtfb} ms`);

    infrastructure = res.headers.get('server') || res.headers.get('via') || 'Not reported by the response';
    logs.push(`  [>] Reported Edge Infrastructure: ${infrastructure}`);

    logs.push(`\n[*] 2. Geographic Dispersion:`);
    logs.push(`  [>] This engine probes from one network location.`);
    logs.push(`  [>] Per-region POP timings need probes in each region and were not run, so none are reported.`);

    const finalScore = clampScore(100 - localTtfb * 0.25);
    logs.push(`\n=> [EDGE] MEASURED ORIGIN ROUND TRIP: ${localTtfb} ms`);
    logs.push(`=> [SCORE] LATENCY SCORE FROM THAT PROBE: ${finalScore}/100`);
    if (localTtfb < 120) {
      logs.push(`=> [PASS] PROBE PERFORMANCE: FAST RESPONSE FROM THE PROBING LOCATION`);
    } else {
      logs.push(`=> [WARN] PROBE PERFORMANCE: SLOW RESPONSE FROM THE PROBING LOCATION`);
    }
  } catch (err: unknown) {
    logs.push(`  [!] Latency probe failed: ${getErrorMessage(err)}`);
  }

  if (localTtfb === null) {
    logs.push(`\n=> [FAIL] STATUS: NOT MEASURED. The probe could not reach the target.`);
    return closeLog(logs, null);
  }

  return closeLog(logs, {
    measured: true,
    healthScore: clampScore(100 - localTtfb * 0.25),
    loadTime: localTtfb,
    originTtfbMs: localTtfb,
    httpStatus: status,
    infrastructure,
  });
}

// --- 6. REPO SCANNER ENGINE ---
async function runRepoEngine(repoUrl: string): Promise<string> {
  const logs: string[] = [];
  logs.push(`--- REPOSITORY & INFRASTRUCTURE DISCOVERY ---`);
  logs.push(`Target Repository: ${repoUrl}\n`);

  let cleanUrl = repoUrl.trim();
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = 'https://github.com/' + cleanUrl.replace(/^github\.com\//, '');
  }

  logs.push(`[*] 1. Repository Reference...`);
  const isGitHub = cleanUrl.includes('github.com');
  const parts = isGitHub ? cleanUrl.split('github.com/')[1]?.split('/') : undefined;
  const owner = parts?.[0];
  const repo = parts?.[1]?.replace(/\.git$/, '');

  if (owner && repo) {
    logs.push(`  [+] Repository reference parsed: ${owner}/${repo}.`);
  } else if (isGitHub) {
    logs.push(`  [-] Repository path is incomplete: expected github.com/<owner>/<repository>.`);
  } else {
    logs.push(`  [>] Target is not a GitHub URL; only passive DNS discovery ran.`);
  }

  logs.push(`  [>] Repository contents are not fetched by this engine, so README, licence,`);
  logs.push(`      dependency and secret-history checks are out of scope for this run.`);

  // Passive DNS Subdomain Enumeration & Infrastructure Footprint Discovery
  logs.push(`\n[*] 2. Passive DNS Subdomain Enumeration & Footprint Discovery...`);
  const { subdomains, infrastructure_growth } = await enumerateSubdomains(cleanUrl);

  logs.push(`  [>] Total Discovered Subdomains: ${infrastructure_growth.total_discovered}`);
  logs.push(`  [>] Active Resolving Hosts: ${infrastructure_growth.active_hosts}`);
  logs.push(`  [>] Footprint Expansion Rate: ${infrastructure_growth.expansion_rate ?? 'Not measured (no stored baseline)'}`);
  logs.push(`  [>] Cloud Host Ecosystem: ${infrastructure_growth.cloud_providers.length ? infrastructure_growth.cloud_providers.join(', ') : 'Not measured (no ASN lookup)'}`);
  logs.push(`  [>] Discovery Source: ${infrastructure_growth.discovery_source}`);

  if (subdomains.length) {
    logs.push(`\n  --- Discovered Infrastructure Assets ---`);
    subdomains.slice(0, 8).forEach((sub) => {
      logs.push(`  [+] ${sub.subdomain.padEnd(28)} -> ${sub.ip || 'no A record'} [${sub.status}]`);
    });
  }

  logs.push(`\n=> [SCORE] No hygiene score is computed: repository contents were not read.`);

  return closeLog(logs, {
    measured: true,
    healthScore: null,
    scoreNote: 'This engine maps certificate-transparency hostnames for the target; it does not read repository contents, so it has no hygiene score.',
    subdomains,
    infrastructure_growth,
  });
}

// --- 7. PLATFORM MIGRATION ENGINE ---
async function runMigrationEngine(url: string): Promise<string> {
  const logs: string[] = [];
  logs.push(`--- PLATFORM MIGRATION READINESS AUDIT ---`);
  logs.push(`Target: ${url}\n`);

  let detectedStack: string | null = null;

  try {
    const res = await guardedFetch(url, { timeoutMs: HTTP_TIMEOUT_MS });
    const htmlText = await res.text();
    const $ = cheerio.load(htmlText);

    logs.push(`[*] 1. Detecting Frontend Architecture & CMS Fingerprints...`);

    if (htmlText.includes('__NEXT_DATA__') || htmlText.includes('_next/static')) {
      detectedStack = 'Next.js (React)';
    } else if (htmlText.includes('__NUXT__') || htmlText.includes('_nuxt/')) {
      detectedStack = 'Nuxt (Vue.js)';
    } else if (htmlText.includes('wp-content') || htmlText.includes('wp-includes')) {
      detectedStack = 'WordPress (Monolith)';
    } else if (htmlText.includes('cdn.shopify.com')) {
      detectedStack = 'Shopify';
    } else if (htmlText.includes('webflow.com') || $('html').attr('data-wf-page')) {
      detectedStack = 'Webflow';
    } else {
      detectedStack = 'No known framework fingerprint found';
    }

    logs.push(`  [>] Detected Platform Stack: ${detectedStack}`);

    logs.push(`\n[*] 2. What this engine can and cannot say:`);
    if (detectedStack === 'WordPress (Monolith)') {
      logs.push(`  [>] A WordPress fingerprint was found: wp-content or wp-includes appears in the HTML.`);
    } else if (detectedStack === 'No known framework fingerprint found') {
      logs.push(`  [>] None of the framework fingerprints this engine checks for (Next.js, Nuxt, WordPress, Shopify, Webflow) matched.`);
    } else {
      logs.push(`  [>] The HTML matched the ${detectedStack} fingerprint.`);
    }
    logs.push(`  [>] Portability, migration complexity and deployment readiness need a code audit,`);
    logs.push(`      which this engine does not run. No readiness score is produced.`);
  } catch (err: unknown) {
    logs.push(`  [!] Migration analysis error: ${getErrorMessage(err)}`);
  }

  if (detectedStack === null) {
    logs.push(`\n=> [FAIL] STATUS: NOT MEASURED. The page could not be fetched, so no stack was detected.`);
    return closeLog(logs, null);
  }

  return closeLog(logs, {
    measured: true,
    healthScore: null,
    scoreNote: 'This engine fingerprints the frontend stack only; migration readiness is not scored.',
    detectedStack,
    platform: detectedStack,
  });
}

// --- 8. LLMO OPTIMIZER ENGINE ---
async function runLlmoEngine(url: string): Promise<string> {
  const logs: string[] = [];
  logs.push(`--- LLMO (LLM SEARCH OPTIMIZER) AUDIT ---`);
  logs.push(`Target: ${url}\n`);

  let score = 100;
  let jsonLdCount = 0;
  let hasOgTags = false;
  let hasOgImage = false;
  let hasCanonical = false;
  let pageRead = false;

  try {
    const res = await guardedFetch(url, { timeoutMs: HTTP_TIMEOUT_MS });
    const htmlText = await res.text();
    pageRead = true;
    const $ = cheerio.load(htmlText);

    logs.push(`[*] 1. Inspecting Structured Data & JSON-LD Schema Markup...`);
    const jsonLdScripts = $('script[type="application/ld+json"]');
    jsonLdCount = jsonLdScripts.length;
    if (jsonLdCount > 0) {
      logs.push(`  [+] PASS: Found ${jsonLdCount} JSON-LD structured schema block(s).`);
    } else {
      logs.push(`  [-] FAIL: Missing JSON-LD structured data. AI engines struggle to extract entity metadata.`);
      score -= 20;
    }

    logs.push(`\n[*] 2. OpenGraph & Social Entity Graph...`);
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDesc = $('meta[property="og:description"]').attr('content');
    hasOgImage = Boolean($('meta[property="og:image"]').attr('content'));
    hasOgTags = Boolean(ogTitle && ogDesc);

    if (hasOgTags) {
      logs.push(`  [+] PASS: Complete OpenGraph title and description tags found.`);
    } else {
      logs.push(`  [-] FAIL: Incomplete OpenGraph tags. Weak social citation graph.`);
      score -= 15;
    }

    if (hasOgImage) {
      logs.push(`  [+] PASS: og:image present for rich AI previews.`);
    } else {
      logs.push(`  [~] WARNING: Missing og:image tag.`);
      score -= 5;
    }

    logs.push(`\n[*] 3. Citation Clarity & Factual Attribution...`);
    const canonical = $('link[rel="canonical"]').attr('href');
    hasCanonical = Boolean(canonical);
    if (canonical) {
      logs.push(`  [+] PASS: Canonical URL explicitly defined (${canonical}).`);
    } else {
      logs.push(`  [-] FAIL: Missing canonical URL link.`);
      score -= 10;
    }

    const finalScore = clampScore(score);
    logs.push(`\n=> [SCORE] LLMO CITATION SCORE: ${finalScore}/100`);
    if (finalScore >= 85) {
      logs.push(`=> [PASS] OPTIMIZATION: EXCELLENT (High citation probability in Perplexity, Gemini, and SearchGPT)`);
    } else {
      logs.push(`=> [WARN] OPTIMIZATION: MODERATE (Add JSON-LD schema to maximize AI citations)`);
    }
  } catch (err: unknown) {
    logs.push(`  [!] LLMO audit error: ${getErrorMessage(err)}`);
  }

  if (!pageRead) {
    logs.push(`\n=> [FAIL] STATUS: NOT MEASURED. The page could not be fetched, so no citation score was produced.`);
    return closeLog(logs, null);
  }

  return closeLog(logs, {
    measured: true,
    healthScore: clampScore(score),
    jsonLdBlocks: jsonLdCount,
    openGraphTags: hasOgTags,
    openGraphImage: hasOgImage,
    canonicalUrl: hasCanonical,
  });
}
