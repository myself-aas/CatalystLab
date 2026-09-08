const fs = require('fs');
const path = require('path');

const targetPages = [
  'AboutPage.tsx',
  'PricingPage.tsx',
  'ProductsPage.tsx',
  'ToolPage.tsx',
  'DiagnosticHubPage.tsx',
  'BlogsPage.tsx',
  'SecurityPage.tsx',
  'ComparePage.tsx',
  'MasterAuditExecutionPage.tsx',
  'ReportsDirectoryPage.tsx',
  'NotFoundPage.tsx'
];

targetPages.forEach(file => {
  const p = path.join('src/pages', file);
  if (!fs.existsSync(p)) return;
  
  let content = fs.readFileSync(p, 'utf-8');
  let original = content;

  // 1. Change ds-page-top to ds-page-top-hero on the outermost wrapper if it exists.
  // We'll replace the first occurrence of ds-page-top if the page has a framer-hero-title
  if (content.includes('framer-hero-title')) {
    // only replace the first occurrence of ds-page-top which is usually the wrapper
    // Actually, sometimes it might be ds-page-top-hero already.
    content = content.replace(/ds-page-top(?!-hero)/, 'ds-page-top-hero');
  }

  // 2. We need to inject the grid scrim and radial glow if they don't exist.
  // Instead of complex AST, let's just make sure the hero sections have motion.div.
  // We will do a generic replacement if possible, or just focus on motion and standard tags.

  if (original !== content) {
    fs.writeFileSync(p, content, 'utf-8');
    console.log(`Updated ds-page-top-hero in ${file}`);
  }
});
