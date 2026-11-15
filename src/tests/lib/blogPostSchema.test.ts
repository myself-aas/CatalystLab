import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import schemaJson from '@blogs/templates/frontmatter-schema.json';
import {
  BLOG_CATEGORIES,
  BlogPostError,
  mdxToStaticMarkdown,
  parsePost,
  splitFrontmatter,
  toMdxSource,
} from '@blogs/src/lib/postSchema';
import { missingAssets, readPostsSync } from '@blogs/src/lib/readPosts';
import { renderBlogIndexModule } from '@blogs/src/lib/vitePlugin';
import { slugify } from '@blogs/src/utils/slugify';

const VALID = {
  title: 'A valid post',
  date: '2026-11-01',
  excerpt: 'An excerpt that is comfortably longer than the fifty character minimum.',
  author: 'Test Author',
  category: 'Core Performance',
};

const mdx = (frontmatter: Record<string, unknown>, body = '## Heading\n\nBody text here.') =>
  toMdxSource(frontmatter, body);

const problemsOf = (fn: () => unknown): string[] => {
  try {
    fn();
  } catch (error) {
    if (error instanceof BlogPostError) return error.problems;
    throw error;
  }
  throw new Error('expected a BlogPostError');
};

describe('parsePost', () => {
  it('parses valid frontmatter and fills defaults', () => {
    const { meta, body } = parsePost('a-valid-post', mdx(VALID));
    expect(meta).toMatchObject({
      slug: 'a-valid-post',
      seoTitle: 'A valid post',
      status: 'published',
      featured: false,
      tags: [],
      views: 0,
      readTime: '1 min read',
      publishedAt: '2026-11-01T09:00:00.000Z',
    });
    expect(body.trimStart().startsWith('## Heading')).toBe(true);
  });

  it('accepts an unquoted YAML date', () => {
    const source = `---\ntitle: T\ndate: 2026-11-01\nexcerpt: "${VALID.excerpt}"\nauthor: A\ncategory: SecOps\n---\nBody`;
    expect(parsePost('t', source).meta.date).toBe('2026-11-01');
  });

  it.each(['title', 'date', 'excerpt', 'author', 'category'] as const)('names the missing required field %s', (field) => {
    const rest: Record<string, unknown> = { ...VALID };
    delete rest[field];
    const problems = problemsOf(() => parsePost('post', mdx(rest)));
    expect(problems.some((problem) => problem.startsWith(`${field}:`)), problems.join('\n')).toBe(true);
  });

  it('reports every invalid field at once, with the file name', () => {
    let error: unknown;
    try {
      parsePost('post', mdx({ ...VALID, category: 'Gardening', excerpt: 'short', date: '2026-13-45' }), 'blogs/posts/post.mdx');
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(BlogPostError);
    const { problems, message } = error as BlogPostError;
    expect(problems.map((problem) => problem.split(':')[0]).sort()).toEqual(['category', 'date', 'excerpt']);
    expect(message).toContain('blogs/posts/post.mdx');
  });

  it('rejects invalid YAML, a missing frontmatter block and a bad slug', () => {
    expect(problemsOf(() => parsePost('post', '---\ntitle: [unclosed\n---\nBody'))[0]).toMatch(/not valid YAML/);
    expect(problemsOf(() => parsePost('post', '## No frontmatter'))[0]).toMatch(/missing frontmatter/);
    expect(problemsOf(() => parsePost('Bad_Slug', mdx(VALID)))[0]).toMatch(/not a valid slug/);
  });

  it('keeps the JSON schema in step with the validator', () => {
    expect(schemaJson.required).toEqual(['title', 'date', 'excerpt', 'author', 'category']);
    expect(schemaJson.properties.category.enum).toEqual([...BLOG_CATEGORIES]);
  });
});

describe('toMdxSource', () => {
  it('round-trips through splitFrontmatter and drops empty fields', () => {
    const source = toMdxSource({ ...VALID, seoTitle: '', coverImage: undefined, tags: ['a', 'b'] }, '\nBody\n');
    const split = splitFrontmatter(source);
    expect(split?.data).toEqual({ ...VALID, tags: ['a', 'b'] });
    expect(split?.body.trim()).toBe('Body');
  });
});

describe('mdxToStaticMarkdown', () => {
  it('unwraps components, drops imports and comments, and leaves code fences alone', () => {
    const body = [
      "import { Chart } from './chart';",
      '## Title',
      '<Callout type="info" title="Note">',
      'Inside the callout.',
      '</Callout>',
      '{/* hidden */}',
      '```tsx',
      '<Callout>kept in code</Callout>',
      '```',
    ].join('\n');
    expect(mdxToStaticMarkdown(body)).toBe(
      ['## Title', '', 'Inside the callout.', '', '```tsx', '<Callout>kept in code</Callout>', '```'].join('\n')
    );
  });
});

describe('slugify', () => {
  it('never ends in a hyphen after truncation', () => {
    const slug = slugify(`${'a'.repeat(79)} trailing words`);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith('-')).toBe(false);
    expect(slugify('  Hello, MDX World!  ')).toBe('hello-mdx-world');
  });
});

describe('readPostsSync', () => {
  let dir: string | undefined;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = undefined;
  });
  const tempPosts = (files: Record<string, string>) => {
    dir = mkdtempSync(path.join(os.tmpdir(), 'blog-posts-'));
    for (const [name, content] of Object.entries(files)) writeFileSync(path.join(dir, name), content);
    return dir;
  };

  it('returns an empty list for an empty or missing directory', () => {
    expect(readPostsSync({ dir: tempPosts({}) })).toEqual([]);
    expect(readPostsSync({ dir: path.join(os.tmpdir(), 'does-not-exist-blog-dir') })).toEqual([]);
  });

  it('sorts newest first, hides drafts by default and ignores non-mdx files', () => {
    const root = tempPosts({
      'older.mdx': mdx({ ...VALID, date: '2026-01-01' }),
      'newer.mdx': mdx({ ...VALID, date: '2026-02-01' }),
      'hidden.mdx': mdx({ ...VALID, status: 'draft' }),
      'notes.md': 'not a post',
    });
    expect(readPostsSync({ dir: root }).map((post) => post.meta.slug)).toEqual(['newer', 'older']);
    expect(readPostsSync({ dir: root, includeDrafts: true })).toHaveLength(3);
  });

  it('fails with every broken file listed', () => {
    const root = tempPosts({
      'one.mdx': mdx({ ...VALID, title: undefined }),
      'two.mdx': mdx({ ...VALID, author: undefined }),
      'ok.mdx': mdx(VALID),
    });
    expect(() => readPostsSync({ dir: root })).toThrow(/one\.mdx[\s\S]*title[\s\S]*two\.mdx[\s\S]*author/);
  });

  it('flags referenced assets that do not exist', () => {
    const broken = parsePost('p', mdx({ ...VALID, coverImage: '/blogs/assets/images/covers/missing.jpg' }, '![x](../assets/nope.png)'));
    expect(missingAssets(broken)).toEqual(['/blogs/assets/images/covers/missing.jpg', '../assets/nope.png']);
    const ok = parsePost('p', mdx({ ...VALID, authorAvatar: '/blogs/assets/images/avatars/avatar-1.jpg' }));
    expect(missingAssets(ok)).toEqual([]);
  });

  it('accepts every committed post', () => {
    const posts = readPostsSync({ includeDrafts: true });
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) expect(missingAssets(post), post.meta.slug).toEqual([]);
  });
});

describe('renderBlogIndexModule', () => {
  it('emits metadata only, never post bodies', () => {
    const [post] = readPostsSync();
    const code = renderBlogIndexModule([post.meta]);
    expect(code).toContain(`"slug": "${post.meta.slug}"`);
    expect(code).not.toContain(post.body.trim().slice(0, 80));
    expect(code).toContain('export const drafts = [];');
  });
});
