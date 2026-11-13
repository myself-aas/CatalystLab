/**
 * Types for scripts/check-runtime-deps.mjs so the TypeScript test suite can
 * import it under `strict` without `allowJs` (Ruling R1).
 */
export function collectBareRequires(bundleSource: string): string[];
