import type { MDXContent } from 'mdx/types';
import type { BlogPostMeta } from '@blogs/src/lib/postSchema';

export type { BlogFrontmatter, BlogPostMeta } from '@blogs/src/lib/postSchema';

/** A post with its compiled MDX body, as returned by `getPostBySlug`. */
export interface BlogPost extends BlogPostMeta {
  Content: MDXContent;
}
