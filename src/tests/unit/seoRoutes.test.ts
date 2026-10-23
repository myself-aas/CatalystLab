// @vitest-environment node
/**
 * Guards for the SEO audit 2026-10-23 fixes that are data, not markup:
 *
 *   - issue 5: one URL per document, so the alias map has no chains and every
 *     target survives, and `public/_redirects` mirrors the map for the edge;
 *   - issue 4: the prerender's blog metadata cannot drift from the posts the
 *     app renders.
 *
 * These run on every `npm test`, so a new duplicate mount or an edited blog
 * title fails here rather than shipping as a second indexable URL.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { ROUTE_ALIASES, SPLAT_ALIASES, aliasTargetFor, splatAliasFor } from '@/config/routeAliases';
import { BLOG_SEO, BLOG_SEO_BY_SLUG, isKnownBlogSlug } from '@/data/blogSeo';
import { ENGINE_SEEDED_BLOGS } from '@/data/engineBlogs';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const appSource = readFileSync(path.join(repoRoot, 'src/App.tsx'), 'utf8');
const redirects = readFileSync(path.join(repoRoot, 'public/_redirects'), 'utf8');

/** Every literal `path="..."` the router declares. */
const routerPaths = new Set(
  Array.from(appSource.matchAll(/path="([^"]+)"/g)).map((match) =>
    match[1].startsWith('/') ? match[1] : `/${match[1]}`
  )
);

describe('route aliases (audit issue 5)', () => {
  it('never chains: no alias target is itself an alias', () => {
    for (const target of Object.values(ROUTE_ALIASES)) {
      expect(ROUTE_ALIASES[target], `${target} is both a target and an alias`).toBeUndefined();
    }
  });

  it('never points at a path the router does not declare', () => {
    for (const [from, target] of Object.entries(ROUTE_ALIASES)) {
      expect(routerPaths.has(target), `${from} -> ${target} is not a route in src/App.tsx`).toBe(true);
    }
  });

  it('never redirects a page to itself', () => {
    for (const [from, target] of Object.entries(ROUTE_ALIASES)) {
      expect(from).not.toBe(target);
    }
  });

  it('mirrors every alias as a 301 in public/_redirects', () => {
    for (const [from, target] of Object.entries(ROUTE_ALIASES)) {
      const rule = new RegExp(`^${from.replace(/[/.]/g, '\\$&')}\\s+${target.replace(/[/.]/g, '\\$&')}\\s+301\\s*$`, 'm');
      expect(rule.test(redirects), `public/_redirects is missing "${from} ${target} 301"`).toBe(true);
    }
  });

  it('mirrors the splat aliases as 301s too', () => {
    for (const [from, target] of Object.entries(SPLAT_ALIASES)) {
      expect(redirects.includes(`${from}/*`) && redirects.includes(`${target}/:splat`)).toBe(true);
    }
  });

  it('resolves a path and its trailing-slash form identically', () => {
    expect(aliasTargetFor('/docs/health')).toBe('/docs/vitalzyme');
    expect(aliasTargetFor('/docs/health/')).toBe('/docs/vitalzyme');
    expect(aliasTargetFor('/docs/vitalzyme')).toBeUndefined();
  });

  it('rewrites the /blog splat onto /blogs and leaves everything else alone', () => {
    expect(splatAliasFor('/blog/some-slug')).toBe('/blogs/some-slug');
    expect(splatAliasFor('/blog')).toBe('/blogs');
    expect(splatAliasFor('/blogs/some-slug')).toBeUndefined();
  });
});

describe('blog SEO metadata (audit issue 4)', () => {
  const seeded = Object.values(ENGINE_SEEDED_BLOGS).flat();

  it('covers every seeded post exactly once', () => {
    const seededSlugs = seeded.map((post) => post.slug).sort();
    expect(BLOG_SEO.map((entry) => entry.slug).sort()).toEqual(seededSlugs);
    expect(new Set(BLOG_SEO.map((entry) => entry.slug)).size).toBe(BLOG_SEO.length);
  });

  it('copies title, excerpt, author and category from the post data', () => {
    for (const post of seeded) {
      const entry = BLOG_SEO_BY_SLUG[post.slug];
      expect(entry, `no SEO entry for ${post.slug}`).toBeDefined();
      expect(entry.title).toBe(post.title);
      expect(entry.excerpt).toBe(post.excerpt);
      expect(entry.author).toBe(post.authorName);
      expect(entry.category).toBe(post.category);
    }
  });

  it('keeps every search-result title inside the 60-character budget', () => {
    for (const entry of BLOG_SEO) {
      expect(entry.seoTitle.length, `${entry.slug} title is ${entry.seoTitle.length} chars`).toBeLessThanOrEqual(60);
    }
  });

  it('keeps every description inside the 70 to 160 character range', () => {
    for (const entry of BLOG_SEO) {
      expect(entry.excerpt.length, `${entry.slug} description`).toBeGreaterThanOrEqual(70);
      expect(entry.excerpt.length, `${entry.slug} description`).toBeLessThanOrEqual(160);
    }
  });

  it('dates every post, and never in the future', () => {
    for (const entry of BLOG_SEO) {
      expect(Number.isNaN(Date.parse(entry.publishedAt))).toBe(false);
      expect(Date.parse(entry.publishedAt)).toBeLessThanOrEqual(Date.now());
    }
  });

  it('recognises a known slug and rejects an invented one', () => {
    expect(isKnownBlogSlug(BLOG_SEO[0].slug)).toBe(true);
    expect(isKnownBlogSlug('not-a-post')).toBe(false);
    expect(isKnownBlogSlug('__proto__')).toBe(false);
  });
});
