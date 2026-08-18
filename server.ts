import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import 'dotenv/config';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function startServer() {
  const app = express();
  const PORT = 3000;
  const HOST = '0.0.0.0';

  app.use(express.json({ limit: '10mb' }));

  // Python Engine Execution Endpoint
  app.post('/api/run-engine', async (req: Request, res: Response): Promise<void> => {
    try {
      const { url, engine } = req.body;

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

      const scriptName = ENGINE_SCRIPT_MAP[engine];
      const scriptPath = path.join(__dirname, 'python-engines', scriptName);

      // Validate URL / repo safety
      const safeUrl = url.trim().replace(/(["\\$`])/g, '\\$1');

      // Execute Python script
      const command = `python3 "${scriptPath}" "${safeUrl}"`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: 40000,
        maxBuffer: 1024 * 1024 * 5
      });

      res.json({
        success: true,
        engine,
        url,
        output: stdout || stderr || 'Engine completed with no output.'
      });
    } catch (err: any) {
      console.error(`Error executing engine:`, err);
      res.status(500).json({
        success: false,
        error: err.stderr || err.message || 'Execution error during telemetry scan.'
      });
    }
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`⚡ CatalystLab Server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
