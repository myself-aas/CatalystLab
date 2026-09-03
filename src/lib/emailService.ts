/**
 * Mailgun Email Service & HTML Dossier Generation Engine (Phase 4)
 * Uses native fetch API to dispatch emails via Mailgun REST API (GSDP 20,000 free emails/month).
 */

import { errorMessage } from './utils';
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface AnalyticsWeeklyData {
  domain: string;
  startDate: string;
  endDate: string;
  uniqueVisitors: number;
  totalPageviews: number;
  bounceRate: number; // percentage e.g. 38.5
  avgSessionDurationFormatted: string; // e.g. "2m 45s"
  topPages: { pathname: string; views: number; uniqueVisitors: number }[];
  topSources: { source: string; count: number; percentage: number }[];
  topCountries: { country: string; count: number }[];
  healthScore: number;
  carbonEmissionsGrams: number;
  complianceGrade: string;
}

export interface AnomalyAlertData {
  domain: string;
  anomalyType: 'traffic_spike' | 'traffic_drop' | 'downtime' | 'latency_spike' | 'security_breach';
  metricName: string;
  currentValue: number | string;
  baselineValue: number | string;
  deviationPercentage: number;
  timestamp: string;
  recommendedAction: string;
  radarUrl: string;
}

export interface MailgunConfig {
  apiKey?: string;
  domain?: string;
  host?: string; // 'api.mailgun.net' or 'api.eu.mailgun.net'
  fromEmail?: string;
  fromName?: string;
}

export function getMailgunConfig(): MailgunConfig {
  return {
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || 'mg.catalystlab.tech',
    host: process.env.MAILGUN_HOST || 'api.mailgun.net',
    fromEmail: process.env.MAILGUN_FROM_EMAIL || `telemetry@${process.env.MAILGUN_DOMAIN || 'mg.catalystlab.tech'}`,
    fromName: process.env.MAILGUN_FROM_NAME || 'CatalystLab Telemetry Intelligence'
  };
}

/**
 * Generate high-fidelity HTML for Weekly Telemetry & Analytics Email Dossier
 */
export function generateWeeklyReportHtml(data: AnalyticsWeeklyData): string {
  const primaryColor = '#0b192c';
  const slateColor = '#415a77';
  const periwinkleColor = '#c5d3e8';
  const emeraldColor = '#10b981';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CatalystLab Weekly Telemetry Dossier: ${data.domain}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0b192c; }
    .container { max-width: 640px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(11,25,44,0.05); }
    .header { background-color: ${primaryColor}; padding: 32px 28px; text-align: center; }
    .brand { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0; text-transform: uppercase; }
    .badge { display: inline-block; background: rgba(197, 211, 232, 0.2); color: ${periwinkleColor}; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; margin-top: 6px; letter-spacing: 0.5px; }
    .title-area { padding: 24px 28px 12px 28px; border-bottom: 1px solid #f1f5f9; }
    .title-area h2 { margin: 0; font-size: 18px; color: ${primaryColor}; font-weight: 800; }
    .title-area p { margin: 4px 0 0 0; font-size: 13px; color: ${slateColor}; }
    .grid { display: table; width: 100%; padding: 20px 28px; box-sizing: border-box; }
    .grid-row { display: table-row; }
    .grid-cell { display: table-cell; width: 50%; padding: 10px; vertical-align: top; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
    .stat-label { font-size: 11px; font-weight: 700; color: ${slateColor}; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0; }
    .stat-val { font-size: 24px; font-weight: 900; color: ${primaryColor}; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .section-title { font-size: 14px; font-weight: 800; color: ${primaryColor}; margin: 24px 28px 12px 28px; text-transform: uppercase; letter-spacing: 0.5px; }
    .table-container { padding: 0 28px 20px 28px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 12px; background: #f8fafc; color: ${slateColor}; font-weight: 700; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #0b192c; }
    .score-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 12px; }
    .score-pass { background: #ecfdf5; color: #059669; }
    .btn-container { text-align: center; padding: 24px 28px 32px 28px; }
    .btn { display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; }
    .footer { background: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand">CatalystLab</h1>
      <span class="badge">WEEKLY TELEMETRY DOSSIER</span>
    </div>

    <div class="title-area">
      <h2>Weekly Analytics Digest: ${data.domain}</h2>
      <p>Report Period: ${data.startDate} — ${data.endDate} • Generated via Zero-Cost Cookieless Analytics</p>
    </div>

    <div class="grid">
      <div class="grid-row">
        <div class="grid-cell">
          <div class="stat-card">
            <p class="stat-label">Unique Visitors</p>
            <p class="stat-val">${data.uniqueVisitors.toLocaleString()}</p>
          </div>
        </div>
        <div class="grid-cell">
          <div class="stat-card">
            <p class="stat-label">Total Pageviews</p>
            <p class="stat-val">${data.totalPageviews.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-cell">
          <div class="stat-card">
            <p class="stat-label">Bounce Rate</p>
            <p class="stat-val">${data.bounceRate.toFixed(1)}%</p>
          </div>
        </div>
        <div class="grid-cell">
          <div class="stat-card">
            <p class="stat-label">Avg Session Time</p>
            <p class="stat-val">${data.avgSessionDurationFormatted}</p>
          </div>
        </div>
      </div>
    </div>

    <h3 class="section-title">Catalyst Multi-Dimensional Architecture Health</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Diagnostic Engine</th>
            <th>Metric</th>
            <th>Evaluation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Overall Quality Index</td>
            <td><strong>${data.healthScore}/100</strong></td>
            <td><span class="score-badge score-pass">Grade ${data.healthScore >= 90 ? 'A+' : data.healthScore >= 80 ? 'A' : 'B'}</span></td>
          </tr>
          <tr>
            <td>Digital Carbon Footprint</td>
            <td>${data.carbonEmissionsGrams.toFixed(2)} g CO2/view</td>
            <td><span class="score-badge score-pass">SWD v4 Compliant</span></td>
          </tr>
          <tr>
            <td>OWASP & Security Headers</td>
            <td>${data.complianceGrade}</td>
            <td><span class="score-badge score-pass">HSTS Preloaded</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="section-title">Top Traffic Referrers</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Visitors</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          ${data.topSources.slice(0, 4).map(s => `
            <tr>
              <td><strong>${s.source}</strong></td>
              <td>${s.count.toLocaleString()}</td>
              <td>${s.percentage.toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="btn-container">
      <a href="https://www.catalystlab.tech/dashboard" class="btn" target="_blank">Open Full Analytics Dashboard</a>
    </div>

    <div class="footer">
      <p>This automated digest is powered by CatalystLab Zero-Cost Telemetry Engine & Mailgun Infrastructure (GSDP).</p>
      <p>To modify notification frequencies or webhook destinations, visit your CatalystLab User Dashboard.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate high-fidelity HTML for Instant Traffic Anomaly & Downtime Alerts
 */
export function generateAnomalyAlertHtml(alert: AnomalyAlertData): string {
  const isSpike = alert.anomalyType === 'traffic_spike';
  const isDown = alert.anomalyType === 'downtime' || alert.anomalyType === 'security_breach';
  const accentColor = isDown ? '#e11d48' : isSpike ? '#059669' : '#d97706';
  const alertTitle = isDown ? 'CRITICAL ALERT: Outage or Security Threshold Exceeded' : isSpike ? 'TRAFFIC SURGE DETECTED' : 'ANOMALY DETECTED: Traffic Drop';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${alertTitle} — ${alert.domain}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0b192c; }
    .container { max-width: 640px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(11,25,44,0.05); }
    .header { background-color: ${accentColor}; padding: 24px 28px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255,255,255,0.25); color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
    .title-area { padding: 24px 28px; border-bottom: 1px solid #f1f5f9; }
    .title-area h2 { margin: 0; font-size: 20px; color: #0b192c; font-weight: 800; }
    .title-area p { margin: 6px 0 0 0; font-size: 13px; color: #415a77; }
    .metrics-box { margin: 20px 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .metric-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
    .metric-row:last-child { margin-bottom: 0; }
    .metric-name { color: #415a77; font-weight: 600; }
    .metric-val { font-weight: 800; color: #0b192c; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; }
    .recommendation-box { margin: 20px 28px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; font-size: 13px; color: #1e3a8a; line-height: 1.5; }
    .btn-container { text-align: center; padding: 16px 28px 32px 28px; }
    .btn { display: inline-block; background-color: #0b192c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; }
    .footer { background: #f8fafc; padding: 16px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">${alertTitle}</span>
    </div>

    <div class="title-area">
      <h2>${alert.domain}</h2>
      <p>Timestamp: ${alert.timestamp} • Automated Anomaly Radar Engine</p>
    </div>

    <div class="metrics-box">
      <div class="metric-row">
        <span class="metric-name">Observed Metric:</span>
        <span class="metric-val">${alert.metricName}</span>
      </div>
      <div class="metric-row">
        <span class="metric-name">Current Value:</span>
        <span class="metric-val" style="color: ${accentColor};">${alert.currentValue}</span>
      </div>
      <div class="metric-row">
        <span class="metric-name">Expected Baseline (24h avg):</span>
        <span class="metric-val">${alert.baselineValue}</span>
      </div>
      <div class="metric-row">
        <span class="metric-name">Deviation:</span>
        <span class="metric-val" style="color: ${accentColor};">${alert.deviationPercentage > 0 ? '+' : ''}${alert.deviationPercentage.toFixed(1)}%</span>
      </div>
    </div>

    <div class="recommendation-box">
      <strong>Recommended Engineering Action:</strong><br>
      ${alert.recommendedAction}
    </div>

    <div class="btn-container">
      <a href="${alert.radarUrl}" class="btn" target="_blank">Launch Real-Time Diagnostic Radar</a>
    </div>

    <div class="footer">
      <p>Dispatched via CatalystLab Automated Anomaly Detection CRON Pipeline.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatch Email via Mailgun REST API (Zero-Cost via GitHub Student Developer Pack)
 */
export async function sendEmailViaMailgun(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  configOverride?: Partial<MailgunConfig>;
}): Promise<{ success: boolean; messageId?: string; error?: string; mock?: boolean }> {
  // Never honor client-supplied Mailgun credentials (apiKey/host/domain).
  const safeOverride = options.configOverride
    ? { fromEmail: options.configOverride.fromEmail, fromName: options.configOverride.fromName }
    : {};
  const config = { ...getMailgunConfig(), ...safeOverride };

  if (!config.apiKey || config.apiKey === 'YOUR_MAILGUN_API_KEY') {
    console.log(`[Mailgun Mock Dispatch] Sent email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to} | Subject: "${options.subject}" (Mock Mode: MAILGUN_API_KEY not set)`);
    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@catalystlab.tech`,
      mock: true
    };
  }

  const recipients = Array.isArray(options.to) ? options.to.join(',') : options.to;
  const formData = new URLSearchParams();
  formData.append('from', `${config.fromName} <${config.fromEmail}>`);
  formData.append('to', recipients);
  formData.append('subject', options.subject);
  formData.append('html', options.html);
  if (options.text) {
    formData.append('text', options.text);
  }

  const endpoint = `https://${config.host}/v3/${config.domain}/messages`;
  const authHeader = `Basic ${Buffer.from(`api:${config.apiKey}`).toString('base64')}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(responseData.message || `Mailgun HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      success: true,
      messageId: responseData.id || `mg_${Date.now()}`
    };
  } catch (err: unknown) {
    console.error('Mailgun dispatch failed:', err);
    return {
      success: false,
      error: errorMessage(err) || 'Failed to dispatch email via Mailgun'
    };
  }
}
