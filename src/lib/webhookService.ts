/**
 * Zero-Cost Webhook Dispatch Engine for Slack, Discord, and Generic HTTP Endpoints
 * Executes asynchronous HTTP POST requests using native fetch with HMAC-SHA256 signature support.
 */

export interface WebhookPayloadData {
  event: 'anomaly_spike' | 'anomaly_drop' | 'downtime' | 'weekly_digest' | 'health_audit_complete' | 'score_drop_alert';
  domain: string;
  title: string;
  summary: string;
  metrics?: {
    label: string;
    value: string | number;
    baseline?: string | number;
  }[];
  severity?: 'info' | 'warning' | 'critical' | 'success';
  actionUrl?: string;
  timestamp?: number;
  score?: number;
  engine?: string;
}

export interface WebhookResult {
  success: boolean;
  destination: 'slack' | 'discord' | 'generic';
  statusCode?: number;
  error?: string;
  responseTimeMs?: number;
}

/**
 * Format payload into Slack Block Kit structure
 */
export function formatSlackBlocks(data: WebhookPayloadData) {
  const isCritical = data.severity === 'critical';
  const isWarning = data.severity === 'warning';
  const isSuccess = data.severity === 'success';

  const emoji = isCritical ? '🚨' : isWarning ? '⚠️' : isSuccess ? '🚀' : '📊';

  const fields = (data.metrics || []).map(m => ({
    type: 'mrkdwn',
    text: `*${m.label}:*\n\`${m.value}\`${m.baseline ? ` _(baseline: ${m.baseline})_` : ''}`
  }));

  return {
    text: `${emoji} [CatalystLab] ${data.title}: ${data.domain}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} ${data.title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Domain:* \`${data.domain}\`\n${data.summary}`
        }
      },
      ...(fields.length > 0
        ? [
            {
              type: 'section',
              fields: fields.slice(0, 8)
            }
          ]
        : []),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Telemetry Radar',
              emoji: true
            },
            style: isCritical ? 'danger' : 'primary',
            url: data.actionUrl || 'https://www.catalystlab.tech/dashboard'
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `CatalystLab Telemetry Alert • <!date^${Math.floor((data.timestamp || Date.now()) / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`
          }
        ]
      }
    ]
  };
}

/**
 * Format payload into Discord Rich Embed structure
 */
export function formatDiscordEmbed(data: WebhookPayloadData) {
  const isCritical = data.severity === 'critical';
  const isWarning = data.severity === 'warning';
  const isSuccess = data.severity === 'success';

  // Discord color integers
  const color = isCritical ? 0xef4444 : isWarning ? 0xf59e0b : isSuccess ? 0x10b981 : 0x06b6d4;

  return {
    username: 'CatalystLab Telemetry',
    avatar_url: 'https://www.catalystlab.tech/favicon.svg',
    embeds: [
      {
        title: `${data.title} — ${data.domain}`,
        description: data.summary,
        url: data.actionUrl || 'https://www.catalystlab.tech/dashboard',
        color: color,
        fields: (data.metrics || []).map(m => ({
          name: m.label,
          value: `${m.value}${m.baseline ? ` *(Baseline: ${m.baseline})*` : ''}`,
          inline: true
        })),
        footer: {
          text: 'CatalystLab Autonomous Telemetry Radar',
          icon_url: 'https://www.catalystlab.tech/favicon.svg'
        },
        timestamp: new Date(data.timestamp || Date.now()).toISOString()
      }
    ]
  };
}

/**
 * Outbound dispatch timeout. Every webhook send is bounded so a slow or
 * black-holed target cannot hold an Express request open indefinitely.
 */
const WEBHOOK_TIMEOUT_MS = 10_000;

/** Parses `rawUrl` and returns it only when it is an absolute `https:` URL. */
function parseHttpsUrl(rawUrl: string): URL | null {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Slack incoming-webhook check. The URL is parsed, not substring-matched:
 * `https://evil.example/?hooks.slack.com/services/x` must not pass.
 */
export function isSlackWebhookUrl(rawUrl: string): boolean {
  const parsed = parseHttpsUrl(rawUrl);
  if (!parsed) return false;
  if (parsed.hostname.toLowerCase() !== 'hooks.slack.com') return false;
  return parsed.pathname.startsWith('/services/');
}

/**
 * Discord webhook check (Q41 / plan 3.4). Requires `https`, the host
 * `discord.com` or `discordapp.com` (including the `canary.` / `ptb.` release
 * channels) and a path under `/api/webhooks/`.
 */
export function isDiscordWebhookUrl(rawUrl: string): boolean {
  const parsed = parseHttpsUrl(rawUrl);
  if (!parsed) return false;
  const host = parsed.hostname.toLowerCase();
  const allowed = ['discord.com', 'discordapp.com'].some(
    (base) => host === base || host.endsWith(`.${base}`)
  );
  if (!allowed) return false;
  return parsed.pathname.startsWith('/api/webhooks/');
}

/**
 * Single outbound path for every webhook destination: `guardedFetch` resolves
 * DNS once, rejects private/loopback/link-local/metadata addresses, pins the
 * socket to the validated IP (anti-rebinding), re-validates every redirect hop,
 * caps the response body and enforces the timeout.
 */
async function dispatchWebhook(
  destination: WebhookResult['destination'],
  webhookUrl: string,
  bodyString: string,
  extraHeaders: Record<string, string> = {}
): Promise<WebhookResult> {
  const start = performance.now();
  try {
    const { guardedFetch } = await import('./networkSecurity');
    const response = await guardedFetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: bodyString,
      timeoutMs: WEBHOOK_TIMEOUT_MS
    });
    const elapsed = Math.round(performance.now() - start);

    if (!response.ok && response.status !== 204) {
      const text = (await response.text()).slice(0, 500);
      return {
        success: false,
        destination,
        statusCode: response.status,
        error: text || `Target returned HTTP status ${response.status}`,
        responseTimeMs: elapsed
      };
    }

    return {
      success: true,
      destination,
      statusCode: response.status,
      responseTimeMs: elapsed
    };
  } catch (err: any) {
    return {
      success: false,
      destination,
      error: err?.message || `Network error dispatching ${destination} webhook`,
      responseTimeMs: Math.round(performance.now() - start)
    };
  }
}

/**
 * Dispatch a Slack incoming webhook. Fail closed: a URL that is not a real
 * Slack webhook is rejected instead of being silently "mocked" as delivered.
 */
export async function sendSlackWebhook(webhookUrl: string, data: WebhookPayloadData): Promise<WebhookResult> {
  if (!isSlackWebhookUrl(webhookUrl)) {
    return {
      success: false,
      destination: 'slack',
      error: 'Target is not a Slack incoming webhook URL (expected https://hooks.slack.com/services/...).'
    };
  }
  return dispatchWebhook('slack', webhookUrl, JSON.stringify(formatSlackBlocks(data)));
}

/**
 * Dispatch a Discord webhook. Fail closed on anything that is not a parsed
 * `https://discord.com/api/webhooks/...` (or `discordapp.com`) URL.
 */
export async function sendDiscordWebhook(webhookUrl: string, data: WebhookPayloadData): Promise<WebhookResult> {
  if (!isDiscordWebhookUrl(webhookUrl)) {
    return {
      success: false,
      destination: 'discord',
      error: 'Target is not a Discord webhook URL (expected https://discord.com/api/webhooks/...).'
    };
  }
  return dispatchWebhook('discord', webhookUrl, JSON.stringify(formatDiscordEmbed(data)));
}

/**
 * Dispatch a generic REST webhook with an optional HMAC-SHA256 signature over
 * the exact bytes that are sent. SSRF validation happens inside `guardedFetch`,
 * on the same DNS answer the socket is pinned to (no validate-then-fetch race).
 */
export async function sendGenericWebhook(webhookUrl: string, data: WebhookPayloadData, secret?: string): Promise<WebhookResult> {
  const scheme = parseHttpsUrl(webhookUrl);
  if (!scheme) {
    return {
      success: false,
      destination: 'generic',
      error: 'Invalid target webhook URL scheme (must be an absolute https:// URL).'
    };
  }

  const payloadString = JSON.stringify({
    event: data.event,
    timestamp: data.timestamp || Date.now(),
    domain: data.domain,
    title: data.title,
    summary: data.summary,
    metrics: data.metrics || [],
    severity: data.severity || 'info',
    actionUrl: data.actionUrl,
    score: data.score
  });

  const headers: Record<string, string> = {
    'User-Agent': 'CatalystLab-Telemetry-Dispatcher/2.5.0'
  };

  if (secret) {
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadString);
    headers['X-Catalyst-Signature'] = `sha256=${hmac.digest('hex')}`;
  }

  return dispatchWebhook('generic', webhookUrl, payloadString, headers);
}
