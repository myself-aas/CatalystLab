/**
 * Client-side resolver for files under `blogs/assets/`.
 *
 * Vite emits each matched file into `dist/assets/` with a content hash; this
 * map turns the path an author wrote (`/blogs/assets/images/covers/x.jpg`, or
 * `../assets/images/covers/x.jpg` relative to `blogs/posts/`) into that URL.
 * Only URL strings are bundled, not file contents. Unknown paths and external
 * URLs pass through unchanged.
 */
const ASSET_URLS = import.meta.glob<string>('/blogs/assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg,pdf,zip}', {
  eager: true,
  import: 'default',
  query: '?url',
});

export function resolveBlogAsset(src: string): string;
export function resolveBlogAsset(src: string | undefined): string | undefined;
export function resolveBlogAsset(src: string | undefined): string | undefined {
  if (!src) return src;
  const key = src.replace(/^\.\.\/assets\//, '/blogs/assets/');
  return ASSET_URLS[key] ?? src;
}
