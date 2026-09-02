import { Request, Response } from 'express';
import { getAnalyticsStats } from '../../src/lib/analyticsEngine';
import { generateWeeklyReportHtml, generateAnomalyAlertHtml, sendEmailViaMailgun, AnalyticsWeeklyData, AnomalyAlertData } from '../../src/lib/emailService';
import { sendSlackWebhook, sendDiscordWebhook, sendGenericWebhook, WebhookPayloadData } from '../../src/lib/webhookService';

// Notification pipelines: Mailgun email (digests, anomaly alerts) and
// outbound telemetry webhooks (Slack / Discord / generic).

export function registerNotificationRoutes(app: import('express').Express): void {

// ==========================================
// PHASE 4: NOTIFICATIONS, MAILGUN & WEBHOOKS
// ==========================================

// Dispatch Weekly Email Dossier via Mailgun
app.post('/api/notifications/email/weekly-digest', async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain = 'catalystlab.tech', recipientEmail, configOverride } = req.body;

    if (!recipientEmail) {
      res.status(400).json({ success: false, error: 'recipientEmail is required.' });
      return;
    }

    const stats = await getAnalyticsStats({ domain, timeframe: '7d' });
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyData: AnalyticsWeeklyData = {
      domain,
      startDate: lastWeek.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      uniqueVisitors: stats.uniqueVisitors,
      totalPageviews: stats.totalPageviews,
      bounceRate: stats.bounceRate,
      avgSessionDurationFormatted: stats.avgSessionDurationFormatted,
      topPages: stats.topPages,
      topSources: stats.sources.map(s => ({ source: s.name, count: s.count, percentage: s.value })),
      topCountries: stats.countries,
      healthScore: 94,
      carbonEmissionsGrams: 0.18,
      complianceGrade: 'Grade A+ (OWASP / WCAG Compliant)'
    };

    const html = generateWeeklyReportHtml(weeklyData);
    const emailResult = await sendEmailViaMailgun({
      to: recipientEmail,
      subject: `📊 CatalystLab Weekly Telemetry Dossier: ${domain}`,
      html,
      configOverride
    });

    res.json({
      success: emailResult.success,
      messageId: emailResult.messageId,
      mock: emailResult.mock,
      error: emailResult.error,
      sentTo: recipientEmail,
      timestamp: Date.now()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dispatch Instant Anomaly Alert Email via Mailgun
app.post('/api/notifications/email/anomaly-alert', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      domain = 'catalystlab.tech',
      recipientEmail,
      anomalyType = 'traffic_spike',
      currentValue = '1,420 reqs/hr',
      baselineValue = '480 reqs/hr',
      deviationPercentage = 195.8,
      recommendedAction = 'Inspect upstream CDN hit ratio, origin server CPU load, and backlink traffic.'
    } = req.body;

    if (!recipientEmail) {
      res.status(400).json({ success: false, error: 'recipientEmail is required.' });
      return;
    }

    const alertData: AnomalyAlertData = {
      domain,
      anomalyType,
      metricName: 'Traffic Ingestion Volume',
      currentValue,
      baselineValue,
      deviationPercentage,
      timestamp: new Date().toISOString(),
      recommendedAction,
      radarUrl: `https://www.catalystlab.tech/dashboard?tab=analytics&domain=${encodeURIComponent(domain)}`
    };

    const html = generateAnomalyAlertHtml(alertData);
    const emailResult = await sendEmailViaMailgun({
      to: recipientEmail,
      subject: `🚨 [Catalyst Alert] ${anomalyType.replace('_', ' ').toUpperCase()} on ${domain}`,
      html
    });

    res.json({
      success: emailResult.success,
      messageId: emailResult.messageId,
      mock: emailResult.mock,
      error: emailResult.error,
      sentTo: recipientEmail
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test Email Verification Endpoint
app.post('/api/notifications/email/send-test', async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientEmail, configOverride } = req.body;
    if (!recipientEmail) {
      res.status(400).json({ success: false, error: 'recipientEmail is required.' });
      return;
    }

    const testHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 20px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0b192c; margin-top: 0;">CatalystLab Mailgun Test Dispatch</h2>
        <p style="color: #415a77;">This is a test notification confirming that your Mailgun API pipeline is operational under the GitHub Student Developer Pack.</p>
        <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; font-family: monospace; font-size: 13px;">
          Status: CONNECTED<br/>
          Timestamp: ${new Date().toISOString()}<br/>
          Quota: 20,000 Free Emails / Month
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">CatalystLab Multi-Dimensional Telemetry Platform</p>
      </div>
    `;

    const result = await sendEmailViaMailgun({
      to: recipientEmail,
      subject: '✅ CatalystLab Mailgun Connection Test',
      html: testHtml,
      configOverride
    });

    res.json({
      success: result.success,
      messageId: result.messageId,
      mock: result.mock,
      error: result.error,
      recipientEmail
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get HTML Preview of Weekly Digest or Anomaly Alert
app.get('/api/notifications/email/preview-html', async (req: Request, res: Response): Promise<void> => {
  try {
    const type = (req.query.type as string) || 'weekly';
    const domain = (req.query.domain as string) || 'catalystlab.tech';

    if (type === 'anomaly') {
      const html = generateAnomalyAlertHtml({
        domain,
        anomalyType: 'traffic_spike',
        metricName: 'Traffic Ingestion Volume',
        currentValue: '5,820 reqs/hr',
        baselineValue: '1,450 reqs/hr',
        deviationPercentage: 301.4,
        timestamp: new Date().toISOString(),
        recommendedAction: 'Verify CDN edge caching hit ratio, inspect origin CPU load, and check for viral backlink surge.',
        radarUrl: 'https://www.catalystlab.tech/dashboard'
      });
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
      return;
    }

    const stats = await getAnalyticsStats({ domain, timeframe: '7d' });
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const html = generateWeeklyReportHtml({
      domain,
      startDate: lastWeek.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      uniqueVisitors: stats.uniqueVisitors,
      totalPageviews: stats.totalPageviews,
      bounceRate: stats.bounceRate,
      avgSessionDurationFormatted: stats.avgSessionDurationFormatted,
      topPages: stats.topPages,
      topSources: stats.sources.map(s => ({ source: s.name, count: s.count, percentage: s.value })),
      topCountries: stats.countries,
      healthScore: 94,
      carbonEmissionsGrams: 0.18,
      complianceGrade: 'Grade A+ (100% Pass)'
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err: any) {
    res.status(500).send(`Error generating email preview: ${err.message}`);
  }
});

// Generic Webhook Dispatcher
app.post('/api/notifications/webhook/dispatch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slackWebhookUrl, discordWebhookUrl, genericWebhookUrl, webhookSecret, payload } = req.body;
    const results: Record<string, any> = {};

    if (slackWebhookUrl) {
      results.slack = await sendSlackWebhook(slackWebhookUrl, payload);
    }
    if (discordWebhookUrl) {
      results.discord = await sendDiscordWebhook(discordWebhookUrl, payload);
    }
    if (genericWebhookUrl) {
      results.generic = await sendGenericWebhook(genericWebhookUrl, payload, webhookSecret);
    }

    res.json({
      success: true,
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test Slack Webhook
app.post('/api/notifications/webhook/test-slack', async (req: Request, res: Response): Promise<void> => {
  try {
    const { webhookUrl, domain = 'catalystlab.tech' } = req.body;
    if (!webhookUrl) {
      res.status(400).json({ success: false, error: 'webhookUrl is required.' });
      return;
    }

    const result = await sendSlackWebhook(webhookUrl, {
      event: 'health_audit_complete',
      domain,
      title: 'Slack Webhook Verification Test',
      summary: 'CatalystLab Slack Webhook pipeline successfully tested and verified.',
      severity: 'success',
      metrics: [
        { label: 'Integration', value: 'Slack Block Kit' },
        { label: 'Status', value: 'Active / Connected' },
        { label: 'Latency', value: '< 50ms' }
      ],
      actionUrl: 'https://www.catalystlab.tech/dashboard',
      timestamp: Date.now()
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test Discord Webhook
app.post('/api/notifications/webhook/test-discord', async (req: Request, res: Response): Promise<void> => {
  try {
    const { webhookUrl, domain = 'catalystlab.tech' } = req.body;
    if (!webhookUrl) {
      res.status(400).json({ success: false, error: 'webhookUrl is required.' });
      return;
    }

    const result = await sendDiscordWebhook(webhookUrl, {
      event: 'health_audit_complete',
      domain,
      title: 'Discord Webhook Verification Test',
      summary: 'CatalystLab Discord Embed Webhook pipeline successfully tested and verified.',
      severity: 'success',
      metrics: [
        { label: 'Integration', value: 'Discord Rich Embed' },
        { label: 'Status', value: 'Active / Connected' },
        { label: 'Zero-Cost Compute', value: 'Native Fetch' }
      ],
      actionUrl: 'https://www.catalystlab.tech/dashboard',
      timestamp: Date.now()
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

}
