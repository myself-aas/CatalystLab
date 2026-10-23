// @vitest-environment node
/**
 * Guards for the programmatic page families (programmatic-seo skill).
 *
 * The generated pages are only as good as the tables behind them: a renamed
 * engine, a docs route added without copy, or a link pointing at a redirected
 * alias all produce a page that reads as filler or resolves as a redirect.
 * These assertions run on every `npm test`, so drift fails the build rather
 * than the next crawl.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { DOC_SEO, DOC_SEO_BY_PATH } from '@/data/docsSeo';
import { ENGINE_SEO, ENGINE_SEO_BY_PATH, engineSeoForPath } from '@/data/engineSeo';
import { BLOG_SEO } from '@/data/blogSeo';
import { ENGINES_MAP } from '@/data/engines';
import { PLAYGROUND_ENGINE_IDS, isPlaygroundEngineId } from '@/data/playgroundEngines';
import { PLAYGROUND_ENGINES } from '@/components/playground/PlaygroundNavSidebar';
import { ROUTE_ALIASES } from '@/config/routeAliases';
import { isDomainSlug } from '@/utils/slugUtils';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const prerenderSource = readFileSync(path.join(repoRoot, 'scripts/prerender.ts'), 'utf8');

/** Every docs path the prerender writes, taken from its own route table. */
const prerenderedDocPaths = new Set(
  Array.from(prerenderSource.matchAll(/\['(\/docs\/[a-z-]+)', '[^']*'\]/g)).map((match) => match[1])
);

describe('engine landing pages', () => {
  it('covers every engine in ENGINES_MAP plus the master audit', () => {
    const mapIds = Object.keys(ENGINES_MAP).sort();
    const covered = ENGINE_SEO.map((entry) => entry.engineId).filter((id) => id !== 'master').sort();
    expect(covered).toEqual(mapIds);
  });

  it('keeps names, routes and docs targets in step with ENGINES_MAP', () => {
    for (const entry of ENGINE_SEO) {
      if (entry.engineId === 'master') continue;
      const engine = ENGINES_MAP[entry.engineId];
      expect(engine, `${entry.engineId} is missing from ENGINES_MAP`).toBeDefined();
      expect(entry.catalystName).toBe(engine.catalystName);
      expect(entry.docsPath).toBe(engine.route);
    }
  });

  it('gives every engine its own measurement list, with no shared lines', () => {
    const seen = new Map<string, string>();
    for (const entry of ENGINE_SEO) {
      expect(entry.measures.length, `${entry.engineId} measures`).toBeGreaterThanOrEqual(4);
      for (const measure of entry.measures) {
        const owner = seen.get(measure);
        expect(owner, `"${measure}" is used by both ${owner} and ${entry.engineId}`).toBeUndefined();
        seen.set(measure, entry.engineId);
      }
    }
  });

  it('states what each engine cannot measure', () => {
    for (const entry of ENGINE_SEO) {
      expect(entry.limits.length, `${entry.engineId} limits`).toBeGreaterThanOrEqual(2);
    }
  });

  it('keeps every title inside the 60-character budget and unique', () => {
    const titles = new Set<string>();
    for (const entry of ENGINE_SEO) {
      expect(entry.seoTitle.length, entry.seoTitle).toBeLessThanOrEqual(60);
      expect(titles.has(entry.seoTitle), `duplicate title: ${entry.seoTitle}`).toBe(false);
      titles.add(entry.seoTitle);
    }
  });

  it('keeps every meta description inside 70 to 160 characters and unique', () => {
    const descriptions = new Set<string>();
    for (const entry of ENGINE_SEO) {
      expect(entry.metaDescription.length, `${entry.engineId}: ${entry.metaDescription.length}`).toBeGreaterThanOrEqual(70);
      expect(entry.metaDescription.length, `${entry.engineId}: ${entry.metaDescription.length}`).toBeLessThanOrEqual(160);
      expect(descriptions.has(entry.metaDescription)).toBe(false);
      descriptions.add(entry.metaDescription);
    }
  });

  it('never points a heading at the docs page of the same engine', () => {
    // Cannibalisation guard: the landing page and the reference answer
    // different queries and must not ship the same H1.
    for (const entry of ENGINE_SEO) {
      const doc = DOC_SEO_BY_PATH[entry.docsPath];
      if (!doc) continue;
      expect(entry.heading).not.toBe(doc.heading);
    }
  });

  it('resolves a path with and without a trailing slash', () => {
    expect(engineSeoForPath('/health')?.engineId).toBe('health');
    expect(engineSeoForPath('/health/')?.engineId).toBe('health');
    expect(engineSeoForPath('/not-an-engine')).toBeUndefined();
  });
});

describe('documentation pages', () => {
  it('covers every docs route the prerender writes', () => {
    const covered = new Set(DOC_SEO.map((entry) => entry.path));
    for (const docPath of prerenderedDocPaths) {
      expect(covered.has(docPath), `no docs copy for ${docPath}`).toBe(true);
    }
    expect(covered.has('/docs')).toBe(true);
  });

  it('does not invent docs routes that the router does not have', () => {
    for (const entry of DOC_SEO) {
      expect(prerenderedDocPaths.has(entry.path) || entry.path === '/docs', `${entry.path} is not a docs route`).toBe(true);
    }
  });

  it('gives every page its own summary and title', () => {
    const summaries = new Set<string>();
    const titles = new Set<string>();
    for (const entry of DOC_SEO) {
      expect(summaries.has(entry.summary), `duplicate summary on ${entry.path}`).toBe(false);
      expect(titles.has(entry.seoTitle), `duplicate title on ${entry.path}`).toBe(false);
      summaries.add(entry.summary);
      titles.add(entry.seoTitle);
    }
  });

  it('keeps docs metadata inside the budgets', () => {
    for (const entry of DOC_SEO) {
      expect(entry.seoTitle.length, entry.path).toBeLessThanOrEqual(60);
      expect(entry.summary.length, entry.path).toBeGreaterThanOrEqual(70);
      expect(entry.summary.length, entry.path).toBeLessThanOrEqual(160);
      expect(entry.points.length, entry.path).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('generated page links', () => {
  const aliasPaths = new Set(Object.keys(ROUTE_ALIASES));

  it('never links to a path that redirects', () => {
    const links = [
      ...DOC_SEO.flatMap((entry) => entry.related.map(([href]) => href)),
      ...ENGINE_SEO.flatMap((entry) => [...entry.related, entry.docsPath])
    ];
    for (const href of links) {
      expect(aliasPaths.has(href), `${href} is a 301 alias`).toBe(false);
    }
  });

  it('never links to the page it is on', () => {
    for (const entry of DOC_SEO) {
      for (const [href] of entry.related) {
        expect(href, `${entry.path} links to itself`).not.toBe(entry.path);
      }
    }
  });
});

describe('open-ended page families', () => {
  it('accepts an engine id the playground actually has, and rejects anything else', () => {
    for (const id of PLAYGROUND_ENGINE_IDS) expect(isPlaygroundEngineId(id)).toBe(true);
    for (const id of ['nope', '../master', '', 'MASTER']) expect(isPlaygroundEngineId(id)).toBe(false);
  });

  it('keeps the server list in step with the playground sidebar', () => {
    expect(PLAYGROUND_ENGINES.map((engine) => engine.id)).toEqual([...PLAYGROUND_ENGINE_IDS]);
  });

  it('accepts report slugs that can name a domain, and rejects everything else', () => {
    for (const slug of ['stripe-com', 'news-ycombinator-com', 'catalystlab-tech', 'example-ai']) {
      expect(isDomainSlug(slug), slug).toBe(true);
    }
    for (const slug of ['not-a-post', 'foo', '', 'stripe', 'a--b', '-com', 'x'.repeat(300)]) {
      expect(isDomainSlug(slug), slug).toBe(false);
    }
  });
});

describe('blog titles', () => {
  it('gives every post a search title inside the budget', () => {
    for (const post of BLOG_SEO) {
      expect(post.seoTitle.length, post.slug).toBeLessThanOrEqual(60);
    }
  });

  it('does not reuse an engine or docs title', () => {
    const taken = new Set([...ENGINE_SEO.map((e) => e.seoTitle), ...DOC_SEO.map((e) => e.seoTitle)]);
    for (const post of BLOG_SEO) {
      expect(taken.has(post.seoTitle), post.slug).toBe(false);
    }
  });
});
