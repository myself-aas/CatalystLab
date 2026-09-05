import path from 'path';
import express, { Request, Response } from 'express';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { queueEvent, generateVisitorId, getAnalyticsStats, detectTrafficAnomalies } from '../../src/lib/analyticsEngine';
import { generateAnomalyAlertHtml, sendEmailViaMailgun, AnomalyAlertData } from '../../src/lib/emailService';
import { sendSlackWebhook, sendDiscordWebhook } from '../../src/lib/webhookService';
import { telemetryEventSchema } from '../../src/lib/validation';
import { logger } from '../core/logger';
import { requireSuperadmin } from '../core/authz';

// First-party telemetry script serving, event ingestion (ad-blocker proof
// proxy strategy), and the zero-cost analytical query pipelines.

export function registerTelemetryRoutes(app: express.Express): void {

// ==========================================
// PHASE 3: FIRST-PARTY PROXY STRATEGY (Ad-Blocker Proof)
// ==========================================

// Step 1: Serve the Tracking Script as a First-Party Asset (<1KB Vanilla JS)
const serveTelemetryScript = (req: Request, res: Response) => {
  const scriptPath = path.join(process.cwd(), 'public', 'telemetry.js');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(scriptPath);
};

app.get('/telemetry.js', serveTelemetryScript);
app.get('/js/telemetry.js', serveTelemetryScript);
app.get('/stats/js', serveTelemetryScript);
app.get('/stats/script.js', serveTelemetryScript);
app.get('/api/telemetry.js', serveTelemetryScript);

// Step 2: First-Party API Ingestion (Catch encrypted/beaconed payload, filter bots, batch in-memory)
const handleTelemetryEvent = (req: Request, res: Response): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // 1. Comprehensive Bot & Crawler Filtering Check (Block Datacenter/AI Crawlers before DB)
  const userAgent = (req.headers['user-agent'] as string) || '';
  const purposeHeader = (req.headers['purpose'] || req.headers['sec-purpose'] || req.headers['x-purpose'] || '') as string;
  const isPrefetch = purposeHeader.toLowerCase().includes('preview') || req.headers['x-moz'] === 'prefetch';

  const botRegex = /bot|crawler|spider|crawling|chatgpt|claude|perplexity|headless|lighthouse|ahrefs|semrush|petalbot|curl|wget|python|go-http|phantom|selenium|puppeteer|googlebot|bingbot|yandex|baidu|slurp|duckduckbot|facebookexternalhit|whatsapp|telegrambot|twitterbot|slackbot|discordbot/i;
  
  if (!userAgent || isPrefetch || botRegex.test(userAgent)) {
    res.status(200).json({ status: 'ignored', reason: 'bot_or_prefetch_traffic' }); // Silently drop bot traffic without processing load
    return;
  }

  // Support direct JSON object, array of events, and stringified beacon payloads
  let rawBody = req.body;
  if (typeof rawBody === 'string') {
    try {
      rawBody = JSON.parse(rawBody);
    } catch {
      rawBody = {};
    }
  }

  // Normalize events array (supports single event, array of events, or { events: [...] })
  let eventsList: any[] = [];
  if (Array.isArray(rawBody)) {
    eventsList = rawBody;
  } else if (rawBody && Array.isArray(rawBody.events)) {
    eventsList = rawBody.events;
  } else if (rawBody && typeof rawBody === 'object' && Object.keys(rawBody).length > 0) {
    eventsList = [rawBody];
  }

  if (eventsList.length === 0) {
    res.status(200).json({ status: 'ignored', reason: 'empty_payload' });
    return;
  }

  // 2. Local Zero-Cost Geo-IP Resolution (Behind Cloudflare/Vercel proxy headers).
  // Express `req.ip` is derived from `trust proxy` when TRUST_PROXY=true and
  // otherwise falls back to the direct socket address. We never manually trust
  // client-supplied X-Forwarded-For / X-Real-IP headers, which would allow
  // spoofed visitor hashing and geo attribution.
  const rawIp = String(req.ip || req.socket.remoteAddress || '').split(',')[0].trim();

  const geo = geoip.lookup(rawIp);
  const country = geo ? geo.country : 'Unknown';
  const city = geo ? geo.city : 'Unknown';

  // 3. User-Agent Parsing (Browser, OS, Device)
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser().name || 'Unknown';
  const os = parser.getOS().name || 'Unknown';
  const device = parser.getDevice().type || 'desktop';

  let processedCount = 0;

  for (const rawItem of eventsList) {
    if (!rawItem || typeof rawItem !== 'object') continue;
    // Phase 1: schema-validate every event; drop malformed ones silently
    // (telemetry is a fire-and-forget surface, but junk must not persist).
    const validatedEvent = telemetryEventSchema.safeParse(rawItem);
    if (!validatedEvent.success) continue;
    const item = validatedEvent.data;

    const domain = item.domain || (item.url ? (() => { try { return new URL(item.url).hostname; } catch { return 'unknown'; } })() : 'unknown');
    const cleanDomain = domain.replace(/^www\./, '');

    // 4. Cookieless Privacy Hashing (Daily Salt Rotation - 100% GDPR/ePrivacy Compliant)
    const visitor_id = item.visitor_id || generateVisitorId(rawIp, userAgent, cleanDomain);
    const currentHour = new Date().toISOString().substring(0, 13);
    const session_id = item.session_id || generateVisitorId(rawIp, userAgent + currentHour, cleanDomain);

    let source = 'Direct';
    if (item.referrer) {
      try {
        source = new URL(item.referrer).hostname;
      } catch (e) {
        source = String(item.referrer);
      }
    }

    // 5. In-Memory Batching Queue (Flushes every 3 seconds or 500 events to MongoDB)
    queueEvent({
      domain: cleanDomain,
      name: item.name || 'pageview',
      url: item.url || `https://${cleanDomain}${item.pathname || '/'}`,
      pathname: item.pathname || '/',
      referrer: item.referrer || null,
      browser,
      os,
      device,
      country,
      city,
      source,
      visitor_id,
      session_id,
      props: item.props || undefined,
      vitals: item.vitals || undefined,
      timestamp: item.timestamp || undefined
    });

    processedCount++;
  }

  // 6. Asynchronous Edge Response
  res.status(202).json({ success: true, processed: processedCount });
};

// Support JSON, text, and array bodies for sendBeacon and fetch
const telemetryBodyParsers = express.json({ type: ['application/json', 'text/plain', 'text/json'], limit: '256kb' });

// Handle CORS OPTIONS preflight
const handleTelemetryOptions = (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.status(204).end();
};

app.options('/api/telemetry/event', handleTelemetryOptions);
app.options('/api/event', handleTelemetryOptions);
app.options('/stats/event', handleTelemetryOptions);
app.options('/api/stats/event', handleTelemetryOptions);

app.post('/api/telemetry/event', telemetryBodyParsers, handleTelemetryEvent);
app.post('/api/event', telemetryBodyParsers, handleTelemetryEvent);
app.post('/stats/event', telemetryBodyParsers, handleTelemetryEvent);
app.post('/api/stats/event', telemetryBodyParsers, handleTelemetryEvent);

// ==========================================
// PHASE 5: ZERO-COST ANALYTICAL QUERY PIPELINES
// ==========================================

// Query zero-cost MongoDB time-series aggregations (Cookieless Visitors, Bounce Rate, Session Time)
app.get('/api/analytics/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const domain = (req.query.domain as string) || 'all';
    const timeframe = ((req.query.timeframe as string) || '7d') as '24h' | '7d' | '30d' | 'all';

    const stats = await getAnalyticsStats({ domain, timeframe });
    res.json({
      success: true,
      stats
    });
  } catch (err: any) {
    logger.error('Error in /api/analytics/stats:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to query analytics telemetry.' });
  }
});

// Live Real-Time Active Visitors Pulse
app.get('/api/analytics/realtime', async (req: Request, res: Response): Promise<void> => {
  try {
    const domain = (req.query.domain as string) || 'all';
    const stats = await getAnalyticsStats({ domain, timeframe: '24h' });
    res.json({
      success: true,
      domain,
      activeVisitorsNow: stats.activeVisitorsNow,
      todayUniqueVisitors: stats.uniqueVisitors,
      todayPageviews: stats.totalPageviews,
      timestamp: Date.now()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Execute Anomaly Detection Check across domains
app.post('/api/analytics/anomalies/check', async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain = 'all', notify = false, alertEmail, slackWebhookUrl, discordWebhookUrl } = req.body;
    const result = await detectTrafficAnomalies(domain);

    let notificationsDispatched = { email: false, slack: false, discord: false };
    if (notify) {
      if (!requireSuperadmin(req, res)) return;
    }

    if (notify && result.hasAnomaly && result.type && result.type !== 'healthy') {
      const anomalyData: AnomalyAlertData = {
        domain: domain === 'all' ? 'all-monitored-domains' : domain,
        anomalyType: result.type,
        metricName: 'Hourly Ingestion Volume',
        currentValue: `${result.currentHourCount} reqs`,
        baselineValue: `${result.baselineHourlyAvg} reqs`,
        deviationPercentage: result.deviationPercent,
        timestamp: result.timestamp,
        recommendedAction: result.recommendedAction,
        radarUrl: `https://www.catalystlab.tech/dashboard?tab=analytics`
      };

      if (alertEmail) {
        const emailHtml = generateAnomalyAlertHtml(anomalyData);
        const emailRes = await sendEmailViaMailgun({
          to: alertEmail,
          subject: `[CatalystLab Alert] ${result.type === 'traffic_spike' ? 'Traffic Surge' : 'Traffic Drop'} on ${domain}`,
          html: emailHtml
        });
        notificationsDispatched.email = emailRes.success;
      }

      if (slackWebhookUrl) {
        const slackRes = await sendSlackWebhook(slackWebhookUrl, {
          event: result.type === 'traffic_spike' ? 'anomaly_spike' : 'anomaly_drop',
          domain,
          title: result.type === 'traffic_spike' ? 'Traffic Surge Detected' : 'Traffic Drop Detected',
          summary: `Observed ${result.currentHourCount} reqs/hr vs baseline ${result.baselineHourlyAvg} reqs/hr (${result.deviationPercent > 0 ? '+' : ''}${result.deviationPercent.toFixed(1)}%).`,
          severity: result.type === 'traffic_spike' ? 'warning' : 'critical',
          metrics: [
            { label: 'Current Volume', value: `${result.currentHourCount} reqs/hr` },
            { label: 'Baseline', value: `${result.baselineHourlyAvg} reqs/hr` },
            { label: 'Deviation', value: `${result.deviationPercent.toFixed(1)}%` }
          ]
        });
        notificationsDispatched.slack = slackRes.success;
      }

      if (discordWebhookUrl) {
        const discordRes = await sendDiscordWebhook(discordWebhookUrl, {
          event: result.type === 'traffic_spike' ? 'anomaly_spike' : 'anomaly_drop',
          domain,
          title: result.type === 'traffic_spike' ? 'Traffic Surge Detected' : 'Traffic Drop Detected',
          summary: `Observed ${result.currentHourCount} reqs/hr vs baseline ${result.baselineHourlyAvg} reqs/hr (${result.deviationPercent > 0 ? '+' : ''}${result.deviationPercent.toFixed(1)}%).`,
          severity: result.type === 'traffic_spike' ? 'warning' : 'critical',
          metrics: [
            { label: 'Current Volume', value: result.currentHourCount },
            { label: 'Baseline', value: result.baselineHourlyAvg }
          ]
        });
        notificationsDispatched.discord = discordRes.success;
      }
    }

    res.json({
      success: true,
      domain,
      anomaly: result,
      notificationsDispatched
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

}
