import { render, screen, waitFor } from '@testing-library/react';
import { BlogsPage } from '@/pages/BlogsPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

vi.mock('@/lib/blogLoader', () => ({
  getAllPosts: vi.fn().mockResolvedValue([
    {
      slug: 'test-post',
      title: 'Test Post',
      excerpt: 'Test excerpt',
      category: 'Core Performance',
      date: '2026-11-15',
      coverImage: '/cover.jpg',
      readTime: '5 min read',
      featured: false,
      status: 'published',
      author: 'Test Author',
      authorAvatar: '/avatar.jpg',
      tags: [],
      views: 0,
      seoTitle: '',
      authorEmail: '',
    }
  ]),
  getFeaturedPosts: vi.fn().mockResolvedValue([]),
}));

describe('BlogsPage', () => {
  it('renders blog posts from MDX loader', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <BlogsPage />
        </AuthProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Test Post')).toBeInTheDocument());
  });
});