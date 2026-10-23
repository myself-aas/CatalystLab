// @vitest-environment node
/**
 * Sitemap sections (2026-10-23).
 *
 * The split is only useful if it is exhaustive and disjoint: every indexable
 * path must land in exactly one file, and no path may appear in two. These
 * assertions pin the classifier to the tables that generate the pages, so a new
 * engine or docs route cannot quietly fall into the catch-all `core` section.
 */
import { describe, expect, it } from 'vitest';
import {
  SITEMAP_INDEX_PATH,
  SITEMAP_SECTIONS,
  changefreqFor,
  priorityFor,
  sitemapPathForSection,
  sitemapSectionFor
} from '@/config/sitemapSections';
import { ENGINE_SEO } from '@/data/engineSeo';
import { DOC_SEO } from '@/data/docsSeo';
import { BLOG_SEO } from '@/data/blogSeo';

describe('sitemap sections', () => {
  it('declares four sections with unique ids and paths', () => {
    const ids = SITEMAP_SECTIONS.map((section) => section.id);
    const paths = SITEMAP_SECTIONS.map((section) => section.path);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(ids).toEqual(['core', 'engines', 'docs', 'blog']);
  });

  it('keeps the index separate from the section files', () => {
    const paths = SITEMAP_SECTIONS.map((section) => section.path);
    expect(paths).not.toContain(SITEMAP_INDEX_PATH);
    expect(SITEMAP_INDEX_PATH).toBe('/sitemap.xml');
  });

  it('names every section file with an .xml extension', () => {
    for (const section of SITEMAP_SECTIONS) {
      expect(section.path.startsWith('/')).toBe(true);
      expect(section.path.endsWith('.xml')).toBe(true);
    }
  });

  it('resolves a section id to its file, and rejects an unknown id', () => {
    expect(sitemapPathForSection('docs')).toBe('/sitemap-docs.xml');
    // @ts-expect-error - the guard exists for callers that bypass the type
    expect(() => sitemapPathForSection('reports')).toThrow();
  });
});

describe('section assignment', () => {
  it('puts every engine landing page in the engines section', () => {
    for (const engine of ENGINE_SEO) {
      expect(sitemapSectionFor(engine.path), engine.path).toBe('engines');
    }
  });

  it('puts every documentation page in the docs section', () => {
    for (const doc of DOC_SEO) {
      expect(sitemapSectionFor(doc.path), doc.path).toBe('docs');
    }
  });

  it('puts the blog index and every post in the blog section', () => {
    expect(sitemapSectionFor('/blogs')).toBe('blog');
    for (const post of BLOG_SEO) {
      expect(sitemapSectionFor(`/blogs/${post.slug}`)).toBe('blog');
    }
  });

  it('puts marketing, pricing, trust and legal pages in core', () => {
    for (const path of ['/', '/pricing', '/about', '/contact', '/security', '/compare', '/products', '/api-docs', '/playground', '/reports', '/legal', '/privacy', '/terms', '/cookies', '/refund']) {
      expect(sitemapSectionFor(path), path).toBe('core');
    }
  });

  it('normalises a trailing slash before classifying', () => {
    expect(sitemapSectionFor('/health/')).toBe('engines');
    expect(sitemapSectionFor('/docs/health/')).toBe('docs');
    expect(sitemapSectionFor('/blogs/')).toBe('blog');
    expect(sitemapSectionFor('/pricing/')).toBe('core');
  });

  it('does not mistake a prefix for a section', () => {
    expect(sitemapSectionFor('/docsomething')).toBe('core');
    expect(sitemapSectionFor('/blogsomething')).toBe('core');
    expect(sitemapSectionFor('/healthcare')).toBe('core');
  });
});

describe('sitemap hints', () => {
  it('marks only the home page as daily', () => {
    expect(changefreqFor('/')).toBe('daily');
    for (const path of ['/pricing', '/health', '/docs', '/blogs/stripe-com']) {
      expect(changefreqFor(path)).toBe('weekly');
    }
  });

  it('ranks the home page above engines, engines above docs', () => {
    expect(Number(priorityFor('/'))).toBeGreaterThan(Number(priorityFor('/health')));
    expect(Number(priorityFor('/health'))).toBeGreaterThan(Number(priorityFor('/docs')));
    expect(Number(priorityFor('/pricing'))).toBeGreaterThanOrEqual(Number(priorityFor('/docs')));
    for (const path of ['/', '/pricing', '/health', '/docs', '/blogs/x-com']) {
      const value = Number(priorityFor(path));
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('treats the blog index as more important than a post', () => {
    expect(Number(priorityFor('/blogs'))).toBeGreaterThan(Number(priorityFor('/blogs/stripe-com')));
  });
});
