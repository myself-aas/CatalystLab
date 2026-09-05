import crypto from 'crypto';
import { getAdminFirestore } from '../../src/lib/serverAuth';
import { logger } from './logger';

/**
 * Persistent, hashed API-key store.
 *
 * The canonical API-key store is Firestore (`api_keys/{ownerId}_{keyId}`),
 * written only by the trusted Express server (admin SDK). Client writes are
 * denied by `firestore.rules`. A loaded in-memory index keeps request-time
 * validation constant-time and synchronous; every mutation updates it.
 *
 * When Firestore Admin is not configured the store falls back to a single
 * process in-memory wallet (never used for quota accounting in production),
 * so local/demo/test flows continue to work while production deployments get
 * durable, hash-only persistence.
 */

export const API_KEY_PREFIX = 'cat_live_';
export const API_KEY_ENVIRONMENTS = ['production', 'staging', 'development'] as const;
export type ApiKeyEnvironment = (typeof API_KEY_ENVIRONMENTS)[number];

export const API_KEY_SCOPES = [
  'execute:engines',
  'execute:master-audit',
  'read:reports',
  'read:monitoring',
  'manage:webhooks'
] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export interface ApiKeyRecord {
  id: string;
  ownerId: string;
  ownerEmail: string;
  name: string;
  keyPrefix: string;
  /** SHA-256 hex of the full `cat_live_...` secret. Never returned to clients. */
  keyHash: string;
  environment: ApiKeyEnvironment;
  scopes: ApiKeyScope[];
  status: 'active' | 'revoked' | 'expired';
  dailyComputeLimit: number;
  whiteLabelConfig: Record<string, unknown>;
  createdAt: number;
  lastRotatedAt: number | null;
  lastUsedAt: number | null;
  expiresAt: number | null;
  requestCountToday?: number;
  totalRequests?: number;
}

/** Client-safe projection (never includes `keyHash` or the secret). */
export type PublicApiKey = Omit<ApiKeyRecord, 'keyHash'>;

const COLLECTION = 'api_keys';
const byId = new Map<string, ApiKeyRecord>(); // `${ownerId}:${keyId}` -> record
const byHash = new Map<string, ApiKeyRecord>(); // sha256(secret) -> record
let cacheLoaded = false;

export function hashApiKey(secretValue: string): string {
  return crypto.createHash('sha256').update(secretValue, 'utf8').digest('hex');
}

export function generateSecret(): string {
  return `${API_KEY_PREFIX}${crypto.randomBytes(24).toString('hex')}`;
}

export function toPublicApiKey(record: ApiKeyRecord): PublicApiKey {
  const { keyHash: _keyHash, ...rest } = record;
  return rest;
}

function keypairs(ownerId: string, keyId: string): [string, string] {
  return [`${ownerId}:${keyId}`, `${ownerId}_${keyId}`];
}

function indexRecord(record: ApiKeyRecord): void {
  byId.set(`${record.ownerId}:${record.id}`, record);
  if (record.keyHash) byHash.set(record.keyHash, record);
}

function unindexRecord(record: ApiKeyRecord): void {
  byId.delete(`${record.ownerId}:${record.id}`);
  byHash.delete(record.keyHash);
}

/** Loads persisted keys into the in-memory index (idempotent). */
export async function loadApiKeyStore(): Promise<void> {
  if (cacheLoaded) return;
  try {
    const db = await getAdminFirestore();
    if (db) {
      const snap = await db.collection(COLLECTION).get();
      for (const doc of snap.docs) {
        const data = doc.data() as unknown as ApiKeyRecord;
        if (data && typeof data.keyHash === 'string' && data.id && data.ownerId) {
          indexRecord(data);
        }
      }
      logger.info({ count: snap.size }, '[ApiKeys] Loaded persisted key index');
    }
  } catch (err: unknown) {
    logger.warn({ err }, '[ApiKeys] Failed to load persisted key index; using in-memory wallet');
  } finally {
    cacheLoaded = true;
  }
}

/** Resets the loaded store (test/dev hooks). */
export function resetApiKeyStore(): void {
  byId.clear();
  byHash.clear();
  cacheLoaded = false;
}

/**
 * Validates a secret by checking hashes in constant-ish time against the
 * loaded index, then the legacy environment allowlist (`VALID_API_KEYS`).
 * Returns the record when active/not-expired, else null. Fail closed.
 */
export function findApiKey(secretValue: string): PublicApiKey | null {
  if (!secretValue || !secretValue.startsWith(API_KEY_PREFIX)) return null;
  const hash = hashApiKey(secretValue);
  const record = byHash.get(hash);
  if (record) {
    const expired = typeof record.expiresAt === 'number' && record.expiresAt > 0 && record.expiresAt <= Date.now();
    if (record.status === 'active' && !expired) return toPublicApiKey(record);
    return null;
  }

  // Legacy env allowlist fallback (kept for zero-config deployments). The
  // compare is constant-time; the store remains the authoritative source.
  const configured = (process.env.VALID_API_KEYS || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  if (configured.length) {
    const match = configured.some((candidate) => {
      const a = Buffer.from(candidate, 'utf8');
      const b = Buffer.from(secretValue, 'utf8');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
    if (match) {
      return {
        id: `env_${hash.slice(0, 12)}`,
        ownerId: 'env_allowlist',
        ownerEmail: '',
        name: 'Environment API Key',
        keyPrefix: `${secretValue.slice(0, 16)}...`,
        environment: 'production',
        scopes: ['execute:engines', 'execute:master-audit', 'read:reports', 'read:monitoring'],
        status: 'active',
        dailyComputeLimit: 500,
        whiteLabelConfig: {},
        createdAt: Date.now(),
        lastRotatedAt: null,
        lastUsedAt: Date.now(),
        expiresAt: null
      };
    }
  }
  return null;
}

export function listApiKeys(ownerId: string): PublicApiKey[] {
  const records: ApiKeyRecord[] = [];
  for (const record of byId.values()) {
    if (record.ownerId === ownerId) records.push(record);
  }
  return records
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map((r) => toPublicApiKey(r));
}

export function getApiKeyForOwner(ownerId: string, keyId: string): PublicApiKey | null {
  const record = byId.get(`${ownerId}:${keyId}`);
  return record ? toPublicApiKey(record) : null;
}

export async function createApiKey(input: {
  ownerId: string;
  ownerEmail: string;
  name: string;
  environment: ApiKeyEnvironment;
  scopes: ApiKeyScope[];
  expiresInDays?: number;
  whiteLabelConfig?: Record<string, unknown>;
}): Promise<{ apiKey: PublicApiKey; secretKey: string }> {
  const keyId = `key_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const secretKey = generateSecret();
  const createdAt = Date.now();
  const record: ApiKeyRecord = {
    id: keyId,
    ownerId: input.ownerId,
    ownerEmail: input.ownerEmail,
    name: input.name,
    keyPrefix: `${secretKey.slice(0, 16)}...`,
    keyHash: hashApiKey(secretKey),
    environment: input.environment,
    scopes: input.scopes,
    status: 'active',
    dailyComputeLimit: 500,
    whiteLabelConfig: input.whiteLabelConfig || {},
    createdAt,
    lastRotatedAt: null,
    lastUsedAt: null,
    expiresAt: input.expiresInDays ? createdAt + input.expiresInDays * 24 * 60 * 60 * 1000 : null,
    requestCountToday: 0,
    totalRequests: 0
  };

  const db = await getAdminFirestore();
  if (db) {
    const [, docPath] = keypairs(input.ownerId, keyId);
    await db.collection(COLLECTION).doc(docPath).set(record, { merge: false });
  }
  indexRecord(record);
  return { apiKey: toPublicApiKey(record), secretKey };
}

export async function rotateApiKey(ownerId: string, keyId: string): Promise<{ apiKey: PublicApiKey; newSecretKey: string } | null> {
  const existing = byId.get(`${ownerId}:${keyId}`);
  if (!existing) return null;
  const secretKey = generateSecret();
  const rotated: ApiKeyRecord = {
    ...existing,
    keyPrefix: `${secretKey.slice(0, 16)}...`,
    keyHash: hashApiKey(secretKey),
    status: 'active',
    lastRotatedAt: Date.now()
  };
  unindexRecord(existing);
  indexRecord(rotated);

  const db = await getAdminFirestore();
  if (db) {
    const [, docPath] = keypairs(ownerId, keyId);
    await db.collection(COLLECTION).doc(docPath).set(rotated, { merge: false });
  }
  return { apiKey: toPublicApiKey(rotated), newSecretKey: secretKey };
}

export async function revokeApiKey(ownerId: string, keyId: string): Promise<PublicApiKey | null> {
  const existing = byId.get(`${ownerId}:${keyId}`);
  if (!existing) return null;
  const revoked: ApiKeyRecord = { ...existing, status: 'revoked' };
  unindexRecord(existing);
  indexRecord(revoked);
  const db = await getAdminFirestore();
  if (db) {
    const [, docPath] = keypairs(ownerId, keyId);
    await db.collection(COLLECTION).doc(docPath).set(revoked, { merge: true });
  }
  return toPublicApiKey(revoked);
}

export async function deleteApiKey(ownerId: string, keyId: string): Promise<boolean> {
  const existing = byId.get(`${ownerId}:${keyId}`);
  if (!existing) return false;
  unindexRecord(existing);
  const db = await getAdminFirestore();
  if (db) {
    const [, docPath] = keypairs(ownerId, keyId);
    await db.collection(COLLECTION).doc(docPath).delete();
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Body validation helpers shared with the account route.             */
/* ------------------------------------------------------------------ */

export function normalizeScopes(value: unknown): ApiKeyScope[] | null {
  if (!Array.isArray(value)) return null;
  // Fail closed: a key that requests an unknown scope is rejected entirely;
  // silently dropping the unknown scope would grant fewer privileges than the
  // caller asked for and mask typos.
  const everyAllowed = value.every((s) => typeof s === 'string' && (API_KEY_SCOPES as readonly string[]).includes(s));
  if (value.length === 0 || !everyAllowed) return null;
  return Array.from(new Set(value as ApiKeyScope[]));
}

export function normalizeEnvironment(value: unknown): ApiKeyEnvironment | null {
  return typeof value === 'string' && (API_KEY_ENVIRONMENTS as readonly string[]).includes(value)
    ? (value as ApiKeyEnvironment)
    : null;
}

export function normalizeWhiteLabelConfig(value: unknown): Record<string, unknown> | null {
  if (value == null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 8) return null;
  for (const [k, v] of entries) {
    if (k.length > 40) return null;
    const ok = typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || (Array.isArray(v) && v.length <= 8 && v.every((x) => typeof x === 'string'));
    if (!ok) return null;
  }
  return Object.fromEntries(entries);
}
