import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

const mockGetPostBySlug = vi.fn().mockResolvedValue({
  slug: 'test-post',
  title: 'Test Post',
  seoTitle: 'Test Post | CatalystLab',
  excerpt: 'Test excerpt',
  content: 'Test content',
  category: 'Core Performance',
  date: '2026-11-15',
  coverImage: '/cover.jpg',
  readTime: '5 min read',
  author: 'Test Author',
  authorEmail: 'test@test.com',
  authorAvatar: '/avatar.jpg',
  tags: ['tag1'],
  views: 100,
  featured: false,
  status: 'published',
});

vi.mock('@/lib/blogLoader', () => ({
  getPostBySlug: mockGetPostBySlug,
}));

const { BlogPostPage } = await import('@/pages/BlogPostPage');

describe('BlogPostPage', () => {
  beforeEach(() => {
    mockGetPostBySlug.mockClear();
  });

  it('renders blog post from MDX loader', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/test-post']}>
        <AuthProvider>
          <BlogPostPage />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => expect(screen.queryByText('Test Post')).toBeInTheDocument(), { timeout: 3000 });
  });
});