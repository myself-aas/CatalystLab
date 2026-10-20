// @vitest-environment node
// Q41 / plan items 3.3 and 3.4: webhook destinations are validated by parsing
// the URL (not by substring match), and every dispatch goes through the SSRF
// guard on the same DNS answer the socket is pinned to.
import { describe, expect, it } from 'vitest';
import {
  isDiscordWebhookUrl,
  isSlackWebhookUrl,
  sendDiscordWebhook,
  sendGenericWebhook,
  sendSlackWebhook,
  type WebhookPayloadData
} from '@/lib/webhookService';

const payload: WebhookPayloadData = {
  event: 'anomaly_spike',
  domain: 'example.com',
  title: 'Traffic surge',
  summary: 'Spike detected',
  severity: 'warning'
};

describe('Discord webhook URL validation (plan 3.4)', () => {
  it('accepts real Discord webhook URLs on every release channel', () => {
    expect(isDiscordWebhookUrl('https://discord.com/api/webhooks/123/abc')).toBe(true);
    expect(isDiscordWebhookUrl('https://canary.discord.com/api/webhooks/123/abc')).toBe(true);
    expect(isDiscordWebhookUrl('https://ptb.discordapp.com/api/webhooks/123/abc')).toBe(true);
  });

  it('rejects the substring-smuggling attack', () => {
    expect(isDiscordWebhookUrl('https://evil.example/?discord.com/api/webhooks/x')).toBe(false);
    expect(isDiscordWebhookUrl('https://evil.example/discord.com/api/webhooks/x')).toBe(false);
    expect(isDiscordWebhookUrl('https://discord.com.evil.example/api/webhooks/x')).toBe(false);
    expect(isDiscordWebhookUrl('https://notdiscord.com/api/webhooks/x')).toBe(false);
  });

  it('rejects non-https schemes, wrong paths and unparseable input', () => {
    expect(isDiscordWebhookUrl('http://discord.com/api/webhooks/123/abc')).toBe(false);
    expect(isDiscordWebhookUrl('https://discord.com/api/emoji')).toBe(false);
    expect(isDiscordWebhookUrl('discord.com/api/webhooks/123')).toBe(false);
    expect(isDiscordWebhookUrl('')).toBe(false);
  });

  it('never dispatches to a URL that only looks like a Discord webhook', async () => {
    const result = await sendDiscordWebhook('https://evil.example/?discord.com/api/webhooks/x', payload);
    expect(result.success).toBe(false);
    expect(result.destination).toBe('discord');
    expect(result.error).toMatch(/not a Discord webhook URL/);
    expect(result.statusCode).toBeUndefined();
  });

  it('fails closed on an empty destination instead of reporting a mock delivery', async () => {
    const result = await sendDiscordWebhook('', payload);
    expect(result.success).toBe(false);
  });
});

describe('Slack webhook URL validation', () => {
  it('accepts hooks.slack.com/services and rejects lookalikes', () => {
    expect(isSlackWebhookUrl('https://hooks.slack.com/services/T00/B00/XXXX')).toBe(true);
    expect(isSlackWebhookUrl('https://evil.example/?hooks.slack.com/services/T00')).toBe(false);
    expect(isSlackWebhookUrl('https://hooks.slack.com.evil.example/services/T00')).toBe(false);
    expect(isSlackWebhookUrl('http://hooks.slack.com/services/T00/B00/XXXX')).toBe(false);
    expect(isSlackWebhookUrl('https://hooks.slack.com/api/other')).toBe(false);
  });

  it('never dispatches to a non-Slack host', async () => {
    const result = await sendSlackWebhook('https://evil.example/?hooks.slack.com/services/x', payload);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a Slack incoming webhook URL/);
  });
});

describe('Generic webhook SSRF guard (plan 3.3)', () => {
  it('refuses non-https targets', async () => {
    const result = await sendGenericWebhook('http://example.com/hook', payload);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/https/);
  });

  it('refuses a target that resolves to a private address', async () => {
    // An IP literal needs no DNS, so this exercises the real guard offline.
    const result = await sendGenericWebhook('https://127.0.0.1/hook', payload);
    expect(result.success).toBe(false);
    expect(result.destination).toBe('generic');
  });

  it('refuses the cloud metadata endpoint', async () => {
    const result = await sendGenericWebhook('https://169.254.169.254/latest/meta-data/', payload);
    expect(result.success).toBe(false);
  });

  it('refuses an internal RFC1918 host', async () => {
    const result = await sendGenericWebhook('https://10.0.0.5:8443/hook', payload, 'secret');
    expect(result.success).toBe(false);
  });
});
