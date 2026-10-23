import { existsSync, readFileSync } from 'fs';
import path from 'path';

// Route inventory written by `scripts/prerender.ts` at build time (owner
// decision D11). It lets the Node host tell three cases apart:
//   1. a prerendered shell exists at dist/<route>/index.html  -> serve it
//   2. the path is a client-only SPA route (dynamic segments) -> serve the app shell
//   3. anything else                                          -> real 404
// Without this the server answered every unknown path with index.html and a
// 200, which is what made the legacy `.html` URLs and typos indexable.

export interface RoutesManifest {
  generatedAt?: string;
  origin?: string;
  prerendered?: string[];
  appRoutes?: string[];
  dynamicRoutes?: string[];
  spaRoutes?: string[];
  /** Slugs with a prerendered page under /blogs/<slug> (SEO audit issue 4). */
  blogSlugs?: string[];
  /** 301 map, mirrored in public/_redirects (SEO audit issue 5). */
  aliases?: Record<string, string>;
}

export interface CompiledRoutes {
  manifest: RoutesManifest;
  matchers: RegExp[];
  /** Legacy `.html` alias -> clean route, for the 301s required by D14. */
  legacyRedirects: Map<string, string>;
}

function toMatcher(route: string): RegExp | null {
  if (!route.startsWith('/') || route === '*') return null;
  const pattern = route
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) return '[^/]+';
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${pattern}/?$`);
}

export function loadRoutesManifest(distPath: string): CompiledRoutes | null {
  const manifestPath = path.join(distPath, 'routes.json');
  if (!existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as RoutesManifest;
    const routes = Array.from(new Set([...(manifest.spaRoutes || []), ...(manifest.dynamicRoutes || [])]));
    const matchers = routes.map(toMatcher).filter((matcher): matcher is RegExp => matcher !== null);

    // Every clean route that also has a legacy `.html` alias in the router.
    const legacyRedirects = new Map<string, string>();
    for (const route of routes) {
      if (route.includes(':')) continue; // dynamic segments have no .html alias
      if (route === '/') {
        legacyRedirects.set('/index.html', '/');
        continue;
      }
      legacyRedirects.set(`${route}.html`, route);
    }

    return { manifest, matchers, legacyRedirects };
  } catch {
    return null;
  }
}

export function matchesSpaRoute(compiled: CompiledRoutes, pathname: string): boolean {
  return compiled.matchers.some((matcher) => matcher.test(pathname));
}

/**
 * `/blogs/<slug>` is only a real page when the build wrote one. Without this
 * check any invented slug answered 200 with the home shell (SEO audit 2026-10-23,
 * issue 3), which made the blog a soft-404 factory.
 */
export function isKnownBlogPath(compiled: CompiledRoutes, pathname: string): boolean {
  const match = pathname.match(/^\/blogs?\/([^/]+)\/?$/);
  if (!match) return false;
  const slugs = compiled.manifest.blogSlugs ?? [];
  let slug = match[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    return false;
  }
  return slugs.includes(slug);
}
