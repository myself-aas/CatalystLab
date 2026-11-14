import fs from 'fs/promises';
import path from 'path';
import { compileMDXPost } from '@blogs/src/lib/mdxCompiler';
import { calculateReadingTime } from '@blogs/src/utils/readingTime';
import type { BlogPost, BlogPostFrontmatter } from '@/types/blog';

const POSTS_DIR = path.resolve(process.cwd(), 'blogs/posts');

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = await fs.readdir(POSTS_DIR);
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  
  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const slug = file.replace('.mdx', '');
      const source = await fs.readFile(path.join(POSTS_DIR, file), 'utf-8');
      const { frontmatter, content } = await compileMDXPost(source);
      
      return {
        ...frontmatter,
        slug,
        content,
        readingTime: frontmatter.readTime || calculateReadingTime(source),
      } as BlogPost;
    })
  );
  
  return posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  try {
    const source = await fs.readFile(filePath, 'utf-8');
    const { frontmatter, content } = await compileMDXPost(source);
    return {
      ...frontmatter,
      slug,
      content,
      readingTime: frontmatter.readTime || calculateReadingTime(source),
    } as BlogPost;
  } catch {
    return null;
  }
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter(p => p.category === category);
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter(p => p.featured);
}