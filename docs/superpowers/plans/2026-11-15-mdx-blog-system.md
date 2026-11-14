# MDX Blog System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Firestore-based blog system with a file-based MDX blog system where blog posts are stored as `.mdx` files in a `blogs/` directory, with the filename determining the slug (`/blog/:slug`), and supporting files organized in child directories (`src/`, `assets/`, `templates/`, `instructions/`).

**Architecture:** File-based MDX blog system using `next-mdx-remote` or `mdx-bundler` for compilation, with frontmatter for metadata. The `blogs/` directory becomes the single source of truth for all blog content. Build-time prerendering generates static HTML for SEO. No Firestore dependency for blog content.

**Tech Stack:** React 19, Vite 8, MDX (via `mdx-bundler` or `next-mdx-remote`), TypeScript, existing `PlateImage`/`MarkdownRenderer` components, existing `SEOHead` for meta tags.

**Spec:** This plan implements the user's requirement for an MDX-based blog system with directory structure `blogs/{posts,src,assets,templates,instructions}/` where `.mdx` filename = slug.

## Global Constraints

- **Node 24** (`.nvmrc`, `package.json`, `Dockerfile`)
- **TypeScript strict mode** (`tsconfig.json`: `strict: true`)
- **ESLint 9 flat config** (no Prettier, `eslint.config.js`)
- **Vitest** for testing (`vitest.config.ts`)
- **Design system**: `ds-*` and `framer-*` classes only (`AGENTS.md` §3)
- **Framer Motion** for animations (`motion/react`)
- **Lucide React** for icons (`lucide-react`)
- **No Firestore for blog content** — MDX files are source of truth
- **Prerendering** must work with `scripts/prerender.ts` (build-time static HTML)
- **Existing components**: Reuse `PlateImage`, `MarkdownRenderer`, `SEOHead`, `BlogCardSkeleton`
- **Existing routes**: `/blogs` (index), `/blog/:slug` (post), `/blogs/create`, `/blogs/edit/:id` (editor)

## Review Focus

| Input / Condition | Expected Behavior | Test Location |
|-------------------|-------------------|---------------|
| MDX file with invalid frontmatter | Graceful error at build time, clear error message | `scripts/prerender.ts` test |
| Missing required frontmatter fields (title, date, excerpt) | Build fails with clear field name | `scripts/prerender.ts` test |
| MDX file with relative image paths | Images resolve via `assets/` directory | `BlogPostPage.tsx` test |
| MDX with custom components (e.g., `<Callout />`) | Components render via component map | `MarkdownRenderer.tsx` test |
| Empty `blogs/` directory | Build succeeds, empty blog index | `BlogsPage.tsx` test |

---

## File Structure

```
blogs/
├── posts/                    # .mdx files (filename = slug)
│   ├── optimizing-dom-depth-render-blocking-nextjs.mdx
│   ├── decoupling-critical-css-font-preloading.mdx
│   ├── decimating-ttfb-edge-workers.mdx
│   ├── llmstxt-standard-autonomous-ai-crawlers.mdx
│   ├── automating-git-secops-hygiene.mdx
│   ├── sustainable-web-engineering-carbon-reduction.mdx
│   ├── owasp-security-headers-gdpr-governance.mdx
│   ├── zero-downtime-platform-migration-seo-parity.mdx
│   ├── generative-engine-optimization-llmo-citations.mdx
│   ├── modern-website-health-ai-search.mdx
│   └── ... (future posts)
├── src/                      # Supporting source files
│   ├── components/           # Custom MDX components (Callout, Tabs, etc.)
│   │   ├── Callout.tsx
│   │   ├── Tabs.tsx
│   │   └── index.ts
│   ├── utils/                # Blog-specific utilities
│   │   ├── readingTime.ts
│   │   └── slugify.ts
│   └── lib/                  # Blog-specific lib
│       └── mdxCompiler.ts    # MDX compilation logic
├── assets/                   # Static assets referenced by posts
│   ├── images/
│   │   ├── covers/
│   │   ├── diagrams/
│   │   └── avatars/
│   └── downloads/
├── templates/                # Post templates
│   ├── post-template.mdx
│   └── frontmatter-schema.json
└── instructions/             # Authoring guidelines
    ├── writing-guide.md
    ├── frontmatter-reference.md
    └── component-usage.md
```

---

## Task 1: Create Blog Directory Structure & Configuration

**Files:**
- Create: `blogs/posts/.gitkeep`
- Create: `blogs/src/components/index.ts`
- Create: `blogs/src/utils/readingTime.ts`
- Create: `blogs/src/utils/slugify.ts`
- Create: `blogs/src/lib/mdxCompiler.ts`
- Create: `blogs/assets/images/covers/.gitkeep`
- Create: `blogs/assets/images/diagrams/.gitkeep`
- Create: `blogs/assets/images/avatars/.gitkeep`
- Create: `blogs/templates/post-template.mdx`
- Create: `blogs/templates/frontmatter-schema.json`
- Create: `blogs/instructions/writing-guide.md`
- Create: `blogs/instructions/frontmatter-reference.md`
- Create: `blogs/instructions/component-usage.md`

**Interfaces:**
- Produces: Directory structure for all subsequent tasks
- Consumes: None (foundational task)

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p blogs/posts blogs/src/components blogs/src/utils blogs/src/lib \
  blogs/assets/images/covers blogs/assets/images/diagrams blogs/assets/images/avatars \
  blogs/templates blogs/instructions
```

- [ ] **Step 2: Create frontmatter schema**

```json
// blogs/templates/frontmatter-schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["title", "date", "excerpt", "author", "category"],
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "seoTitle": { "type": "string", "maxLength": 60 },
    "date": { "type": "string", "format": "date" },
    "excerpt": { "type": "string", "minLength": 50, "maxLength": 160 },
    "author": { "type": "string" },
    "authorEmail": { "type": "string", "format": "email" },
    "authorAvatar": { "type": "string" },
    "category": { "type": "string", "enum": ["Core Performance", "Edge Latency", "AI & LLMO", "SecOps", "Sustainability", "Compliance & Security", "Architecture", "AI Search", "Release Notes"] },
    "tags": { "type": "array", "items": { "type": "string" }, "maxItems": 10 },
    "coverImage": { "type": "string" },
    "featured": { "type": "boolean", "default": false },
    "status": { "type": "string", "enum": ["draft", "published"], "default": "published" },
    "readTime": { "type": "string" },
    "views": { "type": "integer", "default": 0 }
  }
}
```

- [ ] **Step 3: Create post template**

```mdx
// blogs/templates/post-template.mdx
---
title: "Post Title"
seoTitle: "SEO Title | CatalystLab"
date: "2026-11-15"
excerpt: "A compelling 150-character summary for SEO and social cards."
author: "Author Name"
authorEmail: "author@catalystlab.tech"
authorAvatar: "/blogs/assets/images/avatars/author.jpg"
category: "Core Performance"
tags: ["tag1", "tag2"]
coverImage: "/blogs/assets/images/covers/cover.jpg"
featured: false
status: "published"
readTime: "5 min read"
views: 0
---

## Introduction

Your opening paragraph here.

## Section Heading

Content with **markdown** support.

### Subsection

- List item 1
- List item 2

```tsx
// Code blocks with syntax highlighting
console.log('Hello MDX');
```

## Sources

- [Source Title](https://example.com)
```

- [ ] **Step 4: Create MDX compiler utility**

```typescript
// blogs/src/lib/mdxCompiler.ts
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
}
```

- [ ] **Step 5: Create utility functions**

```typescript
// blogs/src/utils/readingTime.ts
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// blogs/src/utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}
```

- [ ] **Step 6: Create component registry**

```typescript
// blogs/src/components/index.ts
export { Callout } from './Callout';
export { Tabs } from './Tabs';
// Export all custom MDX components
```

- [ ] **Step 7: Create instruction files**

```markdown
<!-- blogs/instructions/writing-guide.md -->
# Writing Guide for CatalystLab Blog

## Voice & Tone
- Technical but accessible
- Evidence-based claims with sources
- Measurements over opinions

## Structure
1. Introduction (hook + thesis)
2. Body sections with clear headings
3. Sources section with links

## Formatting
- Use H2 for main sections, H3 for subsections
- Code blocks with language tags
- Tables for comparisons
```

- [ ] **Step 8: Commit**

```bash
git add blogs/
git commit -m "feat(blog): create MDX blog directory structure and configuration"
```

---

## Task 2: Migrate Seeded Posts to MDX Files

**Files:**
- Create: `blogs/posts/*.mdx` (12 files, one per seeded post)
- Modify: `blogs/assets/images/covers/` (add cover images referenced in frontmatter)

**Interfaces:**
- Consumes: `blogs/templates/post-template.mdx`, `blogs/templates/frontmatter-schema.json`
- Produces: 12 `.mdx` files in `blogs/posts/`

- [ ] **Step 1: Create MDX file for each seeded post**

For each post in `src/data/engineBlogs.ts`, create a corresponding `.mdx` file in `blogs/posts/` with:
- Frontmatter matching `frontmatter-schema.json`
- Content from `src/data/blogContent.ts`
- Cover image path: `/blogs/assets/images/covers/{slug}.jpg`

Example for `optimizing-dom-depth-render-blocking-nextjs.mdx`:
```mdx
---
title: "Optimizing DOM Depth and Eliminating Render-Blocking Bottlenecks in Next.js"
seoTitle: "DOM Depth and Render-Blocking in Next.js | CatalystLab"
date: "2026-10-19"
excerpt: "Why deep DOM hierarchies severely degrade layout recalculation and mobile INP, and architectural strategies to flatten nested component trees."
author: "Alex Rivera"
authorEmail: "alex.rivera@catalystlab.tech"
authorAvatar: "/blogs/assets/images/avatars/avatar-1.jpg"
category: "Core Performance"
tags: ["DOM", "Core Web Vitals", "LCP", "Next.js", "Performance"]
coverImage: "/blogs/assets/images/covers/optimizing-dom-depth-render-blocking-nextjs.jpg"
featured: true
status: "published"
readTime: "5 min read"
views: 1240
---

## Why DOM depth is a performance budget, not a style preference

Every element a component tree emits becomes a node the browser must style, lay out and paint...
```

- [ ] **Step 2: Copy cover images to assets**

```bash
# Copy from src/assets/images/ to blogs/assets/images/covers/
cp src/assets/images/cover-*.jpg blogs/assets/images/covers/
```

- [ ] **Step 3: Validate all MDX files compile**

```bash
# Test script to verify all posts compile
npx tsx scripts/validate-mdx-posts.ts
```

- [ ] **Step 4: Commit**

```bash
git add blogs/posts/ blogs/assets/images/covers/
git commit -m "feat(blog): migrate 12 seeded posts to MDX files"
```

---

## Task 3: Create MDX Blog Loader & Types

**Files:**
- Create: `src/types/blog.ts` (BlogPost, BlogPostFrontmatter types)
- Create: `src/lib/blogLoader.ts` (load all posts, get by slug, filter)
- Create: `src/lib/blogLoader.test.ts` (unit tests)

**Interfaces:**
- Consumes: `blogs/src/lib/mdxCompiler.ts`, `blogs/src/utils/readingTime.ts`
- Produces: `getAllPosts()`, `getPostBySlug(slug)`, `getPostsByCategory(category)`, `getFeaturedPosts()`

- [ ] **Step 1: Define TypeScript types**

```typescript
// src/types/blog.ts
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
```

- [ ] **Step 2: Implement blog loader**

```typescript
// src/lib/blogLoader.ts
import fs from 'fs/promises';
import path from 'path';
import { compileMDXPost } from '@/blogs/src/lib/mdxCompiler';
import { calculateReadingTime } from '@/blogs/src/utils/readingTime';
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
```

- [ ] **Step 3: Write unit tests**

```typescript
// src/lib/blogLoader.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getAllPosts, getPostBySlug } from './blogLoader';

vi.mock('fs/promises');
vi.mock('@/blogs/src/lib/mdxCompiler');

describe('blogLoader', () => {
  it('loads all published posts sorted by date', async () => {
    const posts = await getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].date).toBeGreaterThanOrEqual(posts[1]?.date ?? '');
  });

  it('returns null for non-existent slug', async () => {
    const post = await getPostBySlug('non-existent');
    expect(post).toBeNull();
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npm test src/lib/blogLoader.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/types/blog.ts src/lib/blogLoader.ts src/lib/blogLoader.test.ts
git commit -m "feat(blog): add MDX blog loader and types"
```

---

## Task 4: Update Blog Index Page (`/blogs`)

**Files:**
- Modify: `src/pages/BlogsPage.tsx`
- Test: `src/pages/BlogsPage.test.tsx` (new)

**Interfaces:**
- Consumes: `src/lib/blogLoader.ts` (`getAllPosts`, `getFeaturedPosts`)
- Produces: Updated blog index page using MDX data

- [ ] **Step 1: Update imports and data fetching**

```tsx
// src/pages/BlogsPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, getFeaturedPosts } from '@/lib/blogLoader';
import type { BlogPost } from '@/types/blog';
// ... existing imports
```

- [ ] **Step 2: Replace seeded data with loader**

```tsx
const [posts, setPosts] = useState<BlogPost[]>([]);
const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadPosts = async () => {
    try {
      const [allPosts, featured] = await Promise.all([
        getAllPosts(),
        getFeaturedPosts(),
      ]);
      setPosts(allPosts);
      setFeaturedPosts(featured);
    } catch (err) {
      logger.error("Error loading blog posts:", err);
    } finally {
      setLoading(false);
    }
  };
  loadPosts();
}, []);
```

- [ ] **Step 3: Update hero post to use featured posts**

```tsx
const heroPost = featuredPosts[0] ?? posts[0] ?? null;
const listPosts = posts.filter(p => p.slug !== heroPost?.slug);
```

- [ ] **Step 4: Update post links to use `/blog/:slug`**

```tsx
<Link to={`/blog/${post.slug}`} className="group flex gap-4 items-center p-3 rounded-2xl hover:bg-muted transition-colors border border-transparent hover:border-foreground/10">
```

- [ ] **Step 5: Add topic filtering from frontmatter categories**

```tsx
const TOPICS = useMemo(() => {
  const categories = [...new Set(posts.map(p => p.category))];
  return [{ key: 'All', label: 'Discover' }, ...categories.map(c => ({ key: c, label: c }))];
}, [posts]);
```

- [ ] **Step 6: Write component test**

```tsx
// src/pages/BlogsPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BlogsPage } from './BlogsPage';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/blogLoader', () => ({
  getAllPosts: vi.fn().mockResolvedValue([
    { slug: 'test-post', title: 'Test Post', excerpt: 'Excerpt', category: 'Core Performance', date: '2026-11-15', coverImage: '/cover.jpg', readTime: '5 min read', featured: false, status: 'published', author: 'Test Author', authorAvatar: '/avatar.jpg', tags: [], views: 0, seoTitle: '', authorEmail: '', coverImage: '', featured: false, readTime: '', views: 0 }
  ]),
  getFeaturedPosts: vi.fn().mockResolvedValue([]),
}));

it('renders blog posts from MDX loader', async () => {
  render(<MemoryRouter><BlogsPage /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('Test Post')).toBeInTheDocument());
});
```

- [ ] **Step 7: Run tests**

```bash
npm test src/pages/BlogsPage.test.tsx
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/BlogsPage.tsx src/pages/BlogsPage.test.tsx
git commit -m "feat(blog): update BlogsPage to use MDX blog loader"
```

---

## Task 5: Update Blog Post Page (`/blog/:slug`)

**Files:**
- Modify: `src/pages/BlogPostPage.tsx`
- Test: `src/pages/BlogPostPage.test.tsx` (new)

**Interfaces:**
- Consumes: `src/lib/blogLoader.ts` (`getPostBySlug`)
- Produces: Updated blog post page using MDX content

- [ ] **Step 1: Update data loading**

```tsx
// src/pages/BlogPostPage.tsx
import { getPostBySlug } from '@/lib/blogLoader';
import type { BlogPost } from '@/types/blog';

const { slug } = useParams<{ slug: string }>();
const [post, setPost] = useState<BlogPost | null>(null);

useEffect(() => {
  const load = async () => {
    if (!slug) return;
    const data = await getPostBySlug(slug);
    if (data) setPost(data);
  };
  load();
}, [slug]);
```

- [ ] **Step 2: Render compiled MDX content**

```tsx
<article className="mx-auto max-w-3xl px-6 pb-16 prose dark:prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed prose-headings:text-foreground sm:px-8">
  {post.content} // This is now compiled React nodes from MDX
</article>
```

- [ ] **Step 3: Update SEO head with frontmatter**

```tsx
<SEOHead
  title={post.seoTitle ?? post.title}
  description={post.excerpt}
  canonicalPath={`/blog/${post.slug}`}
  absoluteTitle
  // Add schema.org Article structured data
  structuredData={{
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'CatalystLab' },
  }}
/>
```

- [ ] **Step 4: Update author strip with frontmatter data**

```tsx
<div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center font-bold overflow-hidden">
    {post.authorAvatar ? (
      <img src={post.authorAvatar} alt={post.author} className="w-full h-full object-cover" />
    ) : (
      post.author[0]
    )}
  </div>
  <span className="font-semibold text-sm text-foreground">{post.author}</span>
</div>
```

- [ ] **Step 5: Handle 404 for missing posts**

```tsx
if (!post) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <SEOHead title="Article not found | CatalystLab" description="That article does not exist." canonicalPath="/blogs" robots="noindex, nofollow" />
      <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center">The article you are looking for does not exist.</p>
      <Link to="/blogs" className="px-6 py-3 bg-muted rounded-full text-sm font-medium hover:bg-muted/80 transition-colors">Back to Discover</Link>
    </div>
  );
}
```

- [ ] **Step 6: Write component test**

```tsx
// src/pages/BlogPostPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BlogPostPage } from './BlogPostPage';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/blogLoader', () => ({
  getPostBySlug: vi.fn().mockResolvedValue({
    slug: 'test-post',
    title: 'Test Post',
    seoTitle: 'Test Post | CatalystLab',
    excerpt: 'Test excerpt',
    content: <p>Test content</p>,
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
    authorAvatar: '',
    readTime: '',
    views: 0,
    seoTitle: '',
    authorEmail: '',
  }),
}));

it('renders blog post from MDX loader', async () => {
  render(<MemoryRouter initialEntries={['/blog/test-post']}><BlogPostPage /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('Test Post')).toBeInTheDocument());
});
```

- [ ] **Step 7: Run tests**

```bash
npm test src/pages/BlogPostPage.test.tsx
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/BlogPostPage.tsx src/pages/BlogPostPage.test.tsx
git commit -m "feat(blog): update BlogPostPage to use MDX blog loader"
```

---

## Task 5: Update Prerender Script for MDX Posts

**Files:**
- Modify: `scripts/prerender.ts`
- Test: `scripts/prerender.test.ts` (new)

**Interfaces:**
- Consumes: `src/lib/blogLoader.ts` (`getAllPosts`, `getPostBySlug`)
- Produces: Static HTML files for all blog posts at build time

- [ ] **Step 1: Update prerender to load MDX posts**

```typescript
// scripts/prerender.ts
import { getAllPosts, getPostBySlug } from '../src/lib/blogLoader';

// In the prerender function:
const posts = await getAllPosts();
for (const post of posts) {
  const html = await renderToString(<BlogPostPage post={post} />);
  await writeFile(path.join(DIST_DIR, 'blog', post.slug, 'index.html'), html);
}
```

- [ ] **Step 2: Update sitemap generation**

```typescript
const blogUrls = posts.map(post => ({
  url: `${APP_ORIGIN}/blog/${post.slug}`,
  lastmod: post.date,
  changefreq: 'monthly',
  priority: 0.8,
}));
```

- [ ] **Step 3: Add validation for frontmatter**

```typescript
function validatePostFrontmatter(post: BlogPost): string[] {
  const errors: string[] = [];
  if (!post.title) errors.push('Missing title');
  if (!post.date) errors.push('Missing date');
  if (!post.excerpt) errors.push('Missing excerpt');
  if (!post.author) errors.push('Missing author');
  if (!post.category) errors.push('Missing category');
  return errors;
}
```

- [ ] **Step 4: Write prerender test**

```typescript
// scripts/prerender.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/lib/blogLoader', () => ({
  getAllPosts: vi.fn().mockResolvedValue([
    { slug: 'test-post', title: 'Test', date: '2026-11-15', ... }
  ]),
  getPostBySlug: vi.fn().mockResolvedValue({ slug: 'test-post', ... }),
}));

describe('prerender', () => {
  it('generates HTML for all published posts', async () => {
    const { prerender } = await import('./prerender');
    await prerender();
    // Verify files written
  });
});
```

- [ ] **Step 5: Run tests**

```bash
npm test scripts/prerender.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add scripts/prerender.ts scripts/prerender.test.ts
git commit -m "feat(blog): update prerender for MDX blog posts"
```

---

## Task 6: Update Blog Editor for MDX Files

**Files:**
- Modify: `src/pages/BlogEditorPage.tsx`
- Create: `src/lib/blogEditor.ts` (save/load MDX files)

**Interfaces:**
- Consumes: `blogs/src/lib/mdxCompiler.ts`, `blogs/src/utils/slugify.ts`
- Produces: Editor that reads/writes `.mdx` files directly

- [ ] **Step 1: Create blog editor utilities**

```typescript
// src/lib/blogEditor.ts
import fs from 'fs/promises';
import path from 'path';
import { slugify } from '@/blogs/src/utils/slugify';

const POSTS_DIR = path.resolve(process.cwd(), 'blogs/posts');

export async function saveBlogPost(data: {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  // ... other frontmatter fields
}): Promise<string> {
  const slug = data.id || slugify(data.title);
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  
  const frontmatter = {
    title: data.title,
    seoTitle: data.seoTitle,
    date: new Date().toISOString().split('T')[0],
    excerpt: data.excerpt,
    author: 'Current User',
    authorEmail: 'user@catalystlab.tech',
    category: data.category,
    tags: data.tags,
    status: data.status,
    // ... other fields
  };
  
  const mdxContent = `---\n${yaml.stringify(frontmatter)}---\n\n${data.content}`;
  await fs.writeFile(filePath, mdxContent, 'utf-8');
  return slug;
}

export async function loadBlogPost(slug: string) {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  const source = await fs.readFile(filePath, 'utf-8');
  // Parse frontmatter and content
  return parseMDX(source);
}
```

- [ ] **Step 2: Update BlogEditorPage to use file-based save/load**

```tsx
// src/pages/BlogEditorPage.tsx
import { saveBlogPost, loadBlogPost } from '@/lib/blogEditor';

const handleSave = async (nextStatus: 'draft' | 'published') => {
  const slug = await saveBlogPost({
    id: postId,
    title,
    excerpt,
    content,
    category,
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    status: nextStatus,
    // ... other fields
  });
  setPostId(slug);
  navigate(listPath);
};

useEffect(() => {
  if (!id) return;
  loadBlogPost(id).then(data => {
    setTitle(data.frontmatter.title);
    setExcerpt(data.frontmatter.excerpt);
    setContent(data.content);
    // ... set other fields
  });
}, [id]);
```

- [ ] **Step 3: Update preview to render MDX**

```tsx
// In preview mode:
import { compileMDXPost } from '@/blogs/src/lib/mdxCompiler';

const { content } = await compileMDXPost(`---\n${yaml.stringify(frontmatter)}---\n\n${content}`);
```

- [ ] **Step 4: Write tests**

```typescript
// src/lib/blogEditor.test.ts
import { describe, it, expect, vi } from 'vitest';
import { saveBlogPost, loadBlogPost } from './blogEditor';

vi.mock('fs/promises');

describe('blogEditor', () => {
  it('saves post as MDX file with frontmatter', async () => {
    const slug = await saveBlogPost({ title: 'Test', content: 'Body', ... });
    expect(slug).toBe('test');
  });
});
```

- [ ] **Step 5: Run tests**

```bash
npm test src/lib/blogEditor.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/blogEditor.ts src/pages/BlogEditorPage.tsx
git commit -m "feat(blog): update BlogEditorPage for MDX file-based editing"
```

---

## Task 7: Add Custom MDX Components

**Files:**
- Create: `blogs/src/components/Callout.tsx`
- Create: `blogs/src/components/Tabs.tsx`
- Create: `blogs/src/components/CodeBlock.tsx`
- Modify: `blogs/src/components/index.ts`
- Modify: `blogs/src/lib/mdxCompiler.ts` (register components)

**Interfaces:**
- Consumes: `blogs/src/components/` (new components)
- Produces: Component map for MDX compilation

- [ ] **Step 1: Create Callout component**

```tsx
// blogs/src/components/Callout.tsx
import React from 'react';

interface CalloutProps {
  type: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  children: React.ReactNode;
}

const styles = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
};

export const Callout: React.FC<CalloutProps> = ({ type = 'info', title, children }) => (
  <div className={`p-4 rounded-lg border ${styles[type]} flex gap-3`}>
    <div className="flex-1">
      {title && <h4 className="font-semibold mb-1">{title}</h4>}
      <div className="prose prose-sm">{children}</div>
    </div>
  </div>
);
```

- [ ] **Step 2: Create Tabs component**

```tsx
// blogs/src/components/Tabs.tsx
import React, { useState } from 'react';

interface Tab { label: string; content: React.ReactNode; }
interface TabsProps { tabs: Tab[]; defaultIndex?: number; }

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0 }) => {
  const [active, setActive] = useState(defaultIndex);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex border-b border-border bg-muted">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active === i ? 'bg-background text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">{tabs[active].content}</div>
    </div>
  );
};
```

- [ ] **Step 3: Register components in MDX compiler**

```typescript
// blogs/src/lib/mdxCompiler.ts
import { Callout, Tabs, CodeBlock } from '@/blogs/src/components';

const components = {
  Callout,
  Tabs,
  Tab: ({ children, label }: { children: React.ReactNode; label: string }) => (
    <Tabs tabs={[{ label, content: children }]} />
  ),
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  // ... other element overrides
};
```

- [ ] **Step 5: Write component tests**

```tsx
// blogs/src/components/Callout.test.tsx
import { render, screen } from '@testing-library/react';
import { Callout } from './Callout';

it('renders callout with correct styling', () => {
  render(<Callout type="warning" title="Warning">Content</Callout>);
  expect(screen.getByText('Warning')).toBeInTheDocument();
  expect(screen.getByText('Content')).toBeInTheDocument();
  expect(screen.getByRole('region')).toHaveClass('bg-yellow-50');
});
```

- [ ] **Step 6: Commit**

```bash
git add blogs/src/components/ blogs/src/lib/mdxCompiler.ts
git commit -m "feat(blog): add custom MDX components (Callout, Tabs, CodeBlock)"
```

---

## Task 8: Clean Up Legacy Blog Files

**Files:**
- Delete: `src/data/engineBlogs.ts`
- Delete: `src/data/blogSeo.ts`
- Delete: `src/data/blogContent.ts`
- Delete: `src/pages/BlogEditorPage.tsx` (if fully replaced)
- Modify: `src/lib/firebase.ts` (remove blog-related Firestore calls)
- Modify: `src/lib/analyticsEngine.ts` (remove blog analytics if any)

**Interfaces:**
- Consumes: None (cleanup)
- Produces: Cleaner codebase without legacy blog system

- [ ] **Step 1: Remove legacy blog data files**

```bash
git rm src/data/engineBlogs.ts src/data/blogSeo.ts src/data/blogContent.ts
```

- [ ] **Step 2: Remove blog-related Firestore calls**

```typescript
// src/lib/firebase.ts - remove getBlogPosts, getBlogPostBySlug, saveBlogPost
// Keep only auth-related Firestore calls
```

- [ ] **Step 3: Update imports in affected files**

```bash
# Find and update any imports of the deleted files
grep -r "engineBlogs\|blogSeo\|blogContent" src/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 6: Run full test suite**

```bash
npm test
```

- [ ] **Step 7: Commit**

```bash
git add -u
git commit -m "chore(blog): remove legacy Firestore-based blog system"
```

---

## Task 9: Update Documentation & Configuration

**Files:**
- Modify: `README.md` (add blog authoring instructions)
- Modify: `package.json` (add MDX dependencies if needed)
- Modify: `tsconfig.json` (add path aliases for `blogs/`)
- Modify: `vite.config.ts` (configure MDX plugin if needed)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Complete documentation and configuration

- [ ] **Step 1: Add MDX dependencies**

```bash
npm install next-mdx-remote yaml
npm install -D @types/yaml
```

- [ ] **Step 2: Update tsconfig.json**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@blogs/*": ["./blogs/*"]
    }
  }
}
```

- [ ] **Step 3: Update README with blog authoring guide**

```markdown
## Blog Authoring

Blog posts are stored as `.mdx` files in `blogs/posts/`. The filename becomes the URL slug.

### Creating a New Post

1. Copy `blogs/templates/post-template.mdx` to `blogs/posts/your-slug.mdx`
2. Fill in frontmatter fields
3. Write content in Markdown/MDX
4. Run `npm run build` to preview

### Frontmatter Reference

See `blogs/templates/frontmatter-schema.json` for all fields.

### Custom Components

Available in MDX: `<Callout />`, `<Tabs />`, `<CodeBlock />`
```

- [ ] **Step 4: Run full test suite**

```bash
npm run lint && npm run typecheck && npm test
```

- [ ] **Step 5: Commit**

```bash
git add README.md package.json tsconfig.json vite.config.ts
git commit -m "docs(blog): add MDX blog authoring documentation and configuration"
```

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-11-15-mdx-blog-system.md`. Please review the plan. Which execution approach would you prefer?**

- **Subagent-driven** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** - I implement every task myself in this session, the way this harness runs work, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end.

**For this plan I recommend Native, because the tasks are highly sequential (each depends on the previous task's interfaces) and the total scope is manageable in a single session. Does the plan capture what you want, and which approach should we use?**