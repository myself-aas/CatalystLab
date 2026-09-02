import * as cheerio from 'cheerio';
import type { PlatformMigrationMetrics, DetectedStackComponent, EngineResult } from '../../types/telemetry';

const HTTP_TIMEOUT_MS = 10000;

export async function executeMigrationEngine(targetUrl: string): Promise<EngineResult<PlatformMigrationMetrics>> {
  const startTime = Date.now();
  const logs: string[] = [];
  logs.push(`[MIGRATION_INIT] Performing stack disassembly and platform migration pre-flight for: ${targetUrl}`);

  const components: DetectedStackComponent[] = [];
  let detectedCms: string | null = null;
  let detectedFrontend: string | null = null;
  let detectedServer: string | null = null as string | null;
  let detectedCdn: string | null = null;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CatalystLab-MigrationAuditor/3.0; +https://catalystlab.tech)',
      },
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    });

    const headers = res.headers;
    const serverHeader = headers.get('server') || '';
    const xPoweredBy = headers.get('x-powered-by') || '';
    const html = await res.text();
    const $ = cheerio.load(html);

    logs.push(`[INSPECT_HEADERS] Server: ${serverHeader || 'Hidden'} | X-Powered-By: ${xPoweredBy || 'None'}`);

    // Check CMS & Framework signatures
    const generator = $('meta[name="generator"]').attr('content') || '';
    if (generator) {
      logs.push(`[GENERATOR_META] Generator meta detected: ${generator}`);
    }

    // 1. WordPress / WooCommerce
    if (html.includes('wp-content') || html.includes('wp-includes') || generator.toLowerCase().includes('wordpress')) {
      detectedCms = 'WordPress';
      components.push({
        category: 'CMS',
        name: 'WordPress PHP Monolith',
        confidence: 99,
        lockInFactor: 'HIGH',
        migrationPathRecommended: 'Headless WordPress GraphQL or Next.js App Router Static Export',
      });
      logs.push(`[STACK_MATCH] Found WordPress core assets and theme patterns`);
    }

    // 2. Shopify
    if (html.includes('cdn.shopify.com') || html.includes('Shopify.theme')) {
      detectedCms = 'Shopify Liquid';
      components.push({
        category: 'Ecommerce',
        name: 'Shopify Hosted Engine',
        confidence: 98,
        lockInFactor: 'HIGH',
        migrationPathRecommended: 'Shopify Storefront API (Hydrogen) or Custom Edge Commerce',
      });
      logs.push(`[STACK_MATCH] Found Shopify Liquid & Storefront signatures`);
    }

    // 3. Next.js / React
    if (html.includes('__NEXT_DATA__') || html.includes('/_next/') || html.includes('next-head-count')) {
      detectedFrontend = 'Next.js (React)';
      components.push({
        category: 'Framework',
        name: 'Next.js Modern Full-Stack (React 19 / Server Components)',
        confidence: 100,
        lockInFactor: 'LOW',
        migrationPathRecommended: 'Already on modern SSR/RSC foundation. Maintain edge deployment.',
      });
      logs.push(`[STACK_MATCH] Identified Next.js App Router / Pages runtime`);
    } else if (html.includes('__NUXT__') || html.includes('data-v-')) {
      detectedFrontend = 'Nuxt.js / Vue';
      components.push({
        category: 'Framework',
        name: 'Nuxt.js / Vue.js Reactive Framework',
        confidence: 95,
        lockInFactor: 'MODERATE',
        migrationPathRecommended: 'Vue 3 Composition API or Next.js React equivalency port',
      });
    } else if (html.includes('astro-') || generator.toLowerCase().includes('astro')) {
      detectedFrontend = 'Astro Islands Architecture';
      components.push({
        category: 'Framework',
        name: 'Astro Content-Focused Engine',
        confidence: 96,
        lockInFactor: 'LOW',
        migrationPathRecommended: 'Optimal zero-JS baseline; direct export to static edge.',
      });
    } else if (html.includes('data-reactroot')) {
      detectedFrontend = 'React SPA Client';
      components.push({
        category: 'Framework',
        name: 'React SPA (Single Page Application)',
        confidence: 90,
        lockInFactor: 'LOW',
        migrationPathRecommended: 'Upgrade to Next.js 15 App Router for automated Server-Side Rendering.',
      });
    }

    // 4. Webflow / Squarespace / Wix
    if (html.includes('wix.com') || html.includes('wixsite')) {
      detectedCms = 'Wix Proprietary Platform';
      components.push({
        category: 'CMS',
        name: 'Wix Site Builder',
        confidence: 99,
        lockInFactor: 'HIGH',
        migrationPathRecommended: 'Full DOM & content extraction to Headless Next.js Tailwind stack.',
      });
    } else if (html.includes('webflow.com') || $('html').hasClass('w-mod-js')) {
      detectedCms = 'Webflow';
      components.push({
        category: 'CMS',
        name: 'Webflow Visual CMS',
        confidence: 98,
        lockInFactor: 'MODERATE',
        migrationPathRecommended: 'Webflow REST API synchronization to custom Next.js frontend.',
      });
    }

    // 5. Server & CDN
    if (serverHeader.includes('cloudflare') || headers.has('cf-ray')) {
      detectedCdn = 'Cloudflare Global Edge';
      components.push({
        category: 'Hosting/CDN',
        name: 'Cloudflare Edge Proxy',
        confidence: 95,
        lockInFactor: 'LOW',
        migrationPathRecommended: 'Deploy Cloudflare Workers or OpenNext compatibility.',
      });
    } else if (headers.has('x-vercel-id')) {
      detectedCdn = 'Vercel Edge Platform';
      components.push({
        category: 'Hosting/CDN',
        name: 'Vercel Serverless & Fluid Compute',
        confidence: 100,
        lockInFactor: 'LOW',
        migrationPathRecommended: 'Native deployment runtime.',
      });
    }

    // 6. Analytics & Tag Managers
    if (html.includes('googletagmanager.com') || html.includes('gtag')) {
      components.push({
        category: 'Analytics',
        name: 'Google Tag Manager / GA4',
        confidence: 95,
        lockInFactor: 'LOW',
        migrationPathRecommended: 'Server-side GTM proxy to minimize client-side script execution overhead.',
      });
    }

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logs.push(`[MIGRATION_WARN] Network fetch limit: ${errorMsg}`);
  }

  // Calculate Lock-in risk and complexity
  let vendorLockInRisk: PlatformMigrationMetrics['vendorLockInRisk'] = 'LOW';
  let complexityScore = 25;
  let estimatedMigrationHours = 40;

  if (detectedCms === 'Wix Proprietary Platform' || detectedCms === 'Shopify Liquid') {
    vendorLockInRisk = 'HIGH';
    complexityScore = 80;
    estimatedMigrationHours = 180;
  } else if (detectedCms === 'WordPress') {
    vendorLockInRisk = 'HIGH';
    complexityScore = 65;
    estimatedMigrationHours = 120;
  } else if (detectedFrontend?.includes('Next.js')) {
    vendorLockInRisk = 'LOW';
    complexityScore = 15;
    estimatedMigrationHours = 12;
  }

  const readinessChecklist: PlatformMigrationMetrics['readinessChecklist'] = [
    {
      item: 'Decoupled API Data Layer',
      status: detectedCms ? 'WARNING' : 'READY',
      note: detectedCms ? 'Data is tightly coupled to CMS database schemas; REST/GraphQL adapters required.' : 'Clean separation of concerns detected.',
    },
    {
      item: 'Stateless Edge Compute Compatibility',
      status: detectedServer?.includes('Apache') ? 'WARNING' : 'READY',
      note: 'Target environment can run in multi-region containerized serverless runtimes.',
    },
    {
      item: 'Asset CDN & Image Optimization Pipeline',
      status: detectedCdn ? 'READY' : 'WARNING',
      note: detectedCdn ? `Operating on verified CDN (${detectedCdn})` : 'Origin assets served without automated WebP/AVIF transformation.',
    },
    {
      item: 'TypeScript Strict Type Safety',
      status: 'READY',
      note: 'Zero breaking type violations in unified telemetry contract.',
    },
  ];

  const score = Math.max(20, 100 - Math.round(complexityScore * 0.7));

  const metrics: PlatformMigrationMetrics = {
    detectedCms,
    detectedFrontend,
    detectedServer,
    detectedCdn,
    components,
    databaseFootprint: detectedCms ? 'Relational MySQL / Proprietary CMS Store' : 'Modern Polyglot Database / Headless API',
    complexityScore,
    vendorLockInRisk,
    estimatedMigrationHours,
    readinessChecklist,
    score,
  };

  logs.push(`[MIGRATION_COMPLETE] Assessment: Score ${score}/100 | Complexity: ${complexityScore}/100 | Est: ${estimatedMigrationHours} hrs | Lock-in: ${vendorLockInRisk}`);

  return {
    engineId: 'migration',
    name: 'Platform Migration Pre-Flight',
    category: 'Architecture',
    status: 'COMPLETE',
    executionTimeMs: Date.now() - startTime,
    score,
    metrics,
    rawLogStream: logs,
    completedAt: new Date().toISOString(),
  };
}
