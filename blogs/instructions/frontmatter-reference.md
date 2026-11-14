# Frontmatter Reference

All blog posts must include the following frontmatter fields:

## Required Fields
- `title` (string): Post title
- `date` (string, ISO date): Publication date
- `excerpt` (string, 50-160 chars): SEO/social summary
- `author` (string): Author name
- `category` (string): One of the predefined categories

## Optional Fields
- `seoTitle` (string, max 60 chars): Custom SEO title
- `authorEmail` (string, email): Author email
- `authorAvatar` (string): Path to author avatar
- `tags` (string[], max 10): Topic tags
- `coverImage` (string): Path to cover image
- `featured` (boolean): Feature on homepage
- `status` (draft|published): Publication status
- `readTime` (string): Calculated reading time
- `views` (integer): View count

## Categories
- Core Performance
- Edge Latency
- AI & LLMO
- SecOps
- Sustainability
- Compliance & Security
- Architecture
- AI Search
- Release Notes