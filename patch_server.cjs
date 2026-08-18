const fs = require('fs');

let serverContent = fs.readFileSync('server.js', 'utf8');

const pythonRoute = `
// ==========================================
// PYTHON ENGINE API ROUTES
// ==========================================
const { exec } = require('child_process');

app.post('/api/run-engine', (req, res) => {
  const { url, engine } = req.body;
  
  if (!url || !engine) {
    return res.status(400).json({ error: 'URL and Engine type are required' });
  }

  // Map engine names to python scripts
  const engineMap = {
    'llmo': 'llmo_optimizer.py',
    'compliance': 'compliance_risk_audit.py',
    'migration': 'platform_migration_audit.py',
    'eco': 'eco_carbon_audit.py',
    'repo': 'repo_scanner.py',
    'ai_ready': 'ai_readiness.py'
  };

  const script = engineMap[engine];
  if (!script) {
    return res.status(400).json({ error: 'Invalid engine requested' });
  }

  // Execute the python script in a child process
  console.log(\`Running \${script} against \${url}\`);
  exec(\`python3 python-engines/\${script} \${url}\`, (error, stdout, stderr) => {
    if (error) {
      console.error(\`Python Execution Error: \${error.message}\`);
      return res.status(500).json({ error: 'Failed to run analysis', details: stderr });
    }
    
    // Send the raw stdout back to the frontend to be formatted
    res.json({ success: true, output: stdout });
  });
});

`;

// Inject right before app.listen
if (!serverContent.includes('/api/run-engine')) {
  serverContent = serverContent.replace('app.listen(PORT', pythonRoute + 'app.listen(PORT');
  fs.writeFileSync('server.js', serverContent);
  console.log("Injected Python API route into server.js");
}
