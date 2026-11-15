# Frontmatter Reference

The filename is the slug: `blogs/posts/my-post.mdx` is served at `/blogs/my-post`.
Use lowercase letters, digits and single hyphens.

Frontmatter is validated by `blogs/src/lib/postSchema.ts` during `vite build`,
the prerender and the test suite. An invalid post fails the build with the file
and every bad field named. Check locally with:

```bash
npx tsx scripts/validate-mdx-posts.ts
```

`blogs/templates/frontmatter-schema.json` documents the same rules for editors;
a unit test keeps its required fields and categories in step with the validator.

## Required fields
- `title` (string): post title, rendered as the H1
- `date` (`YYYY-MM-DD`): publication date; used for ordering, the sitemap and schema.org
- `excerpt` (string, 50–160 characters): meta description and listing summary
- `author` (string): author name
- `category` (string): one of the categories below

## Optional fields
- `seoTitle` (string, max 60 characters): search-result title; defaults to `title`
- `authorEmail` (email): links the post to that user's dashboard list
- `authorAvatar` (path): for example `/blogs/assets/images/avatars/avatar-1.jpg`
- `tags` (string[], max 10)
- `coverImage` (path): for example `/blogs/assets/images/covers/<slug>.jpg`; falls back to the site OG image
- `featured` (boolean, default `false`)
- `status` (`draft` | `published`, default `published`)
- `readTime` (string): defaults to a 200 words-per-minute estimate
- `views` (integer, default `0`)

Asset paths must point at files that exist under `blogs/assets/`; a missing file fails the build.

## Drafts
`status: draft` posts are left out of the index, the sitemap, RSS and the prerender.
In production builds their body is compiled to an empty stub, so the text does
not ship. The dev server shows drafts in the admin and dashboard blog lists.

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
