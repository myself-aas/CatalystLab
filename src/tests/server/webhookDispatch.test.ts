// @vitest-environment node
// Q41: every webhook dispatch goes through `guardedFetch`, which pins the
// socket to the DNS answer the SSRF guard approved and bounds the call with a
// timeout. These tests assert the dispatch contract without touching network.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'crypto';

const { guardedFetch } = vi.hoisted(() => ({ guardedFetch: vi.fn() }));

vi.mock('@/lib/networkSecurity', () => ({ guardedFetch }));

const { sendDiscordWebhook, sendGenericWebhook, sendSlackWebhook } = await import('@/lib/webhookService');

const payload = {
  event: 'score_drop_alert' as const,
  domain: 'example.com',
  title: 'Score dropped',
  summary: 'Health score fell below the threshold',
  severity: 'critical' as const,
  metrics: [{ label: 'Score', value: 61 }],
  timestamp: 1_771_465_200_000
};

function guardedResponse(overrides: Partial<{ ok: boolean; status: number; body: string }> = {}) {
  const { ok = true, status = 204, body = '' } = overrides;
  return {
    ok,
    status,
    elapsedMs: 12,
    headers: { has: () => false, get: () => null },
    text: async () => body,
    json: async () => ({})
  };
}

beforeEach(() => {
  guardedFetch.mockReset();
});

describe('Discord dispatch', () => {
  it('posts the embed through guardedFetch with a bounded timeout', async () => {
    guardedFetch.mockResolvedValue(guardedResponse());

    const result = await sendDiscordWebhook('https://discord.com/api/webhooks/123/abc', payload);

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(204);
    expect(guardedFetch).toHaveBeenCalledTimes(1);
    const [url, options] = guardedFetch.mock.calls[0];
    expect(url).toBe('https://discord.com/api/webhooks/123/abc');
    expect(options.method).toBe('POST');
    expect(options.timeoutMs).toBe(10_000);
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toHaveProperty('embeds');
  });

  it('reports a non-2xx delivery with the target status and body', async () => {
    guardedFetch.mockResolvedValue(guardedResponse({ ok: false, status: 403, body: 'Invalid Webhook Token' }));

    const result = await sendDiscordWebhook('https://discord.com/api/webhooks/123/abc', payload);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.error).toBe('Invalid Webhook Token');
  });

  it('surfaces an SSRF block thrown by the guard', async () => {
    guardedFetch.mockRejectedValue(new Error('Target resolves to a private or reserved network address (10.0.0.5). Access blocked.'));

    const result = await sendDiscordWebhook('https://discord.com/api/webhooks/123/abc', payload);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/private or reserved network address/);
    expect(result.responseTimeMs).toBeTypeOf('number');
  });
});

describe('Slack dispatch', () => {
  it('posts the Block Kit payload to hooks.slack.com only', async () => {
    guardedFetch.mockResolvedValue(guardedResponse({ status: 200, body: 'ok' }));

    const result = await sendSlackWebhook('https://hooks.slack.com/services/T00/B00/XXXX', payload);

    expect(result.success).toBe(true);
    const [, options] = guardedFetch.mock.calls[0];
    expect(JSON.parse(options.body)).toHaveProperty('blocks');
  });

  it('maps a Slack error response onto the result', async () => {
    guardedFetch.mockResolvedValue(guardedResponse({ ok: false, status: 400, body: 'invalid_payload' }));

    const result = await sendSlackWebhook('https://hooks.slack.com/services/T00/B00/XXXX', payload);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('invalid_payload');
  });
});

describe('Generic webhook dispatch', () => {
  it('signs the exact bytes it sends and keeps the dispatcher user agent', async () => {
    guardedFetch.mockResolvedValue(guardedResponse({ status: 202, body: '' }));

    const result = await sendGenericWebhook('https://collector.example.com/hook', payload, 'shhh');

    expect(result.success).toBe(true);
    const [, options] = guardedFetch.mock.calls[0];
    const expectedSignature = `sha256=${createHmac('sha256', 'shhh').update(options.body).digest('hex')}`;
    expect(options.headers['X-Catalyst-Signature']).toBe(expectedSignature);
    expect(options.headers['User-Agent']).toMatch(/CatalystLab-Telemetry-Dispatcher/);
    expect(JSON.parse(options.body)).toMatchObject({
      event: 'score_drop_alert',
      domain: 'example.com',
      severity: 'critical',
      timestamp: 1_771_465_200_000
    });
  });

  it('omits the signature header when no secret is configured', async () => {
    guardedFetch.mockResolvedValue(guardedResponse({ status: 200 }));

    await sendGenericWebhook('https://collector.example.com/hook', payload);

    const [, options] = guardedFetch.mock.calls[0];
    expect(options.headers['X-Catalyst-Signature']).toBeUndefined();
  });

  it('reports a rejected target without retrying', async () => {
    guardedFetch.mockResolvedValue(guardedResponse({ ok: false, status: 500, body: '' }));

    const result = await sendGenericWebhook('https://collector.example.com/hook', payload, 'shhh');

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(500);
    expect(result.error).toMatch(/HTTP status 500/);
    expect(guardedFetch).toHaveBeenCalledTimes(1);
  });
});
