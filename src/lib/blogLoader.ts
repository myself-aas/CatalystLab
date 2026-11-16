/**
 * Browser-safe blog loader.
 *
 * Posts live in `blogs/posts/*.mdx` as Markdown with YAML frontmatter. Vite
 * bundles their raw text at build time (`import.meta.glob` + `?raw`), so this
 * module never touches `fs`/`path`/`process` and works in the SPA. Bodies are
 * plain Markdown and are rendered by `MarkdownRenderer`.
 *
 * (Replaces an fs + next-mdx-remote/rsc loader that could only run in Node and
 * left /blogs and /blogs/:slug empty in the browser.)
 */
import { z } from 'zod';
import { calculateReadingTime } from '@blogs/src/utils/readingTime';
import type { BlogPost } from '@/types/blog';

const postLoaders = import.meta.glob<string>('/blogs/posts/*.mdx', {
  query: '?raw',
  import: 'default',
});

const frontmatterSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().default(''),
  date: z.string().min(1),
  excerpt: z.string().default(''),
  author: z.string().min(1),
  authorEmail: z.string().default(''),
  authorAvatar: z.string().default(''),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().default(''),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
  readTime: z.string().optional(),
  views: z.number().default(0),
});

const slugFromPath = (filePath: string): string =>
  filePath.slice(filePath.lastIndexOf('/') + 1).replace(/\.mdx$/, '');

/** Parses one YAML scalar/flow value of the subset the posts use. */
const parseValue = (raw: string): unknown => {
  const value = raw.trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith('"') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  return value;
};

/** Splits `---\nkey: value\n---\nbody` into a record and the Markdown body. */
export const parseFrontmatter = (source: string): { data: Record<string, unknown>; body: string } => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: source };
  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(':');
    if (sep <= 0) continue;
    data[line.slice(0, sep).trim()] = parseValue(line.slice(sep + 1));
  }
  return { data, body: match[2].trim() };
};

const toPost = (slug: string, source: string): BlogPost | null => {
  const { data, body } = parseFrontmatter(source);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    console.warn(`[blogLoader] Skipping "${slug}": invalid frontmatter`, parsed.error.issues);
    return null;
  }
  const frontmatter = parsed.data;
  const readingTime = frontmatter.readTime ?? calculateReadingTime(body);
  return { ...frontmatter, readTime: readingTime, slug, content: body, readingTime };
};

const loadPost = async (filePath: string): Promise<BlogPost | null> => {
  const load = postLoaders[filePath];
  if (!load) return null;
  return toPost(slugFromPath(filePath), await load());
};

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(Object.keys(postLoaders).map(loadPost));
  return posts
    .filter((post): post is BlogPost => post !== null && post.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return loadPost(`/blogs/posts/${slug}.mdx`);
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.featured);
}
