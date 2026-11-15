/**
 * Client entry point for blog content (MDX file-based, build-time compiled).
 *
 * - Metadata comes from `virtual:blog-index` (validated frontmatter of every
 *   published post, see `blogs/src/lib/vitePlugin.ts`), so listing posts is
 *   synchronous and costs no network request.
 * - Each post body is its own lazily loaded chunk compiled by `@mdx-js/rollup`.
 * - Drafts are never public: `getPostBySlug` returns `null` for them, and in
 *   production builds their chunks are empty stubs (see the plugin).
 */
import type { MDXContent } from 'mdx/types';
import { drafts as indexedDrafts, posts as indexedPosts } from 'virtual:blog-index';
import { resolveBlogAsset } from '@blogs/src/lib/assets';
import type { BlogPost, BlogPostMeta } from '@/types/blog';

const bodyModules = import.meta.glob<{ default: MDXContent }>('/blogs/posts/*.mdx');
const sourceModules = import.meta.glob<string>('/blogs/posts/*.mdx', { query: '?raw', import: 'default' });

const postFile = (slug: string) => `/blogs/posts/${slug}.mdx`;

/** Used when a post has no `coverImage` (served from `public/`). */
export const DEFAULT_BLOG_COVER = '/og-image.png';

const withAssets = (post: BlogPostMeta): BlogPostMeta => ({
  ...post,
  coverImage: resolveBlogAsset(post.coverImage),
  authorAvatar: resolveBlogAsset(post.authorAvatar),
});

const POSTS: BlogPostMeta[] = indexedPosts.map(withAssets);
const DRAFTS: BlogPostMeta[] = indexedDrafts.map(withAssets);
const POSTS_BY_SLUG = new Map(POSTS.map((post) => [post.slug, post]));

/** Published posts, newest first. */
export function getAllPosts(): BlogPostMeta[] {
  return POSTS;
}

/**
 * Published posts plus drafts, for the management views. Drafts are only
 * known to the dev server; production builds return published posts only.
 */
export function getManagedPosts(): BlogPostMeta[] {
  return [...DRAFTS, ...POSTS];
}

export function getPostMeta(slug: string): BlogPostMeta | null {
  return POSTS_BY_SLUG.get(slug) ?? null;
}

export function getPostsByCategory(category: string): BlogPostMeta[] {
  return POSTS.filter((post) => post.category === category);
}

export function getFeaturedPosts(): BlogPostMeta[] {
  return POSTS.filter((post) => post.featured);
}

/** Loads the compiled body. `null` for unknown slugs and drafts. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const meta = getPostMeta(slug);
  const load = bodyModules[postFile(slug)];
  if (!meta || !load) return null;
  const { default: Content } = await load();
  return { ...meta, Content };
}

/** Raw `.mdx` source (frontmatter included), drafts too. Used by the editor. */
export async function getPostSource(slug: string): Promise<string | null> {
  const load = sourceModules[postFile(slug)];
  return load ? load() : null;
}
