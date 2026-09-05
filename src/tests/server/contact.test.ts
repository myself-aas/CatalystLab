// @vitest-environment node
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

let app: Express;

beforeAll(async () => {
  const { createApp } = await import('@server/app');
  app = await createApp();
});

describe('contact intake', () => {
  it('rejects malformed submissions with 400', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({ email: 'not-an-email', message: 'hi' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('silently acknowledges a honeypot submission without persisting', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        email: 'bot@spam.example',
        message: 'buy now',
        honeypot: 'https://spam.example'
      });
    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.honeypot).toBe(true);
    expect(res.body.inquiryId).toMatch(/^inq_/);
  });
});
