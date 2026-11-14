export interface BlogPostFrontmatter {
  title: string;
  seoTitle: string;
  date: string; // ISO date string
  excerpt: string;
  author: string;
  authorEmail: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  coverImage: string;
  featured: boolean;
  status: 'draft' | 'published';
  readTime: string;
  views: number;
}

export interface BlogPost extends BlogPostFrontmatter {
  slug: string;
  content: React.ReactNode; // Compiled MDX content
  readingTime: string;
}