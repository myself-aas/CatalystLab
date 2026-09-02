import { Request, Response } from 'express';
import { getVerifiedUid, getAttachedIdentity } from '../../src/lib/serverAuth';
import { getDbInstance, initAnalyticsDB } from '../../src/lib/analyticsEngine';
import { stateSyncSchema, firstIssue } from '../../src/lib/validation';
import { logger } from '../core/logger';

// MongoDB document state sync with server-verified ownership (IDOR-hardened).

export function registerStateSyncRoutes(app: import('express').Express): void {

// ==========================================
// PHASE 6: MONGODB DOCUMENT STATE SYNC ENGINE
// ==========================================

// Full State Reconciliation Query (Initial Load & Sync)
app.get('/api/state/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    // SECURITY: ownerId is derived exclusively from a verified Firebase ID
    // token. Client-supplied ownerId values are ignored (IDOR fix).
    const uid = getAttachedIdentity(req)?.uid ?? (await getVerifiedUid(req));
    if (!uid) {
      res.status(401).json({ success: false, error: 'Authentication required to sync state. Sign in and retry with a Bearer ID token.' });
      return;
    }
    const ownerId: string = uid;
    const db = getDbInstance() || await initAnalyticsDB();

    if (!db) {
      // Fallback default structure
      res.json({
        success: true,
        mode: 'in_memory_fallback',
        state: {
          domains: [],
          goals: [],
          alerts: [],
          userPreferences: null,
          auditRecords: []
        }
      });
      return;
    }

    const [domains, goals, alerts, preferences, auditRecords] = await Promise.all([
      db.collection('domains').find({ ownerId }).sort({ createdAt: -1 }).toArray().catch(() => []),
      db.collection('goals').find({ ownerId }).sort({ createdAt: -1 }).toArray().catch(() => []),
      db.collection('alerts').find({ ownerId }).sort({ createdAt: -1 }).toArray().catch(() => []),
      db.collection('user_preferences').findOne({ ownerId }).catch(() => null),
      db.collection('audit_results').find({ ownerId }).sort({ createdAt: -1 }).limit(25).toArray().catch(() => [])
    ]);

    res.json({
      success: true,
      mode: 'mongodb_atlas',
      timestamp: Date.now(),
      state: {
        domains,
        goals,
        alerts,
        userPreferences: preferences,
        auditRecords
      }
    });
  } catch (err: any) {
    logger.error('[State Sync GET] Error querying MongoDB state:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atomic Optimistic State Mutation Persistence (Insert, Update, Delete, Upsert)
app.post('/api/state/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    // SECURITY: mutations require a verified token; every write is stamped
    // and scoped with the token uid so users can only touch their own docs.
    const uid = getAttachedIdentity(req)?.uid ?? (await getVerifiedUid(req));
    if (!uid) {
      res.status(401).json({ success: false, error: 'Authentication required to sync state. Sign in and retry with a Bearer ID token.' });
      return;
    }
    const parsedMutation = stateSyncSchema.safeParse(req.body);
    if (!parsedMutation.success) {
      res.status(400).json({ success: false, error: `Invalid mutation: ${firstIssue(parsedMutation.error)}` });
      return;
    }
    const { collection, actionType, documentId, payload, timestamp } = parsedMutation.data;
    const clientMutationId = (req.headers['x-client-mutation-id'] as string) || `mut_${Date.now()}`;

    const db = getDbInstance() || await initAnalyticsDB();
    if (!db) {
      // Fallback response for in-memory mode
      res.json({
        success: true,
        mode: 'in_memory_simulated',
        mutationId: clientMutationId,
        actionType,
        documentId,
        document: payload
      });
      return;
    }

    const col = db.collection(collection);
    let resultDocument = payload;

    if (actionType === 'insert') {
      const docToInsert = { ...payload, id: documentId, ownerId: uid, createdAt: timestamp || Date.now() };
      delete (docToInsert as any)._id; // prevent duplicate key if already present
      await col.updateOne({ id: documentId, ownerId: uid }, { $set: docToInsert }, { upsert: true });
      resultDocument = docToInsert;
    } else if (actionType === 'update' || actionType === 'upsert') {
      const updatePayload = { ...payload, ownerId: uid, updatedAt: timestamp || Date.now() };
      delete (updatePayload as any)._id;
      await col.updateOne({ id: documentId, ownerId: uid }, { $set: updatePayload }, { upsert: true });
      resultDocument = updatePayload;
    } else if (actionType === 'delete') {
      await col.deleteOne({ id: documentId, ownerId: uid });
      resultDocument = { id: documentId, deleted: true };
    }

    res.json({
      success: true,
      mode: 'mongodb_atlas',
      mutationId: clientMutationId,
      collection,
      actionType,
      documentId,
      document: resultDocument,
      persistedAt: Date.now()
    });
  } catch (err: any) {
    logger.error('[State Sync POST] Error executing mutation on MongoDB:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete document route
app.delete('/api/state/sync/:collection/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    // SECURITY: deletes require a verified token and are scoped to the owner.
    const uid = getAttachedIdentity(req)?.uid ?? (await getVerifiedUid(req));
    if (!uid) {
      res.status(401).json({ success: false, error: 'Authentication required to sync state. Sign in and retry with a Bearer ID token.' });
      return;
    }
    const { collection, id } = req.params;
    const db = getDbInstance() || await initAnalyticsDB();
    if (db) {
      await db.collection(collection).deleteOne({ id, ownerId: uid });
    }
    res.json({ success: true, collection, id, deleted: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

}
