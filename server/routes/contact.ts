import crypto from 'crypto';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../core/logger';
import { getAdminFirestore, getAttachedIdentity } from '../../src/lib/serverAuth';
import { CONTACT_RETENTION_DAYS, expireAt, maybeSweepOnRequest } from '../core/retention';
import { clientIp } from '../core/rateLimit';
import { checkSharedWindowLimit } from '../core/sharedLimiter';

/**
 * Contact / Get-in-touch intake.
 *
 * The browser writes `contact_inquiries` through this trusted server route
 * (Firebase Admin SDK) instead of directly to Firestore, so every submission
 * is:
 *   - schema-validated server-side (Zod),
 *   - honeypot-checked (hidden `website` field),
 *   - rate-limited per IP / UID across instances via shared Redis (4.1/4.2),
 *   - normalized & capped before persistence.
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

// Per-IP/UID windows: max 3 submissions / 15 min, max 5 / hour.
const CONTACT_HOUR_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_15MIN_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_MAX_PER_15MIN = 3;
const CONTACT_MAX_PER_HOUR = 5;

async function allowContact(identifier: string): Promise<boolean> {
  const shortDecision = await checkSharedWindowLimit({
    namespace: 'contact-15m',
    identifier,
    maxRequests: CONTACT_MAX_PER_15MIN,
    windowMs: CONTACT_15MIN_WINDOW_MS
  });
  if (!shortDecision.allowed) return false;

  const hourDecision = await checkSharedWindowLimit({
    namespace: 'contact-1h',
    identifier,
    maxRequests: CONTACT_MAX_PER_HOUR,
    windowMs: CONTACT_HOUR_WINDOW_MS
  });
  return hourDecision.allowed;
}

function makeInquiryId(): string {
  const rand = crypto.randomBytes(4).toString('hex');
  return `inq_${Date.now()}_${rand}`;
}

export function registerContactRoutes(app: express.Express): void {
  app.post('/api/v1/contact', express.json({ limit: '32kb' }), async (req: Request, res: Response) => {
    const identity = getAttachedIdentity(req);
    const ip = clientIp(req);
    const identifier = identity?.uid && identity.uid.length > 0 ? `uid_${identity.uid}` : `ip_${ip}`;

    let permitted = false;
    try {
      permitted = await allowContact(identifier);
    } catch {
      res.status(503).json({ success: false, error: 'Contact rate limiter unavailable.' });
      return;
    }

    if (!permitted) {
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
      expireAt: expireAt(Date.now(), CONTACT_RETENTION_DAYS),
      ownerId: identity?.uid || 'guest',
      submittedIpHash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
      userAgent: (req.headers['user-agent'] || '').toString().slice(0, 400)
    };

    try {
      const db = await getAdminFirestore();
      if (!db) {
        throw new Error('Firestore Admin unavailable; contact intake is offline.');
      }
      await db.collection('contact_inquiries').doc(inquiryId).set(payload);
      maybeSweepOnRequest();

      logger.info({ inquiryId, source: payload.source, ipHash: payload.submittedIpHash }, '[contact] Inquiry recorded');
      res.status(201).json({ success: true, inquiryId });
    } catch (err: unknown) {
      logger.error({ err, inquiryId }, '[contact] Failed to record inquiry');
      res.status(500).json({ success: false, error: 'Could not record inquiry. Please try again shortly.' });
    }
  });
}
