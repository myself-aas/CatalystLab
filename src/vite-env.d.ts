/// <reference types="vite/client" />
/// <reference types="mdx" />

declare module 'virtual:blog-index' {
  import type { BlogPostMeta } from '@blogs/src/lib/postSchema';
  /** Published posts, newest first, metadata only (see blogs/src/lib/vitePlugin.ts). */
  export const posts: BlogPostMeta[];
  /** Draft posts, dev server only (always empty in production builds). */
  export const drafts: BlogPostMeta[];
}
