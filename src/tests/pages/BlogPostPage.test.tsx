import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: null, isAdmin: false }) }));

const { BlogPostPage } = await import('@/pages/BlogPostPage');
const { getAllPosts } = await import('@/lib/blogLoader');

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blogs/:slug" element={<BlogPostPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('BlogPostPage', () => {
  it('renders the header immediately and the compiled MDX body once loaded', async () => {
    const [post] = getAllPosts();
    renderAt(`/blogs/${post.slug}`);

    expect(screen.getByRole('heading', { level: 1, name: post.title })).toBeInTheDocument();
    expect(screen.getByText(post.author)).toBeInTheDocument();

    // Every committed post opens with an H2 (enforced in seoAeo.test.ts).
    const headings = await screen.findAllByRole('heading', { level: 2 });
    expect(headings.length).toBeGreaterThan(0);
    expect(document.querySelector('article')).toHaveAttribute('aria-busy', 'false');
  });

  it('sets the canonical URL to /blogs/:slug', async () => {
    const [post] = getAllPosts();
    renderAt(`/blogs/${post.slug}`);
    await screen.findAllByRole('heading', { level: 2 });
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(new RegExp(`/blogs/${post.slug}$`));
  });

  it('renders the not-found state for an unknown slug', () => {
    renderAt('/blogs/does-not-exist');
    expect(screen.getByRole('heading', { name: 'Article Not Found' })).toBeInTheDocument();
  });
});
