import os from 'os';

const serverStartTime = Date.now();

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const memory = process.memoryUsage();
  res.status(200).json({
    status: 'operational',
    runtime: 'Vercel Serverless / Node.js Engine',
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    memoryUsageMb: {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsed: Math.round(memory.heapUsed / (1024 * 1024))
    },
    activeEnginesCount: 8,
    totalAuditsLogged: 0,
    nodeVersion: process.version,
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    timestamp: Date.now()
  });
}
