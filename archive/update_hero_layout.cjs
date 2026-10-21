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
  'ReportsDirectoryPage.tsx'
];

// We want to add motion import if it doesn't exist.
const motionImport = "import { motion } from 'framer-motion';\n"; // Wait, AGENTS.md says "motion/react", let's check what they use.

// Let's first check what motion import exists
