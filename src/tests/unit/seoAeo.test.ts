// @vitest-environment node
/**
 * AEO and content invariants (2026-10-23).
 *
 * These pin the things an answer engine needs and a reviewer cannot see by
 * eyeballing a page: that every engine page ships real question/answer blocks,
 * that every article body exists in a module the build can read, and that no
 * page's "sources" list points at a relative or non-HTTPS URL. They exist
 * because the previous failure mode was silent: prose that lived only in a
 * client render, and manifests whose counts drifted from the product.
 */
import { describe, expect, it } from 'vitest';
import { ENGINE_SEO } from '@/data/engineSeo';
import { BLOG_SEO } from '@/data/blogSeo';
import { BLOG_CONTENT } from '@/data/blogContent';
import { DOC_SEO, DOC_SOURCES } from '@/data/docsSeo';

const wordCount = (value: string) => value.trim().split(/\s+/).length;

describe('engine answer blocks', () => {
  it('gives every engine at least three questions', () => {
    for (const engine of ENGINE_SEO) {
      expect(engine.faq.length, engine.path).toBeGreaterThanOrEqual(3);
    }
  });

  it('writes answers that stand alone at 40 to 60 words', () => {
    for (const engine of ENGINE_SEO) {
      for (const entry of engine.faq) {
        const words = wordCount(entry.answer);
        expect(words, `${engine.path}: ${entry.question}`).toBeGreaterThanOrEqual(40);
        expect(words, `${engine.path}: ${entry.question}`).toBeLessThanOrEqual(60);
      }
    }
  });

  it('phrases every question as a question', () => {
    for (const engine of ENGINE_SEO) {
      for (const entry of engine.faq) {
        expect(entry.question.trim().endsWith('?'), `${engine.path}: ${entry.question}`).toBe(true);
      }
    }
  });

  it('does not reuse a question across engines', () => {
    const seen = new Map<string, string>();
    for (const engine of ENGINE_SEO) {
      for (const entry of engine.faq) {
        const previous = seen.get(entry.question);
        expect(previous, `${entry.question} appears on ${previous} and ${engine.path}`).toBeUndefined();
        seen.set(entry.question, engine.path);
      }
    }
  });

  it('cites at least two external sources per engine, all HTTPS', () => {
    for (const engine of ENGINE_SEO) {
      expect(engine.sources.length, engine.path).toBeGreaterThanOrEqual(2);
      for (const [href] of engine.sources) {
        expect(href.startsWith('https://'), `${engine.path}: ${href}`).toBe(true);
      }
    }
  });
});

describe('article bodies', () => {
  it('has a body for every published post', () => {
    for (const post of BLOG_SEO) {
      expect(BLOG_CONTENT[post.slug], post.slug).toBeTypeOf('string');
    }
  });

  it('does not carry a body for a slug that is not published', () => {
    const published = new Set(BLOG_SEO.map((post) => post.slug));
    for (const slug of Object.keys(BLOG_CONTENT)) {
      expect(published.has(slug), slug).toBe(true);
    }
  });

  it('clears the thin-content floor', () => {
    for (const [slug, body] of Object.entries(BLOG_CONTENT)) {
      expect(wordCount(body), slug).toBeGreaterThanOrEqual(400);
    }
  });

  it('links at least two external sources per article', () => {
    for (const [slug, body] of Object.entries(BLOG_CONTENT)) {
      const external = body.match(/\]\(https:\/\/[^)]+\)/g) ?? [];
      expect(external.length, slug).toBeGreaterThanOrEqual(2);
    }
  });

  it('opens every article with a heading rather than a bare paragraph', () => {
    for (const [slug, body] of Object.entries(BLOG_CONTENT)) {
      expect(body.startsWith('## '), slug).toBe(true);
    }
  });

  it('uses no em dashes or banned filler in the prose', () => {
    const banned = /\b(delve|leverage|seamless|robust|streamline|furthermore|moreover|utilize|utilise)\b/i;
    for (const [slug, body] of Object.entries(BLOG_CONTENT)) {
      expect(banned.test(body), slug).toBe(false);
      expect(body.includes('—'), slug).toBe(false);
    }
  });
});

describe('product claims stay consistent', () => {
  it('describes the engine set as eight engines plus a master audit', () => {
    const engines = ENGINE_SEO.filter((engine) => engine.path !== '/master-audit').length;
    expect(engines).toBe(8);
    expect(ENGINE_SEO.some((engine) => engine.path === '/master-audit')).toBe(true);
  });

  it('cites the standard behind every documentation page', () => {
    for (const doc of DOC_SEO) {
      const sources = DOC_SOURCES[doc.path];
      expect(sources, doc.path).toBeDefined();
      expect(sources.length, doc.path).toBeGreaterThanOrEqual(1);
      for (const [href] of sources) {
        expect(href.startsWith('https://'), `${doc.path}: ${href}`).toBe(true);
      }
    }
    for (const path of Object.keys(DOC_SOURCES)) {
      expect(DOC_SEO.some((doc) => doc.path === path), path).toBe(true);
    }
  });

  it('covers every documentation page in the generated manifests', () => {
    // llms.txt is built from DOC_SEO, so a page missing here is missing there.
    expect(DOC_SEO.length).toBeGreaterThanOrEqual(16);
    for (const doc of DOC_SEO) {
      expect(doc.summary.trim().length, doc.path).toBeGreaterThan(40);
    }
  });
});
