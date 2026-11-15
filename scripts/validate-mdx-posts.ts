#!/usr/bin/env tsx
/**
 * Validate every blogs/posts/*.mdx file: frontmatter schema, slug, and that
 * referenced assets exist. The same check runs inside `vite build` and the
 * prerender; this script gives authors a fast standalone run.
 *
 *   npx tsx scripts/validate-mdx-posts.ts
 */
import { readPostsSync } from '../blogs/src/lib/readPosts';

try {
  const posts = readPostsSync({ includeDrafts: true });
  for (const { meta } of posts) {
    console.log(`ok  ${meta.status === 'draft' ? '[draft] ' : ''}${meta.slug}: ${meta.title}`);
  }
  console.log(`\n${posts.length} post(s) valid`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
