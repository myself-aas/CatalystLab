export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'ok', runtime: 'Vercel Serverless', timestamp: Date.now() });
}
