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
