/** Lowercase, hyphen-separated, at most 80 characters, never ending in a hyphen. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 80)
    .replace(/^-+|-+$/g, '');
}
