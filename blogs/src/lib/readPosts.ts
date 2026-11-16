/**
 * Node-only: read every `.mdx` file in `blogs/posts/` and validate it.
 *
 * Used by the Vite plugin (build + dev), `scripts/prerender.ts` and the tests.
 * Never import this from browser code — `src/lib/blogLoader.ts` is the client
 * entry point and reads the compiled `virtual:blog-index` module instead.
 */
import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { BlogPostError, comparePosts, mdxToStaticMarkdown, parsePost, type ParsedPost } from './postSchema';

export const BLOG_ROOT = path.resolve(import.meta.dirname, '../..');
export const POSTS_DIR = path.join(BLOG_ROOT, 'posts');

/** `/blogs/assets/x` or `../assets/x` (relative to `blogs/posts/`). */
const ASSET_REF = /(?:\/blogs|\.\.)\/assets\/[^\s)"'<>]+/g;

/** Every blog asset a post references (frontmatter and body) that is not on disk. */
export function missingAssets({ meta, body }: ParsedPost): string[] {
  const refs = [meta.coverImage, meta.authorAvatar, ...(body.match(ASSET_REF) ?? [])].filter(
    (ref): ref is string => !!ref && /^(?:\/blogs|\.\.)\/assets\//.test(ref)
  );
  return [...new Set(refs)].filter(
    (ref) => !existsSync(path.join(BLOG_ROOT, ref.replace(/^(?:\/blogs|\.\.)\//, '')))
  );
}

export interface ReadPostsOptions {
  dir?: string;
  includeDrafts?: boolean;
}

/**
 * Returns posts newest first. Throws one {@link Error} listing every invalid
 * file, so a single build run reports all problems rather than the first.
 * A missing or empty directory yields `[]`.
 */
export function readPostsSync({ dir = POSTS_DIR, includeDrafts = false }: ReadPostsOptions = {}): ParsedPost[] {
  if (!existsSync(dir)) return [];

  const files = readdirSync(dir).filter((file) => file.endsWith('.mdx')).sort();
  const posts: ParsedPost[] = [];
  const failures: string[] = [];

  for (const file of files) {
    const slug = file.slice(0, -'.mdx'.length);
    const label = `blogs/posts/${file}`;
    try {
      const post = parsePost(slug, readFileSync(path.join(dir, file), 'utf-8'), label);
      const missing = missingAssets(post);
      if (missing.length) {
        throw new BlogPostError(label, missing.map((ref) => `asset not found: ${ref}`));
      }
      posts.push(post);
    } catch (error) {
      failures.push(error instanceof BlogPostError ? error.message : `blogs/posts/${file}: ${String(error)}`);
    }
  }

  if (failures.length) {
    throw new Error(`Invalid blog post frontmatter:\n${failures.join('\n')}`);
  }

  const visible = includeDrafts ? posts : posts.filter((post) => post.meta.status === 'published');
  return visible.sort((a, b) => comparePosts(a.meta, b.meta));
}

/** The fields the prerender's head, sitemap, RSS and llms.txt need per post. */
export interface BlogSeoEntry {
  slug: string;
  title: string;
  seoTitle: string;
  excerpt: string;
  author: string;
  category: string;
  /** ISO 8601 timestamp for schema.org `datePublished` and RSS. */
  publishedAt: string;
  /** Calendar date for sitemap `<lastmod>` and the byline. */
  publishedDate: string;
}

/**
 * Published posts shaped for the static prerender: SEO metadata plus each
 * body reduced to plain markdown. Shared by `scripts/prerender.ts` and the
 * SEO unit tests so both check the same text.
 */
export function readBlogSeo(options?: ReadPostsOptions): { entries: BlogSeoEntry[]; bodies: Record<string, string> } {
  const posts = readPostsSync(options);
  return {
    entries: posts.map(({ meta }) => ({
      slug: meta.slug,
      title: meta.title,
      seoTitle: meta.seoTitle,
      excerpt: meta.excerpt,
      author: meta.author,
      category: meta.category,
      publishedAt: meta.publishedAt,
      publishedDate: meta.date,
    })),
    bodies: Object.fromEntries(posts.map(({ meta, body }) => [meta.slug, mdxToStaticMarkdown(body)])),
  };
}
