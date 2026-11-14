import { compileMDX } from 'next-mdx-remote/rsc';
import type { BlogPostFrontmatter } from '@/types/blog';

export async function compileMDXPost(source: string) {
  const { frontmatter, content } = await compileMDX<BlogPostFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: {
      // Custom components will be registered here
    },
  });
  return { frontmatter: frontmatter as BlogPostFrontmatter, content };
}

export function validateFrontmatter(frontmatter: unknown): BlogPostFrontmatter {
  // Validate against schema
  // Throw descriptive errors for missing/invalid fields
  const required = ['title', 'date', 'excerpt', 'author', 'category'];
  const fm = frontmatter as Record<string, unknown>;
  
  for (const field of required) {
    if (!fm[field]) {
      throw new Error(`Missing required frontmatter field: ${field}`);
    }
  }
  
  return frontmatter as BlogPostFrontmatter;
}