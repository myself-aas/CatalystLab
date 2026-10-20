import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { queueEvent, generateVisitorId, getAnalyticsStats, detectTrafficAnomalies } from '../../src/lib/analyticsEngine';
import { generateAnomalyAlertHtml, sendEmailViaMailgun, AnomalyAlertData } from '../../src/lib/emailService';
import { sendSlackWebhook, sendDiscordWebhook } from '../../src/lib/webhookService';
import { telemetryEventSchema } from '../../src/lib/validation';
import { logger } from '../core/logger';
import { requireSuperadmin } from '../core/authz';
import { authorizeAnalyticsDomain } from '../core/domainAccess';
import { maybeSweepOnRequest } from '../core/retention';
import { API_KEY_PREFIX, findApiKey } from '../core/apiKeys';
import { clientIp } from '../core/rateLimit';
import { checkSharedWindowLimit } from '../core/sharedLimiter';
import { getAttachedIdentity } from '../../src/lib/serverAuth';

// First-party telemetry script serving, rate-limited event ingestion
// (Plan item 3.2 + 4.1 shared state), and analytical query pipelines.

export const TELEMETRY_INGEST_WINDOW_MS = 60_000;
export const TELEMETRY_INGEST_MAX_ANONYMOUS = 60;
export const TELEMETRY_INGEST_MAX_AUTHENTICATED = 300;
export const TELEMETRY_MAX_BATCH_EVENTS = 50;

function resolveTelemetryCaller(req: Request): { identifier: string; maxRequests: number } {
  const override = Number.parseInt(process.env.TELEMETRY_INGEST_MAX_PER_MIN || '', 10);
  const hasOverride = Number.isInteger(override) && override > 0;

  const rawApiKey = req.headers['x-api-key'];
  if (typeof rawApiKey === 'string' && rawApiKey.startsWith(API_KEY_PREFIX)) {
    const keyRecord = findApiKey(rawApiKey);
    if (keyRecord) {
      return {
        identifier: `key_${keyRecord.id}`,
        maxRequests: hasOverride ? override : TELEMETRY_INGEST_MAX_AUTHENTICATED
      };
    }
  }

  const verified = getAttachedIdentity(req);
  if (verified?.uid) {
    return {
      identifier: `uid_${verified.uid}`,
      maxRequests: hasOverride ? override : TELEMETRY_INGEST_MAX_AUTHENTICATED
    };
  }

  return {
    identifier: `ip_${clientIp(req)}`,
    maxRequests: hasOverride ? override : TELEMETRY_INGEST_MAX_ANONYMOUS
  };
}

/**
 * Plan 3.2: Rate-limit public telemetry ingestion by verified API key, verified
 * user UID, or trusted client IP (`TRUST_PROXY`-aware rightmost XFF). Backed by
 * shared Upstash Redis when configured with bounded LRU fallback in memory.
 */
export async function telemetryIngestLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { identifier, maxRequests } = resolveTelemetryCaller(req);
  try {
    const decision = await checkSharedWindowLimit({
      namespace: 'telemetry-ingest',
      identifier,
      maxRequests,
      windowMs: TELEMETRY_INGEST_WINDOW_MS
    });

    res.setHeader('X-RateLimit-Limit', String(decision.limit));
    res.setHeader('X-RateLimit-Remaining', String(decision.remaining));
    res.setHeader('X-RateLimit-Reset', String(decision.resetEpochSeconds));
    res.setHeader('X-RateLimit-Backend', decision.backend);

    if (!decision.allowed) {
      res.setHeader('Retry-After', String(decision.retryAfterSeconds));
      res.status(429).json({
        success: false,
        rateLimitExceeded: true,
        limit: decision.limit,
        remaining: 0,
        retryAfterSeconds: decision.retryAfterSeconds,
        error: `Telemetry ingestion rate limit exceeded (${decision.limit} req/min). Retry after ${decision.retryAfterSeconds}s.`
      });
      return;
    }

    next();
  } catch (err) {
    logger.error({ err }, '[Telemetry] Shared ingestion limiter unavailable');
    res.status(503).json({ success: false, error: 'Telemetry rate limiter unavailable.' });
  }
}

export function registerTelemetryRoutes(app: express.Express): void {
  const serveTelemetryScript = (_req: Request, res: Response) => {
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

  const handleTelemetryEvent = (req: Request, res: Response): void => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // 1. Bot & Crawler Filtering Check (Block Datacenter/AI Crawlers before DB)
    const userAgent = (req.headers['user-agent'] as string) || '';
    const purposeHeader = (req.headers['purpose'] || req.headers['sec-purpose'] || req.headers['x-purpose'] || '') as string;
    const isPrefetch = purposeHeader.toLowerCase().includes('preview') || req.headers['x-moz'] === 'prefetch';

    const botRegex = /bot|crawler|spider|crawling|chatgpt|claude|perplexity|headless|lighthouse|ahrefs|semrush|petalbot|curl|wget|python|go-http|phantom|selenium|puppeteer|googlebot|bingbot|yandex|baidu|slurp|duckduckbot|facebookexternalhit|whatsapp|telegrambot|twitterbot|slackbot|discordbot/i;

    if (!userAgent || isPrefetch || botRegex.test(userAgent)) {
      res.status(200).json({ status: 'ignored', reason: 'bot_or_prefetch_traffic' });
      return;
    }

    let rawBody = req.body;
    if (typeof rawBody === 'string') {
      try {
        rawBody = JSON.parse(rawBody);
      } catch {
        rawBody = {};
      }
    }

    let eventsList: unknown[] = [];
    if (Array.isArray(rawBody)) {
      eventsList = rawBody;
    } else if (rawBody && typeof rawBody === 'object' && Array.isArray((rawBody as { events?: unknown[] }).events)) {
      eventsList = (rawBody as { events: unknown[] }).events;
    } else if (rawBody && typeof rawBody === 'object' && Object.keys(rawBody as object).length > 0) {
      eventsList = [rawBody];
    }

    if (eventsList.length === 0) {
      res.status(200).json({ status: 'ignored', reason: 'empty_payload' });
      return;
    }

    if (eventsList.length > TELEMETRY_MAX_BATCH_EVENTS) {
      res.status(413).json({
        success: false,
        error: `Telemetry batch size exceeds maximum of ${TELEMETRY_MAX_BATCH_EVENTS} events per request.`
      });
      return;
    }

    // 2. Trusted Geo-IP Resolution via clientIp() (honors TRUST_PROXY rightmost hop)
    const rawIp = clientIp(req);
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
      const validatedEvent = telemetryEventSchema.safeParse(rawItem);
      if (!validatedEvent.success) continue;
      const item = validatedEvent.data;

      const domain = item.domain || (item.url ? (() => { try { return new URL(item.url).hostname; } catch { return 'unknown'; } })() : 'unknown');
      const cleanDomain = domain.replace(/^www\./, '');

      const visitor_id = item.visitor_id || generateVisitorId(rawIp, userAgent, cleanDomain);
      const currentHour = new Date().toISOString().substring(0, 13);
      const session_id = item.session_id || generateVisitorId(rawIp, userAgent + currentHour, cleanDomain);

      let source = 'Direct';
      if (item.referrer) {
        try {
          source = new URL(item.referrer).hostname;
        } catch {
          source = String(item.referrer);
        }
      }

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

    if (processedCount > 0) {
      maybeSweepOnRequest();
    }
    res.status(202).json({ success: true, processed: processedCount });
  };

  const telemetryBodyParsers = express.json({ type: ['application/json', 'text/plain', 'text/json'], limit: '256kb' });

  const handleTelemetryOptions = (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.status(204).end();
  };

  app.options('/api/telemetry/event', handleTelemetryOptions);
  app.options('/api/event', handleTelemetryOptions);
  app.options('/stats/event', handleTelemetryOptions);
  app.options('/api/stats/event', handleTelemetryOptions);

  app.post('/api/telemetry/event', telemetryIngestLimiter, telemetryBodyParsers, handleTelemetryEvent);
  app.post('/api/event', telemetryIngestLimiter, telemetryBodyParsers, handleTelemetryEvent);
  app.post('/stats/event', telemetryIngestLimiter, telemetryBodyParsers, handleTelemetryEvent);
  app.post('/api/stats/event', telemetryIngestLimiter, telemetryBodyParsers, handleTelemetryEvent);

  app.get('/api/analytics/stats', async (req: Request, res: Response): Promise<void> => {
    try {
      const domain = (req.query.domain as string) || 'all';
      const timeframe = ((req.query.timeframe as string) || '7d') as '24h' | '7d' | '30d' | 'all';

      const access = await authorizeAnalyticsDomain(req, domain);
      if (!access.allowed) {
        res.status(access.status ?? 403).json({ success: false, code: access.code, error: access.error });
        return;
      }
      const scopeDomain = access.scope === 'global' ? 'all' : access.domain;

      const stats = await getAnalyticsStats({ domain: scopeDomain, timeframe });
      res.json({
        success: true,
        domain: scopeDomain,
        scope: access.scope,
        stats
      });
    } catch (err: unknown) {
      logger.error({ err }, 'Error in /api/analytics/stats');
      res.status(500).json({ success: false, error: 'Failed to query analytics telemetry.' });
    }
  });

  app.get('/api/analytics/realtime', async (req: Request, res: Response): Promise<void> => {
    try {
      const domain = (req.query.domain as string) || 'all';

      const access = await authorizeAnalyticsDomain(req, domain);
      if (!access.allowed) {
        res.status(access.status ?? 403).json({ success: false, code: access.code, error: access.error });
        return;
      }
      const scopeDomain = access.scope === 'global' ? 'all' : access.domain;

      const stats = await getAnalyticsStats({ domain: scopeDomain, timeframe: '24h' });
      res.json({
        success: true,
        domain: scopeDomain,
        scope: access.scope,
        activeVisitorsNow: stats.activeVisitorsNow,
        todayUniqueVisitors: stats.uniqueVisitors,
        todayPageviews: stats.totalPageviews,
        timestamp: Date.now()
      });
    } catch (err: unknown) {
      logger.error({ err }, 'Error in /api/analytics/realtime');
      res.status(500).json({ success: false, error: 'Failed to query realtime telemetry.' });
    }
  });

  app.post('/api/analytics/anomalies/check', async (req: Request, res: Response): Promise<void> => {
    try {
      const { domain = 'all', notify = false, alertEmail, slackWebhookUrl, discordWebhookUrl } = req.body;

      const access = await authorizeAnalyticsDomain(req, domain);
      if (!access.allowed) {
        res.status(access.status ?? 403).json({ success: false, code: access.code, error: access.error });
        return;
      }
      const result = await detectTrafficAnomalies(access.scope === 'global' ? 'all' : access.domain);

      const notificationsDispatched = { email: false, slack: false, discord: false };
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
          radarUrl: 'https://www.catalystlab.tech/dashboard?tab=analytics'
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
    } catch (err: unknown) {
      logger.error({ err }, 'Error in /api/analytics/anomalies/check');
      res.status(500).json({ success: false, error: 'Failed to evaluate anomalies.' });
    }
  });
}
