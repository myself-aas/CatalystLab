/**
 * Telemetry Parser
 *
 * Turns an aggregated engine log into the readings the report page renders.
 *
 * Rules this file follows:
 *  - A section is `null` when its engine never ran, so the page can say so.
 *  - A field is `null` when the log did not print it. There are no fallback
 *    values: an unmeasured payload size stays unknown.
 *  - The composite score averages only the section scores the log printed.
 */

export interface HealthSection {
  score: number | null;
  payloadKb: number | null;
  ttfbMs: number | null;
  compression: string | null;
  resourceHintsCount: number | null;
  domElementsCount: number | null;
  domDepthLevel: number | null;
  tagMix: { label: string; count: number }[] | null;
  modernImagesPct: number | null;
  totalImages: number | null;
  responsiveImagesCount: number | null;
  blockingScriptsCount: number | null;
}

export interface SecuritySection {
  score: number | null;
  hsts: boolean | null;
  csp: boolean | null;
  xFrameOptions: boolean | null;
  referrerPolicy: boolean | null;
  permissionsPolicy: boolean | null;
  contentTypeOptions: boolean | null;
  riskCount: number | null;
  sslValid: boolean | null;
  sslDaysRemaining: number | null;
}

export interface AccessibilitySection {
  altTextCoveragePct: number | null;
  missingAltCount: number | null;
  totalImages: number | null;
  unlabeledInputsCount: number | null;
}

export interface AiReadinessSection {
  score: number | null;
  hasLlmsTxt: boolean | null;
  hasAiPlugin: boolean | null;
  hasRobotsAiDirectives: boolean | null;
  wordCount: number | null;
  headingsCount: number | null;
}

export interface LatencySection {
  score: number | null;
  originTtfbMs: number | null;
  infrastructure: string | null;
}

export interface EcoSection {
  score: number | null;
  rating: string | null;
  ratingLabel: string | null;
  emissionsPerVisitGrams: number | null;
  monthly10kKg: number | null;
  pageWeightMb: number | null;
}

export interface MigrationSection {
  detectedStack: string | null;
}

export interface LlmoSection {
  score: number | null;
  jsonLdBlocksCount: number | null;
  hasOgTags: boolean | null;
  hasOgImage: boolean | null;
  hasCanonical: boolean | null;
}

export interface ParsedTelemetryData {
  overallScore: number | null;
  grade: string | null;
  /** How many engines printed a score; the composite covers only these. */
  scoredSections: number;
  health: HealthSection | null;
  security: SecuritySection | null;
  accessibility: AccessibilitySection | null;
  aiReadiness: AiReadinessSection | null;
  latency: LatencySection | null;
  eco: EcoSection | null;
  migration: MigrationSection | null;
  llmo: LlmoSection | null;
}

const EMPTY: ParsedTelemetryData = {
  overallScore: null,
  grade: null,
  scoredSections: 0,
  health: null,
  security: null,
  accessibility: null,
  aiReadiness: null,
  latency: null,
  eco: null,
  migration: null,
  llmo: null,
};

function num(match: RegExpMatchArray | null, group = 1): number | null {
  if (!match) return null;
  const value = Number(match[group]);
  return Number.isFinite(value) ? value : null;
}

function scoreFrom(text: string, labelPattern: string): number | null {
  const match = text.match(new RegExp(`${labelPattern}\\s*[:=]\\s*(\\d{1,3})\\s*\\/\\s*100`, 'i'));
  return num(match);
}

function gradeFor(score: number): string {
  if (score >= 93) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/** Reads `[+] PASS` / `[-] FAIL` style lines about a named response header. */
function headerPresence(text: string, label: string): boolean | null {
  const needle = label.toLowerCase();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.toLowerCase().includes(needle)) continue;
    if (/^\[-\]/.test(line)) return false;
    if (/^\[\+\]/.test(line)) return true;
    if (/\bmissing\b/i.test(line)) return false;
    if (/\bis present\b/i.test(line)) return true;
  }
  return null;
}

/** `[+] PASS: x found` / `[-] FAIL: x missing`. */
function passLine(text: string, foundPattern: RegExp, missingPattern: RegExp): boolean | null {
  if (missingPattern.test(text)) return false;
  if (foundPattern.test(text)) return true;
  return null;
}

function parseTagMix(text: string): { label: string; count: number }[] | null {
  const match = text.match(/Tag Mix:\s*([^\n]+)/i);
  if (!match) return null;
  const entries: { label: string; count: number }[] = [];
  const re = /([a-z ]+?)\s+(\d+)/gi;
  let part: RegExpExecArray | null;
  while ((part = re.exec(match[1])) !== null) {
    const count = Number(part[2]);
    if (!Number.isFinite(count)) continue;
    entries.push({ label: part[1].trim().replace(/^\w/, (c) => c.toUpperCase()), count });
  }
  return entries.length > 0 ? entries : null;
}

function parseReportText(text: string): ParsedTelemetryData {
  const healthRan = /CORE WEBSITE HEALTH ANALYSIS|CATALYST HEALTH SCORE|Total DOM Elements:/i.test(text);
  const securityRan = /COMPLIANCE & RISK MITIGATION AUDIT|COMPLIANCE SCORE|Auditing OWASP Security Headers/i.test(text);
  const accessibilityRan = /Auditing WCAG Accessibility|Image Alt Text coverage|missing 'alt' text|Form controls:/i.test(text);
  const aiRan = /AI READINESS SCORE|AI READINESS INSPECTOR/i.test(text);
  const latencyRan = /MEASURED ORIGIN ROUND TRIP|Local Origin TTFB|HTTP Status:/i.test(text);
  const ecoRan = /CATALYST ECO-RATING|Emissions per Visit/i.test(text);
  const migrationRan = /Detected Platform Stack/i.test(text);
  const llmoRan = /LLMO CITATION SCORE|JSON-LD|OpenGraph/i.test(text);

  const missingAltMatch = text.match(/(\d+)\/(\d+)\s*images\s*\(([\d.]+)%\)\s*are missing 'alt' text/i);
  const altCoverageMatch = text.match(/(\d+)% Image Alt Text coverage/i);
  const altCoverage = altCoverageMatch
    ? Number(altCoverageMatch[1])
    : missingAltMatch
      ? Math.max(0, 100 - Number(missingAltMatch[3]))
      : null;

  const sslDays = num(text.match(/Days Until Expiration:\s*(\d+)/i));
  const sslExpiredMatch = text.match(/Expiration Status:\s*(EXPIRED|VALID)/i);

  const health: HealthSection | null = healthRan
    ? {
        score: scoreFrom(text, '(?:CATALYST HEALTH|HEALTH) SCORE'),
        payloadKb: num(text.match(/HTML Payload Size:\s*([\d.]+)\s*KB/i)),
        ttfbMs: num(text.match(/Time To First Byte \(TTFB proxy\):\s*(\d+)\s*ms/i)),
        compression: /Compression enabled \(([^)]+)\)/i.exec(text)?.[1] ??
          (/Text compression \(Brotli\/Gzip\) is not active/i.test(text) ? 'None' : null),
        resourceHintsCount: num(text.match(/Found\s*(\d+)\s*modern resource hints/i)),
        domElementsCount: num(text.match(/Total DOM Elements:\s*(\d+)/i)),
        domDepthLevel: num(text.match(/Maximum Nesting Depth:\s*(\d+)/i)),
        tagMix: parseTagMix(text),
        modernImagesPct: num(text.match(/Modern Image Formats \(WebP\/AVIF\):\s*\d+\/\d+\s*\(([\d.]+)%\)/i)),
        totalImages: num(text.match(/Responsive Images \(srcset\):\s*\d+ of (\d+)/i)),
        responsiveImagesCount: num(text.match(/Responsive Images \(srcset\):\s*(\d+) of \d+/i)),
        blockingScriptsCount: num(text.match(/Found\s*(\d+)\s*parser-blocking script/i)) ??
          (/\+\] PASS: Zero parser-blocking scripts/i.test(text) ? 0 : null),
      }
    : null;

  const security: SecuritySection | null = securityRan
    ? {
        score: scoreFrom(text, 'COMPLIANCE SCORE'),
        hsts: headerPresence(text, 'strict-transport-security'),
        csp: headerPresence(text, 'content-security-policy'),
        xFrameOptions: headerPresence(text, 'x-frame-options'),
        referrerPolicy: headerPresence(text, 'referrer-policy'),
        permissionsPolicy: headerPresence(text, 'permissions-policy'),
        contentTypeOptions: headerPresence(text, 'x-content-type-options'),
        riskCount: num(text.match(/TOTAL IDENTIFIED LIABILITIES:\s*(\d+)/i)),
        sslValid: sslExpiredMatch ? sslExpiredMatch[1].toUpperCase() === 'VALID' : null,
        sslDaysRemaining: sslDays,
      }
    : null;

  const accessibility: AccessibilitySection | null = accessibilityRan
    ? {
        altTextCoveragePct: altCoverage,
        missingAltCount: missingAltMatch ? Number(missingAltMatch[1]) : altCoverage === 100 ? 0 : null,
        totalImages: missingAltMatch ? Number(missingAltMatch[2]) : num(text.match(/coverage \((\d+) images?\)/i)),
        unlabeledInputsCount: num(text.match(/(\d+) without an associated label/i)),
      }
    : null;

  const aiReadiness: AiReadinessSection | null = aiRan
    ? {
        score: scoreFrom(text, 'AI READINESS SCORE'),
        hasLlmsTxt: passLine(text, /\/llms\.txt found/i, /\/llms\.txt missing/i),
        hasAiPlugin: /ai-plugin\.json found/i.test(text),
        hasRobotsAiDirectives: /Found specific rules for AI crawlers/i.test(text),
        wordCount: num(text.match(/Extracted Text:\s*~?(\d+)\s*words/i)),
        headingsCount: num(text.match(/structured with\s*(\d+)\s*heading tags/i)),
      }
    : null;

  const latency: LatencySection | null = latencyRan
    ? {
        score: scoreFrom(text, 'LATENCY SCORE FROM THAT PROBE'),
        originTtfbMs:
          num(text.match(/Local Origin TTFB:\s*(\d+)\s*ms/i)) ??
          num(text.match(/MEASURED ORIGIN ROUND TRIP:\s*(\d+)\s*ms/i)),
        infrastructure: /Reported Edge Infrastructure:\s*([^\n]+)/i.exec(text)?.[1]?.trim() ?? null,
      }
    : null;

  const ecoRatingMatch = text.match(/CATALYST ECO-RATING:\s*\[([A-F+]+)\]\s*-\s*([^\n\r]+)/i);
  const eco: EcoSection | null = ecoRan
    ? {
        score: scoreFrom(text, 'ECO EFFICIENCY SCORE'),
        rating: ecoRatingMatch ? ecoRatingMatch[1] : null,
        ratingLabel: ecoRatingMatch ? ecoRatingMatch[2].trim() : null,
        emissionsPerVisitGrams: num(text.match(/Emissions per Visit:\s*([\d.]+)\s*grams CO2e/i)),
        monthly10kKg: num(text.match(/Monthly Emissions.*?:\s*([\d.]+)\s*kg CO2e/i)),
        pageWeightMb: num(text.match(/Estimated Total Page Weight:\s*([\d.]+)\s*MB/i)),
      }
    : null;

  const migration: MigrationSection | null = migrationRan
    ? { detectedStack: /Detected Platform Stack:\s*([^\n\r]+)/i.exec(text)?.[1]?.trim() ?? null }
    : null;

  const jsonLdMatch = text.match(/Found\s*(\d+)\s*JSON-LD/i);
  const llmo: LlmoSection | null = llmoRan
    ? {
        score: scoreFrom(text, 'LLMO CITATION SCORE'),
        jsonLdBlocksCount: jsonLdMatch
          ? Number(jsonLdMatch[1])
          : /Missing JSON-LD structured data/i.test(text)
            ? 0
            : null,
        hasOgTags: passLine(text, /Complete OpenGraph title and description tags found/i, /Incomplete OpenGraph tags/i),
        hasOgImage: passLine(text, /og:image present/i, /Missing og:image/i),
        hasCanonical: passLine(text, /Canonical URL explicitly defined/i, /Missing canonical URL/i),
      }
    : null;

  const scored = [health?.score, security?.score, aiReadiness?.score, latency?.score, llmo?.score, eco?.score]
    .filter((value): value is number => typeof value === 'number');

  const overallScore = scored.length
    ? Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length)
    : null;

  return {
    overallScore,
    grade: overallScore === null ? null : gradeFor(overallScore),
    scoredSections: scored.length,
    health,
    security,
    accessibility,
    aiReadiness,
    latency,
    eco,
    migration,
    llmo,
  };
}

/**
 * Structured JSON reports (older stored dossiers) are read field by field.
 * Anything the JSON does not contain stays null.
 */
function parseJsonReport(input: unknown): ParsedTelemetryData {
  const source = input as Record<string, any>;
  const value = (v: unknown): number | null => (typeof v === 'number' ? v : null);
  const flag = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null);

  const health = source.health
    ? {
        score: value(source.health.score),
        payloadKb: value(source.health.payloadKb),
        ttfbMs: value(source.health.ttfbMs),
        compression: typeof source.health.compression === 'string' ? source.health.compression : null,
        resourceHintsCount: value(source.health.resourceHintsCount),
        domElementsCount: value(source.health.domElementsCount),
        domDepthLevel: value(source.health.domDepthLevel),
        tagMix: null,
        modernImagesPct: value(source.health.modernImagesPct),
        totalImages: value(source.health.totalImages),
        responsiveImagesCount: value(source.health.responsiveImagesCount),
        blockingScriptsCount: value(source.health.blockingScriptsCount),
      }
    : null;

  const security = source.security
    ? {
        score: value(source.security.score),
        hsts: flag(source.security.hsts),
        csp: flag(source.security.csp),
        xFrameOptions: flag(source.security.xFrameOptions),
        referrerPolicy: flag(source.security.referrerPolicy),
        permissionsPolicy: flag(source.security.permissionsPolicy),
        contentTypeOptions: flag(source.security.contentTypeOptions),
        riskCount: value(source.security.riskCount),
        sslValid: flag(source.security.sslValid),
        sslDaysRemaining: value(source.security.sslDaysRemaining),
      }
    : null;

  const accessibility = source.accessibility
    ? {
        altTextCoveragePct: value(source.accessibility.altTextCoveragePct),
        missingAltCount: value(source.accessibility.missingAltCount),
        totalImages: value(source.accessibility.totalImages),
        unlabeledInputsCount: value(source.accessibility.unlabeledInputsCount),
      }
    : null;

  const aiReadiness = source.aiReadiness
    ? {
        score: value(source.aiReadiness.score),
        hasLlmsTxt: flag(source.aiReadiness.hasLlmsTxt),
        hasAiPlugin: flag(source.aiReadiness.hasAiPlugin),
        hasRobotsAiDirectives: flag(source.aiReadiness.hasRobotsAiDirectives),
        wordCount: value(source.aiReadiness.wordCount),
        headingsCount: value(source.aiReadiness.headingsCount),
      }
    : null;

  const latency = source.latency
    ? {
        score: null,
        originTtfbMs: value(source.latency.originTtfbMs),
        infrastructure: typeof source.latency.infrastructure === 'string' ? source.latency.infrastructure : null,
      }
    : null;

  const eco = source.eco
    ? {
        score: null,
        rating: typeof source.eco.rating === 'string' ? source.eco.rating : null,
        ratingLabel: typeof source.eco.color === 'string' ? source.eco.color : null,
        emissionsPerVisitGrams: value(source.eco.emissionsPerVisitGrams),
        monthly10kKg: value(source.eco.monthly10kKg),
        pageWeightMb: value(source.eco.pageWeightMb),
      }
    : null;

  const migration = source.migration
    ? { detectedStack: typeof source.migration.detectedStack === 'string' ? source.migration.detectedStack : null }
    : null;

  const llmo = source.llmo
    ? {
        score: value(source.llmo.score),
        jsonLdBlocksCount: value(source.llmo.jsonLdBlocksCount),
        hasOgTags: flag(source.llmo.hasOgTags),
        hasOgImage: flag(source.llmo.hasOgImage),
        hasCanonical: flag(source.llmo.hasCanonical),
      }
    : null;

  const scored = [health?.score, security?.score, aiReadiness?.score, llmo?.score]
    .filter((v): v is number => typeof v === 'number');
  const providedOverall = value(source.overallScore);
  const overallScore = providedOverall ?? (scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null);

  return {
    ...EMPTY,
    overallScore,
    grade: overallScore === null ? null : typeof source.grade === 'string' ? source.grade : gradeFor(overallScore),
    scoredSections: scored.length,
    health,
    security,
    accessibility,
    aiReadiness,
    latency,
    eco,
    migration,
    llmo,
  };
}

export function parseTelemetryOutput(rawOutput: string, _url: string = ''): ParsedTelemetryData {
  const text = rawOutput || '';

  if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
    try {
      const parsedJson = JSON.parse(text);
      if (parsedJson && (parsedJson.overallScore !== undefined || parsedJson.health || parsedJson.security)) {
        return parseJsonReport(parsedJson);
      }
    } catch {
      // Fall through to log parsing.
    }
  }

  return parseReportText(text);
}
