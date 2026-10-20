import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

// Sentry must never be reached from a test: the module is mocked so the
// assertions are about what we hand the SDK, not about the network.
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureEvent: vi.fn(),
  captureException: vi.fn(),
}));

import { captureEvent, captureException as sentryCaptureException, init as sentryInit } from '@sentry/node';
import {
  captureClientError,
  captureException,
  initErrorTracking,
  isErrorTrackingEnabled,
  installProcessErrorHandlers,
  resetErrorTrackingForTests,
  scrubEvent,
  scrubSensitiveText,
} from '../../../server/core/errorTracking';
import { registerClientLogRoutes } from '../../../server/routes/clientLogs';

const FAKE_DSN = 'https://public@example.invalid/1';

describe('PII scrubbing (D10)', () => {
  it('removes emails, IPv4 addresses and credentials from free text', () => {
    const text =
      'login failed for owner@catalystlab.tech from 203.0.113.7:4432 with Bearer abc.def-ghi and key catalyst_9f3a and sig sha256=deadbeefdeadbeef';
    const scrubbed = scrubSensitiveText(text);
    expect(scrubbed).not.toContain('owner@catalystlab.tech');
    expect(scrubbed).not.toContain('203.0.113.7');
    expect(scrubbed).not.toContain('abc.def-ghi');
    expect(scrubbed).not.toContain('catalyst_9f3a');
    expect(scrubbed).not.toContain('deadbeefdeadbeef');
    expect(scrubbed).toContain('[redacted-email]');
    expect(scrubbed).toContain('[redacted-ip]');
    expect(scrubbed).toContain('login failed for');
  });

  it('drops request headers, cookies and the IP address from an event', () => {
    const scrubbed = scrubEvent({
      message: 'boom for user@example.com',
      user: { id: 'uid-1', email: 'user@example.com' },
      request: {
        url: '/api/v1/audit/master',
        ip_address: '198.51.100.4',
        cookies: 'session=abc',
        headers: { authorization: 'Bearer secret', 'x-request-id': 'req-1' },
        method: 'POST',
      },
      extra: { note: 'called by admin@example.com' },
    });

    expect(scrubbed.message).toBe('boom for [redacted-email]');
    expect(scrubbed.user).toBeUndefined();
    const req = scrubbed.request as Record<string, unknown>;
    expect(req.ip_address).toBeUndefined();
    expect(req.cookies).toBeUndefined();
    expect(req.headers).toBeUndefined();
    expect(req.url).toBe('/api/v1/audit/master');
    expect(req.method).toBe('POST');
    expect((scrubbed.extra as { note: string }).note).toBe('called by [redacted-email]');
  });

  it('scrubs exception values and stops recursing into deep objects', () => {
    const scrubbed = scrubEvent({
      exception: { values: [{ type: 'TypeError', value: 'bad input from user@example.com' }] },
      extra: { a: { b: { c: { d: { e: { f: 'deep' } } } } } },
    });
    const values = (scrubbed.exception as { values: Array<{ value: string }> }).values;
    expect(values[0].value).toBe('bad input from [redacted-email]');
    expect(JSON.stringify(scrubbed.extra)).toContain('[truncated]');
  });
});

describe('error tracking lifecycle (D10)', () => {
  beforeEach(() => {
    resetErrorTrackingForTests();
    vi.mocked(sentryInit).mockClear();
    vi.mocked(captureEvent).mockClear();
    vi.mocked(sentryCaptureException).mockClear();
  });

  afterEach(() => {
    resetErrorTrackingForTests();
    delete process.env.SENTRY_DSN;
  });

  it('stays off and forwards nothing when SENTRY_DSN is unset', () => {
    expect(initErrorTracking({})).toBe(false);
    expect(isErrorTrackingEnabled()).toBe(false);
    expect(captureClientError({ message: 'ignored' })).toBe(false);
    expect(captureException(new Error('ignored'))).toBe(false);
    expect(sentryInit).not.toHaveBeenCalled();
    expect(captureEvent).not.toHaveBeenCalled();
    expect(sentryCaptureException).not.toHaveBeenCalled();
  });

  it('initialises with scrubbing hooks and no default PII when a DSN is set', () => {
    expect(
      initErrorTracking({ SENTRY_DSN: FAKE_DSN, SENTRY_ENVIRONMENT: 'staging', SENTRY_TRACES_SAMPLE_RATE: '0.25' })
    ).toBe(true);
    expect(isErrorTrackingEnabled()).toBe(true);
    const options = vi.mocked(sentryInit).mock.calls[0][0] as Record<string, unknown>;
    expect(options.dsn).toBe(FAKE_DSN);
    expect(options.environment).toBe('staging');
    expect(options.tracesSampleRate).toBe(0.25);
    expect(options.sendDefaultPii).toBe(false);
    expect(typeof options.beforeSend).toBe('function');
  });

  it('clamps a bad sample rate and does not re-initialise twice', () => {
    initErrorTracking({ SENTRY_DSN: FAKE_DSN, SENTRY_TRACES_SAMPLE_RATE: 'not-a-number' });
    const first = vi.mocked(sentryInit).mock.calls[0][0] as Record<string, unknown>;
    expect(first.tracesSampleRate).toBe(0);

    const before = vi.mocked(sentryInit).mock.calls.length;
    initErrorTracking({ SENTRY_DSN: FAKE_DSN });
    expect(vi.mocked(sentryInit).mock.calls.length).toBe(before + 1);
    expect(isErrorTrackingEnabled()).toBe(true);
  });

  it('forwards a client error to Sentry with the scrubbed payload', () => {
    initErrorTracking({ SENTRY_DSN: FAKE_DSN });
    const forwarded = captureClientError({
      message: 'audit failed for user@example.com',
      stack: 'at run (app.js:1:1)',
      href: 'https://www.catalystlab.tech/dashboard',
      userAgent: 'vitest',
      ts: 1_760_000_000_000,
      context: { plan: 'pro', email: 'user@example.com' },
    });
    expect(forwarded).toBe(true);
    const event = vi.mocked(captureEvent).mock.calls[0][0] as Record<string, unknown>;
    expect(event.message).toBe('audit failed for [redacted-email]');
    expect(event.platform).toBe('javascript');
    expect(event.level).toBe('error');
    expect((event.extra as { email: string }).email).toBe('[redacted-email]');
    expect(JSON.stringify(event)).toContain('at run (app.js:1:1)');
  });

  it('registers process-level handlers without throwing', () => {
    const on = vi.spyOn(process, 'on').mockImplementation(() => process);
    installProcessErrorHandlers();
    const events = on.mock.calls.map((call) => call[0]);
    expect(events).toContain('unhandledRejection');
    expect(events).toContain('uncaughtException');
    on.mockRestore();
  });
});

describe('POST /api/client-logs relay', () => {
  beforeEach(() => {
    resetErrorTrackingForTests();
    vi.mocked(captureEvent).mockClear();
  });

  afterEach(() => {
    resetErrorTrackingForTests();
    delete process.env.SENTRY_DSN;
  });

  function buildApp() {
    const app = express();
    registerClientLogRoutes(app);
    return app;
  }

  it('accepts a batch and relays error-level events to the tracker', async () => {
    initErrorTracking({ SENTRY_DSN: FAKE_DSN });
    const res = await request(buildApp())
      .post('/api/client-logs')
      .send({
        events: [
          { level: 'error', message: 'engine crashed for a@catalystlab.tech', href: '/dashboard' },
          { level: 'warn', message: 'slow engine' },
        ],
      });
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ success: true, accepted: 2 });
    // Only the error-level event is relayed; the warning stays in the logs.
    expect(vi.mocked(captureEvent)).toHaveBeenCalledTimes(1);
    const event = vi.mocked(captureEvent).mock.calls[0][0] as Record<string, unknown>;
    expect(String(event.message)).not.toContain('a@catalystlab.tech');
  });

  it('keeps working with tracking disabled', async () => {
    const res = await request(buildApp())
      .post('/api/client-logs')
      .send({ events: [{ level: 'error', message: 'offline tracking' }] });
    expect(res.status).toBe(202);
    expect(vi.mocked(captureEvent)).not.toHaveBeenCalled();
  });

  it('rejects an invalid payload', async () => {
    const res = await request(buildApp()).post('/api/client-logs').send({ events: [{ level: 'fatal' }] });
    expect(res.status).toBe(400);
  });
});
