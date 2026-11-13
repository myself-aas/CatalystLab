/** Types for scripts/verify-media.mjs so the TS suite can import it under strict (Ruling R1). */
export function summarize(results: Array<{ ok: boolean; status: number }>): 'pass' | 'skip' | 'fail';
