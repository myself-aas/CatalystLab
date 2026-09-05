import crypto from 'crypto';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../core/logger';
import { getAdminFirestore, getAttachedIdentity } from '../../src/lib/serverAuth';
import { clientIp } from '../core/rateLimit';

/**
 * Contact / Get-in-touch intake.
 *
 * The browser writes `contact_inquiries` through this trusted server route
 * (Firebase Admin SDK) instead of directly to Firestore, so every submission
 * is:
 *   - schema-validated server-side (Zod),
 *   - honeypot-checked (hidden `website` field),
 *   - rate-limited per IP (and per authenticated UID when present),
 *   - normalized & capped before persistence.
 *
 * `firestore.rules` denies direct client creates on `contact_inquiries`, the
 * Admin SDK bypasses client rules, and the UI receives a deterministic ticket
 * id from the server only after the write succeeds.
 */

const inquirySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(256),
  name: z.string().trim().max(150).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(100).optional(),
  company: z.string().trim().max(200).optional(),
  department: z.string().trim().max(40).optional(),
  honeypot: z.string().max(512).optional(),
  metadata: z
    .record(z.string().max(40), z.union([z.string().max(500), z.number(), z.boolean()]))
    .refine((m) => Object.keys(m).length <= 6, { message: 'metadata too large' })
    .optional()
});

// Per-IP/UID sliding window: max 3 submissions / 15 min, max 5 / hour.
const CONTACT_HOUR_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_15MIN_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_MAX_PER_15MIN = 3;
const CONTACT_MAX_PER_HOUR = 5;

const hits = new Map<string, number[]>();

function allowContact(identifier: string): boolean {
  const now = Date.now();
  const hourStart = now - CONTACT_HOUR_WINDOW_MS;
  const quarterStart = now - CONTACT_15MIN_WINDOW_MS;
  const recent = (hits.get(identifier) || []).filter((t) => t > hourStart);

  const inLastHour = recent.length;
  const inLast15Min = recent.filter((t) => t > quarterStart).length;

  if (inLastHour >= CONTACT_MAX_PER_HOUR || inLast15Min >= CONTACT_MAX_PER_15MIN) {
    hits.set(identifier, recent);
    return false;
  }

  recent.push(now);
  hits.set(identifier, recent);
  // Opportunistic GC to keep the map bounded under abuse.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => t > hourStart)) hits.delete(key);
    }
  }
  return true;
}

function makeInquiryId(): string {
  const rand = Math.random().toString(36).substring(2, 9);
  return `inq_${Date.now()}_${rand}`;
}

export function registerContactRoutes(app: express.Express): void {
  app.post('/api/v1/contact', express.json({ limit: '32kb' }), async (req: Request, res: Response) => {
    const identity = getAttachedIdentity(req);
    const ip = clientIp(req);
    const identifier = identity?.uid && identity.uid.length > 0 ? `uid_${identity.uid}` : `ip_${ip}`;

    if (!allowContact(identifier)) {
      res.status(429).json({
        success: false,
        error: 'Too many contact submissions. Please try again later.'
      });
      return;
    }

    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid contact submission.' });
      return;
    }

    const data = parsed.data;
    // Honeypot: bots fill a hidden field real users never see. Acknowledge
    // success without persisting so automated scanners move on.
    if (data.honeypot && data.honeypot.trim().length > 0) {
      res.status(202).json({ success: true, inquiryId: makeInquiryId(), honeypot: true });
      return;
    }

    const inquiryId = makeInquiryId();
    const payload = {
      email: data.email,
      ...(data.name ? { name: data.name } : {}),
      ...(data.message ? { message: data.message } : {}),
      source: data.source || 'get-in-touch-popup',
      ...(data.company ? { company: data.company } : {}),
      ...(data.department ? { department: data.department } : {}),
      ...(data.metadata && Object.keys(data.metadata).length ? { metadata: data.metadata } : {}),
      honeypot: '',
      status: 'new',
      createdAt: Date.now(),
      ownerId: identity?.uid || 'guest',
      submittedIpHash: require('crypto').createHash('sha256').update(ip).digest('hex').slice(0, 16),
      userAgent: (req.headers['user-agent'] || '').toString().slice(0, 400)
    };

    try {
      const db = await getAdminFirestore();
      if (!db) {
        throw new Error('Firestore Admin unavailable; contact intake is offline.');
      }
      await db.collection('contact_inquiries').doc(inquiryId).set(payload);

      logger.info({ inquiryId, source: payload.source, ipHash: payload.submittedIpHash }, '[contact] Inquiry recorded');
      res.status(201).json({ success: true, inquiryId });
    } catch (err: unknown) {
      logger.error({ err, inquiryId }, '[contact] Failed to record inquiry');
      res.status(500).json({ success: false, error: 'Could not record inquiry. Please try again shortly.' });
    }
  });
}
