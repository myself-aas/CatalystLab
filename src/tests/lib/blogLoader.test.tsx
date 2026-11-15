import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  getAllPosts,
  getFeaturedPosts,
  getManagedPosts,
  getPostBySlug,
  getPostMeta,
  getPostSource,
  getPostsByCategory,
} from '@/lib/blogLoader';
import { readPostsSync } from '@blogs/src/lib/readPosts';
import { resolveBlogAsset } from '@blogs/src/lib/assets';
import { mdxComponents } from '@blogs/src/components';
import Fixture from '../fixtures/blog/components.mdx';

describe('blogLoader (virtual:blog-index)', () => {
  const onDisk = readPostsSync();

  it('lists every published post on disk, newest first', () => {
    const posts = getAllPosts();
    expect(posts.map((post) => post.slug)).toEqual(onDisk.map((post) => post.meta.slug));
    const dates = posts.map((post) => post.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('maps asset paths through the bundled asset table', () => {
    // Dev and test serve root files at their own path; `vite build` swaps in
    // the fingerprinted URL. Either way relative paths become absolute.
    expect(resolveBlogAsset('../assets/images/avatars/avatar-1.jpg')).toMatch(/^\/.*avatar-1.*\.jpg$/);
    expect(resolveBlogAsset('https://example.com/x.png')).toBe('https://example.com/x.png');
    for (const post of getAllPosts()) expect(post.coverImage, post.slug).toBeTruthy();
  });

  it('filters by category and featured flag', () => {
    const [first] = getAllPosts();
    expect(getPostsByCategory(first.category).every((post) => post.category === first.category)).toBe(true);
    expect(getFeaturedPosts().every((post) => post.featured)).toBe(true);
    expect(getManagedPosts().length).toBeGreaterThanOrEqual(getAllPosts().length);
  });

  it('loads a compiled body for a known slug and null for unknown ones', async () => {
    const [first] = getAllPosts();
    const post = await getPostBySlug(first.slug);
    expect(post?.title).toBe(first.title);
    expect(typeof post?.Content).toBe('function');
    expect(await getPostBySlug('does-not-exist')).toBeNull();
    expect(getPostMeta('does-not-exist')).toBeNull();
  });

  it('returns the raw source with frontmatter for the editor', async () => {
    const [first] = getAllPosts();
    const source = await getPostSource(first.slug);
    expect(source?.startsWith('---')).toBe(true);
    expect(source).toContain(`title: "${first.title}"`);
    expect(await getPostSource('does-not-exist')).toBeNull();
  });
});

describe('MDX component map', () => {
  it('renders custom components, code blocks, tables and resolved images', async () => {
    const { container } = render(<Fixture components={mdxComponents} />);

    const callout = screen.getByRole('note', { name: 'Heads up' });
    expect(callout).toHaveAttribute('data-callout', 'warning');
    expect(callout).toHaveTextContent('Callout body text.');

    expect(screen.getByRole('tab', { name: 'npm' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Install with npm.');
    fireEvent.click(screen.getByRole('tab', { name: 'pnpm' }));
    await waitFor(() => expect(screen.getByRole('tabpanel')).toHaveTextContent('Install with pnpm.'));

    expect(screen.getByText('ts')).toBeInTheDocument();
    expect(container.querySelector('pre code')?.textContent).toContain('const answer = 42;');
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();

    expect(screen.getByRole('columnheader', { name: 'Metric' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Fixture heading' })).toBeInTheDocument();

    const image = screen.getByRole('img', { name: 'Diagram' });
    expect(image.getAttribute('src')).not.toMatch(/^\.\.\/assets\//);

    expect(screen.queryByRole('link', { name: 'Unsafe link' })).toBeNull();
    expect(screen.getByRole('link', { name: 'safe link' })).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
