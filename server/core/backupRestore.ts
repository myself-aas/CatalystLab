import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * CatalystLab Backup Export & Verified Restore Engine (Plan item 4.6, D9, Q32).
 *
 * Covers every authoritative persistence domain:
 *   - Firestore collections: `users`, `api_keys`, `user_subscriptions`,
 *     `payment_events`, `github_repos`, `contact_inquiries`
 *   - MongoDB collections: `events`
 *
 * Produces deterministic, canonically sorted JSON snapshots with per-collection
 * SHA-256 digests and a top-level manifest SHA-256 integrity seal, and verifies
 * cryptographic integrity before restoring into a target environment.
 */

export const BACKUP_SCHEMA_VERSION = '1.0.0' as const;

export const FIRESTORE_BACKUP_COLLECTIONS = [
  'users',
  'api_keys',
  'user_subscriptions',
  'payment_events',
  'github_repos',
  'contact_inquiries'
] as const;

export const MONGO_BACKUP_COLLECTIONS = ['events'] as const;

export type FirestoreCollectionName = (typeof FIRESTORE_BACKUP_COLLECTIONS)[number];
export type MongoCollectionName = (typeof MONGO_BACKUP_COLLECTIONS)[number];

export interface DocumentRecord {
  id: string;
  data: Record<string, unknown>;
}

export interface BackupStorageAdapter {
  readFirestoreCollection(collection: FirestoreCollectionName): Promise<DocumentRecord[]>;
  writeFirestoreCollection(collection: FirestoreCollectionName, docs: DocumentRecord[]): Promise<void>;
  readMongoCollection(collection: MongoCollectionName): Promise<DocumentRecord[]>;
  writeMongoCollection(collection: MongoCollectionName, docs: DocumentRecord[]): Promise<void>;
}

export interface CollectionDigest {
  count: number;
  sha256: string;
}

export interface BackupSnapshot {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  createdAt: string;
  environment: string;
  firestore: Record<FirestoreCollectionName, DocumentRecord[]>;
  mongodb: Record<MongoCollectionName, DocumentRecord[]>;
  manifest: {
    collections: Record<string, CollectionDigest>;
    totalDocuments: number;
    rootSha256: string;
  };
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  return `{${sortedKeys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(',')}}`;
}

export function computeCollectionDigest(docs: DocumentRecord[]): CollectionDigest {
  const sorted = [...docs].sort((a, b) => a.id.localeCompare(b.id));
  const sha256 = crypto.createHash('sha256').update(canonicalJson(sorted)).digest('hex');
  return { count: sorted.length, sha256 };
}

export function computeRootManifestSha256(collections: Record<string, CollectionDigest>): string {
  return crypto.createHash('sha256').update(canonicalJson(collections)).digest('hex');
}

export class InMemoryBackupAdapter implements BackupStorageAdapter {
  private firestore = new Map<FirestoreCollectionName, Map<string, Record<string, unknown>>>();
  private mongo = new Map<MongoCollectionName, Map<string, Record<string, unknown>>>();

  async readFirestoreCollection(collection: FirestoreCollectionName): Promise<DocumentRecord[]> {
    const bucket = this.firestore.get(collection);
    if (!bucket) return [];
    return Array.from(bucket.entries())
      .map(([id, data]) => ({ id, data: structuredClone(data) }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async writeFirestoreCollection(collection: FirestoreCollectionName, docs: DocumentRecord[]): Promise<void> {
    const bucket = new Map<string, Record<string, unknown>>();
    for (const doc of docs) {
      bucket.set(doc.id, structuredClone(doc.data));
    }
    this.firestore.set(collection, bucket);
  }

  async readMongoCollection(collection: MongoCollectionName): Promise<DocumentRecord[]> {
    const bucket = this.mongo.get(collection);
    if (!bucket) return [];
    return Array.from(bucket.entries())
      .map(([id, data]) => ({ id, data: structuredClone(data) }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async writeMongoCollection(collection: MongoCollectionName, docs: DocumentRecord[]): Promise<void> {
    const bucket = new Map<string, Record<string, unknown>>();
    for (const doc of docs) {
      bucket.set(doc.id, structuredClone(doc.data));
    }
    this.mongo.set(collection, bucket);
  }
}

export async function exportBackupSnapshot(
  adapter: BackupStorageAdapter,
  environment = 'staging'
): Promise<BackupSnapshot> {
  const firestoreData = {} as Record<FirestoreCollectionName, DocumentRecord[]>;
  const mongoData = {} as Record<MongoCollectionName, DocumentRecord[]>;
  const digests: Record<string, CollectionDigest> = {};
  let totalDocuments = 0;

  for (const col of FIRESTORE_BACKUP_COLLECTIONS) {
    const docs = (await adapter.readFirestoreCollection(col)).sort((a, b) => a.id.localeCompare(b.id));
    firestoreData[col] = docs;
    const digest = computeCollectionDigest(docs);
    digests[`firestore.${col}`] = digest;
    totalDocuments += digest.count;
  }

  for (const col of MONGO_BACKUP_COLLECTIONS) {
    const docs = (await adapter.readMongoCollection(col)).sort((a, b) => a.id.localeCompare(b.id));
    mongoData[col] = docs;
    const digest = computeCollectionDigest(docs);
    digests[`mongodb.${col}`] = digest;
    totalDocuments += digest.count;
  }

  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    environment,
    firestore: firestoreData,
    mongodb: mongoData,
    manifest: {
      collections: digests,
      totalDocuments,
      rootSha256: computeRootManifestSha256(digests)
    }
  };
}

export function verifyBackupSnapshotIntegrity(snapshot: BackupSnapshot): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (snapshot.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    errors.push(`Unsupported schemaVersion "${String(snapshot.schemaVersion)}"`);
  }

  const recomputed: Record<string, CollectionDigest> = {};
  let recomputedTotal = 0;

  for (const col of FIRESTORE_BACKUP_COLLECTIONS) {
    const docs = snapshot.firestore?.[col];
    if (!Array.isArray(docs)) {
      errors.push(`Missing Firestore collection "${col}" in snapshot`);
      continue;
    }
    const digest = computeCollectionDigest(docs);
    recomputed[`firestore.${col}`] = digest;
    recomputedTotal += digest.count;
    const expected = snapshot.manifest?.collections?.[`firestore.${col}`];
    if (!expected || expected.sha256 !== digest.sha256 || expected.count !== digest.count) {
      errors.push(`Integrity mismatch in firestore.${col}`);
    }
  }

  for (const col of MONGO_BACKUP_COLLECTIONS) {
    const docs = snapshot.mongodb?.[col];
    if (!Array.isArray(docs)) {
      errors.push(`Missing MongoDB collection "${col}" in snapshot`);
      continue;
    }
    const digest = computeCollectionDigest(docs);
    recomputed[`mongodb.${col}`] = digest;
    recomputedTotal += digest.count;
    const expected = snapshot.manifest?.collections?.[`mongodb.${col}`];
    if (!expected || expected.sha256 !== digest.sha256 || expected.count !== digest.count) {
      errors.push(`Integrity mismatch in mongodb.${col}`);
    }
  }

  if (snapshot.manifest?.totalDocuments !== recomputedTotal) {
    errors.push(`Total document count mismatch: manifest=${snapshot.manifest?.totalDocuments}, actual=${recomputedTotal}`);
  }

  const expectedRoot = computeRootManifestSha256(recomputed);
  if (snapshot.manifest?.rootSha256 !== expectedRoot) {
    errors.push(`Root manifest SHA-256 mismatch: expected ${expectedRoot}, got ${snapshot.manifest?.rootSha256}`);
  }

  return { valid: errors.length === 0, errors };
}

export async function restoreBackupSnapshot(
  snapshot: BackupSnapshot,
  target: BackupStorageAdapter
): Promise<{
  restoredCollections: number;
  restoredDocuments: number;
  rootSha256: string;
}> {
  const integrity = verifyBackupSnapshotIntegrity(snapshot);
  if (!integrity.valid) {
    throw new Error(`Refusing to restore corrupted snapshot: ${integrity.errors.join('; ')}`);
  }

  for (const col of FIRESTORE_BACKUP_COLLECTIONS) {
    await target.writeFirestoreCollection(col, snapshot.firestore[col]);
  }
  for (const col of MONGO_BACKUP_COLLECTIONS) {
    await target.writeMongoCollection(col, snapshot.mongodb[col]);
  }

  const postRestore = await exportBackupSnapshot(target, snapshot.environment);
  if (postRestore.manifest.rootSha256 !== snapshot.manifest.rootSha256) {
    throw new Error(
      `Post-restore verification failed: root SHA-256 ${postRestore.manifest.rootSha256} !== ${snapshot.manifest.rootSha256}`
    );
  }

  return {
    restoredCollections: FIRESTORE_BACKUP_COLLECTIONS.length + MONGO_BACKUP_COLLECTIONS.length,
    restoredDocuments: postRestore.manifest.totalDocuments,
    rootSha256: postRestore.manifest.rootSha256
  };
}

export function writeSnapshotFile(filePath: string, snapshot: BackupSnapshot): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
}

export function readSnapshotFile(filePath: string): BackupSnapshot {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as BackupSnapshot;
}
