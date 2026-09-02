import type { Request, Response } from 'express';
import { runNativeEngine } from '../src/lib/nodeEngines';
import { validatePublicUrl } from '../src/lib/networkSecurity';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

import { ENGINE_SCRIPT_MAP } from '../server/core/enginesCatalog';

export default async function handler(req: any, res: any) {
  // CORS: this endpoint is a public POST API. Credentials are intentionally
  // NOT allowed (invalid with a wildcard origin per the fetch spec), and the
  // method list is limited to what the endpoint actually serves.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key, Authorization');

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

    // SSRF Security Validation
    const urlValidation = await validatePublicUrl(url, engine === 'repo');
    if (!urlValidation.valid) {
      res.status(400).json({ success: false, error: urlValidation.error || 'Invalid or prohibited target URL.' });
      return;
    }

    const validatedUrl = urlValidation.normalizedUrl || url;

    // Attempt Python script first if python3 is available in runtime
    let output: string | null = null;
    const scriptName = ENGINE_SCRIPT_MAP[engine];
    const scriptPath = path.join(process.cwd(), 'python-engines', scriptName);

    try {
      // Safe execution using execFile with arguments array (prevents shell injection)
      const { stdout, stderr } = await execFileAsync('python3', [scriptPath, validatedUrl], {
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
      output = await runNativeEngine(validatedUrl, engine);
    }

    res.status(200).json({
      success: true,
      engine,
      url: validatedUrl,
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
