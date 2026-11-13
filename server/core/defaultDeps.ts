/**
 * The production wiring for `AppDeps`: the real network/engine implementations.
 *
 * Kept separate from `deps.ts` so the interfaces stay dependency-free and tests
 * can import the types without pulling in the engine runtime.
 */
import { runNativeEngine } from '../../src/lib/nodeEngines';
import { guardedFetch, validatePublicUrl } from '../../src/lib/networkSecurity';
import type { AppDeps } from './deps';

export const defaultDeps: AppDeps = {
  engine: {
    runNativeEngine: (rawUrl, engine) => runNativeEngine(rawUrl, engine),
    validatePublicUrl: (rawUrl, isRepo) => validatePublicUrl(rawUrl, isRepo),
    guardedFetch: (rawUrl, options) => guardedFetch(rawUrl, options)
  }
};
