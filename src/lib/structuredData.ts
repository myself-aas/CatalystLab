/**
 * Safe serialization for JSON-LD structured-data blocks.
 *
 * `JSON.stringify` does not escape `<`, so a payload containing
 * `</script>` would terminate the script element early and allow script
 * injection into the page (e.g. user- or URL-derived labels make this
 * attacker-controllable). Escaping `<` as `\u003c` is JSON-compatible and
 * keeps the structured data intact for crawlers while making script
 * breakout impossible.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
