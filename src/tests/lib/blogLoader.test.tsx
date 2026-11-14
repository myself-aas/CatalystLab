import { describe, it, expect, vi } from 'vitest';
import { getAllPosts, getPostBySlug } from '@/lib/blogLoader';

vi.mock('fs/promises');
vi.mock('@blogs/src/lib/mdxCompiler');
vi.mock('@blogs/src/utils/readingTime');

import * as fs from 'fs/promises';
import { compileMDXPost } from '@blogs/src/lib/mdxCompiler';
import { calculateReadingTime } from '@blogs/src/utils/readingTime';

describe('blogLoader', () => {
  const mockPost = {
    title: 'Test Post',
    seoTitle: 'Test Post | CatalystLab',
    date: '2026-11-15',
    excerpt: 'Test excerpt',
    author: 'Test Author',
    authorEmail: 'test@test.com',
    authorAvatar: '/avatar.jpg',
    category: 'Core Performance',
    tags: ['tag1'],
    coverImage: '/cover.jpg',
    featured: false,
    status: 'published',
    readTime: '5 min read',
    views: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads all published posts sorted by date', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['post1.mdx', 'post2.mdx'] as any);
    vi.mocked(fs.readFile).mockResolvedValue('---\ntitle: "Test"\n---\nContent');
      vi.mocked(compileMDXPost)
        .mockResolvedValueOnce({
          frontmatter: { ...mockPost, date: '2026-11-16' },
          content: <p>Content 1</p>,
        })
        .mockResolvedValueOnce({
          frontmatter: { ...mockPost, date: '2026-11-15' },
          content: <p>Content 2</p>,
        });
    vi.mocked(calculateReadingTime).mockReturnValue('5 min read');

    const posts = await getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
      expect(new Date(posts[0].date).getTime()).toBeGreaterThanOrEqual(new Date(posts[1]?.date ?? '').getTime());
  });

  it('returns null for non-existent slug', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('Not found'));

    const post = await getPostBySlug('non-existent');
    expect(post).toBeNull();
  });

  it('loads a single post by slug', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('---\ntitle: "Test"\n---\nContent');
    vi.mocked(compileMDXPost).mockResolvedValue({
      frontmatter: { ...mockPost, date: '2026-11-15' },
      content: <p>Content</p>,
    });
    vi.mocked(calculateReadingTime).mockReturnValue('5 min read');

    const post = await getPostBySlug('test-post');
    expect(post).not.toBeNull();
    expect(post?.slug).toBe('test-post');
    expect(post?.title).toBe('Test Post');
  });
});