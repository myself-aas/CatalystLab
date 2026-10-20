import { TOTAL_POPS_COUNT } from '../lib/edge/pops';

// Single source of truth for the site's public identity and its search
// indexing policy. Owner decisions:
//   D14 — `www.catalystlab.tech` is canonical; the apex 301s to it.
//   D15 — the registered entity name is "CatalystLab Inc."; structured data
//         carries the real offer catalog and the real edge-node count.
//   D11 — public routes are prerendered and indexable; application routes are
//         client-only and noindex.
//   Q29 — one monitored legal mailbox; no DPO unless one becomes required.

/** Fallback canonical origin when no environment override is configured. */
const DEFAULT_ORIGIN = 'https://www.catalystlab.tech';

/**
 * The origin every canonical, og:url and sitemap entry is composed from.
 *
 * Q42: `VITE_APP_ORIGIN` (client build) and `APP_ORIGIN` (Node: prerender
 * script, server, `npm run check:env`) override it, so a staging deployment
 * does not publish www-canonical URLs pointing at production. Both are read
 * defensively because this file is imported from the browser bundle and from
 * Node.
 */
function configuredOrigin(): string {
  const viteEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string | undefined> }).env
      : undefined;
  const fromVite = viteEnv?.VITE_APP_ORIGIN?.trim();
  if (fromVite) return fromVite.replace(/\/+$/, '');

  const fromNode = typeof process !== 'undefined' ? process.env?.APP_ORIGIN?.trim() : undefined;
  if (fromNode) return fromNode.replace(/\/+$/, '');

  return DEFAULT_ORIGIN;
}

export const SITE_ORIGIN = configuredOrigin();

/** Registered entity name used in structured data and legal copy (D15). */
export const ENTITY_NAME = 'CatalystLab Inc.';

/** The single monitored legal mailbox (Q29). No physical address is published. */
export const LEGAL_MAILBOX = 'legal@catalystlab.tech';
export const SUPPORT_MAILBOX = 'support@catalystlab.tech';
export const SECURITY_MAILBOX = 'security@catalystlab.tech';

/** Real edge-node count, derived from the PoP registry (D15). */
export const EDGE_NODE_COUNT = TOTAL_POPS_COUNT;

/**
 * Application surfaces: authenticated product UI, never a landing page.
 * Prerendered as client-only shells with `noindex` (D11).
 */
export const APP_ROUTE_PREFIXES = [
  '/dashboard',
  '/admin',
  '/app',
  '/audit',
  '/user-dashboard',
  '/hud',
  '/hub'
] as const;

/** Authentication surfaces: indexable content is nil, so they stay out of the index. */
export const AUTH_ROUTE_PREFIXES = [
  '/login',
  '/signin',
  '/register',
  '/signup',
  '/forgot-password',
  '/reset-password'
] as const;

function normalizePath(raw: string): string {
  const withoutQuery = raw.split('?')[0].split('#')[0];
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed || '/';
}

function matchesPrefixes(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isAppRoute(rawPath: string): boolean {
  return matchesPrefixes(normalizePath(rawPath), APP_ROUTE_PREFIXES);
}

export function isAuthRoute(rawPath: string): boolean {
  return matchesPrefixes(normalizePath(rawPath), AUTH_ROUTE_PREFIXES);
}

/** Editor surfaces (blog composers) are app routes too. */
export function isEditorRoute(rawPath: string): boolean {
  const path = normalizePath(rawPath);
  return /\/(create|new|edit)(\/|$)/.test(path);
}

/**
 * The robots directive for a path: application, authentication and editor
 * surfaces are `noindex, nofollow`; everything else is indexable (D11).
 */
export function robotsDirectiveFor(rawPath: string): string {
  if (isAppRoute(rawPath) || isAuthRoute(rawPath) || isEditorRoute(rawPath)) {
    return 'noindex, nofollow';
  }
  return 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
}

/** Absolute canonical URL for a path on the canonical host. */
export function canonicalUrlFor(rawPath: string): string {
  const path = normalizePath(rawPath);
  return `${SITE_ORIGIN}${path === '/' ? '/' : path}`;
}
