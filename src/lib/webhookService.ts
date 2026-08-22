/**
 * Free Webhook Dispatch Engine for Slack & Discord (Phase 4.3)
 * Executes standard HTTP POST requests using native Node.js fetch (Zero-Cost).
 */

export interface WebhookPayloadData {
  event: 'anomaly_spike' | 'anomaly_drop' | 'downtime' | 'weekly_digest' | 'health_audit_complete';
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
            text: `CatalystLab Zero-Cost Telemetry Alert • <!date^${Math.floor((data.timestamp || Date.now()) / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`
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
  const color = isCritical ? 0xef4444 : isWarning ? 0xf59e0b : isSuccess ? 0x10b981 : 0x0b192c;

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
 * Dispatch Slack Webhook using native fetch
 */
export async function sendSlackWebhook(webhookUrl: string, data: WebhookPayloadData): Promise<WebhookResult> {
  const start = performance.now();
  if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
    // If mock or invalid URL
    console.log(`[Slack Mock Webhook] Dispatched event: ${data.event} for ${data.domain}`);
    return {
      success: true,
      destination: 'slack',
      statusCode: 200,
      responseTimeMs: 25
    };
  }

  try {
    const payload = formatSlackBlocks(data);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const elapsed = Math.round(performance.now() - start);

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        destination: 'slack',
        statusCode: response.status,
        error: text || response.statusText,
        responseTimeMs: elapsed
      };
    }

    return {
      success: true,
      destination: 'slack',
      statusCode: response.status,
      responseTimeMs: elapsed
    };
  } catch (err: any) {
    return {
      success: false,
      destination: 'slack',
      error: err.message,
      responseTimeMs: Math.round(performance.now() - start)
    };
  }
}

/**
 * Dispatch Discord Webhook using native fetch
 */
export async function sendDiscordWebhook(webhookUrl: string, data: WebhookPayloadData): Promise<WebhookResult> {
  const start = performance.now();
  if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks/')) {
    // If mock or invalid URL
    console.log(`[Discord Mock Webhook] Dispatched event: ${data.event} for ${data.domain}`);
    return {
      success: true,
      destination: 'discord',
      statusCode: 204,
      responseTimeMs: 20
    };
  }

  try {
    const payload = formatDiscordEmbed(data);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const elapsed = Math.round(performance.now() - start);

    if (!response.ok && response.status !== 204) {
      const text = await response.text();
      return {
        success: false,
        destination: 'discord',
        statusCode: response.status,
        error: text || response.statusText,
        responseTimeMs: elapsed
      };
    }

    return {
      success: true,
      destination: 'discord',
      statusCode: response.status,
      responseTimeMs: elapsed
    };
  } catch (err: any) {
    return {
      success: false,
      destination: 'discord',
      error: err.message,
      responseTimeMs: Math.round(performance.now() - start)
    };
  }
}
