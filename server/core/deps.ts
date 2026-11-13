/**
 * Explicit seams for the server's external boundaries.
 *
 * A "seam" is the public boundary a test observes behaviour at. Everything in
 * this bag is something the process does *not* own: the network (SSRF-guarded
 * fetching and the engine runners that shell out / probe remote hosts). Tests
 * replace these at the boundary instead of spying on internal modules, so a
 * refactor inside `engines.ts` can never break a test that only asserts what a
 * client sees.
 *
 * Production code resolves the real implementations by default; nothing in the
 * application passes this bag explicitly.
 */

export interface UrlValidation {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
  hostname?: string;
  ip?: string;
}

export interface GuardedResponseLike {
  ok: boolean;
  status: number;
  headers: { has(name: string): boolean; get(name: string): string | null };
  text(): Promise<string>;
  json(): Promise<unknown>;
}

export interface GuardedFetchOptionsLike {
  method?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  isRepo?: boolean;
  maxBytes?: number;
}

/** The engine/network boundary used by `server/routes/engines.ts`. */
export interface EngineDeps {
  /** Runs one audit engine against a target and returns its raw output. */
  runNativeEngine(rawUrl: string, engine: string): Promise<string>;
  /** Validates a target URL against the SSRF guard. */
  validatePublicUrl(rawUrl: string, isRepo?: boolean): Promise<UrlValidation>;
  /** Fetches through the SSRF guard (DNS-pinned, size-capped, TLS verified). */
  guardedFetch(rawUrl: string, options?: GuardedFetchOptionsLike): Promise<GuardedResponseLike>;
}

/** Every external boundary a route module may depend on. */
export interface AppDeps {
  engine: EngineDeps;
}
