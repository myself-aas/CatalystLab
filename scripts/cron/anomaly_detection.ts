/**
 * Hourly Anomaly Detection Script (Phase 4.1 & Step 4.2)
 * Triggered by GitHub Actions CRON: '0 * * * *' (Every hour).
 * Uses GitHub Pro 3,000 free minutes/month + Mailgun + Native HTTP Webhooks.
 */

import { initAnalyticsDB, detectTrafficAnomalies, getAnalyticsStats } from '../../src/lib/analyticsEngine';
import { generateAnomalyAlertHtml, sendEmailViaMailgun } from '../../src/lib/emailService';
import { sendSlackWebhook, sendDiscordWebhook } from '../../src/lib/webhookService';
import 'dotenv/config';

async function runAnomalyDetectionJob() {
  console.log(`[CRON ${new Date().toISOString()}] Starting Hourly Anomaly Detection Job...`);
  
  await initAnalyticsDB();

  const monitoredDomains = (process.env.MONITORED_DOMAINS || 'catalystlab.tech,example.com').split(',').map(d => d.trim());
  const alertEmail = process.env.ALERT_EMAIL || 'support@catalystlab.tech';
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || '';

  let totalAnomaliesDetected = 0;

  for (const domain of monitoredDomains) {
    console.log(`[Anomaly Radar] Inspecting domain: ${domain}`);
    const result = await detectTrafficAnomalies(domain);

    if (result.hasAnomaly && result.type) {
      totalAnomaliesDetected++;
      console.warn(`[ALERT DETECTED] Domain ${domain}: ${result.type.toUpperCase()} (Deviation: ${result.deviationPercent.toFixed(1)}%)`);

      const anomalyData = {
        domain,
        anomalyType: result.type,
        metricName: 'Hourly Traffic Volume (Events / hr)',
        currentValue: `${result.currentHourCount} reqs`,
        baselineValue: `${result.baselineHourlyAvg} reqs`,
        deviationPercentage: result.deviationPercent,
        timestamp: result.timestamp,
        recommendedAction: result.recommendedAction,
        radarUrl: `https://www.catalystlab.tech/dashboard?tab=analytics&domain=${encodeURIComponent(domain)}`
      };

      // 1. Dispatch Mailgun Alert Email (GSDP 20,000 free emails)
      if (alertEmail) {
        console.log(`[Mailgun] Dispatching alert email to ${alertEmail}...`);
        const emailHtml = generateAnomalyAlertHtml(anomalyData);
        const emailRes = await sendEmailViaMailgun({
          to: alertEmail,
          subject: `[CatalystLab Alert] ${result.type === 'traffic_spike' ? 'Traffic Surge' : 'Traffic Drop'} on ${domain}`,
          html: emailHtml
        });
        console.log(`[Mailgun Result] Success: ${emailRes.success}, ID: ${emailRes.messageId}`);
      }

      // 2. Dispatch Slack Webhook (Zero-Cost Native Fetch)
      if (slackWebhookUrl) {
        console.log(`[Slack] Dispatching alert to Slack Webhook...`);
        const slackRes = await sendSlackWebhook(slackWebhookUrl, {
          event: result.type === 'traffic_spike' ? 'anomaly_spike' : 'anomaly_drop',
          domain,
          title: result.type === 'traffic_spike' ? 'Traffic Surge Detected' : 'Traffic Drop Detected',
          summary: `Observed *${result.currentHourCount} reqs/hr* vs baseline *${result.baselineHourlyAvg} reqs/hr* (*${result.deviationPercent > 0 ? '+' : ''}${result.deviationPercent.toFixed(1)}%*).`,
          severity: result.type === 'traffic_spike' ? 'warning' : 'critical',
          metrics: [
            { label: 'Current Volume', value: `${result.currentHourCount} reqs/hr` },
            { label: '24h Baseline', value: `${result.baselineHourlyAvg} reqs/hr` },
            { label: 'Deviation', value: `${result.deviationPercent > 0 ? '+' : ''}${result.deviationPercent.toFixed(1)}%` },
            { label: 'Action', value: result.recommendedAction }
          ],
          actionUrl: anomalyData.radarUrl,
          timestamp: Date.now()
        });
        console.log(`[Slack Result] Success: ${slackRes.success}`);
      }

      // 3. Dispatch Discord Webhook (Zero-Cost Native Fetch)
      if (discordWebhookUrl) {
        console.log(`[Discord] Dispatching alert to Discord Webhook...`);
        const discordRes = await sendDiscordWebhook(discordWebhookUrl, {
          event: result.type === 'traffic_spike' ? 'anomaly_spike' : 'anomaly_drop',
          domain,
          title: result.type === 'traffic_spike' ? 'Traffic Surge Detected' : 'Traffic Drop Detected',
          summary: `Observed ${result.currentHourCount} reqs/hr vs baseline ${result.baselineHourlyAvg} reqs/hr (${result.deviationPercent > 0 ? '+' : ''}${result.deviationPercent.toFixed(1)}%).\n\n**Action:** ${result.recommendedAction}`,
          severity: result.type === 'traffic_spike' ? 'warning' : 'critical',
          metrics: [
            { label: 'Current RPS Volume', value: result.currentHourCount },
            { label: '24h Rolling Avg', value: result.baselineHourlyAvg }
          ],
          actionUrl: anomalyData.radarUrl,
          timestamp: Date.now()
        });
        console.log(`[Discord Result] Success: ${discordRes.success}`);
      }
    } else {
      console.log(`[Status Normal] Domain ${domain}: ${result.currentHourCount} reqs (Baseline: ${result.baselineHourlyAvg}). Within tolerance.`);
    }
  }

  console.log(`[CRON Complete] Processed ${monitoredDomains.length} domains with ${totalAnomaliesDetected} anomalies detected.`);
  process.exit(0);
}

runAnomalyDetectionJob().catch(err => {
  console.error('[CRON Fatal Error]:', err);
  process.exit(1);
});
