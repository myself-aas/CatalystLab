import https from 'https';
import http from 'http';
import tls from 'tls';
import { URL } from 'url';

function getSslDetails(hostname: string, port = 443): Promise<{ valid: boolean; daysRemaining?: number; issuer?: string }> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname,
          timeout: 4000
        },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            if (cert && cert.valid_to) {
              const validTo = new Date(cert.valid_to);
              const now = new Date();
              const diffTime = validTo.getTime() - now.getTime();
              const daysRemaining = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
              socket.destroy();
              resolve({
                valid: daysRemaining > 0,
                daysRemaining,
                issuer: typeof cert.issuer === 'object' && cert.issuer !== null
                  ? Array.isArray(cert.issuer.O) ? cert.issuer.O.join(', ') : (cert.issuer.O || cert.issuer.CN ? String(cert.issuer.O || cert.issuer.CN) : undefined)
                  : String(cert.issuer)
              });
              return;
            }
          } catch {
            // fallback
          }
          socket.destroy();
          resolve({ valid: true });
        }
      );

      socket.on('error', () => {
        socket.destroy();
        resolve({ valid: false, daysRemaining: 0 });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ valid: false, daysRemaining: 0 });
      });
    } catch {
      resolve({ valid: false });
    }
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    let { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'URL is required' });
      return;
    }

    let parsedUrl: URL;
    try {
      let clean = url.trim();
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      parsedUrl = new URL(clean);
    } catch {
      res.status(400).json({ success: false, error: 'Invalid URL format' });
      return;
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const requestLib = isHttps ? https : http;
    const startTime = performance.now();

    let sslInfo: { valid: boolean; daysRemaining?: number; issuer?: string } = { valid: false };
    if (isHttps) {
      sslInfo = await getSslDetails(parsedUrl.hostname, parsedUrl.port ? parseInt(parsedUrl.port) : 443);
    }

    const reqPromise = new Promise<{
      statusCode: number;
      responseTimeMs: number;
      status: 'healthy' | 'degraded' | 'down';
      contentType?: string;
      contentLength?: number;
      headers: Record<string, string>;
    }>((resolve, reject) => {
      const clientReq = requestLib.request(
        parsedUrl.toString(),
        {
          method: 'GET',
          headers: {
            'User-Agent': 'CatalystLab-Telemetry-Monitor/2.0 (Uptime-Health-Probe)',
            'Accept': '*/*'
          },
          timeout: 10000
        },
        (clientRes) => {
          const responseTimeMs = Math.round(performance.now() - startTime);
          const statusCode = clientRes.statusCode || 0;
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(clientRes.headers)) {
            if (v) headers[k] = Array.isArray(v) ? v.join(', ') : String(v);
          }

          let healthStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
          if (statusCode >= 500 || statusCode === 0) {
            healthStatus = 'down';
          } else if (statusCode >= 400 || responseTimeMs > 1200) {
            healthStatus = 'degraded';
          }

          clientRes.resume();
          resolve({
            statusCode,
            responseTimeMs,
            status: healthStatus,
            contentType: headers['content-type'],
            contentLength: headers['content-length'] ? parseInt(headers['content-length']) : undefined,
            headers
          });
        }
      );

      clientReq.on('timeout', () => {
        clientReq.destroy();
        reject(new Error('Connection timed out (>10,000ms)'));
      });

      clientReq.on('error', (err) => {
        reject(err);
      });

      clientReq.end();
    });

    try {
      const probeData = await reqPromise;
      res.status(200).json({
        success: true,
        url: parsedUrl.toString(),
        ...probeData,
        sslValid: sslInfo.valid,
        sslDaysRemaining: sslInfo.daysRemaining,
        sslIssuer: sslInfo.issuer,
        timestamp: Date.now()
      });
    } catch (err: any) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      res.status(200).json({
        success: false,
        url: parsedUrl.toString(),
        statusCode: 0,
        responseTimeMs,
        status: 'down',
        error: err.message || 'Connection failed',
        timestamp: Date.now()
      });
    }
  } catch (outerErr: any) {
    res.status(500).json({ success: false, error: outerErr.message });
  }
}
