import { z } from 'zod';

/**
 * Request payload schemas for the public API surface (Phase 1 hardening).
 *
 * Every schema strips unknown keys and bounds string lengths so untrusted
 * payloads can neither smuggle extra fields into persistence nor blow up
 * memory/CPU in downstream processing. Pair with the global 256 KB body
 * limit; only /api/state/sync POST opts into a larger limit.
 */

const boundedUrl = z.string().max(2048);

export const checkUrlSchema = z
  .object({ url: boundedUrl })
  .strip();

export const engineRunSchemaFactory = (engines: readonly [string, ...string[]]) =>
  z
    .object({
      url: boundedUrl,
      engine: z.enum(engines)
    })
    .strip();

export const monitorProbeSchema = z
  .object({ url: boundedUrl })
  .strip();

export const STATE_SYNC_COLLECTIONS = [
  'domains',
  'goals',
  'alerts',
  'user_preferences',
  'audit_results',
  'monitored_sites'
] as const;

export const stateSyncSchema = z
  .object({
    collection: z.enum(STATE_SYNC_COLLECTIONS),
    actionType: z.enum(['insert', 'update', 'delete', 'upsert']),
    documentId: z
      .string()
      .max(128)
      .regex(/^[a-zA-Z0-9_\-]+$/, 'documentId may only contain letters, digits, underscore and dash'),
    payload: z.record(z.string(), z.unknown()).default({}),
    timestamp: z.number().optional()
  })
  .strip();

/**
 * Telemetry event ingestion. Mirrors the fields consumed by
 * ``queueEvent`` (analyticsEngine) -- anything else is dropped.
 * ``props`` is bounded to 32 scalar entries; ``vitals`` to 8 numeric entries.
 */
const scalar = z.union([z.string().max(512), z.number().finite(), z.boolean()]);
export const telemetryEventSchema = z
  .object({
    name: z.string().max(64).optional(),
    url: z.string().max(2048).optional(),
    pathname: z.string().max(512).optional(),
    referrer: z.string().max(2048).optional(),
    domain: z.string().max(253).optional(),
    visitor_id: z.string().max(128).optional(),
    session_id: z.string().max(128).optional(),
    timestamp: z.number().optional(),
    props: z.record(z.string(), scalar).optional(),
    vitals: z.record(z.string(), z.number().finite()).optional()
  })
  .strip();

export type ParsedTelemetryEvent = z.infer<typeof telemetryEventSchema>;

/** Flattened first-issue message for client-facing 400 responses. */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Invalid request payload.';
  const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
  return `${path}${issue.message}`;
}
