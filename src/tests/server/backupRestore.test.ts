import { describe, expect, it } from 'vitest';
import {
  InMemoryBackupAdapter,
  exportBackupSnapshot,
  restoreBackupSnapshot,
  verifyBackupSnapshotIntegrity,
} from '../../../server/core/backupRestore';

describe('server/core/backupRestore — snapshot integrity & clean-instance restore (Plan 4.6)', () => {
  it('exports all collections deterministically, rejects tampered snapshots, and restores identically onto a blank instance', async () => {
    const source = new InMemoryBackupAdapter();
    await source.writeFirestoreCollection('users', [{ id: 'u1', data: { email: 'ops@acme.io', role: 'owner' } }]);
    await source.writeFirestoreCollection('api_keys', [{ id: 'k1', data: { keyHash: 'sha256_abc', ownerUid: 'u1' } }]);
    await source.writeFirestoreCollection('user_subscriptions', [{ id: 'u1', data: { planId: 'pro', status: 'active' } }]);
    await source.writeMongoCollection('analytics_events', [{ id: 'e1', data: { eventType: 'vitals', lcpMs: 990 } }]);

    const snap = await exportBackupSnapshot(source, 'test');
    expect(verifyBackupSnapshotIntegrity(snap)).toEqual({ valid: true, errors: [] });

    const corrupted = structuredClone(snap);
    corrupted.firestore.user_subscriptions[0].data.planId = 'enterprise';
    expect(verifyBackupSnapshotIntegrity(corrupted).valid).toBe(false);
    await expect(restoreBackupSnapshot(corrupted, new InMemoryBackupAdapter())).rejects.toThrow(/Refusing to restore/);

    const cleanTarget = new InMemoryBackupAdapter();
    const res = await restoreBackupSnapshot(snap, cleanTarget);
    expect(res.restoredDocuments).toBe(4);
    expect(await cleanTarget.readFirestoreCollection('user_subscriptions')).toEqual([
      { id: 'u1', data: { planId: 'pro', status: 'active' } },
    ]);
  });
});
