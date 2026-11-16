/**
 * Vite plugin exposing `virtual:blog-index`: the validated metadata of every
 * published post, newest first, with no post bodies.
 *
 * - Frontmatter is validated at build time; an invalid post fails `vite build`
 *   with the file and field named.
 * - Asset paths stay as written (`/blogs/assets/...`); the client maps them to
 *   fingerprinted URLs with `resolveBlogAsset`, and `readPostsSync` fails the
 *   build when a referenced file does not exist.
 * - Bodies are compiled separately by `@mdx-js/rollup` and lazy-loaded per post
 *   from `src/lib/blogLoader.ts`.
 */
import path from 'path';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import type { Plugin } from 'vite';
import type { BlogPostMeta } from './postSchema';
import { POSTS_DIR, readPostsSync } from './readPosts';

export const BLOG_INDEX_ID = 'virtual:blog-index';
const RESOLVED_ID = `\0${BLOG_INDEX_ID}`;

export function renderBlogIndexModule(posts: BlogPostMeta[], drafts: BlogPostMeta[] = []): string {
  return [
    `export const posts = ${JSON.stringify(posts, null, 2)};`,
    `export const drafts = ${JSON.stringify(drafts, null, 2)};`,
    '',
  ].join('\n');
}

/**
 * In production builds a draft's body and raw source compile to empty stubs,
 * so `status: draft` really keeps the text out of `dist/`. Dev serves drafts
 * in full so authors can preview them.
 */
const DRAFT_BODY_STUB = 'export default function DraftPost() { return null; }\n';
const DRAFT_RAW_STUB = 'export default "";\n';

export function blogIndexPlugin(): Plugin {
  let isBuild = false;
  let draftFiles = new Set<string>();
  const normalise = (file: string) => path.normalize(file).toLowerCase();

  return {
    name: 'catalystlab:blog-index',
    // Runs before @mdx-js/rollup so the draft stub wins in production.
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    buildStart() {
      const drafts = readPostsSync({ includeDrafts: true }).filter((post) => post.meta.status === 'draft');
      draftFiles = new Set(drafts.map((post) => normalise(path.join(POSTS_DIR, `${post.meta.slug}.mdx`))));
    },
    resolveId(id) {
      return id === BLOG_INDEX_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id === RESOLVED_ID) {
        const all = readPostsSync({ includeDrafts: true });
        for (const post of all) this.addWatchFile(path.join(POSTS_DIR, `${post.meta.slug}.mdx`));
        const published = all.filter((post) => post.meta.status === 'published').map((post) => post.meta);
        const drafts = isBuild ? [] : all.filter((post) => post.meta.status === 'draft').map((post) => post.meta);
        return renderBlogIndexModule(published, drafts);
      }
      if (!isBuild) return undefined;
      const [file, query = ''] = id.split('?');
      if (!draftFiles.has(normalise(file))) return undefined;
      return new URLSearchParams(query).has('raw') ? DRAFT_RAW_STUB : DRAFT_BODY_STUB;
    },
    configureServer(server) {
      // Pick up new, edited and deleted posts on the next page load in dev.
      server.watcher.add(POSTS_DIR);
      const invalidate = (file: string) => {
        // Chokidar reports forward slashes on Windows; normalise both sides.
        if (!path.normalize(file).startsWith(path.normalize(POSTS_DIR)) || !file.endsWith('.mdx')) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
      };
      server.watcher.on('add', invalidate);
      server.watcher.on('change', invalidate);
      server.watcher.on('unlink', invalidate);
    },
  };
}

/**
 * `@mdx-js/rollup`, configured for posts: frontmatter is stripped from the
 * compiled body (it is served validated by `virtual:blog-index`) and GFM
 * tables/strikethrough are enabled. `?raw` imports (the editor's source view)
 * are left to Vite: the upstream plugin strips the query before matching and
 * would otherwise compile them into a component.
 */
export function blogMdxPlugin(): Plugin {
  const plugin = mdx({ remarkPlugins: [remarkFrontmatter, remarkGfm] }) as Plugin;
  const transform = plugin.transform;
  if (typeof transform !== 'function') throw new Error('@mdx-js/rollup: unexpected transform hook shape');
  return {
    ...plugin,
    name: 'catalystlab:blog-mdx',
    enforce: 'pre',
    transform(code, id, options) {
      if (/[?&]raw\b/.test(id)) return null;
      return transform.call(this, code, id, options);
    },
  };
}

/** Everything Vite (and Vitest) needs for the MDX blog. */
export function blogPlugins(): Plugin[] {
  return [blogIndexPlugin(), blogMdxPlugin()];
}
