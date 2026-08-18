import type { Request, Response } from 'express';
import { runNativeEngine } from '../src/lib/nodeEngines';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const ENGINE_SCRIPT_MAP: Record<string, string> = {
  health: 'website_health.py',
  latency: 'edge_latency.py',
  ai_ready: 'ai_readiness.py',
  repo: 'repo_scanner.py',
  eco: 'eco_carbon_audit.py',
  compliance: 'compliance_risk_audit.py',
  migration: 'platform_migration_audit.py',
  llmo: 'llmo_optimizer.py'
};

export default async function handler(req: any, res: any) {
  // Enable CORS for Vercel
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
    const { url, engine } = req.body || {};

    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'Target URL is required.' });
      return;
    }

    if (!engine || !ENGINE_SCRIPT_MAP[engine]) {
      res.status(400).json({
        success: false,
        error: `Invalid engine '${engine}'. Valid engines: ${Object.keys(ENGINE_SCRIPT_MAP).join(', ')}`
      });
      return;
    }

    // Attempt Python script first if python3 is available in runtime
    let output: string | null = null;
    const scriptName = ENGINE_SCRIPT_MAP[engine];
    const scriptPath = path.join(process.cwd(), 'python-engines', scriptName);

    try {
      const safeUrl = url.trim().replace(/(["\\$`])/g, '\\$1');
      const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${safeUrl}"`, {
        timeout: 15000,
        maxBuffer: 1024 * 1024 * 5
      });
      output = stdout || stderr;
    } catch {
      // If Python execution fails or is not present in Vercel Serverless environment, use Native TypeScript Engine
      output = null;
    }

    // Fallback to high-speed Native TypeScript Engine
    if (!output || output.trim() === '') {
      output = await runNativeEngine(url, engine);
    }

    res.status(200).json({
      success: true,
      engine,
      url,
      output: output || 'Telemetry audit completed.'
    });
  } catch (err: any) {
    console.error('API execution error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Execution error during telemetry scan.'
    });
  }
}
