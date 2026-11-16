import { describe, it, expect } from 'vitest';
import { getAllPosts, getPostBySlug, getFeaturedPosts, parseFrontmatter } from '@/lib/blogLoader';

// Runs against the real posts in blogs/posts (bundled via import.meta.glob),
// so it fails if the loader stops working in a browser-like environment.
describe('blogLoader', () => {
  it('loads the published posts, newest first, with markdown bodies', async () => {
    const posts = await getAllPosts();
    expect(posts.length).toBeGreaterThanOrEqual(10);
    for (const post of posts) {
      expect(post.status).toBe('published');
      expect(post.title).not.toBe('');
      expect(typeof post.content).toBe('string');
      expect(post.content.startsWith('---')).toBe(false);
      expect(post.readingTime).toMatch(/min read/);
    }
    for (let i = 1; i < posts.length; i++) {
      expect(new Date(posts[i - 1].date).getTime()).toBeGreaterThanOrEqual(new Date(posts[i].date).getTime());
    }
  });

  it('loads a single post by slug with typed frontmatter', async () => {
    const post = await getPostBySlug('modern-website-health-ai-search');
    expect(post).not.toBeNull();
    expect(post?.slug).toBe('modern-website-health-ai-search');
    expect(post?.featured).toBe(true);
    expect(Array.isArray(post?.tags)).toBe(true);
    expect(typeof post?.views).toBe('number');
    expect(post?.content).toContain('## One domain, several independent measurements');
  });

  it('returns null for an unknown slug', async () => {
    expect(await getPostBySlug('does-not-exist')).toBeNull();
  });

  it('returns only featured posts from getFeaturedPosts', async () => {
    const featured = await getFeaturedPosts();
    expect(featured.every((post) => post.featured)).toBe(true);
  });

  it('parses quoted strings, arrays, booleans and numbers in frontmatter', () => {
    const { data, body } = parseFrontmatter(
      '---\ntitle: "A: B"\ntags: ["x", "y"]\nfeatured: true\nviews: 12\n---\n\nBody text',
    );
    expect(data).toEqual({ title: 'A: B', tags: ['x', 'y'], featured: true, views: 12 });
    expect(body).toBe('Body text');
  });
});
