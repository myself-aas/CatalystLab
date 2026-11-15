import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BlogPostMeta } from '@/types/blog';

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: null, isAdmin: false }) }));

const override = vi.hoisted(() => ({ posts: undefined as BlogPostMeta[] | undefined }));
vi.mock('@/lib/blogLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/blogLoader')>();
  return { ...actual, getAllPosts: () => override.posts ?? actual.getAllPosts() };
});

const { BlogsPage } = await import('@/pages/BlogsPage');
const { getAllPosts } = await import('@/lib/blogLoader');

const renderPage = () =>
  render(
    <MemoryRouter>
      <BlogsPage />
    </MemoryRouter>
  );

describe('BlogsPage', () => {
  afterEach(() => {
    override.posts = undefined;
  });

  it('lists every MDX post on first render, linking to /blogs/:slug', () => {
    renderPage();
    for (const post of getAllPosts()) {
      const link = screen.getByRole('link', { name: new RegExp(post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
      expect(link).toHaveAttribute('href', `/blogs/${post.slug}`);
    }
  });

  it('filters by a frontmatter category', () => {
    renderPage();
    const [first] = getAllPosts();
    fireEvent.click(screen.getByRole('button', { name: first.category }));
    const shown = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    const expected = getAllPosts().filter((post) => post.category === first.category).map((post) => post.title);
    expect(shown).toEqual(expected);
  });

  it('shows the empty state when there are no posts', () => {
    override.posts = [];
    renderPage();
    expect(screen.getByText('No articles found.')).toBeInTheDocument();
  });
});
