/**
 * Single source of truth for blog post frontmatter.
 *
 * Pure module (no `fs`, no Vite APIs) so the same parser runs in three places:
 * the Vite `virtual:blog-index` plugin, the Node prerender script and the unit
 * tests. A post that fails here fails the build with the file and field named.
 */
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { calculateReadingTime } from '../utils/readingTime';
import { BLOG_CATEGORIES } from './categories';

export { BLOG_CATEGORIES };

/** Slugs are filenames: lowercase words joined by single hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a calendar date in YYYY-MM-DD form')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'is not a real date');

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().max(60).optional(),
  // YAML parses an unquoted 2026-10-19 as a Date; accept both spellings.
  date: z.preprocess(
    (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
    isoDate
  ),
  excerpt: z.string().min(50).max(160),
  author: z.string().min(1),
  authorEmail: z.email().optional(),
  authorAvatar: z.string().optional(),
  category: z.enum(BLOG_CATEGORIES),
  tags: z.array(z.string()).max(10).default([]),
  coverImage: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('published'),
  readTime: z.string().optional(),
  views: z.number().int().nonnegative().default(0),
});

export type BlogFrontmatterInput = z.input<typeof frontmatterSchema>;
export type BlogFrontmatter = z.output<typeof frontmatterSchema>;

/** Everything about a post except its compiled body. */
export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
  seoTitle: string;
  readTime: string;
  /** ISO 8601 timestamp for schema.org `datePublished` and RSS `pubDate`. */
  publishedAt: string;
}

export interface ParsedPost {
  meta: BlogPostMeta;
  /** The MDX body with the frontmatter block removed. */
  body: string;
}

export class BlogPostError extends Error {
  constructor(
    readonly file: string,
    readonly problems: string[]
  ) {
    super(`${file}:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
    this.name = 'BlogPostError';
  }
}

const FRONTMATTER_BLOCK = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Split `---` frontmatter from the body without validating either. */
export function splitFrontmatter(source: string): { data: unknown; body: string } | null {
  const match = FRONTMATTER_BLOCK.exec(source.replace(/^﻿/, ''));
  if (!match) return null;
  return { data: parseYaml(match[1]) ?? {}, body: source.slice(match[0].length) };
}

/**
 * Parse and validate one post. `file` is used only for error messages.
 * Throws {@link BlogPostError} naming every invalid field at once.
 */
export function parsePost(slug: string, source: string, file = `${slug}.mdx`): ParsedPost {
  if (!SLUG_PATTERN.test(slug)) {
    throw new BlogPostError(file, [
      `filename "${slug}" is not a valid slug (lowercase letters, digits and single hyphens)`,
    ]);
  }

  let split: ReturnType<typeof splitFrontmatter>;
  try {
    split = splitFrontmatter(source);
  } catch (error) {
    throw new BlogPostError(file, [`frontmatter is not valid YAML: ${(error as Error).message}`]);
  }
  if (!split) {
    throw new BlogPostError(file, ['missing frontmatter block (the file must start with ---)']);
  }

  const result = frontmatterSchema.safeParse(split.data);
  if (!result.success) {
    throw new BlogPostError(
      file,
      result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    );
  }

  const frontmatter = result.data;
  return {
    meta: {
      ...frontmatter,
      slug,
      seoTitle: frontmatter.seoTitle ?? frontmatter.title,
      readTime: frontmatter.readTime ?? calculateReadingTime(split.body),
      publishedAt: `${frontmatter.date}T09:00:00.000Z`,
    },
    body: split.body,
  };
}

/** Newest first; ties broken by slug so output is deterministic. */
export function comparePosts(a: Pick<BlogPostMeta, 'date' | 'slug'>, b: Pick<BlogPostMeta, 'date' | 'slug'>): number {
  return b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);
}

/** Serialise frontmatter + body back to an `.mdx` file (used by the editor export). */
export function toMdxSource(frontmatter: Record<string, unknown>, body: string): string {
  const defined = Object.fromEntries(
    Object.entries(frontmatter).filter(([, value]) => value !== undefined && value !== '')
  );
  return `---\n${stringifyYaml(defined).trimEnd()}\n---\n\n${body.trim()}\n`;
}

/**
 * Reduce an MDX body to plain markdown for the static prerender: drops
 * `import`/`export` lines and `{/* comments *\/}`, and unwraps custom component
 * tags (`<Callout ...>`, `</Tabs>`, `<Tab label="x">`) so their children stay
 * readable to crawlers that do not run JavaScript. Fenced code is untouched.
 */
export function mdxToStaticMarkdown(body: string): string {
  let inFence = false;
  return body
    .replace(/\r\n/g, '\n')
    .split('\n')
    .flatMap((line) => {
      if (/^\s*```/.test(line)) inFence = !inFence;
      if (inFence || /^\s*```/.test(line)) return [line];
      if (/^(?:import|export)\s/.test(line)) return [];
      const stripped = line
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/<\/?[A-Z][\w.]*(?:\s[^<>]*?)?\/?>/g, '')
        .trimEnd();
      // A line that held only tags becomes a paragraph break, not a blank paragraph.
      return stripped.trim() || !line.trim() ? [stripped] : [''];
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
