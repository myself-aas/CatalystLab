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
## Checks the build enforces
The SEO tests (`src/tests/unit/seoAeo.test.ts`) fail the suite unless every published post:
- opens with an `##` heading rather than a bare paragraph
- has at least 400 words
- links at least two external `https://` sources
- uses no em dashes and none of: delve, leverage, seamless, robust, streamline, furthermore, moreover, utilize

## Publishing
1. Copy `blogs/templates/post-template.mdx` to `blogs/posts/<slug>.mdx`, or use the
   editor at `/admin/blogs/create` and download the file it produces.
2. Add images under `blogs/assets/`.
3. Run `npx tsx scripts/validate-mdx-posts.ts` and `npm test`.
4. Commit. The post goes live on the next deploy.
